import React from 'react';
import { useApp } from '../../context/AppContext';
import { Network, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const AbdmStatusBanner: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-brand-950 rounded-2xl p-6 text-white shadow-elevated border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-[11px] font-semibold mb-3">
          <Sparkles className="w-3 h-3 text-brand-300" />
          <span>ABDM Integration – Prototype Environment</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
          Ayushman Bharat Digital Mission (ABDM) Simulator
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Demonstrating federated Indian health data interoperability:
          <span className="text-brand-300 font-semibold"> Patient → ABHA ID → EHR → Electronic Consent → Encrypted Health Information Exchange (HIE)</span>.
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>14-Digit ABHA Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Patient Consent Gateway</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Encrypted FHIR Bundles</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <button
          onClick={() => setActiveTab('abdm')}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Network className="w-4 h-4" />
          <span>Explore Interactive ABDM Flow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
