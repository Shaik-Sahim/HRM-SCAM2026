import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  PlusCircle, 
  FileText, 
  PlayCircle, 
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  company, 
  currentMonth, 
  setCurrentMonth, 
  onOpenQuickSlip, 
  onOpenAddEmp, 
  onNavigate 
}) {
  const [isCustomNavbar, setIsCustomNavbar] = useState(false);

  const months = [
    { value: '2026-10', label: 'October 2026 (Current)' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-01', label: 'January 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'December 2026' },
    { value: '2025-12', label: 'December 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-10', label: 'October 2025' },
    { value: '2025-09', label: 'September 2025' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Company Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 p-1">
            <img src="/margey-icon.png" alt="Margey Labs" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">Margey <span className="text-cyan-400">Labs</span> <span className="text-xs text-slate-400 font-normal">HRM</span></span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 truncate max-w-xs md:max-w-md">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              {company?.name || 'Margey Labs Pvt Ltd'}
            </p>
          </div>
        </div>

        {/* Center / Actions */}
        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-inner gap-1.5">
            <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={isCustomNavbar ? 'custom' : currentMonth}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomNavbar(true);
                } else {
                  setIsCustomNavbar(false);
                  setCurrentMonth(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer focus:ring-0"
            >
              <option value="custom" className="bg-slate-900 text-amber-400">📅 Custom Month...</option>
              <optgroup label="Select Month" className="bg-slate-900 text-slate-200">
                {months.map(m => (
                  <option key={m.value} value={m.value} className="bg-slate-900 text-slate-200">
                    {m.label}
                  </option>
                ))}
              </optgroup>
            </select>

            {isCustomNavbar && (
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => {
                  if (e.target.value) setCurrentMonth(e.target.value);
                }}
                className="bg-slate-900 border border-amber-500/50 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            )}
          </div>

          {/* Quick Payslip Generator Trigger */}
          <button
            onClick={onOpenQuickSlip}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all hover:scale-[1.02] shadow-sm"
            title="Instant Single Payslip Generator for HR"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Payslip
          </button>

          {/* Add Employee Trigger */}
          <button
            onClick={onOpenAddEmp}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            Add Employee
          </button>

          {/* Process Payroll Button */}
          <button
            onClick={() => onNavigate('payroll')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
          >
            <PlayCircle className="w-4 h-4" />
            Run Payroll
          </button>
        </div>
      </div>
    </header>
  );
}

