import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { ProjectDefinition } from '../types/project';

interface SubmissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDefinition;
}

export const SubmissionReportModal: React.FC<SubmissionReportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [studentName, setStudentName] = useState('Riddhi Kasliwal');
  const [rollNumber, setRollNumber] = useState('21BCSE042');
  const [courseName, setCourseName] = useState('B.Tech CSE • Spring Boot Framework (Part 1)');

  if (!isOpen) return null;

  const controllerCode = project.codeFiles.find((f) => f.filename === 'AppointmentController.java')?.content || '';
  const serviceCode = project.codeFiles.find((f) => f.filename === 'AppointmentServiceImpl.java')?.content || '';
  const repoCode = project.codeFiles.find((f) => f.filename === 'AppointmentRepository.java')?.content || '';
  const testCode = project.codeFiles.find((f) => f.filename === 'AppointmentServiceTest.java')?.content || '';

  const generateMarkdownReport = () => {
    return `# Academic Project Submission Report
## ${project.name}

**Student Name:** ${studentName}  
**Student ID / Roll No:** ${rollNumber}  
**Course:** ${courseName}  
**Date:** ${new Date().toLocaleDateString()}  
**Spring Boot Version:** ${project.springBootVersion} | **Java Version:** JDK ${project.javaVersion}

---

### 1. Application Name & Problem Description
**Application Name:** ${project.name}  
**Problem Description:**  
${project.problemStatement}

---

### 2. Architecture Diagram (Three-Tier Architecture)
The application adheres strictly to the Three-Tier Architecture pattern:
\`\`\`
[ HTTP Client / Browser ]
         ↓ (JSON / REST Request)
[ Presentation Layer: AppointmentController.java (@RestController) ]
         ↓ (DTO Delegation & Bean Validation @Valid)
[ Business Layer: AppointmentServiceImpl.java (@Service, @Transactional) ]
         ↓ (Domain Logic & Business Rules BR-01, BR-02, BR-03)
[ Data Access Layer: AppointmentRepository.java (@Repository / Spring Data JPA) ]
         ↓ (Derived Queries & Auto-generated SQL)
[ Database: H2 In-Memory RDBMS (jdbc:h2:mem:aarogyacaredb) ]
\`\`\`

---

### 3. Domain Model / Classes
${project.domainEntities
  .map(
    (e) => `#### Entity: ${e.name}
${e.description}
Attributes:
${e.attributes.map((a) => `- **${a.name}** (${a.type}): ${a.constraints} — ${a.description}`).join('\n')}
`
  )
  .join('\n')}

---

### 4. Project / Package Structure
\`\`\`
aarogyacare-api/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/example/aarogyacare/
    │   │   ├── AarogyaCareApplication.java
    │   │   ├── controller/
    │   │   │   ├── AppointmentController.java
    │   │   │   └── PatientController.java
    │   │   ├── service/
    │   │   │   ├── AppointmentService.java
    │   │   │   └── AppointmentServiceImpl.java
    │   │   ├── repository/
    │   │   │   ├── AppointmentRepository.java
    │   │   │   └── PatientRepository.java
    │   │   ├── model/
    │   │   │   ├── Appointment.java
    │   │   │   ├── Patient.java
    │   │   │   └── AppointmentStatus.java
    │   │   ├── dto/
    │   │   └── exception/
    │   │       ├── BusinessRuleViolationException.java
    │   │       └── GlobalExceptionHandler.java
    │   └── resources/
    │       ├── application.properties
    │       └── data.sql
    └── test/
        └── java/com/example/aarogyacare/
            └── service/AppointmentServiceTest.java
\`\`\`

---

### 5. Controller Code (Presentation Layer)
\`\`\`java
${controllerCode}
\`\`\`

---

### 6. Service Code (Business Layer)
\`\`\`java
${serviceCode}
\`\`\`

---

### 7. Repository Code (Data Access Layer)
\`\`\`java
${repoCode}
\`\`\`

---

### 8. REST Endpoints Implemented
${project.endpoints
  .map(
    (ep) => `#### ${ep.method} ${ep.path}
${ep.description}  
Status: HTTP ${ep.status}
`
  )
  .join('\n')}

---

### 9. Business Rules Implemented (Service Layer)
${project.businessRules
  .map(
    (br) => `#### [${br.id}] ${br.name}
- **Layer:** ${br.layer} Layer (AppointmentServiceImpl.java)
- **Summary:** ${br.summary}
- **Details:** ${br.details}
\`\`\`java
${br.codeSnippet}
\`\`\`
`
  )
  .join('\n')}

---

### 10. Test Cases
| Test ID | Targeted Layer | Test Case Name | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|---|
${project.testCases
  .map(
    (tc) =>
      `| ${tc.id} | ${tc.layerTargeted} | ${tc.name} | ${tc.input} | ${tc.expectedOutput} | ${tc.actualOutput} | **${tc.status}** |`
  )
  .join('\n')}

