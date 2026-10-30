import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Calculator, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  Building
} from 'lucide-react';
import { generateSinglePayslip } from '../api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatMonthLabel(mYear) {
  if (!mYear || !mYear.includes('-')) return mYear;
  const [y, m] = mYear.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return mYear;
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export default function QuickPayslipGeneratorModal({ employees, company, onClose, onPayslipGenerated }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [monthYear, setMonthYear] = useState('2026-10');
  const [isCustomMonth, setIsCustomMonth] = useState(false);
  const [customYear, setCustomYear] = useState(2026);
  const [customMonthIndex, setCustomMonthIndex] = useState(10);
  
  const applyMonth = (val) => {
    if (!val) return;
    setMonthYear(val);
    const [y, m] = val.split('-').map(Number);
    if (y && m) {
      setCustomYear(y);
      setCustomMonthIndex(m);
      const days = new Date(y, m, 0).getDate();
      setTotalWorkingDays(days);
      setPresentDays(Math.max(1, days - 2));
    }
  };

  const handleCustomMonthSelect = (mIdx) => {
    const mStr = String(mIdx).padStart(2, '0');
    applyMonth(`${customYear}-${mStr}`);
  };

  const handleCustomYearChange = (yr) => {
    const yNum = Number(yr);
    if (!isNaN(yNum) && yNum >= 1990 && yNum <= 2099) {
      const mStr = String(customMonthIndex).padStart(2, '0');
      applyMonth(`${yNum}-${mStr}`);
    }
  };
  
  // Attendance inputs
  const [totalWorkingDays, setTotalWorkingDays] = useState(31);
  const [presentDays, setPresentDays] = useState(29);
  const [paidLeaves, setPaidLeaves] = useState(2);
  const [halfDays, setHalfDays] = useState(0);
  const [unpaidLeaves, setUnpaidLeaves] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);

  // Compensation & variable inputs
  const [bonus, setBonus] = useState(0);
  const [incentive, setIncentive] = useState(0);
  const [arrears, setArrears] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [advanceDeduction, setAdvanceDeduction] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];
  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setError('Please select an employee');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        employeeId: selectedEmpId,
        monthYear,
        attendance: {
          totalWorkingDays: Number(totalWorkingDays),
          presentDays: Number(presentDays),
          paidLeaves: Number(paidLeaves),
          halfDays: Number(halfDays),
          unpaidLeaves: Number(unpaidLeaves),
          overtimeHours: Number(overtimeHours),
          holidays: 4
        },
        adjustments: {
          bonus: Number(bonus),
          incentive: Number(incentive),
          arrears: Number(arrears),
          otherAllowances: Number(otherAllowances),
          advanceDeduction: Number(advanceDeduction),
          otherDeductions: Number(otherDeductions)
        }
      };

      const result = await generateSinglePayslip(payload);
      onPayslipGenerated(result);
    } catch (err) {
      setError(err.message || 'Error communicating with backend payroll engine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">HR Instant Payslip Generator</h3>
              <p className="text-xs text-slate-400">
                Input HR metrics & run backend payroll calculation in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Employee & Pay Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Employee *
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                    {emp.fullName} ({emp.id}) — {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Pay Period Month *
                </label>
                {isCustomMonth ? (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Custom Cycle Active
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    {formatMonthLabel(monthYear)}
                  </span>
                )}
              </div>

              <select
                value={isCustomMonth ? 'custom' : monthYear}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomMonth(true);
                  } else {
                    setIsCustomMonth(false);
                    applyMonth(e.target.value);
                  }
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <optgroup label="Custom Option">
                  <option value="custom">📅 Custom Month & Year (Pick Any Period)...</option>
                </optgroup>
                <optgroup label="2026 Pay Cycles">
                  <option value="2026-10">October 2026 (Current)</option>
                  <option value="2026-09">September 2026</option>
                  <option value="2026-08">August 2026</option>
                  <option value="2026-07">July 2026</option>
                  <option value="2026-06">June 2026</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-04">April 2026</option>
                  <option value="2026-03">March 2026</option>
                  <option value="2026-02">February 2026</option>
                  <option value="2026-01">January 2026</option>
                  <option value="2026-11">November 2026 (Upcoming)</option>
                  <option value="2026-12">December 2026 (Upcoming)</option>
                </optgroup>
                <optgroup label="2025 Pay Cycles">
                  <option value="2025-12">December 2025</option>
                  <option value="2025-11">November 2025</option>
                  <option value="2025-10">October 2025</option>
                  <option value="2025-09">September 2025</option>
                  <option value="2025-08">August 2025</option>
                  <option value="2025-07">July 2025</option>
                  <option value="2025-06">June 2025</option>
                  <option value="2025-05">May 2025</option>
                  <option value="2025-04">April 2025</option>
                  <option value="2025-03">March 2025</option>
                  <option value="2025-02">February 2025</option>
                  <option value="2025-01">January 2025</option>
                </optgroup>
                <optgroup label="2024 Pay Cycles">
                  <option value="2024-12">December 2024</option>
                  <option value="2024-11">November 2024</option>
                  <option value="2024-10">October 2024</option>
                  <option value="2024-09">September 2024</option>
                  <option value="2024-08">August 2024</option>
                  <option value="2024-07">July 2024</option>
                  <option value="2024-06">June 2024</option>
                  <option value="2024-05">May 2024</option>
                  <option value="2024-04">April 2024</option>
                  <option value="2024-03">March 2024</option>
                  <option value="2024-02">February 2024</option>
                  <option value="2024-01">January 2024</option>
                </optgroup>
              </select>

              {/* Custom Month Picker Panel */}
              {isCustomMonth && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Select Custom Month & Year:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMonth(false);
                        applyMonth('2026-10');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Reset to October 2026
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Select Month</label>
                      <select
                        value={customMonthIndex}
                        onChange={(e) => handleCustomMonthSelect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {MONTH_NAMES.map((name, idx) => (
                          <option key={name} value={idx + 1}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Enter / Choose Year</label>
                      <input
                        type="number"
                        min="2010"
                        max="2035"
                        value={customYear}
                        onChange={(e) => handleCustomYearChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400">Quick Years:</span>
                    {[2023, 2024, 2025, 2026, 2027].map(yr => (
                      <button
                        type="button"
                        key={yr}
                        onClick={() => handleCustomYearChange(yr)}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all ${
                          customYear === yr 
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                    <span>
                      📅 <strong>{formatMonthLabel(monthYear)}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Auto-set: {totalWorkingDays} days ({totalWorkingDays} total)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Mini Card */}
          {selectedEmployee && (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Designation: </span>
                <span className="font-semibold text-slate-200">{selectedEmployee.designation}</span>
              </div>
              <div>
                <span className="text-slate-400">Annual CTC: </span>
                <span className="font-bold text-brand-400 font-mono">
                  {currencySymbol}{selectedEmployee.annualCTC?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Monthly Base: </span>
                <span className="font-semibold text-slate-200 font-mono">
                  {currencySymbol}{Math.round(selectedEmployee.annualCTC / 12).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Section 2: Attendance Metrics */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              Attendance & Proration Factors
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Calendar Days</label>
                <input
                  type="number"
                  value={totalWorkingDays}
                  onChange={(e) => setTotalWorkingDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  min="20"
                  max="31"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Days Present</label>
                <input
                  type="number"
                  value={presentDays}
                  onChange={(e) => setPresentDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  min="0"
                  max="31"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Paid Leaves (PL/CL)</label>
                <input
                  type="number"
                  value={paidLeaves}
                  onChange={(e) => setPaidLeaves(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Unpaid Leaves (LWP)</label>
                <input
                  type="number"
                  value={unpaidLeaves}
                  onChange={(e) => setUnpaidLeaves(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-rose-300 font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Half Days</label>
                <input
                  type="number"
                  value={halfDays}
                  onChange={(e) => setHalfDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Overtime (Hours)</label>
                <input
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-300 font-mono"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Variable Pay & Adjustments */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Adjustments, Incentives & Arrears
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Performance Bonus ({currencySymbol})</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-300 font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Sales Incentive ({currencySymbol})</label>
                <input
                  type="number"
                  value={incentive}
                  onChange={(e) => setIncentive(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-300 font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Hike Arrears ({currencySymbol})</label>
                <input
                  type="number"
                  value={arrears}
                  onChange={(e) => setArrears(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-indigo-300 font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Special / Other Allowance</label>
                <input
                  type="number"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Salary Advance Recovery</label>
                <input
                  type="number"
                  value={advanceDeduction}
                  onChange={(e) => setAdvanceDeduction(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-rose-300 font-mono"
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Other Custom Deductions</label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-rose-300 font-mono"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Processing on Backend...' : 'Generate Backend Payslip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

