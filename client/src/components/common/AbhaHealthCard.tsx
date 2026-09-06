import React, { useRef } from 'react';
import { Patient } from '../../types';
import { ShieldCheck, QrCode, Printer, Phone, Calendar, Heart, User, CheckCircle2 } from 'lucide-react';

interface AbhaHealthCardProps {
  patient: Patient;
  onClose?: () => void;
  isPrintOnly?: boolean;
}

export const AbhaHealthCard: React.FC<AbhaHealthCardProps> = ({ patient, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Generate a QR code mock pattern or SVG
  const abhaNumber = patient.abhaId || '91-XXXX-XXXX-XXXX';
  const abhaAddress = patient.abhaAddress || `${patient.name.toLowerCase().replace(/\s+/g, '.')}@abdm`;

  return (
    <div className="flex flex-col items-center">
      {/* Wallet-Sized ABHA Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-2xl border border-sky-500/30 relative overflow-hidden print:shadow-none print:border-black"
      >
        {/* Background glow & holographic effect */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest text-sky-400 uppercase">MedIndia EHR</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">ABDM</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">National Digital Health Card</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Govt of India</span>
            <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex items-start gap-4 mb-5">
          {/* Patient Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-sky-400/50 shadow-md bg-slate-800">
              {patient.avatarUrl ? (
                <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
            <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-md shadow">
              {patient.bloodGroup}
            </span>
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white tracking-tight truncate">{patient.name}</h3>
            <p className="text-xs text-sky-300/90 font-mono truncate">{abhaAddress}</p>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Age / Gender</span>
                <span className="font-semibold text-slate-100">{patient.age} Yrs • {patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Mobile</span>
                <span className="font-semibold text-slate-100">{patient.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ABHA Number Highlight Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 backdrop-blur-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            14-Digit ABHA Health Number
          </span>
          <p className="text-lg font-mono font-bold tracking-widest text-sky-300">
            {abhaNumber}
          </p>
        </div>

        {/* Card Footer with QR Code */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-[10px] text-slate-300 max-w-[200px]">
            <p className="font-semibold text-slate-200">Emergency Contact</p>
            <p className="text-slate-400 truncate">
              {patient.emergencyContact?.name ? `${patient.emergencyContact.name} (${patient.emergencyContact.phone})` : 'Registered at MedIndia Clinic'}
            </p>
          </div>

          {/* Scannable QR Badge */}
          <div className="bg-white p-1.5 rounded-xl shadow-md flex items-center justify-center">
            <QrCode className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          Print / Save Health Card
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
