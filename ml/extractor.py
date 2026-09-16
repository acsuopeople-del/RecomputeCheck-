"""
RecomputeCheck - Claim Extraction & Grounding Module
Extracts factual numeric assertions from natural language LLM reports
and associates them with candidate columns and filters from tabular schemas.
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from ml.verifier import NumericClaim


NUMERIC_PATTERN = re.compile(
    r'(?P<prefix>[$€£])?\s*(?P<number>[+-]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|\.\d+)\s*(?P<suffix>%|percent|k|million|billion|dollars|pts)?',
    re.IGNORECASE
)

METRIC_KEYWORDS = {
    "mean": ["average", "mean", "avg", "typically"],
    "percentage": ["percentage", "percent", "%", "portion", "share", "rate", "proportion"],
    "sum": ["total", "sum", "combined", "aggregate", "overall"],
    "count": ["count", "number of", "total of", "frequency", "records", "customers", "patients", "cases"],
    "median": ["median", "50th percentile"],
    "min": ["minimum", "lowest", "least", "bottom", "min"],
    "max": ["maximum", "highest", "peak", "top", "max"],
}


def segment_sentences(text: str) -> List[str]:
    """Splits report text into distinct sentences."""
    cleaned = text.replace('\n', ' ')
    raw = re.split(r'(?<=[.!?])\s+', cleaned)
    return [s.strip() for s in raw if len(s.strip()) > 5]


def parse_numeric_literal(num_str: str, prefix: Optional[str], suffix: Optional[str]) -> Tuple[float, str]:
    """Parses formatted number string into float and unit."""
    cleaned = num_str.replace(',', '')
    val = float(cleaned)
    unit = ""

    if prefix:
        unit = prefix.strip()
    if suffix:
        suffix_clean = suffix.strip().lower()
        if suffix_clean in ["%", "percent"]:
            unit = "%"
        elif suffix_clean == "k":
            val *= 1000
            unit = "k"
        elif suffix_clean == "million":
            val *= 1000000
            unit = "M"
        elif suffix_clean == "billion":
            val *= 1000000000
            unit = "B"
        else:
            unit = suffix.strip()

    return val, unit


def detect_metric_type(sentence: str, unit: str) -> str:
    """Classifies sentence metric intent."""
    if unit == "%":
        return "percentage"

    low = sentence.lower()
    for mtype, keywords in METRIC_KEYWORDS.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', low):
                return mtype

    return "value"


def match_schema_columns(
    sentence: str,
    columns: List[str]
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Finds the most probable target numeric column and filter column/value.
    """
    low = sentence.lower()
    target_col = None
    filter_col = None
    filter_val = None

    # Try to match column names directly or with underscores replaced
    best_match_score = 0
    for col in columns:
        col_clean = col.lower().replace('_', ' ')
        if col.lower() in low or col_clean in low:
            score = len(col)
            if score > best_match_score:
                best_match_score = score
                target_col = col

    # Check for binary or categorical filter mentions
    filter_indicators = [
        ("churn", ["yes", "no", "churned", "retained", "true", "false"]),
        ("gender", ["male", "female"]),
        ("smoker", ["yes", "no"]),
        ("region", ["northeast", "northwest", "southeast", "southwest"]),
        ("status", ["active", "inactive", "pending", "closed"]),
        ("contract", ["month-to-month", "one year", "two year"]),
    ]

    for col_hint, vals in filter_indicators:
        matching_cols = [c for c in columns if col_hint in c.lower()]
        if matching_cols:
            actual_col = matching_cols[0]
            for v in vals:
                if re.search(r'\b' + re.escape(v) + r'\b', low):
                    filter_col = actual_col
                    filter_val = v.capitalize() if actual_col != "churn" else ("Yes" if v in ["yes", "churned", "true"] else "No")
                    break
        if filter_col:
            break

    return target_col, filter_col, filter_val


def extract_claims_from_report(
    report_text: str,
    columns: List[str]
) -> List[NumericClaim]:
    """
    Parses full report text, extracts each numeric sentence,
    and returns initialized NumericClaim records.
    """
    sentences = segment_sentences(report_text)
    claims: List[NumericClaim] = []
    claim_idx = 1

    for sent in sentences:
        matches = list(NUMERIC_PATTERN.finditer(sent))
        if not matches:
            continue

        for m in matches:
            num_str = m.group("number")
            prefix = m.group("prefix")
            suffix = m.group("suffix")

            try:
                val, unit = parse_numeric_literal(num_str, prefix, suffix)
            except ValueError:
                continue

            metric = detect_metric_type(sent, unit)
            target_col, filter_col, filter_val = match_schema_columns(sent, columns)

            # Assign default target if count
            if metric == "count" and not target_col:
                target_col = columns[0] if columns else None

            cid = f"CLM-{claim_idx:03d}"
            claim_idx += 1

            claims.append(
                NumericClaim(
                    claim_id=cid,
                    sentence=sent,
                    claimed_value=val,
                    unit=unit,
                    metric_type=metric,
                    target_column=target_col,
                    filter_column=filter_col,
                    filter_value=filter_val
                )
            )

    return claims
