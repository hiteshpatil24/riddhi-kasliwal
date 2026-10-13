import React, { useState } from 'react';
import { Patient, Appointment, RequestLog } from '../types/project';
import { simulator } from '../services/springSimulator';
import { PlusCircle, Calendar, UserCheck, AlertCircle, CheckCircle2, XCircle, ArrowRight, Code, ShieldCheck } from 'lucide-react';

interface StudentWebAppProps {
  onRequestExecuted: (log: RequestLog) => void;
}

export const StudentWebApp: React.FC<StudentWebAppProps> = ({ onRequestExecuted }) => {
  const [patients, setPatients] = useState<Patient[]>(simulator.getPatients());
  const [appointments, setAppointments] = useState<Appointment[]>(simulator.getAppointments());

  // Form State: Register Patient
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '1960-05-15', // Default 66 years old (tests senior rule easily)
    bloodGroup: 'B+',
    emergencyStatus: false,
  });

  // Form State: Book Appointment
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '1', // Default Ramesh Kulkarni (Age 68 - Senior Citizen)
    doctorName: 'Dr. Rajesh Sharma',
    department: 'Cardiology',
    appointmentDateTime: '2026-10-18T10:30',
    consultationFee: '500.0',
    reasonForVisit: 'Hypertension checkup and blood pressure review',
  });

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    ruleNote?: string;
    httpStatus: number;
    responseJson?: any;
  } | null>(null);

  const [showJsonInspector, setShowJsonInspector] = useState(false);

  // Quick helper to calculate age
  const calculateAge = (dob: string) => {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // Submit Patient Registration
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.fullName || !patientForm.email || !patientForm.phone) {
      setFeedback({
        type: 'error',
        title: 'Validation Error (HTTP 400 Bad Request)',
        message: 'Please fill in all mandatory fields: Full Name, Email, and Phone number.',
        httpStatus: 400,
      });
      return;
    }

    const res = simulator.executeRequest('POST', '/api/v1/patients', {
      fullName: patientForm.fullName,
      email: patientForm.email,
      phone: patientForm.phone,
      dateOfBirth: patientForm.dateOfBirth,
      bloodGroup: patientForm.bloodGroup,
      emergencyStatus: patientForm.emergencyStatus,
    });

    onRequestExecuted(res.log);
    setPatients(simulator.getPatients());

    if (res.status === 201) {
      setFeedback({
        type: 'success',
        title: 'Patient Registered (HTTP 201 Created)',
        message: `Patient "${patientForm.fullName}" registered successfully with ID #${res.body.id}.`,
        httpStatus: 201,
        responseJson: res.body,
      });
      // Reset form
      setPatientForm({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '1960-05-15',
        bloodGroup: 'B+',
        emergencyStatus: false,
      });
    } else {
      setFeedback({
        type: 'error',
        title: 'Registration Error',
        message: res.body?.message || 'Failed to register patient.',
        httpStatus: res.status,
        responseJson: res.body,
      });
    }
  };

  // Submit Appointment Booking (Exercises Business Rules 1, 2, 3!)
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPatient = patients.find((p) => p.id === Number(appointmentForm.patientId));
    if (!selectedPatient) return;

    const res = simulator.executeRequest('POST', '/api/v1/appointments', {
      patientId: Number(appointmentForm.patientId),
      doctorName: appointmentForm.doctorName,
      department: appointmentForm.department,
      appointmentDateTime: appointmentForm.appointmentDateTime,
      consultationFee: parseFloat(appointmentForm.consultationFee) || 150.0,
      reasonForVisit: appointmentForm.reasonForVisit,
    });

    onRequestExecuted(res.log);
    setAppointments(simulator.getAppointments());

    if (res.status === 201) {
      const appt: Appointment = res.body;
      const isDiscounted = appt.discountedFee < appt.consultationFee;
      setFeedback({
        type: 'success',
        title: 'Appointment Booked (HTTP 201 Created)',
        message: `Appointment #${appt.id} scheduled for ${selectedPatient.fullName} with ${appt.doctorName}.`,
        ruleNote: isDiscounted
          ? `[Business Rule 2 Applied] ${appt.appliedDiscountReason} -> Original: $${appt.consultationFee.toFixed(
              2
            )}, Payable: $${appt.discountedFee.toFixed(2)} (Status: ${appt.status})`
          : `Standard tariff charged: $${appt.consultationFee.toFixed(2)}. Status: ${appt.status}`,
        httpStatus: 201,
        responseJson: res.body,
      });
    } else if (res.status === 409) {
      setFeedback({
        type: 'error',
        title: 'Doctor Slot Collision (HTTP 409 Conflict)',
        message: res.body?.message || 'Business Rule 1 violation: Overlapping consultation time.',
        ruleNote: '[Business Rule 1 Enforced in Service Layer] Doctor slot conflict detected within 30 minutes.',
        httpStatus: 409,
        responseJson: res.body,
      });
    } else {
      setFeedback({
        type: 'error',
        title: `Booking Rejected (HTTP ${res.status})`,
        message: res.body?.message || 'Booking validation error.',
        ruleNote: res.body?.violatedRule,
        httpStatus: res.status,
        responseJson: res.body,
      });
    }
  };

  // Cancel Appointment
  const handleCancel = (id: number) => {
    const res = simulator.executeRequest('PUT', `/api/v1/appointments/${id}/cancel`);
    onRequestExecuted(res.log);
    setAppointments(simulator.getAppointments());

    if (res.status === 200) {
      setFeedback({
        type: 'success',
        title: 'Appointment Cancelled (HTTP 200 OK)',
        message: `Appointment #${id} cancelled. The doctor's time slot has been released.`,
        httpStatus: 200,
        responseJson: res.body,
      });
    } else {
      setFeedback({
        type: 'error',
        title: 'Cancellation Failed',
        message: res.body?.message || 'Could not cancel appointment.',
        httpStatus: res.status,
        responseJson: res.body,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining what this is */}
      <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                B.Tech CSE Lab Project (Part 1)
              </span>
              <span className="text-xs font-medium text-slate-600">
                Developed by: <strong className="text-blue-700">Riddhi Kasliwal</strong>
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-800">
              AarogyaCare Clinic Management System (Live 3-Tier Execution)
            </h2>
            <p className="text-xs text-slate-600">
              This interactive application works end-to-end: Register patients, schedule doctor consultations, and observe the Service-layer business rules execute live.
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Spring Boot 3.3.4 (H2 In-Memory DB)
            </span>
          </div>
        </div>
      </div>

      {/* Live Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs transition-all ${
            feedback.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-red-300 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 flex-shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  <span>{feedback.title}</span>
                  <span className="rounded bg-white/80 px-2 py-0.5 font-mono text-[11px] border border-current">
                    HTTP {feedback.httpStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs">{feedback.message}</p>
                {feedback.ruleNote && (
                  <p className="mt-1 font-semibold text-[11px] underline">
                    {feedback.ruleNote}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {feedback.responseJson && (
                <button
                  type="button"
                  onClick={() => setShowJsonInspector(!showJsonInspector)}
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium shadow-sm border border-slate-300 hover:bg-slate-50"
                >
                  {showJsonInspector ? 'Hide JSON' : 'Inspect JSON Response'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="font-bold text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
          </div>

          {showJsonInspector && feedback.responseJson && (
            <div className="mt-3 rounded border border-slate-300 bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(feedback.responseJson, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Forms Section: 2 Columns (Patient Form + Appointment Booking Form) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form 1: Register Patient (Presentation -> Service -> Repository) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">1. Register New Patient</h3>
            <span className="ml-auto text-[10px] font-mono rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
              POST /api/v1/patients
            </span>
          </div>

          <form onSubmit={handleRegisterPatient} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="font-medium text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Rajesh Sharma"
                value={patientForm.fullName}
                onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-medium text-slate-700">Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210"
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-slate-700">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={patientForm.dateOfBirth}
                  onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">
                  Age: {calculateAge(patientForm.dateOfBirth)} yrs {calculateAge(patientForm.dateOfBirth) >= 60 ? '(Senior Citizen! 20% off)' : ''}
                </span>
              </div>
              <div>
                <label className="font-medium text-slate-700">Blood Group</label>
                <select
                  value={patientForm.bloodGroup}
                  onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="emergency"
                checked={patientForm.emergencyStatus}
                onChange={(e) => setPatientForm({ ...patientForm, emergencyStatus: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <label htmlFor="emergency" className="text-xs text-slate-700">
                Mark as <strong>Emergency Triage Case</strong> (Triggers 20% priority relief)
              </label>
            </div>

            {/* Quick Fill Shortcuts for Student / Evaluator */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-medium text-slate-500">Quick Fill:</span>
              <button
                type="button"
                onClick={() => {
                  setPatientForm({
                    fullName: 'Mahesh Deshpande',
                    email: 'mahesh.deshpande@example.in',
                    phone: '+919822014567',
                    dateOfBirth: '1956-08-20', // Age 70 (Senior Citizen)
                    bloodGroup: 'O+',
                    emergencyStatus: false,
                  });
                }}
                className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100"
              >
                Senior Citizen (70 yrs)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPatientForm({
                    fullName: 'Kavita Rao',
                    email: 'kavita.rao@example.in',
                    phone: '+919988776655',
                    dateOfBirth: '1995-12-05',
                    bloodGroup: 'B+',
                    emergencyStatus: true,
                  });
                }}
                className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100"
              >
                Emergency Case
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
            >
              + Register Patient into Database
            </button>
          </form>
        </div>

        {/* Form 2: Book Appointment (Runs Business Rules 1, 2, 3!) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">2. Book Consultation Appointment</h3>
            <span className="ml-auto text-[10px] font-mono rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
              POST /api/v1/appointments
            </span>
          </div>

          <form onSubmit={handleBookAppointment} className="mt-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700">Select Registered Patient *</label>
                <select
                  value={appointmentForm.patientId}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {patients.map((p) => {
                    const age = calculateAge(p.dateOfBirth);
                    return (
                      <option key={p.id} value={p.id}>
                        #{p.id}: {p.fullName} (Age: {age} {age >= 60 ? '• Senior 60+' : ''}{p.emergencyStatus ? '• Emergency' : ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Consulting Physician *</label>
                <select
                  value={appointmentForm.doctorName}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Cardiology)</option>
                  <option value="Dr. Sunita Deshmukh">Dr. Sunita Deshmukh (General Medicine & Triage)</option>
                  <option value="Dr. Priya Nair">Dr. Priya Nair (Paediatrics)</option>
                  <option value="Dr. Amit Verma">Dr. Amit Verma (Orthopaedics)</option>
                  <option value="Dr. Vivek Kulkarni">Dr. Vivek Kulkarni (Internal Medicine)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-slate-700">Department</label>
                <input
                  type="text"
                  value={appointmentForm.department}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, department: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Consultation Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={appointmentForm.appointmentDateTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDateTime: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Base Fee (₹ INR)</label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  value={appointmentForm.consultationFee}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, consultationFee: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700">Reason for Consultation</label>
              <input
                type="text"
                value={appointmentForm.reasonForVisit}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, reasonForVisit: e.target.value })}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Quick Test Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Quick Test Scenarios:</span>
              <button
                type="button"
                onClick={() => {
                  setAppointmentForm({
                    patientId: '1', // Ramesh Kulkarni, age 68 (Senior Citizen)
                    doctorName: 'Dr. Sunita Deshmukh',
                    department: 'General Medicine',
                    appointmentDateTime: '2026-10-20T11:00',
                    consultationFee: '500.0',
                    reasonForVisit: 'Testing Senior Citizen 20% Concession Rule',
                  });
                }}
                className="rounded bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100"
              >
                Auto-fill Senior Concession (Rule 2)
              </button>
              <button
                type="button"
                onClick={() => {
                  // Existing appointment for Dr. Rajesh Sharma is at 2026-10-15T10:00:00
                  setAppointmentForm({
                    patientId: '3', // Suresh Patil
                    doctorName: 'Dr. Rajesh Sharma',
                    department: 'Cardiology',
                    appointmentDateTime: '2026-10-15T10:15', // Overlaps within 15 mins!
                    consultationFee: '500.0',
                    reasonForVisit: 'Testing Overlapping Slot Conflict (Rule 1)',
                  });
                }}
                className="rounded bg-red-50 border border-red-300 px-2 py-0.5 text-[11px] font-medium text-red-800 hover:bg-red-100"
              >
                Auto-fill Double-Booking Conflict (Rule 1)
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
            >
              Confirm & Book Appointment (Runs Service Rules)
            </button>
          </form>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Clinical Appointments Table (Persisted in H2 In-Memory Database)
            </h3>
            <p className="text-xs text-slate-500">
              Shows all appointments, computed discounted fees (Rule 2), and booking statuses.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            Total: {appointments.length} appointments
          </span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
              <tr>
                <th className="p-2.5">Appt ID</th>
                <th className="p-2.5">Patient Name</th>
                <th className="p-2.5">Doctor & Dept</th>
                <th className="p-2.5">Scheduled Slot</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Base Fee</th>
                <th className="p-2.5">Payable Fee</th>
                <th className="p-2.5">Applied Concession / Rule</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono font-bold text-blue-700">#{a.id}</td>
                  <td className="p-2.5 font-semibold text-slate-800">{a.patientName}</td>
                  <td className="p-2.5 text-slate-600">
                    <div>{a.doctorName}</div>
                    <div className="text-[10px] text-slate-400">{a.department}</div>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700">
                    {a.appointmentDateTime.replace('T', ' ')}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 font-bold text-[10px] ${
                        a.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-500">
                    ₹{a.consultationFee.toFixed(2)}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-emerald-700">
                    ₹{a.discountedFee.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-[11px] text-slate-600">
                    {a.appliedDiscountReason || 'Standard Tariff (₹)'}
                  </td>
                  <td className="p-2.5 text-center">
                    {a.status !== 'CANCELLED' ? (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="rounded border border-red-300 bg-white px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 transition"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Registered Patients Directory (Spring Data JPA)
            </h3>
            <p className="text-xs text-slate-500">
              Data populated in <code className="text-blue-700">PatientRepository</code> table.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            Total: {patients.length} patients
          </span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Full Name</th>
                <th className="p-2.5">Email</th>
                <th className="p-2.5">Phone</th>
                <th className="p-2.5">Birth Date & Age</th>
                <th className="p-2.5">Blood Group</th>
                <th className="p-2.5">Emergency Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => {
                const age = calculateAge(p.dateOfBirth);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-slate-500">#{p.id}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{p.fullName}</td>
                    <td className="p-2.5 font-mono text-slate-600">{p.email}</td>
                    <td className="p-2.5 font-mono text-slate-600">{p.phone}</td>
                    <td className="p-2.5">
                      <span className="font-mono">{p.dateOfBirth}</span>{' '}
                      <span className="font-bold text-blue-700">({age} yrs)</span>{' '}
                      {age >= 60 && (
                        <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-800 font-semibold">
                          Senior 60+
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-700">{p.bloodGroup}</td>
                    <td className="p-2.5">
                      {p.emergencyStatus ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                          YES (Critical)
                        </span>
                      ) : (
                        <span className="text-slate-400">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
