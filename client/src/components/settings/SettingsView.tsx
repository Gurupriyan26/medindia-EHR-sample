import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import {
  Settings,
  Database,
  Shield,
  RotateCcw,
  Sparkles,
  Server,
  UserCheck,
  Stethoscope,
  Network,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentRole, setCurrentRole, resetToDefaultDemo, patients, visits, labReports, consents } = useApp();

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Prototype Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          EHR Environment parameters, ABDM gateway simulation, and demo data controls
        </p>
      </div>

      {/* Role Switcher Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-brand-600" />
          <span>Active Demonstration Perspective</span>
        </h3>
        <p className="text-xs text-slate-500">
          Switch roles during the interview to present physician workflow vs. patient data privacy control.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setCurrentRole('doctor')}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentRole === 'doctor'
                ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 text-brand-800 font-bold text-xs mb-1">
              <Stethoscope className="w-4 h-4 text-brand-600" />
              <span>Doctor Perspective (Dr. Sarah Rao)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Access entire clinical workstation, prescription composer, vitals logger, and AI summary briefings.
            </p>
          </button>

          <button
            onClick={() => setCurrentRole('patient')}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentRole === 'patient'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Patient Perspective (Aarav Sharma)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Inspect personal longitudinal EHR, download reports, and authorize/revoke ABDM Consent Artefacts.
            </p>
          </button>
        </div>
      </div>

      {/* Database & Architecture Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-600" />
          <span>Architecture & Storage Status</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled Patients</span>
            <span className="text-base font-extrabold text-slate-900">{patients.length} Records</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Visits</span>
            <span className="text-base font-extrabold text-slate-900">{visits.length} Encounters</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Lab Reports</span>
            <span className="text-base font-extrabold text-slate-900">{labReports.length} Diagnostics</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">ABDM Consents</span>
            <span className="text-base font-extrabold text-slate-900">{consents.length} Artefacts</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <h4 className="font-bold text-slate-800">Dual-Mode Fallback Engine</h4>
            <p className="text-[11px] text-slate-500">
              Auto-negotiates between Node.js + Express REST APIs and resilient client-side storage.
            </p>
          </div>
          <Badge variant="green" dot>
            Zero-Config Ready
          </Badge>
        </div>
      </div>

      {/* Reset Seed Data */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Reset Demo Clinical Dataset</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Restores the initial sample database with 6 diverse Indian patient cases, visits, labs, and ABDM consents.
          </p>
        </div>
        <button
          onClick={resetToDefaultDemo}
          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Sample Dataset</span>
        </button>
      </div>
    </div>
  );
};
