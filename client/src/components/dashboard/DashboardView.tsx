import React from 'react';
import { StatCards } from './StatCards';
import { AppointmentsList } from './AppointmentsList';
import { RecentPatientsList } from './RecentPatientsList';
import { AbdmStatusBanner } from './AbdmStatusBanner';
import { useApp } from '../../context/AppContext';
import { Stethoscope, UserPlus, FlaskConical, Sparkles, ShieldCheck } from 'lucide-react';

interface DashboardViewProps {
  onOpenNewPatientModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewPatientModal }) => {
  const { setActiveTab, openAiSummaryModal, selectedPatient } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Clinical Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">Dr. Sarah Rao</span> • MedIndia Apex Care Clinic, Bengaluru
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('doctor')}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Start Consultation</span>
          </button>
          <button
            onClick={onOpenNewPatientModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4 text-brand-600" />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* ABDM Prototype Banner */}
      <AbdmStatusBanner />

      {/* Top Level Metric Cards */}
      <StatCards />

      {/* Operational 2-Column Split: Appointments Queue + Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentsList />
        <RecentPatientsList />
      </div>
    </div>
  );
};
