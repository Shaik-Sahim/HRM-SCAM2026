import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Settings,
  ShieldCheck,
  Award,
  ChevronRight,
  FileBadge
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, company, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'employees', label: 'Employees', icon: Users, badge: stats?.activeEmployees || 10 },
    { id: 'attendance', label: 'Attendance & Leaves', icon: CalendarCheck, badge: `${stats?.avgAttendanceRate || 96}%` },
    { id: 'hikes', label: 'Comp & Hikes', icon: TrendingUp, badge: 'Appraisals' },
    { id: 'payroll', label: 'Payroll Engine', icon: CreditCard, badge: 'Run' },
    { id: 'payslips', label: 'Payslips Hub', icon: FileText, badge: stats?.totalPayslipsGenerated || null },
    { id: 'documents', label: 'Letters & Studio', icon: FileBadge, badge: 'Offer/Rel' },
    { id: 'settings', label: 'Company Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Workforce & Payroll
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/20 to-indigo-600/10 text-white border border-brand-500/30 shadow-sm shadow-brand-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={isActive ? 'font-semibold text-slate-100' : 'text-slate-300'}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Highlights Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200">Statutory Compliance</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            PF (12%), ESI (0.75%), PTax & TDS automated with proration engine.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-brand-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Formula
            </span>
            <span>100% Tax Compliant</span>
          </div>
        </div>
      </div>

      {/* Footer Profile & Legal Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center p-1">
            <img src="/margey-icon.png" alt="Margey" className="w-6 h-6 object-contain" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{company?.name || 'Margey Labs Pvt Ltd'}</p>
            <p className="text-[10px] text-slate-400 truncate">CIN: {company?.cin || 'U72900KA2020PTC139876'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

