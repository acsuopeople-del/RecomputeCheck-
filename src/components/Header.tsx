import React from "react";
import { 
  Calculator, 
  BarChart3, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Code2, 
  ShieldCheck 
} from "lucide-react";

export type NavTab = "workbench" | "benchmarks" | "novelty" | "paper" | "viva" | "code";

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  rfsScore?: number | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, rfsScore }) => {
  const tabs = [
    { id: "workbench" as NavTab, label: "Audit Workbench", icon: Calculator, badge: "Live Engine" },
    { id: "benchmarks" as NavTab, label: "Empirical Benchmarks", icon: BarChart3, badge: "4 Baselines" },
    { id: "novelty" as NavTab, label: "Novelty & Literature", icon: BookOpen, badge: "Gate Matrix" },
    { id: "paper" as NavTab, label: "IEEE Paper Draft", icon: FileText, badge: "Manuscript" },
    { id: "viva" as NavTab, label: "Viva Voce & Defense", icon: GraduationCap, badge: "50+ Q&A" },
    { id: "code" as NavTab, label: "Repository Files", icon: Code2, badge: "Modular" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange("workbench")}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-sans">
                  Recompute<span className="text-emerald-600">Check</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  IEEE Research
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Verifying AI-Written Data Reports by Recalculating the Numbers
              </p>
            </div>
          </div>

          {/* Right indicator: RFS badge if available */}
          <div className="flex items-center space-x-3">
            {rfsScore !== undefined && rfsScore !== null && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Last Audit RFS:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  rfsScore >= 80 
                    ? "bg-emerald-100 text-emerald-800" 
                    : rfsScore >= 50 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {rfsScore.toFixed(1)}%
                </span>
              </div>
            )}

            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono">AST Engine Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-100 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? "bg-emerald-200/60 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
