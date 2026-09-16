# RecomputeCheck: Post-Hoc Deterministic Verification of LLM-Generated Tabular Data Reports via AST-Constrained Code Synthesis

**Authors:** [Student Name], [Advisor Name]  
**Affiliation:** Department of Computer Science and Engineering, [University Name]  
**Target Venue:** IEEE International Conference on Big Data / IEEE Trans. on Artificial Intelligence (Draft Format)  

---

## Abstract
Large Language Models (LLMs) are increasingly deployed as automated data analysts to synthesize natural-language analytical summaries from tabular datasets (e.g., CSV, SQL exports). Despite their grammatical fluency, LLMs suffer from insidious numeric hallucinations: generating plausible-sounding but mathematically erroneous percentages, aggregated means, directional trends, and sample counts. Existing hallucination mitigation strategies—such as retrieval-augmented generation (RAG), presentation-layer proof tokens (e.g., Proof-Carrying Numbers), or passage citation (e.g., FinGround)—either ground claims against external reference text or require generation-time protocol modifications. In contrast, they cannot retroactively verify arbitrary, independently generated analytical summaries against proprietary user tables. 

In this paper, we propose **RecomputeCheck**, a post-hoc, deterministic verification framework for auditing AI-written data reports. RecomputeCheck ingests an arbitrary natural-language report and its underlying tabular dataset, extracts all numeric and statistical assertions via a schema-aware parser, maps each claim into an Abstract Syntax Tree (AST)-constrained Python/Pandas aggregation query, and recomputes the exact mathematical ground truth directly over the user's data. Discrepancies exceeding a dynamic relative-or-absolute tolerance threshold ($\epsilon = 0.02$) are flagged with granular diagnostic evidence (**Verified**, **Contradicted**, or **Not Computable**), yielding a composite **Recomputation Fidelity Score (RFS)** per report. On our benchmark evaluation comparing raw generation, self-consistency resampling, and semantic cell retrieval, RecomputeCheck achieves an F1-score of 1.0 on deterministic aggregations while boosting computable claim coverage from 20.0% (retrieval baseline) to 100.0%.

**Index Terms**—Large Language Models, Numeric Hallucination, Tabular Data Fact-Checking, Program-Aided Verification, AI Governance, Data Science Automation.

---

## I. Introduction

The integration of generative language models into enterprise analytics pipelines has democratized automated report generation. Business intelligence analysts, clinicians, and researchers frequently supply tabular datasets (spreadsheets, EHR exports, survey logs) to LLMs, asking for descriptive executive summaries, key performance indicators (KPIs), and trend narratives. 

However, autoregressive language modeling optimizes next-token likelihood, not numerical invariant preservation. As a consequence, LLMs frequently fabricate arithmetic values:
1. **Subgroup Aggregation Swapping**: Confusing the mean of an entire cohort with that of a targeted subgroup (e.g., reporting overall average revenue instead of churned customer revenue).
2. **Denominational & Percentage Errors**: Computing inaccurate denominators when estimating rates (e.g., stating a 15.2% attrition rate when true rate is 35.0%).
3. **Extrapolated / Ghost Totals**: Inventing record counts or rounding extremes that do not exist in the source data.

In high-stakes corporate, regulatory, and healthcare contexts, an unverified numeric hallucination in an executive briefing can misguide strategic capital allocation or patient triaging. 

### Contributions
This work introduces **RecomputeCheck**, making the following contributions:
- **Novel Post-Hoc Formulation**: We formalize the problem of post-hoc tabular data report auditing, operating purely on the completed natural-language text and raw table, without requiring model checkpoint access or generation-time tokens.
- **AST-Bounded Program Synthesis**: We implement a schema-guided code synthesis pipeline that compiles numeric claims into safe, executable Pandas expressions, verified by AST sandboxing against arbitrary code execution exploits.
- **Recomputation Fidelity Metric**: We formulate the Recomputation Fidelity Score ($RFS$), an interpretable, mathematically rigorous index of report veracity.
- **Empirical Validation & Ablation**: We benchmark RecomputeCheck against three distinct paradigms (raw trust, self-consistency resampling, and semantic cell retrieval), showing why retrieval methods fail on multi-row aggregations and how programmatic re-execution resolves the coverage bottleneck.

---

## II. Related Work and Novelty Gate Analysis

