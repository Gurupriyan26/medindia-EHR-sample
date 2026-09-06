import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Patient, Allergy, ChronicCondition, BloodGroup, Gender } from '../../types';
import { Plus, Trash2, Sparkles, Shield, AlertCircle, HeartHandshake, FileText } from 'lucide-react';
import { EasyAbhaOnboarding } from './EasyAbhaOnboarding';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Partial<Patient>) => Promise<void>;
  initialData?: Patient | null;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [registrationMode, setRegistrationMode] = useState<'easy' | 'clinical'>('easy');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [abhaId, setAbhaId] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newSubstance, setNewSubstance] = useState('');
  const [newSeverity, setNewSeverity] = useState<Allergy['severity']>('Moderate');
  const [newReaction, setNewReaction] = useState('');

  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newYear, setNewYear] = useState('2024');
  const [newStatus, setNewStatus] = useState<ChronicCondition['status']>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAge(initialData.age);
      setGender(initialData.gender);
      setPhone(initialData.phone);
      setEmail(initialData.email || '');
      setBloodGroup(initialData.bloodGroup);
      setAbhaId(initialData.abhaId);
      setAddress(initialData.address || '');
      setEmergencyName(initialData.emergencyContact?.name || '');
      setEmergencyRelation(initialData.emergencyContact?.relationship || 'Spouse');
      setEmergencyPhone(initialData.emergencyContact?.phone || '');
      setAllergies(initialData.allergies || []);
      setConditions(initialData.medicalHistory || []);
    } else {
      // Defaults for new patient
      setName('');
      setAge('');
      setGender('Male');
      setPhone('');
      setEmail('');
      setBloodGroup('B+');
      // Generate demo ABHA ID automatically
      setAbhaId(`91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
      setAddress('');
      setEmergencyName('');
      setEmergencyRelation('Spouse');
      setEmergencyPhone('');
      setAllergies([]);
      setConditions([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleGenerateAbha = () => {
    const random14 = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setAbhaId(random14);
  };

  const handleAddAllergy = () => {
    if (!newSubstance.trim() || !newReaction.trim()) return;
    setAllergies([
      ...allergies,
      {
        id: `alg-${Date.now()}`,
        substance: newSubstance.trim(),
        severity: newSeverity,
        reaction: newReaction.trim(),
        recordedDate: new Date().toISOString().split('T')[0],
      },
    ]);
    setNewSubstance('');
    setNewReaction('');
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setConditions([
      ...conditions,
      {
        condition: newCondition.trim(),
        diagnosedYear: newYear,
        status: newStatus,
      },
    ]);
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Patient name is required';
    if (!age || Number(age) <= 0) newErrors.age = 'Valid age is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!abhaId.trim()) newErrors.abhaId = 'ABHA ID is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        email: email.trim() || undefined,
        bloodGroup,
        abhaId: abhaId.trim(),
        address: address.trim() || undefined,
        emergencyContact: emergencyName.trim()
          ? {
              name: emergencyName.trim(),
              relationship: emergencyRelation,
              phone: emergencyPhone.trim(),
            }
          : undefined,
        allergies,
        medicalHistory: conditions,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save patient details' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Patient EHR Record' : 'Create Patient Account & ABHA'}
      subtitle={
        initialData
          ? 'Universal Health Identifier (ABHA) & Clinical Demographics'
          : 'National Digital Health Ecosystem (ABDM) Onboarding'
      }
      maxWidth="3xl"
      footer={
        registrationMode === 'easy' && !initialData ? null : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Register & Create EHR'}
            </button>
          </>
        )
      }
    >
      {/* Mode Switcher for New Patient Registration */}
      {!initialData && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setRegistrationMode('easy')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              registrationMode === 'easy'
                ? 'bg-white text-brand-700 shadow-md ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>🌟 Easy Assisted Mode (सरल ABHA)</span>
            <span className="hidden sm:inline px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 rounded font-bold">
              Voice / Multi-lang
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRegistrationMode('clinical')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              registrationMode === 'clinical'
                ? 'bg-white text-brand-700 shadow-md ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-brand-600" />
            <span>📋 Full Clinical Form (विस्तृत)</span>
          </button>
        </div>
      )}

      {registrationMode === 'easy' && !initialData ? (
        <EasyAbhaOnboarding
          onComplete={async data => {
            await onSave(data);
            onClose();
          }}
          onCancel={onClose}
          onSwitchToClinical={() => setRegistrationMode('clinical')}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Core Demographics
            </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="48"
                min="0"
                max="130"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none"
              />
              {errors.age && <p className="text-[11px] text-rose-500 mt-0.5">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none font-bold text-slate-800"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none"
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: ABDM / ABHA Identity */}
        <div className="p-4 bg-brand-50/50 border border-brand-200/60 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              <h4 className="text-xs font-bold text-brand-900">ABHA Identifier (Ayushman Bharat Health Account)</h4>
            </div>
            <button
              type="button"
              onClick={handleGenerateAbha}
              className="text-[11px] font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-brand-200 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-yellow-500" />
              <span>Generate Mock ABHA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                14-Digit ABHA Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={e => setAbhaId(e.target.value)}
                placeholder="91-4567-8901-2345"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-brand-900 focus:border-brand-500 outline-none"
              />
              {errors.abhaId && <p className="text-[11px] text-rose-500 mt-0.5">{errors.abhaId}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Indiranagar, Bengaluru, Karnataka"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Documented Allergies */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Known Drug & Environmental Allergies
            </h4>
            <span className="text-[11px] text-slate-400">Critical for clinical prescribing</span>
          </div>

          {/* Existing Allergies List */}
          {allergies.length > 0 && (
            <div className="space-y-2 mb-3">
              {allergies.map((alg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="text-xs">
                    <span className="font-bold text-rose-900">{alg.substance}</span>
                    <span className="text-rose-700 ml-2 font-semibold">({alg.severity} Severity)</span>
                    <span className="text-slate-600 ml-2">— Reaction: {alg.reaction}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Allergy Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Substance (e.g. Penicillin)"
              value={newSubstance}
              onChange={e => setNewSubstance(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
            />
            <select
              value={newSeverity}
              onChange={e => setNewSeverity(e.target.value as Allergy['severity'])}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
            >
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Life-Threatening">Life-Threatening</option>
            </select>
            <button
              type="button"
              onClick={handleAddAllergy}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Allergy</span>
            </button>
            <input
              type="text"
              placeholder="Clinical Reaction (e.g. Urticaria, Anaphylaxis)"
              value={newReaction}
              onChange={e => setNewReaction(e.target.value)}
              className="sm:col-span-4 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500 mt-1"
            />
          </div>
        </div>

        {/* Section 4: Medical History & Chronic Conditions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            3. Chronic Comorbidities & Medical History
          </h4>

          {conditions.length > 0 && (
            <div className="space-y-2 mb-3">
              {conditions.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{c.condition}</span>
                    <span className="text-slate-500 ml-2">(Since {c.diagnosedYear})</span>
                    <span className="ml-2 font-semibold text-brand-700">[{c.status}]</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Condition (e.g. Type 2 Diabetes, Hypertension)"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
            />
            <input
              type="text"
              placeholder="Year (2020)"
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={handleAddCondition}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Condition</span>
            </button>
          </div>
        </div>
      </form>
    )}
  </Modal>
  );
};
