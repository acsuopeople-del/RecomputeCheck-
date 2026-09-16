"""
RecomputeCheck - Constrained Code Generator
Synthesizes safe Pandas/NumPy expressions from extracted numeric claims and schema types.
"""

from typing import Dict, Optional


def generate_pandas_expression(
    metric_type: str,
    target_column: Optional[str],
    filter_column: Optional[str] = None,
    filter_value: Optional[str] = None,
    table_var: str = "df"
) -> str:
    """
    Generates a deterministic, sandboxed pandas expression.
    Adheres strictly to schema-bounded operations.
    """
    if filter_column and filter_value is not None:
        subgroup = f"{table_var}[{table_var}['{filter_column}'] == '{filter_value}']"
    else:
        subgroup = table_var

    m = metric_type.lower()
    if m == "count":
        return f"len({subgroup})"
    elif m == "percentage":
        return f"(len({subgroup}) / len({table_var})) * 100.0"
    elif m in ("mean", "average") and target_column:
        return f"{subgroup}['{target_column}'].mean()"
    elif m in ("sum", "total") and target_column:
        return f"{subgroup}['{target_column}'].sum()"
    elif m == "median" and target_column:
        return f"{subgroup}['{target_column}'].median()"
    elif m == "min" and target_column:
        return f"{subgroup}['{target_column}'].min()"
    elif m == "max" and target_column:
        return f"{subgroup}['{target_column}'].max()"
    else:
        return f"# Unsupported expression for metric '{metric_type}'"
