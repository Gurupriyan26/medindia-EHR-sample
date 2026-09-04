import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Clock, Stethoscope, ChevronRight, Play } from 'lucide-react';

export const AppointmentsList: React.FC = () => {
  const { appointments, updateAppointmentState, setSelectedPatientId, setActiveTab } = useApp();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In-Progress':
        return <Badge variant="green" dot>In Consultation</Badge>;
      case 'Waiting':
        return <Badge variant="amber" dot>In Waiting Room</Badge>;
      case 'Completed':
        return <Badge variant="gray">Completed</Badge>;
      default:
        return <Badge variant="blue">Scheduled</Badge>;
    }
  };

  const handleStartConsultation = (apt: any) => {
    setSelectedPatientId(apt.patientId);
    updateAppointmentState(apt._id || apt.id, 'In-Progress');
    setActiveTab('doctor');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Today's Consultation Queue</h3>
          <p className="text-xs text-slate-500">Live outpatient token schedule</p>
        </div>
        <button
          onClick={() => setActiveTab('appointments')}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 mt-2 flex-1 overflow-y-auto max-h-[380px]">
        {appointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No consultations scheduled for today.
          </div>
        ) : (
          appointments.map(apt => (
            <div
              key={apt._id || apt.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                  #{apt.tokenNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{apt.patientName}</h4>
                    <span className="text-[11px] text-slate-400">
                      ({apt.patientAge}y, {apt.patientGender})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{apt.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{apt.timeSlot}</span>
                  </div>
                  <div className="mt-1">{getStatusBadge(apt.status)}</div>
                </div>

                {apt.status !== 'Completed' && (
                  <button
                    onClick={() => handleStartConsultation(apt)}
                    className="p-2 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl border border-brand-200 hover:border-brand-600 transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Open in Doctor Workstation"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Consult</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
