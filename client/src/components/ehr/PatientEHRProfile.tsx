import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Visit, LabReport, ConsentArtefact, TimelineEvent } from '../../types';
import { Badge } from '../common/Badge';
import { ClinicalTimeline } from './ClinicalTimeline';
import {
  Shield,
  QrCode,
  Sparkles,
  Stethoscope,
  FlaskConical,
  Pill,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Activity,
  Edit2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface PatientEHRProfileProps {
  onEditPatient: (patient: Patient) => void;
  onOpenLabModal: () => void;
}

export const PatientEHRProfile: React.FC<PatientEHRProfileProps> = ({
  onEditPatient,
  onOpenLabModal,
}) => {
  const {
    selectedPatient,
    visits,
    labReports,
    consents,
    openAiSummaryModal,
    setActiveTab,
    setSelectedPatientId,
    patients,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'timeline' | 'visits' | 'medications' | 'labs' | 'consent'
  >('overview');

  if (!selectedPatient) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-600">No patient selected.</p>
        <button
          onClick={() => setActiveTab('patients')}
          className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Select from Patient Registry
        </button>
      </div>
    );
  }

  // Filter clinical data for this patient
  const patientVisits = visits.filter(
    v => v.patientId === selectedPatient._id || v.patientId === selectedPatient.id
  );
  const patientLabs = labReports.filter(
    l => l.patientId === selectedPatient._id || l.patientId === selectedPatient.id
  );
  const patientConsents = consents.filter(
    c => c.patientId === selectedPatient._id || c.patientId === selectedPatient.id
  );

  // Extract all active prescriptions
  const allMedications = patientVisits.flatMap(v =>
    (v.prescriptions || []).map(p => ({
      ...p,
      visitDate: v.date,
      doctorName: v.doctorName,
    }))
  );

  // Severe allergy check
  const severeAllergies = (selectedPatient.allergies || []).filter(
    a => a.severity === 'Severe' || a.severity === 'Life-Threatening'
  );

  // Build Chronological Timeline Events
  const timelineEvents: TimelineEvent[] = [];

  patientVisits.forEach(v => {
    timelineEvents.push({
      id: `vis-${v._id || v.id}`,
      date: v.date,
      type: 'visit',
      title: `Consultation: ${v.diagnosis}`,
      subtitle: `${v.visitType} by ${v.doctorName} (${v.clinicOrHospital})`,
      details: `Complaint: "${v.chiefComplaint}" — ${v.clinicalNotes || ''}`,
      badgeText: v.icd10Code || 'Encounter',
      badgeColor: 'blue',
      referenceId: v._id || v.id,
    });

    if (v.prescriptions && v.prescriptions.length > 0) {
      timelineEvents.push({
        id: `rx-${v._id || v.id}`,
        date: v.date,
        type: 'prescription',
        title: `Prescription Issued (${v.prescriptions.length} items)`,
        subtitle: `Prescribed by ${v.doctorName}`,
        details: v.prescriptions
          .map(p => `${p.medicineName} ${p.dosage} (${p.frequency}, ${p.timing}) - Duration: ${p.duration}`)
          .join('\n'),
        badgeText: 'Prescription',
        badgeColor: 'green',
      });
    }
  });

  patientLabs.forEach(l => {
    timelineEvents.push({
      id: `lab-${l._id || l.id}`,
      date: l.reportDate,
      type: 'lab',
      title: `Lab Investigation: ${l.testName}`,
      subtitle: `Result: ${l.overallResult} (${l.labName})`,
      details: l.remarks || undefined,
      badgeText: l.status,
      badgeColor: l.status === 'Normal' ? 'green' : 'amber',
      referenceId: l._id || l.id,
    });
  });

  patientConsents.forEach(c => {
    timelineEvents.push({
      id: `con-${c._id || c.id}`,
      date: (c.grantedAt || c.dateFrom).split('T')[0],
      type: 'consent',
      title: `ABDM Consent: ${c.purpose}`,
      subtitle: `Authorized to ${c.requesterName} (${c.permissionMode})`,
      details: `Scope: ${c.dataTypes.join(', ')} • Validity: ${c.dateFrom} to ${c.dateTo}`,
      badgeText: c.status,
      badgeColor: c.status === 'GRANTED' ? 'green' : 'red',
    });
  });

  // Sort events newest first
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Patient Selector Strip (Quick Switcher) */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle overflow-x-auto gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-shrink-0">
          <span>Quick Patient Switcher:</span>
        </div>
        <div className="flex items-center gap-2">
          {patients.map(p => (
            <button
              key={p._id || p.id}
              onClick={() => setSelectedPatientId(p._id || p.id || null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                (p._id === selectedPatient._id || p.id === selectedPatient.id)
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({p.bloodGroup})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Demographics Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Patient Details & Avatar */}
          <div className="flex items-start sm:items-center gap-4.5 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src={selectedPatient.avatarUrl}
                alt={selectedPatient.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-brand-600 text-white font-extrabold text-[11px] shadow-sm">
                {selectedPatient.bloodGroup}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedPatient.name}
                </h2>
                <Badge variant="blue" size="md">
                  {selectedPatient.gender}, {selectedPatient.age} yrs
                </Badge>
                <Badge variant="green" size="md" dot>
                  EHR Active
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedPatient.phone}</span>
                </div>
                {selectedPatient.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedPatient.email}</span>
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{selectedPatient.address}</span>
                  </div>
                )}
              </div>

              {selectedPatient.emergencyContact && (
                <div className="text-[11px] text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">Emergency: </span>
                  {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) •{' '}
                  {selectedPatient.emergencyContact.phone}
                </div>
              )}
            </div>
          </div>

          {/* ABDM Digital Card Simulation */}
          <div className="bg-gradient-to-tr from-brand-900 to-slate-900 text-white p-4 rounded-2xl border border-brand-800 shadow-md w-full lg:w-80 flex-shrink-0 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-brand-300 text-[10px] font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-brand-400" />
                  <span>ABDM Health Account</span>
                </div>
                <p className="text-sm font-black font-mono tracking-wider mt-1 text-white">
                  {selectedPatient.abhaId}
                </p>
                <p className="text-[11px] text-brand-200 font-mono">
                  {selectedPatient.abhaAddress || `${selectedPatient.name.toLowerCase().replace(/\s+/g, '.')}@abdm`}
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-brand-800/80 flex items-center justify-between text-[10px] text-brand-200 font-medium">
              <span>National Health Authority</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Bar */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAiSummaryModal(selectedPatient._id || selectedPatient.id)}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Generate AI Patient Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('doctor')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Start Consultation</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLabModal}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span>Add Lab Result</span>
            </button>
            <button
              onClick={() => onEditPatient(selectedPatient)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Allergy & Safety Warning Alert */}
      {severeAllergies.length > 0 && (
        <div className="p-4.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3.5 shadow-sm animate-pulse-subtle">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-700 flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
              Critical Allergy Alert — High Prescribing Risk
            </h4>
            <div className="mt-1 space-y-1">
              {severeAllergies.map((alg, idx) => (
                <p key={idx} className="text-xs text-rose-900">
                  <span className="font-extrabold uppercase">{alg.substance}</span>: {alg.severity} Severity (Reaction: {alg.reaction})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview & History', icon: HeartPulse },
            { id: 'timeline', label: `Timeline (${timelineEvents.length})`, icon: Clock },
            { id: 'visits', label: `Consultations (${patientVisits.length})`, icon: Stethoscope },
            { id: 'medications', label: `Active Rx (${allMedications.length})`, icon: Pill },
            { id: 'labs', label: `Lab Reports (${patientLabs.length})`, icon: FlaskConical },
            { id: 'consent', label: `Consent Hub (${patientConsents.length})`, icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-brand-600 text-brand-600 bg-brand-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chronic Comorbidities */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Chronic Comorbidities & Clinical History</h3>
              <Badge variant="blue">{selectedPatient.medicalHistory.length} Conditions</Badge>
            </div>

            {selectedPatient.medicalHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No chronic conditions recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedPatient.medicalHistory.map((cond, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{cond.condition}</h4>
                      <Badge
                        variant={cond.status === 'Active' ? 'amber' : 'green'}
                        size="sm"
                      >
                        {cond.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">Diagnosed: {cond.diagnosedYear}</p>
                    {cond.notes && <p className="text-[11px] text-slate-600 italic mt-1">{cond.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Documented Allergies Box */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Documented Allergies ({selectedPatient.allergies.length})
              </h4>
              {selectedPatient.allergies.length === 0 ? (
                <p className="text-xs text-slate-400">No known drug or food allergies.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedPatient.allergies.map((alg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        alg.severity === 'Severe' || alg.severity === 'Life-Threatening'
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{alg.substance}</span>
                        <Badge variant={alg.severity === 'Severe' || alg.severity === 'Life-Threatening' ? 'red' : 'amber'} size="sm">
                          {alg.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">Reaction: {alg.reaction}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Next Steps */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                EHR Summary Snapshot
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Registered On</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.registeredDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Last Consultation</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.lastVisitDate || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Total Consultations</span>
                  <span className="font-bold text-brand-700">{patientVisits.length} encounters</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Diagnostic Reports</span>
                  <span className="font-bold text-purple-700">{patientLabs.length} reports</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Active ABDM Consents</span>
                  <span className="font-bold text-emerald-700">{patientConsents.filter(c => c.status === 'GRANTED').length} granted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TIMELINE TAB */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-6">
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient Longitudinal Clinical Timeline</h3>
              <p className="text-xs text-slate-500">Integrated chronological view of visits, prescriptions, and diagnostics</p>
            </div>
            <Badge variant="purple">{timelineEvents.length} Events Logged</Badge>
          </div>
          <ClinicalTimeline events={timelineEvents} />
        </div>
      )}

      {/* 3. VISITS & CONSULTATIONS TAB */}
      {activeSubTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Clinical Consultation Encounters</h3>
            <button
              onClick={() => setActiveTab('doctor')}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>New Consultation</span>
            </button>
          </div>

          {patientVisits.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No previous consultations recorded for this patient.
            </div>
          ) : (
            patientVisits.map(visit => (
              <div
                key={visit._id || visit.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4"
              >
                {/* Visit Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{visit.diagnosis}</h4>
                      {visit.icd10Code && (
                        <Badge variant="blue" size="sm">
                          ICD-10: {visit.icd10Code}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {visit.visitType} • {visit.doctorName} ({visit.clinicOrHospital})
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{visit.date}</span>
                  </div>
                </div>

                {/* Vitals Bar if present */}
                {visit.vitals && Object.keys(visit.vitals).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    {visit.vitals.bloodPressure && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">BP</span>
                        <span className="font-bold text-slate-800">{visit.vitals.bloodPressure}</span>
                      </div>
                    )}
                    {visit.vitals.heartRate && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Pulse</span>
                        <span className="font-bold text-slate-800">{visit.vitals.heartRate} bpm</span>
                      </div>
                    )}
                    {visit.vitals.temperature && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Temp</span>
                        <span className="font-bold text-slate-800">{visit.vitals.temperature} °F</span>
                      </div>
                    )}
                    {visit.vitals.spO2 && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">SpO2</span>
                        <span className="font-bold text-slate-800">{visit.vitals.spO2} %</span>
                      </div>
                    )}
                    {visit.vitals.weight && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Weight / BMI</span>
                        <span className="font-bold text-slate-800">{visit.vitals.weight} kg ({visit.vitals.bmi || 'N/A'})</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Chief Complaint & Notes */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Chief Complaint: </span>
                    <span className="text-slate-600">{visit.chiefComplaint}</span>
                  </div>
                  {visit.clinicalExamination && (
                    <div>
                      <span className="font-bold text-slate-700">Physical Exam: </span>
                      <span className="text-slate-600">{visit.clinicalExamination}</span>
                    </div>
                  )}
                  {visit.clinicalNotes && (
                    <div>
                      <span className="font-bold text-slate-700">Doctor's Notes: </span>
                      <span className="text-slate-600">{visit.clinicalNotes}</span>
                    </div>
                  )}
                </div>

                {/* Prescriptions issued in this encounter */}
                {visit.prescriptions && visit.prescriptions.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Prescriptions Issued</span>
                    </h5>
                    <div className="space-y-1.5">
                      {visit.prescriptions.map((rx, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{rx.medicineName}</span>
                            <span className="text-slate-500 ml-2">({rx.dosage})</span>
                            <span className="text-emerald-700 font-semibold ml-2">[{rx.frequency} - {rx.timing}]</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <span>Duration: {rx.duration}</span>
                            {rx.instructions && <span className="ml-2 italic">• {rx.instructions}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. ACTIVE MEDICATIONS TAB */}
      {activeSubTab === 'medications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Medication Regimen</h3>
              <p className="text-xs text-slate-500">Dosage schedules and route instructions</p>
            </div>
            <Badge variant="green">{allMedications.length} Prescriptions</Badge>
          </div>

          {allMedications.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No active medications currently prescribed.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Medicine & Strength</th>
                    <th className="px-4 py-3">Dosage & Frequency</th>
                    <th className="px-4 py-3">Food Timing</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Prescribed By</th>
                    <th className="px-4 py-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allMedications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">{med.medicineName}</td>
                      <td className="px-4 py-3 font-semibold text-brand-700">{med.dosage} ({med.frequency})</td>
                      <td className="px-4 py-3">
                        <Badge variant="amber" size="sm">{med.timing}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{med.duration}</td>
                      <td className="px-4 py-3 text-slate-500">{med.doctorName} ({med.visitDate})</td>
                      <td className="px-4 py-3 text-slate-600 italic">{med.instructions || 'As directed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. LAB REPORTS TAB */}
      {activeSubTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Diagnostic Laboratory Investigations</h3>
            <button
              onClick={onOpenLabModal}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Add Lab Report</span>
            </button>
          </div>

          {patientLabs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No laboratory reports on record for this patient.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {patientLabs.map(lab => (
                <div
                  key={lab._id || lab.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{lab.testName}</h4>
                        <Badge variant={lab.status === 'Normal' ? 'green' : 'red'}>
                          {lab.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lab.category} • Ordered by {lab.orderedByDoctor} ({lab.labName})
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      <span>Reported: {lab.reportDate}</span>
                    </div>
                  </div>

                  {/* Parameters Table */}
                  {lab.parameters && lab.parameters.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2">Test Parameter</th>
                            <th className="px-3 py-2">Observed Value</th>
                            <th className="px-3 py-2">Reference Range</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lab.parameters.map((param, pIdx) => (
                            <tr key={pIdx} className={param.isAbnormal ? 'bg-rose-50/50' : ''}>
                              <td className="px-3 py-2 font-medium text-slate-800">{param.name}</td>
                              <td className={`px-3 py-2 font-bold ${param.isAbnormal ? 'text-rose-700' : 'text-slate-900'}`}>
                                {param.value} {param.unit}
                              </td>
                              <td className="px-3 py-2 text-slate-500">{param.referenceRange}</td>
                              <td className="px-3 py-2">
                                <Badge variant={param.isAbnormal ? 'red' : 'green'} size="sm">
                                  {param.isAbnormal ? 'Abnormal' : 'Normal'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <span className="font-bold">Interpretation: </span>
                    <span>{lab.overallResult}</span>
                    {lab.remarks && <p className="mt-1 text-slate-500 italic">Doctor Remarks: {lab.remarks}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. CONSENT HUB TAB */}
      {activeSubTab === 'consent' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">ABDM Consent Artefacts</h3>
              <p className="text-xs text-slate-500">Patient-controlled data disclosure authorization</p>
            </div>
            <button
              onClick={() => setActiveTab('consent')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage Consent Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {patientConsents.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No consent artefacts created for this patient.</p>
          ) : (
            <div className="space-y-3">
              {patientConsents.map(consent => (
                <div
                  key={consent._id || consent.id}
                  className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{consent.requesterName}</h4>
                      <Badge variant={consent.status === 'GRANTED' ? 'green' : 'red'} size="sm">
                        {consent.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Purpose: <span className="font-semibold text-slate-800">{consent.purpose}</span> ({consent.permissionMode})
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Validity: {consent.dateFrom} to {consent.dateTo} • Artefact: {consent.signatureMock || 'ABDM-MOCK'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
