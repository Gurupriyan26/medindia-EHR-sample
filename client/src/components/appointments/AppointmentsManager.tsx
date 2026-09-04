import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  User,
  Stethoscope,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AppointmentsManager: React.FC = () => {
  const {
    appointments,
    patients,
    addNewAppointment,
    updateAppointmentState,
    setSelectedPatientId,
    setActiveTab,
  } = useApp();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedPatientId, setSelectedId] = useState(patients[0]?._id || patients[0]?.id || '');
  const [timeSlot, setTimeSlot] = useState('11:30 AM');
  const [type, setType] = useState<Appointment['type']>('In-Person Consultation');
  const [reason, setReason] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Rao');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const patient = patients.find(p => p._id === selectedPatientId || p.id === selectedPatientId) || patients[0];

    await addNewAppointment({
      patientId: patient._id || patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorName,
      specialty: 'Cardiologist & General Physician',
      date: new Date().toISOString().split('T')[0],
      timeSlot,
      type,
      reason: reason.trim(),
    });

    setIsBookModalOpen(false);
    setReason('');
  };

  const handleStartConsultation = (apt: Appointment) => {
    setSelectedPatientId(apt.patientId);
    updateAppointmentState(apt._id || apt.id || '', 'In-Progress');
    setActiveTab('doctor');
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Appointment Queue & Consultation Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage live outpatient tokens, waiting room queues, and teleconsultations
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Scheduled', 'Waiting', 'In-Progress', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'all' ? 'All Tokens' : status}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Token #</th>
                <th className="px-4 py-3.5">Patient Details</th>
                <th className="px-4 py-3.5">Time & Type</th>
                <th className="px-4 py-3.5">Chief Purpose</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No appointments in this queue.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt._id || apt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Token */}
                    <td className="px-5 py-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-extrabold flex items-center justify-center text-sm">
                        #{apt.tokenNumber}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => {
                          setSelectedPatientId(apt.patientId);
                          setActiveTab('ehr');
                        }}
                        className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm text-left block"
                      >
                        {apt.patientName}
                      </button>
                      <span className="text-[11px] text-slate-500">
                        {apt.patientAge}y • {apt.patientGender}
                      </span>
                    </td>

                    {/* Time & Type */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{apt.type}</span>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-700 font-medium">{apt.reason}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          apt.status === 'Completed'
                            ? 'gray'
                            : apt.status === 'In-Progress'
                            ? 'green'
                            : apt.status === 'Waiting'
                            ? 'amber'
                            : 'blue'
                        }
                        dot={apt.status === 'In-Progress' || apt.status === 'Waiting'}
                      >
                        {apt.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {apt.status !== 'Completed' && (
                          <button
                            onClick={() => handleStartConsultation(apt)}
                            className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Consult</span>
                          </button>
                        )}
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => updateAppointmentState(apt._id || apt.id || '', 'Waiting')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium"
                          >
                            Mark Waiting
                          </button>
                        )}
                        {apt.status !== 'Completed' && (
                          <button
                            onClick={() => updateAppointmentState(apt._id || apt.id || '', 'Completed')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                          >
                            Done
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

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule New Consultation Appointment"
        subtitle="Issue an outpatient token for clinical evaluation"
        maxWidth="2xl"
        footer={
          <>
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleBookAppointment}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Book & Issue Token
            </button>
          </>
        }
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white"
            >
              {patients.map(p => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.age}y {p.gender}, {p.bloodGroup}) - ABHA: {p.abhaId}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Mode</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              >
                <option value="In-Person Consultation">In-Person Consultation</option>
                <option value="Video Follow-up">Video Follow-up</option>
                <option value="Lab Review">Lab Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Encounter / Chief Complaint *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Routine quarterly diabetic follow-up & blood sugar review"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
