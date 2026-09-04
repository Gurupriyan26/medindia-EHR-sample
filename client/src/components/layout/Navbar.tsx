import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  User,
  Plus,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface NavbarProps {
  onOpenNewPatientModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewPatientModal }) => {
  const {
    currentRole,
    setCurrentRole,
    searchQuery,
    setSearchQuery,
    openAiSummaryModal,
    selectedPatient,
    setActiveTab,
    patients,
    setSelectedPatientId,
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Filtered preview patients when searching in top bar
  const matchingPatients = searchQuery.trim().length > 0
    ? patients.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.abhaId.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-all">
      {/* Search Bar with Quick Autocomplete */}
      <div className="relative flex-1 max-w-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient by Name, ABHA ID (e.g. 91-4567...), or Phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
            className="w-full pl-9 pr-12 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
          <kbd className="hidden sm:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/60 rounded border border-slate-300/60">
            /
          </kbd>
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchFocused && matchingPatients.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-elevated border border-slate-200 py-2 z-50 animate-fadeIn">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Matching Patients
            </div>
            {matchingPatients.map(p => (
              <button
                key={p._id || p.id}
                onMouseDown={() => {
                  setSelectedPatientId(p._id || p.id || null);
                  setActiveTab('ehr');
                  setSearchQuery('');
                }}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ABHA: {p.abhaId}</p>
                  </div>
                </div>
                <Badge variant="blue" size="sm">
                  {p.bloodGroup}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* ABDM Live Network Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-lg text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ABDM Gateway: Live (Mock HIE)</span>
        </div>

        {/* AI Patient Summary Trigger */}
        {selectedPatient && (
          <button
            onClick={() => openAiSummaryModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all group"
            title="Generate AI Clinical Briefing for active patient"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Summary</span>
          </button>
        )}

        {/* Quick Action: Add Patient */}
        <button
          onClick={onOpenNewPatientModal}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Patient</span>
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors"
          >
            {currentRole === 'doctor' ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
                <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
                <span>Dr. Sarah Rao</span>
              </div>
            ) : currentRole === 'patient' ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Patient View</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-800">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Clinic Admin</span>
              </div>
            )}
          </button>

          {/* Role Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-elevated border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Simulate Perspective
              </div>
              <button
                onClick={() => {
                  setCurrentRole('doctor');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                  currentRole === 'doctor' ? 'font-bold text-brand-700 bg-brand-50/50' : 'text-slate-700'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-brand-600" />
                <div>
                  <p className="font-semibold">Doctor (Dr. Rao)</p>
                  <p className="text-[10px] text-slate-500">Full EHR, Consultations, Rx</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('patient');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                  currentRole === 'patient' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-semibold">Patient (Aarav Sharma)</p>
                  <p className="text-[10px] text-slate-500">View records & Consent Hub</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
