import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentWebApp } from './components/StudentWebApp';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { CodeViewer } from './components/CodeViewer';
import { RestApiTester } from './components/RestApiTester';
import { BusinessRulesInspector } from './components/BusinessRulesInspector';
import { TestingSuite } from './components/TestingSuite';
import { AutoConfigExplainer } from './components/AutoConfigExplainer';
import { TerminalConsole } from './components/TerminalConsole';
import { SubmissionReportModal } from './components/SubmissionReportModal';
import { primaryProject } from './data/springBootProjectData';
import { simulator } from './services/springSimulator';
import { ProjectDefinition, RequestLog, TerminalLog } from './types/project';

export default function App() {
  const currentProject: ProjectDefinition = primaryProject;
  const [activeTab, setActiveTab] = useState<string>('app');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(simulator.getTerminalLogs());

  const handleRequestExecuted = (log: RequestLog) => {
    setTerminalLogs([...simulator.getTerminalLogs()]);
  };

  const handleRestartServer = () => {
    simulator.resetToSample();
    setTerminalLogs([...simulator.getTerminalLogs()]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        currentProject={currentProject}
        onOpenReport={() => setIsReportOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Student Project Meta Banner */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="font-semibold text-slate-800">
              Lab Exercise: <span className="font-normal">Spring Boot Framework (Part 1)</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Architecture: <strong className="text-blue-700">Presentation ➔ Business ➔ Data Access</strong></span>
            <span className="text-slate-300">|</span>
            <span>Database: <strong className="text-emerald-700">H2 In-Memory RDBMS</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800">
              🎓 Submitted by: <strong className="font-bold">Riddhi Kasliwal</strong> • B.Tech CSE
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'app' && (
          <StudentWebApp onRequestExecuted={handleRequestExecuted} />
        )}

        {activeTab === 'overview' && (
          <ArchitectureDiagram
            project={currentProject}
            onNavigateToApiTester={() => setActiveTab('api-tester')}
          />
        )}

        {activeTab === 'api-tester' && (
          <RestApiTester
            project={currentProject}
            onRequestExecuted={handleRequestExecuted}
          />
        )}

        {activeTab === 'code' && <CodeViewer project={currentProject} />}

        {activeTab === 'business-rules' && (
          <BusinessRulesInspector
            project={currentProject}
            onNavigateToTester={() => setActiveTab('api-tester')}
          />
        )}

        {activeTab === 'testing' && <TestingSuite project={currentProject} />}

        {activeTab === 'autoconfig' && <AutoConfigExplainer />}

        {activeTab === 'terminal' && (
          <TerminalConsole
            logs={terminalLogs}
            onRestartServer={handleRestartServer}
          />
        )}
      </main>

      {/* Academic Submission Modal */}
      <SubmissionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        project={currentProject}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          <div>
            <strong>AarogyaCare Spring Boot Project</strong> • Activity: Design & Develop Basic Spring Boot Application
            <span className="ml-2 font-medium text-slate-700">• Student: Riddhi Kasliwal (B.Tech CSE)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
              📄 View Lab Report
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
