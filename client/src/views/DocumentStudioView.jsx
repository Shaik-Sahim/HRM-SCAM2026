import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  UserCheck, 
  Award, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Eye, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  Building
} from 'lucide-react';
import { 
  fetchDocuments, 
  generateOfferLetter, 
  generateExperienceLetter, 
  generateRelievingLetter, 
  deleteDocument,
  calculateSalaryStructure 
} from '../api';
import { calculateTenure, formatOrdinalDate } from '../utils/dateUtils';

export default function DocumentStudioView({ employees, company, onViewDocument }) {
  const [activeSubTab, setActiveSubTab] = useState('offer'); // 'offer' | 'experience' | 'relieving' | 'archive'
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  // ================= Offer Letter Form State (Defaults to Template Standard) ================= //
  const [offerForm, setOfferForm] = useState({
    candidateName: 'Ms. Batta Vyshnavi',
    email: 'vyshnavi.batta@example.com',
    phone: '+91 86608 03099',
    address: 'Papireddypalem,\nT.P. Gudur Mandal, Nellore District,\nAndhra Pradesh',
    designation: 'HR Executive',
    department: 'Human Resources',
    annualCTC: 600000,
    joiningDate: '2025-11-12',
    probationMonths: 6,
    noticePeriodDays: 60,
    workLocation: 'Bangalore',
    reportingTo: '[Name / Designation]'
  });
  const [offerPreviewCTC, setOfferPreviewCTC] = useState(null);

  // ================= Experience Letter Form State ================= //
  const [expForm, setExpForm] = useState({
    employeeId: employees[0]?.id || 'EMP001',
    employeeName: employees[0]?.fullName || 'Aarav Sharma',
    designation: employees[0]?.designation || 'Lead Software Architect',
    department: employees[0]?.department || 'Engineering',
    dateOfJoining: employees[0]?.dateOfJoining || '2022-03-15',
    relievingDate: new Date().toISOString().split('T')[0],
    conductRating: 'Exemplary & High Velocity Performance',
    responsibilitiesSummary: 'Orchestrated cloud architecture migrations, led senior developer pods, and improved system reliability.'
  });

  // ================= Relieving Letter Form State ================= //
  const [relForm, setRelForm] = useState({
    employeeId: employees[0]?.id || 'EMP001',
    employeeName: employees[0]?.fullName || 'Aarav Sharma',
    designation: employees[0]?.designation || 'Lead Software Architect',
    department: employees[0]?.department || 'Engineering',
    resignationDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    relievingDate: new Date().toISOString().split('T')[0],
    clearanceStatus: 'All Company IT Assets, Keys & Access Cards Surrendered',
    settlementDetails: 'Full & Final (FnF) settlement disbursed including all leave encashments and gratuity.'
  });

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    if (offerForm.annualCTC > 0) {
      calculateSalaryStructure(offerForm.annualCTC)
        .then(setOfferPreviewCTC)
        .catch(console.error);
    }
  }, [offerForm.annualCTC]);

  const loadDocs = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.candidateName || !offerForm.annualCTC) {
      alert('Please fill candidate name and proposed CTC');
      return;
    }
    setLoading(true);
    try {
      const doc = await generateOfferLetter(offerForm);
      loadDocs();
      onViewDocument(doc);
    } catch (err) {
      alert('Error generating offer letter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExp = async (e) => {
    e.preventDefault();
    if (!expForm.employeeName) {
      alert('Please fill employee name');
      return;
    }
    setLoading(true);
    try {
      const doc = await generateExperienceLetter(expForm);
      loadDocs();
      onViewDocument(doc);
    } catch (err) {
      alert('Error generating experience letter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRel = async (e) => {
    e.preventDefault();
    if (!relForm.employeeName) {
      alert('Please fill employee name');
      return;
    }
    setLoading(true);
    try {
      const doc = await generateRelievingLetter(relForm);
      loadDocs();
      onViewDocument(doc);
    } catch (err) {
      alert('Error generating relieving letter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this letter record?')) {
      try {
        await deleteDocument(id);
        loadDocs();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.id?.toLowerCase().includes(search.toLowerCase()) ||
      doc.candidate?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.employee?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">HR Document Studio</h2>
          <p className="text-xs text-slate-400">
            Generate official Offer Letters with CTC Annexures, Service Experience Certificates, and Relieving Clearance Orders
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('offer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'offer'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Generate Offer Letter
        </button>

        <button
          onClick={() => setActiveSubTab('experience')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'experience'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Experience Certificate
        </button>

        <button
          onClick={() => setActiveSubTab('relieving')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeSubTab === 'relieving'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Relieving & Clearance Order
        </button>

        <button
          onClick={() => setActiveSubTab('archive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ml-auto ${
            activeSubTab === 'archive'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Archive ({documents.length})
        </button>
      </div>

      {/* ================= TAB 1: OFFER LETTER GENERATOR ================= */}
      {activeSubTab === 'offer' && (
        <form onSubmit={handleCreateOffer} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Candidate & Role Parameters (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Briefcase className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Candidate & Position Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.candidateName}
                    onChange={(e) => setOfferForm({ ...offerForm, candidateName: e.target.value })}
                    placeholder="e.g. Siddharth Rao"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Personal Email *</label>
                  <input
                    type="email"
                    required
                    value={offerForm.email}
                    onChange={(e) => setOfferForm({ ...offerForm, email: e.target.value })}
                    placeholder="siddharth.rao@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={offerForm.phone}
                    onChange={(e) => setOfferForm({ ...offerForm, phone: e.target.value })}
                    placeholder="+91 98000 12345"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={offerForm.address}
                    onChange={(e) => setOfferForm({ ...offerForm, address: e.target.value })}
                    placeholder="City, State"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Offered Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.designation}
                    onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Department</label>
                  <select
                    value={offerForm.department}
                    onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Expected Date of Joining *</label>
                  <input
                    type="date"
                    required
                    value={offerForm.joiningDate}
                    onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Work Location & Mode</label>
                  <input
                    type="text"
                    value={offerForm.workLocation}
                    onChange={(e) => setOfferForm({ ...offerForm, workLocation: e.target.value })}
                    placeholder="e.g. Prestige Tech Cloud Park, Bengaluru (Hybrid)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Probation Period (Months)</label>
                  <input
                    type="number"
                    value={offerForm.probationMonths}
                    onChange={(e) => setOfferForm({ ...offerForm, probationMonths: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Reporting Manager / Title</label>
                  <input
                    type="text"
                    value={offerForm.reportingTo}
                    onChange={(e) => setOfferForm({ ...offerForm, reportingTo: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Compensation & Annexure A Preview (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Compensation & CTC Annexure</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Annexure I</span>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Proposed Annual CTC ({currencySymbol}) *</label>
                    <input
                      type="number"
                      step="50000"
                      required
                      value={offerForm.annualCTC}
                      onChange={(e) => setOfferForm({ ...offerForm, annualCTC: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono font-black text-base focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {offerPreviewCTC && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 font-semibold text-slate-300 flex justify-between">
                        <span>Component</span>
                        <span>Monthly ({currencySymbol})</span>
                      </div>
                      <div className="divide-y divide-slate-800/50 p-2 space-y-1">
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Basic Pay (50%)</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{offerPreviewCTC.monthly.basic?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>HRA (40% Basic)</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{offerPreviewCTC.monthly.hra?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Traveling Allowance</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{(offerPreviewCTC.monthly.conveyance || 2000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Medical Allowance</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{(offerPreviewCTC.monthly.medical || 1500)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Internet Allowance</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{(offerPreviewCTC.monthly.networkAllowance || 1500)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Food Allowance</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{(offerPreviewCTC.monthly.otherAllowance || 2000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-400">
                          <span>Special Allowance</span>
                          <span className="font-mono text-slate-200">{currencySymbol}{offerPreviewCTC.monthly.specialAllowance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="bg-slate-950/80 px-3 py-2 border-t border-slate-800 font-bold text-cyan-400 flex justify-between">
                        <span>Total Monthly Gross</span>
                        <span className="font-mono text-sm">{currencySymbol}{offerPreviewCTC.monthlyCTC?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Generating Offer Letter...' : 'Generate Official Offer Letter'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 2: EXPERIENCE CERTIFICATE GENERATOR ================= */}
      {activeSubTab === 'experience' && (
        <form onSubmit={handleCreateExp} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5 max-w-4xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Experience Certificate Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Pre-fill From Employee</label>
              <select
                onChange={(e) => {
                  const emp = employees.find(x => x.id === e.target.value);
                  if (emp) {
                    setExpForm({
                      ...expForm,
                      employeeId: emp.id,
                      employeeName: emp.fullName,
                      designation: emp.designation,
                      department: emp.department,
                      dateOfJoining: emp.dateOfJoining
                    });
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.id}) - {e.designation}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Employee ID</label>
              <input
                type="text"
                value={expForm.employeeId}
                onChange={(e) => setExpForm({ ...expForm, employeeId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Employee Full Name *</label>
              <input
                type="text"
                required
                value={expForm.employeeName}
                onChange={(e) => setExpForm({ ...expForm, employeeName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Final Designation *</label>
              <input
                type="text"
                required
                value={expForm.designation}
                onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Department</label>
              <input
                type="text"
                value={expForm.department}
                onChange={(e) => setExpForm({ ...expForm, department: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Conduct & Performance Evaluation</label>
              <select
                value={expForm.conductRating}
                onChange={(e) => setExpForm({ ...expForm, conductRating: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Exemplary & High Velocity Performance">Exemplary & High Velocity Performance</option>
                <option value="Outstanding Technical Leadership">Outstanding Technical Leadership</option>
                <option value="Very Good & Diligent Contributor">Very Good & Diligent Contributor</option>
                <option value="Sincere & Result Oriented">Sincere & Result Oriented</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Date of Joining (From) *
              </label>
              <input
                type="date"
                required
                value={expForm.dateOfJoining}
                onChange={(e) => setExpForm({ ...expForm, dateOfJoining: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Relieving Date / Last Working Day (To) *
              </label>
              <input
                type="date"
                required
                value={expForm.relievingDate}
                onChange={(e) => setExpForm({ ...expForm, relievingDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Live Service Duration & Tenure Feedback */}
            {(() => {
              const tenure = calculateTenure(expForm.dateOfJoining, expForm.relievingDate);
              return (
                <div className={`sm:col-span-2 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-inner transition-all ${
                  tenure.isReversed 
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${tenure.isReversed ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                        Generated Certificate Service Tenure
                      </span>
                      <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                        <span className={tenure.isReversed ? 'text-rose-400' : 'text-emerald-400'}>
                          {tenure.formatted}
                        </span>
                        {tenure.years > 0 && !tenure.isReversed && (
                          <span className="text-[11px] text-slate-300 font-sans font-normal">
                            ({tenure.years} {tenure.years === 1 ? 'Year' : 'Years'} Total Experience)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono text-[11px] text-slate-300 bg-slate-900/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-none border-slate-800">
                    <span className="text-slate-400">From: </span>
                    <strong className="text-white">{formatOrdinalDate(expForm.dateOfJoining)}</strong>
                    <span className="mx-1.5 text-slate-500">➔</span>
                    <span className="text-slate-400">To: </span>
                    <strong className="text-white">{formatOrdinalDate(expForm.relievingDate)}</strong>
                  </div>
                </div>
              );
            })()}

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Key Responsibilities & Project Contributions Summary</label>
              <textarea
                rows="3"
                value={expForm.responsibilitiesSummary}
                onChange={(e) => setExpForm({ ...expForm, responsibilitiesSummary: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Experience Certificate'}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: RELIEVING ORDER GENERATOR ================= */}
      {activeSubTab === 'relieving' && (
        <form onSubmit={handleCreateRel} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5 max-w-4xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Relieving & Formal Clearance Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Pre-fill From Employee</label>
              <select
                onChange={(e) => {
                  const emp = employees.find(x => x.id === e.target.value);
                  if (emp) {
                    setRelForm({
                      ...relForm,
                      employeeId: emp.id,
                      employeeName: emp.fullName,
                      designation: emp.designation,
                      department: emp.department
                    });
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.id}) - {e.designation}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Employee ID</label>
              <input
                type="text"
                value={relForm.employeeId}
                onChange={(e) => setRelForm({ ...relForm, employeeId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Employee Full Name *</label>
              <input
                type="text"
                required
                value={relForm.employeeName}
                onChange={(e) => setRelForm({ ...relForm, employeeName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Relieving Role / Designation *</label>
              <input
                type="text"
                required
                value={relForm.designation}
                onChange={(e) => setRelForm({ ...relForm, designation: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Resignation Submission Date (From) *
              </label>
              <input
                type="date"
                required
                value={relForm.resignationDate}
                onChange={(e) => setRelForm({ ...relForm, resignationDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Official Last Working Day (Relieving Date To) *
              </label>
              <input
                type="date"
                required
                value={relForm.relievingDate}
                onChange={(e) => setRelForm({ ...relForm, relievingDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Live Notice Period Feedback */}
            {(() => {
              const notice = calculateTenure(relForm.resignationDate, relForm.relievingDate);
              return (
                <div className={`sm:col-span-2 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-inner ${
                  notice.isReversed 
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Notice Period & Transition Duration
                      </span>
                      <strong className="text-white font-mono">{notice.formatted}</strong>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono text-[11px] text-slate-400">
                    <span>Resignation: {formatOrdinalDate(relForm.resignationDate)}</span>
                    <span className="mx-1 text-slate-600">➔</span>
                    <span>Relieved: {formatOrdinalDate(relForm.relievingDate)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Asset Handover & Department Clearance Status</label>
              <input
                type="text"
                value={relForm.clearanceStatus}
                onChange={(e) => setRelForm({ ...relForm, clearanceStatus: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Full & Final (FnF) Settlement Confirmation</label>
              <textarea
                rows="2"
                value={relForm.settlementDetails}
                onChange={(e) => setRelForm({ ...relForm, settlementDetails: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Official Relieving Order'}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: ISSUED LETTERS ARCHIVE ================= */}
      {activeSubTab === 'archive' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, employee or ref..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Document Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white outline-none cursor-pointer"
              >
                <option value="all">All Documents</option>
                <option value="offer">Offer Letters</option>
                <option value="experience">Experience Certificates</option>
                <option value="relieving">Relieving Orders</option>
              </select>
            </div>
          </div>

          {/* Documents Table */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Recipient Name</th>
                  <th className="py-3 px-4">Designation / Role</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredDocs.map((doc) => {
                  const recipient = doc.candidate?.fullName || doc.employee?.fullName || 'N/A';
                  const role = doc.employment?.designation || doc.employee?.designation || 'Specialist';
                  const badgeClass = {
                    offer: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
                    experience: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    relieving: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  }[doc.type] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {doc.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClass}`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {recipient}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {role}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {doc.issueDate}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDocument(doc)}
                            className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Letter
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}
    </div>
  );
}

