import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Filter, 
  Eye, 
  Sparkles, 
  Trash2, 
  CreditCard,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { deleteEmployee } from '../api';

export default function EmployeesView({ 
  employees, 
  company, 
  onOpenAddEmp, 
  onOpenQuickSlip, 
  onRefreshEmployees 
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewProfileEmp, setViewProfileEmp] = useState(null);

  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  const departments = ['All', ...new Set(employees.map(e => e.department))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove employee "${name}" (${id})?`)) {
      try {
        await deleteEmployee(id);
        onRefreshEmployees();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Workforce Directory</h2>
          <p className="text-xs text-slate-400">
            Manage employee salary structures, compliance details, and records ({employees.length} active members)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddEmp}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or title..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
          >
            {departments.map(dept => (
              <option key={dept} value={dept} className="bg-slate-900 text-white">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Annual CTC</th>
                <th className="py-3 px-4">Monthly Gross</th>
                <th className="py-3 px-4">PAN / UAN</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map((emp) => {
                const monthly = Math.round(emp.annualCTC / 12);
                return (
                  <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{emp.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{emp.id} • {emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{emp.designation}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60">
                        {emp.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400">
                      {currencySymbol}{emp.annualCTC?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      {currencySymbol}{monthly?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      <div>PAN: <span className="text-slate-300">{emp.panNumber || 'NA'}</span></div>
                      <div>UAN: <span className="text-slate-300">{emp.uanNumber || 'NA'}</span></div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewProfileEmp(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View CTC & Compensation Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenQuickSlip(emp.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 font-semibold text-[11px] flex items-center gap-1 transition-all"
                          title="Generate Single Payslip for HR"
                        >
                          <Sparkles className="w-3 h-3 text-brand-400" />
                          Slip
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.fullName)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Employee"
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

      {/* Profile & Salary Structure Breakdown Drawer / Modal */}
      {viewProfileEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                  {viewProfileEmp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{viewProfileEmp.fullName}</h3>
                  <p className="text-xs text-slate-400">{viewProfileEmp.designation} • {viewProfileEmp.department}</p>
                </div>
              </div>
              <button
                onClick={() => setViewProfileEmp(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Bank Account</span>
                  <span className="font-mono text-slate-200">{viewProfileEmp.bankName} - {viewProfileEmp.bankAccountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">IFSC Code</span>
                  <span className="font-mono text-slate-200">{viewProfileEmp.ifscCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date of Joining</span>
                  <span className="text-slate-200">{viewProfileEmp.dateOfJoining}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Annual CTC</span>
                  <span className="font-mono font-bold text-brand-400">{currencySymbol}{viewProfileEmp.annualCTC?.toLocaleString()}</span>
                </div>
              </div>

              {/* Salary Structure Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 font-bold text-slate-300 flex justify-between">
                  <span>Salary Structure Component</span>
                  <span>Monthly ({currencySymbol})</span>
                </div>
                <div className="divide-y divide-slate-800/60 p-2 space-y-1">
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Basic Salary (45%)</span>
                    <span className="font-mono font-medium">{currencySymbol}{viewProfileEmp.salaryStructure?.monthly?.basic?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>House Rent Allowance (50% Basic)</span>
                    <span className="font-mono font-medium">{currencySymbol}{viewProfileEmp.salaryStructure?.monthly?.hra?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Conveyance Allowance</span>
                    <span className="font-mono font-medium">{currencySymbol}{viewProfileEmp.salaryStructure?.monthly?.conveyance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Medical Allowance</span>
                    <span className="font-mono font-medium">{currencySymbol}{viewProfileEmp.salaryStructure?.monthly?.medical?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Special Allowance (Balancing)</span>
                    <span className="font-mono font-medium">{currencySymbol}{viewProfileEmp.salaryStructure?.monthly?.specialAllowance?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 px-3 py-2 border-t border-slate-800 font-bold text-brand-400 flex justify-between">
                  <span>Total Monthly Gross</span>
                  <span className="font-mono text-sm">{currencySymbol}{Math.round(viewProfileEmp.annualCTC / 12).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  const empId = viewProfileEmp.id;
                  setViewProfileEmp(null);
                  onOpenQuickSlip(empId);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Payslip for {viewProfileEmp.fullName.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

