import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Mail, 
  CheckCircle, 
  FileBadge,
  Stamp
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  MargeyLogo, 
  MargeyFooter, 
  MargeyStamp,
  MargeySignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';

function getFinancialYearMonths(monthYearStr) {
  if (!monthYearStr) return 3;
  const match = String(monthYearStr).match(/(\d{4})-(\d{2})/);
  if (match) {
    const m = parseInt(match[2], 10);
    return m >= 4 ? (m - 3) : (m + 9);
  }
  const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
  const lower = String(monthYearStr).toLowerCase();
  for (let i = 0; i < months.length; i++) {
    if (lower.includes(months[i])) return i + 1;
  }
  return 3;
}

function formatDateToDDMMYYYY(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(s)) {
    return s.replace(/-/g, '/');
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return s;
}

export default function PayslipModal({ payslip, company, onClose }) {
  const [template, setTemplate] = useState('executive'); // 'executive' (Reference Audit) | 'modern' | 'classic'
  const [includeStamp, setIncludeStamp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const payslipRef = useRef(null);

  if (!payslip) return null;

  const currencySymbol = payslip.currency === 'USD' ? '$' : '₹';
  const monthsPassed = getFinancialYearMonths(payslip.monthYear || payslip.monthName);

  // Employee Metadata
  const empCode = payslip.employeeId || payslip.employee?.id || 'ML7330';
  const empName = payslip.employeeName || payslip.employee?.fullName || 'VEMULACHEDU SHALINI';
  const dob = formatDateToDDMMYYYY(payslip.dateOfBirth || payslip.employee?.dateOfBirth || payslip.employee?.dob) || '27/11/1990';
  const doj = formatDateToDDMMYYYY(payslip.dateOfJoining || payslip.employee?.dateOfJoining || payslip.employee?.doj) || '04/09/2019';
  const designation = payslip.designation || payslip.employee?.designation || 'SENIOR SYSTEMS ANALYST';
  const pfNo = payslip.pfNumber || payslip.employee?.pfNumber || payslip.employee?.pfNo || 'MH/BAN/43477';
  const location = payslip.location || payslip.employee?.location || payslip.employee?.workLocation || 'BANGALORE 04';
  const uan = payslip.uanNumber || payslip.employee?.uanNumber || '101406788347';
  const groupDoj = formatDateToDDMMYYYY(payslip.groupDOJ || payslip.groupDoj || payslip.employee?.groupDOJ || payslip.employee?.groupDoj || payslip.dateOfJoining || payslip.employee?.dateOfJoining) || doj;

  const totalDays = Number(payslip.attendance?.totalWorkingDays) || 30;
  const lwpDays = Number(payslip.attendance?.unpaidLeaves || payslip.deductions?.lossOfPayDays) || 0;
  const daysString = `${totalDays.toFixed(2)} / ${lwpDays.toFixed(2)} / 0.00`;

  // Financial components
  const earn = payslip.earnings || {};
  const ded = payslip.deductions || {};

  const basic = earn.basic || 0;
  const hra = earn.hra || 0;
  const conveyance = earn.conveyance || 0;
  const medical = earn.medical || 0;
  const special = earn.specialAllowance || 0;
  const network = earn.networkAllowance !== undefined ? earn.networkAllowance : 1000;
  const otherAllow = earn.otherAllowance !== undefined ? earn.otherAllowance : 1000;
  const overtime = earn.overtime || 0;
  const bonus = earn.bonus || 0;
  const arrears = earn.arrears || 0;
  const totalGross = earn.totalGross || (basic + hra + conveyance + medical + special + network + otherAllow + overtime + bonus + arrears);

  // Deductions
  const pt = ded.professionalTax !== undefined ? ded.professionalTax : 200;
  const pf = ded.providentFund || 1800;
  const tds = ded.tds || 0;
  const esi = ded.esi || 0;
  const lwpAmount = ded.lossOfPayAmount || 0;
  const advance = ded.advance || 0;
  const otherDed = ded.otherDeductions || 0;
  const totalDeductions = ded.totalDeductions || (pt + pf + tds + esi + lwpAmount + advance + otherDed);

  const netPay = payslip.netPay || Math.max(0, totalGross - totalDeductions);
  const netPayWords = payslip.netPayInWords || 'Rupees Fifty Eight Thousand Nine Hundred And Thirty Five Only';

  // Statutory Tables
  const ptaxYtd = pt * monthsPassed;
  const ptaxProjected = 2400;
  const ptaxBalance = Math.max(0, ptaxProjected - ptaxYtd);

  const tdsYtd = tds * monthsPassed;
  const tdsProjected = tds * 12;
  const tdsBalance = Math.max(0, tdsProjected - tdsYtd);

  const pfYtd = pf * monthsPassed;
  const eps = Math.min(pf, 1250);
  const epsYtd = eps * monthsPassed;
  const empPfContrib = Math.max(0, pf - eps);
  const empPfYtd = empPfContrib * monthsPassed;

  const handlePrint = () => {
    if (!payslipRef.current) return;
    const title = `Payslip - ${empName} (${payslip.monthName || payslip.monthYear})`;
    printDocument(payslipRef.current, title);
  };

  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;
    setIsExporting(true);

    try {
      const pageElements = payslipRef.current.querySelectorAll('.printable-page');
      const targetElement = pageElements.length > 0 ? pageElements[0] : payslipRef.current;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const canvas = await html2canvas(targetElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`Margey_Payslip_${empCode}_${(payslip.monthName || payslip.monthYear || 'cycle').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3500);
  };

  const displayPeriod = payslip.monthName || payslip.monthYear || 'Jun 2020';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden my-4 flex flex-col max-h-[96vh]">
        {/* Modal Controls Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 no-print shrink-0 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileBadge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Margey Labs Official Salary Payslip
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {payslip.status || 'Verified'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {empName} ({empCode}) • {displayPeriod}
              </p>
            </div>
          </div>

          {/* Template Selector, Stamp Toggle & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTemplate('executive')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  template === 'executive' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Margey Labs Reference Format (Sonata Audit Structure)"
              >
                Reference Audit
              </button>
              <button
                onClick={() => setTemplate('modern')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  template === 'modern' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive Modern
              </button>
              <button
                onClick={() => setTemplate('classic')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  template === 'classic' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Classic
              </button>
            </div>

            {/* Stamp & Signature Toggle */}
            <button
              onClick={() => setIncludeStamp(!includeStamp)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                includeStamp 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle Official Stamp & Digital Signature"
            >
              <Stamp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seal & Sign</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={emailSent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {emailSent ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generating...' : 'PDF'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container (Pure Flat Clean White Paper - No Shadows, No Rounded Corners) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950">
          <div ref={payslipRef} className="printable-area w-full flex justify-center font-sans">
            
            {/* ============================================================== */}
            {/* TEMPLATE 1: REFERENCE AUDIT (EXACT SONATA / MARGEY LABS LAYOUT) */}
            {/* ============================================================== */}
            {template === 'executive' && (
              <div 
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div>
                  {/* Company Header with Original Logo */}
                  <div className="flex justify-between items-start pb-2 border-b border-slate-300">
                    <div className="flex items-center gap-3">
                      <MargeyLogo height={42} />
                      <div className="text-[10px] text-slate-600 leading-tight">
                        <p className="font-bold text-slate-900 text-[11px]">MARGEY LABS PVT. LTD.</p>
                        <p>4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037</p>
                        <p>CIN: U58200KA2024PTC191015 | Phone: +91 86608 03099 | Email: info@margeylabs.com</p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9.5px]">Confidential</span>
                      <span>Slip ID: {payslip.id || empCode}</span>
                    </div>
                  </div>

                  {/* 4-Column Employee Details Bordered Table */}
                  <div className="mt-2.5 border border-slate-400 text-[10px] font-sans">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-semibold text-slate-600 w-1/4 bg-slate-50 border-r border-slate-300">Employee Code</td>
                          <td className="p-1.5 font-bold text-slate-900 w-1/4 border-r border-slate-300">{empCode}</td>
                          <td className="p-1.5 font-semibold text-slate-600 w-1/4 bg-slate-50 border-r border-slate-300">Employee Name</td>
                          <td className="p-1.5 font-bold text-slate-900 w-1/4">{empName}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">Date Of Birth</td>
                          <td className="p-1.5 text-slate-800 border-r border-slate-300">{dob}</td>
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">Date of Joining</td>
                          <td className="p-1.5 text-slate-800">{doj}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">Designation</td>
                          <td className="p-1.5 text-slate-800 border-r border-slate-300">{designation}</td>
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">PF No.</td>
                          <td className="p-1.5 font-mono text-slate-800">{pfNo}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">Location</td>
                          <td className="p-1.5 text-slate-800 border-r border-slate-300">{location}</td>
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">No of Days / LOP/LOPR</td>
                          <td className="p-1.5 font-mono text-slate-800">{daysString}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">Universal Account Number</td>
                          <td className="p-1.5 font-mono text-slate-800 border-r border-slate-300">{uan}</td>
                          <td className="p-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-300">Group DOJ</td>
                          <td className="p-1.5 text-slate-800">{groupDoj}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Gray Title Bar */}
                  <div className="bg-slate-200 border-x border-b border-slate-400 py-1 px-3 text-center">
                    <span className="font-bold text-[11px] text-slate-900 tracking-wide font-sans">
                      Payslip for the month of {displayPeriod}
                    </span>
                  </div>

                  {/* Main Earnings & Deductions Split Grid */}
                  <div className="border-x border-b border-slate-400 text-[10px] font-sans">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 text-[9.5px]">
                          {/* Earnings Header (5 columns) */}
                          <th className="p-1.5 text-left border-r border-slate-300 font-bold w-[22%]">Earnings</th>
                          <th className="p-1.5 text-right border-r border-slate-300 font-bold w-[13%]">Reference Amount</th>
                          <th className="p-1.5 text-right border-r border-slate-300 font-bold w-[13%]">Amount</th>
                          <th className="p-1.5 text-right border-r border-slate-300 font-bold w-[10%]">Arrear Amount</th>
                          <th className="p-1.5 text-right border-r-2 border-slate-400 font-bold w-[12%]">Year to Date</th>
                          {/* Deductions Header (3 columns) */}
                          <th className="p-1.5 text-left border-r border-slate-300 font-bold w-[16%]">Deductions</th>
                          <th className="p-1.5 text-right border-r border-slate-300 font-bold w-[7%]">Amount</th>
                          <th className="p-1.5 text-right font-bold w-[7%]">Year to Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {/* Row 1: Basic & Profession Tax */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Basic</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{basic.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{basic.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(basic * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Profession Tax</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{pt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono">{ptaxYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>

                        {/* Row 2: H.R.A & Provident Fund (PF) */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">H.R.A</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{hra.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{hra.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(hra * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Provident Fund (PF)</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{pf.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono">{pfYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>

                        {/* Row 3: Conveyance & Income Tax */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Conveyance</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{conveyance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{conveyance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(conveyance * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Income Tax</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{tds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono">{tdsYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>

                        {/* Row 4: Medical & Other Deductions */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Medical</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{medical.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{medical.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(medical * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">{esi > 0 ? 'ESI Contribution' : lwpAmount > 0 ? 'Loss of Pay' : 'Staff Welfare / Club'}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{(esi || lwpAmount || 20).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono">{((esi || lwpAmount || 20) * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>

                        {/* Row 5: Supplementary allow (Special Allowance) */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Supplementary allow</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{special.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{special.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(special * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300"></td>
                          <td className="p-1 text-right font-mono border-r border-slate-300"></td>
                          <td className="p-1 text-right font-mono"></td>
                        </tr>

                        {/* Row 6: Network Allowance / Internet Bill */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Network & Internet Bill</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{network.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{network.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(network * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300"></td>
                          <td className="p-1 text-right font-mono border-r border-slate-300"></td>
                          <td className="p-1 text-right font-mono"></td>
                        </tr>

                        {/* Row 7: Other Allowance */}
                        <tr>
                          <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Other Allowance</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{otherAllow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">{otherAllow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1 text-right font-mono border-r-2 border-slate-400">{(otherAllow * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1 text-slate-800 border-r border-slate-300"></td>
                          <td className="p-1 text-right font-mono border-r border-slate-300"></td>
                          <td className="p-1 text-right font-mono"></td>
                        </tr>

                        {/* Optional Row 8: Bonus or Overtime */}
                        {(bonus > 0 || arrears > 0 || overtime > 0) && (
                          <tr>
                            <td className="p-1 text-slate-800 border-r border-slate-300 font-medium">Advance Bonus / Arrears</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{(bonus + arrears + overtime).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{(bonus + arrears + overtime).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                            <td className="p-1 text-right font-mono border-r-2 border-slate-400">{((bonus + arrears + overtime) * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-slate-800 border-r border-slate-300"></td>
                            <td className="p-1 text-right font-mono border-r border-slate-300"></td>
                            <td className="p-1 text-right font-mono"></td>
                          </tr>
                        )}

                        {/* Totals Row */}
                        <tr className="bg-slate-100 font-bold border-t border-slate-400 text-slate-900">
                          <td className="p-1.5 border-r border-slate-300">Gross Earnings</td>
                          <td className="p-1.5 text-right font-mono border-r border-slate-300">{totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-mono border-r border-slate-300">{totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-mono border-r border-slate-300">0.00</td>
                          <td className="p-1.5 text-right font-mono border-r-2 border-slate-400">{(totalGross * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 border-r border-slate-300">Gross Deductions</td>
                          <td className="p-1.5 text-right font-mono border-r border-slate-300">{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-mono">{(totalDeductions * monthsPassed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Net Pay Banner Box */}
                  <div className="mt-2.5 border border-slate-400 p-2 bg-slate-50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-[11px] block">Net Pay</span>
                      <p className="text-[10px] text-slate-700 italic mt-0.5">
                        <strong className="not-italic text-slate-900">Net Pay In Words: </strong>
                        {netPayWords}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
                        {currencySymbol} {netPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Lower Two Tables (Other Statutory Deductions & PF Details) */}
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[9.5px] font-sans">
                    {/* Left: Other Statutory Deductions */}
                    <div className="border border-slate-400">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-400 text-slate-800">
                            <th className="p-1 text-left font-bold border-r border-slate-300">Other Statutory Deductions</th>
                            <th className="p-1 text-right font-bold border-r border-slate-300">Projected</th>
                            <th className="p-1 text-right font-bold border-r border-slate-300">Year to Date</th>
                            <th className="p-1 text-right font-bold">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-1 text-slate-800 font-medium border-r border-slate-300">Income Tax</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{tdsProjected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{tdsYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono">{tdsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-slate-800 font-medium border-r border-slate-300">Profession Tax</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{ptaxProjected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{ptaxYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono">{ptaxBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Right: Provident Fund(PF) Details */}
                    <div className="border border-slate-400">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-400 text-slate-800">
                            <th className="p-1 text-left font-bold border-r border-slate-300">Provident Fund(PF) Details</th>
                            <th className="p-1 text-right font-bold border-r border-slate-300">Amount</th>
                            <th className="p-1 text-right font-bold">Year to Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-1 text-slate-800 font-medium border-r border-slate-300">Employee Contribution to PF</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{pf.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono">{pfYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-slate-800 font-medium border-r border-slate-300">Employee V P F Contribution</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">0.00</td>
                            <td className="p-1 text-right font-mono">0.00</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-slate-800 font-medium border-r border-slate-300">Employer Contribution to EPS</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{eps.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono">{epsYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-slate-800 font-medium border-r border-slate-300">Employer Contribution to PF</td>
                            <td className="p-1 text-right font-mono border-r border-slate-300">{empPfContrib.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-1 text-right font-mono">{empPfYtd.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Stamp & Signature (if enabled) */}
                  {includeStamp && (
                    <div className="mt-3 flex justify-end">
                      <MargeySignatoryBlock align="right" stampSize={82} />
                    </div>
                  )}

                  {/* Disclaimer Note */}
                  <div className="mt-3 text-[10px] text-slate-600 font-sans border-t border-slate-200 pt-1.5">
                    <p>Note : This is a computer generated payslip and does not require authentication.</p>
                  </div>
                </div>

                <div className="mt-2">
                  <MargeyFooter />
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TEMPLATE 2: EXECUTIVE MODERN */}
            {/* ============================================================== */}
            {template === 'modern' && (
              <div 
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <MargeyLogo height={40} />
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Margey Labs Pvt Ltd</h2>
                        <p className="text-xs text-slate-500 font-medium">Salary Statement • {displayPeriod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700">REF: {payslip.id || empCode}</span>
                      <p className="text-[11px] text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3 rounded bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase">Employee</p>
                      <p className="font-bold text-slate-900 text-xs">{empName}</p>
                      <p className="text-slate-500 font-mono text-[10px]">{empCode}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase">Role & Department</p>
                      <p className="font-semibold text-slate-800 text-xs">{designation}</p>
                      <p className="text-slate-500 text-[10.5px]">{payslip.department || 'Engineering'}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase">Banking Account</p>
                      <p className="font-semibold text-slate-800 text-xs">{payslip.bankName || 'HDFC Bank'}</p>
                      <p className="text-slate-500 font-mono text-[10px]">A/C: ••••{String(payslip.bankAccountNumber || '9876').slice(-4)}</p>
                    </div>
                  </div>

                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-300 text-left text-slate-500 uppercase text-[9.5px]">
                        <th className="py-1.5 font-bold">Earnings Description</th>
                        <th className="py-1.5 text-right font-bold">Amount ({currencySymbol})</th>
                        <th className="py-1.5 pl-6 font-bold">Deductions Description</th>
                        <th className="py-1.5 text-right font-bold">Amount ({currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1.5 text-slate-700">Basic Salary (50%)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{basic.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Provident Fund (PF)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{pf.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">House Rent Allowance (HRA)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{hra.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">ESI (0.75%)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{esi.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Conveyance & Medical</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{(conveyance + medical).toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Professional Tax (PT)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{pt.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Network & Internet Bill</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{network.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Tax Deducted at Source (TDS)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{tds.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Other Allowance</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{otherAllow.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Other Deductions</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{(advance + otherDed).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Special Allowance</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{special.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700"></td>
                        <td className="py-1.5 text-right font-mono"></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold">
                        <td className="py-2 text-slate-900">Total Gross Earnings</td>
                        <td className="py-2 text-right font-mono text-cyan-700 text-xs">{currencySymbol}{totalGross.toLocaleString()}</td>
                        <td className="py-2 pl-6 text-slate-900">Total Deductions</td>
                        <td className="py-2 text-right font-mono text-rose-700 text-xs">{currencySymbol}{totalDeductions.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="p-3 rounded bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Take-Home Net Salary</span>
                      <p className="text-xl font-bold font-mono">{currencySymbol}{netPay.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-300 italic mt-0.5">{netPayWords}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded font-bold">
                        PAID
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
                  <div className="max-w-xs">
                    <p className="text-[9.5px] text-slate-500 leading-tight font-sans">
                      * Computer-generated statement under the Information Technology Act.
                    </p>
                  </div>
                  {includeStamp && <MargeySignatoryBlock align="right" stampSize={80} />}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TEMPLATE 3: CLASSIC */}
            {/* ============================================================== */}
            {template === 'classic' && (
              <div 
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div className="space-y-3">
                  <div className="text-center border-b border-slate-300 pb-2">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">MARGEY LABS PVT. LTD.</h2>
                    <p className="text-[10.5px] text-slate-600">4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037 • CIN: U58200KA2024PTC191015</p>
                    <div className="mt-1.5 inline-block border-y border-slate-800 px-3 py-0.5 font-bold uppercase text-[10.5px] tracking-widest">
                      SALARY CERTIFICATE & PAYSLIP FOR {displayPeriod.toUpperCase()}
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded text-xs divide-y divide-slate-300">
                    <div className="grid grid-cols-4 p-2 bg-slate-50 font-medium text-[11px]">
                      <div><strong>Emp No:</strong> {empCode}</div>
                      <div><strong>Name:</strong> {empName}</div>
                      <div><strong>Designation:</strong> {designation}</div>
                      <div><strong>Department:</strong> {payslip.department || 'Engineering'}</div>
                    </div>
                    <div className="grid grid-cols-4 p-2 font-medium text-[11px]">
                      <div><strong>PAN No:</strong> {payslip.panNumber || 'BKAPS1289A'}</div>
                      <div><strong>UAN No:</strong> {uan}</div>
                      <div><strong>Bank A/C:</strong> {payslip.bankAccountNumber || '•••• 1234'}</div>
                      <div><strong>Payable Days:</strong> {payslip.attendance?.payableDays || 30}</div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded overflow-hidden text-[11px]">
                    <div className="grid grid-cols-2 divide-x divide-slate-300">
                      <div>
                        <div className="bg-slate-100 font-bold p-1.5 border-b border-slate-300 text-center uppercase text-[10px]">Gross Earnings</div>
                        <div className="p-2.5 space-y-1">
                          <div className="flex justify-between"><span>Basic Pay (50%)</span><span className="font-mono">{currencySymbol}{basic.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>HRA (40% Basic)</span><span className="font-mono">{currencySymbol}{hra.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Conveyance</span><span className="font-mono">{currencySymbol}{conveyance.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Medical</span><span className="font-mono">{currencySymbol}{medical.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Network & Internet Bill</span><span className="font-mono">{currencySymbol}{network.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Other Allowance</span><span className="font-mono">{currencySymbol}{otherAllow.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Special Allowance</span><span className="font-mono">{currencySymbol}{special.toLocaleString()}</span></div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-slate-100 font-bold p-1.5 border-b border-slate-300 text-center uppercase text-[10px]">Statutory Deductions</div>
                        <div className="p-2.5 space-y-1">
                          <div className="flex justify-between"><span>Provident Fund (EPF)</span><span className="font-mono">{currencySymbol}{pf.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>ESI Contribution</span><span className="font-mono">{currencySymbol}{esi.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-mono">{currencySymbol}{pt.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>TDS / Income Tax</span><span className="font-mono">{currencySymbol}{tds.toLocaleString()}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-300 bg-slate-50 border-t border-slate-300 p-2 font-bold">
                      <div className="flex justify-between"><span>Gross Total:</span><span className="font-mono">{currencySymbol}{totalGross.toLocaleString()}</span></div>
                      <div className="flex justify-between pl-2"><span>Deduction Total:</span><span className="font-mono">{currencySymbol}{totalDeductions.toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="border border-slate-900 p-2.5 rounded flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">NET SALARY PAYABLE:</span>
                      <p className="text-xl font-bold font-mono text-slate-900">{currencySymbol}{netPay.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-600 italic">Rupees: {netPayWords}</p>
                    </div>
                    {includeStamp && (
                      <div className="text-right">
                        <MargeySignatoryBlock align="right" stampSize={80} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <MargeyFooter />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
