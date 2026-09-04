import mongoose, { Document, Schema } from 'mongoose';

export interface IAllergy {
  substance: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  reaction: string;
  recordedDate?: string;
}

export interface IChronicCondition {
  condition: string;
  diagnosedYear: string;
  status: 'Active' | 'Controlled' | 'In Remission';
  notes?: string;
}

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  abhaId: string;
  abhaAddress?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: IAllergy[];
  medicalHistory: IChronicCondition[];
  registeredDate: string;
  lastVisitDate?: string;
  avatarUrl?: string;
}

const AllergySchema = new Schema<IAllergy>({
  substance: { type: String, required: true },
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe', 'Life-Threatening'], default: 'Moderate' },
  reaction: { type: String, required: true },
  recordedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
});

const ChronicConditionSchema = new Schema<IChronicCondition>({
  condition: { type: String, required: true },
  diagnosedYear: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Controlled', 'In Remission'], default: 'Active' },
  notes: { type: String },
});

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    abhaId: { type: String, required: true, trim: true },
    abhaAddress: { type: String, trim: true },
    address: { type: String, trim: true },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    allergies: [AllergySchema],
    medicalHistory: [ChronicConditionSchema],
    registeredDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    lastVisitDate: { type: String },
    avatarUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const PatientModel = mongoose.model<IPatient>('Patient', PatientSchema);
