import { Request, Response } from 'express';
import { LabReportModel } from '../models/LabReport.js';

// Get all lab reports (optionally filter by patientId)
export async function getLabReports(req: Request, res: Response) {
  try {
    const { patientId, category, status } = req.query;
    const query: any = {};

    if (patientId) query.patientId = patientId;
    if (category) query.category = category;
    if (status) query.status = status;

    const reports = await LabReportModel.find(query).sort({ reportDate: -1, createdAt: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch lab reports', details: error.message });
  }
}

// Get single lab report
export async function getLabReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await LabReportModel.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'Lab report not found' });
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch lab report', details: error.message });
  }
}

// Create new lab report
export async function createLabReport(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientName,
      testName,
      category,
      orderedByDoctor,
      labName,
      sampleCollectionDate,
      reportDate,
      parameters,
      overallResult,
      status,
      remarks,
    } = req.body;

    if (!patientId || !testName || !orderedByDoctor || !overallResult) {
      return res.status(400).json({
        error: 'Missing required lab report fields: patientId, testName, orderedByDoctor, overallResult',
      });
    }

    const newReport = new LabReportModel({
      patientId,
      patientName,
      testName,
      category: category || 'Biochemistry',
      orderedByDoctor,
      labName: labName || 'MedIndia Central Diagnostics',
      sampleCollectionDate: sampleCollectionDate || new Date().toISOString().split('T')[0],
      reportDate: reportDate || new Date().toISOString().split('T')[0],
      parameters: parameters || [],
      overallResult,
      status: status || 'Normal',
      remarks,
    });

    const saved = await newReport.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create lab report', details: error.message });
  }
}
