import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  Eye, 
  Download, 
  Mail, 
  CheckCircle2, 
  Calendar,
  Building,
  DollarSign
} from 'lucide-react';
import { fetchPayslips } from '../api';

export default function PayslipsView({ 
  currentMonth, 
  company, 
  onViewPayslip, 
  onOpenQuickSlip 
}) {
  const [payslips, setPayslips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isCustomCycle, setIsCustomCycle] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(false);
  const [sentSlips, setSentSlips] = useState({});

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  const formatCycleLabel = (mYear) => {
    if (!mYear || !mYear.includes('-')) return mYear;
    const [y, m] = mYear.split('-').map(Number);
    if (!y || !m) return mYear;
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const availableCycles = Array.from(new Set([
    '2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05',
    '2026-04', '2026-03', '2026-02', '2026-01',
    '2025-12', '2025-11', '2025-10', '2025-09',
    ...payslips.map(s => s.monthYear).filter(Boolean)
  ])).sort().reverse();

  useEffect(() => {
    loadPayslips();
  }, [selectedMonth]);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const data = await fetchPayslips({ monthYear: selectedMonth });
      setPayslips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['All', ...new Set(payslips.map(s => s.department).filter(Boolean))];

  const filteredSlips = payslips.filter(slip => {
    const matchesSearch = 
      slip.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      slip.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      slip.id?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || slip.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleSendEmail = (slipId) => {
    setSentSlips(prev => ({ ...prev, [slipId]: true }));
    setTimeout(() => {
      setSentSlips(prev => ({ ...prev, [slipId]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payslip Archive & Distribution Hub</h2>
          <p className="text-xs text-slate-400">
            Preview, print, generate, and export official payslips with multi-template styling and statutory breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickSlip()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            Quick Payslip Studio
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or slip ref..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Cycle:</span>
            <select
              value={isCustomCycle ? 'custom' : selectedMonth}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomCycle(true);
                } else {
                  setIsCustomCycle(false);
                  setSelectedMonth(e.target.value);
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none cursor-pointer text-xs"
            >
              <option value="">All Pay Cycles</option>
              <option value="custom">📅 Custom Cycle Filter...</option>
              <optgroup label="Available Cycles">
                {availableCycles.map(c => (
                  <option key={c} value={c}>
                    {formatCycleLabel(c)}
                  </option>
                ))}
              </optgroup>
            </select>

            {isCustomCycle && (
              <input
                type="month"
                value={selectedMonth || '2026-10'}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-950 border border-amber-500/50 rounded-lg px-2.5 py-1 text-slate-200 outline-none cursor-pointer text-xs focus:ring-1 focus:ring-amber-500 font-mono"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payslips Grid / Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Slip Ref & Employee</th>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Gross Earned</th>
                <th className="py-3 px-4 text-rose-400">Deductions</th>
                <th className="py-3 px-4 text-emerald-400">Net Take-Home</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredSlips.map(slip => {
                const isSent = sentSlips[slip.id];
                return (
                  <tr key={slip.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{slip.employeeName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {slip.id} • {slip.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">{slip.monthName || slip.monthYear}</span>
                      <p className="text-[10px] text-slate-400">{slip.attendance?.payableDays || 30} days paid</p>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {currencySymbol}{slip.earnings?.totalGross?.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono text-rose-400">
                      -{currencySymbol}{slip.deductions?.totalDeductions?.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {currencySymbol}{slip.netPay?.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {slip.status || 'Verified'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSendEmail(slip.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Email Payslip to Employee"
                        >
                          {isSent ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onViewPayslip(slip)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View / Print / PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

