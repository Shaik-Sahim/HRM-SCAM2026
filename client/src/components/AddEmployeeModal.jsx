import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calculator, DollarSign, Building, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
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
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    annualCTC: 1200000,
    panNumber: '',
    uanNumber: '',
    bankName: 'HDFC Bank',
    bankAccountNumber: '',
    ifscCode: 'HDFC0001234',
    monthlyTDS: 0
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

  useEffect(() => {
    if (formData.annualCTC > 0) {
      calculateSalaryStructure(formData.annualCTC)
        .then(res => setStructurePreview(res))
        .catch(err => console.error(err));
    }
  }, [formData.annualCTC]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'annualCTC' || name === 'monthlyTDS' ? Number(value) : value
    }));
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
    if (!formData.fullName || !formData.annualCTC) {
      setError('Please provide full name and annual CTC');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createEmployee({
        ...formData,
        id: idNormalized,
        fullName: formData.fullName.trim()
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
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Onboard New Employee</h3>
              <p className="text-xs text-slate-400">Configure profile, unique alphanumeric ID, and salary structure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Employee ID (Unique Alphanumeric) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1">
                  Employee ID *
                </label>
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
                  <span className="text-rose-400 font-medium">Alphanumeric letters & digits (3-20 chars)</span>
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

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Aditi Sharma"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Work Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="aditi@margeylabs.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

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

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Designation *</label>
              <input
                type="text"
                name="designation"
                required
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

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

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Section: Statutory & Banking */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-800">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="BKAPS1234F"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">UAN (PF Number)</label>
              <input
                type="text"
                name="uanNumber"
                value={formData.uanNumber}
                onChange={handleChange}
                placeholder="101900000000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
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
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Account Number</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                placeholder="501004567890"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Section: Compensation & CTC */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                Compensation Structure & CTC Breakdown
              </span>
              <span className="text-xs text-brand-400 font-semibold">
                Auto-calculated components
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Annual CTC ({currencySymbol}) *</label>
                <input
                  type="number"
                  name="annualCTC"
                  required
                  value={formData.annualCTC}
                  onChange={handleChange}
                  step="50000"
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

            {/* Calculated Breakdown Cards */}
            {structurePreview && (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Basic (50%)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly.basic?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HRA (40% Basic)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly.hra?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Conv & Med</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{(structurePreview.monthly.conveyance + structurePreview.monthly.medical)?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Network & Other</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{((structurePreview.monthly.networkAllowance || 1000) + (structurePreview.monthly.otherAllowance || 1000))?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Special Allow</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly.specialAllowance?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Gross Monthly</span>
                  <span className="font-mono font-bold text-brand-400">
                    {currencySymbol}{structurePreview.monthlyCTC?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Employee Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

