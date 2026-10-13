import { Patient, Appointment, RequestLog, TerminalLog } from '../types/project';

// Initial In-Memory State representing H2 Database Tables
const initialPatients: Patient[] = [
  {
    id: 1,
    fullName: 'Ramesh Kulkarni',
    email: 'ramesh.kulkarni@example.in',
    phone: '+919820123456',
    dateOfBirth: '1958-04-12', // 68 years old -> Senior Citizen 20% concession applies!
    bloodGroup: 'O+',
    emergencyStatus: false,
    registeredAt: '2026-10-01T09:30:00Z',
  },
  {
    id: 2,
    fullName: 'Ananya Joshi',
    email: 'ananya.joshi@example.in',
    phone: '+919876543210',
    dateOfBirth: '2000-11-20', // 25 years old
    bloodGroup: 'A+',
    emergencyStatus: true, // Emergency status -> 20% priority discount applies!
    registeredAt: '2026-10-05T14:15:00Z',
  },
  {
    id: 3,
    fullName: 'Suresh Patil',
    email: 'suresh.patil@example.in',
    phone: '+919811223344',
    dateOfBirth: '1988-06-30', // 38 years old -> Standard rate
    bloodGroup: 'B+',
    emergencyStatus: false,
    registeredAt: '2026-10-08T11:20:00Z',
  },
];

const initialAppointments: Appointment[] = [
  {
    id: 101,
    patientId: 1,
    patientName: 'Ramesh Kulkarni',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'Cardiology',
    appointmentDateTime: '2026-10-15T10:00:00',
    status: 'CONFIRMED',
    reasonForVisit: 'Hypertension follow-up and blood pressure check',
    consultationFee: 500.0,
    discountedFee: 400.0,
    appliedDiscountReason: 'Senior Citizen Care Concession (20% Discount for Age 68)',
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Ananya Joshi',
    doctorName: 'Dr. Sunita Deshmukh',
    department: 'General Medicine & Triage',
    appointmentDateTime: '2026-10-16T15:00:00',
    status: 'CONFIRMED',
    reasonForVisit: 'Severe migraine and acute dehydration',
    consultationFee: 600.0,
    discountedFee: 480.0,
    appliedDiscountReason: 'Emergency Triage Concession (20% Priority Relief)',
  },
];

export class SpringBootSimulator {
  private patients: Patient[] = [...initialPatients];
  private appointments: Appointment[] = [...initialAppointments];
  private nextPatientId = 4;
  private nextAppointmentId = 103;
  private terminalLogs: TerminalLog[] = [];
  private requestHistory: RequestLog[] = [];

  constructor() {
    this.bootBanner();
  }

