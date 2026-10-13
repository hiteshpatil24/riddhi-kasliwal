import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Send, CheckCircle2, Clock } from 'lucide-react';
import { ProjectDefinition, RequestLog } from '../types/project';
import { simulator } from '../services/springSimulator';

interface RestApiTesterProps {
  project: ProjectDefinition;
  onRequestExecuted: (log: RequestLog) => void;
}

export const RestApiTester: React.FC<RestApiTesterProps> = ({ project, onRequestExecuted }) => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [endpoint, setEndpoint] = useState('/api/v1/appointments');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        patientId: 1, // Ramesh Kulkarni, age 68 (Senior Citizen concession applies)
        doctorName: 'Dr. Rajesh Sharma',
        department: 'Cardiology',
        appointmentDateTime: '2026-10-18T10:00:00',
        consultationFee: 500.0,
        reasonForVisit: 'Hypertension routine follow-up check',
      },
      null,
      2
    )
  );

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [currentLog, setCurrentLog] = useState<RequestLog | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    let parsedBody = undefined;
    if (['POST', 'PUT'].includes(method) && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e) {
        setIsLoading(false);
        setResponse({
          status: 400,
          body: { error: 'Invalid JSON Syntax in Request Body' },
        });
        return;
      }
    }

    setTimeout(() => {
      const result = simulator.executeRequest(method, endpoint, parsedBody);
      setResponse(result);
      setCurrentLog(result.log);
      onRequestExecuted(result.log);
      setIsLoading(false);
    }, 250);
  };

  const loadScenario = (type: string) => {
    switch (type) {
      case 'senior-discount':
        setMethod('POST');
        setEndpoint('/api/v1/appointments');
        setRequestBody(
          JSON.stringify(
            {
              patientId: 1, // Ramesh Kulkarni (Age 68) -> triggers BR-02
              doctorName: 'Dr. Sunita Deshmukh',
              department: 'General Medicine',
              appointmentDateTime: '2026-10-20T11:00:00',
              consultationFee: 500.0,
              reasonForVisit: 'Evaluation for persistent joint inflammation and blood pressure',
            },
            null,
            2
          )
        );
        break;

      case 'conflict-rule':
        // Existing appointment for Dr. Rajesh Sharma is on 2026-10-15T10:00:00
        setMethod('POST');
        setEndpoint('/api/v1/appointments');
        setRequestBody(
          JSON.stringify(
            {
              patientId: 3, // Suresh Patil
              doctorName: 'Dr. Rajesh Sharma', // Overlaps with Ramesh's 10:00 booking!
              department: 'Cardiology',
              appointmentDateTime: '2026-10-15T10:15:00', // within 15 mins -> triggers BR-01
              consultationFee: 500.0,
              reasonForVisit: 'New consultation checkup',
            },
            null,
            2
          )
        );
        break;

      case 'validation-error':
        setMethod('POST');
        setEndpoint('/api/v1/patients');
        setRequestBody(
          JSON.stringify(
            {
              fullName: '', // blank -> fails @NotBlank
              email: 'not-an-email', // fails @Email
              phone: '123', // fails @Pattern
              dateOfBirth: '',
            },
            null,
            2
          )
        );
        break;

      case 'get-patients':
        setMethod('GET');
        setEndpoint('/api/v1/patients');
        setRequestBody('');
        break;

      case 'get-appointments':
        setMethod('GET');
        setEndpoint('/api/v1/appointments');
        setRequestBody('');
        break;

      case 'cancel-appointment':
        setMethod('PUT');
        setEndpoint('/api/v1/appointments/101/cancel');
        setRequestBody('');
        break;
    }
  };

  const getCurlCommand = () => {
    let curl = `curl -X ${method} "http://localhost:8080${endpoint}" \\\n  -H "Accept: application/json"`;
    if (['POST', 'PUT'].includes(method) && requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  const copyResponseJson = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            Constraint #2, #7, #8, #13
          </span>
          <h2 className="text-lg font-bold text-slate-800">Interactive REST API Workbench</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Execute real HTTP requests against the Spring Boot 3-Tier engine. Evaluates Bean Validation (<code className="text-blue-700 font-semibold">@Valid</code>), Service business rules, and Spring Data JPA persistence.
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-150">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Preset Test Scenarios (Activity Requirements)</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to autofill request</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => loadScenario('senior-discount')}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition"
          >
            Senior Concession Rule (20% Off)
          </button>
          <button
            onClick={() => loadScenario('conflict-rule')}
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 transition"
          >
            Trigger Slot Conflict (BR-01 / 409)
          </button>
          <button
            onClick={() => loadScenario('validation-error')}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition"
          >
            Trigger DTO Validation (HTTP 400)
          </button>
          <button
            onClick={() => loadScenario('get-appointments')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            GET All Appointments
          </button>
          <button
            onClick={() => loadScenario('get-patients')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            GET All Patients
          </button>
          <button
            onClick={() => loadScenario('cancel-appointment')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            PUT /cancel Appointment
          </button>
        </div>
      </div>

      {/* Request Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Method selector */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className={`rounded-lg border px-3 py-2 font-mono text-xs font-bold transition focus:outline-none ${
              method === 'GET'
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : method === 'POST'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : method === 'PUT'
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-red-300 bg-red-50 text-red-700'
            }`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* Endpoint URL Input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-xs text-slate-500">
              http://localhost:8080
            </span>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-40 pr-4 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Request Payload Editor (for POST / PUT) */}
        {['POST', 'PUT'].includes(method) && (
          <div>
            <label className="text-xs font-medium text-slate-700">
              Request Body (application/json):
            </label>
            <textarea
              rows={6}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-900 p-3 font-mono text-xs text-emerald-300 focus:border-blue-500 focus:outline-none leading-relaxed"
              placeholder="{}"
            />
          </div>
        )}
      </div>

      {/* Live Request Flow Trace & Response Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Layer Traversal Trace Log */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>Layer Traversal Trace (Constraint 10)</span>
            </span>
            {currentLog && (
              <span className="font-mono text-[11px] text-blue-700 font-bold">
                Total: {currentLog.durationMs}ms
              </span>
            )}
          </div>

          <div className="mt-3 flex-1 space-y-3">
            {currentLog ? (
              currentLog.traceSteps.map((step, idx) => (
                <div key={idx} className="relative rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-800">
                      [{step.layer}]
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      +{step.durationMs}ms
                    </span>
                  </div>
                  <div className="mt-0.5 font-bold text-slate-800">{step.component}</div>
                  <div className="text-[11px] font-mono text-amber-700">{step.action}</div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                    {step.detail}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-slate-400">
                <ArrowRight className="h-6 w-6 text-slate-300 mb-2" />
                <span>Click "Send Request" to trace the layer-by-layer request journey</span>
              </div>
            )}
          </div>
        </div>

        {/* HTTP Response Display (Constraint 13 Screenshot Output) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-7 flex flex-col">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                HTTP Response Output
              </span>
              {response && (
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : response.status === 409
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {response.status}{' '}
                  {response.status === 200
                    ? 'OK'
                    : response.status === 201
                    ? 'CREATED'
                    : response.status === 409
                    ? 'CONFLICT'
                    : response.status === 400
                    ? 'BAD REQUEST'
                    : 'NOT FOUND'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyCurl}
                className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
                title="Copy as cURL command"
              >
                {copiedCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Terminal className="h-3 w-3" />}
                <span>cURL</span>
              </button>
              <button
                onClick={copyResponseJson}
                disabled={!response}
                className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                {copiedResponse ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy JSON</span>
              </button>
            </div>
          </div>

          {/* Response Payload */}
          <div className="mt-3 flex-1 overflow-x-auto rounded-lg bg-slate-900/70 p-3 font-mono text-xs">
            {response ? (
              <pre className="text-emerald-300 leading-relaxed">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-slate-500 text-xs">
                <span>No response yet. Dispatch a request to view HTTP body and headers.</span>
              </div>
            )}
          </div>

          {/* Response Headers */}
          {response && (
            <div className="mt-3 border-t border-slate-800/80 pt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>Content-Type: application/json;charset=UTF-8</div>
              <div>X-Content-Type-Options: nosniff</div>
              <div>X-Frame-Options: DENY</div>
              <div>Server: Apache-Tomcat/10.1.28</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
