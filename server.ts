import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import Papa from "papaparse";

const rootDir = process.cwd();

const PORT = 3000;

interface NumericClaim {
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
  verdict: "VERIFIED" | "CONTRADICTED" | "NOT_COMPUTABLE";
  explanation: string;
}

// Deterministic in-memory tabular execution engine (TypeScript mirror of ml/verifier.py)
function recomputeOverTable(
  rows: Record<string, any>[],
  columns: string[],
  claims: NumericClaim[],
  relTolerance = 0.02,
  absTolerance = 0.5
) {
  const evaluatedClaims: NumericClaim[] = [];
  let verifiedCount = 0;
  let contradictedCount = 0;
  let notComputableCount = 0;

  for (const claim of claims) {
    const copy = { ...claim };

    // Apply subgroup filter
    let activeRows = rows;
    let filterRepr = "df";
    if (copy.filter_column && copy.filter_value !== undefined && copy.filter_value !== null) {
      const fCol = copy.filter_column;
      const fVal = String(copy.filter_value).toLowerCase().trim();
      activeRows = rows.filter((r) => String(r[fCol] ?? "").toLowerCase().trim() === fVal);
      filterRepr = `df[df['${fCol}'] == '${copy.filter_value}']`;
    }

    let recomputed: number | null = null;
    let codeStr = "";

    const m = copy.metric_type.toLowerCase();
    const col = copy.target_column;

    try {
      if (m === "count") {
        recomputed = activeRows.length;
        codeStr = copy.filter_column ? `len(${filterRepr})` : "len(df)";
      } else if (m === "percentage") {
        if (copy.filter_column && rows.length > 0) {
          recomputed = (activeRows.length / rows.length) * 100.0;
          codeStr = `(len(${filterRepr}) / len(df)) * 100.0`;
        } else {
          copy.verdict = "NOT_COMPUTABLE";
          copy.explanation = "Percentage calculation requires subgroup filter condition or denominator.";
          evaluatedClaims.push(copy);
          notComputableCount++;
          continue;
        }
      } else if (col && (m === "mean" || m === "average")) {
        const nums = activeRows
          .map((r) => parseFloat(String(r[col] ?? "").replace(/[$%,]/g, "")))
          .filter((n) => !isNaN(n));
        if (nums.length > 0) {
          recomputed = nums.reduce((a, b) => a + b, 0) / nums.length;
          codeStr = `${filterRepr}['${col}'].mean()`;
        }
      } else if (col && (m === "sum" || m === "total")) {
        const nums = activeRows
          .map((r) => parseFloat(String(r[col] ?? "").replace(/[$%,]/g, "")))
          .filter((n) => !isNaN(n));
        if (nums.length > 0) {
          recomputed = nums.reduce((a, b) => a + b, 0);
          codeStr = `${filterRepr}['${col}'].sum()`;
        }
      } else if (col && m === "max") {
        const nums = activeRows
          .map((r) => parseFloat(String(r[col] ?? "").replace(/[$%,]/g, "")))
          .filter((n) => !isNaN(n));
        if (nums.length > 0) {
          recomputed = Math.max(...nums);
          codeStr = `${filterRepr}['${col}'].max()`;
        }
      } else if (col && m === "min") {
        const nums = activeRows
          .map((r) => parseFloat(String(r[col] ?? "").replace(/[$%,]/g, "")))
          .filter((n) => !isNaN(n));
        if (nums.length > 0) {
          recomputed = Math.min(...nums);
          codeStr = `${filterRepr}['${col}'].min()`;
        }
      } else if (col && m === "median") {
        const nums = activeRows
          .map((r) => parseFloat(String(r[col] ?? "").replace(/[$%,]/g, "")))
          .filter((n) => !isNaN(n))
          .sort((a, b) => a - b);
        if (nums.length > 0) {
          const mid = Math.floor(nums.length / 2);
          recomputed = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2.0;
          codeStr = `${filterRepr}['${col}'].median()`;
        }
      } else {
        copy.verdict = "NOT_COMPUTABLE";
        copy.explanation = `Target column '${col}' or metric '${m}' not deterministically resolvable.`;
        evaluatedClaims.push(copy);
        notComputableCount++;
        continue;
      }
    } catch (e: any) {
      copy.verdict = "NOT_COMPUTABLE";
      copy.explanation = `Computation error: ${e?.message || String(e)}`;
      evaluatedClaims.push(copy);
      notComputableCount++;
      continue;
    }

    if (recomputed === null || isNaN(recomputed)) {
      copy.verdict = "NOT_COMPUTABLE";
      copy.explanation = "Recomputation produced empty or invalid numeric value.";
      evaluatedClaims.push(copy);
      notComputableCount++;
      continue;
    }

    copy.generated_code = codeStr;
    copy.recomputed_value = Math.round(recomputed * 10000) / 10000;

    const absDelta = Math.abs(copy.claimed_value - recomputed);
    const relDelta = Math.abs(recomputed) < 1e-7 ? absDelta : absDelta / Math.abs(recomputed);

    copy.absolute_discrepancy = Math.round(absDelta * 10000) / 10000;
    copy.relative_discrepancy = Math.round(relDelta * 10000) / 10000;

    const isVerified = relDelta <= relTolerance || absDelta <= absTolerance;
    if (isVerified) {
      copy.verdict = "VERIFIED";
      copy.explanation = `Matches recomputed ground truth (${copy.recomputed_value.toFixed(
        2
      )}) within tolerance (Δ = ${(relDelta * 100).toFixed(2)}%).`;
      verifiedCount++;
    } else {
      copy.verdict = "CONTRADICTED";
      copy.explanation = `Numeric hallucination detected. LLM claimed ${
        copy.claimed_value
      }, but deterministic calculation yielded ${copy.recomputed_value.toFixed(2)} (Discrepancy: ${(
        relDelta * 100
      ).toFixed(1)}%).`;
      contradictedCount++;
    }

    evaluatedClaims.push(copy);
  }

  const total = claims.length;
  const computable = verifiedCount + contradictedCount;
  const rfsEval = computable > 0 ? (verifiedCount / computable) * 100 : 0;
  const rfsOverall = total > 0 ? (verifiedCount / total) * 100 : 0;
  const coverage = total > 0 ? (computable / total) * 100 : 0;

  return {
    summary: {
      total_claims: total,
      verified: verifiedCount,
      contradicted: contradictedCount,
      not_computable: notComputableCount,
      recomputation_fidelity_score: Math.round(rfsEval * 100) / 100,
      overall_fidelity_score: Math.round(rfsOverall * 100) / 100,
      computable_coverage_pct: Math.round(coverage * 100) / 100,
      tolerance_used: {
        relative_tolerance: relTolerance,
        absolute_tolerance: absTolerance,
      },
    },
    claims: evaluatedClaims,
  };
}

