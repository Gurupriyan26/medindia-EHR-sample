import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  type: 'In-Person Consultation' | 'Video Follow-up' | 'Lab Review';
  status: 'Scheduled' | 'Waiting' | 'In-Progress' | 'Completed' | 'Cancelled';
  tokenNumber: number;
  reason: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, default: 'General Physician' },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    type: {
      type: String,
      enum: ['In-Person Consultation', 'Video Follow-up', 'Lab Review'],
      default: 'In-Person Consultation',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Waiting', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    tokenNumber: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AppointmentModel = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
