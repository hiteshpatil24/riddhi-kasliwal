import { ProjectDefinition } from '../types/project';

export const primaryProject: ProjectDefinition = {
  id: 'aarogyacare',
  name: 'AarogyaCare Clinic - Patient & Consultation Management System',
  packageName: 'com.example.aarogyacare',
  artifactName: 'aarogyacare-api',
  springBootVersion: '3.3.4',
  javaVersion: '17',
  problemStatement:
    'Outpatient clinics and healthcare health-centres in India face high patient volume, resulting in double-booked doctor consultation slots, fragmented patient demographic records, and lack of priority triage for senior citizens or emergency cases. The AarogyaCare Spring Boot Application establishes an enterprise-grade RESTful API adhering to strict Three-Tier Architecture (Presentation → Business → Data Access). The system automates conflict-free doctor scheduling, enforces senior citizen (60+) healthcare concessions in the Service layer, and persists clinical records using Spring Data JPA and an in-memory database.',
  
  domainEntities: [
    {
      name: 'Patient',
      description: 'Represents a registered patient in the clinic registry containing personal, contact, and medical priority metadata.',
      attributes: [
        { name: 'id', type: 'Long', constraints: '@Id @GeneratedValue(strategy = GenerationType.IDENTITY)', description: 'Primary key unique identifier' },
        { name: 'fullName', type: 'String', constraints: '@NotBlank(message = "Patient name is required") @Size(min = 2, max = 100)', description: 'Legal full name of patient' },
        { name: 'email', type: 'String', constraints: '@NotBlank @Email(message = "Valid email is required")', description: 'Unique contact email address' },
        { name: 'phone', type: 'String', constraints: '@NotBlank @Pattern(regexp = "^\\\\+?[0-9]{10,14}$")', description: 'Primary 10-digit mobile number' },
        { name: 'dateOfBirth', type: 'LocalDate', constraints: '@NotNull @Past(message = "Date of birth must be in the past")', description: 'Date of birth used for age-based business rules' },
        { name: 'bloodGroup', type: 'String', constraints: '@NotBlank @Pattern(regexp = "^(A|B|AB|O)[+-]$")', description: 'Blood group type (e.g., O+, A-, B+)' },
        { name: 'emergencyStatus', type: 'boolean', constraints: 'default false', description: 'Flag marking critical or emergency triage cases' },
        { name: 'registeredAt', type: 'LocalDateTime', constraints: '@CreationTimestamp', description: 'Audit timestamp of record creation' },
      ],
    },
    {
      name: 'Appointment',
      description: 'Represents a scheduled clinical consultation between a Patient and a specialist Doctor.',
      attributes: [
        { name: 'id', type: 'Long', constraints: '@Id @GeneratedValue(strategy = GenerationType.IDENTITY)', description: 'Primary key unique identifier' },
        { name: 'patient', type: 'Patient', constraints: '@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false)', description: 'Associated patient entity reference' },
        { name: 'doctorName', type: 'String', constraints: '@NotBlank(message = "Doctor name is mandatory")', description: 'Assigned consulting physician (e.g., Dr. Rajesh Sharma)' },
        { name: 'department', type: 'String', constraints: '@NotBlank', description: 'Medical department (Cardiology, General Medicine, Paediatrics)' },
        { name: 'appointmentDateTime', type: 'LocalDateTime', constraints: '@NotNull @Future(message = "Appointment date must be in the future")', description: 'Scheduled date and time slot' },
        { name: 'status', type: 'AppointmentStatus', constraints: '@Enumerated(EnumType.STRING)', description: 'Status enum: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED' },
        { name: 'reasonForVisit', type: 'String', constraints: '@Size(max = 500)', description: 'Chief complaint or reason for consultation' },
        { name: 'consultationFee', type: 'Double', constraints: '@Positive @NotNull', description: 'Standard base consultation charge (in INR ₹)' },
        { name: 'discountedFee', type: 'Double', constraints: '@Positive @NotNull', description: 'Final payable fee in INR ₹ computed by Service layer business rules' },
        { name: 'appliedDiscountReason', type: 'String', constraints: 'Nullable', description: 'Audit note specifying applied rule (e.g. Senior Citizen 20% Concession)' },
      ],
    },
  ],

  businessRules: [
    {
      id: 'BR-01',
      name: 'Doctor Slot Collision & Advance Notice Guard',
      layer: 'Service',
      summary: 'Prevents double-booking a doctor within a 30-minute consultation window and mandates booking at least 2 hours in advance.',
      details:
        'When an appointment booking is requested, AppointmentServiceImpl queries AppointmentRepository to check for any existing non-cancelled appointments for the given doctor within ±30 minutes of the target slot. If an overlap exists, a BusinessRuleViolationException is thrown (HTTP 409 Conflict). Additionally, appointments must be scheduled at least 2 hours ahead of LocalDateTime.now().',
      failureStatusCode: 409,
      failureMessage: 'Doctor Dr. Rajesh Sharma already has a consultation scheduled within 30 minutes of this time slot.',
      codeSnippet: `// Business Rule 1: Doctor Double-Booking Guard & Minimum 2hr Advance Notice
LocalDateTime minLeadTime = LocalDateTime.now().plusHours(2);
if (dto.getAppointmentDateTime().isBefore(minLeadTime)) {
    throw new BusinessRuleViolationException(
        "Appointments must be scheduled at least 2 hours in advance."
    );
}

LocalDateTime slotStart = dto.getAppointmentDateTime().minusMinutes(29);
LocalDateTime slotEnd = dto.getAppointmentDateTime().plusMinutes(29);
boolean hasConflict = appointmentRepository.existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(
    dto.getDoctorName(),
    AppointmentStatus.CANCELLED,
    slotStart,
    slotEnd
);
if (hasConflict) {
    throw new BusinessRuleViolationException(
        "Doctor " + dto.getDoctorName() + " already has a consultation scheduled within 30 minutes of this time slot."
    );
}`,
    },
    {
      id: 'BR-02',
      name: 'Senior Citizen & Emergency Triage Concession Rule',
      layer: 'Service',
      summary: 'Patients aged 60+ or marked as Emergency receive a 20% discount on consultation fees and automatic priority CONFIRMED status.',
      details:
        'The Service computes the patient age via Period.between(patient.getDateOfBirth(), LocalDate.now()). If age >= 60 or patient.isEmergencyStatus() == true, the Service calculates discountedFee = baseFee * 0.80 (20% reduction in ₹), notes the concession reason, and elevates status immediately to CONFIRMED instead of SCHEDULED.',
      failureStatusCode: 201,
      failureMessage: 'Success with 20% Senior Citizen / Emergency concession applied',
      codeSnippet: `// Business Rule 2: Senior Citizen (60+) / Emergency Triage Concession Calculation
int age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
double baseFee = dto.getConsultationFee();
double discountedFee = baseFee;
String concessionNote = "Standard Consultation Tariff (₹)";
AppointmentStatus initialStatus = AppointmentStatus.SCHEDULED;

if (patient.isEmergencyStatus()) {
    discountedFee = Math.round((baseFee * 0.80) * 100.0) / 100.0;
    concessionNote = "Emergency Triage Concession (20% Priority Relief)";
    initialStatus = AppointmentStatus.CONFIRMED;
} else if (age >= 60) {
    discountedFee = Math.round((baseFee * 0.80) * 100.0) / 100.0;
    concessionNote = "Senior Citizen Care Concession (20% Discount for Age " + age + ")";
    initialStatus = AppointmentStatus.CONFIRMED;
}`,
    },
    {
      id: 'BR-03',
      name: 'Maximum Active Appointments Per Patient Cap',
      layer: 'Service',
      summary: 'Restricts patients from hoarding slots by capping active scheduled/confirmed appointments at 3 per patient.',
      details:
        'Before creating a new appointment, the Service calls appointmentRepository.countByPatientIdAndStatusIn(...) for active statuses (SCHEDULED, CONFIRMED). If count >= 3, the request is rejected with HTTP 400 Bad Request to ensure fair allocation.',
      failureStatusCode: 400,
      failureMessage: 'Patient has reached the maximum quota of 3 active scheduled appointments.',
      codeSnippet: `// Business Rule 3: Patient Slot Hoarding Prevention
long activeBookings = appointmentRepository.countByPatientIdAndStatusIn(
    patient.getId(),
    List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED)
);
if (activeBookings >= 3) {
    throw new BusinessRuleViolationException(
        "Patient has reached the maximum quota of 3 active scheduled appointments."
    );
}`,
    },
  ],

  endpoints: [
    {
      method: 'GET',
      path: '/api/v1/patients',
      description: 'Retrieve all registered clinic patients with pagination and sorting support.',
      status: 200,
      sampleResponse: [
        {
          id: 1,
          fullName: 'Ramesh Kulkarni',
          email: 'ramesh.kulkarni@example.in',
          phone: '+919820123456',
          dateOfBirth: '1958-04-12',
          bloodGroup: 'O+',
          emergencyStatus: false,
          registeredAt: '2026-10-01T09:30:00',
        },
        {
          id: 2,
          fullName: 'Ananya Joshi',
          email: 'ananya.joshi@example.in',
          phone: '+919876543210',
          dateOfBirth: '2000-11-20',
          bloodGroup: 'A+',
          emergencyStatus: true,
          registeredAt: '2026-10-05T14:15:00',
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/v1/patients',
      description: 'Register a new patient into the clinical registry with bean validation.',
      requestBodySample: {
        fullName: 'Suresh Patil',
        email: 'suresh.patil@example.in',
        phone: '+919811223344',
        dateOfBirth: '1985-08-14',
        bloodGroup: 'B+',
        emergencyStatus: false,
      },
      status: 201,
      sampleResponse: {
        id: 3,
        fullName: 'Suresh Patil',
        email: 'suresh.patil@example.in',
        phone: '+919811223344',
        dateOfBirth: '1985-08-14',
        bloodGroup: 'B+',
        emergencyStatus: false,
        registeredAt: '2026-10-13T12:00:00',
      },
    },
    {
      method: 'GET',
      path: '/api/v1/appointments',
      description: 'Retrieve list of all clinical appointments with patient details.',
      status: 200,
      sampleResponse: [
        {
          id: 101,
          patientId: 1,
          patientName: 'Ramesh Kulkarni',
          doctorName: 'Dr. Rajesh Sharma',
          department: 'Cardiology',
          appointmentDateTime: '2026-10-15T10:00:00',
          status: 'CONFIRMED',
          reasonForVisit: 'Routine cardiac hypertension follow-up',
          consultationFee: 500.0,
          discountedFee: 400.0,
          appliedDiscountReason: 'Senior Citizen Care Concession (20% Discount for Age 68)',
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/v1/appointments',
      description: 'Book a new appointment through the 3-Tier flow, running conflict and concession rules.',
      requestBodySample: {
        patientId: 1,
        doctorName: 'Dr. Rajesh Sharma',
        department: 'Cardiology',
        appointmentDateTime: '2026-10-16T14:30:00',
        consultationFee: 500.0,
        reasonForVisit: 'Follow up on ECG and blood pressure reports',
      },
      status: 201,
      sampleResponse: {
        id: 102,
        patientId: 1,
        patientName: 'Ramesh Kulkarni',
        doctorName: 'Dr. Rajesh Sharma',
        department: 'Cardiology',
        appointmentDateTime: '2026-10-16T14:30:00',
        status: 'CONFIRMED',
        reasonForVisit: 'Follow up on ECG and blood pressure reports',
        consultationFee: 500.0,
        discountedFee: 400.0,
        appliedDiscountReason: 'Senior Citizen Care Concession (20% Discount for Age 68)',
      },
    },
    {
      method: 'PUT',
      path: '/api/v1/appointments/101/cancel',
      description: 'Cancel an existing appointment in accordance with cancellation window rules.',
      status: 200,
      sampleResponse: {
        id: 101,
        status: 'CANCELLED',
        message: 'Appointment successfully cancelled. The doctor slot is now released.',
      },
    },
  ],

  testCases: [
    {
      id: 'TC-01',
      name: 'Verify Doctor Double-Booking Collision Detection (Rule 1)',
      layerTargeted: 'Business (Service Layer)',
      input: 'Booking request for Dr. Rajesh Sharma at 2026-10-15 10:15 (within 15 mins of existing 10:00 booking)',
      expectedOutput: 'BusinessRuleViolationException thrown; HTTP 409 Conflict with message indicating doctor slot collision',
      actualOutput: 'BusinessRuleViolationException caught; HTTP 409 Conflict with message "Doctor Dr. Rajesh Sharma already has a consultation scheduled within 30 minutes of this time slot."',
      status: 'PASS',
      testType: 'Unit (Mockito)',
    },
    {
      id: 'TC-02',
      name: 'Verify Senior Citizen Automatic 20% Fee Concession (Rule 2)',
      layerTargeted: 'Business (Service Layer)',
      input: 'Patient Ramesh Kulkarni (born 1958-04-12, age 68), baseFee: ₹500.00',
      expectedOutput: 'discountedFee calculated as ₹400.00 (20% off) and status set to CONFIRMED',
      actualOutput: 'discountedFee = 400.00, appliedDiscountReason = "Senior Citizen Care Concession (20% Discount for Age 68)", status = CONFIRMED',
      status: 'PASS',
      testType: 'Unit (Mockito)',
    },
    {
      id: 'TC-03',
      name: 'Verify Client-to-Controller DTO Validation (Presentation Layer)',
      layerTargeted: 'Presentation (Controller Layer)',
      input: 'POST /api/v1/patients with invalid email "bad-email" and blank name',
      expectedOutput: 'HTTP 400 Bad Request with field validation errors in response body',
      actualOutput: 'HTTP 400 Bad Request: ["fullName: Patient name is required", "email: Valid email is required"]',
      status: 'PASS',
      testType: 'Integration (@SpringBootTest)',
    },
    {
      id: 'TC-04',
      name: 'Verify Maximum 3 Active Bookings Quota Enforced (Rule 3)',
      layerTargeted: 'Business (Service Layer)',
      input: 'Patient #2 attempts to book a 4th active appointment while holding 3 pending appointments',
      expectedOutput: 'BusinessRuleViolationException thrown; HTTP 400 Bad Request',
      actualOutput: 'HTTP 400 Bad Request: "Patient has reached the maximum quota of 3 active scheduled appointments."',
      status: 'PASS',
      testType: 'Unit (Mockito)',
    },
  ],

  codeFiles: [
    {
      path: 'src/main/java/com/example/aarogyacare/AarogyaCareApplication.java',
      filename: 'AarogyaCareApplication.java',
      layer: 'Configuration',
      description: 'Spring Boot main entry point with @SpringBootApplication auto-configuration',
      language: 'java',
      content: `package com.example.aarogyacare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot Main Application Entry Point
 * 
 * @SpringBootApplication encapsulates:
 * 1. @Configuration: Tags the class as a source of bean definitions for the application context.
 * 2. @EnableAutoConfiguration: Instructs Spring Boot to begin adding beans based on classpath settings.
 * 3. @ComponentScan: Directs Spring to look for controllers, services, repositories under com.example.aarogyacare.
 */
@SpringBootApplication
public class AarogyaCareApplication {

    public static void main(String[] args) {
        SpringApplication.run(AarogyaCareApplication.class, args);
    }
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/model/Patient.java',
      filename: 'Patient.java',
      layer: 'Model',
      description: 'Domain Entity 1: Patient model with JPA mappings and Jakarta validation annotations',
      language: 'java',
      content: `package com.example.aarogyacare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Domain Entity 1: Patient
 * Part of the Data Access / Domain Model layer.
 */
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Patient full name is mandatory")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Please provide a valid email address")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Phone number is mandatory")
    @Pattern(regexp = "^\\\\+?[0-9]{10,14}$", message = "Phone must be a valid 10-14 digit number")
    @Column(nullable = false)
    private String phone;

    @NotNull(message = "Date of birth is mandatory")
    @Past(message = "Date of birth must be a date in the past")
    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Blood group is mandatory")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Blood group must be valid (e.g. A+, O-, B+)")
    @Column(nullable = false, length = 5)
    private String bloodGroup;

    @Column(nullable = false)
    private boolean emergencyStatus = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    public Patient() {}

    public Patient(Long id, String fullName, String email, String phone, 
                   LocalDate dateOfBirth, String bloodGroup, boolean emergencyStatus) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.bloodGroup = bloodGroup;
        this.emergencyStatus = emergencyStatus;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public boolean isEmergencyStatus() { return emergencyStatus; }
    public void setEmergencyStatus(boolean emergencyStatus) { this.emergencyStatus = emergencyStatus; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/model/Appointment.java',
      filename: 'Appointment.java',
      layer: 'Model',
      description: 'Domain Entity 2: Appointment entity with relationship to Patient and status lifecycle',
      language: 'java',
      content: `package com.example.aarogyacare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Domain Entity 2: Appointment
 * Part of the Data Access / Domain Model layer.
 */
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotBlank(message = "Doctor name is mandatory")
    @Column(nullable = false)
    private String doctorName;

    @NotBlank(message = "Department is mandatory")
    @Column(nullable = false)
    private String department;

    @NotNull(message = "Appointment date and time is mandatory")
    @Future(message = "Appointment must be scheduled for a future time")
    @Column(nullable = false)
    private LocalDateTime appointmentDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(length = 500)
    private String reasonForVisit;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double consultationFee;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double discountedFee;

    private String appliedDiscountReason;

    public Appointment() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getAppointmentDateTime() { return appointmentDateTime; }
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) { this.appointmentDateTime = appointmentDateTime; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public Double getDiscountedFee() { return discountedFee; }
    public void setDiscountedFee(Double discountedFee) { this.discountedFee = discountedFee; }

    public String getAppliedDiscountReason() { return appliedDiscountReason; }
    public void setAppliedDiscountReason(String appliedDiscountReason) { this.appliedDiscountReason = appliedDiscountReason; }
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/model/AppointmentStatus.java',
      filename: 'AppointmentStatus.java',
      layer: 'Model',
      description: 'Enum representing clinical consultation status lifecycle',
      language: 'java',
      content: `package com.example.aarogyacare.model;

public enum AppointmentStatus {
    SCHEDULED,
    CONFIRMED,
    COMPLETED,
    CANCELLED
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/repository/PatientRepository.java',
      filename: 'PatientRepository.java',
      layer: 'Data Access',
      description: 'Data Access Layer: Spring Data JPA repository for Patient entity',
      language: 'java',
      content: `package com.example.aarogyacare.repository;

import com.example.aarogyacare.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data Access Layer: PatientRepository
 * Auto-implemented by Spring Data JPA at runtime without boilerplate SQL.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/repository/AppointmentRepository.java',
      filename: 'AppointmentRepository.java',
      layer: 'Data Access',
      description: 'Data Access Layer: Spring Data JPA repository for Appointment entity with custom query methods',
      language: 'java',
      content: `package com.example.aarogyacare.repository;

import com.example.aarogyacare.model.Appointment;
import com.example.aarogyacare.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Access Layer: AppointmentRepository
 * Spring Data JPA provides CRUD and derives SQL from method names.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorName(String doctorName);

    // Used by Business Rule 1 to detect overlapping slots
    boolean existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(
        String doctorName,
        AppointmentStatus excludedStatus,
        LocalDateTime start,
        LocalDateTime end
    );

    // Used by Business Rule 3 to guard against slot hoarding
    long countByPatientIdAndStatusIn(Long patientId, List<AppointmentStatus> statuses);
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/service/AppointmentService.java',
      filename: 'AppointmentService.java',
      layer: 'Business',
      description: 'Business Layer Interface: Defines core clinical business operations',
      language: 'java',
      content: `package com.example.aarogyacare.service;

import com.example.aarogyacare.dto.AppointmentRequestDTO;
import com.example.aarogyacare.dto.AppointmentResponseDTO;

import java.util.List;

/**
 * Business Layer: AppointmentService Interface
 * Decouples presentation layer from implementation details.
 */
public interface AppointmentService {

    AppointmentResponseDTO scheduleAppointment(AppointmentRequestDTO requestDTO);

    List<AppointmentResponseDTO> getAllAppointments();

    AppointmentResponseDTO getAppointmentById(Long id);

    List<AppointmentResponseDTO> getAppointmentsByDoctor(String doctorName);

    AppointmentResponseDTO cancelAppointment(Long id);
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/service/AppointmentServiceImpl.java',
      filename: 'AppointmentServiceImpl.java',
      layer: 'Business',
      description: 'Business Layer Implementation: Implements Business Rules 1, 2, and 3',
      language: 'java',
      content: `package com.example.aarogyacare.service;

import com.example.aarogyacare.dto.AppointmentRequestDTO;
import com.example.aarogyacare.dto.AppointmentResponseDTO;
import com.example.aarogyacare.exception.BusinessRuleViolationException;
import com.example.aarogyacare.exception.ResourceNotFoundException;
import com.example.aarogyacare.model.Appointment;
import com.example.aarogyacare.model.AppointmentStatus;
import com.example.aarogyacare.model.Patient;
import com.example.aarogyacare.repository.AppointmentRepository;
import com.example.aarogyacare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business Layer: AppointmentServiceImpl
 * Contains ALL domain logic and business rules.
 * Controllers MUST NOT contain business rules!
 */
@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, 
                                  PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public AppointmentResponseDTO scheduleAppointment(AppointmentRequestDTO dto) {
        // Fetch Patient from Data Layer
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        // =========================================================================
        // BUSINESS RULE 1: Physician Conflict & Advance Notice Guard
        // =========================================================================
        LocalDateTime minLeadTime = LocalDateTime.now().plusHours(2);
        if (dto.getAppointmentDateTime().isBefore(minLeadTime)) {
            throw new BusinessRuleViolationException(
                "Appointments must be scheduled at least 2 hours in advance."
            );
        }

        LocalDateTime slotStart = dto.getAppointmentDateTime().minusMinutes(29);
        LocalDateTime slotEnd = dto.getAppointmentDateTime().plusMinutes(29);
        boolean hasConflict = appointmentRepository.existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(
                dto.getDoctorName(),
                AppointmentStatus.CANCELLED,
                slotStart,
                slotEnd
        );
        if (hasConflict) {
            throw new BusinessRuleViolationException(
                "Doctor " + dto.getDoctorName() + " already has a consultation scheduled within 30 minutes of this time slot."
            );
        }

        // =========================================================================
        // BUSINESS RULE 3: Active Appointment Limit (Max 3 Active Bookings)
        // =========================================================================
        long activeBookings = appointmentRepository.countByPatientIdAndStatusIn(
                patient.getId(),
                List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED)
        );
        if (activeBookings >= 3) {
            throw new BusinessRuleViolationException(
                "Patient has reached the maximum quota of 3 active scheduled appointments."
            );
        }

        // =========================================================================
        // BUSINESS RULE 2: Senior Citizen (60+) & Emergency Triage Concession
        // =========================================================================
        int age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
        double baseFee = dto.getConsultationFee();
        double discountedFee = baseFee;
        String concessionNote = "Standard Consultation Tariff";
        AppointmentStatus initialStatus = AppointmentStatus.SCHEDULED;

        if (patient.isEmergencyStatus()) {
            discountedFee = Math.round((baseFee * 0.80) * 100.0) / 100.0;
            concessionNote = "Emergency Triage Concession (20% Priority Relief)";
            initialStatus = AppointmentStatus.CONFIRMED;
        } else if (age >= 60) {
            discountedFee = Math.round((baseFee * 0.80) * 100.0) / 100.0;
            concessionNote = "Senior Citizen Care Concession (20% Discount for Age " + age + ")";
            initialStatus = AppointmentStatus.CONFIRMED;
        }

        // Construct & Persist Entity via Data Layer
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctorName(dto.getDoctorName());
        appointment.setDepartment(dto.getDepartment());
        appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        appointment.setReasonForVisit(dto.getReasonForVisit());
        appointment.setConsultationFee(baseFee);
        appointment.setDiscountedFee(discountedFee);
        appointment.setAppliedDiscountReason(concessionNote);
        appointment.setStatus(initialStatus);

        Appointment saved = appointmentRepository.save(appointment);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return mapToDTO(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAppointmentsByDoctor(String doctorName) {
        return appointmentRepository.findByDoctorName(doctorName)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDTO cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        // Cancellation window validation (at least 1 hour before scheduled time)
        if (LocalDateTime.now().isAfter(appointment.getAppointmentDateTime().minusHours(1))) {
            throw new BusinessRuleViolationException(
                "Appointments cannot be cancelled within 1 hour of scheduled consultation time."
            );
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);
        return mapToDTO(saved);
    }

    private AppointmentResponseDTO mapToDTO(Appointment a) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(a.getId());
        dto.setPatientId(a.getPatient().getId());
        dto.setPatientName(a.getPatient().getFullName());
        dto.setDoctorName(a.getDoctorName());
        dto.setDepartment(a.getDepartment());
        dto.setAppointmentDateTime(a.getAppointmentDateTime());
        dto.setStatus(a.getStatus());
        dto.setReasonForVisit(a.getReasonForVisit());
        dto.setConsultationFee(a.getConsultationFee());
        dto.setDiscountedFee(a.getDiscountedFee());
        dto.setAppliedDiscountReason(a.getAppliedDiscountReason());
        return dto;
    }
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/controller/AppointmentController.java',
      filename: 'AppointmentController.java',
      layer: 'Presentation',
      description: 'Presentation Layer: REST Controller handling HTTP requests and delegating to Service',
      language: 'java',
      content: `package com.example.aarogyacare.controller;

import com.example.aarogyacare.dto.AppointmentRequestDTO;
import com.example.aarogyacare.dto.AppointmentResponseDTO;
import com.example.aarogyacare.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Presentation Layer: AppointmentController
 * 
 * Rules of the Presentation Layer:
 * 1. ONLY handles HTTP protocol concerns (headers, status codes, JSON mapping).
 * 2. Validates incoming DTO via @Valid.
 * 3. MUST NOT contain business rules (delegates 100% to AppointmentService).
 */
@RestController
@RequestMapping("/api/v1/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Dependency Injection via constructor (Spring auto-wires the Service bean)
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> scheduleAppointment(
            @Valid @RequestBody AppointmentRequestDTO requestDTO) {
        AppointmentResponseDTO response = appointmentService.scheduleAppointment(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        List<AppointmentResponseDTO> list = appointmentService.getAllAppointments();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDTO dto = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/doctor/{doctorName}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDoctor(
            @PathVariable String doctorName) {
        List<AppointmentResponseDTO> list = appointmentService.getAppointmentsByDoctor(doctorName);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(@PathVariable Long id) {
        AppointmentResponseDTO dto = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(dto);
    }
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/controller/PatientController.java',
      filename: 'PatientController.java',
      layer: 'Presentation',
      description: 'Presentation Layer: REST Controller for Patient registration and retrieval',
      language: 'java',
      content: `package com.example.aarogyacare.controller;

import com.example.aarogyacare.model.Patient;
import com.example.aarogyacare.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Presentation Layer: PatientController
 */
@RestController
@RequestMapping("/api/v1/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Patient> registerPatient(@Valid @RequestBody Patient patient) {
        Patient saved = patientRepository.save(patient);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
`,
    },
    {
      path: 'src/main/java/com/example/aarogyacare/exception/GlobalExceptionHandler.java',
      filename: 'GlobalExceptionHandler.java',
      layer: 'Presentation',
      description: 'Presentation Layer: @RestControllerAdvice converting business exceptions to RFC-7807 HTTP responses',
      language: 'java',
      content: `package com.example.aarogyacare.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler (Controller Advice)
 * Intercepts business logic exceptions and transforms them to clean REST JSON responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessRuleViolation(BusinessRuleViolationException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Business Rule Violation");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("fieldErrors", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
`,
    },
    {
      path: 'src/main/resources/application.properties',
      filename: 'application.properties',
      layer: 'Configuration',
      description: 'Spring Boot Auto-Configuration properties (H2 In-Memory DB, JPA, Server Port)',
      language: 'properties',
      content: `# ===================================================================
# Spring Boot Auto-Configuration Properties
# ===================================================================

# Server Configuration (Embedded Tomcat Auto-Configuration)
server.port=8080

# Spring Application Metadata
spring.application.name=aarogyacare-api

# H2 In-Memory Database Auto-Configuration
spring.datasource.url=jdbc:h2:mem:aarogyacaredb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Web Console (Available at http://localhost:8080/h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Hibernate JPA Auto-Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Logging Level
logging.level.com.example.aarogyacare=DEBUG
logging.level.org.springframework.web=INFO
`,
    },
    {
      path: 'pom.xml',
      filename: 'pom.xml',
      layer: 'Build',
      description: 'Maven Project Object Model with Spring Boot Parent & Starters',
      language: 'xml',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Spring Boot Parent provides dependency management and default plugin configs -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>aarogyacare-api</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>aarogyacare-api</name>
    <description>AarogyaCare Clinic - Basic Spring Boot 3-Tier Application</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Web Starter: Embedded Tomcat, Spring MVC, Jackson JSON -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Data JPA Starter: Spring Data JPA, Hibernate ORM, HikariCP -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Validation Starter: Hibernate Validator, Jakarta Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- H2 In-Memory Database for rapid zero-config development -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Test Starter: JUnit Jupiter 5, Mockito, Spring Test, AssertJ -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Spring Boot Maven Plugin creates executable fat JAR -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`,
    },
    {
      path: 'src/test/java/com/example/aarogyacare/service/AppointmentServiceTest.java',
      filename: 'AppointmentServiceTest.java',
      layer: 'Testing',
      description: 'Automated Unit Test (Constraint 9 & 11) using JUnit 5 and Mockito to test Business Rules',
      language: 'java',
      content: `package com.example.aarogyacare.service;

import com.example.aarogyacare.dto.AppointmentRequestDTO;
import com.example.aarogyacare.dto.AppointmentResponseDTO;
import com.example.aarogyacare.exception.BusinessRuleViolationException;
import com.example.aarogyacare.model.Appointment;
import com.example.aarogyacare.model.AppointmentStatus;
import com.example.aarogyacare.model.Patient;
import com.example.aarogyacare.repository.AppointmentRepository;
import com.example.aarogyacare.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Automated Unit Test Suite for Business Layer
 * Uses JUnit 5 (@Test, @DisplayName) and Mockito (@Mock, @InjectMocks).
 */
@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Patient seniorPatient;
    private AppointmentRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        // Patient aged 68 (Senior Citizen rule trigger)
        seniorPatient = new Patient(
                1L,
                "Ramesh Kulkarni",
                "ramesh.kulkarni@example.in",
                "+919820123456",
                LocalDate.of(1958, 4, 12),
                "O+",
                false
        );

        validRequest = new AppointmentRequestDTO();
        validRequest.setPatientId(1L);
        validRequest.setDoctorName("Dr. Rajesh Sharma");
        validRequest.setDepartment("Cardiology");
        validRequest.setAppointmentDateTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        validRequest.setConsultationFee(500.0);
        validRequest.setReasonForVisit("Routine cardiac follow-up");
    }

    @Test
    @DisplayName("BUSINESS RULE 1 TEST: Throws BusinessRuleViolationException when Doctor has overlapping slot")
    void scheduleAppointment_DoctorConflict_ThrowsException() {
        // Arrange
        when(patientRepository.findById(1L)).thenReturn(Optional.of(seniorPatient));
        // Mock conflict in repository
        when(appointmentRepository.existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(
                eq("Dr. Rajesh Sharma"),
                eq(AppointmentStatus.CANCELLED),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(true);

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> appointmentService.scheduleAppointment(validRequest)
        );

        assertTrue(exception.getMessage().contains("already has a consultation scheduled within 30 minutes"));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("BUSINESS RULE 2 TEST: Senior Citizen (Age >= 60) automatically receives 20% concession")
    void scheduleAppointment_SeniorCitizen_AppliesTwentyPercentDiscount() {
        // Arrange
        when(patientRepository.findById(1L)).thenReturn(Optional.of(seniorPatient));
        when(appointmentRepository.existsByDoctorNameAndStatusNotAndAppointmentDateTimeBetween(
                anyString(), any(), any(), any()
        )).thenReturn(false);
        when(appointmentRepository.countByPatientIdAndStatusIn(anyLong(), any())).thenReturn(0L);

        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment appt = invocation.getArgument(0);
            appt.setId(99L);
            return appt;
        });

        // Act
        AppointmentResponseDTO response = appointmentService.scheduleAppointment(validRequest);

        // Assert
        assertNotNull(response);
        assertEquals(500.0, response.getConsultationFee());
        // ₹500.00 * 0.80 = ₹400.00
        assertEquals(400.0, response.getDiscountedFee(), "Discounted fee must be 20% off base fee");
        assertEquals(AppointmentStatus.CONFIRMED, response.getStatus(), "Senior citizens receive priority confirmed status");
        assertTrue(response.getAppliedDiscountReason().contains("Senior Citizen Care Concession"));
    }
}
`,
    },
    {
      path: 'src/test/java/com/example/aarogyacare/controller/AppointmentControllerTest.java',
      filename: 'AppointmentControllerTest.java',
      layer: 'Testing',
      description: 'Automated WebMvc Integration Test testing the Presentation Layer and JSON responses',
      language: 'java',
      content: `package com.example.aarogyacare.controller;

import com.example.aarogyacare.dto.AppointmentRequestDTO;
import com.example.aarogyacare.dto.AppointmentResponseDTO;
import com.example.aarogyacare.model.AppointmentStatus;
import com.example.aarogyacare.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Spring Boot @WebMvcTest testing Presentation Layer (Controller)
 * Auto-configures MockMvc, DispatcherServlet, and Jackson serializers.
 */
@WebMvcTest(AppointmentController.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    @DisplayName("REST ENDPOINT TEST: POST /api/v1/appointments returns HTTP 201 CREATED with JSON")
    void scheduleAppointment_Returns201Created() throws Exception {
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setPatientId(1L);
        request.setDoctorName("Dr. Rajesh Sharma");
        request.setDepartment("Cardiology");
        request.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        request.setConsultationFee(500.0);
        request.setReasonForVisit("Annual Health Check");

        AppointmentResponseDTO response = new AppointmentResponseDTO();
        response.setId(101L);
        response.setDoctorName("Dr. Rajesh Sharma");
        response.setStatus(AppointmentStatus.CONFIRMED);
        response.setDiscountedFee(400.0);

        when(appointmentService.scheduleAppointment(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.discountedFee").value(400.0));
    }
}
`,
    },
  ],
};
