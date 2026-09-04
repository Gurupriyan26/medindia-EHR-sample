import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, MedicationItem, Vitals } from '../../types';
import { Badge } from '../common/Badge';
import {
  Stethoscope,
  HeartPulse,
  Pill,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  User,
  FlaskConical,
} from 'lucide-react';

const COMMON_ICD_CODES = [
  { code: 'E11.9', name: 'Type 2 Diabetes Mellitus without complications' },
  { code: 'E11.69', name: 'Type 2 Diabetes Mellitus with other specified complication' },
  { code: 'I10', name: 'Essential (primary) Hypertension' },
  { code: 'I25.10', name: 'Atherosclerotic Heart Disease of Native Coronary Artery' },
  { code: 'E03.9', name: 'Hypothyroidism, unspecified' },
  { code: 'J45.909', name: 'Unspecified Asthma, uncomplicated' },
  { code: 'N18.2', name: 'Chronic Kidney Disease, Stage 2 (mild)' },
  { code: 'O24.419', name: 'Gestational Diabetes Mellitus in pregnancy' },
  { code: 'R53.83', name: 'Other fatigue and malaise' },
  { code: 'K21.9', name: 'Gastro-esophageal reflux disease without esophagitis' },
];

export const DoctorConsultationRoom: React.FC = () => {
  const {
    patients,
    selectedPatient,
    setSelectedPatientId,
    addNewVisit,
    openAiSummaryModal,
    setActiveTab,
    visits,
  } = useApp();

  // Active patient for this consultation
  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);

  // Form states
  const [visitType, setVisitType] = useState<'General Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup' | 'Specialist Consultation'>('Follow-up');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalExamination, setClinicalExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState<number | ''>(72);
  const [temp, setTemp] = useState<number | ''>(98.6);
  const [spo2, setSpo2] = useState<number | ''>(99);
  const [weight, setWeight] = useState<number | ''>(70);
  const [height, setHeight] = useState<number | ''>(170);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<MedicationItem[]>([
    {
      id: 'rx-tmp-1',
      medicineName: 'Metformin SR',
      dosage: '500 mg',
      frequency: '1-0-1',
      timing: 'After Food',
      duration: '30 Days',
      instructions: 'Take after principal meals',
    },
  ]);

  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 Tablet');
  const [medFreq, setMedFreq] = useState('1-0-1');
  const [medTiming, setMedTiming] = useState<MedicationItem['timing']>('After Food');
  const [medDuration, setMedDuration] = useState('30 Days');
  const [medInstructions, setMedInstructions] = useState('');

  // Lab orders
  const [orderedLabs, setOrderedLabs] = useState<string[]>([]);
  const [newLabInput, setNewLabInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setActivePatient(selectedPatient);
    }
  }, [selectedPatient]);

  // Calculate BMI
  const bmi =
    weight && height && Number(height) > 0
      ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
      : undefined;

  const handleAddPrescription = () => {
    if (!medName.trim()) return;
    setPrescriptions([
      ...prescriptions,
      {
        id: `rx-${Date.now()}`,
        medicineName: medName.trim(),
        dosage: medDosage,
        frequency: medFreq,
        timing: medTiming,
        duration: medDuration,
        instructions: medInstructions.trim(),
      },
    ]);
    setMedName('');
    setMedInstructions('');
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleAddLab = () => {
    if (!newLabInput.trim()) return;
    setOrderedLabs([...orderedLabs, newLabInput.trim()]);
    setNewLabInput('');
  };

  const handleRemoveLab = (index: number) => {
    setOrderedLabs(orderedLabs.filter((_, i) => i !== index));
  };

  const handleSelectIcd = (item: { code: string; name: string }) => {
    setIcd10Code(item.code);
    if (!diagnosis) setDiagnosis(item.name);
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    if (!chiefComplaint.trim() || !diagnosis.trim()) {
      alert('Please provide Chief Complaint and Diagnosis.');
      return;
    }

    setIsSaving(true);
    try {
      const vitalsObj: Vitals = {
        bloodPressure: bp || undefined,
        heartRate: hr ? Number(hr) : undefined,
        temperature: temp ? Number(temp) : undefined,
        spO2: spo2 ? Number(spo2) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        bmi: bmi ? Number(bmi) : undefined,
      };

      await addNewVisit({
        patientId: activePatient._id || activePatient.id,
        patientName: activePatient.name,
        doctorName: 'Dr. Sarah Rao, MD',
        doctorSpecialty: 'Cardiologist & General Physician',
        clinicOrHospital: 'MedIndia Apex Care Clinic, Bengaluru',
        date: new Date().toISOString().split('T')[0],
        visitType,
        chiefComplaint: chiefComplaint.trim(),
        vitals: vitalsObj,
        clinicalExamination: clinicalExamination.trim() || undefined,
        diagnosis: diagnosis.trim(),
        icd10Code: icd10Code.trim() || undefined,
        clinicalNotes: clinicalNotes.trim() || undefined,
        prescriptions,
        orderedLabTests: orderedLabs,
        followUpDate: followUpDate || undefined,
        status: 'Completed',
      });

      // Navigate to patient's EHR profile to view saved record
      setActiveTab('ehr');
    } catch (err) {
      console.error('Failed to save visit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const patientVisits = activePatient
    ? visits.filter(v => v.patientId === activePatient._id || v.patientId === activePatient.id)
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Patient Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Doctor Clinical Workstation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Conduct consultation encounters, record vitals, prescribe medications, and order investigations
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Active Patient:</label>
          <select
            value={activePatient?._id || activePatient?.id || ''}
            onChange={e => {
              const p = patients.find(pat => (pat._id || pat.id) === e.target.value);
              if (p) {
                setActivePatient(p);
                setSelectedPatientId(p._id || p.id || null);
              }
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm outline-none focus:border-brand-500"
          >
            {patients.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.name} ({p.age}y {p.gender}, {p.bloodGroup}) - ABHA: {p.abhaId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Clinical Context Card */}
      {activePatient && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={activePatient.avatarUrl}
              alt={activePatient.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">{activePatient.name}</h3>
                <Badge variant="blue" size="sm">
                  {activePatient.age}y {activePatient.gender}
                </Badge>
                <Badge variant="purple" size="sm">
                  {activePatient.bloodGroup}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ABHA: {activePatient.abhaId} • Last visit: {activePatient.lastVisitDate || 'First Visit'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Allergy Flag */}
            {activePatient.allergies.length > 0 && (
              <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Allergies: {activePatient.allergies.map(a => a.substance).join(', ')}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => openAiSummaryModal(activePatient._id || activePatient.id)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>AI Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Consultation Form */}
      <form onSubmit={handleSaveConsultation} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Clinical Encounter Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Encounter Details & Vitals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>1. Patient Vitals & Encounter Type</span>
              </h3>
              <select
                value={visitType}
                onChange={e => setVisitType(e.target.value as any)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none"
              >
                <option value="General Consultation">General Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Specialist Consultation">Specialist Consultation</option>
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={e => setHr(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="72"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={e => setTemp(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="98.6"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="99"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="70"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">BMI Auto-Calc</label>
                <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-brand-700">
                  {bmi || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Chief Complaint, Physical Exam, and Diagnosis */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Stethoscope className="w-4 h-4 text-brand-600" />
              <span>2. Clinical Assessment & Diagnosis</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chief Complaint & Symptoms <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                placeholder="e.g. Patient reports mild morning lethargy, occasional post-meal heaviness..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Examination Findings
              </label>
              <input
                type="text"
                value={clinicalExamination}
                onChange={e => setClinicalExamination(e.target.value)}
                placeholder="e.g. S1 S2 heard normal. Chest clear bilaterally. No peripheral edema."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            {/* Diagnosis & ICD-10 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Diagnosis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes Mellitus with Essential Hypertension"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ICD-10 Code
                </label>
                <input
                  type="text"
                  value={icd10Code}
                  onChange={e => setIcd10Code(e.target.value)}
                  placeholder="E11.69"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-brand-800 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Common ICD-10 Quick Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Quick ICD-10 suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ICD_CODES.slice(0, 6).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectIcd(item)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 rounded text-[10px] font-mono transition-colors"
                  >
                    {item.code} - {item.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor's Clinical Notes & Advice
              </label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={e => setClinicalNotes(e.target.value)}
                placeholder="Advised 30 mins aerobic exercise, reduced evening carbs, and continuous glucose monitoring..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Section 3: Multi-Item Prescription Composer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>3. Electronic Prescription Composer</span>
              </h3>
              <Badge variant="green" size="sm">{prescriptions.length} Meds</Badge>
            </div>

            {/* Active Prescriptions Table */}
            {prescriptions.length > 0 && (
              <div className="space-y-2">
                {prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{rx.medicineName}</span>
                      <span className="text-slate-500 ml-2">({rx.dosage})</span>
                      <span className="text-emerald-700 font-semibold ml-2">[{rx.frequency} • {rx.timing}]</span>
                      <span className="text-slate-500 ml-2">— {rx.duration}</span>
                      {rx.instructions && <p className="text-[11px] text-slate-600 italic mt-0.5">{rx.instructions}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Medication Inputs */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Drug Name (e.g. Telmisartan 40mg)"
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (1 Tab)"
                  value={medDosage}
                  onChange={e => setMedDosage(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                />
                <select
                  value={medFreq}
                  onChange={e => setMedFreq(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-brand-500"
                >
                  <option value="1-0-1">1-0-1 (Morning & Night)</option>
                  <option value="1-0-0">1-0-0 (Morning only)</option>
                  <option value="0-0-1">0-0-1 (Night only)</option>
                  <option value="1-1-1">1-1-1 (TDS)</option>
                  <option value="SOS">SOS (When needed)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={medTiming}
                  onChange={e => setMedTiming(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                >
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                  <option value="With Food">With Food</option>
                  <option value="Anytime">Anytime</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration (e.g. 30 Days)"
                  value={medDuration}
                  onChange={e => setMedDuration(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Special instructions..."
                  value={medInstructions}
                  onChange={e => setMedInstructions(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lab Orders, Follow Up & Complete Button */}
        <div className="space-y-6">
          {/* Order Diagnostics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>Order Diagnostic Tests</span>
            </h3>

            {orderedLabs.length > 0 && (
              <div className="space-y-1.5">
                {orderedLabs.map((lab, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-purple-900">{lab}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLab(idx)}
                      className="text-purple-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. HbA1c, Serum Creatinine, ECG"
                value={newLabInput}
                onChange={e => setNewLabInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddLab}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Follow-up Date */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Follow-up Schedule
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Next Visit Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>

          {/* Submit Action Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-elevated border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Save Encounter to EHR
            </h4>
            <p className="text-[11px] text-slate-400">
              Finalizing will commit vitals, diagnosis, prescriptions, and timeline events to the patient's EHR.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Recording Encounter...' : 'Complete & Save Consultation'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
