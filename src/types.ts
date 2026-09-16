export type VerdictType = "VERIFIED" | "CONTRADICTED" | "NOT_COMPUTABLE";

export interface NumericClaim {
  claim_id: string;
  sentence: string;
  claimed_value: number;
  unit: string;
  metric_type: string;
  target_column: string | null;
  filter_column?: string | null;
  filter_value?: string | null;
  generated_code?: string;
  recomputed_value?: number | null;
  relative_discrepancy?: number | null;
  absolute_discrepancy?: number | null;
  verdict: VerdictType;
  explanation: string;
}

export interface AuditSummary {
  total_claims: number;
  verified: number;
  contradicted: number;
  not_computable: number;
  recomputation_fidelity_score: number;
  overall_fidelity_score: number;
  computable_coverage_pct: number;
  tolerance_used: {
    relative_tolerance: number;
    absolute_tolerance: number;
  };
}

export interface AuditResponse {
  summary: AuditSummary;
  claims: NumericClaim[];
  schema: {
    columns: string[];
    row_count: number;
  };
}

export interface ConfusionMatrix {
  true_positive_contradicted: number;
  false_positive_hallucination_flag: number;
  true_negative_verified: number;
  false_negative_missed_hallucination: number;
  not_computable_unmapped: number;
  total_samples: number;
  evaluated_samples: number;
}

export interface MetricScores {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  coverage_pct: number;
}

export interface SystemResult {
  confusion_matrix: ConfusionMatrix;
  metrics: MetricScores;
}

export interface BenchmarkResultsPayload {
  benchmark_summary: {
    total_benchmark_cases: number;
    factual_verified_cases: number;
    hallucinated_contradicted_cases: number;
  };
  systems: {
    raw_llm_no_verification: SystemResult;
    selfcheck_resampling_baseline: SystemResult;
    semantic_retrieval_baseline: SystemResult;
    recompute_check_proposed: SystemResult;
  };
  ablations: {
    recompute_check_without_filter_parsing: SystemResult;
  };
}

export interface BenchmarkPreset {
  id: string;
  name: string;
  description: string;
  domain: string;
  csv: string;
  sampleReportHallucinated: string;
  sampleReportAccurate: string;
}
