import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient.js';
import { isMongoConnected, MOCK_PATIENTS } from '../data/mockFallback.js';

// Get all patients with search & filtering
export async function getPatients(req: Request, res: Response) {
  try {
    if (!isMongoConnected()) {
      let results = [...MOCK_PATIENTS];
      const { search, gender, bloodGroup } = req.query;
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.abhaId.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q)
        );
      }
      if (gender && typeof gender === 'string') results = results.filter(p => p.gender === gender);
      if (bloodGroup && typeof bloodGroup === 'string') results = results.filter(p => p.bloodGroup === bloodGroup);
      return res.json(results);
    }

    const { search, gender, bloodGroup } = req.query;
    const query: any = {};
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { abhaId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (gender && typeof gender === 'string') query.gender = gender;
    if (bloodGroup && typeof bloodGroup === 'string') query.bloodGroup = bloodGroup;

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

    if (!isMongoConnected()) {
      const patient = MOCK_PATIENTS.find(p => p._id === id || p.abhaId === id);
      if (!patient) return res.status(404).json({ error: 'Patient not found' });
      return res.json(patient);
    }

    let patient;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await PatientModel.findById(id);
    } else {
      patient = await PatientModel.findOne({ $or: [{ abhaId: id }, { _id: id }] });
    }
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
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

    if (!isMongoConnected()) {
      // Return a mock-created patient without persisting (demo mode)
      const mockPatient = {
        _id: `pat-mock-${Date.now()}`,
        id: `pat-mock-${Date.now()}`,
        name, age: Number(age), gender, phone, email: email || '', bloodGroup, abhaId,
        abhaAddress: abhaAddress || `${name.toLowerCase().replace(/\s+/g, '.')}@abdm`,
        address: address || '',
        emergencyContact: emergencyContact || {},
        allergies: allergies || [],
        medicalHistory: medicalHistory || [],
        registeredDate: new Date().toISOString().split('T')[0],
        lastVisitDate: null,
        avatarUrl: `https://images.unsplash.com/photo-${gender === 'Female' ? '1494790108377-be9c29b29330' : '1507003211169-0a1dd7228f2d'}?w=150&auto=format&fit=crop&q=80`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return res.status(201).json(mockPatient);
    }

    const newPatient = new PatientModel({
      name, age: Number(age), gender, phone, email, bloodGroup, abhaId,
      abhaAddress: abhaAddress || `${name.toLowerCase().replace(/\s+/g, '.')}${Math.floor(100 + Math.random() * 900)}@abdm`,
      address, emergencyContact, allergies: allergies || [], medicalHistory: medicalHistory || [],
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

    if (!isMongoConnected()) {
      const patient = MOCK_PATIENTS.find(p => p._id === id);
      if (!patient) return res.status(404).json({ error: 'Patient not found' });
      return res.json({ ...patient, ...req.body, updatedAt: new Date().toISOString() });
    }

    const updated = await PatientModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Patient not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update patient', details: error.message });
  }
}

// Delete patient
export async function deletePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      return res.json({ message: 'Patient record deleted successfully (demo mode)', id });
    }

    const deleted = await PatientModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient record deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete patient', details: error.message });
  }
}
