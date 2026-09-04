import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient.js';

// Get all patients with search & filtering
export async function getPatients(req: Request, res: Response) {
  try {
    const { search, gender, bloodGroup } = req.query;
    const query: any = {};

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { abhaId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (gender && typeof gender === 'string') {
      query.gender = gender;
    }

    if (bloodGroup && typeof bloodGroup === 'string') {
      query.bloodGroup = bloodGroup;
    }

    const patients = await PatientModel.find(query).sort({ updatedAt: -1 });
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch patients', details: error.message });
  }
}

// Get single patient by ID or ABHA ID
export async function getPatientById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let patient;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await PatientModel.findById(id);
    } else {
      patient = await PatientModel.findOne({ $or: [{ abhaId: id }, { _id: id }] });
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch patient details', details: error.message });
  }
}

// Create new patient
export async function createPatient(req: Request, res: Response) {
  try {
    const { name, age, gender, phone, email, bloodGroup, abhaId, abhaAddress, address, emergencyContact, allergies, medicalHistory } = req.body;

    if (!name || !age || !gender || !phone || !bloodGroup || !abhaId) {
      return res.status(400).json({ error: 'Missing required patient fields: name, age, gender, phone, bloodGroup, abhaId' });
    }

    const newPatient = new PatientModel({
      name,
      age: Number(age),
      gender,
      phone,
      email,
      bloodGroup,
      abhaId,
      abhaAddress: abhaAddress || `${name.toLowerCase().replace(/\s+/g, '.')}${Math.floor(100 + Math.random() * 900)}@abdm`,
      address,
      emergencyContact,
      allergies: allergies || [],
      medicalHistory: medicalHistory || [],
      registeredDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-${gender === 'Female' ? '1494790108377-be9c29b29330' : '1507003211169-0a1dd7228f2d'}?w=150&auto=format&fit=crop&q=80`,
    });

    const saved = await newPatient.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create patient', details: error.message });
  }
}

// Update patient
export async function updatePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await PatientModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update patient', details: error.message });
  }
}

// Delete patient
export async function deletePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await PatientModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient record deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete patient', details: error.message });
  }
}
