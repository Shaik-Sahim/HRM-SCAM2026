import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Save, 
  Sparkles, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { fetchAttendance, saveAttendance } from '../api';

export default function AttendanceView({ currentMonth, employees, onAttendanceUpdated }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [workingDays, setWorkingDays] = useState(30);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [currentMonth]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendance(currentMonth);
      setAttendanceData(data);
      setWorkingDays(data.totalWorkingDays || 30);
      setRecords(data.records || {});
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordChange = (empId, field, value) => {
    setRecords(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {
          presentDays: workingDays - 2,
          paidLeaves: 2,
          halfDays: 0,
          unpaidLeaves: 0,
          overtimeHours: 0
        }),
        [field]: Number(value)
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    employees.forEach(emp => {
      updated[emp.id] = {
        presentDays: workingDays - 2,
        paidLeaves: 2,
        halfDays: 0,
        unpaidLeaves: 0,
        overtimeHours: records[emp.id]?.overtimeHours || 0,
        holidays: 4
      };
    });
    setRecords(updated);
  };

  const handleSave = async () => {
    try {
      await saveAttendance(currentMonth, {
        totalWorkingDays: Number(workingDays),
        records
      });
      setSavedSuccess(true);
      if (onAttendanceUpdated) onAttendanceUpdated();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error saving attendance: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Attendance & Leave Tracker</h2>
          <p className="text-xs text-slate-400">
            Monthly attendance records directly impact Loss of Pay (LWP) and Overtime calculations for {attendanceData?.monthName || currentMonth}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Auto-Fill Standard Present
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            Save & Sync Payroll
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Attendance logs saved successfully! Payroll engine will calculate prorated deductions automatically.</span>
        </div>
      )}

      {/* Month Config Strip */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            <span className="text-slate-400 font-medium">Cycle:</span>
            <strong className="text-white">{attendanceData?.monthName || currentMonth}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Calendar Working Days:</span>
            <input
              type="number"
              value={workingDays}
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-center font-bold"
              min="20"
              max="31"
            />
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Total Employees Tracked: <strong className="text-brand-400">{employees.length}</strong>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3 text-center">Present Days</th>
                <th className="py-3 px-3 text-center">Paid Leaves (PL)</th>
                <th className="py-3 px-3 text-center">Half Days (0.5)</th>
                <th className="py-3 px-3 text-center text-rose-400">Unpaid Leaves (LWP)</th>
                <th className="py-3 px-3 text-center text-amber-400">Overtime (Hrs)</th>
                <th className="py-3 px-4 text-center">Payable Days</th>
                <th className="py-3 px-4 text-right">Proration Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map(emp => {
                const rec = records[emp.id] || {
                  presentDays: workingDays - 2,
                  paidLeaves: 2,
                  halfDays: 0,
                  unpaidLeaves: 0,
                  overtimeHours: 0
                };

                const payable = Math.min(
                  workingDays,
                  (rec.presentDays || 0) + ((rec.halfDays || 0) * 0.5) + (rec.paidLeaves || 0)
                );
                const isDeducted = payable < workingDays;

                return (
                  <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-100">{emp.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{emp.id} • {emp.department}</p>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={rec.presentDays ?? (workingDays - 2)}
                        onChange={(e) => handleRecordChange(emp.id, 'presentDays', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-center"
                        min="0"
                        max={workingDays}
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={rec.paidLeaves ?? 2}
                        onChange={(e) => handleRecordChange(emp.id, 'paidLeaves', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-mono text-center"
                        min="0"
                        max="10"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={rec.halfDays ?? 0}
                        onChange={(e) => handleRecordChange(emp.id, 'halfDays', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300 font-mono text-center"
                        min="0"
                        max="10"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={rec.unpaidLeaves ?? 0}
                        onChange={(e) => handleRecordChange(emp.id, 'unpaidLeaves', e.target.value)}
                        className="w-16 bg-slate-950 border border-rose-900/60 rounded px-2 py-1 text-rose-400 font-mono text-center font-bold"
                        min="0"
                        max={workingDays}
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={rec.overtimeHours ?? 0}
                        onChange={(e) => handleRecordChange(emp.id, 'overtimeHours', e.target.value)}
                        className="w-16 bg-slate-950 border border-amber-900/60 rounded px-2 py-1 text-amber-400 font-mono text-center font-bold"
                        min="0"
                        max="100"
                      />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        {payable} / {workingDays}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isDeducted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-semibold">
                          LWP Prorated (-{(workingDays - payable).toFixed(1)}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                          Full Pay (100%)
                        </span>
                      )}
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

