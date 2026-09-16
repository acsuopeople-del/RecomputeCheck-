"""
RecomputeCheck - Evaluation Metrics & Statistical Computation
Computes formal benchmark metrics: Precision, Recall, F1, RFS, and confusion matrices.
"""

from typing import Any, Dict, List


def compute_verification_metrics(
    predictions: List[str],  # Predicted verdicts: 'VERIFIED', 'CONTRADICTED', 'NOT_COMPUTABLE'
    ground_truth: List[str]  # Ground truth: 'VERIFIED', 'CONTRADICTED'
) -> Dict[str, Any]:
    """
    Computes confusion matrix and classification metrics for hallucination detection.
    A positive case = Hallucination / CONTRADICTED.
    A negative case = Factual / VERIFIED.
    """
    tp = 0  # Ground truth CONTRADICTED, Predicted CONTRADICTED
    fp = 0  # Ground truth VERIFIED, Predicted CONTRADICTED
    tn = 0  # Ground truth VERIFIED, Predicted VERIFIED
    fn = 0  # Ground truth CONTRADICTED, Predicted VERIFIED
    unmapped = 0  # Predicted NOT_COMPUTABLE

    for pred, gt in zip(predictions, ground_truth):
        p = pred.upper()
        g = gt.upper()

        if p == "NOT_COMPUTABLE":
            unmapped += 1
            continue

        if g == "CONTRADICTED":
            if p == "CONTRADICTED":
                tp += 1
            elif p == "VERIFIED":
                fn += 1
        elif g == "VERIFIED":
            if p == "VERIFIED":
                tn += 1
            elif p == "CONTRADICTED":
                fp += 1

    total_evaluated = tp + fp + tn + fn
    accuracy = (tp + tn) / total_evaluated if total_evaluated > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "confusion_matrix": {
            "true_positive_contradicted": tp,
            "false_positive_hallucination_flag": fp,
            "true_negative_verified": tn,
            "false_negative_missed_hallucination": fn,
            "not_computable_unmapped": unmapped,
            "total_samples": len(ground_truth),
            "evaluated_samples": total_evaluated
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "coverage_pct": round((total_evaluated / len(ground_truth)) * 100.0, 2) if ground_truth else 0.0
        }
    }


def compute_fidelity_score(claims: List[Dict[str, Any]]) -> Dict[str, float]:
    """Computes RFS and coverage for a set of claim dictionaries."""
    total = len(claims)
    if total == 0:
        return {"rfs_eval": 0.0, "rfs_overall": 0.0, "coverage": 0.0}

    verified = sum(1 for c in claims if c.get("verdict") == "VERIFIED")
    contradicted = sum(1 for c in claims if c.get("verdict") == "CONTRADICTED")
    computable = verified + contradicted

    rfs_eval = (verified / computable) * 100.0 if computable > 0 else 0.0
    rfs_overall = (verified / total) * 100.0
    coverage = (computable / total) * 100.0

    return {
        "rfs_eval": round(rfs_eval, 2),
        "rfs_overall": round(rfs_overall, 2),
        "coverage": round(coverage, 2)
    }
