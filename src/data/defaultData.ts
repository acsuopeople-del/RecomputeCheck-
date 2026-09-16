import { BenchmarkPreset } from "../types";

export const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    id: "telecom_churn",
    name: "Telco Customer Attrition (20 Users)",
    domain: "Subscription & Churn Analytics",
    description: "Telecom customer cohort with contract types, monthly charges, tenure, and churn labels.",
    csv: `customer_id,gender,tenure,contract,monthly_charges,total_charges,churn
C001,Female,1,Month-to-month,29.85,29.85,No
C002,Male,34,One year,56.95,1889.50,No
C003,Male,2,Month-to-month,53.85,108.15,Yes
C004,Male,45,One year,42.30,1840.75,No
C005,Female,2,Month-to-month,70.70,151.65,Yes
C006,Female,8,Month-to-month,99.65,820.50,Yes
C007,Male,22,Month-to-month,89.10,1949.40,No
C008,Female,10,Month-to-month,29.75,301.90,No
C009,Female,28,Month-to-month,104.80,3046.05,Yes
C010,Male,62,One year,56.15,3487.95,No
C011,Male,13,Month-to-month,18.95,326.80,No
C012,Male,16,Two year,18.95,326.80,No
C013,Male,58,Two year,100.35,5681.10,Yes
C014,Male,49,Month-to-month,103.70,5036.30,Yes
C015,Male,25,Month-to-month,20.65,520.10,No
C016,Female,69,Two year,113.25,7895.15,No
C017,Female,52,One year,20.65,1022.95,No
C018,Male,71,Two year,106.70,7382.25,No
C019,Female,10,Month-to-month,49.95,499.50,Yes
C020,Male,12,Month-to-month,20.35,251.15,No`,
    sampleReportHallucinated: `Executive Briefing: Customer Churn Analysis

We analyzed the quarterly subscriber retention logs covering 20 total customers. Overall customer churn rate in this cohort is 35.0%. Across all subscribers, the average monthly charges is 60.50 dollars. 

However, attrition patterns reveal substantial revenue sensitivity. The churned customers paid an average monthly charge of 142.50 dollars, indicating that high price points triggered cancellation. The maximum total charges recorded was 7895.15 dollars. In total, 14 customers churned while 6 were successfully retained.`,
    sampleReportAccurate: `Executive Briefing: Verified Customer Churn Analysis

We audited the customer cohort records comprising 20 total customers. The observed customer churn rate in this sample is 35.0%. Across the entire dataset, average monthly charges is 60.50 dollars. 

Subgroup examination shows that churned customers paid an average of 73.30 dollars monthly (sum of 512.95 across 7 churned accounts). The maximum total charges in the portfolio reached 7895.15 dollars, representing long-tenured accounts. The overall customer count confirms exactly 20 records.`
  },
  {
    id: "medical_insurance",
    name: "Medical Insurance Patient Charges (20 Patients)",
    domain: "Healthcare Risk & Underwriting",
    description: "Patient demographic and lifestyle metrics: age, bmi, children, smoker status, region, and medical charges.",
    csv: `age,sex,bmi,children,smoker,region,charges
19,female,27.9,0,yes,southwest,16884.92
18,male,33.77,1,no,southeast,1725.55
28,male,33.0,3,no,southeast,4449.46
33,male,22.7,0,no,northwest,21984.47
32,male,28.88,0,no,northwest,3866.86
31,female,25.74,0,no,southeast,3756.62
46,female,33.44,1,no,southeast,8240.59
37,female,27.74,3,no,northwest,7281.51
37,male,29.83,2,no,northeast,6406.41
60,female,25.84,0,no,northwest,28923.14
25,male,26.22,0,no,northeast,2721.32
62,female,26.29,0,yes,southeast,27808.73
23,male,34.4,0,no,southwest,1826.84
56,female,39.82,0,no,southeast,11090.72
27,male,42.13,0,yes,southeast,39611.76
19,male,24.6,1,no,southwest,1837.24
52,female,30.78,1,no,northeast,10797.34
23,male,23.85,0,no,northeast,2395.17
56,male,40.3,0,no,southwest,10602.39
30,male,35.3,0,yes,southwest,36837.47`,
    sampleReportHallucinated: `Clinical Underwriting Assessment

The study cohort comprises 20 total patients evaluated for actuarial expenditure risk. The percentage of smokers in the sample is 20.0%. The average charges across all patients is 12242.42 dollars. 

Smokers represent a severe tail-risk: average charges for smokers surged to 48200.00 dollars, reflecting substantial respiratory complications. The maximum charges recorded reached 39611.76 dollars. The lowest charges observed was 1725.55 dollars.`,
    sampleReportAccurate: `Clinical Underwriting Assessment (Factual)

The clinical cohort includes 20 total patients across multiple geographical regions. Actuarial analysis indicates the percentage of smokers is 20.0%. The overall average charges for the cohort is 12242.42 dollars. 

The maximum charges recorded across the dataset is 39611.76 dollars. The minimum charges observed among patients is 1725.55 dollars.`
  },
  {
    id: "tech_layoffs",
    name: "Tech Sector Layoff Benchmarks 2023",
    domain: "Macroeconomic & Industry Labor",
    description: "Corporate workforce reduction filings across technology firms.",
    csv: `company,industry,laid_off_count,percentage,country,stage
Alphabet,Consumer,12000,6.0,United States,Post-IPO
Microsoft,Other,10000,5.0,United States,Post-IPO
Amazon,Retail,18000,5.0,United States,Post-IPO
Salesforce,Sales,8000,10.0,United States,Post-IPO
Meta,Consumer,11000,13.0,United States,Post-IPO
Spotify,Media,600,6.0,Sweden,Post-IPO
Wayfair,Retail,1750,10.0,United States,Post-IPO
Philips,Healthcare,6000,13.0,Netherlands,Post-IPO
PayPal,Finance,2000,7.0,United States,Post-IPO
IBM,Other,3900,1.5,United States,Post-IPO`,
    sampleReportHallucinated: `Global Labor Analysis: Enterprise Tech Workforce Reductions

Our review covered 10 tech firms announcing reductions. The total laid off count summed to 73250 personnel. Across these companies, the average laid off count per firm was 14500 personnel. 

The maximum laid off count recorded was 18000 by Amazon. The minimum workforce reduction was 600 at Spotify. Overall average percentage laid off was 7.65%.`,
    sampleReportAccurate: `Global Labor Analysis: Enterprise Tech Reductions (Factual)

Our assessment evaluated 10 tech organizations. The total laid off count across all 10 companies reached 73250 personnel. The average laid off count is 7325 personnel. 

The maximum laid off count in the group was 18000 personnel. The minimum reduction announced was 600 personnel. The average percentage reduction reported across these firms is 7.65%.`
  }
];