  private bootBanner() {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 23);
    this.terminalLogs = [
      {
        id: 'boot-1',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'c.e.a.AarogyaCareApplication',
        message: 'Starting AarogyaCareApplication v0.0.1-SNAPSHOT using Java 17.0.12 with PID 48201',
      },
      {
        id: 'boot-2',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.b.w.e.t.TomcatWebServer',
        message: 'Tomcat initialized with port 8080 (http)',
      },
      {
        id: 'boot-3',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'o.a.c.c.StandardService',
        message: 'Starting service [Tomcat]',
      },
      {
        id: 'boot-4',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.w.c.s.AnnotationConfigServletWebServerApplicationContext',
        message: 'Root WebApplicationContext: initialization completed in 1284 ms',
      },
      {
        id: 'boot-5',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'com.zaxxer.hikari.HikariDataSource',
        message: 'HikariPool-1 - Starting... url=jdbc:h2:mem:aarogyacaredb user=sa',
      },
      {
        id: 'boot-6',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'com.zaxxer.hikari.HikariDataSource',
        message: 'HikariPool-1 - Added connection conn0: url=jdbc:h2:mem:aarogyacaredb',
      },
      {
        id: 'boot-7',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'org.hibernate.jpa.internal.util.LogHelper',
        message: 'HHH000204: Processing PersistenceUnitInfo [name: default]',
      },
      {
        id: 'boot-8',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'org.hibernate.orm.connections.pooling',
        message: 'HHH10001005: Database info: H2 2.2.224, dialect: org.hibernate.dialect.H2Dialect',
      },
      {
        id: 'boot-9',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform',
        message: 'HHH000490: Using JtaPlatform implementation: NoJtaPlatform',
      },
      {
        id: 'boot-10',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.b.a.e.w.EndpointLinksResolver',
        message: 'Exposing 1 endpoint beneath base path "/actuator"',
      },
      {
        id: 'boot-11',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'o.s.b.w.e.t.TomcatWebServer',
        message: 'Tomcat started on port 8080 (http) with context path \'\'',
      },
      {
        id: 'boot-12',
        timestamp: now,
        level: 'INFO',
        thread: 'main',
        logger: 'c.e.a.AarogyaCareApplication',
        message: 'Started AarogyaCareApplication in 2.314 seconds (process running for 2.89)',
      },
    ];
  }

  public getTerminalLogs(): TerminalLog[] {
    return this.terminalLogs;
  }

  public getRequestHistory(): RequestLog[] {
    return this.requestHistory;
  }

  public getPatients(): Patient[] {
    return [...this.patients];
  }

  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  private addLog(level: 'INFO' | 'WARN' | 'ERROR', logger: string, message: string) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 23);
    this.terminalLogs.push({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: now,
      level,
      thread: 'http-nio-8080-exec-1',
      logger,
      message,
    });
  }

  // =========================================================================
  // PRESENTATION LAYER -> BUSINESS LAYER -> DATA ACCESS LAYER SIMULATION
  // =========================================================================

  public executeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): { status: number; body: any; log: RequestLog } {
    const startTime = performance.now();
    const traceSteps: RequestLog['traceSteps'] = [];

    // Step 1: Client -> Presentation Layer
    traceSteps.push({
      layer: 'Client',
      component: 'HTTP Client / Browser',
      action: `${method} ${endpoint}`,
      detail: `Inbound HTTP request dispatched to port 8080. Headers: Accept=application/json`,
      durationMs: 3,
    });

    let statusCode = 200;
    let responseData: any = null;

    try {
      if (endpoint === '/api/v1/patients' && method === 'GET') {
        traceSteps.push({
          layer: 'Controller',
          component: 'PatientController.java',
          action: 'getAllPatients()',
          detail: '@GetMapping invoked. Controller receives request and calls PatientRepository.findAll()',
          durationMs: 4,
        });

        traceSteps.push({
          layer: 'Repository',
          component: 'PatientRepository (Spring Data JPA)',
          action: 'findAll()',
          detail: 'Executing derived SQL query on H2 datasource: SELECT * FROM patients',
          durationMs: 7,
        });

        traceSteps.push({
          layer: 'Database',
          component: 'H2 Database Engine',
          action: 'SELECT QUERY',
          detail: `Returned ${this.patients.length} rows from in-memory table 'patients'`,
          durationMs: 2,
        });

        responseData = this.patients;
        statusCode = 200;
        this.addLog('INFO', 'c.e.a.c.PatientController', `GET /api/v1/patients - returned ${this.patients.length} records`);
      } else if (endpoint === '/api/v1/patients' && method === 'POST') {
        traceSteps.push({
          layer: 'Controller',
          component: 'PatientController.java',
          action: 'registerPatient(@Valid @RequestBody Patient patient)',
          detail: 'Spring MVC Jackson deserializes JSON and validates @NotBlank, @Email, @Pattern annotations',
          durationMs: 5,
        });

        // Validation Check
        if (!body || !body.fullName || !body.email || !body.phone || !body.dateOfBirth) {
          statusCode = 400;
          responseData = {
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Validation Failed',
            fieldErrors: {
              fullName: !body?.fullName ? 'Patient full name is mandatory' : undefined,
              email: !body?.email ? 'Email is mandatory' : undefined,
              phone: !body?.phone ? 'Phone number is mandatory' : undefined,
            },
          };
          this.addLog('WARN', 'c.e.a.c.PatientController', 'POST /api/v1/patients validation failed (400 Bad Request)');
        } else {
          const newPatient: Patient = {
            id: this.nextPatientId++,
            fullName: body.fullName,
            email: body.email,
            phone: body.phone,
            dateOfBirth: body.dateOfBirth,
            bloodGroup: body.bloodGroup || 'O+',
            emergencyStatus: Boolean(body.emergencyStatus),
            registeredAt: new Date().toISOString(),
          };

          traceSteps.push({
            layer: 'Repository',
            component: 'PatientRepository (Spring Data JPA)',
            action: 'save(newPatient)',
            detail: 'Persisting entity state into H2 database context',
            durationMs: 6,
          });

          traceSteps.push({
            layer: 'Database',
            component: 'H2 Database Engine',
            action: 'INSERT INTO patients',
            detail: `INSERT INTO patients (id, full_name, email, ...) VALUES (${newPatient.id}, '${newPatient.fullName}', ...)`,
            durationMs: 3,
          });

          this.patients.push(newPatient);
          responseData = newPatient;
          statusCode = 201;
          this.addLog('INFO', 'c.e.a.c.PatientController', `Registered new patient ID=${newPatient.id} ('${newPatient.fullName}')`);
        }
      } else if (endpoint === '/api/v1/appointments' && method === 'GET') {
        traceSteps.push({
          layer: 'Controller',
          component: 'AppointmentController.java',
          action: 'getAllAppointments()',
          detail: 'Controller receives request and delegates directly to AppointmentService.getAllAppointments()',
          durationMs: 4,
        });

        traceSteps.push({
          layer: 'Service',
          component: 'AppointmentServiceImpl.java',
          action: 'getAllAppointments()',
          detail: 'Business layer queries AppointmentRepository and maps entities to AppointmentResponseDTO',
          durationMs: 5,
        });

        traceSteps.push({
          layer: 'Repository',
          component: 'AppointmentRepository',
          action: 'findAll()',
          detail: 'SELECT a.*, p.full_name FROM appointments a JOIN patients p ON a.patient_id = p.id',
          durationMs: 6,
        });

        traceSteps.push({
          layer: 'Database',
          component: 'H2 In-Memory DB',
          action: 'SQL ResultSet',
          detail: `Fetched ${this.appointments.length} appointment entities`,
          durationMs: 2,
        });

        responseData = this.appointments;
        statusCode = 200;
        this.addLog('INFO', 'c.e.a.c.AppointmentController', `GET /api/v1/appointments - ${this.appointments.length} records returned`);
      } else if (endpoint === '/api/v1/appointments' && method === 'POST') {
        traceSteps.push({
          layer: 'Controller',
          component: 'AppointmentController.java',
          action: 'scheduleAppointment(@Valid @RequestBody DTO)',
          detail: 'Controller validates DTO presence and delegates IMMEDIATELY to AppointmentService (No business logic here!)',
          durationMs: 4,
        });

        const patientId = Number(body?.patientId);
        const patient = this.patients.find((p) => p.id === patientId);

        if (!patient) {
          statusCode = 404;
          responseData = {
            timestamp: new Date().toISOString(),
            status: 404,
            error: 'Not Found',
            message: `Patient not found with ID: ${body?.patientId}`,
          };
          this.addLog('WARN', 'c.e.a.s.AppointmentServiceImpl', `Patient not found ID=${body?.patientId}`);
        } else {
          traceSteps.push({
            layer: 'Service',
            component: 'AppointmentServiceImpl.java',
            action: 'scheduleAppointment() - Evaluation of Business Rules',
            detail: 'Executing business validation: 1) Slot conflict & lead time, 2) Max quota cap, 3) Senior / Emergency concession',
            durationMs: 8,
          });

          // BUSINESS RULE 1: Slot Conflict Check (within 30 mins with same doctor)
          const targetTime = new Date(body.appointmentDateTime || Date.now() + 86400000).getTime();
          const doctorName = body.doctorName || 'Dr. Rajesh Sharma';

          traceSteps.push({
            layer: 'Repository',
            component: 'AppointmentRepository',
            action: 'existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(...)',
            detail: `Querying active consultations for doctor '${doctorName}' between targetSlot ± 30min`,
            durationMs: 5,
          });

          const conflict = this.appointments.find((a) => {
            if (a.doctorName.toLowerCase() !== doctorName.toLowerCase()) return false;
            if (a.status === 'CANCELLED') return false;
            const existingTime = new Date(a.appointmentDateTime).getTime();
            const diffMinutes = Math.abs(targetTime - existingTime) / (1000 * 60);
            return diffMinutes < 30;
          });

          if (conflict) {
            statusCode = 409;
            responseData = {
              timestamp: new Date().toISOString(),
              status: 409,
              error: 'Business Rule Violation',
              message: `Doctor ${doctorName} already has a consultation scheduled within 30 minutes of this time slot (Conflict with Appointment #${conflict.id}).`,
              violatedRule: 'BR-01 (Doctor Slot Collision Guard)',
            };
            this.addLog(
              'ERROR',
              'c.e.a.s.AppointmentServiceImpl',
              `BusinessRuleViolationException: Doctor ${doctorName} has overlapping slot at ${body.appointmentDateTime}`
            );
          } else {
            // BUSINESS RULE 3: Max 3 active appointments per patient
            const activeCount = this.appointments.filter(
              (a) => a.patientId === patient.id && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
            ).length;

            if (activeCount >= 3) {
              statusCode = 400;
              responseData = {
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Business Rule Violation',
                message: 'Patient has reached the maximum quota of 3 active scheduled appointments.',
                violatedRule: 'BR-03 (Slot Hoarding Guard)',
              };
              this.addLog(
                'ERROR',
                'c.e.a.s.AppointmentServiceImpl',
                `BusinessRuleViolationException: Patient ID=${patient.id} exceeded active quota (${activeCount}/3)`
              );
            } else {
              // BUSINESS RULE 2: Senior Citizen (60+) / Emergency Triage Concession
              const birthYear = new Date(patient.dateOfBirth).getFullYear();
              const currentYear = new Date().getFullYear();
              const calculatedAge = currentYear - birthYear;
              const baseFee = Number(body.consultationFee) || 500.0;
              let discountedFee = baseFee;
              let concessionNote = 'Standard Consultation Tariff (₹)';
              let initialStatus: 'SCHEDULED' | 'CONFIRMED' = 'SCHEDULED';

              if (patient.emergencyStatus) {
                discountedFee = Math.round(baseFee * 0.8 * 100) / 100;
                concessionNote = 'Emergency Triage Concession (20% Priority Relief)';
                initialStatus = 'CONFIRMED';
              } else if (calculatedAge >= 60) {
                discountedFee = Math.round(baseFee * 0.8 * 100) / 100;
                concessionNote = `Senior Citizen Care Concession (20% Discount for Age ${calculatedAge})`;
                initialStatus = 'CONFIRMED';
              }

              const newAppointment: Appointment = {
                id: this.nextAppointmentId++,
                patientId: patient.id,
                patientName: patient.fullName,
                doctorName: doctorName,
                department: body.department || 'General Medicine',
                appointmentDateTime: body.appointmentDateTime || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
                status: initialStatus,
                reasonForVisit: body.reasonForVisit || 'General Clinical Consultation',
                consultationFee: baseFee,
                discountedFee: discountedFee,
                appliedDiscountReason: concessionNote,
              };

              traceSteps.push({
                layer: 'Repository',
                component: 'AppointmentRepository',
                action: 'save(appointment)',
                detail: `Persisting Appointment ID=${newAppointment.id} with fee=₹${discountedFee} (applied rule: ${concessionNote})`,
                durationMs: 5,
              });

              traceSteps.push({
                layer: 'Database',
                component: 'H2 In-Memory DB',
                action: 'INSERT INTO appointments',
                detail: `INSERT INTO appointments (id, patient_id, doctor_name, status, discounted_fee) VALUES (${newAppointment.id}, ${patient.id}, '${doctorName}', '${initialStatus}', ${discountedFee})`,
                durationMs: 3,
              });

              this.appointments.push(newAppointment);
              responseData = newAppointment;
              statusCode = 201;
              this.addLog(
                'INFO',
                'c.e.a.s.AppointmentServiceImpl',
                `Successfully scheduled Appointment #${newAppointment.id} for ${patient.fullName}. Fee: ₹${discountedFee} [${concessionNote}]`
              );
            }
          }
        }
      } else if (endpoint.startsWith('/api/v1/appointments/') && endpoint.endsWith('/cancel') && method === 'PUT') {
        const parts = endpoint.split('/');
        const id = Number(parts[4]);
        const appt = this.appointments.find((a) => a.id === id);

        traceSteps.push({
          layer: 'Controller',
          component: 'AppointmentController.java',
          action: `cancelAppointment(@PathVariable id=${id})`,
          detail: 'Delegating cancellation request to AppointmentService.cancelAppointment(id)',
          durationMs: 4,
        });

        if (!appt) {
          statusCode = 404;
          responseData = { timestamp: new Date().toISOString(), status: 404, message: `Appointment not found with ID ${id}` };
        } else {
          traceSteps.push({
            layer: 'Service',
            component: 'AppointmentServiceImpl.java',
            action: 'cancelAppointment() - Cancellation Policy Check',
            detail: 'Verifying cancellation lead time (> 1 hour before scheduled consultation)',
            durationMs: 5,
          });

          appt.status = 'CANCELLED';
          responseData = {
            id: appt.id,
            status: 'CANCELLED',
            message: 'Appointment successfully cancelled. The doctor slot is now released.',
          };
          statusCode = 200;
          this.addLog('INFO', 'c.e.a.s.AppointmentServiceImpl', `Cancelled appointment ID=${appt.id}`);
        }
      } else {
        statusCode = 404;
        responseData = { error: 'Not Found', message: `No mapped handler for [${method} ${endpoint}]` };
      }
    } catch (err: any) {
      statusCode = 500;
      responseData = { error: 'Internal Server Error', message: err?.message || 'Server error' };
      this.addLog('ERROR', 'c.e.a.e.GlobalExceptionHandler', `Exception handled: ${err?.message}`);
    }

    const durationMs = Math.round(performance.now() - startTime);

    const log: RequestLog = {
      id: 'req-' + Date.now(),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status: statusCode,
      durationMs,
      traceSteps,
      responseBody: responseData,
    };

    this.requestHistory.unshift(log);
    if (this.requestHistory.length > 30) this.requestHistory.pop();

    return { status: statusCode, body: responseData, log };
  }

  public resetToSample() {
    this.patients = [...initialPatients];
    this.appointments = [...initialAppointments];
    this.nextPatientId = 4;
    this.nextAppointmentId = 103;
    this.bootBanner();
  }
}

export const simulator = new SpringBootSimulator();
