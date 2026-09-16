# RecomputeCheck: Slide-by-Slide Defense Presentation Outline

A complete 16-slide defense presentation deck for university evaluation and conference presentation.

---

### Slide 1: Title Slide
- **Title:** RecomputeCheck: Verifying AI-Written Data Reports by Recalculating the Numbers
- **Subtitle:** A Post-Hoc Deterministic Verification Framework for Tabular Generative Analytics
- **Candidate:** [Your Name], Final Year B.Tech / B.E. Computer Science & Engineering
- **Supervisor:** [Advisor Name], Department of Computer Science & Engineering
- **Date / Session:** 2024–2025 Academic Year
- **Speaker Notes:** "Good morning respected examiners and members of the panel. Today I present RecomputeCheck, a system designed to solve a pressing issue in generative AI: numeric hallucinations in automated data reports."

---

### Slide 2: Problem Definition & Motivation
- **Context:** Enterprise adoption of LLMs for automated summary generation over CSVs, spreadsheets, and SQL tables.
- **The Core Threat:** LLMs optimize for syntactic fluency, not arithmetic veracity.
- **Real-World Impact:** An LLM reporting an incorrect quarterly churn rate of 15% instead of 35% can lead to catastrophic executive decisions.
- **Speaker Notes:** "While LLMs write fluent reports, they frequently hallucinate numbers. A single corrupted decimal or inverted percentage can invalidate an entire strategic business analysis."

---

### Slide 3: Anatomy of Numeric Hallucinations
- **Subgroup Swapping:** Applying global averages to specific sub-cohorts.
- **Denominator Blindness:** Inventing sample sizes or calculating ratios against the wrong total.
- **Extrapolation Errors:** Fabricating minimums, maximums, and correlation trends.
- **Visual Example:** Side-by-side snippet of an LLM report asserting "Average spend of churned users was $145" vs Ground Truth "$90.40".
- **Speaker Notes:** "Notice that the sentence sounds completely natural. Without recalculation, a human reader cannot spot this error."

---

### Slide 4: Literature Review & Novelty Gate
- **TabFact (ICLR 2020):** Isolated single-sentence claims on Wikipedia tables; not multi-claim business reports.
- **FEVEROUS (NeurIPS 2021):** Encyclopedic evidence retrieval; lacks code execution over proprietary CSVs.
- **Binder / PAL (ICLR / ICML 2023):** Generation-time question answering; cannot audit already-written reports.
- **Proof-Carrying Numbers (PCN 2024):** Requires generation-time proof tokens; cannot audit third-party closed-source LLMs.
- **FinGround (2024):** Text-passage retrieval over 10-K filings; fails on multi-row numeric aggregations.
- **Speaker Notes:** "Our literature gate evaluated 5 closest systems. RecomputeCheck's unique contribution is post-hoc, deterministic verification of arbitrary reports over private tables."

---

### Slide 5: Research Gap & Objectives
- **Gap:** Inability to post-hoc verify free-text statistical assertions against raw tabular data arrays.
- **Research Questions:**
  - RQ1: Can constrained code generation achieve $>90\%$ coverage on standard data claims?
  - RQ2: Does deterministic recomputation outperform self-consistency resampling on arithmetic errors?
  - RQ3: Can AST-bounded execution guarantee sandbox safety?
- **Speaker Notes:** "We formulated three core research questions focusing on coverage, detection fidelity, and execution safety."

---

### Slide 6: RecomputeCheck Architecture
- **Stage 1:** Schema-Aware Claim Extractor (Segments sentences, detects metrics: mean, %, sum, count).
- **Stage 2:** Constrained Program Synthesis (Translates claims to Pandas AST queries).
- **Stage 3:** Sandboxed Execution Sandbox (Evaluates math deterministically).
- **Stage 4:** Tolerance & Verdict Layer (Computes relative/absolute delta, flags Verified/Contradicted/Not Computable).
- **Speaker Notes:** "Here is the four-stage pipeline. The entire process takes raw CSV and report text as input, producing a verified audit trace."

---

### Slide 7: Mathematical Formulation & Tolerance Logic
- **Discrepancy Formula:**
  $$\Delta(v_{\text{claimed}}, \hat{v}) = \frac{|v_{\text{claimed}} - \hat{v}|}{|\hat{v}|}$$