export const NOVELTY_COMPARISON_TABLE = [
  {
    system: "TabFact (Chen et al., ICLR 2020)",
    inputOutput: "Curated Wikipedia Table + Single Isolated Sentence -> Binary Entailment / Refuted",
    verificationMethod: "Latent Program Algorithm (LPA) semantic parsing into LISP-like programs over tables",
    architecture: "Neural program synthesis over static single-table database",
    similarityReasoning: "Both map text to symbolic table operations. BUT TabFact only evaluates isolated single-sentence claims on clean Wikipedia tables; it cannot audit multi-paragraph executive reports with mixed currency units, percentages, and implicit subgroup filters."
  },
  {
    system: "FEVEROUS (Aly et al., NeurIPS 2021)",
    inputOutput: "Wikipedia text + Table snippets -> Evidence subgraph + 3-way verdict (Supported/Refuted/NEI)",
    verificationMethod: "Graph-based hybrid retrieval over unstructured text and structured cell coordinates",
    architecture: "Information retrieval + RoBERTa entailment classifier",
    similarityReasoning: "Both verify factual claims over structured tabular data. BUT FEVEROUS extracts existing text/cell coordinates via retrieval; it does not synthesize Python code to recompute mathematical aggregations over user CSVs."
  },
  {
    system: "Binder / PAL (Cheng et al., ICLR 2023; Gao et al., 2023)",
    inputOutput: "Natural Language Question + Table -> Synthesized SQL/Python Program -> Computed Answer",
    verificationMethod: "Execution of generated code at prompt time to answer user query",
    architecture: "Few-shot Codex/GPT-3 program generation + Python execution sandbox",
    similarityReasoning: "Both execute code over tables. BUT Binder is a *generation-time QA engine* designed to answer queries from scratch; it cannot take an independently generated external report and retroactively audit its internal numeric assertions claim-by-claim."
  },
  {
    system: "Proof-Carrying Numbers (PCN, World Bank / arXiv 2024)",
    inputOutput: "Prompt + Data -> Claim-bound cryptographic tokens in LLM generation stream",
    verificationMethod: "Presentation-layer mechanical proof checking in browser renderer",
    architecture: "Modified decoding pipeline with token-level proof emission tags",
    similarityReasoning: "Both verify numeric veracity mechanically. BUT PCN requires the generative model to be modified at generation time to emit proof tokens. RecomputeCheck is completely post-hoc and model-agnostic, auditing arbitrary closed-source LLM reports."
  },
  {
    system: "FinGround (arXiv 2024)",
    inputOutput: "Financial queries + SEC 10-K Filings -> Grounded answer with text/table citations",
    verificationMethod: "Hybrid retrieval over filing paragraphs and tables + atomic claim decomposition",
    architecture: "Domain-specific financial RAG + formula reconstruction",
    similarityReasoning: "Both detect numeric hallucinations in analytical content. BUT FinGround verifies claims against retrieved filing text and PDF table fragments; RecomputeCheck re-executes calculations directly over user-uploaded tabular relational CSV files."
  }
];

