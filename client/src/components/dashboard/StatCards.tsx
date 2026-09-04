import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, CalendarCheck, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { patients, appointments, labReports, consents } = useApp();

  const totalPatients = patients.length;
  const todayConsultations = appointments.filter(a => a.status === 'Completed' || a.status === 'In-Progress').length;
  const pendingReports = labReports.filter(l => l.status === 'Abnormal' || l.status === 'Critical' || l.status === 'Pending').length;
  const activeConsents = consents.filter(c => c.status === 'GRANTED').length;

  const stats = [
    {
      title: 'Total Enrolled Patients',
      value: totalPatients,
      subtitle: '+2 registered this week',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-brand-50 text-brand-700 border-brand-100',
      iconBg: 'bg-brand-600 text-white',
    },
    {
      title: "Today's Consultations",
      value: appointments.length,
      subtitle: `${todayConsultations} encounters ongoing/done`,
      icon: CalendarCheck,
      color: 'emerald',
      bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      title: 'Attention Lab Reports',
      value: pendingReports,
      subtitle: 'Abnormal or critical results',
      icon: AlertTriangle,
      color: 'amber',
      bgColor: 'bg-amber-50 text-amber-800 border-amber-100',
      iconBg: 'bg-amber-500 text-white',
    },
    {
      title: 'Active ABDM Consents',
      value: activeConsents,
      subtitle: 'Patient-authorized HIE',
      icon: ShieldCheck,
      color: 'purple',
      bgColor: 'bg-purple-50 text-purple-800 border-purple-100',
      iconBg: 'bg-purple-600 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">{stat.title}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${stat.iconBg} transform group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{stat.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
