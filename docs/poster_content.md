# RecomputeCheck: Conference Poster Layout & Content

A structured academic poster specification (designed for standard 36" x 48" or A0 portrait/landscape print).

---

## Header
- **Title:** RecomputeCheck: Verifying AI-Written Data Reports by Recalculating the Numbers
- **Authors:** [Student Name], [Supervisor Name]
- **Affiliation:** Department of Computer Science & Engineering, [University / Institute]
- **Conference / Event:** Annual Student Research Symposium / IEEE Conference Session

---

## Panel 1: Problem & Motivation
- Generative AI produces articulate analytical summaries of business data.
- **The Vulnerability:** LLMs hallucinate critical numbers (percentages, sums, subgroup means).
- **The Impact:** Erroneous financial forecasts, distorted medical metrics, flawed operational decisions.
- **Key Question:** How can we retroactively audit unconstrained AI-written reports against raw user CSVs?

---

## Panel 2: Research Gap & Related Work
- **TabFact / FEVEROUS:** Target isolated statements or encyclopedic Wikipedia retrieval; cannot audit multi-paragraph business summaries.
- **Proof-Carrying Numbers (PCN):** Requires emission-time modifications; cannot verify third-party closed-source LLMs.
- **FinGround:** Relies on text-passage retrieval; fails on aggregated multi-row metrics.
- **Our Solution:** Post-hoc deterministic recomputation using schema-aware AST code synthesis.

---

## Panel 3: System Pipeline & Architecture
```
[User CSV] + [AI Report]
         │
         ▼
[Stage 1: Claim Extractor] ───► Entity Spans, Units ($, %), Metric (Mean, Sum, Count)
         │
         ▼
[Stage 2: Code Synthesis]  ───► Schema-Aware Pandas Expression
         │
         ▼
[Stage 3: AST Safety Guard]───► Whitelist Validation (No exec/eval/os)
         │
         ▼
[Stage 4: Execution Engine]───► Deterministic Math Execution
         │
         ▼
[Stage 5: Verdict Engine]  ───► Tolerance Check (Δ ≤ 2%), RFS Score, UI Diff
```

---

## Panel 4: Mathematical Framework
- **Relative Discrepancy:**
  $$\Delta = \frac{|v_{\text{claimed}} - \hat{v}_{\text{recomputed}}|}{|\hat{v}_{\text{recomputed}}|}$$
- **Verdict Rule:**
  $$\mathcal{V}(c) = \begin{cases} \text{VERIFIED} & \text{if } \Delta \le 0.02 \lor |v - \hat{v}| \le 0.5 \\ \text{CONTRADICTED} & \text{if } \Delta > 0.02 \land |v - \hat{v}| > 0.5 \\ \text{NOT\_COMPUTABLE} & \text{otherwise} \end{cases}$$
- **Recomputation Fidelity Score (RFS):**
  $$RFS = \frac{|Verified|}{|Verified| + |Contradicted|} \times 100\%$$

---

## Panel 5: Empirical Results
| System | Coverage | Precision | Recall | F1 |
| :--- | :---: | :---: | :---: | :---: |
| Raw LLM (No check) | 100% | 0.00 | 0.00 | 0.00 |
| SelfCheck Resampling | 100% | 1.00 | 0.40 | 0.57 |
| Semantic Cell Retrieval | 20% | 1.00 | 1.00 | 1.00* |
| **RecomputeCheck** | **100%** | **1.00** | **1.00** | **1.00** |

*Retrieval coverage collapses on aggregated statistics.*

---

## Panel 6: Key Takeaways & Live Demonstration
- **High Coverage:** Resolves 100% of standard statistical aggregations.
- **Explainability:** Provides exact Pandas code and delta for every flagged claim.
- **Zero Hallucination Tolerance:** Catches arithmetic errors that bypass temperature resampling.
- **Live Demo QR Code:** [Scan to launch interactive RecomputeCheck Web App]