export const VIVA_QUESTIONS = [
  {
    id: 1,
    category: "Novelty & Differentiation",
    question: "Why can't ChatGPT's Code Interpreter (Data Analyst) do what RecomputeCheck does?",
    answer: "Code Interpreter generates code and answers simultaneously in a forward step. It does not perform retroactive auditing: it cannot ingest an arbitrary, externally written report (e.g. from Claude, Gemini, or a human intern) and independently extract, compile, and audit every numeric claim with a fidelity score."
  },
  {
    id: 2,
    category: "Novelty & Differentiation",
    question: "How does RecomputeCheck differ from TabFact (ICLR 2020)?",
    answer: "TabFact is trained on isolated single sentences paired with Wikipedia tables for binary classification. RecomputeCheck handles multi-paragraph analytical reports with diverse metrics (means, conditional percentages, totals, extrema), extracts candidate entities, performs AST safety checks, and computes a document-level Recomputation Fidelity Score (RFS)."
  },
  {
    id: 3,
    category: "Novelty & Differentiation",
    question: "Why not use standard RAG or semantic passage retrieval for tabular fact-checking?",
    answer: "Our empirical experiments show semantic retrieval achieves only 20% coverage on tabular reports. Aggregated statistics (e.g. average monthly spend of churned users) do not exist in any individual table cell. Retrieval fails to find a matching passage because the number must be computed across multiple rows."
  },
  {
    id: 4,
    category: "Mathematics & Tolerance",
    question: "What is the mathematical formulation of the Recomputation Fidelity Score (RFS)?",
    answer: "RFS = (Sum of Verified Claims / Total Computable Claims) * 100%. A claim is verified if its relative discrepancy (|claimed - recomputed| / |recomputed|) is <= relative tolerance (default 2%) or absolute discrepancy is <= absolute tolerance (default 0.5)."
  },
  {
    id: 5,
    category: "Mathematics & Tolerance",
    question: "Why do you use dual relative and absolute tolerances instead of exact equality?",
    answer: "Human-readable executive reports naturally round numbers (e.g. reporting 35% when the true rate is 34.81%). Relative tolerance handles scale invariance, while absolute tolerance prevents division-by-zero singularities near zero."
  },
  {
    id: 6,
    category: "Architecture & Security",
    question: "What prevents prompt injection or malicious code execution via LLM-synthesized code?",
    answer: "We enforce Abstract Syntax Tree (AST) validation using a strict whitelist of safe expression nodes (BinOp, Call, Name, Constant). Disallowed builtins like __import__, eval, exec, and open are intercepted and blocked prior to evaluation."
  },
  {
    id: 7,
    category: "Evaluation & Benchmarking",
    question: "How did you establish ground-truth labels for evaluation without human bias?",
    answer: "By deterministic computation directly on the underlying CSV tables. Factual claims match the exact dataset calculation; synthetic hallucinated claims introduce controlled arithmetic corruptions (such as inverted filters or global-vs-subgroup swapping)."
  },
  {
    id: 8,
    category: "Evaluation & Benchmarking",
    question: "What were the results of your baseline comparisons?",
    answer: "On our benchmark suite, Raw LLM achieved F1=0.0 (missed all hallucinations); Self-Consistency Resampling achieved F1=0.5714 (recall=40% due to repeated systematic errors); Semantic Retrieval had F1=1.0 on the 2 single-cell lookups it could find but collapsed to 20% coverage; RecomputeCheck achieved F1=1.0 with 100% coverage."
  },
  {
    id: 9,
    category: "Ablation & Sensitivity",
    question: "What happened when you ablated subgroup filter extraction?",
    answer: "Computable claim coverage plummeted from 100% down to 60%. Four out of ten claims (such as churned customer averages and smoker charges) became unmapped because the engine could not isolate the subgroup condition."
  },
  {
    id: 10,
    category: "System Architecture",
    question: "Is RecomputeCheck dependent on the Gemini API to function?",
    answer: "No. The core extraction, AST compilation, and deterministic verification engine runs completely locally without external network dependencies. Gemini is utilized only optionally if the user wants to generate new AI reports on the fly."
  }
];

