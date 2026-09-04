import { Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment.js';

// Get all appointments
export async function getAppointments(req: Request, res: Response) {
  try {
    const { date, status, doctorName } = req.query;
    const query: any = {};

    if (date) query.date = date;
    if (status) query.status = status;
    if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };

    const appointments = await AppointmentModel.find(query).sort({ tokenNumber: 1, timeSlot: 1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: error.message });
  }
}

// Create appointment
export async function createAppointment(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientName,
      patientAge,
      patientGender,
      doctorName,
      specialty,
      date,
      timeSlot,
      type,
      reason,
    } = req.body;

    if (!patientId || !patientName || !doctorName || !date || !timeSlot || !reason) {
      return res.status(400).json({
        error: 'Missing required appointment fields: patientId, patientName, doctorName, date, timeSlot, reason',
      });
    }

    const count = await AppointmentModel.countDocuments({ date: date || new Date().toISOString().split('T')[0] });

    const newAppointment = new AppointmentModel({
      patientId,
      patientName,
      patientAge: Number(patientAge) || 30,
      patientGender: patientGender || 'Male',
      doctorName,
      specialty: specialty || 'General Physician',
      date,
      timeSlot,
      type: type || 'In-Person Consultation',
      status: 'Scheduled',
      tokenNumber: count + 1,
      reason,
    });

    const saved = await newAppointment.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create appointment', details: error.message });
  }
}

// Update appointment status
export async function updateAppointmentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await AppointmentModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update appointment', details: error.message });
  }
}
