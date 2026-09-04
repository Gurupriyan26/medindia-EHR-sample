import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Stethoscope,
  Calendar,
  FlaskConical,
  ShieldAlert,
  Network,
  Settings,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, selectedPatient, openAiSummaryModal } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['doctor', 'patient', 'admin'],
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      roles: ['doctor', 'admin'],
    },
    {
      id: 'ehr',
      label: 'EHR Profile',
      icon: FileText,
      badge: selectedPatient?.name.split(' ')[0],
      roles: ['doctor', 'patient', 'admin'],
    },
    {
      id: 'doctor',
      label: 'Doctor Workstation',
      icon: Stethoscope,
      roles: ['doctor', 'admin'],
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      roles: ['doctor', 'admin'],
    },
    {
      id: 'labs',
      label: 'Lab Reports',
      icon: FlaskConical,
      roles: ['doctor', 'patient', 'admin'],
    },
    {
      id: 'consent',
      label: 'Consent Hub',
      icon: ShieldAlert,
      badge: 'ABDM',
      roles: ['doctor', 'patient', 'admin'],
    },
    {
      id: 'abdm',
      label: 'ABDM Sandbox',
      icon: Network,
      highlight: true,
      roles: ['doctor', 'patient', 'admin'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['doctor', 'admin', 'patient'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white shadow-glow">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
              MedIndia<span className="text-brand-400 font-semibold text-xs ml-1">EHR</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
              Next-Gen Clinical Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Clinical Navigation
        </div>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : item.highlight ? 'text-brand-400' : 'text-slate-400'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={clsx(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded',
                    isActive ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Summary Quick Box in Sidebar */}
      {selectedPatient && (
        <div className="p-3 m-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Active Patient</span>
            <span className="text-[10px] font-mono text-brand-400 bg-brand-950/60 px-1 rounded">
              {selectedPatient.bloodGroup}
            </span>
          </div>
          <p className="font-bold text-white truncate text-xs">{selectedPatient.name}</p>
          <p className="text-[10px] text-slate-400 font-mono truncate">ABHA: {selectedPatient.abhaId}</p>
          <button
            onClick={() => openAiSummaryModal()}
            className="w-full mt-2.5 py-1.5 px-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>Generate AI Summary</span>
          </button>
        </div>
      )}

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs">
            DR
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Dr. Sarah Rao</p>
            <p className="text-[10px] text-slate-400 truncate">Cardiology & Gen. Med</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
