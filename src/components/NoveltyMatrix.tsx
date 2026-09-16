import React from "react";
import { BookOpen, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { NOVELTY_COMPARISON_TABLE } from "../data/defaultData";

export const NoveltyMatrix: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Novelty Gate Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2 pb-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">
            Novelty Gate: Literature Review & Differentiation Matrix
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          A fundamental requirement for IEEE conference publication and university evaluation is proving non-obvious differentiation from prior art. Below is the systematic comparison matrix against the five closest published systems in table fact-checking, program-aided verification, and generative analytics.
        </p>

        {/* Research Gap Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1 text-emerald-700">
            Formal Research Gap
          </span>
          <p className="text-slate-700 leading-relaxed">
            Existing table verification systems (e.g. TabFact, FEVEROUS) evaluate <strong>isolated single-sentence claims</strong> over public encyclopedic tables via retrieval, while program-aided systems (e.g. Binder, PAL) synthesize code <strong>at generation time</strong> to answer QA queries. There is no existing <strong>post-hoc, model-agnostic, deterministic audit framework</strong> capable of taking an externally generated, multi-paragraph analytical summary of a user-provided CSV dataset, extracting compound numeric assertions, mapping them to safe AST-constrained Pandas code, and verifying numerical accuracy with scale-invariant tolerance.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Prior Art Comparison Ledger (5 Closest Systems)
        </h3>

        <div className="space-y-4">
          {NOVELTY_COMPARISON_TABLE.map((row, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{row.system}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Baseline #{idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 pt-1">
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px]">Input / Output Formulation:</span>
                  <span className="font-mono text-[11px] text-slate-800">{row.inputOutput}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px]">Verification Mechanism:</span>
                  <span className="text-slate-800">{row.verificationMethod}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 mt-2">
                <span className="font-bold block text-[11px] text-emerald-950 mb-0.5">
                  Why RecomputeCheck is Defensibly Different:
                </span>
                <p className="text-[11px] leading-relaxed">{row.similarityReasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formal Research Questions and Hypotheses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Research Questions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Research Questions (RQs)</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">RQ1 (Coverage & Mapping):</span>
              <span>Can open-ended linguistic assertions in AI data reports be deterministically mapped to valid Pandas expressions without external human annotation?</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">RQ2 (Hallucination Detection):</span>
              <span>How effectively does post-hoc deterministic recomputation detect subtle numerical hallucinations compared to sampling-based consensus (SelfCheckGPT)?</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">RQ3 (Safety & Execution):</span>
              <span>Can AST syntax tree constraints guarantee code safety during execution over untrusted user data tables?</span>
            </div>
          </div>
        </div>

        {/* Hypotheses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Testable Hypotheses</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-emerald-950">
              <span className="font-bold block mb-0.5">H1 (Verification Accuracy):</span>
              <span>RecomputeCheck achieves strictly superior precision and recall over temperature resampling baselines by eliminating stochastic hallucination echoing.</span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-emerald-950">
              <span className="font-bold block mb-0.5">H2 (Coverage Superiority over RAG):</span>
              <span>Deterministic code synthesis achieves 5x higher coverage than semantic cell retrieval when auditing aggregated statistics (e.g. sums, means, percentages).</span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-emerald-950">
              <span className="font-bold block mb-0.5">H3 (AST Containment):</span>
              <span>AST whitelisting prevents 100% of malicious system calls and arbitrary code injection attempts without degrading valid arithmetic recomputation.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
