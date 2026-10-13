export interface Patient {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  bloodGroup: string;
  emergencyStatus: boolean;
  registeredAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  department: string;
  appointmentDateTime: string; // ISO
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reasonForVisit: string;
  consultationFee: number;
  discountedFee: number;
  appliedDiscountReason?: string;
  notes?: string;
}

export interface ProjectDefinition {
  id: string;
  name: string;
  packageName: string;
  artifactName: string;
  springBootVersion: string;
  javaVersion: string;
  problemStatement: string;
  domainEntities: {
    name: string;
    description: string;
    attributes: { name: string; type: string; constraints: string; description: string }[];
  }[];
  businessRules: {
    id: string;
    name: string;
    layer: 'Service';
    summary: string;
    details: string;
    failureStatusCode: number;
    failureMessage: string;
    codeSnippet: string;
  }[];
  endpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    requestBodySample?: any;
    sampleResponse: any;
    status: number;
  }[];
  testCases: {
    id: string;
    name: string;
    layerTargeted: string;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    status: 'PASS' | 'FAIL';
    testType: 'Unit (Mockito)' | 'Integration (@SpringBootTest)';
  }[];
  codeFiles: {
    path: string;
    filename: string;
    layer: 'Presentation' | 'Business' | 'Data Access' | 'Model' | 'DTO' | 'Configuration' | 'Testing' | 'Build';
    description: string;
    language: 'java' | 'xml' | 'properties';
    content: string;
  }[];
}

export interface RequestLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  traceSteps: {
    layer: 'Client' | 'Controller' | 'Service' | 'Repository' | 'Database';
    component: string;
    action: string;
    detail: string;
    durationMs: number;
  }[];
  responseBody: any;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  thread: string;
  logger: string;
  message: string;
}
