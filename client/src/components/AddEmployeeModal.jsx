import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Calculator, 
  DollarSign, 
  Building, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  RotateCcw,
  Sparkles,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { createEmployee, calculateSalaryStructure, getUniqueEmployeeId } from '../api';

function generateRandomAlphanumericId(existingList = []) {
  const prefix = 'ML';
  const taken = new Set((existingList || []).map(e => String(e.id || '').toUpperCase()));
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let attempt = 0; attempt < 5000; attempt++) {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidate = `${prefix}${code}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function AddEmployeeModal({ company, employees = [], onClose, onEmployeeCreated }) {
  const [formData, setFormData] = useState({
    id: generateRandomAlphanumericId(employees),
    fullName: '',
    dateOfBirth: '1992-05-15',
    dateOfJoining: new Date().toISOString().split('T')[0],
    groupDOJ: new Date().toISOString().split('T')[0],
    location: 'BANGALORE 04',
    pfNumber: 'MH/BAN/43477',
    uanNumber: '101928374650',
    panNumber: '',
    department: 'Engineering',
    designation: '',
    email: '',
    phone: '',
    employmentType: 'Full-Time',
    bankName: 'HDFC Bank',
    bankAccountNumber: '',
    ifscCode: 'HDFC0001234',
    annualCTC: 1200000,
    monthlyTDS: 0
  });

  const [isCustomSalary, setIsCustomSalary] = useState(false);
  const [customMonthly, setCustomMonthly] = useState({
    basic: 50000,
    hra: 20000,
    conveyance: 2000,
    medical: 1500,
    networkAllowance: 1500,
    otherAllowance: 2000,
    specialAllowance: 23000
  });

  const [structurePreview, setStructurePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  // Fetch verified unique ID from backend on mount
  useEffect(() => {
    getUniqueEmployeeId()
      .then(res => {
        if (res && res.id) {
          setFormData(prev => ({ ...prev, id: res.id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleRegenerateId = async () => {
    setIsRegenerating(true);
    try {
      const res = await getUniqueEmployeeId();
      if (res && res.id) {
        setFormData(prev => ({ ...prev, id: res.id }));
        setIsRegenerating(false);
        return;
      }
    } catch (e) {
      // fallback to client-side generation
    }
    setFormData(prev => ({ ...prev, id: generateRandomAlphanumericId(employees) }));
    setIsRegenerating(false);
  };

  const idNormalized = String(formData.id || '').trim().toUpperCase();
  const isAlphanumeric = /^[A-Z0-9_-]{3,20}$/.test(idNormalized);
  const isDuplicate = (employees || []).some(e => String(e.id || '').toUpperCase() === idNormalized);

  // Auto calculate salary structure from CTC when not in custom mode
  useEffect(() => {
    if (!isCustomSalary && formData.annualCTC > 0) {
      calculateSalaryStructure(formData.annualCTC)
        .then(res => {
          setStructurePreview(res);
          if (res?.monthly) {
            setCustomMonthly({
              basic: res.monthly.basic,
              hra: res.monthly.hra,
              conveyance: res.monthly.conveyance,
              medical: res.monthly.medical,
              networkAllowance: res.monthly.networkAllowance,
              otherAllowance: res.monthly.otherAllowance,
              specialAllowance: res.monthly.specialAllowance
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [formData.annualCTC, isCustomSalary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'annualCTC' || name === 'monthlyTDS' ? Number(value) : value
    }));
  };

  // Custom component input handler
  const handleCustomComponentChange = (field, val) => {
    const num = Math.max(0, Number(val) || 0);
    const updated = { ...customMonthly, [field]: num, isCustom: true };
    setCustomMonthly(updated);

    const sumMonthly = (updated.basic || 0) + (updated.hra || 0) + (updated.conveyance || 0) + 
                       (updated.medical || 0) + (updated.networkAllowance || 0) + 
                       (updated.otherAllowance || 0) + (updated.specialAllowance || 0);
    const computedAnnual = Math.round(sumMonthly * 12);
    setFormData(prev => ({ ...prev, annualCTC: computedAnnual }));

    calculateSalaryStructure(computedAnnual, updated)
      .then(res => setStructurePreview(res))
      .catch(() => {});
  };

  const handleAutoBalance = () => {
    const monthlyGross = Number((formData.annualCTC / 12).toFixed(2));
    const fixed = (customMonthly.basic || 0) + (customMonthly.hra || 0) + (customMonthly.conveyance || 0) + 
                  (customMonthly.medical || 0) + (customMonthly.networkAllowance || 0) + (customMonthly.otherAllowance || 0);
    const balancedSpecial = Math.max(0, Number((monthlyGross - fixed).toFixed(2)));
    handleCustomComponentChange('specialAllowance', balancedSpecial);
  };

  const handleResetToStandard = () => {
    setIsCustomSalary(false);
    calculateSalaryStructure(formData.annualCTC)
      .then(res => {
        setStructurePreview(res);
        if (res?.monthly) {
          setCustomMonthly({
            basic: res.monthly.basic,
            hra: res.monthly.hra,
            conveyance: res.monthly.conveyance,
            medical: res.monthly.medical,
            networkAllowance: res.monthly.networkAllowance,
            otherAllowance: res.monthly.otherAllowance,
            specialAllowance: res.monthly.specialAllowance
          });
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idNormalized) {
      setError('Employee ID is required');
      return;
    }
    if (!isAlphanumeric) {
      setError('Employee ID must be alphanumeric (3 to 20 characters, letters and numbers only)');
      return;
    }
    if (isDuplicate) {
      setError(`Employee ID "${idNormalized}" already belongs to an existing employee. Please generate or enter a unique alphanumeric ID.`);
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Please provide full employee name');
      return;
    }
    if (!formData.dateOfBirth) {
      setError('Date Of Birth (DOB) is required for payslip records');
      return;
    }
    if (!formData.dateOfJoining) {
      setError('Date of Joining (DOJ) is required');
      return;
    }
    if (!formData.designation.trim()) {
      setError('Designation is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createEmployee({
        ...formData,
        id: idNormalized,
        fullName: formData.fullName.trim(),
        salaryStructure: structurePreview,
        customSalary: isCustomSalary ? customMonthly : null
      });
      onEmployeeCreated(created);
    } catch (err) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Onboard New Employee
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Permanent Data Record
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                All details (DOB, DOJ, PF No, Location, UAN, and custom salary) reflect permanently in payslips
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic & Employment Profile (For Payslips) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                1. Identification & Profile Details (Printed on Payslips)
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">
                Mandatory for statutory audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Employee ID (Unique Alphanumeric) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Employee ID *</label>
                  <button
                    type="button"
                    onClick={handleRegenerateId}
                    disabled={isRegenerating}
                    className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline transition-colors"
                    title="Generate new unique alphanumeric ID"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                    Auto-Gen
                  </button>
                </div>
                <input
                  type="text"
                  name="id"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  placeholder="e.g. ML7330"
                  className={`w-full bg-slate-800 border ${
                    !idNormalized || !isAlphanumeric || isDuplicate
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-slate-700 focus:border-brand-500'
                  } rounded-lg px-3 py-2 text-white font-mono uppercase tracking-wider font-bold`}
                />
                <div className="mt-1 text-[10px]">
                  {!idNormalized && <span className="text-rose-400 font-medium">Employee ID required</span>}
                  {idNormalized && !isAlphanumeric && (
                    <span className="text-rose-400 font-medium">Alphanumeric letters & digits only (3-20 chars)</span>
                  )}
                  {idNormalized && isAlphanumeric && isDuplicate && (
                    <span className="text-rose-400 font-medium">Already assigned to another employee</span>
                  )}
                  {idNormalized && isAlphanumeric && !isDuplicate && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Unique Alphanumeric ID
                    </span>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Date Of Birth (DOB) */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Date Of Birth (DOB) *
                  <span className="text-[10px] text-cyan-400 font-normal ml-1">(Prints on Payslip)</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Date of Joining (DOJ) */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Date of Joining (DOJ) *</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  required
                  value={formData.dateOfJoining}
                  onChange={(e) => {
                    handleChange(e);
                    if (!formData.groupDOJ || formData.groupDOJ === formData.dateOfJoining) {
                      setFormData(prev => ({ ...prev, groupDOJ: e.target.value }));
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Group DOJ */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Group DOJ
                  <span className="text-[10px] text-slate-400 font-normal ml-1">(Defaults to DOJ)</span>
                </label>
                <input
                  type="date"
                  name="groupDOJ"
                  value={formData.groupDOJ}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Work Location */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Work Location *
                  <span className="text-[10px] text-cyan-400 font-normal ml-1">(Prints on Payslip)</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. BANGALORE 04"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Designation *</label>
                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Lead Software Architect"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Department */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales & Growth">Sales & Growth</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Work Email */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Work Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aarav.sharma@margeylabs.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Employment Type */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Full-Time">Full-Time (Permanent)</option>
                  <option value="Probation">Probationary</option>
                  <option value="Contract">Fixed-Term Contract</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Compliance & Banking (For Payslips) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                2. Statutory Compliance & Banking Details (Printed on Payslips)
              </span>
              <span className="text-[11px] text-slate-400">
                PF No, UAN, PAN & Account Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* PF No */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  PF No. (Provident Fund) *
                  <span className="text-[10px] text-cyan-400 font-normal ml-1">(Prints on Payslip)</span>
                </label>
                <input
                  type="text"
                  name="pfNumber"
                  required
                  value={formData.pfNumber}
                  onChange={handleChange}
                  placeholder="MH/BAN/43477"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              {/* UAN */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Universal Account Number (UAN) *
                  <span className="text-[10px] text-cyan-400 font-normal ml-1">(Prints on Payslip)</span>
                </label>
                <input
                  type="text"
                  name="uanNumber"
                  required
                  value={formData.uanNumber}
                  onChange={handleChange}
                  placeholder="101928374650"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              {/* PAN Number */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">PAN Number *</label>
                <input
                  type="text"
                  name="panNumber"
                  required
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="BKAPS1289A"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="HDFC Bank"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Bank Account Number */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="501004561234"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Compensation Package & Breakdown */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                  3. Compensation Package & Exact Component Breakdown
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set annual CTC or customize individual monthly salary components for this employee
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomSalary(!isCustomSalary)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isCustomSalary
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isCustomSalary ? 'Custom Breakdown Active' : 'Customize Components'}
                </button>

                {isCustomSalary && (
                  <button
                    type="button"
                    onClick={handleResetToStandard}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1 transition-colors"
                    title="Reset to 50% Basic / 40% HRA standard formula"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* CTC and TDS Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Annual CTC ({currencySymbol}) *
                  {isCustomSalary && <span className="text-[10px] text-amber-400 ml-1.5">(Calculated from monthly sum)</span>}
                </label>
                <input
                  type="number"
                  name="annualCTC"
                  required
                  value={formData.annualCTC}
                  onChange={handleChange}
                  step="1000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Monthly TDS Deduction ({currencySymbol})</label>
                <input
                  type="number"
                  name="monthlyTDS"
                  value={formData.monthlyTDS}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Editable Custom Monthly Components Panel */}
            {isCustomSalary && (
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Individual Monthly Components (₹ / Month):
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="text-[11px] text-brand-400 hover:text-brand-300 underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Balance Special Allowance
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Basic Pay (50%)</label>
                    <input
                      type="number"
                      value={customMonthly.basic}
                      onChange={(e) => handleCustomComponentChange('basic', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">H.R.A (40% Basic)</label>
                    <input
                      type="number"
                      value={customMonthly.hra}
                      onChange={(e) => handleCustomComponentChange('hra', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Conveyance Allowance</label>
                    <input
                      type="number"
                      value={customMonthly.conveyance}
                      onChange={(e) => handleCustomComponentChange('conveyance', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Medical Allowance</label>
                    <input
                      type="number"
                      value={customMonthly.medical}
                      onChange={(e) => handleCustomComponentChange('medical', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Network & Internet Bill</label>
                    <input
                      type="number"
                      value={customMonthly.networkAllowance}
                      onChange={(e) => handleCustomComponentChange('networkAllowance', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Other Allowance</label>
                    <input
                      type="number"
                      value={customMonthly.otherAllowance}
                      onChange={(e) => handleCustomComponentChange('otherAllowance', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block text-[10px] mb-1">Supplementary / Special Allowance</label>
                    <input
                      type="number"
                      value={customMonthly.specialAllowance}
                      onChange={(e) => handleCustomComponentChange('specialAllowance', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Calculated Breakdown Cards */}
            {structurePreview && (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Basic (50%)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly?.basic?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HRA (40% Basic)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly?.hra?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Conv & Med</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{((structurePreview.monthly?.conveyance || 0) + (structurePreview.monthly?.medical || 0))?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Network & Other</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{((structurePreview.monthly?.networkAllowance || 0) + (structurePreview.monthly?.otherAllowance || 0))?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Special Allow</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly?.specialAllowance?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Gross Monthly</span>
                  <span className="font-mono font-bold text-brand-400 text-sm">
                    {currencySymbol}{structurePreview.monthlyCTC?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
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
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Saving Permanently...' : 'Save & Add Employee to Code Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