- **Decision Rule:** Verified if $\Delta \le 2\%$ OR $|v_{\text{claimed}} - \hat{v}| \le 0.5$.
- **Recomputation Fidelity Score (RFS):**
  $$RFS = \frac{|Verified|}{|Computable|} \times 100\%$$
- **Speaker Notes:** "We utilize dual relative and absolute tolerances to handle both large financial magnitudes and small decimal proportions."

---

### Slide 8: AST Safety & Security Architecture
- **The Threat:** Malicious code injection (`os.system`, `eval`, `open`) via LLM-synthesized code.
- **The Solution:** Abstract Syntax Tree (AST) validation using a strict whitelist.
- **Inspection Rule:** Any expression containing disallowed built-ins or system calls is terminated prior to evaluation.
- **Speaker Notes:** "Security was a first-class requirement. Our AST guard inspects the expression tree before evaluation, preventing remote code execution."

---

### Slide 9: Experimental Setup & Baselines
- **Benchmark Datasets:** Telco Customer Churn (classification) & Medical Insurance Costs (continuous).
- **Baselines Evaluated:**
  1. Raw LLM (No verification)
  2. Self-Consistency Resampling (SelfCheckGPT proxy)
  3. Semantic Cell Retrieval (FinGround / PCN style)
  4. RecomputeCheck (Proposed method)
- **Speaker Notes:** "We evaluated on paired factual and hallucinated claims against real public tabular datasets."

---

### Slide 10: Benchmark Results & Comparison
- **Empirical Table:**
  - Raw LLM: F1 = 0.00, Coverage = 100%
  - Self-Consistency: F1 = 0.57, Coverage = 100%, Recall = 40%
  - Semantic Cell Retrieval: F1 = 1.00, Coverage = 20%
  - **RecomputeCheck: F1 = 1.00, Coverage = 100%, Recall = 100%**
- **Key Insight:** Cell retrieval collapses to 20% coverage because multi-row aggregations do not exist in single cells.
- **Speaker Notes:** "Notice the retrieval baseline: it achieves precision only on single-cell values, but fails on 80% of claims because aggregations do not exist in raw cells."

---

### Slide 11: Ablation Study
- **Component Evaluated:** Impact of Subgroup Filter Parsing (`churn == 'Yes'`, `smoker == 'yes'`).
- **Results:** Disabling filter parsing dropped computable coverage from 100% to 60%.
- **Conclusion:** Subgroup conditioning is indispensable for real-world business reports.
- **Speaker Notes:** "In our ablation study, removing subgroup filter parsing caused coverage to drop to 60%, showing why linguistic filter resolution is vital."

---

### Slide 12: Failure Case Analysis
- **Taxonomy of Limitations:**
  - Implicit temporal windowing ("in recent periods")
  - Multi-referent pronouns ("their charges")
  - High-cardinality fuzzy column headers
- **Speaker Notes:** "We conducted an honest failure analysis: claims with ambiguous referents or missing date ranges are safely designated Not Computable."

---

### Slide 13: Full-Stack Web Platform
- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion animations.
- **Backend:** Modular Python/FastAPI execution service & Express Node API.
- **Features:** Live CSV upload, instant claim highlighter, code viewer, tolerance adjusters, and exportable PDF audit certificates.
- **Speaker Notes:** "We built a complete, responsive web application that visualizes the claim-by-claim audit in real time."

---

### Slide 14: University Syllabus & Engineering Rigor
- **Software Engineering Standards:** Modular separation of concerns (`backend/`, `ml/`, `evaluation/`, `tests/`).
- **Testing:** 100% passing unit and integration test suite executing via Python standard library.
- **IEEE Formatting:** Fully authored IEEE conference manuscript with mathematical rigor.
- **Speaker Notes:** "The project fulfills all engineering requirements: modular architecture, reproducible unit test suites, and academic documentation."

---

### Slide 15: Future Scope
- Support for SQL databases and multi-table relational joins.
- Fuzzy schema linking for multilingual or non-standard column headers.
- Automatic report rewriting: patching contradicted claims with recomputed values.
- **Speaker Notes:** "In future iterations, we plan to support relational joins across multiple tables and automatic report self-repair."

---

### Slide 16: Conclusion & Q&A
- **Summary:** RecomputeCheck bridges natural language generative reports with deterministic tabular ground truth.
- **Deliverables:** Fully functional website, reproducible experiments, IEEE paper draft, and 50+ viva defense answers.
- **Thank you! Questions and comments are welcome.**
- **Speaker Notes:** "Thank you for your time and attention. I am now open to your questions."
