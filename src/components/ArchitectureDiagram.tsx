import React, { useState } from 'react';
import { Layers, ArrowRight, Database, Server, CheckCircle2, Play, Activity, Sparkles, ShieldCheck, Cpu } from 'lucide-react';
import { ProjectDefinition } from '../types/project';

interface ArchitectureDiagramProps {
  project: ProjectDefinition;
  onNavigateToApiTester: () => void;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ project, onNavigateToApiTester }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const steps = [
    {
      num: 1,
      layer: 'Client / Consumer',
      component: 'Web / Mobile / Postman',
      color: 'blue',
      description: 'Dispatches HTTP request (POST /api/v1/appointments) with JSON payload and authorization headers.',
      codeSample: `POST /api/v1/appointments HTTP/1.1\nContent-Type: application/json\n\n{\n  "patientId": 1,\n  "doctorName": "Dr. Rajesh Sharma",\n  "appointmentDateTime": "2026-10-15T10:00:00",\n  "consultationFee": 500.0\n}`,
    },
    {
      num: 2,
      layer: 'Presentation Layer',
      component: '@RestController (AppointmentController)',
      color: 'amber',
      description: 'Handles HTTP requests, deserializes JSON, triggers @Valid bean validation, and delegates directly to Service. No business logic!',
      codeSample: `@PostMapping\npublic ResponseEntity<AppointmentResponseDTO> scheduleAppointment(\n        @Valid @RequestBody AppointmentRequestDTO requestDTO) {\n    AppointmentResponseDTO response = appointmentService.scheduleAppointment(requestDTO);\n    return new ResponseEntity<>(response, HttpStatus.CREATED);\n}`,
    },
    {
      num: 3,
      layer: 'Business Layer',
      component: '@Service (AppointmentServiceImpl)',
      color: 'emerald',
      description: 'Core heart of the application: Implements Business Rule 1 (Slot Conflict), Rule 2 (Senior Citizen 20% Concession), and Rule 3 (Active Quota).',
      codeSample: `// Business Rules evaluated here:\n1. Check overlapping slots: existsByDoctorNameAndDateTimeBetween(...)\n2. Check quota cap: countByPatientIdAndStatusIn(...) < 3\n3. Calculate senior discount: if (age >= 60) fee * 0.80`,
    },
    {
      num: 4,
      layer: 'Data Access Layer',
      component: '@Repository (AppointmentRepository)',
      color: 'purple',
      description: 'Spring Data JPA interface extending JpaRepository<Appointment, Long>. Spring generates proxy SQL implementation automatically.',
      codeSample: `@Repository\npublic interface AppointmentRepository extends JpaRepository<Appointment, Long> {\n    boolean existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(...);\n    long countByPatientIdAndStatusIn(Long patientId, List<AppointmentStatus> statuses);\n}`,
    },
    {
      num: 5,
      layer: 'Database Layer',
      component: 'H2 In-Memory RDBMS',
      color: 'cyan',
      description: 'Auto-configured embedded relational database (jdbc:h2:mem:aarogyacaredb) executing SQL statements and maintaining referential integrity.',
      codeSample: `INSERT INTO appointments (id, patient_id, doctor_name, status, discounted_fee)\nVALUES (101, 1, 'Dr. Rajesh Sharma', 'CONFIRMED', 400.0);`,
    },
  ];

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setActiveStep(current);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setActiveStep(null);
        }, 1500);
      }
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Constraint #4 & #10
              </span>
              <h2 className="text-lg font-bold text-slate-800">Three-Tier Architecture & Request Flow</h2>
            </div>
            <p className="mt-1 max-w-3xl text-xs text-slate-600">
              Spring Boot strictly decouples presentation protocols from business rules and persistence.
              The request traverses cleanly: <strong className="text-blue-700">Client ➔ Controller ➔ Service ➔ Repository ➔ H2 Database</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Play className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Tracing Flow...' : 'Animate Flow'}</span>
            </button>
            <button
              onClick={onNavigateToApiTester}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <span>Test Live Endpoints</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Architecture Flow Blocks */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, idx) => {
            const isCurrent = activeStep === idx;
            const isPassed = activeStep !== null && activeStep > idx;

            return (
              <div
                key={s.num}
                onClick={() => setActiveStep(idx)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/30'
                    : isPassed
                    ? 'border-slate-300 bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isPassed
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPassed ? '✓' : s.num}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Tier {s.num}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    {s.layer}
                  </h3>
                  <div className="mt-0.5 font-mono text-xs font-bold text-slate-800">
                    {s.component}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600 line-clamp-3">
                    {s.description}
                  </p>
                </div>

                {isCurrent && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                    <Activity className="h-3 w-3 animate-pulse" />
                    <span>Executing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Tier Deep-Dive */}
        {activeStep !== null && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/50 p-4 transition-all">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-200 px-2 py-0.5 font-mono text-xs font-semibold text-blue-900">
                  Step {steps[activeStep].num}: {steps[activeStep].layer}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {steps[activeStep].component}
                </span>
              </div>
              <button
                onClick={() => setActiveStep(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-700">{steps[activeStep].description}</p>
            <div className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 font-mono text-xs text-emerald-300">
              <pre>{steps[activeStep].codeSample}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Layer Responsibility Matrix */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Presentation Layer Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <Server className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 text-sm">1. Presentation Layer</h3>
          </div>
          <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            Controller Component (@RestController)
          </span>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            The entry point for HTTP communication. Annotations like <code className="text-amber-800 font-semibold">@RestController</code> and <code className="text-amber-800 font-semibold">@RequestMapping</code> bind URL paths.
          </p>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Validates request payload structure (<code className="text-blue-700">@Valid</code>)</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Delegates 100% to Service (Never executes SQL)</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Returns <code className="text-blue-700">ResponseEntity&lt;T&gt;</code> with standard HTTP status codes (200, 201, 400, 404, 409)</span>
            </div>
            <div className="flex items-start gap-1.5 text-red-700 pt-1 font-medium text-[11px]">
              <span>Constraint: Must NOT contain business rules or direct SQL.</span>
            </div>
          </div>
        </div>

        {/* Business Layer Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <Cpu className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 text-sm">2. Business Layer</h3>
          </div>
          <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            Service Component (@Service)
          </span>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            The heart of the application logic. Annotated with <code className="text-emerald-800 font-semibold">@Service</code> and <code className="text-emerald-800 font-semibold">@Transactional</code>.
          </p>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Rule 1</strong>: Double-booking guard (no doctor overlap within 30 min)</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Rule 2</strong>: Senior citizen (60+) / emergency 20% discount</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span><strong>Rule 3</strong>: Max 3 active pending appointments per patient</span>
            </div>
          </div>
        </div>

        {/* Data Access Layer Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <Database className="h-5 w-5" />
            <h3 className="font-bold text-slate-800 text-sm">3. Data Access Layer</h3>
          </div>
          <span className="mt-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
            Repository Component (@Repository)
          </span>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Persists and retrieves entities. Extends <code className="text-purple-800 font-semibold">JpaRepository&lt;T, Long&gt;</code>.
          </p>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Provides CRUD: <code className="text-purple-700">save()</code>, <code className="text-purple-700">findById()</code>, <code className="text-purple-700">findAll()</code></span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Derived query methods generate SQL from method names automatically</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Translates SQL exceptions to Spring DataAccessException</span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Entities Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
              Constraint #5: Domain Modeling
            </span>
            <h3 className="mt-1 text-sm font-bold text-slate-800">Identified Domain Entities (2 Classes)</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Mapped with JPA Annotations</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {project.domainEntities.map((entity) => (
            <div key={entity.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-mono text-xs font-bold text-blue-700">
                  @Entity public class {entity.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {entity.attributes.length} attributes
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{entity.description}</p>
              
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-1">Attribute</th>
                      <th className="py-1">Type</th>
                      <th className="py-1">Constraints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-mono text-slate-700">
                    {entity.attributes.map((attr) => (
                      <tr key={attr.name}>
                        <td className="py-1 text-blue-700 font-semibold">{attr.name}</td>
                        <td className="py-1 text-slate-700">{attr.type}</td>
                        <td className="py-1 text-slate-500">{attr.constraints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
