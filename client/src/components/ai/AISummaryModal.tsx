import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  AlertTriangle,
  Pill,
  HeartPulse,
  FlaskConical,
  Stethoscope,
  Copy,
  Check,
  Printer,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export const AISummaryModal: React.FC = () => {
  const {
    isAiModalOpen,
    closeAiSummaryModal,
    aiSummary,
    isAiLoading,
    openAiSummaryModal,
    selectedPatient,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!isAiModalOpen) return null;

  const handleCopy = () => {
    if (!aiSummary) return;
    const text = `MEDINDIA AI CLINICAL SUMMARY
Patient: ${aiSummary.patientName} (Generated: ${new Date(aiSummary.generatedAt).toLocaleString()})

EXECUTIVE SUMMARY:
${aiSummary.executiveSummary}

ACTIVE CONDITIONS:
${aiSummary.activeConditionsSummary.join('\n')}

CURRENT MEDICATIONS:
${aiSummary.medicationRegimenSummary.join('\n')}

CRITICAL ALLERGIES:
${aiSummary.criticalAllergiesSummary.join('\n')}

SUGGESTED CLINICAL FOCUS:
${aiSummary.suggestedClinicalFocus.join('\n')}

DISCLAIMER: ${aiSummary.disclaimer}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: 'AI Clinical Summary ready for clinical notes.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isAiModalOpen}
      onClose={closeAiSummaryModal}
      title="AI Clinical Patient Summary"
      subtitle={`Synthesized Longitudinal EHR Briefing • ${selectedPatient?.name || 'Patient'}`}
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold">Engine:</span>
            <Badge variant="purple" size="sm">
              {aiSummary?.source || 'Clinical NLP Engine'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAiSummaryModal()}
              disabled={isAiLoading}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={!aiSummary || isAiLoading}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopy}
              disabled={!aiSummary || isAiLoading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Loading State */}
      {isAiLoading && (
        <div className="py-16 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Synthesizing Patient EHR Data...</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Analyzing past consultations, ICD diagnoses, medication schedules, lab investigations, and allergy contraindications.
            </p>
          </div>
        </div>
      )}

      {/* Loaded Summary */}
      {!isAiLoading && aiSummary && (
        <div className="space-y-5 print:space-y-4 text-xs sm:text-sm">
          {/* MANDATORY MEDICAL DISCLAIMER BANNER */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">
                Clinical Safety Notice: AI-generated summary. Not a medical diagnosis.
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This automated briefing is synthesized from available EHR records to assist healthcare professionals. It does not replace independent clinical judgment, formal physical examination, or diagnostic verification.
              </p>
            </div>
          </div>

          {/* Executive Clinical Synopsis */}
          <div className="p-4.5 bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200/80 rounded-2xl shadow-subtle">
            <div className="flex items-center gap-2 mb-2 text-brand-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Executive Clinical Synopsis</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {aiSummary.executiveSummary}
            </p>
          </div>

          {/* 2-Column Clinical Insight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Conditions */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Active Conditions & Risks</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aiSummary.activeConditionsSummary.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>

            {/* Critical Allergies Warning */}
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs uppercase tracking-wider pb-2 border-b border-rose-200/60">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Critical Allergies Warning</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-900 font-medium">
                {aiSummary.criticalAllergiesSummary.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>

            {/* Current Medication Regimen */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Current Medication Regimen</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aiSummary.medicationRegimenSummary.map((item, idx) => (
                  <li key={idx} className="font-mono text-[11px] leading-snug">• {item}</li>
                ))}
              </ul>
            </div>

            {/* Diagnostic Lab Highlights */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <span>Recent Diagnostic Highlights</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aiSummary.labHighlightsSummary.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Clinical Focus for Today's Visit */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
              <Stethoscope className="w-4 h-4 text-brand-400" />
              <span>Recommended Physician Focus for Today's Consultation</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {aiSummary.suggestedClinicalFocus.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};
