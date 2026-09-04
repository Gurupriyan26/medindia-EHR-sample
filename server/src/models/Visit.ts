import mongoose, { Document, Schema } from 'mongoose';

export interface IVitals {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface IMedicationItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: 'Before Food' | 'After Food' | 'With Food' | 'Anytime';
  duration: string;
  instructions?: string;
}

export interface IVisit extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName?: string;
  doctorName: string;
  doctorSpecialty?: string;
  clinicOrHospital: string;
  date: string;
  visitType: 'General Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup' | 'Specialist Consultation';
  chiefComplaint: string;
  symptoms?: string[];
  vitals?: IVitals;
  clinicalExamination?: string;
  diagnosis: string;
  icd10Code?: string;
  clinicalNotes?: string;
  prescriptions: IMedicationItem[];
  orderedLabTests?: string[];
  followUpDate?: string;
  status: 'Completed' | 'In-Progress' | 'Cancelled';
}

const MedicationItemSchema = new Schema<IMedicationItem>({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  timing: {
    type: String,
    enum: ['Before Food', 'After Food', 'With Food', 'Anytime'],
    default: 'After Food',
  },
  duration: { type: String, required: true },
  instructions: { type: String },
});

const VitalsSchema = new Schema<IVitals>({
  bloodPressure: { type: String },
  heartRate: { type: Number },
  temperature: { type: Number },
  spO2: { type: Number },
  respiratoryRate: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  bmi: { type: Number },
});

const VisitSchema = new Schema<IVisit>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String },
    clinicOrHospital: { type: String, default: 'MedIndia Apex Care Clinic' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    visitType: {
      type: String,
      enum: ['General Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Specialist Consultation'],
      default: 'General Consultation',
    },
    chiefComplaint: { type: String, required: true },
    symptoms: [{ type: String }],
    vitals: VitalsSchema,
    clinicalExamination: { type: String },
    diagnosis: { type: String, required: true },
    icd10Code: { type: String },
    clinicalNotes: { type: String },
    prescriptions: [MedicationItemSchema],
    orderedLabTests: [{ type: String }],
    followUpDate: { type: String },
    status: {
      type: String,
      enum: ['Completed', 'In-Progress', 'Cancelled'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

export const VisitModel = mongoose.model<IVisit>('Visit', VisitSchema);
