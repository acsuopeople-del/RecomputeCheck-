import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  Upload, 
  Sliders, 
  Code, 
  FileCheck2, 
  Database, 
  RefreshCw,
  Info,
  Download
} from "lucide-react";
import { BENCHMARK_PRESETS } from "../data/defaultData";
import { AuditResponse, NumericClaim } from "../types";

export const AuditWorkbench: React.FC = () => {
  // Active state
  const [selectedPresetId, setSelectedPresetId] = useState<string>("telecom_churn");
  const [csvText, setCsvText] = useState<string>(BENCHMARK_PRESETS[0].csv);
  const [reportText, setReportText] = useState<string>(BENCHMARK_PRESETS[0].sampleReportHallucinated);
  const [relTolerance, setRelTolerance] = useState<number>(0.02);
  const [absTolerance, setAbsTolerance] = useState<number>(0.5);

  const [loading, setLoading] = useState<boolean>(false);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [verdictFilter, setVerdictFilter] = useState<"ALL" | "VERIFIED" | "CONTRADICTED" | "NOT_COMPUTABLE">("ALL");
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);

  // Handle preset change
  const handlePresetSelect = (id: string) => {
    const p = BENCHMARK_PRESETS.find((x) => x.id === id);
    if (p) {
      setSelectedPresetId(id);
      setCsvText(p.csv);
      setReportText(p.sampleReportHallucinated);
      setAuditResult(null);
      setErrorMsg(null);
    }
  };

  // Run audit against server endpoint
  const runAudit = async () => {
    if (!csvText.trim() || !reportText.trim()) {
      setErrorMsg("Please provide both a CSV dataset and a report text.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_data: csvText,
          report_text: reportText,
          rel_tolerance: relTolerance,
          abs_tolerance: absTolerance,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Audit failed.");
      }

      const data: AuditResponse = await resp.json();
      setAuditResult(data);
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred during recomputation.");
    } finally {
      setLoading(false);
    }
  };

  // Run initial audit on load
  useEffect(() => {
    runAudit();
  }, []);

  // Generate report via Gemini endpoint
  const handleGenerateGeminiReport = async () => {
    setGeneratingReport(true);
    try {
      const resp = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_snippet: csvText.slice(0, 1500),
          prompt: "Write a 2-paragraph analytical executive summary reporting key metrics and subgroup averages.",
        }),
      });

      const data = await resp.json();
      if (data.report) {
        setReportText(data.report);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setSelectedPresetId("custom");
        setAuditResult(null);
      }
    };
    reader.readAsText(file);
  };

  // Export audit summary
  const handleExportJSON = () => {
    if (!auditResult) return;
    const blob = new Blob([JSON.stringify(auditResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recompute-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const filteredClaims = auditResult?.claims.filter((c) => {
    if (verdictFilter === "ALL") return true;
    return c.verdict === verdictFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Pill */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Deterministic Verification
            </span>
            <span className="text-xs text-slate-500">
              Auditing AI Claims via Real Pandas Expressions
            </span>
          </div>
          <p className="text-sm text-slate-700 mt-1">
            Upload any CSV and enter an AI analytical summary. RecomputeCheck parses all numeric claims, translates them into AST-constrained queries, and recalculates ground truth directly from your data.
          </p>
        </div>

        {/* Dataset Quick Select */}
        <div className="flex items-center space-x-2 shrink-0">
          <Database className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">Preset:</span>
          <select
            id="preset-select"
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            {BENCHMARK_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="custom">Custom Uploaded CSV</option>
          </select>
        </div>
      </div>

      {/* Input Grid: Dataset & Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tabular Dataset */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">1. Tabular Ground Truth (CSV)</h2>
            </div>
            <label 
              id="upload-csv-label" 
              className="cursor-pointer text-xs flex items-center space-x-1 font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <p className="text-xs text-slate-500 my-2">
            The raw structured table used as the authoritative mathematical reference.
          </p>

          <textarea
            id="csv-input-area"
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setSelectedPresetId("custom");
            }}
            rows={10}
            className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 resize-none grow"
            placeholder="Paste CSV rows here..."
          />

          {auditResult?.schema && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Detected Schema ({auditResult.schema.columns.length} columns)</span>
                <span className="font-mono">{auditResult.schema.row_count} rows</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {auditResult.schema.columns.map((col) => (
                  <span
                    key={col}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Report */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">2. AI-Written Analytical Report</h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-accurate-sample"
                onClick={() => {
                  const p = BENCHMARK_PRESETS.find((x) => x.id === selectedPresetId);
                  if (p) setReportText(p.sampleReportAccurate);
                }}
                className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Factual Sample
              </button>

              <button
                id="btn-hallucinated-sample"
                onClick={() => {
                  const p = BENCHMARK_PRESETS.find((x) => x.id === selectedPresetId);
                  if (p) setReportText(p.sampleReportHallucinated);
                }}
                className="text-[11px] px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium transition"
              >
                Hallucinated Sample
              </button>

              <button
                id="btn-gemini-draft"
                onClick={handleGenerateGeminiReport}
                disabled={generatingReport}
                className="text-[11px] flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium transition disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>{generatingReport ? "Drafting..." : "Gemini AI Draft"}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 my-2">
            The narrative summary containing numeric assertions (averages, percentages, totals, counts).
          </p>

          <textarea
            id="report-input-area"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={8}
            className="w-full text-xs p-3 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 resize-none grow"
            placeholder="Paste the AI analytical report or executive summary here..."
          />

          {/* Tolerance Controls Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Relative Tol:</span>
                <input
                  type="range"
                  min="0.005"
                  max="0.08"
                  step="0.005"
                  value={relTolerance}
                  onChange={(e) => setRelTolerance(parseFloat(e.target.value))}
                  className="w-20 accent-emerald-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-slate-800">
                  {(relTolerance * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span>Absolute Tol:</span>
                <input
                  type="number"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={absTolerance}
                  onChange={(e) => setAbsTolerance(parseFloat(e.target.value))}
                  className="w-16 px-1.5 py-0.5 text-xs font-mono border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            <button
              id="btn-run-audit"
              onClick={runAudit}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Recomputing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Deterministic Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Section */}
      {auditResult && (
        <div className="space-y-6">
          {/* Summary Dashboard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* RFS Score Card */}
            <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                  <span>Recomputation Fidelity</span>
                  <span className="text-[10px] px-1 bg-slate-100 rounded text-slate-600 font-mono">RFS</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">
                  {auditResult.summary.recomputation_fidelity_score}%
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {auditResult.summary.verified} of {auditResult.summary.verified + auditResult.summary.contradicted} computable claims verified
                </p>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm ${
                auditResult.summary.recomputation_fidelity_score >= 80 
                  ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                  : auditResult.summary.recomputation_fidelity_score >= 50
                  ? "bg-amber-100 text-amber-800 border-2 border-amber-300"
                  : "bg-rose-100 text-rose-800 border-2 border-rose-300"
              }`}>
                {auditResult.summary.recomputation_fidelity_score.toFixed(0)}%
              </div>
            </div>

            {/* Total Claims */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Claims</span>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {auditResult.summary.total_claims}
              </div>
              <span className="text-[11px] text-slate-400">Extracted Spans</span>
            </div>

            {/* Verified (Factual) */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>Verified</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {auditResult.summary.verified}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Matches Data</span>
            </div>

            {/* Contradicted (Hallucination) */}
            <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
              <div className="flex items-center justify-between text-xs text-rose-800 font-medium">
                <span>Contradicted</span>
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-rose-700 mt-1">
                {auditResult.summary.contradicted}
              </div>
              <span className="text-[11px] text-rose-600 font-medium">Hallucinations</span>
            </div>

            {/* Not Computable / Coverage */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Coverage</span>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {auditResult.summary.computable_coverage_pct}%
              </div>
              <span className="text-[11px] text-slate-400">
                {auditResult.summary.not_computable} Unmapped
              </span>
            </div>
          </div>

          {/* Interactive Report View with Inline Highlights */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <FileTextIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Interactive Text Inspector</h3>
              </div>
              <span className="text-xs text-slate-500">
                Click any highlighted sentence to inspect the compiled Pandas computation
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed font-sans space-y-2 text-slate-800 border border-slate-200">
              {auditResult.claims.map((c) => {
                const isSelected = highlightedClaimId === c.claim_id;
                let badgeClass = "bg-slate-200 text-slate-800 hover:bg-slate-300";
                if (c.verdict === "VERIFIED") {
                  badgeClass = "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500 hover:bg-emerald-200";
                } else if (c.verdict === "CONTRADICTED") {
                  badgeClass = "bg-rose-100 text-rose-900 border-b-2 border-rose-500 hover:bg-rose-200";
                } else {
                  badgeClass = "bg-amber-100 text-amber-900 border-b-2 border-amber-500 hover:bg-amber-200";
                }

                return (
                  <span
                    key={c.claim_id}
                    onClick={() => setHighlightedClaimId(c.claim_id)}
                    className={`cursor-pointer px-1 py-0.5 rounded transition inline-block mr-1.5 ${badgeClass} ${
                      isSelected ? "ring-2 ring-slate-900 ring-offset-1" : ""
                    }`}
                    title={`Click to focus ${c.claim_id} (${c.verdict})`}
                  >
                    {c.sentence}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Claim Breakdown Table & Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Claim-by-Claim Verification Ledger</h3>
                <p className="text-xs text-slate-500">
                  Each claim is evaluated deterministically against the dataset schema
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 text-xs">
                {(["ALL", "VERIFIED", "CONTRADICTED", "NOT_COMPUTABLE"] as const).map((filter) => (
                  <button
                    key={filter}
                    id={`filter-${filter}`}
                    onClick={() => setVerdictFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      verdictFilter === filter
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter === "ALL" ? "All Claims" : filter}
                  </button>
                ))}

                <button
                  id="btn-export-audit"
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs ml-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Claims List */}
            <div className="mt-4 space-y-3">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No claims found matching filter "{verdictFilter}".
                </div>
              ) : (
                filteredClaims.map((claim) => (
                  <ClaimCard
                    key={claim.claim_id}
                    claim={claim}
                    isHighlighted={highlightedClaimId === claim.claim_id}
                    onSelect={() => setHighlightedClaimId(claim.claim_id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ClaimCardProps {
  claim: NumericClaim;
  isHighlighted: boolean;
  onSelect: () => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, isHighlighted, onSelect }) => {
  const isVerified = claim.verdict === "VERIFIED";
  const isContradicted = claim.verdict === "CONTRADICTED";

  return (
    <div
      id={`claim-card-${claim.claim_id}`}
      onClick={onSelect}
      className={`p-4 rounded-xl border transition cursor-pointer ${
        isHighlighted
          ? "border-slate-900 ring-2 ring-slate-900/10 bg-slate-50/50"
          : isVerified
          ? "border-emerald-200 bg-emerald-50/10 hover:border-emerald-300"
          : isContradicted
          ? "border-rose-200 bg-rose-50/10 hover:border-rose-300"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        {/* Left Side: Sentence & Classification */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-500">{claim.claim_id}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
              isVerified
                ? "bg-emerald-100 text-emerald-800"
                : isContradicted
                ? "bg-rose-100 text-rose-800"
                : "bg-amber-100 text-amber-800"
            }`}>
              {isVerified && <CheckCircle2 className="w-3 h-3" />}
              {isContradicted && <XCircle className="w-3 h-3" />}
              {!isVerified && !isContradicted && <AlertTriangle className="w-3 h-3" />}
              <span>{claim.verdict}</span>
            </span>

            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              Metric: {claim.metric_type}
            </span>

            {claim.target_column && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                Col: {claim.target_column}
              </span>
            )}

            {claim.filter_column && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                Filter: {claim.filter_column} == '{claim.filter_value}'
              </span>
            )}
          </div>

          <p className="text-xs text-slate-800 font-medium font-sans">
            "{claim.sentence}"
          </p>

          <p className="text-[11px] text-slate-600 mt-1">
            {claim.explanation}
          </p>
        </div>

        {/* Right Side: Recomputed Comparison Matrix */}
        <div className="shrink-0 bg-white border border-slate-200 rounded-lg p-2.5 text-xs flex items-center space-x-4 shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Claimed</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {claim.claimed_value} {claim.unit}
            </span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recomputed</span>
            <span className={`font-mono font-bold text-sm ${
              claim.recomputed_value !== null && claim.recomputed_value !== undefined
                ? isVerified ? "text-emerald-700" : "text-rose-700"
                : "text-slate-400"
            }`}>
              {claim.recomputed_value !== null && claim.recomputed_value !== undefined 
                ? `${claim.recomputed_value} ${claim.unit}` 
                : "N/A"}
            </span>
          </div>

          {claim.relative_discrepancy !== null && claim.relative_discrepancy !== undefined && (
            <div className="border-l border-slate-200 pl-4 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Delta (Δ)</span>
              <span className={`font-mono font-bold text-xs ${
                isVerified ? "text-emerald-700" : "text-rose-700"
              }`}>
                {(claim.relative_discrepancy * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Generated Executable Pandas Expression */}
      {claim.generated_code && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <Code className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-sans">Compiled:</span>
            <code className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {claim.generated_code}
            </code>
          </div>

          <div className="flex items-center space-x-1 text-emerald-600 text-[10px] font-sans font-medium shrink-0 ml-2">
            <span>AST Safe</span>
          </div>
        </div>
      )}
    </div>
  );
};

const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
