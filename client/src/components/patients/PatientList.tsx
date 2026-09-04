import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, BloodGroup, Gender } from '../../types';
import { Badge } from '../common/Badge';
import {
  Search,
  Filter,
  UserPlus,
  FileText,
  Stethoscope,
  Sparkles,
  Edit2,
  AlertCircle,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface PatientListProps {
  onOpenNewPatientModal: () => void;
  onEditPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onOpenNewPatientModal,
  onEditPatient,
}) => {
  const {
    patients,
    setSelectedPatientId,
    setActiveTab,
    openAiSummaryModal,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [allergyOnly, setAllergyOnly] = useState<boolean>(false);

  // Filter logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.abhaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);

    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    const matchesBlood = bloodGroupFilter === 'all' || patient.bloodGroup === bloodGroupFilter;
    const matchesAllergy = !allergyOnly || (patient.allergies && patient.allergies.length > 0);

    return matchesSearch && matchesGender && matchesBlood && matchesAllergy;
  });

  const handleSelectEhr = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('ehr');
  };

  const handleStartConsultation = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('doctor');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Controls: Title, Search, Filters, and New Patient Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Patient Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage electronic health records and ABHA digital identities ({filteredPatients.length} enrolled)
          </p>
        </div>

        <button
          onClick={onOpenNewPatientModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ABHA ID, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-brand-500"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* Blood Group Filter */}
          <select
            value={bloodGroupFilter}
            onChange={e => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-brand-500"
          >
            <option value="all">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          {/* Allergy filter toggle */}
          <button
            onClick={() => setAllergyOnly(!allergyOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              allergyOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Allergy Warnings Only</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Patient Details</th>
                <th className="px-4 py-3.5">ABHA Identifier</th>
                <th className="px-4 py-3.5">Blood / Vitals</th>
                <th className="px-4 py-3.5">Allergies & Risks</th>
                <th className="px-4 py-3.5">Chronic History</th>
                <th className="px-4 py-3.5">Last Encounter</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No patients match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(p => {
                  const hasSevereAllergy = p.allergies.some(
                    a => a.severity === 'Severe' || a.severity === 'Life-Threatening'
                  );
                  return (
                    <tr
                      key={p._id || p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Demographics */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <button
                              onClick={() => handleSelectEhr(p._id || p.id || '')}
                              className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm flex items-center gap-1.5"
                            >
                              <span>{p.name}</span>
                            </button>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>
                                {p.age} yrs • {p.gender}
                              </span>
                              <span>•</span>
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{p.phone}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ABHA Identifier */}
                      <td className="px-4 py-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                          <span className="font-bold text-slate-800">{p.abhaId}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {p.abhaAddress || `${p.name.toLowerCase().replace(/\s+/g, '.')}@abdm`}
                        </span>
                      </td>

                      {/* Blood Group */}
                      <td className="px-4 py-4">
                        <Badge variant="blue" size="md">
                          {p.bloodGroup}
                        </Badge>
                      </td>

                      {/* Allergies */}
                      <td className="px-4 py-4">
                        {p.allergies && p.allergies.length > 0 ? (
                          <div className="space-y-1 max-w-[200px]">
                            {p.allergies.map((a, i) => (
                              <div
                                key={i}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                  a.severity === 'Severe' || a.severity === 'Life-Threatening'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <span className="truncate">{a.substance}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">None Known (NKDA)</span>
                        )}
                      </td>

                      {/* Chronic History */}
                      <td className="px-4 py-4">
                        {p.medicalHistory && p.medicalHistory.length > 0 ? (
                          <div className="space-y-0.5 max-w-[200px]">
                            {p.medicalHistory.slice(0, 2).map((c, i) => (
                              <p key={i} className="text-[11px] text-slate-700 truncate font-medium">
                                • {c.condition}
                              </p>
                            ))}
                            {p.medicalHistory.length > 2 && (
                              <span className="text-[10px] text-brand-600 font-semibold">
                                +{p.medicalHistory.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No chronic history</span>
                        )}
                      </td>

                      {/* Last Encounter */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.lastVisitDate || p.registeredDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAiSummaryModal(p._id || p.id || '')}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                            title="Generate AI Clinical Summary"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartConsultation(p._id || p.id || '')}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                            title="Start Consultation"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSelectEhr(p._id || p.id || '')}
                            className="p-1.5 text-brand-700 hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors"
                            title="Open Full EHR Profile"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPatient(p)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                            title="Edit Patient Demographics"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
