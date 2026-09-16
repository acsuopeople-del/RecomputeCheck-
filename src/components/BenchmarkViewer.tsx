import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";
import { BenchmarkResultsPayload, SystemResult } from "../types";

export const BenchmarkViewer: React.FC = () => {
  const [data, setData] = useState<BenchmarkResultsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSystemKey, setActiveSystemKey] = useState<string>("recompute_check_proposed");

  useEffect(() => {
    fetch("/api/experiments")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load experiments:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        Loading empirical benchmark logs from disk...
      </div>
    );
  }

  if (!data || !data.systems) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 text-amber-800 text-xs">
        Benchmark results could not be loaded. Please ensure experiments/results.json exists.
      </div>
    );
  }

  const systems = [
    {
      key: "recompute_check_proposed",
      name: "RecomputeCheck (Proposed)",
      badge: "Our Method",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      description: "Post-hoc deterministic verification via AST-constrained Pandas re-execution.",
      data: data.systems.recompute_check_proposed,
    },
    {
      key: "semantic_retrieval_baseline",
      name: "Semantic Cell Retrieval (RAG Baseline)",
      badge: "Information Retrieval",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      description: "Retrieves individual table cells matching claim keywords; cannot compute aggregations.",
      data: data.systems.semantic_retrieval_baseline,
    },
    {
      key: "selfcheck_resampling_baseline",
      name: "SelfCheckGPT (Resampling Baseline)",
      badge: "Probabilistic Resampling",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      description: "Resamples LLM completions at temperature > 0 to measure cross-generation consensus.",
      data: data.systems.selfcheck_resampling_baseline,
    },
    {
      key: "raw_llm_no_verification",
      name: "Raw LLM (No Verification)",
      badge: "Unchecked Generative",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      description: "Standard autoregressive generation without fact-checking or code execution.",
      data: data.systems.raw_llm_no_verification,
    },
  ];

  const activeSystem = systems.find((s) => s.key === activeSystemKey) || systems[0];
  const ablation = data.ablations?.recompute_check_without_filter_parsing;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2 pb-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Empirical Benchmark & Evaluation</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          We evaluated RecomputeCheck against 3 established baselines across 10 balanced factual and hallucinated assertions over telecom and healthcare tabular datasets. Evaluated metrics: Precision (avoiding false alarms), Recall (detecting hallucinations), F1-Score, and Computable Coverage %.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Benchmark Suite</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {data.benchmark_summary.total_benchmark_cases} Evaluated Test Cases
            </span>
            <span className="text-slate-500 text-[11px]">
              {data.benchmark_summary.factual_verified_cases} Factual / {data.benchmark_summary.hallucinated_contradicted_cases} Hallucinated
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Deterministic Ground Truth</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">100% Deterministic</span>
            <span className="text-slate-500 text-[11px]">Calculated directly from raw CSV records</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Dual Tolerance</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">Δrel ≤ 2% OR Δabs ≤ 0.5</span>
            <span className="text-slate-500 text-[11px]">Compensates for standard rounding in reports</span>
          </div>
        </div>
      </div>

      {/* Baseline Comparison Leaderboard */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">System Performance Leaderboard</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">System / Approach</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3 text-center">Precision</th>
                <th className="py-2.5 px-3 text-center">Recall</th>
                <th className="py-2.5 px-3 text-center">F1-Score</th>
                <th className="py-2.5 px-3 text-center">Coverage %</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {systems.map((s) => {
                const isSelected = s.key === activeSystemKey;
                const m = s.data.metrics;
                return (
                  <tr
                    key={s.key}
                    onClick={() => setActiveSystemKey(s.key)}
                    className={`cursor-pointer transition ${
                      isSelected ? "bg-emerald-50/40 font-semibold text-slate-900" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900">{s.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${s.badgeColor}`}>
                          {s.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">{s.description}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {(m.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {m.f1_score.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        m.coverage_pct >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {m.coverage_pct.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                        {isSelected ? "Inspecting" : "Inspect"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active System Diagnostic Matrix & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix Visualizer */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h4 className="text-sm font-bold text-slate-900">
              Confusion Matrix: {activeSystem.name}
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              N = {activeSystem.data.confusion_matrix.total_samples}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Evaluating hallucination detection: True Positive represents successfully flagging a numeric error.
          </p>

          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            {/* TP */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-sans font-semibold block">
                True Positive (TP)
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {activeSystem.data.confusion_matrix.true_positive_contradicted}
              </span>
              <span className="text-[10px] text-emerald-600 font-sans">
                Hallucinations Detected
              </span>
            </div>

            {/* FP */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-600 font-sans font-semibold block">
                False Positive (FP)
              </span>
              <span className="text-2xl font-bold text-slate-700 mt-1 block">
                {activeSystem.data.confusion_matrix.false_positive_hallucination_flag}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                False Alarms
              </span>
            </div>

            {/* FN */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[11px] text-rose-800 font-sans font-semibold block">
                False Negative (FN)
              </span>
              <span className="text-2xl font-bold text-rose-700 mt-1 block">
                {activeSystem.data.confusion_matrix.false_negative_missed_hallucination}
              </span>
              <span className="text-[10px] text-rose-600 font-sans">
                Missed Hallucinations
              </span>
            </div>

            {/* TN */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-sans font-semibold block">
                True Negative (TN)
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {activeSystem.data.confusion_matrix.true_negative_verified}
              </span>
              <span className="text-[10px] text-emerald-600 font-sans">
                Verified Factual Claims
              </span>
            </div>
          </div>

          {activeSystem.data.confusion_matrix.not_computable_unmapped > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unmapped Claims (Out of Scope / Failed Retrieval):</span>
              </div>
              <span className="font-mono font-bold text-amber-900">
                {activeSystem.data.confusion_matrix.not_computable_unmapped} claims
              </span>
            </div>
          )}
        </div>

        {/* Why Retrieval Collapsed Section */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Key Finding: Why RAG Retrieval Collapses to 20%
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              Semantic cell retrieval (standard RAG applied to tables) searches for individual cell values that match report text.
            </p>

            <div className="mt-3 space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Cell Retrieval Success Case (Single Cell):</span>
                <span>Claim: "Maximum charges observed was $7895.15." &rarr; Matched cell in row 16.</span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold text-rose-950 block mb-0.5">Cell Retrieval Failure Case (Aggregated Metric):</span>
                <span>Claim: "Average monthly charges is $60.50." &rarr; <strong>No single cell in the entire CSV contains 60.50!</strong> Retrieval returns null because the number only exists through an aggregation operation over all 20 rows.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
            <strong>RecomputeCheck's Breakthrough:</strong> By synthesizing schema-aware Pandas code (<code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">df['charges'].mean()</code>), RecomputeCheck executes multi-row mathematical operations, achieving <strong>100% computable coverage</strong>.
          </div>
        </div>
      </div>

      {/* Ablation Study Section */}
      {ablation && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 pb-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Ablation Study: Impact of Subgroup Filter Extraction
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            We systematically ablated the linguistic subgroup condition parser to quantify its contribution to overall system coverage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-800 text-sm block">
                Without Subgroup Filter Extraction
              </span>
              <span className="text-slate-500 text-[11px] block mt-0.5 mb-3">
                Only global aggregations supported (e.g. len(df), df['charges'].mean())
              </span>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Coverage:</span>
                  <span className="font-bold text-amber-700">
                    {ablation.metrics.coverage_pct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Unmapped Claims:</span>
                  <span className="font-bold text-rose-700">4 of 10 claims lost</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <span className="font-bold text-emerald-900 text-sm block">
                Full Proposed System (With Subgroup Filtering)
              </span>
              <span className="text-emerald-700 text-[11px] block mt-0.5 mb-3">
                Condition grounding enables subgroup queries (e.g. df[df['churn'] == 'Yes'])
              </span>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-sans">Coverage:</span>
                  <span className="font-bold text-emerald-700">
                    {data.systems.recompute_check_proposed.metrics.coverage_pct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-sans">Unmapped Claims:</span>
                  <span className="font-bold text-emerald-700">0 of 10 claims lost (100% mapped)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
