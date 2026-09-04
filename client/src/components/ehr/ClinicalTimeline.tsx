import React from 'react';
import { TimelineEvent } from '../../types';
import { Stethoscope, Pill, FlaskConical, ShieldCheck, UserPlus, Calendar } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ClinicalTimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({ events, onSelectEvent }) => {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        No recorded clinical events in this patient's timeline.
      </div>
    );
  }

  const iconMap = {
    visit: <Stethoscope className="w-4 h-4 text-brand-600" />,
    prescription: <Pill className="w-4 h-4 text-emerald-600" />,
    lab: <FlaskConical className="w-4 h-4 text-purple-600" />,
    consent: <ShieldCheck className="w-4 h-4 text-amber-600" />,
    registration: <UserPlus className="w-4 h-4 text-slate-600" />,
  };

  const bgMap = {
    visit: 'bg-brand-50 border-brand-200',
    prescription: 'bg-emerald-50 border-emerald-200',
    lab: 'bg-purple-50 border-purple-200',
    consent: 'bg-amber-50 border-amber-200',
    registration: 'bg-slate-100 border-slate-200',
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, idx) => (
        <div key={event.id || idx} className="relative group">
          {/* Node Icon on the vertical line */}
          <div
            className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-2xs ${bgMap[event.type]} transform group-hover:scale-110 transition-transform`}
          >
            {iconMap[event.type]}
          </div>

          {/* Event Content Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-brand-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
                {event.badgeText && (
                  <Badge variant={event.badgeColor || 'blue'} size="sm">
                    {event.badgeText}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{event.date}</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-600">{event.subtitle}</p>

            {event.details && (
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-sans">
                {event.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
