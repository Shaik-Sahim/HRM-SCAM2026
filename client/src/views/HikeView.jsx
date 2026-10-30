import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  Clock,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchHikes, simulateHike, applyHike } from '../api';

export default function HikeView({ 
  employees, 
  company, 
  onViewAppraisalLetter, 
  onHikeApplied 
}) {
  const [hikes, setHikes] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [hikeType, setHikeType] = useState('percentage'); // 'percentage' | 'fixed'
  const [hikeValue, setHikeValue] = useState(15);
  const [effectiveDate, setEffectiveDate] = useState('2026-10-01');
  const [rating, setRating] = useState('Exceeds Expectations (4.5/5)');
  const [reviewPeriod, setReviewPeriod] = useState('Annual Appraisal 2026');
  const [remarks, setRemarks] = useState('Recognizing outstanding technical leadership and consistent high-velocity delivery.');

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';
  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  useEffect(() => {
    loadHikes();
  }, []);

  useEffect(() => {
    if (selectedEmpId && hikeValue > 0) {
      handleSimulate();
    }
  }, [selectedEmpId, hikeType, hikeValue, effectiveDate, rating, reviewPeriod]);

  const loadHikes = async () => {
    try {
      const data = await fetchHikes();
      setHikes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulate = async () => {
    try {
      const res = await simulateHike({
        employeeId: selectedEmpId,
        type: hikeType,
        value: Number(hikeValue),
        effectiveDate,
        rating,
        reviewPeriod,
        remarks
      });
      setSimulation(res.simulation);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyHike = async () => {
    if (!window.confirm(`Apply ${hikeType === 'percentage' ? hikeValue + '%' : currencySymbol + hikeValue} hike to ${selectedEmp?.fullName}? This will update their permanent salary structure.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await applyHike({
        employeeId: selectedEmpId,
        type: hikeType,
        value: Number(hikeValue),
        effectiveDate,
        rating,
        reviewPeriod,
        remarks
      });

      // Confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessMsg(`Hike applied successfully! Revised CTC: ${currencySymbol}${res.hike.revisedCTC.toLocaleString()}`);
      loadHikes();
      if (onHikeApplied) onHikeApplied(res.employee);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert('Error applying hike: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Compensation & Hike Management Studio</h2>
          <p className="text-xs text-slate-400">
            Simulate compensation revisions, retroactive arrears, component restructuring, and issue official appraisal letters.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => onViewAppraisalLetter(hikes[0]?.id)}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 text-xs"
          >
            View Appraisal Letter
          </button>
        </div>
      )}

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: HR Hike Inputs (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Calculator className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Appraisal Revision Parameters</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Select Employee *</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                    {emp.fullName} ({emp.id}) — {currencySymbol}{emp.annualCTC?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Compensation Card */}
            {selectedEmp && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Current Annual CTC</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {currencySymbol}{selectedEmp.annualCTC?.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Current Monthly Gross</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {currencySymbol}{Math.round(selectedEmp.annualCTC / 12).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Hike Type Switcher */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Hike Calculation Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setHikeType('percentage'); setHikeValue(15); }}
                  className={`py-1.5 rounded text-xs font-semibold transition-all ${
                    hikeType === 'percentage' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Percentage (%) Hike
                </button>
                <button
                  type="button"
                  onClick={() => { setHikeType('fixed'); setHikeValue(200000); }}
                  className={`py-1.5 rounded text-xs font-semibold transition-all ${
                    hikeType === 'fixed' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fixed Amount (+{currencySymbol})
                </button>
              </div>
            </div>

            {/* Hike Input / Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  {hikeType === 'percentage' ? 'Hike Percentage' : `Hike Increment (${currencySymbol})`}
                </label>
                <span className="font-mono font-bold text-brand-400 text-sm">
                  {hikeType === 'percentage' ? `${hikeValue}%` : `+${currencySymbol}${Number(hikeValue).toLocaleString()}`}
                </span>
              </div>

              {hikeType === 'percentage' ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="0.5"
                    value={hikeValue}
                    onChange={(e) => setHikeValue(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5%</span>
                    <span>15% (Std)</span>
                    <span>25% (High)</span>
                    <span>40%+ (Promo)</span>
                  </div>
                </div>
              ) : (
                <input
                  type="number"
                  step="10000"
                  value={hikeValue}
                  onChange={(e) => setHikeValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                />
              )}
            </div>

            {/* Effective Date & Retroactive toggle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Effective Date</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Performance Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                >
                  <option value="Outstanding (5/5)">Outstanding (5/5)</option>
                  <option value="Exceeds Expectations (4.5/5)">Exceeds Expectations (4.5/5)</option>
                  <option value="Strong Performer (4/5)">Strong Performer (4/5)</option>
                  <option value="Meets Expectations (3.5/5)">Meets Expectations (3.5/5)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Appraisal Cycle Name</label>
              <input
                type="text"
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Executive Recommendation / Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="2"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
              ></textarea>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleApplyHike}
              disabled={loading || !simulation}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Committing...' : 'Apply & Commit Salary Hike'}
            </button>
          </div>
        </div>

        {/* Right Output: Real-time Simulation & Component Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {simulation ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Salary Revision Impact Analysis
                  </h3>
                  <p className="text-xs text-slate-400">Side-by-side comparison before vs after revision</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +{simulation.hikePercentage}% Increment
                </span>
              </div>

              {/* CTC Comparison Callout Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Previous CTC</span>
                  <span className="font-mono font-bold text-slate-200 text-base">
                    {currencySymbol}{simulation.currentCTC?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {currencySymbol}{Math.round(simulation.currentCTC / 12).toLocaleString()} /mo
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-500/40">
                  <span className="text-[10px] text-brand-300 block uppercase font-semibold">Revised Annual CTC</span>
                  <span className="font-mono font-extrabold text-brand-400 text-base">
                    {currencySymbol}{simulation.revisedCTC?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-brand-300/80 block mt-0.5 font-mono">
                    +{currencySymbol}{simulation.hikeAmount?.toLocaleString()} annual bump
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Monthly Gross Hike</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-base">
                    +{currencySymbol}{simulation.monthlyHikeDifference?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                    New: {currencySymbol}{simulation.revisedStructure?.monthlyCTC?.toLocaleString()} /mo
                  </span>
                </div>
              </div>

              {/* Retroactive Arrears Alert (if applicable) */}
              {simulation.arrearsPayable > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="font-bold text-indigo-200">Retroactive Arrears Applicable</p>
                      <p className="text-[11px] text-indigo-300/80">
                        Effective date is {simulation.retroactiveMonths} months retroactive.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      +{currencySymbol}{simulation.arrearsPayable?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-indigo-400 block">will disburse in next slip</span>
                  </div>
                </div>
              )}

              {/* Component breakdown table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Component (Monthly)</th>
                      <th className="py-2.5 px-3 text-right">Previous</th>
                      <th className="py-2.5 px-3 text-right text-brand-400">Revised</th>
                      <th className="py-2.5 px-3 text-right text-emerald-400">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-300">Basic Salary (45%)</td>
                      <td className="py-2 px-3 text-right text-slate-400">{currencySymbol}{simulation.currentStructure?.monthly?.basic?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-200 font-bold">{currencySymbol}{simulation.revisedStructure?.monthly?.basic?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">+{currencySymbol}{(simulation.revisedStructure?.monthly?.basic - simulation.currentStructure?.monthly?.basic)?.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-300">House Rent Allowance (HRA)</td>
                      <td className="py-2 px-3 text-right text-slate-400">{currencySymbol}{simulation.currentStructure?.monthly?.hra?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-200 font-bold">{currencySymbol}{simulation.revisedStructure?.monthly?.hra?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">+{currencySymbol}{(simulation.revisedStructure?.monthly?.hra - simulation.currentStructure?.monthly?.hra)?.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-300">Special Allowance</td>
                      <td className="py-2 px-3 text-right text-slate-400">{currencySymbol}{simulation.currentStructure?.monthly?.specialAllowance?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-200 font-bold">{currencySymbol}{simulation.revisedStructure?.monthly?.specialAllowance?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">+{currencySymbol}{(simulation.revisedStructure?.monthly?.specialAllowance - simulation.currentStructure?.monthly?.specialAllowance)?.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-300">EPF Contribution (12%)</td>
                      <td className="py-2 px-3 text-right text-slate-400">{currencySymbol}{Math.round(simulation.currentStructure?.monthly?.basic * 0.12)?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-200 font-bold">{currencySymbol}{Math.round(simulation.revisedStructure?.monthly?.basic * 0.12)?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-400">+{currencySymbol}{(Math.round(simulation.revisedStructure?.monthly?.basic * 0.12) - Math.round(simulation.currentStructure?.monthly?.basic * 0.12))?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t border-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white">Monthly Gross Total</td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono">{currencySymbol}{simulation.currentStructure?.monthlyCTC?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-brand-400 font-mono text-sm">{currencySymbol}{simulation.revisedStructure?.monthlyCTC?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono text-sm">+{currencySymbol}{simulation.monthlyHikeDifference?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <Calculator className="w-8 h-8 text-slate-600 mb-2" />
              <p>Adjust parameters on the left to simulate real-time hike breakdown.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Appraisals & Salary Revision History */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Compensation Revision History Log</h3>
          </div>
          <span className="text-xs text-slate-400">{hikes.length} Records Documented</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Ref ID</th>
                <th className="py-2.5 px-4">Employee</th>
                <th className="py-2.5 px-4">Review Cycle</th>
                <th className="py-2.5 px-4">Previous CTC</th>
                <th className="py-2.5 px-4 text-emerald-400">Revised CTC</th>
                <th className="py-2.5 px-4">Hike %</th>
                <th className="py-2.5 px-4">Effective</th>
                <th className="py-2.5 px-4 text-right">Appraisal Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {hikes.map(h => (
                <tr key={h.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-mono text-slate-400">{h.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-100">{h.employeeName}</p>
                    <p className="text-[11px] text-slate-400">{h.department}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{h.reviewPeriod}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{currencySymbol}{h.previousCTC?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{currencySymbol}{h.revisedCTC?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      +{h.hikePercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{h.effectiveDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewAppraisalLetter(h.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium inline-flex items-center gap-1.5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      View Letter
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

