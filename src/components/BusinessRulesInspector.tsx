import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Code, ArrowRight, Play, Check } from 'lucide-react';
import { ProjectDefinition } from '../types/project';
import { simulator } from '../services/springSimulator';

interface BusinessRulesInspectorProps {
  project: ProjectDefinition;
  onNavigateToTester: () => void;
}

export const BusinessRulesInspector: React.FC<BusinessRulesInspectorProps> = ({
  project,
  onNavigateToTester,
}) => {
  const [testResult, setTestResult] = useState<Record<string, any>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const runRuleTest = (ruleId: string) => {
    setTestingId(ruleId);
    setTimeout(() => {
      let res;
      if (ruleId === 'BR-01') {
        // Trigger conflict
        res = simulator.executeRequest('POST', '/api/v1/appointments', {
          patientId: 3,
          doctorName: 'Dr. Rajesh Sharma',
          department: 'Cardiology',
          appointmentDateTime: '2026-10-15T10:15:00', // within 15 mins of existing 10:00 booking!
          consultationFee: 500.0,
          reasonForVisit: 'Testing physician conflict guard',
        });
      } else if (ruleId === 'BR-02') {
        // Trigger Senior Citizen 20% Discount
        res = simulator.executeRequest('POST', '/api/v1/appointments', {
          patientId: 1, // Ramesh Kulkarni, age 68
          doctorName: 'Dr. Sunita Deshmukh',
          department: 'General Medicine',
          appointmentDateTime: '2026-10-22T09:00:00',
          consultationFee: 500.0,
          reasonForVisit: 'Testing senior citizen 20% fee concession',
        });
      } else {
        // BR-03: Max quota
        res = simulator.executeRequest('POST', '/api/v1/appointments', {
          patientId: 1,
          doctorName: 'Dr. Amit Verma',
          department: 'Orthopaedics',
          appointmentDateTime: '2026-10-25T14:00:00',
          consultationFee: 500.0,
          reasonForVisit: 'Fourth booking test',
        });
      }

      setTestResult((prev) => ({ ...prev, [ruleId]: res }));
      setTestingId(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            Constraint #6 & Submission #9
          </span>
          <h2 className="text-lg font-bold text-slate-800">Business Rules in the Service Layer</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Strict requirement: All validation formulas, conflict algorithms, and concession rules reside in <code className="text-blue-700 font-semibold">AppointmentServiceImpl.java</code>. The Controller must never contain business logic.
        </p>
      </div>

      {/* Architectural Justification Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-blue-700" />
          <span>Why Business Logic MUST NOT be placed in the Controller:</span>
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 text-xs text-slate-700">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <span className="font-bold text-slate-800">1. Single Responsibility Principle</span>
            <p className="mt-1 text-slate-600 text-[11px]">
              Controllers handle HTTP serialization and routing. Services handle domain rules.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <span className="font-bold text-slate-800">2. Atomic Transactions</span>
            <p className="mt-1 text-slate-600 text-[11px]">
              <code className="text-blue-700">@Transactional</code> boundaries are managed at the Service level for automatic rollback.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <span className="font-bold text-slate-800">3. Isolated Unit Testing</span>
            <p className="mt-1 text-slate-600 text-[11px]">
              Services can be tested in milliseconds via JUnit 5 + Mockito without booting a mock web container.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Cards */}
      <div className="space-y-4">
        {project.businessRules.map((rule) => {
          const res = testResult[rule.id];
          const isRunning = testingId === rule.id;

          return (
            <div
              key={rule.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs font-bold text-blue-800 border border-blue-200">
                    {rule.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{rule.name}</h3>
                    <span className="text-[11px] text-slate-500">
                      Layer: Service Layer • {rule.summary}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => runRuleTest(rule.id)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Evaluating...' : 'Test This Rule Live'}</span>
                </button>
              </div>

              {/* Rule Explanation */}
              <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                {rule.details}
              </div>

              {/* Java Implementation Code Snippet */}
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 p-3">
                <div className="flex items-center justify-between pb-1 text-[11px] font-mono text-slate-400 border-b border-slate-800">
                  <span>AppointmentServiceImpl.java</span>
                  <span className="text-emerald-400 font-semibold">Service Layer Implementation</span>
                </div>
                <pre className="mt-2 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{rule.codeSnippet}</code>
                </pre>
              </div>

              {/* Execution Feedback if tested */}
              {res && (
                <div className="mt-3 rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-semibold text-slate-800">Execution Result:</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        res.status === 201 || res.status === 200
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      HTTP {res.status}
                    </span>
                  </div>
                  <pre className="mt-2 font-mono text-[11px] text-slate-800 overflow-x-auto">
                    {JSON.stringify(res.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
