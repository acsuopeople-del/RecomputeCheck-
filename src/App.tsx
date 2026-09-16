import React, { useState } from "react";
import { Header, NavTab } from "./components/Header";
import { AuditWorkbench } from "./components/AuditWorkbench";
import { BenchmarkViewer } from "./components/BenchmarkViewer";
import { NoveltyMatrix } from "./components/NoveltyMatrix";
import { IeeePaperViewer } from "./components/IeeePaperViewer";
import { VivaDefensePortal } from "./components/VivaDefensePortal";
import { CodebaseExplorer } from "./components/CodebaseExplorer";
import { ShieldCheck, GraduationCap, Github } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("workbench");
  const [lastRfsScore, setLastRfsScore] = useState<number | null>(75.0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        rfsScore={lastRfsScore}
      />

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "workbench" && <AuditWorkbench />}
        {activeTab === "benchmarks" && <BenchmarkViewer />}
        {activeTab === "novelty" && <NoveltyMatrix />}
        {activeTab === "paper" && <IeeePaperViewer />}
        {activeTab === "viva" && <VivaDefensePortal />}
        {activeTab === "code" && <CodebaseExplorer />}
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">RecomputeCheck</span>
            <span>— Post-Hoc Deterministic Tabular Verification Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-500">
              Department of Computer Science & Engineering • Final Year Capstone & IEEE Track
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] border border-emerald-200">
              Python 3.10+ / TS / AST-Safe
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
