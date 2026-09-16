import React, { useState } from "react";
import { Code2, Copy, Check, FileCode, Folder } from "lucide-react";

interface RepoFile {
  path: string;
  category: "ML Engine" | "Backend API" | "Experiments" | "Tests" | "Docs & Paper";
  description: string;
  content: string;
}

const REPO_FILES: RepoFile[] = [
  {
    path: "ml/verifier.py",
    category: "ML Engine",
    description: "Core verification engine with AST safety whitelist and dual tolerance evaluation.",
    content: `"""
Deterministic Tabular Recomputation Engine with AST Safety Constraints.
Evaluates mathematical expressions over pandas-like table structures.
"""
import ast
from typing import Dict, Any, List, Optional
from evaluation.metrics import ToleranceConfig, Verdict, evaluate_verdict, compute_recomputation_fidelity_score

class SafeASTValidator(ast.NodeVisitor):
    ALLOWED_NODES = {
        ast.Expression, ast.BinOp, ast.UnaryOp, ast.Num, ast.Constant,
        ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow,
        ast.USub, ast.UAdd, ast.Compare, ast.Eq, ast.NotEq, ast.Lt, ast.LtE,
        ast.Gt, ast.GtE, ast.Call, ast.Name, ast.Load, ast.Subscript, ast.Index,
        ast.Attribute, ast.List, ast.Dict, ast.Str, ast.keyword, ast.alias
    }
    FORBIDDEN_NAMES = {
        "__import__", "eval", "exec", "compile", "open", "input",
        "globals", "locals", "vars", "dir", "getattr", "setattr", "delattr",
        "system", "popen", "spawn", "fork", "subprocess", "shutil", "socket"
    }

    def validate(self, expr_str: str) -> bool:
        try:
            tree = ast.parse(expr_str, mode='eval')
        except SyntaxError:
            return False
        for node in ast.walk(tree):
            if type(node) not in self.ALLOWED_NODES:
                return False
            if isinstance(node, ast.Name) and node.id in self.FORBIDDEN_NAMES:
                return False
        return True
`
  },
  {
    path: "ml/extractor.py",
    category: "ML Engine",
    description: "Regex & NLP claim extraction engine identifying numeric values, units, metrics, and filters.",
    content: `"""
Linguistic Claim Extractor: Extracts numeric claims, units, and matches against table schema.
"""
import re
from typing import List, Dict, Any, Optional

METRIC_KEYWORDS = {
    "mean": ["average", "mean", "avg"],
    "percentage": ["percentage", "percent", "%", "rate", "share", "proportion"],
    "sum": ["total", "sum", "combined", "aggregate"],
    "max": ["maximum", "highest", "peak", "max"],
    "min": ["minimum", "lowest", "least", "min"],
    "median": ["median"],
    "count": ["count", "number of", "records", "cases", "customers", "patients"]
}
`
  },
  {
    path: "backend/main.py",
    category: "Backend API",
    description: "FastAPI REST API service providing /api/audit, /api/extract-claims, and health checks.",
    content: `"""
FastAPI Backend Service for RecomputeCheck.
Exposes endpoints for claim extraction, expression synthesis, and execution.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI(title="RecomputeCheck API", version="1.0.0")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "RecomputeCheck"}
`
  },
  {
    path: "tests/test_verifier.py",
    category: "Tests",
    description: "Unit tests verifying AST safety, relative tolerance, percentage metrics, and AST rejection.",
    content: `"""
Unit test suite for RecomputeCheck verifier and AST safety validator.
"""
import unittest
from ml.verifier import SafeASTValidator, TableContainer, RecomputeVerifier, ClaimItem

class TestSafeASTValidator(unittest.TestCase):
    def setUp(self):
        self.validator = SafeASTValidator()

    def test_safe_arithmetic(self):
        self.assertTrue(self.validator.validate("df['charges'].mean()"))

    def test_block_os_system(self):
        self.assertFalse(self.validator.validate("__import__('os').system('ls')"))
`
  },
  {
    path: "experiments/run_benchmarks.py",
    category: "Experiments",
    description: "Automated empirical benchmark runner comparing Raw LLM, SelfCheckGPT, Retrieval, and RecomputeCheck.",
    content: `"""
Benchmark Runner for RecomputeCheck Empirical Evaluation.
Compares Proposed System against 3 Baselines + Ablation Study.
"""
import json
import pandas as pd
from ml.verifier import RecomputeVerifier, ClaimItem
from evaluation.metrics import evaluate_system_predictions, format_latex_table
`
  }
];

export const CodebaseExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(REPO_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2 pb-2">
          <Code2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">
            Source Code Architecture & File Explorer
          </h2>
        </div>
        <p className="text-xs text-slate-600 max-w-3xl">
          Inspect and review the modular implementation files directly in your browser. All code adheres strictly to separation of concerns, AST security bounds, and testability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3 text-emerald-700">
            Project Modules
          </span>

          <div className="space-y-1">
            {REPO_FILES.map((f) => {
              const isSelected = selectedFile.path === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="truncate font-mono">{f.path}</span>
                  </div>
                  <span className="text-[10px] uppercase font-sans font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                    {f.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {selectedFile.path}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed grow">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
