import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { ChevronRight, FileText, Sparkles, AlertCircle } from 'lucide-react';

export const RecentPatientsList: React.FC = () => {
  const { patients, setSelectedPatientId, setActiveTab, openAiSummaryModal } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Patients</h3>
          <p className="text-xs text-slate-500">Quick access to comprehensive health records</p>
        </div>
        <button
          onClick={() => setActiveTab('patients')}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 mt-2 flex-1 overflow-y-auto max-h-[380px]">
        {patients.slice(0, 5).map(p => {
          const hasSevereAllergy = p.allergies.some(a => a.severity === 'Severe' || a.severity === 'Life-Threatening');
          return (
            <div
              key={p._id || p.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
            >
              <div
                onClick={() => {
                  setSelectedPatientId(p._id || p.id || null);
                  setActiveTab('ehr');
                }}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="relative">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1 rounded bg-slate-900 text-white leading-tight">
                    {p.bloodGroup}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate hover:text-brand-600 transition-colors">
                      {p.name}
                    </h4>
                    {hasSevereAllergy && (
                      <span className="p-0.5 text-rose-600 bg-rose-50 rounded" title="Severe Allergies Documented">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    ABHA: {p.abhaId} • {p.age}y {p.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAiSummaryModal(p._id || p.id)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200/60 transition-all text-xs font-semibold flex items-center gap-1"
                  title="Generate AI Clinical Summary"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                </button>
                <button
                  onClick={() => {
                    setSelectedPatientId(p._id || p.id || null);
                    setActiveTab('ehr');
                  }}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-xs font-semibold flex items-center gap-1"
                  title="Open Complete EHR"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EHR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
