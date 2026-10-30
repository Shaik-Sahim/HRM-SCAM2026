import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  DollarSign, 
  FileBadge,
  CreditCard
} from 'lucide-react';
import { fetchCompany, updateCompany } from '../api';

export default function SettingsView({ onCompanyUpdated }) {
  const [company, setCompany] = useState(null);
  const [statutory, setStatutory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchCompany();
      setCompany(data.company);
      setStatutory(data.statutory);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleStatutoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStatutory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateCompany({ company, statutory });
      setSavedSuccess(true);
      if (onCompanyUpdated) onCompanyUpdated(updated.company, updated.statutory);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!company || !statutory) {
    return <div className="text-center p-8 text-slate-400 text-xs">Loading company settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Company & Statutory Configuration</h2>
          <p className="text-xs text-slate-400">
            Configure legal identifiers, official address, authorized signatories, and statutory rules (PF, ESI, PTax)
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Company profile and statutory rules saved successfully! All generated payslips reflect updated branding.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Company Legal Identity */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Company Identity & Registration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Company Trade Name *</label>
              <input
                type="text"
                name="name"
                value={company.name || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Legal Registered Name</label>
              <input
                type="text"
                name="legalName"
                value={company.legalName || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Tagline / Mission</label>
              <input
                type="text"
                name="tagline"
                value={company.tagline || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Corporate Identity (CIN)</label>
              <input
                type="text"
                name="cin"
                value={company.cin || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Company PAN</label>
              <input
                type="text"
                name="pan"
                value={company.pan || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">GSTIN Number</label>
              <input
                type="text"
                name="gstin"
                value={company.gstin || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Registered Corporate Address</label>
              <input
                type="text"
                name="address"
                value={company.address || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Official Payroll Email</label>
              <input
                type="email"
                name="email"
                value={company.email || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Authorized Signatory */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileBadge className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Authorized HR Signatory (Prints on Slips & Appraisal Letters)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Signatory Full Name</label>
              <input
                type="text"
                name="signatoryName"
                value={company.signatoryName || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Signatory Title / Designation</label>
              <input
                type="text"
                name="signatoryTitle"
                value={company.signatoryTitle || ''}
                onChange={handleCompanyChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Statutory & Currency Rules */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Statutory Deductions & Currency Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Currency */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Base Currency</label>
              <select
                name="currency"
                value={statutory.currency || 'INR'}
                onChange={(e) => {
                  const curr = e.target.value;
                  setStatutory(prev => ({
                    ...prev,
                    currency: curr,
                    currencySymbol: curr === 'USD' ? '$' : '₹'
                  }));
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
              </select>
            </div>

            {/* PF Config */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">EPF (12% of Basic)</span>
                <input
                  type="checkbox"
                  name="enablePF"
                  checked={statutory.enablePF !== false}
                  onChange={handleStatutoryChange}
                  className="rounded accent-brand-500 w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Cap at ₹1,800/mo limit:</span>
                <input
                  type="checkbox"
                  name="capPF"
                  checked={statutory.capPF === true}
                  onChange={handleStatutoryChange}
                  className="rounded accent-brand-500 w-3.5 h-3.5 cursor-pointer"
                />
              </div>
            </div>

            {/* ESI Config */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">ESI (0.75% of Gross)</span>
                <input
                  type="checkbox"
                  name="enableESI"
                  checked={statutory.enableESI !== false}
                  onChange={handleStatutoryChange}
                  className="rounded accent-brand-500 w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Applies only if gross wage &le; ₹21,000/month.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