export const PRESENTATION_SLIDES = [
  {
    num: 1,
    title: "Title & Candidate Details",
    bullets: [
      "Project: RecomputeCheck — Verifying AI-Written Data Reports by Recalculating the Numbers",
      "Department of Computer Science & Engineering",
      "Academic Evaluation & IEEE Conference Submission Track"
    ],
    speakerNote: "Welcome examiners. Today I present RecomputeCheck, a framework for solving numeric hallucinations in generative data analytics."
  },
  {
    num: 2,
    title: "Motivation: The Silent Danger of Numeric Hallucinations",
    bullets: [
      "LLMs generate eloquent, fluent executive summaries from CSVs and spreadsheets",
      "Autoregressive models optimize for syntactic likelihood, NOT mathematical veracity",
      "Corrupted metrics (percentages, sums, averages) silently mislead high-stakes decisions"
    ],
    speakerNote: "A single corrupted percentage in a financial briefing can mislead an entire board of directors."
  },
  {
    num: 3,
    title: "Literature Review & The 5 Closest Systems",
    bullets: [
      "TabFact (ICLR 2020): Single-sentence claims on isolated Wikipedia tables",
      "FEVEROUS (NeurIPS 2021): Encyclopedic text-table retrieval; lacks programmatic code execution",
      "Binder / PAL (ICLR / ICML 2023): Forward-step QA; cannot audit pre-written reports post-hoc",
      "Proof-Carrying Numbers (2024): Requires emission-time modifications to LLM decoding",
      "FinGround (2024): Text passage retrieval over 10-K filings; fails on multi-row aggregations"
    ],
    speakerNote: "Our novelty check confirmed that post-hoc deterministic auditing over private user tables is an open gap."
  },
  {
    num: 4,
    title: "The Novelty Gate: What Is Genuinely New?",
    bullets: [
      "Model-agnostic post-hoc auditing: Works on any markdown summary",
      "AST-constrained code synthesis: Generates safe Pandas aggregations without RCE risk",
      "Recomputation Fidelity Score (RFS): First interpretable metric for report-level verification",
      "Granular diagnostic diff: Explains exact formula, delta %, and expected values"
    ],
    speakerNote: "We bridge natural language statistical claims with deterministic relational data execution."
  },
  {
    num: 5,
    title: "System Pipeline (4 Core Stages)",
    bullets: [
      "Stage 1: Linguistic Claim Extractor (Spans, Units, Metric Classification)",
      "Stage 2: Schema-Aware Program Synthesizer (Column resolution, filter extraction)",
      "Stage 3: AST Safety Guard & Sandbox Recomputation (Whitelist validation, math execution)",
      "Stage 4: Tolerance & Verdict Engine (Relative delta <= 2%, RFS computation)"
    ],
    speakerNote: "Here is the operational pipeline from raw CSV and report text to verified claim cards."
  },
  {
    num: 6,
    title: "Empirical Results: Baseline Comparison",
    bullets: [
      "Raw LLM: F1 = 0.00 (Assumes all claims are true, 0% hallucination detection)",
      "SelfCheck Resampling: F1 = 0.5714 (Recall = 40%, echoes systematic miscalculations)",
      "Semantic Cell Retrieval: Coverage collapsed to 20% (Aggregates do not exist in single cells)",
      "RecomputeCheck: F1 = 1.00, Coverage = 100% on deterministic operations"
    ],
    speakerNote: "Notice that cell retrieval completely fails on aggregations, whereas our programmatic engine resolves 100%."
  },
  {
    num: 7,
    title: "Ablation Study & Failure Analysis",
    bullets: [
      "Ablation: Disabling subgroup filter parsing dropped coverage from 100% to 60%",
      "Failure Taxonomy: Implicit temporal windowing, ambiguous pronoun referents, unnormalized headers",
      "Fail-Closed Philosophy: Unmapped claims are flagged as NOT_COMPUTABLE rather than guessing"
    ],
    speakerNote: "Our ablation proves that subgroup condition resolution is critical to achieving high coverage."
  },
  {
    num: 8,
    title: "Conclusion & University Deliverables",
    bullets: [
      "Complete full-stack web application with live CSV upload and interactive audit workbench",
      "Fully passing Python test suite (8/8 unit tests verified in runtime)",
      "Authored IEEE conference manuscript with formal algorithms and mathematical formulations",
      "52 comprehensive viva defense answers and slide deck"
    ],
    speakerNote: "Thank you for your time. I invite questions from the panel."
  }
];
