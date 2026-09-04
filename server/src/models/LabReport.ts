import mongoose, { Document, Schema } from 'mongoose';

export interface ILabParameter {
  name: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface ILabReport extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName?: string;
  testName: string;
  category: 'Biochemistry' | 'Hematology' | 'Radiology' | 'Pathology' | 'Microbiology' | 'Cardiology';
  orderedByDoctor: string;
  labName: string;
  sampleCollectionDate: string;
  reportDate: string;
  parameters: ILabParameter[];
  overallResult: string;
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  remarks?: string;
  pdfUrl?: string;
}

const LabParameterSchema = new Schema<ILabParameter>({
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  referenceRange: { type: String, default: '' },
  isAbnormal: { type: Boolean, default: false },
});

const LabReportSchema = new Schema<ILabReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String },
    testName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Biochemistry', 'Hematology', 'Radiology', 'Pathology', 'Microbiology', 'Cardiology'],
      default: 'Biochemistry',
    },
    orderedByDoctor: { type: String, required: true },
    labName: { type: String, default: 'MedIndia Central Diagnostics' },
    sampleCollectionDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    reportDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    parameters: [LabParameterSchema],
    overallResult: { type: String, required: true },
    status: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Critical', 'Pending'],
      default: 'Normal',
    },
    remarks: { type: String },
    pdfUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const LabReportModel = mongoose.model<ILabReport>('LabReport', LabReportSchema);
