import { IPatient } from '../models/Patient.js';
import { IVisit } from '../models/Visit.js';
import { ILabReport } from '../models/LabReport.js';

export interface AISummaryResult {
  patientId: string;
  patientName: string;
  generatedAt: string;
  executiveSummary: string;
  activeConditionsSummary: string[];
  medicationRegimenSummary: string[];
  criticalAllergiesSummary: string[];
  recentConsultationsSummary: string[];
  labHighlightsSummary: string[];
  suggestedClinicalFocus: string[];
  disclaimer: string;
  source: 'OpenAI' | 'Built-in Clinical NLP';
}

export async function generatePatientSummary(
  patient: IPatient,
  visits: IVisit[],
  labReports: ILabReport[]
): Promise<AISummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 0 && !apiKey.includes('your_api_key')) {
    try {
      return await generateWithOpenAI(apiKey, patient, visits, labReports);
    } catch (err) {
      console.warn('OpenAI API call failed or timed out, falling back to Clinical NLP engine:', err);
      return generateWithClinicalNLP(patient, visits, labReports);
    }
  }

  return generateWithClinicalNLP(patient, visits, labReports);
}

async function generateWithOpenAI(
  apiKey: string,
  patient: IPatient,
  visits: IVisit[],
  labs: ILabReport[]
): Promise<AISummaryResult> {
  const prompt = `You are a clinical assistant reviewing an Electronic Health Record (EHR) for an Indian healthcare practitioner.
Patient: ${patient.name}, ${patient.age} y/o ${patient.gender}, Blood Group ${patient.bloodGroup}, ABHA ID: ${patient.abhaId}.
Allergies: ${patient.allergies.map(a => `${a.substance} (${a.severity}: ${a.reaction})`).join(', ') || 'None known'}.
Medical History: ${patient.medicalHistory.map(m => `${m.condition} (${m.status}, diag: ${m.diagnosedYear}) - ${m.notes || ''}`).join('; ')}.
Recent Visits: ${visits.map(v => `${v.date}: ${v.diagnosis} (Complaint: ${v.chiefComplaint}) | Meds: ${v.prescriptions.map(p => `${p.medicineName} ${p.dosage} ${p.frequency}`).join(', ')}`).join(' | ')}.
Recent Labs: ${labs.map(l => `${l.testName} (${l.reportDate}) - Status: ${l.status}, Result: ${l.overallResult}`).join(' | ')}.

Return ONLY valid JSON matching this schema:
{
  "executiveSummary": "string",
  "activeConditionsSummary": ["string"],
  "medicationRegimenSummary": ["string"],
  "criticalAllergiesSummary": ["string"],
  "recentConsultationsSummary": ["string"],
  "labHighlightsSummary": ["string"],
  "suggestedClinicalFocus": ["string"]
}
Do not diagnose new conditions or prescribe drugs.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Clinical Summarization assistant. Synthesize existing records concisely. Output valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI HTTP error ${response.status}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return {
    patientId: (patient._id || patient.id).toString(),
    patientName: patient.name,
    generatedAt: new Date().toISOString(),
    executiveSummary: parsed.executiveSummary || `${patient.name} is a ${patient.age}-year-old ${patient.gender} with ongoing chronic care management.`,
    activeConditionsSummary: parsed.activeConditionsSummary || [],
    medicationRegimenSummary: parsed.medicationRegimenSummary || [],
    criticalAllergiesSummary: parsed.criticalAllergiesSummary || [],
    recentConsultationsSummary: parsed.recentConsultationsSummary || [],
    labHighlightsSummary: parsed.labHighlightsSummary || [],
    suggestedClinicalFocus: parsed.suggestedClinicalFocus || [],
    disclaimer: 'AI-generated clinical summary for healthcare professional reference only. Not a medical diagnosis or treatment directive.',
    source: 'OpenAI',
  };
}

export function generateWithClinicalNLP(
  patient: IPatient,
  visits: IVisit[],
  labs: ILabReport[]
): AISummaryResult {
  const activeConditions = (patient.medicalHistory || []).filter(c => c.status === 'Active');
  const allergies = patient.allergies || [];
  const latestVisit = visits && visits.length > 0 ? visits[0] : undefined;

  // Extract all recent unique medications from recent visits
  const currentMedications: string[] = [];
  const medSet = new Set<string>();
  (visits || []).forEach(v => {
    (v.prescriptions || []).forEach(p => {
      const medKey = `${p.medicineName} (${p.dosage}, ${p.frequency})`;
      if (!medSet.has(medKey)) {
        medSet.add(medKey);
        currentMedications.push(`${p.medicineName} ${p.dosage} - ${p.frequency} [${p.timing}]`);
      }
    });
  });

  // Critical Allergies
  const allergySummary = allergies.map(
    a => `⚠️ ${a.substance.toUpperCase()}: ${a.severity} risk (${a.reaction}) - Recorded: ${a.recordedDate || 'N/A'}`
  );
  if (allergySummary.length === 0) {
    allergySummary.push('No documented drug or food allergies on record (NKDA).');
  }

  // Active conditions
  const activeCondSummary = activeConditions.map(
    c => `• ${c.condition} (Diagnosed ${c.diagnosedYear}): ${c.notes || 'Under active clinical monitoring'}`
  );
  if (activeCondSummary.length === 0) {
    activeCondSummary.push('No chronic long-term comorbidities documented.');
  }

  // Recent visits summary
  const consultSummary = (visits || []).slice(0, 3).map(
    v => `${v.date} (${v.visitType} by ${v.doctorName}): ${v.diagnosis} — Complaint: "${v.chiefComplaint}"`
  );
  if (consultSummary.length === 0) {
    consultSummary.push('No prior clinical consultation encounters recorded in this facility.');
  }

  // Lab highlights
  const labSummary = (labs || []).slice(0, 4).map(l => {
    const abnormalParams = (l.parameters || []).filter(p => p.isAbnormal);
    if (abnormalParams.length > 0) {
      return `🔴 ${l.testName} (${l.reportDate}): Marked ${l.status} — ${l.overallResult} [${abnormalParams.map(p => `${p.name}: ${p.value} ${p.unit} (Ref: ${p.referenceRange})`).join(', ')}]`;
    }
    return `🟢 ${l.testName} (${l.reportDate}): Within Normal Limits — ${l.overallResult}`;
  });
  if (labSummary.length === 0) {
    labSummary.push('No diagnostic laboratory reports available in record.');
  }

  // Suggested Clinical Focus
  const focusItems: string[] = [];
  if (allergies.some(a => a.severity === 'Severe' || a.severity === 'Life-Threatening')) {
    const severeMeds = allergies.filter(a => a.severity === 'Severe' || a.severity === 'Life-Threatening').map(a => a.substance).join(', ');
    focusItems.push(`Verify non-exposure to contraindicated agents: ${severeMeds}.`);
  }

  if (labs.some(l => l.status === 'Abnormal' || l.status === 'Critical')) {
    focusItems.push('Review recent abnormal laboratory parameters and assess need for therapeutic titration.');
  }

  if (latestVisit?.vitals?.bloodPressure) {
    focusItems.push(`Re-evaluate vital signs (Last BP was ${latestVisit.vitals.bloodPressure}, BMI: ${latestVisit.vitals.bmi || 'N/A'}).`);
  }

  focusItems.push('Verify treatment adherence and assess patient symptom trajectory since last encounter.');

  // Executive synthesis
  const conditionsStr = activeConditions.length > 0
    ? activeConditions.map(c => c.condition).join(' and ')
    : 'general health monitoring';
  
  const allergyWarningStr = allergies.length > 0
    ? ` Patient has documented allergy to ${allergies.map(a => a.substance).join(', ')}.`
    : '';

  const executive = `${patient.name} is a ${patient.age}-year-old ${patient.gender} currently receiving care for ${conditionsStr}.${allergyWarningStr} Currently on ${currentMedications.length} prescribed active medication(s). Latest encounter was on ${patient.lastVisitDate || latestVisit?.date || 'recent date'}.`;

  return {
    patientId: (patient._id || patient.id).toString(),
    patientName: patient.name,
    generatedAt: new Date().toISOString(),
    executiveSummary: executive,
    activeConditionsSummary: activeCondSummary,
    medicationRegimenSummary: currentMedications.length > 0 ? currentMedications : ['No active prescriptions recorded.'],
    criticalAllergiesSummary: allergySummary,
    recentConsultationsSummary: consultSummary,
    labHighlightsSummary: labSummary,
    suggestedClinicalFocus: focusItems,
    disclaimer: 'AI-generated clinical summary for healthcare professional reference only. Not a medical diagnosis or treatment directive.',
    source: 'Built-in Clinical NLP',
  };
}
