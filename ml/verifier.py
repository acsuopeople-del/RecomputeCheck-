"""
RecomputeCheck - Deterministic Tabular Recomputation Engine
Evaluates extracted claims against raw tabular data with AST safety validation.
"""

import ast
import csv
import io
import math
import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple, Union

ALLOWED_AST_NODES = {
    ast.Expression, ast.Call, ast.Name, ast.Load, ast.Attribute,
    ast.Constant, ast.BinOp, ast.UnaryOp, ast.Compare,
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow,
    ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE,
    ast.Subscript, ast.Slice, ast.Index, ast.List, ast.Tuple, ast.Dict,
    ast.BoolOp, ast.And, ast.Or, ast.Not
}

DISALLOWED_BUILTINS = {
    "__import__", "eval", "exec", "open", "compile", "globals", "locals",
    "vars", "input", "breakpoint", "help", "exit", "quit", "getattr", "setattr"
}


@dataclass
class NumericClaim:
    claim_id: str
    sentence: str
    claimed_value: float
    unit: str
    metric_type: str  # mean, sum, count, percentage, median, min, max, ratio
    target_column: Optional[str]
    filter_column: Optional[str] = None
    filter_value: Optional[str] = None
    generated_code: Optional[str] = None
    recomputed_value: Optional[float] = None
    relative_discrepancy: Optional[float] = None
    absolute_discrepancy: Optional[float] = None
    verdict: str = "UNCHECKED"  # VERIFIED, CONTRADICTED, NOT_COMPUTABLE
    explanation: str = ""


class TableContainer:
    """
    Lightweight, deterministic dataframe container with column typed operations.
    Works independently of pandas while maintaining pandas-like API.
    """
    def __init__(self, rows: List[Dict[str, Any]], columns: List[str]):
        self.columns = columns
        self.rows = rows
        self._cache_typed()

    def _cache_typed(self):
        self.col_types = {}
        for col in self.columns:
            vals = [r[col] for r in self.rows if r[col] is not None and r[col] != ""]
            if not vals:
                self.col_types[col] = "string"
                continue
            is_num = True
            for v in vals[:100]:
                try:
                    float(str(v).replace("$", "").replace("%", "").replace(",", ""))
                except ValueError:
                    is_num = False
                    break
            self.col_types[col] = "numeric" if is_num else "string"

    @classmethod
    def from_csv_string(cls, csv_text: str) -> "TableContainer":
        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        rows = list(reader)
        columns = reader.fieldnames or []
        return cls(rows, list(columns))

    def filter(self, col: str, val: Any) -> "TableContainer":
        val_str = str(val).strip().lower()
        sub = [
            r for r in self.rows
            if str(r.get(col, "")).strip().lower() == val_str
        ]
        return TableContainer(sub, self.columns)

    def numeric_series(self, col: str) -> List[float]:
        out = []
        for r in self.rows:
            v = r.get(col)
            if v is not None and v != "":
                clean = str(v).replace("$", "").replace("%", "").replace(",", "").strip()
                try:
                    out.append(float(clean))
                except ValueError:
                    pass
        return out

    def mean(self, col: str) -> Optional[float]:
        nums = self.numeric_series(col)
        return sum(nums) / len(nums) if nums else None

    def sum(self, col: str) -> Optional[float]:
        nums = self.numeric_series(col)
        return sum(nums) if nums else None

    def count(self, col: Optional[str] = None) -> int:
        if col is None:
            return len(self.rows)
        return len([r for r in self.rows if r.get(col) not in (None, "")])

    def min(self, col: str) -> Optional[float]:
        nums = self.numeric_series(col)
        return min(nums) if nums else None

    def max(self, col: str) -> Optional[float]:
        nums = self.numeric_series(col)
        return max(nums) if nums else None

    def median(self, col: str) -> Optional[float]:
        nums = sorted(self.numeric_series(col))
        if not nums:
            return None
        n = len(nums)
        mid = n // 2
        return (nums[mid] if n % 2 != 0 else (nums[mid - 1] + nums[mid]) / 2.0)


def validate_ast_safety(expr: str) -> Tuple[bool, str]:
    """Inspects Python expression AST to guarantee no unauthorized system calls."""
    try:
        tree = ast.parse(expr, mode='eval')
    except SyntaxError as e:
        return False, f"Syntax Error: {e}"

    for node in ast.walk(tree):
        if type(node) not in ALLOWED_AST_NODES:
            return False, f"Disallowed AST Node: {type(node).__name__}"
        if isinstance(node, ast.Name) and node.id in DISALLOWED_BUILTINS:
            return False, f"Disallowed Identifier: {node.id}"
    return True, "AST Safe"


def calculate_discrepancy(claimed: float, recomputed: float) -> Tuple[float, float]:
    """Calculates absolute and relative discrepancy."""
    abs_delta = abs(claimed - recomputed)
    if abs(recomputed) < 1e-7:
        rel_delta = abs_delta
    else:
        rel_delta = abs_delta / abs(recomputed)
    return abs_delta, rel_delta