| System / Line of Work | Input / Output | Verification Mechanism | Primary Limitation Addressed by RecomputeCheck |
| :--- | :--- | :--- | :--- |
| **TabFact** (Chen et al., ICLR 2020) | Table + Single isolated sentence $\to$ Binary Entailment / Refuted | Latent Program Algorithm (LPA) over Wikipedia tables | Designed for single-claim Wikipedia table verification; cannot parse multi-claim executive markdown reports with mixed text, units, and implicit multi-row filters. |
| **FEVEROUS** (Aly et al., NeurIPS 2021) | Unstructured text + tables $\to$ Evidence graph + Verdict | Graph-based hybrid text-table retrieval | Verifies claims against encyclopedic text and tables via extraction, but does not compile math into programmatic queries over private datasets. |
| **Binder / PAL** (Cheng et al., ICLR 2023; Gao et al., 2023) | Natural language question $\to$ Program (SQL/Python) $\to$ Answer | Code execution to *generate* answers at prompt time | Generation-time QA tool; cannot take an existing, completed third-party report and audit its internal numeric assertions post-hoc. |
| **Proof-Carrying Numbers (PCN)** (World Bank / arXiv 2024) | Query + Data $\to$ Claim-bound tokens with cryptographic proof tags | Renderer-level mechanical proof checking | Requires generation-time emission protocols. Cannot audit existing reports generated by commercial closed-source models (GPT-4o, Claude 3.5, Gemini 1.5). |
| **FinGround** (arXiv 2024) | Financial questions + SEC filings $\to$ Extracted text with citations | Hybrid passage retrieval + formula reconstruction over filings | Verifies claims against retrieved 10-K filing text paragraphs; does not execute programmatic aggregations across raw user-supplied relational tabular files. |

**The Distinct Differentiator:** RecomputeCheck does not perform semantic text retrieval or generation-time proof tagging. It treats the completed LLM report as an unverified audit artifact, decomposes its numeric assertions into symbolic computation graphs, and re-executes them against the ground-truth tabular dataset.

---

## III. Research Framing & Hypotheses

### Problem Statement & Research Gap
*Existing systems* either verify text against retrieved documents (RAG, FinGround) or enforce proof emission during generation (PCN, Binder). *They are strong at* finding verbatim documentary evidence and generating answers live from scratch. *However, they have limitation Z:* they cannot audit an already-written analytical report against a raw tabular dataset when the claims represent multi-row aggregations (sums, means, conditional percentages) that do not appear in any single text cell.  
$\to$ **Gap $G$**: Absence of a post-hoc, deterministic verification mechanism that translates free-text numeric claims into safe, executable tabular programs over user CSVs.  
$\to$ **Method $M$**: RecomputeCheck AST-bounded code compilation and tolerance verification engine.  
$\to$ **Hypothesis $H$**: Programmatic recomputation will achieve significantly higher claim coverage and hallucination detection F1 on aggregated tabular reports than semantic cell retrieval and self-consistency resampling.

### Research Questions
- **RQ1 (Coverage)**: Can constrained program synthesis over user table schemas achieve $>90\%$ coverage of standard statistical claims (means, percentages, totals, counts) in LLM-generated business reports?
- **RQ2 (Fidelity & Accuracy)**: Does post-hoc deterministic recomputation detect arithmetic hallucinations that bypass self-consistency resampling?
- **RQ3 (Safety & Reliability)**: Can AST-bounded validation prevent malicious script injection while preserving programmatic expressiveness?

---

## IV. System Architecture & Methodology

The RecomputeCheck pipeline operates in four pipelined stages:

```
[User CSV Table] ------------+
                             |
[LLM Analytical Report] ------> [Stage 1: Claim Extraction]
                             |  - Sentence segmentation
                             |  - Numeric span & unit parsing
                             |  - Metric typing (mean, sum, %, count)
                             v
                        [Stage 2: Schema-Aware Program Synthesis]
                             |  - Column identifier grounding
                             |  - Subgroup filter condition extraction
                             |  - Pandas AST compilation
                             v
                        [Stage 3: AST Safety & Sandboxed Recomputation]
                             |  - Forbidden symbol whitelist (no exec, eval, os)
                             |  - Deterministic evaluation over TableContainer
                             v
                        [Stage 4: Tolerance & Verdict Engine]
                             |  - Absolute discrepancy: |v_claimed - v_recomputed|
                             |  - Relative discrepancy: |v_claimed - v_recomputed| / |v_recomputed|
                             |  - Verdict: VERIFIED | CONTRADICTED | NOT_COMPUTABLE
                             v
                        [Recomputation Fidelity Score (RFS) & Interactive UI]
```

### Mathematical Formulation
Let $D$ denote the tabular dataset with columns $\{C_1, \dots, C_m\}$. Let $R$ denote the LLM report.
A claim $c_i \in C$ is defined as the tuple:
$$c_i = (s_i, v_i^{\text{claim}}, u_i, \mu_i, C_{\text{target}}, C_{\text{filter}}, \theta_{\text{filter}})$$
where $s_i$ is the text sentence, $v_i^{\text{claim}} \in \mathbb{R}$ is the asserted number, $u_i$ is the unit, $\mu_i$ is the metric type, and $(C_{\text{filter}}, \theta_{\text{filter}})$ specify subgroup conditioning.

The compiled expression $E_i = \mathcal{M}(c_i, D)$ executes to produce recomputed value $\hat{v}_i = \mathcal{E}(E_i, D)$.

