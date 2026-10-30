import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  PlayCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchPayrollRuns, processPayrollRun, fetchAttendance } from '../api';

export default function PayrollView({ 
  currentMonth, 
  employees, 
  company, 
  onPayrollCompleted, 
  onViewPayslip, 
  onNavigate 
}) {
  const [step, setStep] = useState(1);
  const [runs, setRuns] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [adjustments, setAdjustments] = useState({});
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  useEffect(() => {
    loadRuns();
    loadMonthAttendance();
  }, [currentMonth]);

  const loadRuns = async () => {
    try {
      const data = await fetchPayrollRuns();
      setRuns(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMonthAttendance = async () => {
    try {
      const att = await fetchAttendance(currentMonth);
      setAttendance(att);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustmentChange = (empId, field, value) => {
    setAdjustments(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [field]: Number(value)
      }
    }));
  };

  const handleExecuteRun = async () => {
    setLoading(true);
    try {
      const result = await processPayrollRun(currentMonth, adjustments);
      setRunResult(result);
      
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });

      loadRuns();
      if (onPayrollCompleted) onPayrollCompleted();
      setStep(4);
    } catch (err) {
      alert('Error processing payroll: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Monthly Payroll Engine Run</h2>
          <p className="text-xs text-slate-400">
            Execute compliant payroll runs with automatic attendance proration, statutory deductions, and bulk payslip generation
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between max-w-3xl mx-auto text-xs">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 font-semibold ${step >= 1 ? 'text-brand-400' : 'text-slate-500'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              1
            </div>
            <span>Cycle & Attendance</span>
          </button>
          <div className={`h-0.5 w-12 sm:w-20 ${step >= 2 ? 'bg-brand-500' : 'bg-slate-800'}`}></div>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 font-semibold ${step >= 2 ? 'text-brand-400' : 'text-slate-500'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              2
            </div>
            <span>Variable Pay & Bonuses</span>
          </button>
          <div className={`h-0.5 w-12 sm:w-20 ${step >= 3 ? 'bg-brand-500' : 'bg-slate-800'}`}></div>

          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 font-semibold ${step >= 3 ? 'text-brand-400' : 'text-slate-500'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              3
            </div>
            <span>Review & Execute</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Cycle & Attendance Verification */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Step 1: Verify Attendance & Proration</h3>
              <p className="text-xs text-slate-400">Ensure all attendance records and leaves are captured for {attendance?.monthName || currentMonth}</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Synced with Attendance Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Payroll Period</span>
              <span className="font-bold text-slate-100 text-sm">{attendance?.monthName || currentMonth}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Calendar Working Days</span>
              <span className="font-bold text-slate-100 text-sm font-mono">{attendance?.totalWorkingDays || 30} Days</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Eligible Employees</span>
              <span className="font-bold text-brand-400 text-sm font-mono">{employees.length} Active Staff</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Statutory Deductions</span>
              <span className="font-bold text-emerald-400 text-sm">EPF (12%) + ESI + PTax</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              Modify Attendance Sheet
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow"
            >
              Next: Variable Pay & Bonuses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Variable Pay & Incentives Adjustments */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Step 2: Add Performance Bonuses, Incentives & Deductions</h3>
              <p className="text-xs text-slate-400">Optional variable pay for {attendance?.monthName || currentMonth}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Base CTC/mo</th>
                  <th className="py-2.5 px-3 text-emerald-400">Performance Bonus ({currencySymbol})</th>
                  <th className="py-2.5 px-3 text-emerald-400">Incentive ({currencySymbol})</th>
                  <th className="py-2.5 px-3 text-indigo-400">Arrears ({currencySymbol})</th>
                  <th className="py-2.5 px-3 text-rose-400">Advance Recovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map(emp => {
                  const adj = adjustments[emp.id] || {};
                  return (
                    <tr key={emp.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-200 block">{emp.fullName}</span>
                        <span className="text-[10px] text-slate-400">{emp.department}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {currencySymbol}{Math.round(emp.annualCTC / 12).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          placeholder="0"
                          value={adj.bonus || ''}
                          onChange={(e) => handleAdjustmentChange(emp.id, 'bonus', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          placeholder="0"
                          value={adj.incentive || ''}
                          onChange={(e) => handleAdjustmentChange(emp.id, 'incentive', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          placeholder="0"
                          value={adj.arrears || ''}
                          onChange={(e) => handleAdjustmentChange(emp.id, 'arrears', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-indigo-400 font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          placeholder="0"
                          value={adj.advanceDeduction || ''}
                          onChange={(e) => handleAdjustmentChange(emp.id, 'advanceDeduction', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-rose-400 font-mono text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow"
            >
              Next: Review & Execute <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Final Execute */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Step 3: Review & Authorize Payroll Disbursal</h3>
              <p className="text-xs text-slate-400">Final confirmation before generating company payslips</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              Statutory Formulations Locked
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Run Summary Checklist</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Working Days Prorated by LWP</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>EPF (12%) & Professional Tax Included</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>TDS / Income Tax Slabs Deducted</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-950 to-indigo-950 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold">Ready to Process Cycle</p>
              <h4 className="text-xl font-bold text-white mt-0.5">{attendance?.monthName || currentMonth}</h4>
              <p className="text-xs text-slate-300 mt-1">
                Will calculate {employees.length} payslips and update payroll disbursement ledger.
              </p>
            </div>

            <button
              onClick={handleExecuteRun}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              <PlayCircle className="w-5 h-5" />
              {loading ? 'Running Engine...' : 'Authorize & Run Payroll'}
            </button>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              Back to Variable Pay
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success Results */}
      {step === 4 && runResult && (
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Payroll Processed Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Cycle: {runResult.run?.monthName} • {runResult.payslipCount} Payslips Generated & Stored in Backend
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Total Gross Disbursed</span>
              <span className="font-mono font-bold text-brand-400 text-lg">
                {currencySymbol}{runResult.run?.totalGross?.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Total Deductions</span>
              <span className="font-mono font-bold text-rose-400 text-lg">
                {currencySymbol}{runResult.run?.totalDeductions?.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
              <span className="text-emerald-400 block text-[10px] uppercase font-semibold">Net Pay Disbursed</span>
              <span className="font-mono font-black text-emerald-400 text-lg">
                {currencySymbol}{runResult.run?.totalNetPay?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('payslips')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Generated Payslips
            </button>
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Run Another Cycle
            </button>
          </div>
        </div>
      )}

      {/* Historical Payroll Runs Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Historical Payroll Runs</h3>
          </div>
          <span className="text-xs text-slate-400">{runs.length} Recorded Cycles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Run ID</th>
                <th className="py-2.5 px-4">Pay Period</th>
                <th className="py-2.5 px-4">Staff Count</th>
                <th className="py-2.5 px-4">Gross Total</th>
                <th className="py-2.5 px-4">Deductions</th>
                <th className="py-2.5 px-4 text-emerald-400">Net Disbursed</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {runs.map(r => (
                <tr key={r.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-mono text-slate-400">{r.id}</td>
                  <td className="py-3 px-4 font-bold text-white">{r.monthName}</td>
                  <td className="py-3 px-4 text-slate-300">{r.employeeCount} Members</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{currencySymbol}{r.totalGross?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-rose-400">{currencySymbol}{r.totalDeductions?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">{currencySymbol}{r.totalNetPay?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('payslips')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      View Slips
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

