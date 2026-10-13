import React from 'react';
import { FileText, Server } from 'lucide-react';
import { ProjectDefinition } from '../types/project';

interface NavbarProps {
  currentProject: ProjectDefinition;
  onOpenReport: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  onOpenReport,
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'app', label: '🏥 Clinic Portal (Live Web App)' },
    { id: 'overview', label: '📐 3-Tier Architecture' },
    { id: 'code', label: '💻 Java Code (Spring Boot)' },
    { id: 'business-rules', label: '⚖️ Business Rules (Service Layer)' },
    { id: 'testing', label: '🧪 JUnit 5 Tests' },
    { id: 'api-tester', label: '🔌 REST API Workbench' },
    { id: 'autoconfig', label: '⚙️ Spring Auto-Config' },
    { id: 'terminal', label: '🖥️ Spring Boot Terminal' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white shadow-sm">
      {/* Top Academic Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-blue-700 bg-blue-600 text-white font-bold font-mono text-base shadow-sm">
            ACC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Aarogya Care Clinic
              </h1>
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                Spring Boot 3.3.4 • Java 17
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>B.Tech CSE Mini-Project (Part 1)</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-800">
                Student: <strong>Riddhi Kasliwal</strong> (Roll No: 21BCSE042)
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Clinic OPD Badge */}
          <div className="flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Aarogya Care OPD System</span>
          </div>

          {/* Server Status Badge */}
          <div className="hidden items-center gap-1.5 rounded border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700 md:flex">
            <Server className="h-3.5 w-3.5 text-slate-600" />
            <span className="font-mono text-[11px]">Tomcat :8080 | H2 In-Memory</span>
          </div>

          {/* Academic Lab Report Modal Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 rounded border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95 shadow-sm"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>📄 View Lab Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex space-x-1 overflow-x-auto px-4 py-1.5 scrollbar-none lg:px-6 bg-slate-50/70">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
