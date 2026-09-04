import { Request, Response } from 'express';
import { VisitModel } from '../models/Visit.js';
import { PatientModel } from '../models/Patient.js';

// Get visits (optionally filter by patientId)
export async function getVisits(req: Request, res: Response) {
  try {
    const { patientId } = req.query;
    const query: any = {};

    if (patientId) {
      query.patientId = patientId;
    }

    const visits = await VisitModel.find(query).sort({ date: -1, createdAt: -1 });
    res.json(visits);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch visits', details: error.message });
  }
}

// Get visit by ID
export async function getVisitById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const visit = await VisitModel.findById(id);

    if (!visit) {
      return res.status(404).json({ error: 'Visit encounter not found' });
    }

    res.json(visit);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch visit', details: error.message });
  }
}

// Create new visit / consultation
export async function createVisit(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientName,
      doctorName,
      doctorSpecialty,
      clinicOrHospital,
      date,
      visitType,
      chiefComplaint,
      symptoms,
      vitals,
      clinicalExamination,
      diagnosis,
      icd10Code,
      clinicalNotes,
      prescriptions,
      orderedLabTests,
      followUpDate,
    } = req.body;

    if (!patientId || !doctorName || !chiefComplaint || !diagnosis) {
      return res.status(400).json({
        error: 'Missing required visit fields: patientId, doctorName, chiefComplaint, diagnosis',
      });
    }

    const newVisit = new VisitModel({
      patientId,
      patientName,
      doctorName,
      doctorSpecialty: doctorSpecialty || 'Cardiologist & General Physician',
      clinicOrHospital: clinicOrHospital || 'MedIndia Apex Care Clinic',
      date: date || new Date().toISOString().split('T')[0],
      visitType: visitType || 'General Consultation',
      chiefComplaint,
      symptoms: symptoms || [],
      vitals: vitals || {},
      clinicalExamination,
      diagnosis,
      icd10Code,
      clinicalNotes,
      prescriptions: prescriptions || [],
      orderedLabTests: orderedLabTests || [],
      followUpDate,
      status: 'Completed',
    });

    const saved = await newVisit.save();

    // Update patient's lastVisitDate
    await PatientModel.findByIdAndUpdate(patientId, {
      lastVisitDate: saved.date,
    });

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to record consultation visit', details: error.message });
  }
}