// Claim extraction from report text
function extractClaims(reportText: string, columns: string[]): NumericClaim[] {
  const sentences = reportText
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const claims: NumericClaim[] = [];
  const numRegex = /([$€£])?\s*([+-]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|\.\d+)\s*(%|percent|k|million|billion|dollars|pts)?/gi;

  let claimIdx = 1;

  for (const sent of sentences) {
    const matches = Array.from(sent.matchAll(numRegex));
    if (!matches || matches.length === 0) continue;

    for (const m of matches) {
      const prefix = m[1];
      const rawNum = m[2];
      const suffix = m[3];

      let val = parseFloat(rawNum.replace(/,/g, ""));
      if (isNaN(val)) continue;

      let unit = "";
      if (prefix) unit = prefix;
      if (suffix) {
        const sLower = suffix.toLowerCase();
        if (sLower === "%" || sLower === "percent") unit = "%";
        else if (sLower === "k") {
          val *= 1000;
          unit = "k";
        } else if (sLower === "million") {
          val *= 1000000;
          unit = "M";
        } else if (sLower === "billion") {
          val *= 1000000000;
          unit = "B";
        } else unit = suffix;
      }

      // Determine metric
      const sLow = sent.toLowerCase();
      let metric = "value";
      if (unit === "%" || sLow.includes("percentage") || sLow.includes("percent") || sLow.includes("rate") || sLow.includes("share")) {
        metric = "percentage";
      } else if (sLow.includes("average") || sLow.includes("mean") || sLow.includes("avg")) {
        metric = "mean";
      } else if (sLow.includes("total") || sLow.includes("sum") || sLow.includes("combined") || sLow.includes("aggregate")) {
        metric = "sum";
      } else if (sLow.includes("maximum") || sLow.includes("highest") || sLow.includes("peak") || sLow.includes("max")) {
        metric = "max";
      } else if (sLow.includes("minimum") || sLow.includes("lowest") || sLow.includes("least") || sLow.includes("min")) {
        metric = "min";
      } else if (sLow.includes("median")) {
        metric = "median";
      } else if (
        sLow.includes("count") ||
        sLow.includes("number of") ||
        sLow.includes("records") ||
        sLow.includes("cases") ||
        sLow.includes("customers") ||
        sLow.includes("patients") ||
        sLow.includes("total customers") ||
        sLow.includes("total records") ||
        sLow.includes("sample size")
      ) {
        metric = "count";
      }

      // Match target column
      let targetCol: string | null = null;
      let maxColLen = 0;
      for (const c of columns) {
        const cClean = c.toLowerCase().replace(/_/g, " ");
        if (sLow.includes(c.toLowerCase()) || sLow.includes(cClean)) {
          if (c.length > maxColLen) {
            maxColLen = c.length;
            targetCol = c;
          }
        }
      }

      // Filter detection
      let filterCol: string | null = null;
      let filterVal: string | null = null;
      const filterHints = [
        { col: "churn", vals: ["yes", "no", "churned", "retained", "churn"] },
        { col: "smoker", vals: ["yes", "no", "smoker", "smokers"] },
        { col: "gender", vals: ["male", "female"] },
        { col: "sex", vals: ["male", "female"] },
        { col: "region", vals: ["northeast", "northwest", "southeast", "southwest"] },
        { col: "contract", vals: ["month-to-month", "one year", "two year"] },
      ];

      for (const hint of filterHints) {
        const matchingCol = columns.find((c) => c.toLowerCase().includes(hint.col));
        if (matchingCol) {
          for (const v of hint.vals) {
            if (new RegExp(`\\b${v}\\b`, "i").test(sLow)) {
              filterCol = matchingCol;
              if (v === "churned" || v === "yes" || v === "churn") filterVal = "Yes";
              else if (v === "retained" || v === "no") filterVal = "No";
              else if (v === "smoker" || v === "smokers") filterVal = "yes";
              else filterVal = v;
              break;
            }
          }
        }
        if (filterCol) break;
      }

      // If percentage with a filter column found but targetCol was assigned, clear targetCol so it runs subgroup percentage
      if (metric === "percentage" && filterCol) {
        targetCol = null;
      }

      if (metric === "count" && !targetCol && columns.length > 0) {
        targetCol = columns[0];
      }

      claims.push({
        claim_id: `CLM-${String(claimIdx++).padStart(3, "0")}`,
        sentence: sent,
        claimed_value: val,
        unit,
        metric_type: metric,
        target_column: targetCol,
        filter_column: filterCol,
        filter_value: filterVal,
        verdict: "NOT_COMPUTABLE",
        explanation: "",
      });
    }
  }

  return claims;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "RecomputeCheck", time: new Date().toISOString() });
  });

  app.post("/api/audit", (req, res) => {
    try {
      const { csv_data, report_text, rel_tolerance = 0.02, abs_tolerance = 0.5 } = req.body;
      if (!csv_data || !report_text) {
        res.status(400).json({ error: "csv_data and report_text are required fields." });
        return;
      }

      const parsed = Papa.parse<Record<string, any>>(csv_data.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      const columns = parsed.meta.fields || [];
      const rows = parsed.data;

      const extractedClaims = extractClaims(report_text, columns);
      const auditResult = recomputeOverTable(
        rows,
        columns,
        extractedClaims,
        parseFloat(rel_tolerance),
        parseFloat(abs_tolerance)
      );

      res.json({
        ...auditResult,
        schema: {
          columns,
          row_count: rows.length,
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed to audit report." });
    }
  });

  app.get("/api/experiments", (_req, res) => {
    try {
      const resultsPath = path.join(rootDir, "experiments", "results.json");
      if (fs.existsSync(resultsPath)) {
        const data = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
        res.json(data);
      } else {
        res.status(404).json({ error: "experiments/results.json not found." });
      }
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.post("/api/generate-report", async (req, res) => {
    try {
      const { csv_snippet, prompt = "Write a concise analytical report summarizing key statistics." } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback realistic AI draft if key is not configured
        res.json({
          report:
            "Analytical Summary:\n\nThe dataset contains 20 customer records. Overall customer churn rate in this cohort is 35.0%. Average monthly charges across all users is 60.50 dollars. Churned customers paid an average of 92.40 dollars monthly, representing a distinct cost tier. The maximum total charges observed was 7895.15 dollars. In total, 7 customers churned while 13 were retained.",
          mode: "synthetic_fallback",
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an automated business data analyst. Given the following tabular data extract, generate a 2-to-3 paragraph factual analytical summary. Include specific numeric figures (percentages, subgroup averages, counts, and ranges) so that our fact-checking verification engine can audit your claims.

Data snippet:
${csv_snippet}

Instructions:
${prompt}`,
      });

      res.json({
        report: response.text || "No summary generated.",
        mode: "live_gemini_inference",
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Gemini report generation failed." });
    }
  });

  // Determine if running in production mode
  const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(process.argv[1]?.endsWith("server.cjs")) ||
    (fs.existsSync(path.join(rootDir, "dist", "index.html")) && !process.env.npm_lifecycle_event?.includes("dev"));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(rootDir, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexFile = path.join(distPath, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Application build not found.");
      }
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`RecomputeCheck server running on http://0.0.0.0:${PORT} (mode: ${isProduction ? "production" : "development"})`);
  });

  server.on("error", (err: any) => {
    console.error("Server listen error:", err);
  });
}

startServer();
