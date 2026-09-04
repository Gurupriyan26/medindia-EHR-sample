import {
  Patient,
  Visit,
  LabReport,
  ConsentArtefact,
  Appointment,
  AISummaryResponse,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_VISITS,
  INITIAL_LAB_REPORTS,
  INITIAL_CONSENTS,
  INITIAL_APPOINTMENTS,
} from '../data/mockData';

const API_BASE = '/api';

// Helper to check if backend is reachable
let isBackendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (isBackendAvailable !== null) return isBackendAvailable;
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1200) });
    isBackendAvailable = res.ok;
  } catch {
    isBackendAvailable = false;
  }
  return isBackendAvailable;
}

// Local storage keys
const LS_KEYS = {
  PATIENTS: 'medindia_patients_v1',
  VISITS: 'medindia_visits_v1',
  LABS: 'medindia_labs_v1',
  CONSENTS: 'medindia_consents_v1',
  APPOINTMENTS: 'medindia_appointments_v1',
};

// Local storage helpers
function getLocal<T>(key: string, defaultVal: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(data);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// Client-side AI Summary synthesis fallback
function generateClientAISummary(
  patient: Patient,
  visits: Visit[],
  labs: LabReport[]
): AISummaryResponse {
  const activeConditions = (patient.medicalHistory || []).filter(c => c.status === 'Active');
  const allergies = patient.allergies || [];
  const latestVisit = visits && visits.length > 0 ? visits[0] : undefined;

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

  const allergySummary = allergies.map(
    a => `⚠️ ${a.substance.toUpperCase()}: ${a.severity} risk (${a.reaction}) - Recorded: ${a.recordedDate || 'N/A'}`
  );
  if (allergySummary.length === 0) {
    allergySummary.push('No documented drug or food allergies on record (NKDA).');
  }

  const activeCondSummary = activeConditions.map(
    c => `• ${c.condition} (Diagnosed ${c.diagnosedYear}): ${c.notes || 'Under active clinical management'}`
  );
  if (activeCondSummary.length === 0) {
    activeCondSummary.push('No chronic long-term comorbidities documented.');
  }

  const consultSummary = (visits || []).slice(0, 3).map(
    v => `${v.date} (${v.visitType} by ${v.doctorName}): ${v.diagnosis} — Complaint: "${v.chiefComplaint}"`
  );
  if (consultSummary.length === 0) {
    consultSummary.push('No prior clinical consultation encounters recorded in this facility.');
  }

  const labSummary = (labs || []).slice(0, 4).map(l => {
    const abnormalParams = (l.parameters || []).filter(p => p.isAbnormal);
    if (abnormalParams.length > 0) {
      return `🔴 ${l.testName} (${l.reportDate}): Marked ${l.status} — ${l.overallResult} [${abnormalParams.map(p => `${p.name}: ${p.value} ${p.unit}`).join(', ')}]`;
    }
    return `🟢 ${l.testName} (${l.reportDate}): Within Normal Limits — ${l.overallResult}`;
  });
  if (labSummary.length === 0) {
    labSummary.push('No diagnostic laboratory reports available in record.');
  }

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

  const conditionsStr = activeConditions.length > 0
    ? activeConditions.map(c => c.condition).join(' and ')
    : 'general health monitoring';
  
  const allergyWarningStr = allergies.length > 0
    ? ` Note documented allergy to ${allergies.map(a => a.substance).join(', ')}.`
    : '';

  const executive = `${patient.name} is a ${patient.age}-year-old ${patient.gender} currently undergoing clinical care for ${conditionsStr}.${allergyWarningStr} Patient currently has ${currentMedications.length} active medication regimen(s). Latest encounter was on ${patient.lastVisitDate || latestVisit?.date || 'recent date'}.`;

  return {
    patientId: patient._id || patient.id || 'pat-001',
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

export const api = {
  // PATIENTS
  async getPatients(): Promise<Patient[]> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/patients`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getPatients failed, using local store');
      }
    }
    return getLocal(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
  },

  async getPatientById(id: string): Promise<Patient | null> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/patients/${id}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getPatientById failed, using local store');
      }
    }
    const list = getLocal<Patient>(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
    return list.find(p => p._id === id || p.id === id || p.abhaId === id) || null;
  },

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend createPatient failed, saving locally');
      }
    }

    const list = getLocal<Patient>(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
    const newId = `pat-${Date.now().toString().slice(-4)}`;
    const newPatient: Patient = {
      _id: newId,
      id: newId,
      name: patientData.name || 'New Patient',
      age: Number(patientData.age) || 30,
      gender: patientData.gender || 'Male',
      phone: patientData.phone || '+91 90000 00000',
      email: patientData.email || '',
      bloodGroup: patientData.bloodGroup || 'O+',
      abhaId: patientData.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      abhaAddress: patientData.abhaAddress || `${patientData.name?.toLowerCase().replace(/\s+/g, '.') || 'patient'}@abdm`,
      address: patientData.address || '',
      emergencyContact: patientData.emergencyContact,
      allergies: patientData.allergies || [],
      medicalHistory: patientData.medicalHistory || [],
      registeredDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-${patientData.gender === 'Female' ? '1494790108377-be9c29b29330' : '1507003211169-0a1dd7228f2d'}?w=150&auto=format&fit=crop&q=80`,
    };

    list.unshift(newPatient);
    setLocal(LS_KEYS.PATIENTS, list);
    return newPatient;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/patients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend updatePatient failed, updating locally');
      }
    }

    const list = getLocal<Patient>(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
    const index = list.findIndex(p => p._id === id || p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setLocal(LS_KEYS.PATIENTS, list);
      return list[index];
    }
    throw new Error('Patient not found');
  },

  // VISITS / CONSULTATIONS
  async getVisits(patientId?: string): Promise<Visit[]> {
    if (await checkBackend()) {
      try {
        const url = patientId ? `${API_BASE}/visits?patientId=${patientId}` : `${API_BASE}/visits`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getVisits failed, using local store');
      }
    }

    const list = getLocal<Visit>(LS_KEYS.VISITS, INITIAL_VISITS);
    if (patientId) {
      return list.filter(v => v.patientId === patientId);
    }
    return list;
  },

  async createVisit(visitData: Partial<Visit>): Promise<Visit> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend createVisit failed, saving locally');
      }
    }

    const list = getLocal<Visit>(LS_KEYS.VISITS, INITIAL_VISITS);
    const newId = `vis-${Date.now().toString().slice(-4)}`;
    const newVisit: Visit = {
      _id: newId,
      id: newId,
      patientId: visitData.patientId || '',
      patientName: visitData.patientName || '',
      doctorName: visitData.doctorName || 'Dr. Sarah Rao, MD',
      doctorSpecialty: visitData.doctorSpecialty || 'Cardiologist & General Physician',
      clinicOrHospital: visitData.clinicOrHospital || 'MedIndia Apex Care Clinic',
      date: visitData.date || new Date().toISOString().split('T')[0],
      visitType: visitData.visitType || 'General Consultation',
      chiefComplaint: visitData.chiefComplaint || '',
      symptoms: visitData.symptoms || [],
      vitals: visitData.vitals || {},
      clinicalExamination: visitData.clinicalExamination || '',
      diagnosis: visitData.diagnosis || '',
      icd10Code: visitData.icd10Code || '',
      clinicalNotes: visitData.clinicalNotes || '',
      prescriptions: visitData.prescriptions || [],
      orderedLabTests: visitData.orderedLabTests || [],
      followUpDate: visitData.followUpDate,
      status: 'Completed',
    };

    list.unshift(newVisit);
    setLocal(LS_KEYS.VISITS, list);

    // Update patient's last visit date
    if (visitData.patientId) {
      const pList = getLocal<Patient>(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
      const pIdx = pList.findIndex(p => p._id === visitData.patientId || p.id === visitData.patientId);
      if (pIdx !== -1) {
        pList[pIdx].lastVisitDate = newVisit.date;
        setLocal(LS_KEYS.PATIENTS, pList);
      }
    }

    return newVisit;
  },

  // LAB REPORTS
  async getLabReports(patientId?: string): Promise<LabReport[]> {
    if (await checkBackend()) {
      try {
        const url = patientId ? `${API_BASE}/labs?patientId=${patientId}` : `${API_BASE}/labs`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getLabReports failed, using local store');
      }
    }

    const list = getLocal<LabReport>(LS_KEYS.LABS, INITIAL_LAB_REPORTS);
    if (patientId) {
      return list.filter(l => l.patientId === patientId);
    }
    return list;
  },

  async createLabReport(labData: Partial<LabReport>): Promise<LabReport> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/labs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(labData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend createLabReport failed, saving locally');
      }
    }

    const list = getLocal<LabReport>(LS_KEYS.LABS, INITIAL_LAB_REPORTS);
    const newId = `lab-${Date.now().toString().slice(-4)}`;
    const newReport: LabReport = {
      _id: newId,
      id: newId,
      patientId: labData.patientId || '',
      patientName: labData.patientName || '',
      testName: labData.testName || 'Diagnostic Panel',
      category: labData.category || 'Biochemistry',
      orderedByDoctor: labData.orderedByDoctor || 'Dr. Sarah Rao, MD',
      labName: labData.labName || 'MedIndia Central Diagnostics',
      sampleCollectionDate: labData.sampleCollectionDate || new Date().toISOString().split('T')[0],
      reportDate: labData.reportDate || new Date().toISOString().split('T')[0],
      parameters: labData.parameters || [],
      overallResult: labData.overallResult || 'Completed',
      status: labData.status || 'Normal',
      remarks: labData.remarks || '',
    };

    list.unshift(newReport);
    setLocal(LS_KEYS.LABS, list);
    return newReport;
  },

  // CONSENTS
  async getConsents(patientId?: string): Promise<ConsentArtefact[]> {
    if (await checkBackend()) {
      try {
        const url = patientId ? `${API_BASE}/consents?patientId=${patientId}` : `${API_BASE}/consents`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getConsents failed, using local store');
      }
    }

    const list = getLocal<ConsentArtefact>(LS_KEYS.CONSENTS, INITIAL_CONSENTS);
    if (patientId) {
      return list.filter(c => c.patientId === patientId);
    }
    return list;
  },

  async updateConsentStatus(id: string, status: 'GRANTED' | 'REVOKED'): Promise<ConsentArtefact> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/consents/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend updateConsentStatus failed, updating locally');
      }
    }

    const list = getLocal<ConsentArtefact>(LS_KEYS.CONSENTS, INITIAL_CONSENTS);
    const idx = list.findIndex(c => c._id === id || c.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (status === 'REVOKED') list[idx].revokedAt = new Date().toISOString();
      if (status === 'GRANTED') list[idx].grantedAt = new Date().toISOString();
      setLocal(LS_KEYS.CONSENTS, list);
      return list[idx];
    }
    throw new Error('Consent artefact not found');
  },

  async createConsent(data: Partial<ConsentArtefact>): Promise<ConsentArtefact> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/consents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend createConsent failed, saving locally');
      }
    }

    const list = getLocal<ConsentArtefact>(LS_KEYS.CONSENTS, INITIAL_CONSENTS);
    const newId = `con-${Date.now().toString().slice(-4)}`;
    const newConsent: ConsentArtefact = {
      _id: newId,
      id: newId,
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      patientAbhaId: data.patientAbhaId || '',
      requesterName: data.requesterName || 'Apollo Tele-Specialty Network',
      requesterType: data.requesterType || 'HIU',
      purpose: data.purpose || 'Care Management',
      dataTypes: data.dataTypes || ['EHR / Consultations', 'Prescriptions', 'Diagnostic Lab Reports'],
      permissionMode: data.permissionMode || 'VIEW',
      dateFrom: data.dateFrom || new Date().toISOString().split('T')[0],
      dateTo: data.dateTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiryDate: data.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'GRANTED',
      grantedAt: new Date().toISOString(),
      signatureMock: 'ABDM-MOCK-SIG-' + Math.random().toString(36).substring(2, 10),
    };

    list.unshift(newConsent);
    setLocal(LS_KEYS.CONSENTS, list);
    return newConsent;
  },

  // APPOINTMENTS
  async getAppointments(): Promise<Appointment[]> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/appointments`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getAppointments failed, using local store');
      }
    }
    return getLocal<Appointment>(LS_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend updateAppointmentStatus failed, updating locally');
      }
    }

    const list = getLocal<Appointment>(LS_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const idx = list.findIndex(a => a._id === id || a.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      setLocal(LS_KEYS.APPOINTMENTS, list);
      return list[idx];
    }
    throw new Error('Appointment not found');
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend createAppointment failed, saving locally');
      }
    }

    const list = getLocal<Appointment>(LS_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const newId = `apt-${Date.now().toString().slice(-4)}`;
    const newApt: Appointment = {
      _id: newId,
      id: newId,
      patientId: data.patientId || '',
      patientName: data.patientName || '',
      patientAge: data.patientAge || 30,
      patientGender: data.patientGender || 'Male',
      doctorName: data.doctorName || 'Dr. Sarah Rao',
      specialty: data.specialty || 'Cardiologist & General Physician',
      date: data.date || new Date().toISOString().split('T')[0],
      timeSlot: data.timeSlot || '10:00 AM',
      type: data.type || 'In-Person Consultation',
      status: 'Scheduled',
      tokenNumber: list.length + 1,
      reason: data.reason || 'Clinical Consultation',
    };

    list.push(newApt);
    setLocal(LS_KEYS.APPOINTMENTS, list);
    return newApt;
  },

  // AI SUMMARY
  async generateAISummary(patientId: string): Promise<AISummaryResponse> {
    if (await checkBackend()) {
      try {
        const res = await fetch(`${API_BASE}/ai/patient-summary/${patientId}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend AI Summary call failed, using client fallback engine');
      }
    }

    const patient = await this.getPatientById(patientId);
    if (!patient) throw new Error('Patient not found for AI summary');

    const visits = await this.getVisits(patientId);
    const labs = await this.getLabReports(patientId);

    // Simulate short network delay for smooth UI feeling
    await new Promise(r => setTimeout(r, 600));

    return generateClientAISummary(patient, visits, labs);
  },

  // RESET TO INITIAL SEED DATA
  resetDemoData() {
    localStorage.setItem(LS_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(LS_KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
    localStorage.setItem(LS_KEYS.LABS, JSON.stringify(INITIAL_LAB_REPORTS));
    localStorage.setItem(LS_KEYS.CONSENTS, JSON.stringify(INITIAL_CONSENTS));
    localStorage.setItem(LS_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  },
};
