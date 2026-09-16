"""
Unit and Integration Test Suite for RecomputeCheck Core Engine.
Executed via Python standard library unittest.
"""

import unittest
from ml.verifier import (
    TableContainer, NumericClaim, verify_single_claim,
    audit_report, validate_ast_safety, calculate_discrepancy
)
from ml.extractor import extract_claims_from_report, parse_numeric_literal, detect_metric_type
from evaluation.metrics import compute_verification_metrics, compute_fidelity_score

SAMPLE_CSV = """customer_id,gender,monthly_charges,total_charges,churn
C001,Female,70.50,1410.00,Yes
C002,Male,89.20,2676.00,No
C003,Female,25.00,500.00,No
C004,Female,110.30,3309.00,Yes
C005,Male,45.00,900.00,No
"""

class TestRecomputeCheckEngine(unittest.TestCase):

    def setUp(self):
        self.table = TableContainer.from_csv_string(SAMPLE_CSV)

    def test_table_container_math(self):
        # 5 total rows
        self.assertEqual(self.table.count(), 5)
        # Check mean of monthly charges: (70.50 + 89.20 + 25.00 + 110.30 + 45.00) / 5 = 340.0 / 5 = 68.0
        mean_val = self.table.mean("monthly_charges")
        self.assertAlmostEqual(mean_val, 68.0, places=2)
        # Check sum of monthly charges
        sum_val = self.table.sum("monthly_charges")
        self.assertAlmostEqual(sum_val, 340.0, places=2)
        # Filter churn=Yes: rows C001 (70.50) and C004 (110.30) -> mean = 90.40
        churn_sub = self.table.filter("churn", "Yes")
        self.assertEqual(churn_sub.count(), 2)
        self.assertAlmostEqual(churn_sub.mean("monthly_charges"), 90.40, places=2)

    def test_ast_safety_validator(self):
        # Safe mathematical expressions
        safe_expr = "df['monthly_charges'].mean() * 1.05"
        safe, msg = validate_ast_safety(safe_expr)
        self.assertTrue(safe, f"Safe expression marked unsafe: {msg}")

        # Malicious / disallowed calls
        unsafe_expr1 = "__import__('os').system('rm -rf /')"
        safe1, _ = validate_ast_safety(unsafe_expr1)
        self.assertFalse(safe1, "Failed to block __import__")

        unsafe_expr2 = "eval('2 + 2')"
        safe2, _ = validate_ast_safety(unsafe_expr2)
        self.assertFalse(safe2, "Failed to block eval")

    def test_numeric_discrepancy_calculation(self):
        abs_d, rel_d = calculate_discrepancy(100.0, 102.0)
        self.assertAlmostEqual(abs_d, 2.0)
        self.assertAlmostEqual(rel_d, 2.0 / 102.0, places=4)

    def test_claim_verification_accurate(self):
        # Claim: "The average monthly charges across all users is 68.00"
        claim = NumericClaim(
            claim_id="CLM-001",
            sentence="The average monthly charges is 68.00 dollars.",
            claimed_value=68.0,
            unit="$",
            metric_type="mean",
            target_column="monthly_charges"
        )
        verified_claim = verify_single_claim(claim, self.table, rel_tolerance=0.02)
        self.assertEqual(verified_claim.verdict, "VERIFIED")
        self.assertAlmostEqual(verified_claim.recomputed_value, 68.0, places=2)
        self.assertAlmostEqual(verified_claim.relative_discrepancy, 0.0, places=3)

    def test_claim_verification_hallucination_detected(self):
        # Claim: LLM falsely hallucinates that churned users pay average of 145.00 (actually 90.40)
        claim = NumericClaim(
            claim_id="CLM-002",
            sentence="Churned customers paid an average of 145.00 dollars monthly.",
            claimed_value=145.0,
            unit="$",
            metric_type="mean",
            target_column="monthly_charges",
            filter_column="churn",
            filter_value="Yes"
        )
        verified_claim = verify_single_claim(claim, self.table, rel_tolerance=0.02)
        self.assertEqual(verified_claim.verdict, "CONTRADICTED")
        self.assertAlmostEqual(verified_claim.recomputed_value, 90.40, places=2)
        self.assertGreater(verified_claim.relative_discrepancy, 0.50)

    def test_percentage_verification(self):
        # 2 out of 5 churned = 40%
        claim = NumericClaim(
            claim_id="CLM-003",
            sentence="The churn rate is 40.0%.",
            claimed_value=40.0,
            unit="%",
            metric_type="percentage",
            target_column=None,
            filter_column="churn",
            filter_value="Yes"
        )
        verified_claim = verify_single_claim(claim, self.table, rel_tolerance=0.02)
        self.assertEqual(verified_claim.verdict, "VERIFIED")
        self.assertAlmostEqual(verified_claim.recomputed_value, 40.0, places=2)

    def test_full_report_audit_and_fidelity_score(self):
        claims = [
            NumericClaim(
                claim_id="C1",
                sentence="Average monthly charges was 68.00.",
                claimed_value=68.0,
                unit="$",
                metric_type="mean",
                target_column="monthly_charges"
            ),
            NumericClaim(
                claim_id="C2",
                sentence="Churn rate reached 85.0%.",  # False (actual is 40%)
                claimed_value=85.0,
                unit="%",
                metric_type="percentage",
                target_column=None,
                filter_column="churn",
                filter_value="Yes"
            )
        ]
        result = audit_report(claims, SAMPLE_CSV)
        summary = result["summary"]
        self.assertEqual(summary["total_claims"], 2)
        self.assertEqual(summary["verified"], 1)
        self.assertEqual(summary["contradicted"], 1)
        # RFS = 1 / 2 * 100 = 50.0%
        self.assertEqual(summary["recomputation_fidelity_score"], 50.0)

    def test_evaluation_metrics_confusion_matrix(self):
        preds = ["VERIFIED", "CONTRADICTED", "CONTRADICTED", "VERIFIED", "NOT_COMPUTABLE"]
        gt =    ["VERIFIED", "CONTRADICTED", "VERIFIED",     "CONTRADICTED", "CONTRADICTED"]

        res = compute_verification_metrics(preds, gt)
        metrics = res["metrics"]
        cm = res["confusion_matrix"]

        self.assertEqual(cm["true_positive_contradicted"], 1)
        self.assertEqual(cm["false_positive_hallucination_flag"], 1)
        self.assertEqual(cm["true_negative_verified"], 1)
        self.assertEqual(cm["false_negative_missed_hallucination"], 1)
        self.assertEqual(cm["not_computable_unmapped"], 1)
        self.assertEqual(metrics["accuracy"], 0.5)


if __name__ == "__main__":
    unittest.main()
