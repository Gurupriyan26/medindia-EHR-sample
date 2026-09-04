export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type UserRole = 'doctor' | 'patient' | 'admin';

export interface Allergy {
  id?: string;
  substance: string; // e.g., Penicillin, Sulfa drugs, Peanuts
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  reaction: string; // e.g., Anaphylaxis, Skin rash, Wheezing
  recordedDate?: string;
}

export interface ChronicCondition {
  condition: string; // e.g., Type 2 Diabetes Mellitus, Essential Hypertension
  diagnosedYear: string;
  status: 'Active' | 'Controlled' | 'In Remission';
  notes?: string;
}

export interface Patient {
  _id: string;
  id?: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  bloodGroup: BloodGroup;
  abhaId: string; // e.g. 91-4567-8901-2345
  abhaAddress?: string; // e.g. aarav.sharma@abdm
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: Allergy[];
  medicalHistory: ChronicCondition[];
  registeredDate: string;
  lastVisitDate?: string;
  avatarUrl?: string;
}

export interface Vitals {
  bloodPressure?: string; // e.g., 128/82 mmHg
  heartRate?: number; // bpm
  temperature?: number; // °F
  spO2?: number; // %
  respiratoryRate?: number; // breaths/min
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
}

export interface MedicationItem {
  id?: string;
  medicineName: string; // e.g. Metformin 500mg, Telmisartan 40mg
  dosage: string; // e.g. 1 Tablet
  frequency: string; // e.g. 1-0-1 (Morning-Afternoon-Night) or Once Daily
  timing: 'Before Food' | 'After Food' | 'With Food' | 'Anytime';
  duration: string; // e.g. 30 Days, 5 Days
  instructions?: string; // e.g. Take with warm water
}

export interface Visit {
  _id: string;
  id?: string;
  patientId: string;
  patientName?: string;
  doctorName: string;
  doctorSpecialty?: string;
  clinicOrHospital: string;
  date: string;
  visitType: 'General Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup' | 'Specialist Consultation';
  chiefComplaint: string;
  symptoms?: string[];
  vitals?: Vitals;
  clinicalExamination?: string;
  diagnosis: string;
  icd10Code?: string; // e.g. E11.9, I10
  clinicalNotes?: string;
  prescriptions: MedicationItem[];
  orderedLabTests?: string[];
  followUpDate?: string;
  status: 'Completed' | 'In-Progress' | 'Cancelled';
}

export interface LabReport {
  _id: string;
  id?: string;
  patientId: string;
  patientName?: string;
  testName: string; // e.g. HbA1c (Glycated Hemoglobin), Complete Blood Count
  category: 'Biochemistry' | 'Hematology' | 'Radiology' | 'Pathology' | 'Microbiology' | 'Cardiology';
  orderedByDoctor: string;
  labName: string;
  sampleCollectionDate: string;
  reportDate: string;
  parameters: {
    name: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
  }[];
  overallResult: string; // e.g. Elevated HbA1c, Within Normal Limits
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  remarks?: string;
  pdfUrl?: string;
}

export interface ConsentArtefact {
  _id: string;
  id?: string;
  patientId: string;
  patientName?: string;
  patientAbhaId?: string;
  requesterName: string; // e.g. Apollo Tele-Clinic, Dr. Sarah Rao
  requesterType: 'HIU' | 'Doctor' | 'Diagnostic Lab' | 'Hospital';
  purpose: 'Care Management' | 'Second Opinion' | 'Diagnostic Review' | 'Emergency Access';
  dataTypes: ('EHR / Consultations' | 'Prescriptions' | 'Diagnostic Lab Reports' | 'Immunization')[];
  permissionMode: 'VIEW' | 'STORE' | 'QUERY';
  dateFrom: string;
  dateTo: string;
  expiryDate: string;
  status: 'GRANTED' | 'REVOKED' | 'REQUESTED' | 'EXPIRED';
  grantedAt?: string;
  revokedAt?: string;
  signatureMock?: string;
}

export interface Appointment {
  _id: string;
  id?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  type: 'In-Person Consultation' | 'Video Follow-up' | 'Lab Review';
  status: 'Scheduled' | 'Waiting' | 'In-Progress' | 'Completed' | 'Cancelled';
  tokenNumber: number;
  reason: string;
}

export interface AISummaryResponse {
  patientId: string;
  patientName: string;
  generatedAt: string;
  executiveSummary: string;
  activeConditionsSummary: string[];
  medicationRegimenSummary: string[];
  criticalAllergiesSummary: string[];
  recentConsultationsSummary: string[];
  labHighlightsSummary: string[];
  suggestedClinicalFocus: string[];
  disclaimer: string;
  source: 'OpenAI' | 'Built-in Clinical NLP';
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'visit' | 'prescription' | 'lab' | 'consent' | 'registration';
  title: string;
  subtitle: string;
  details?: string;
  badgeText?: string;
  badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  referenceId?: string;
}