The discrepancy metric $\Delta(v_i^{\text{claim}}, \hat{v}_i)$ is formulated as:
$$\Delta(v_i^{\text{claim}}, \hat{v}_i) = \begin{cases}
|v_i^{\text{claim}} - \hat{v}_i| & \text{if } |\hat{v}_i| < 10^{-5} \\
\frac{|v_i^{\text{claim}} - \hat{v}_i|}{|\hat{v}_i|} & \text{otherwise}
\end{cases}$$

Given relative tolerance $\tau_{\text{rel}} = 0.02$ (2%) and absolute tolerance $\tau_{\text{abs}} = 0.5$, the verdict $\mathcal{V}(c_i)$ is:
$$\mathcal{V}(c_i) = \begin{cases}
\text{VERIFIED} & \text{if } E_i \neq \emptyset \land (\Delta \le \tau_{\text{rel}} \lor |v_i^{\text{claim}} - \hat{v}_i| \le \tau_{\text{abs}}) \\
\text{CONTRADICTED} & \text{if } E_i \neq \emptyset \land (\Delta > \tau_{\text{rel}} \land |v_i^{\text{claim}} - \hat{v}_i| > \tau_{\text{abs}}) \\
\text{NOT\_COMPUTABLE} & \text{if } E_i = \emptyset \lor \mathcal{E}(E_i, D) \text{ raises exception}
\end{cases}$$

### Recomputation Fidelity Score (RFS)
$$RFS_{\text{eval}} = \frac{\sum_{c_i \in C_{\text{eval}}} \mathbb{I}(\mathcal{V}(c_i) = \text{VERIFIED})}{|C_{\text{eval}}|} \times 100\%$$
$$RFS_{\text{overall}} = \frac{\sum_{c_i \in C} \mathbb{I}(\mathcal{V}(c_i) = \text{VERIFIED})}{|C|} \times 100\%$$
$$\text{Coverage} = \frac{|C_{\text{eval}}|}{|C|} \times 100\%$$

---

## V. Experimental Evaluation

All experiments were executed on our structured tabular benchmark cases comprising real datasets (Telecom Customer Churn and Medical Insurance Charges) with paired factual claims and synthetic LLM hallucinations.

### Benchmark Results Table
*Metrics evaluated on hallucination detection (Positive Class = Contradicted / Hallucination):*

| Approach / Baseline | Evaluated / Total Samples | Coverage (%) | Accuracy | Precision | Recall | F1-Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Raw LLM Report (Trust-as-is)** | 10 / 10 | 100.0% | 0.5000 | 0.0000 | 0.0000 | 0.0000 |
| **SelfCheck Resampling Baseline** | 10 / 10 | 100.0% | 0.7000 | 1.0000 | 0.4000 | 0.5714 |
| **Semantic Cell Retrieval Baseline** | 2 / 10 | 20.0% | 1.0000 | 1.0000 | 1.0000 | 1.0000* |
| **RecomputeCheck (Proposed Method)** | **10 / 10** | **100.0%** | **1.0000** | **1.0000** | **1.0000** | **1.0000** |

*\*Note on Semantic Cell Retrieval: While precision and recall are 1.0 on the 2 samples it could evaluate, its coverage collapsed to 20.0% because 8 out of 10 claims were multi-row aggregations (averages, percentages, totals) that do not correspond to any single cell in the raw CSV table.*

### Ablation Study: Effect of Subgroup Filter Extraction
When subgroup filter parsing is disabled (evaluating all claims unconditionally over the whole table):
- **Coverage dropped from 100.0% to 60.0%** (4 claims became unmapped due to missing filter semantics).
- Precision remained 1.0 on unconditional metrics, confirming that filter extraction is the primary component enabling complex segment auditing.

---

## VI. Failure Case Taxonomy

Through empirical stress testing, we identified three primary failure boundaries:
1. **Ambiguous Pronoun / Entity Resolution**: When an LLM asserts "their charges were high ($120.00)", if the prior sentence discussed multiple demographic tiers, attributing the target filter requires coreference resolution.
2. **Implicit Windowing / Temporal Slices**: Claims referring to "in recent quarters" without explicit date column ranges in the prompt require domain-specific calendar parsing.
3. **Compound Non-Linear Operations**: Multi-stage calculations (e.g., Gini coefficients or non-linear regression slopes) require extended symbolic grammar libraries.

---

## VII. Limitations and Ethics

### Limitations
- RecomputeCheck depends on user CSV availability; reports discussing external trends not present in the table will appropriately be designated `NOT_COMPUTABLE`.
- High cardinality free-form text columns require fuzzy entity linking.

### Ethical Implications
Automated fact-checking tools must clearly state their coverage boundaries. Presenting a 100% RFS on computable claims must not be misinterpreted as a guarantee of non-computable qualitative assertions (e.g., "the marketing campaign was visionary").

---

## VIII. Conclusion
RecomputeCheck addresses a critical vulnerability in generative business intelligence: silent numerical hallucinations. By converting natural-language statistical claims into AST-constrained Pandas code and recomputing values deterministically against user data, RecomputeCheck provides accountable, explainable, and verifiable assurance for AI-generated reports.
