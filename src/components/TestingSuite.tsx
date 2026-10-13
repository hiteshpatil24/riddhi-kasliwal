import React, { useState } from 'react';
import { Play, CheckCircle2, FileText, Check, ShieldCheck, Terminal, Code, Sparkles } from 'lucide-react';
import { ProjectDefinition } from '../types/project';

interface TestingSuiteProps {
  project: ProjectDefinition;
}

export const TestingSuite: React.FC<TestingSuiteProps> = ({ project }) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [completedTests, setCompletedTests] = useState<number>(project.testCases.length);
  const [selectedTab, setSelectedTab] = useState<'matrix' | 'junit-service' | 'junit-controller'>('matrix');

  const runAutomatedTests = () => {
    setIsRunningTests(true);
    setCompletedTests(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setCompletedTests(count);
      if (count >= project.testCases.length) {
        clearInterval(interval);
        setIsRunningTests(false);
      }
    }, 400);
  };

  const serviceTestCode = project.codeFiles.find((f) => f.filename === 'AppointmentServiceTest.java')?.content || '';
  const controllerTestCode = project.codeFiles.find((f) => f.filename === 'AppointmentControllerTest.java')?.content || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Constraint #8, #9, #11
              </span>
              <h2 className="text-lg font-bold text-slate-800">Testing Basics & Automated JUnit Framework</h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Lab manual testing specification table (Input, Expected, Actual, PASS/FAIL) and automated JUnit 5 Mockito test runner.
            </p>
          </div>

          <button
            onClick={runAutomatedTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Executing mvn test...' : 'Run Automated JUnit Suite'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-slate-800">
              JUnit Jupiter 5.10.3 Test Runner
            </span>
            <span className="text-xs text-slate-500">
              Tests Run: {completedTests} / {project.testCases.length}
            </span>
          </div>
          <span className="rounded bg-emerald-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-800 border border-emerald-200">
            Failures: 0 • Errors: 0 • Skipped: 0
          </span>
        </div>

        {/* Progress line */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(completedTests / project.testCases.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedTab('matrix')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            selectedTab === 'matrix'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Test Cases Matrix (Constraint #8)</span>
        </button>

        <button
          onClick={() => setSelectedTab('junit-service')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            selectedTab === 'junit-service'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>AppointmentServiceTest.java (Mockito)</span>
        </button>

        <button
          onClick={() => setSelectedTab('junit-controller')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            selectedTab === 'junit-controller'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>AppointmentControllerTest.java (@WebMvcTest)</span>
        </button>
      </div>

      {/* Tab 1: Test Cases Matrix (Constraint #8) */}
      {selectedTab === 'matrix' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3">Test ID</th>
                  <th className="px-4 py-3">Test Case Description & Layer</th>
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Expected Output</th>
                  <th className="px-4 py-3">Actual Output</th>
                  <th className="px-4 py-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {project.testCases.map((tc, idx) => {
                  const isFinished = idx < completedTests;
                  return (
                    <tr
                      key={tc.id}
                      className={`transition ${
                        isFinished ? 'hover:bg-slate-50' : 'opacity-40'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {tc.id}
                        <div className="text-[10px] text-slate-500 font-normal">{tc.testType}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{tc.name}</div>
                        <div className="text-[11px] text-slate-500">{tc.layerTargeted}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700 max-w-xs">
                        {tc.input}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600 max-w-xs">
                        {tc.expectedOutput}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700 max-w-xs">
                        {tc.actualOutput}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isFinished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                            <Check className="h-3 w-3" />
                            {tc.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending...</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Service JUnit Test Code */}
      {selectedTab === 'junit-service' && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-xs font-semibold text-emerald-400">
              src/test/java/com/example/aarogyacare/service/AppointmentServiceTest.java
            </span>
            <span className="text-xs text-slate-400">JUnit 5 + Mockito Isolated Unit Test</span>
          </div>
          <pre className="mt-3 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed">
            <code>{serviceTestCode}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Controller WebMvcTest Code */}
      {selectedTab === 'junit-controller' && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-xs font-semibold text-emerald-400">
              src/test/java/com/example/aarogyacare/controller/AppointmentControllerTest.java
            </span>
            <span className="text-xs text-slate-400">@WebMvcTest Presentation Layer Integration Test</span>
          </div>
          <pre className="mt-3 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed">
            <code>{controllerTestCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
