import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConsentArtefact } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  FileCheck,
  Key,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileCode,
} from 'lucide-react';

export const ConsentManager: React.FC = () => {
  const { consents, updateConsentState, addNewConsent, selectedPatient, patients } = useApp();

  const [selectedConsent, setSelectedConsent] = useState<ConsentArtefact | null>(null);
  const [isArtefactModalOpen, setIsArtefactModalOpen] = useState(false);
  const [isNewConsentModalOpen, setIsNewConsentModalOpen] = useState(false);

  // New Consent Form State
  const [requesterName, setRequesterName] = useState('');
  const [requesterType, setRequesterType] = useState<ConsentArtefact['requesterType']>('HIU');
  const [purpose, setPurpose] = useState<ConsentArtefact['purpose']>('Care Management');
  const [permissionMode, setPermissionMode] = useState<ConsentArtefact['permissionMode']>('VIEW');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([
    'EHR / Consultations',
    'Prescriptions',
    'Diagnostic Lab Reports',
  ]);
  const [validDays, setValidDays] = useState('365');

  const handleOpenArtefact = (consent: ConsentArtefact) => {
    setSelectedConsent(consent);
    setIsArtefactModalOpen(true);
  };

  const handleToggleDataType = (type: string) => {
    if (selectedDataTypes.includes(type)) {
      setSelectedDataTypes(selectedDataTypes.filter(t => t !== type));
    } else {
      setSelectedDataTypes([...selectedDataTypes, type]);
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim()) return;

    const targetPatient = selectedPatient || patients[0];
    const today = new Date();
    const expiry = new Date(today.getTime() + Number(validDays) * 24 * 60 * 60 * 1000);

    await addNewConsent({
      patientId: targetPatient._id || targetPatient.id,
      patientName: targetPatient.name,
      patientAbhaId: targetPatient.abhaId,
      requesterName: requesterName.trim(),
      requesterType,
      purpose,
      dataTypes: selectedDataTypes as any,
      permissionMode,
      dateFrom: today.toISOString().split('T')[0],
      dateTo: expiry.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'GRANTED',
    });

    setIsNewConsentModalOpen(false);
    setRequesterName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ABDM Consent Management Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Patient-governed consent artefacts for secure health information exchange (HIE)
          </p>
        </div>

        <button
          onClick={() => setIsNewConsentModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Authorize New Consent</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-start gap-3.5 shadow-md">
        <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-200">
            Simulated ABDM Consent Architecture (NHA Compliant Model)
          </p>
          <p className="text-slate-400 leading-relaxed">
            In the Ayushman Bharat Digital Mission, health records are never pooled in a central database. Instead, access is mediated on-demand through digitally signed <span className="text-brand-300 font-mono">Consent Artefacts</span> approved by the patient via the Consent Manager Gateway.
          </p>
        </div>
      </div>

      {/* Consent Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Healthcare Requester (HIU)</th>
                <th className="px-4 py-3.5">Patient / ABHA</th>
                <th className="px-4 py-3.5">Purpose & Mode</th>
                <th className="px-4 py-3.5">Authorized Data Scope</th>
                <th className="px-4 py-3.5">Validity Range</th>
                <th className="px-4 py-3.5">Consent Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {consents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No active consent artefacts registered.
                  </td>
                </tr>
              ) : (
                consents.map(c => (
                  <tr key={c._id || c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Requester */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{c.requesterName}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Type: {c.requesterType}
                      </span>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{c.patientName}</div>
                      <span className="text-[10px] text-brand-700 font-mono block">
                        {c.patientAbhaId}
                      </span>
                    </td>

                    {/* Purpose */}
                    <td className="px-4 py-4">
                      <Badge variant="blue" size="sm">
                        {c.purpose}
                      </Badge>
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                        Mode: {c.permissionMode}
                      </span>
                    </td>

                    {/* Data Scope */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {c.dataTypes.map((dt, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Validity */}
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-600">
                      <div>{c.dateFrom}</div>
                      <div className="text-slate-400 text-[10px]">to {c.dateTo}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <Badge
                        variant={c.status === 'GRANTED' ? 'green' : 'red'}
                        size="md"
                        dot
                      >
                        {c.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenArtefact(c)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Inspect Signed Artefact JSON"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Artefact</span>
                        </button>

                        {c.status === 'GRANTED' ? (
                          <button
                            onClick={() => updateConsentState(c._id || c.id || '', 'REVOKED')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => updateConsentState(c._id || c.id || '', 'GRANTED')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Grant</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Artefact Schema Inspector Modal */}
      {selectedConsent && (
        <Modal
          isOpen={isArtefactModalOpen}
          onClose={() => setIsArtefactModalOpen(false)}
          title="ABDM Cryptographic Consent Artefact"
          subtitle={`Artefact ID: ${selectedConsent._id || selectedConsent.id}`}
          maxWidth="3xl"
          footer={
            <button
              onClick={() => setIsArtefactModalOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Close Inspector
            </button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-slate-800">Digital Signature (Mock ECDSA SHA-256):</span>
              </div>
              <span className="font-mono text-brand-800 font-bold">
                {selectedConsent.signatureMock || 'ABDM-MOCK-SIG-88a7b9c1d2'}
              </span>
            </div>

            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
              <pre>
                {JSON.stringify(
                  {
                    consentArtefact: {
                      schemaVersion: '2.0.0',
                      consentId: selectedConsent._id || selectedConsent.id,
                      createdAt: selectedConsent.grantedAt || new Date().toISOString(),
                      patient: {
                        id: selectedConsent.patientAbhaId || '91-4567-8901-2345',
                        name: selectedConsent.patientName,
                      },
                      purpose: {
                        code: selectedConsent.purpose,
                        text: 'Health Information Exchange for care management and clinical review',
                      },
                      requester: {
                        name: selectedConsent.requesterName,
                        type: selectedConsent.requesterType,
                        identifier: `IN-HIU-${Math.floor(1000 + Math.random() * 9000)}`,
                      },
                      hiTypes: selectedConsent.dataTypes,
                      permission: {
                        accessMode: selectedConsent.permissionMode,
                        dateRange: {
                          from: selectedConsent.dateFrom,
                          to: selectedConsent.dateTo,
                        },
                        dataEraseAt: selectedConsent.expiryDate,
                        frequency: {
                          unit: 'HOUR',
                          value: 1,
                          repeats: 0,
                        },
                      },
                      status: selectedConsent.status,
                      signature: selectedConsent.signatureMock || 'ABDM-MOCK-SIG-88a7b9c1d2',
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </Modal>
      )}

      {/* New Consent Creation Modal */}
      <Modal
        isOpen={isNewConsentModalOpen}
        onClose={() => setIsNewConsentModalOpen(false)}
        title="Authorize New Health Data Consent"
        subtitle="Grant external healthcare provider access to clinical EHR records"
        maxWidth="2xl"
        footer={
          <>
            <button
              onClick={() => setIsNewConsentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConsent}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Authorize & Issue Artefact
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateConsent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Healthcare Requester / Clinic Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apollo Tele-Specialty Network"
              value={requesterName}
              onChange={e => setRequesterName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requester Type</label>
              <select
                value={requesterType}
                onChange={e => setRequesterType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              >
                <option value="HIU">Health Information User (HIU)</option>
                <option value="Doctor">Independent Doctor</option>
                <option value="Diagnostic Lab">Diagnostic Lab</option>
                <option value="Hospital">Hospital / Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Purpose</label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              >
                <option value="Care Management">Care Management</option>
                <option value="Second Opinion">Second Opinion</option>
                <option value="Diagnostic Review">Diagnostic Review</option>
                <option value="Emergency Access">Emergency Access</option>
              </select>
            </div>
          </div>

          {/* Data Types */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Allowed Health Information (HI) Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'EHR / Consultations',
                'Prescriptions',
                'Diagnostic Lab Reports',
                'Immunization',
              ].map(dt => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => handleToggleDataType(dt)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedDataTypes.includes(dt)
                      ? 'bg-brand-50 border-brand-300 text-brand-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{dt}</span>
                  {selectedDataTypes.includes(dt) && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
