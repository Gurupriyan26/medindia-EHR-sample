import mongoose, { Document, Schema } from 'mongoose';

export interface IConsent extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName?: string;
  patientAbhaId?: string;
  requesterName: string;
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

const ConsentSchema = new Schema<IConsent>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String },
    patientAbhaId: { type: String },
    requesterName: { type: String, required: true },
    requesterType: {
      type: String,
      enum: ['HIU', 'Doctor', 'Diagnostic Lab', 'Hospital'],
      default: 'Doctor',
    },
    purpose: {
      type: String,
      enum: ['Care Management', 'Second Opinion', 'Diagnostic Review', 'Emergency Access'],
      default: 'Care Management',
    },
    dataTypes: [
      {
        type: String,
        enum: ['EHR / Consultations', 'Prescriptions', 'Diagnostic Lab Reports', 'Immunization'],
      },
    ],
    permissionMode: {
      type: String,
      enum: ['VIEW', 'STORE', 'QUERY'],
      default: 'VIEW',
    },
    dateFrom: { type: String, required: true },
    dateTo: { type: String, required: true },
    expiryDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['GRANTED', 'REVOKED', 'REQUESTED', 'EXPIRED'],
      default: 'GRANTED',
    },
    grantedAt: { type: String },
    revokedAt: { type: String },
    signatureMock: { type: String, default: () => 'ABDM-MOCK-SIG-' + Math.random().toString(36).substring(2, 12) },
  },
  {
    timestamps: true,
  }
);

export const ConsentModel = mongoose.model<IConsent>('Consent', ConsentSchema);