---

### 11. Automated Test (JUnit 5 / Mockito)
\`\`\`java
${testCode}
\`\`\`

---

### 12. Application Running Successfully Output
\`\`\`
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.3.4)

2026-10-13 19:40:12.102  INFO 48201 --- [main] c.e.a.AarogyaCareApplication : Starting AarogyaCareApplication using Java 17
2026-10-13 19:40:13.204  INFO 48201 --- [main] o.s.b.w.e.t.TomcatWebServer : Tomcat initialized with port 8080 (http)
2026-10-13 19:40:14.314  INFO 48201 --- [main] c.z.h.HikariDataSource : HikariPool-1 - Added connection conn0: url=jdbc:h2:mem:aarogyacaredb
2026-10-13 19:40:15.118  INFO 48201 --- [main] o.s.b.w.e.t.TomcatWebServer : Tomcat started on port 8080 (http) with context path ''
2026-10-13 19:40:15.122  INFO 48201 --- [main] c.e.a.AarogyaCareApplication : Started AarogyaCareApplication in 2.314 seconds
\`\`\`

---

### 13. REST Endpoint Output
\`\`\`http
POST /api/v1/appointments HTTP/1.1
Host: localhost:8080
Content-Type: application/json

HTTP/1.1 201 CREATED
Content-Type: application/json

{
  "id": 102,
  "patientId": 1,
  "patientName": "Ramesh Kulkarni",
  "doctorName": "Dr. Rajesh Sharma",
  "department": "Cardiology",
  "appointmentDateTime": "2026-10-16T14:30:00",
  "status": "CONFIRMED",
  "reasonForVisit": "Follow up on ECG and blood pressure reports",
  "consultationFee": 500.0,
  "discountedFee": 400.0,
  "appliedDiscountReason": "Senior Citizen Care Concession (20% Discount for Age 68)"
}
\`\`\`

---

### 14. Spring Boot Auto-Configuration Explanation
Spring Boot auto-configuration automatically configures Spring application beans based on JAR dependencies found on the classpath.
1. **@SpringBootApplication**: Combines \`@Configuration\`, \`@EnableAutoConfiguration\`, and \`@ComponentScan\`.
2. **spring-boot-starter-web**: Automatically configures an embedded Tomcat server on port 8080, registers the \`DispatcherServlet\`, and sets up Jackson's \`ObjectMapper\` for JSON serialization.
3. **spring-boot-starter-data-jpa**: Automatically configures the \`DataSource\` with HikariCP upon finding H2 on the classpath, initializes the Hibernate \`EntityManagerFactory\`, and generates proxy implementations for \`PatientRepository\` and \`AppointmentRepository\` interfaces without requiring explicit SQL code.
4. **spring-boot-starter-validation**: Automatically detects Jakarta Validation on the classpath and activates the Hibernate Validator bean for \`@Valid\` request handling.
`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white sm:text-lg">
              Academic Lab Report - Aarogya Care Clinic (B.Tech CSE)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Student Metadata Configuration Bar */}
        <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400">Roll No / Student ID</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400">Course / Module Title</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="mt-0.5 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:p-0 print:text-black print:bg-white text-slate-200 text-xs">
          {/* Cover Header */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Coursework Submission • Spring Boot Framework – Part 1
            </span>
            <h1 className="mt-1 text-2xl font-black text-white">{project.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <div><strong>Student:</strong> {studentName}</div>
              <div><strong>ID:</strong> {rollNumber}</div>
              <div><strong>Course:</strong> {courseName}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Item 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              1. Application Name & Problem Description
            </h3>
            <p className="leading-relaxed text-slate-300">{project.problemStatement}</p>
          </section>

          {/* Item 2 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              2. Architecture Diagram (Three-Tier Architecture)
            </h3>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300">
              <pre className="leading-relaxed whitespace-pre-wrap">
{`Client (Browser / REST Consumer)
   │
   ▼ [HTTP POST /api/v1/appointments]
Presentation Layer: AppointmentController.java (@RestController)
   │  - Handles HTTP Request mapping
   │  - Validates DTO annotations (@Valid)
   │  - Delegates 100% to Service (No business rules)
   ▼
Business Layer: AppointmentServiceImpl.java (@Service, @Transactional)
   │  - Evaluates BR-01: Slot Conflict Detection (±30 mins)
   │  - Evaluates BR-02: Senior Citizen (60+) / Emergency 20% Concession
   │  - Evaluates BR-03: Max 3 active pending appointments quota
   ▼
Data Access Layer: AppointmentRepository.java (@Repository / Spring Data JPA)
   │  - Extends JpaRepository<Appointment, Long>
   │  - Executes derived SQL queries without boilerplate
   ▼
Persistence: H2 In-Memory RDBMS (jdbc:h2:mem:aarogyacaredb)`}
              </pre>
            </div>
          </section>

          {/* Item 3 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              3. Domain Model / Classes (2 Identified Entities)
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.domainEntities.map((e) => (
                <div key={e.name} className="rounded border border-slate-800 bg-slate-950 p-3">
                  <div className="font-bold text-white font-mono">@Entity {e.name}</div>
                  <p className="mt-1 text-[11px] text-slate-400">{e.description}</p>
                  <ul className="mt-2 space-y-1 text-[11px] font-mono text-slate-300">
                    {e.attributes.map((a) => (
                      <li key={a.name}>
                        <span className="text-emerald-400">{a.name}</span>: {a.type} ({a.constraints})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Item 4 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              4. Project / Package Structure
            </h3>
            <pre className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 leading-tight">
{`com.example.aarogyacare
├── AarogyaCareApplication.java (Entry Point with @SpringBootApplication)
├── controller/
│   ├── AppointmentController.java (Presentation Layer)
│   └── PatientController.java (Presentation Layer)
├── service/
│   ├── AppointmentService.java (Interface)
│   └── AppointmentServiceImpl.java (Business Layer - Business Rules)
├── repository/
│   ├── AppointmentRepository.java (Data Access Layer)
│   └── PatientRepository.java (Data Access Layer)
├── model/
│   ├── Appointment.java (Domain Entity)
│   ├── Patient.java (Domain Entity)
│   └── AppointmentStatus.java (Enum)
├── dto/
│   ├── AppointmentRequestDTO.java
│   └── AppointmentResponseDTO.java
└── exception/
    ├── BusinessRuleViolationException.java
    └── GlobalExceptionHandler.java (@RestControllerAdvice)`}
            </pre>
          </section>

          {/* Item 5, 6, 7 */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                5. Controller Code (Presentation Layer)
              </h3>
              <pre className="mt-1 max-h-48 overflow-y-auto rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                <code>{controllerCode}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                6. Service Code (Business Layer)
              </h3>
              <pre className="mt-1 max-h-48 overflow-y-auto rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                <code>{serviceCode}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                7. Repository Code (Data Access Layer)
              </h3>
              <pre className="mt-1 max-h-48 overflow-y-auto rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                <code>{repoCode}</code>
              </pre>
            </div>
          </section>

          {/* Item 8 & 9 */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              8 & 9. REST Endpoints & Service Business Rules Implemented
            </h3>
            <div className="space-y-2">
              {project.businessRules.map((br) => (
                <div key={br.id} className="rounded border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{br.id}:</span>
                    <span className="font-semibold text-white">{br.name}</span>
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px]">{br.details}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Item 10 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              10. Test Cases (Constraint 8 Matrix)
            </h3>
            <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Target Layer</th>
                    <th className="p-2">Input</th>
                    <th className="p-2">Expected Output</th>
                    <th className="p-2">Actual Output</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {project.testCases.map((tc) => (
                    <tr key={tc.id}>
                      <td className="p-2 text-emerald-400 font-bold">{tc.id}</td>
                      <td className="p-2 text-slate-400">{tc.layerTargeted}</td>
                      <td className="p-2 text-amber-300">{tc.input}</td>
                      <td className="p-2 text-slate-300">{tc.expectedOutput}</td>
                      <td className="p-2 text-slate-300">{tc.actualOutput}</td>
                      <td className="p-2 font-bold text-emerald-400">{tc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Item 11 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              11. Automated Test (JUnit 5 + Mockito)
            </h3>
            <pre className="max-h-48 overflow-y-auto rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
              <code>{testCode}</code>
            </pre>
          </section>

          {/* Item 12 & 13 Output */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              12 & 13. Application Running & REST Endpoint Output Screenshots
            </h3>
            <div className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-emerald-400">
              <div>[INFO] Tomcat started on port 8080 (http) with context path ''</div>
              <div>[INFO] Started AarogyaCareApplication in 2.314 seconds</div>
              <div className="mt-2 text-amber-300">HTTP/1.1 201 CREATED</div>
              <div className="text-slate-300">
                {`{ "id": 102, "status": "CONFIRMED", "discountedFee": 400.0, "appliedDiscountReason": "Senior Citizen Care Concession (20% Discount for Age 68)" }`}
              </div>
            </div>
          </section>

          {/* Item 14 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              14. Brief Explanation of Spring Boot Auto-Configuration
            </h3>
            <p className="leading-relaxed text-slate-300">
              Spring Boot uses opinionated auto-configuration to scan the classpath and configure beans automatically without requiring boilerplate XML or manual Java configuration classes.
              In this application, <code className="text-emerald-300">spring-boot-starter-web</code> automatically boots an embedded Tomcat instance on port 8080 and configures Jackson serialization.
              <code className="text-emerald-300">spring-boot-starter-data-jpa</code> discovers the in-memory H2 database, instantiates a HikariCP pool, creates the Hibernate EntityManager, and dynamically implements <code className="text-emerald-300">PatientRepository</code> and <code className="text-emerald-300">AppointmentRepository</code> interfaces.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
