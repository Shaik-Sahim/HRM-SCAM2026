import React from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  CalendarCheck, 
  ArrowUpRight, 
  Sparkles, 
  FileText, 
  Award, 
  PlayCircle,
  Building,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#0284c7', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function DashboardView({ 
  stats, 
  company, 
  onNavigate, 
  onOpenQuickSlip, 
  onViewPayslip, 
  onViewAppraisalLetter,
  recentPayslips 
}) {
  const currencySymbol = company?.currency === 'USD' ? '$' : '₹';

  const chartData = stats?.departmentData || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/20 p-6 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-brand-500/5 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-2 border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Payroll & Compensation Engine 2026
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome to {company?.name || 'Apex Infotech'} HRM
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Complete workforce payroll engine, attendance tracking, proration, statutory deductions, appraisal hikes, and high-fidelity payslip generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenQuickSlip}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4 text-brand-400" />
              Quick Payslip Studio
            </button>
            <button
              onClick={() => onNavigate('payroll')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-4 h-4" />
              Execute Monthly Payroll
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Workforce</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats?.totalEmployees || 10}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 7 departments</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Payroll Cost</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {currencySymbol}{stats?.monthlyPayrollExpense ? (stats.monthlyPayrollExpense / 100000).toFixed(2) + 'L' : '12.55L'}
            </span>
            <span className="text-xs text-indigo-400 font-semibold">
              Gross Monthly
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Annual: {currencySymbol}{(stats?.totalAnnualCTC ? (stats.totalAnnualCTC / 10000000).toFixed(2) : '1.50')} Cr CTC
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg. Attendance Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats?.avgAttendanceRate || 96.8}%</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              +1.2% this month
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on monthly logs & leaves</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg. Compensation (CTC)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {currencySymbol}{stats?.avgCTC ? (stats.avgCTC / 100000).toFixed(1) + 'L' : '15.0L'}
            </span>
            <span className="text-xs text-amber-400 font-semibold">
              Per Annum
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Hikes applied in Q3 cycle</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Payroll Breakdown Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Department Payroll Expense Distribution</h3>
              <p className="text-xs text-slate-400">Monthly gross allocation across departments</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
              Total {stats?.departmentData?.length || 7} Depts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Monthly Expense']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="monthlyExpense" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount by Department Donut */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Workforce Distribution</h3>
            <p className="text-xs text-slate-400">Employee count by organizational unit</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name, props) => [val, props.payload.name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {chartData.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  {d.name}
                </span>
                <span className="font-semibold text-slate-200">{d.count} members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Hikes & Recent Payslips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Compensation Hikes & Appraisals */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Recent Appraisals & Hikes</h3>
            </div>
            <button
              onClick={() => onNavigate('hikes')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              Comp Studio <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(stats?.recentHikes || []).map((hike) => (
              <div
                key={hike.id}
                className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{hike.employeeName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      +{hike.hikePercentage}% Hike
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {hike.department} • {hike.rating}
                  </p>
                  <p className="text-[11px] font-mono text-slate-300 mt-1">
                    {currencySymbol}{hike.previousCTC?.toLocaleString()} → <strong className="text-brand-400">{currencySymbol}{hike.revisedCTC?.toLocaleString()}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onViewAppraisalLetter(hike.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-amber-400" />
                  Letter
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Payslips */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Generated Payslips</h3>
            </div>
            <button
              onClick={() => onNavigate('payslips')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View Hub <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentPayslips.slice(0, 4).map((slip) => (
              <div
                key={slip.id}
                className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{slip.employeeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({slip.employeeId})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {slip.monthName || slip.monthYear} • {slip.department}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                    Net Pay: {currencySymbol}{slip.netPay?.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => onViewPayslip(slip)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-all flex items-center gap-1"
                >
                  View Slip
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

