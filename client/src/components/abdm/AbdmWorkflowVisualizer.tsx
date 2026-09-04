import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import {
  Network,
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Play,
  FileCode,
  Key,
  Shield,
  Send,
  Database,
} from 'lucide-react';

export const AbdmWorkflowVisualizer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    'ABDM Sandbox Node Initialized (Gateway v2.0)',
    'National Health Authority (NHA) Test Gateway Connected',
  ]);

  const steps = [
    {
      step: 1,
      title: '1. Patient ABHA Identity',
      actor: 'Patient → ABHA Gateway',
      icon: UserCheck,
      description: 'Patient creates/verifies 14-digit ABHA Number and ABHA Address via Aadhaar OTP simulation.',
      payload: {
        event: 'ABHA_CREATED',
        abhaNumber: '91-4567-8901-2345',
        abhaAddress: 'aarav.sharma@abdm',
        authMode: 'AADHAAR_OTP_VERIFIED',
        kycStatus: 'VERIFIED',
      },
    },
    {
      step: 2,
      title: '2. Health Facility (HIP) Linking',
      actor: 'MedIndia Apex Care Clinic (HIP)',
      icon: Building2,
      description: 'Hospital EHR discovers patient via ABHA and creates a linked Care Context (Encounter records).',
      payload: {
        event: 'CARE_CONTEXT_LINKED',
        hipId: 'IN-KA-HCF-9942',
        hipName: 'MedIndia Apex Care Clinic',
        careContexts: ['CC-VIS-301-DIABETES', 'CC-LAB-501-HBA1C'],
        status: 'LINKED_SUCCESS',
      },
    },
    {
      step: 3,
      title: '3. Data Request (HIU)',
      actor: 'Apollo Tele-Specialty Network (HIU)',
      icon: Send,
      description: 'Consulting specialist clinic sends an electronic Consent Request via the ABDM Gateway.',
      payload: {
        event: 'CONSENT_REQUESTED',
        hiuId: 'IN-KA-HIU-1029',
        purpose: 'Care Management & Second Opinion',
        requestedHiTypes: ['OPConsultation', 'DiagnosticReport', 'Prescription'],
        permissionRange: { from: '2026-01-01', to: '2027-01-01' },
      },
    },
    {
      step: 4,
      title: '4. Consent Manager (CM) Authorization',
      actor: 'ABDM Consent Gateway & Patient App',
      icon: ShieldCheck,
      description: 'Patient receives consent push notification on PHR app, approves data scope, and signs the artefact.',
      payload: {
        event: 'CONSENT_ARTEFACT_ISSUED',
        consentArtefactId: 'ART-9928-1120-4491',
        status: 'GRANTED',
        digitalSignature: 'ECDSA-SHA256-0x99f7a8b1c2...',
        grantTimestamp: new Date().toISOString(),
      },
    },
    {
      step: 5,
      title: '5. Encrypted Health Data Exchange',
      actor: 'HIP ⇄ HIU Secure Channel',
      icon: Lock,
      description: 'Health data is encrypted using Diffie-Hellman ephemeral keys and transferred directly between HIP and HIU.',
      payload: {
        event: 'HEALTH_DATA_TRANSFER_COMPLETE',
        encryption: 'ECDH-AES-GCM-256',
        fhirBundle: 'Bundle/FHIR-R4-DiagnosticReport-HbA1c',
        recordsTransferred: 3,
        integrityHash: 'SHA-256-MATCH-VERIFIED',
      },
    },
  ];

  const handleRunNextStep = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Completed Step ${currentStep}: ${steps[currentStep - 1].title}`,
        `[${new Date().toLocaleTimeString()}] Executing Step ${nextStep}: ${steps[nextStep - 1].title}...`,
        ...prev,
      ]);
    } else {
      setCurrentStep(1);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ABDM Sandbox flow reset to Step 1.`,
        ...prev,
      ]);
    }
  };

  const handleAutoSimulate = async () => {
    setIsSimulating(true);
    for (let s = 1; s <= 5; s++) {
      setCurrentStep(s);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Stage ${s}/5: ${steps[s - 1].title} verified.`,
        ...prev,
      ]);
      await new Promise(r => setTimeout(r, 900));
    }
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Interactive Architecture Sandbox</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ABDM Integration – Prototype Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Step-by-step visual demonstration of Ayushman Bharat Digital Mission (ABDM) Health Information Exchange
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoSimulate}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Auto-Play 5-Step Flow'}</span>
          </button>
          <button
            onClick={handleRunNextStep}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <span>{currentStep === 5 ? 'Restart Flow' : `Step ${currentStep + 1} Next`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-bold">ABDM Integration – Prototype Disclaimer</p>
          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
            This module represents a prototype demonstration of the ABDM federated architecture (Patient → ABHA → EHR → Consent → Secure HIE). It operates in a secure educational sandbox and does not transmit data to production National Health Authority (NHA) government servers.
          </p>
        </div>
      </div>

      {/* 5-Step Visual Progression Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map(s => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-[1.02]'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isActive
                        ? 'bg-white text-brand-700'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-brand-200' : 'text-slate-400'
                    }`}
                  >
                    Step {s.step}
                  </span>
                </div>
                <h4 className="text-xs font-bold tracking-tight">{s.title}</h4>
                <p
                  className={`text-[11px] mt-1 line-clamp-2 ${
                    isActive ? 'text-brand-100' : 'text-slate-500'
                  }`}
                >
                  {s.actor}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-semibold">
                <span>{isActive ? 'Active Stage' : isDone ? 'Completed' : 'Pending'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Stage Inspector: Left is Architecture & Explanation, Right is Live JSON Payload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              {React.createElement(steps[currentStep - 1].icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-xs text-brand-700 font-semibold font-mono">
                {steps[currentStep - 1].actor}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900 text-sm">
              {steps[currentStep - 1].description}
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Interview Key Concept
              </h5>
              {currentStep === 1 && (
                <p>
                  ABHA (Ayushman Bharat Health Account) is a 14-digit unique identifier that enables citizens to authenticate across any healthcare provider in India, establishing verifiable digital health identities.
                </p>
              )}
              {currentStep === 2 && (
                <p>
                  Health Facility Registry (HFR) allows hospitals, clinics, and diagnostic labs to act as Health Information Providers (HIPs), associating electronic consultation encounters with the patient's ABHA.
                </p>
              )}
              {currentStep === 3 && (
                <p>
                  Health Information Users (HIUs) are authorized medical entities requesting longitudinal records for care continuity or second opinions.
                </p>
              )}
              {currentStep === 4 && (
                <p>
                  Consent Manager (CM) Gateway ensures all clinical data exchange requires explicit, time-bounded, granular electronic consent artefacts signed by the patient.
                </p>
              )}
              {currentStep === 5 && (
                <p>
                  Health Information Exchange (HIE) takes place peer-to-peer using FHIR R4 encrypted payloads (End-to-End Encryption with ECDH keys), ensuring data privacy.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Live Payload & Network Simulator Console */}
        <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 shadow-elevated p-6 space-y-4 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold">ABDM Gateway Transaction Payload</span>
              </div>
              <span className="text-[10px] text-brand-400">Status 200 OK</span>
            </div>

            <div className="mt-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 text-emerald-400 max-h-56 overflow-y-auto">
              <pre>{JSON.stringify(steps[currentStep - 1].payload, null, 2)}</pre>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="pt-3 border-t border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Gateway Audit Log
            </span>
            <div className="space-y-1 text-[11px] text-slate-400 max-h-24 overflow-y-auto">
              {logs.slice(0, 3).map((log, i) => (
                <div key={i} className="leading-tight">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
