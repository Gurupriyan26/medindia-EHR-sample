import { Request, Response } from 'express';
import { ConsentModel } from '../models/Consent.js';

// Get consent records (filter by patientId)
export async function getConsents(req: Request, res: Response) {
  try {
    const { patientId, status } = req.query;
    const query: any = {};

    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const consents = await ConsentModel.find(query).sort({ createdAt: -1 });
    res.json(consents);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch consent records', details: error.message });
  }
}

// Create new consent artefact
export async function createConsent(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientName,
      patientAbhaId,
      requesterName,
      requesterType,
      purpose,
      dataTypes,
      permissionMode,
      dateFrom,
      dateTo,
      expiryDate,
    } = req.body;

    if (!patientId || !requesterName || !purpose) {
      return res.status(400).json({
        error: 'Missing required consent fields: patientId, requesterName, purpose',
      });
    }

    const newConsent = new ConsentModel({
      patientId,
      patientName,
      patientAbhaId,
      requesterName,
      requesterType: requesterType || 'Doctor',
      purpose,
      dataTypes: dataTypes || ['EHR / Consultations', 'Prescriptions', 'Diagnostic Lab Reports'],
      permissionMode: permissionMode || 'VIEW',
      dateFrom: dateFrom || new Date().toISOString().split('T')[0],
      dateTo: dateTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'GRANTED',
      grantedAt: new Date().toISOString(),
    });

    const saved = await newConsent.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create consent artefact', details: error.message });
  }
}

// Update consent status (Revoke / Grant)
export async function updateConsentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['GRANTED', 'REVOKED', 'REQUESTED', 'EXPIRED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid consent status' });
    }

    const updatePayload: any = { status };
    if (status === 'REVOKED') {
      updatePayload.revokedAt = new Date().toISOString();
    } else if (status === 'GRANTED') {
      updatePayload.grantedAt = new Date().toISOString();
    }

    const updated = await ConsentModel.findByIdAndUpdate(id, updatePayload, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Consent artefact not found' });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update consent status', details: error.message });
  }
}
