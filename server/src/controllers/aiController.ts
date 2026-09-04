import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient.js';
import { VisitModel } from '../models/Visit.js';
import { LabReportModel } from '../models/LabReport.js';
import { generatePatientSummary } from '../services/aiSummaryService.js';

export async function getAIPatientSummary(req: Request, res: Response) {
  try {
    const { patientId } = req.params;

    let patient;
    if (patientId.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await PatientModel.findById(patientId);
    } else {
      patient = await PatientModel.findOne({ $or: [{ _id: patientId }, { abhaId: patientId }] });
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found to generate AI summary' });
    }

    const visits = await VisitModel.find({ patientId: patient._id }).sort({ date: -1 });
    const labReports = await LabReportModel.find({ patientId: patient._id }).sort({ reportDate: -1 });

    const summary = await generatePatientSummary(patient, visits, labReports);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate AI Patient Summary',
      details: error.message,
    });
  }
}
