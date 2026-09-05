import { Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment.js';
import { isMongoConnected, MOCK_APPOINTMENTS } from '../data/mockFallback.js';

// In-memory mutable store for demo-mode appointment updates
let mockAppointments = [...MOCK_APPOINTMENTS];

// Get all appointments
export async function getAppointments(req: Request, res: Response) {
  try {
    if (!isMongoConnected()) {
      const { date, status, doctorName } = req.query;
      let results = [...mockAppointments];
      if (date) results = results.filter(a => a.date === date);
      if (status) results = results.filter(a => a.status === status);
      if (doctorName && typeof doctorName === 'string')
        results = results.filter(a => a.doctorName.toLowerCase().includes(doctorName.toLowerCase()));
      return res.json(results);
    }

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
      patientId, patientName, patientAge, patientGender,
      doctorName, specialty, date, timeSlot, type, reason,
    } = req.body;

    if (!patientId || !patientName || !doctorName || !date || !timeSlot || !reason) {
      return res.status(400).json({ error: 'Missing required appointment fields: patientId, patientName, doctorName, date, timeSlot, reason' });
    }

    if (!isMongoConnected()) {
      const mockAppointment = {
        _id: `appt-mock-${Date.now()}`,
        id: `appt-mock-${Date.now()}`,
        patientId, patientName, patientAge: Number(patientAge) || 30,
        patientGender: patientGender || 'Male', doctorName,
        specialty: specialty || 'General Physician',
        date, timeSlot, type: type || 'In-Person Consultation',
        status: 'Scheduled' as const,
        tokenNumber: mockAppointments.length + 1,
        reason, createdAt: new Date().toISOString(),
      };
      mockAppointments = [...mockAppointments, mockAppointment];
      return res.status(201).json(mockAppointment);
    }

    const count = await AppointmentModel.countDocuments({ date: date || new Date().toISOString().split('T')[0] });
    const newAppointment = new AppointmentModel({
      patientId, patientName, patientAge: Number(patientAge) || 30,
      patientGender: patientGender || 'Male', doctorName,
      specialty: specialty || 'General Physician',
      date, timeSlot, type: type || 'In-Person Consultation',
      status: 'Scheduled', tokenNumber: count + 1, reason,
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

    if (!isMongoConnected()) {
      const idx = mockAppointments.findIndex(a => a._id === id);
      if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
      mockAppointments[idx] = { ...mockAppointments[idx], status };
      return res.json(mockAppointments[idx]);
    }

    const updated = await AppointmentModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Appointment not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update appointment', details: error.message });
  }
}
