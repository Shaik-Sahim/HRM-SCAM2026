import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calculator, DollarSign, Building, AlertCircle } from 'lucide-react';
import { createEmployee, calculateSalaryStructure } from '../api';

export default function AddEmployeeModal({ company, onClose, onEmployeeCreated }) {
  const [formData, setFormData] = useState({
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
  const [error, setError] = useState(null);

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

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
    if (!formData.fullName || !formData.annualCTC) {
      setError('Please provide full name and annual CTC');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createEmployee(formData);
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
              <p className="text-xs text-slate-400">Configure profile, banking details and salary structure</p>
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
                placeholder="aditi@apexglobal.tech"
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Monthly Basic (45%)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly.basic?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Monthly HRA (50% Basic)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly.hra?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Special Allowance</span>
                  <span className="font-mono font-bold text-slate-200">
                    {currencySymbol}{structurePreview.monthly.specialAllowance?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Gross Monthly</span>
                  <span className="font-mono font-bold text-brand-400">
                    {currencySymbol}{structurePreview.monthlyCTC?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-emerald-300 block">Est. Net Take Home</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ~{currencySymbol}{Math.max(0, structurePreview.monthlyCTC - Math.round(structurePreview.monthly.basic * 0.12) - 200 - formData.monthlyTDS).toLocaleString()}
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