def verify_single_claim(
    claim: NumericClaim,
    table: TableContainer,
    rel_tolerance: float = 0.02,
    abs_tolerance: float = 0.5
) -> NumericClaim:
    """Verifies an individual numeric claim against the table."""
    # If no target column or unsupported
    if not claim.target_column and claim.metric_type not in ("count", "percentage"):
        claim.verdict = "NOT_COMPUTABLE"
        claim.explanation = "Target column not identifiable in dataset schema."
        return claim

    # Apply filter if present
    target_table = table
    if claim.filter_column and claim.filter_value is not None:
        target_table = table.filter(claim.filter_column, claim.filter_value)
        filter_repr = f"df[df['{claim.filter_column}'] == '{claim.filter_value}']"
    else:
        filter_repr = "df"

    recomputed: Optional[float] = None
    code_repr = ""

    metric = claim.metric_type.lower()
    col = claim.target_column

    try:
        if metric == "count":
            if claim.filter_column:
                recomputed = float(len(target_table.rows))
                code_repr = f"len({filter_repr})"
            else:
                recomputed = float(len(table.rows))
                code_repr = "len(df)"

        elif metric == "percentage":
            if claim.filter_column and len(table.rows) > 0:
                sub_count = len(target_table.rows)
                total_count = len(table.rows)
                recomputed = (sub_count / total_count) * 100.0
                code_repr = f"(len({filter_repr}) / len(df)) * 100"
            else:
                claim.verdict = "NOT_COMPUTABLE"
                claim.explanation = "Percentage calculation requires subgroup filter or denominator."
                return claim

        elif metric == "mean" or metric == "average":
            if col:
                recomputed = target_table.mean(col)
                code_repr = f"{filter_repr}['{col}'].mean()"

        elif metric == "sum" or metric == "total":
            if col:
                recomputed = target_table.sum(col)
                code_repr = f"{filter_repr}['{col}'].sum()"

        elif metric == "min":
            if col:
                recomputed = target_table.min(col)
                code_repr = f"{filter_repr}['{col}'].min()"

        elif metric == "max":
            if col:
                recomputed = target_table.max(col)
                code_repr = f"{filter_repr}['{col}'].max()"

        elif metric == "median":
            if col:
                recomputed = target_table.median(col)
                code_repr = f"{filter_repr}['{col}'].median()"

        else:
            claim.verdict = "NOT_COMPUTABLE"
            claim.explanation = f"Metric '{metric}' is currently not in verified computable subset."
            return claim

    except Exception as e:
        claim.verdict = "NOT_COMPUTABLE"
        claim.explanation = f"Execution error: {str(e)}"
        return claim

    if recomputed is None or math.isnan(recomputed):
        claim.verdict = "NOT_COMPUTABLE"
        claim.explanation = "Recomputation produced null/empty set."
        return claim

    claim.generated_code = code_repr
    claim.recomputed_value = round(recomputed, 4)

    abs_delta, rel_delta = calculate_discrepancy(claim.claimed_value, recomputed)
    claim.absolute_discrepancy = round(abs_delta, 4)
    claim.relative_discrepancy = round(rel_delta, 4)

    # Verification criteria: within relative tolerance OR within absolute tolerance
    is_verified = (rel_delta <= rel_tolerance) or (abs_delta <= abs_tolerance)

    if is_verified:
        claim.verdict = "VERIFIED"
        claim.explanation = (
            f"Matches recomputed value ({claim.recomputed_value:.2f}) within tolerance "
            f"(\u0394 = {rel_delta*100:.2f}%)."
        )
    else:
        claim.verdict = "CONTRADICTED"
        claim.explanation = (
            f"Hallucination detected. LLM claimed {claim.claimed_value}, but deterministic "
            f"recomputation yielded {claim.recomputed_value:.2f} (Discrepancy: {rel_delta*100:.1f}%)."
        )

    return claim


def audit_report(
    claims: List[NumericClaim],
    csv_text: str,
    rel_tolerance: float = 0.02,
    abs_tolerance: float = 0.5
) -> Dict[str, Any]:
    """Audits a collection of claims against tabular data, yielding fidelity score."""
    table = TableContainer.from_csv_string(csv_text)
    evaluated_claims = []

    verified_count = 0
    contradicted_count = 0
    not_computable_count = 0

    for c in claims:
        res = verify_single_claim(c, table, rel_tolerance, abs_tolerance)
        evaluated_claims.append(asdict(res))
        if res.verdict == "VERIFIED":
            verified_count += 1
        elif res.verdict == "CONTRADICTED":
            contradicted_count += 1
        else:
            not_computable_count += 1

    total = len(claims)
    computable = verified_count + contradicted_count

    rfs_eval = (verified_count / computable) * 100.0 if computable > 0 else 0.0
    rfs_overall = (verified_count / total) * 100.0 if total > 0 else 0.0
    coverage = (computable / total) * 100.0 if total > 0 else 0.0

    return {
        "summary": {
            "total_claims": total,
            "verified": verified_count,
            "contradicted": contradicted_count,
            "not_computable": not_computable_count,
            "recomputation_fidelity_score": round(rfs_eval, 2),
            "overall_fidelity_score": round(rfs_overall, 2),
            "computable_coverage_pct": round(coverage, 2),
            "tolerance_used": {
                "relative_tolerance": rel_tolerance,
                "absolute_tolerance": abs_tolerance
            }
        },
        "claims": evaluated_claims
    }
