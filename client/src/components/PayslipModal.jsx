import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Mail, 
  Building2, 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  User, 
  ShieldCheck,
  FileBadge
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  ProfuseLogo, 
  ProfuseFooter, 
  ProfuseSignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';

export default function PayslipModal({ payslip, company, onClose }) {
  const [template, setTemplate] = useState('executive'); // 'executive' | 'modern' | 'classic'
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const payslipRef = useRef(null);

  if (!payslip) return null;

  const currencySymbol = payslip.currency === 'USD' ? '$' : '₹';

  const handlePrint = () => {
    if (!payslipRef.current) return;
    const title = `Payslip - ${payslip.employeeName} (${payslip.monthName || payslip.monthYear})`;
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
      pdf.save(`Profuse_Payslip_${payslip.employeeId}_${(payslip.monthName || payslip.monthYear).replace(/\s+/g, '_')}.pdf`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden my-4 flex flex-col max-h-[96vh]">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileBadge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Official Salary Payslip
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {payslip.status || 'Verified'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {payslip.employeeName} ({payslip.employeeId}) • {payslip.monthName || payslip.monthYear}
              </p>
            </div>
          </div>

          {/* Template Selector & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTemplate('executive')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  template === 'executive' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive
              </button>
              <button
                onClick={() => setTemplate('modern')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  template === 'modern' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Modern
              </button>
              <button
                onClick={() => setTemplate('classic')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  template === 'classic' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Classic
              </button>
            </div>

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
                  Email Slip
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print Slip
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generating...' : 'PDF Download'}
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
            {/* Template 1: Executive Silicon (Profuse Standard) */}
            {template === 'executive' && (
              <div 
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div>
                  {/* Profuse Header Band */}
                  <div className="flex justify-between items-start border-b-2 border-amber-500 pb-2.5 mb-3.5">
                    <ProfuseLogo />

                    <div className="text-right">
                      <span className="text-[10.5px] text-slate-500 font-sans tracking-tight block">
                        Confidential, not to be disclosed
                      </span>
                      <span className="inline-block bg-amber-50 text-amber-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-amber-200 mt-0.5">
                        Payslip: {payslip.monthName || payslip.monthYear}
                      </span>
                      <p className="text-[11px] font-mono text-slate-700 mt-0.5 font-semibold">Slip Ref: {payslip.id}</p>
                      <p className="text-[10px] text-slate-500">Dated: {new Date(payslip.processedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Employee & Bank Info Grid */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Employee Name</span>
                      <span className="font-bold text-slate-900 text-xs">{payslip.employeeName}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Employee ID</span>
                      <span className="font-mono font-bold text-slate-800">{payslip.employeeId}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Department</span>
                      <span className="font-medium text-slate-800">{payslip.department}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Designation</span>
                      <span className="font-medium text-slate-800">{payslip.designation}</span>
                    </div>

                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Bank Name</span>
                      <span className="font-medium text-slate-800">{payslip.bankName || 'HDFC Bank'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Account Number</span>
                      <span className="font-mono text-slate-800">
                        {payslip.bankAccountNumber ? `•••• •••• ${String(payslip.bankAccountNumber).slice(-4)}` : '•••• 1234'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">PAN / UAN</span>
                      <span className="font-mono text-slate-800">{payslip.panNumber || 'BKAPS1289A'} / {payslip.uanNumber || '101928374650'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase block">Payment Mode</span>
                      <span className="font-medium text-emerald-700 font-semibold">{payslip.paymentMode || 'Direct Transfer'}</span>
                    </div>
                  </div>

                  {/* Attendance Summary Strip */}
                  <div className="bg-amber-50/40 border border-amber-200/60 rounded px-3 py-1.5 mb-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-5">
                      <div>
                        <span className="text-[9.5px] text-slate-500 uppercase block">Working Days</span>
                        <strong className="text-slate-800 font-mono text-[11px]">{payslip.attendance?.totalWorkingDays || 30}</strong>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-500 uppercase block">Present Days</span>
                        <strong className="text-emerald-700 font-mono text-[11px]">{payslip.attendance?.presentDays || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-500 uppercase block">Paid Leaves</span>
                        <strong className="text-brand-700 font-mono text-[11px]">{payslip.attendance?.paidLeaves || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-500 uppercase block">Loss of Pay (LWP)</span>
                        <strong className="text-rose-600 font-mono text-[11px]">{payslip.attendance?.unpaidLeaves || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-500 uppercase block">Overtime Hours</span>
                        <strong className="text-amber-700 font-mono text-[11px]">{payslip.attendance?.overtimeHours || 0} hrs</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] text-slate-500 uppercase block">Payable Days</span>
                      <strong className="text-xs font-bold text-slate-900 font-mono">{payslip.attendance?.payableDays || 30}</strong>
                    </div>
                  </div>

                  {/* Earnings & Deductions Tables */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Earnings Column */}
                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-[11px] uppercase tracking-wide text-slate-800">Earnings Components</span>
                        <span className="text-[10px] font-semibold text-slate-600">Amount ({currencySymbol})</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-[11px]">
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">Basic Salary</span>
                          <span className="font-mono font-medium">{currencySymbol}{payslip.earnings?.basic?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">House Rent Allowance (HRA)</span>
                          <span className="font-mono font-medium">{currencySymbol}{payslip.earnings?.hra?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">Conveyance Allowance</span>
                          <span className="font-mono font-medium">{currencySymbol}{payslip.earnings?.conveyance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">Medical Allowance</span>
                          <span className="font-mono font-medium">{currencySymbol}{payslip.earnings?.medical?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">Network & Internet Bill</span>
                          <span className="font-mono font-medium">{currencySymbol}{(payslip.earnings?.networkAllowance || 1000)?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">Other Allowance</span>
                          <span className="font-mono font-medium">{currencySymbol}{(payslip.earnings?.otherAllowance || 1000)?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 py-1">
                          <span className="text-slate-600">Special / Flexi Allowance</span>
                          <span className="font-mono font-medium">{currencySymbol}{payslip.earnings?.specialAllowance?.toLocaleString()}</span>
                        </div>
                        {payslip.earnings?.overtime > 0 && (
                          <div className="flex justify-between px-3 py-1 bg-amber-50/50">
                            <span className="text-amber-800 font-medium">Overtime Allowance</span>
                            <span className="font-mono font-bold text-amber-800">+{currencySymbol}{payslip.earnings?.overtime?.toLocaleString()}</span>
                          </div>
                        )}
                        {payslip.earnings?.bonus > 0 && (
                          <div className="flex justify-between px-3 py-1 bg-emerald-50/50">
                            <span className="text-emerald-800 font-medium">Performance Bonus</span>
                            <span className="font-mono font-bold text-emerald-800">+{currencySymbol}{payslip.earnings?.bonus?.toLocaleString()}</span>
                          </div>
                        )}
                        {payslip.earnings?.arrears > 0 && (
                          <div className="flex justify-between px-3 py-1 bg-indigo-50/50">
                            <span className="text-indigo-800 font-medium">Appraisal Arrears</span>
                            <span className="font-mono font-bold text-indigo-800">+{currencySymbol}{payslip.earnings?.arrears?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-100/80 px-3 py-1.5 border-t border-slate-200 flex justify-between items-center font-bold text-xs">
                        <span className="text-slate-800">Total Gross Earnings (A)</span>
                        <span className="font-mono text-amber-700">{currencySymbol}{payslip.earnings?.totalGross?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Deductions Column */}
                    <div className="border border-slate-200 rounded overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex justify-between items-center">
                          <span className="font-bold text-[11px] uppercase tracking-wide text-slate-800">Deductions</span>
                          <span className="text-[10px] font-semibold text-slate-600">Amount ({currencySymbol})</span>
                        </div>
                        <div className="divide-y divide-slate-100 text-[11px]">
                          <div className="flex justify-between px-3 py-1">
                            <span className="text-slate-600">Employee Provident Fund (EPF 12%)</span>
                            <span className="font-mono font-medium">{currencySymbol}{payslip.deductions?.providentFund?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between px-3 py-1">
                            <span className="text-slate-600">Employee State Insurance (ESI 0.75%)</span>
                            <span className="font-mono font-medium">{currencySymbol}{payslip.deductions?.esi?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between px-3 py-1">
                            <span className="text-slate-600">Professional Tax (PTax)</span>
                            <span className="font-mono font-medium">{currencySymbol}{payslip.deductions?.professionalTax?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between px-3 py-1">
                            <span className="text-slate-600">Income Tax / TDS</span>
                            <span className="font-mono font-medium">{currencySymbol}{payslip.deductions?.tds?.toLocaleString()}</span>
                          </div>
                          {payslip.deductions?.lossOfPayAmount > 0 && (
                            <div className="flex justify-between px-3 py-1 bg-rose-50/50">
                              <span className="text-rose-700">Loss of Pay ({payslip.deductions?.lossOfPayDays} days LWP)</span>
                              <span className="font-mono text-rose-700 font-semibold">{currencySymbol}{payslip.deductions?.lossOfPayAmount?.toLocaleString()}</span>
                            </div>
                          )}
                          {payslip.deductions?.advance > 0 && (
                            <div className="flex justify-between px-3 py-1">
                              <span className="text-slate-600">Salary Advance Recovery</span>
                              <span className="font-mono font-medium">{currencySymbol}{payslip.deductions?.advance?.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-slate-100/80 px-3 py-1.5 border-t border-slate-200 flex justify-between items-center font-bold text-xs">
                        <span className="text-slate-800">Total Deductions (B)</span>
                        <span className="font-mono text-rose-700">{currencySymbol}{payslip.deductions?.totalDeductions?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Banner */}
                  <div className="bg-slate-900 text-white rounded p-3 mb-3 flex flex-col sm:flex-row justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">Net Salary Payable (A - B)</span>
                      <p className="text-xl sm:text-2xl font-bold font-mono mt-0.5 text-white">
                        {currencySymbol}{payslip.netPay?.toLocaleString()}
                      </p>
                      <p className="text-[10.5px] text-slate-300 mt-0.5 italic font-medium">
                        In Words: {payslip.netPayInWords}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right bg-white/10 px-3 py-1.5 rounded border border-white/15">
                      <span className="text-[10px] text-amber-200 block">Disbursed Via</span>
                      <strong className="text-[11px] text-white uppercase">{payslip.bankName || 'HDFC Bank'}</strong>
                      <span className="text-[9.5px] text-emerald-300 font-mono block mt-0.5">● Disbursed Successfully</span>
                    </div>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-end text-xs text-slate-800">
                    <div className="max-w-xs">
                      <p className="text-[9.5px] text-slate-500 leading-tight font-sans">
                        * This document is a computer-generated salary slip and requires no physical signature under the Information Technology Act. For queries regarding your tax or deductions, please write to hr@protps.com.
                      </p>
                    </div>
                    <div className="text-right">
                      <ProfuseSignatoryBlock align="right" />
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <ProfuseFooter />
                </div>
              </div>
            )}

            {/* Template 2: Modern Minimalist */}
            {template === 'modern' && (
              <div 
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <div>
                      <h2 className="text-xl font-black text-amber-600 tracking-tight">
                        {company?.name || payslip.company?.name || 'Profuse Transtech Solutions'}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">Salary Statement • {payslip.monthName || payslip.monthYear}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700">REF: {payslip.id}</span>
                      <p className="text-[11px] text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3 rounded bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase">Employee</p>
                      <p className="font-bold text-slate-900 text-xs">{payslip.employeeName}</p>
                      <p className="text-slate-500 font-mono text-[10px]">{payslip.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase">Role & Department</p>
                      <p className="font-semibold text-slate-800 text-xs">{payslip.designation}</p>
                      <p className="text-slate-500 text-[10.5px]">{payslip.department}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase">Banking Account</p>
                      <p className="font-semibold text-slate-800 text-xs">{payslip.bankName}</p>
                      <p className="text-slate-500 font-mono text-[10px]">A/C: ••••{String(payslip.bankAccountNumber).slice(-4)}</p>
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
                        <td className="py-1.5 text-slate-700">Basic Salary</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.earnings?.basic?.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Provident Fund (PF)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.deductions?.providentFund?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">House Rent Allowance (HRA)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.earnings?.hra?.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">ESI (0.75%)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.deductions?.esi?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Conveyance & Medical</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{((payslip.earnings?.conveyance || 0) + (payslip.earnings?.medical || 0))?.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Professional Tax (PT)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.deductions?.professionalTax?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Network & Other Allowance</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{((payslip.earnings?.networkAllowance || 1000) + (payslip.earnings?.otherAllowance || 1000))?.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Tax Deducted at Source (TDS)</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.deductions?.tds?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Special Allowances</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{payslip.earnings?.specialAllowance?.toLocaleString()}</td>
                        <td className="py-1.5 pl-6 text-slate-700">Other Deductions</td>
                        <td className="py-1.5 text-right font-mono">{currencySymbol}{((payslip.deductions?.advanceDeduction || 0) + (payslip.deductions?.otherDeductions || 0))?.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold">
                        <td className="py-2 text-slate-900">Total Gross Earnings</td>
                        <td className="py-2 text-right font-mono text-amber-700 text-xs">{currencySymbol}{payslip.earnings?.totalGross?.toLocaleString()}</td>
                        <td className="py-2 pl-6 text-slate-900">Total Deductions</td>
                        <td className="py-2 text-right font-mono text-rose-700 text-xs">{currencySymbol}{payslip.deductions?.totalDeductions?.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="p-3 rounded bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Take-Home Net Salary</span>
                      <p className="text-xl font-bold font-mono">{currencySymbol}{payslip.netPay?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-300 italic mt-0.5">{payslip.netPayInWords}</p>
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
                  <ProfuseSignatoryBlock align="right" />
                </div>
              </div>
            )}

            {/* Template 3: Classic Audit */}
            {template === 'classic' && (
              <div 
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div className="space-y-3">
                  <div className="text-center border-b border-slate-300 pb-2">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">{company?.legalName || company?.name || 'Profuse Transtech Solutions Private Limited'}</h2>
                    <p className="text-[10.5px] text-slate-600">{company?.address}</p>
                    <div className="mt-1.5 inline-block border-y border-slate-800 px-3 py-0.5 font-bold uppercase text-[10.5px] tracking-widest">
                      SALARY CERTIFICATE & PAYSLIP FOR {payslip.monthName?.toUpperCase() || payslip.monthYear}
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded text-xs divide-y divide-slate-300">
                    <div className="grid grid-cols-4 p-2 bg-slate-50 font-medium text-[11px]">
                      <div><strong>Emp No:</strong> {payslip.employeeId}</div>
                      <div><strong>Name:</strong> {payslip.employeeName}</div>
                      <div><strong>Designation:</strong> {payslip.designation}</div>
                      <div><strong>Department:</strong> {payslip.department}</div>
                    </div>
                    <div className="grid grid-cols-4 p-2 font-medium text-[11px]">
                      <div><strong>PAN No:</strong> {payslip.panNumber || 'BKAPS1289A'}</div>
                      <div><strong>UAN No:</strong> {payslip.uanNumber || '101928374650'}</div>
                      <div><strong>Bank A/C:</strong> {payslip.bankAccountNumber}</div>
                      <div><strong>Payable Days:</strong> {payslip.attendance?.payableDays || 30}</div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded overflow-hidden text-[11px]">
                    <div className="grid grid-cols-2 divide-x divide-slate-300">
                      <div>
                        <div className="bg-slate-100 font-bold p-1.5 border-b border-slate-300 text-center uppercase text-[10px]">Gross Earnings</div>
                        <div className="p-2.5 space-y-1">
                          <div className="flex justify-between"><span>Basic Pay (50%)</span><span className="font-mono">{currencySymbol}{payslip.earnings?.basic?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>HRA (40% Basic)</span><span className="font-mono">{currencySymbol}{payslip.earnings?.hra?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Conveyance</span><span className="font-mono">{currencySymbol}{payslip.earnings?.conveyance?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Medical</span><span className="font-mono">{currencySymbol}{payslip.earnings?.medical?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Network & Internet Bill</span><span className="font-mono">{currencySymbol}{(payslip.earnings?.networkAllowance || 1000)?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Other Allowance</span><span className="font-mono">{currencySymbol}{(payslip.earnings?.otherAllowance || 1000)?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Special Allowance</span><span className="font-mono">{currencySymbol}{payslip.earnings?.specialAllowance?.toLocaleString()}</span></div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-slate-100 font-bold p-1.5 border-b border-slate-300 text-center uppercase text-[10px]">Statutory Deductions</div>
                        <div className="p-2.5 space-y-1">
                          <div className="flex justify-between"><span>Provident Fund (EPF)</span><span className="font-mono">{currencySymbol}{payslip.deductions?.providentFund?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>ESI Contribution</span><span className="font-mono">{currencySymbol}{payslip.deductions?.esi?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-mono">{currencySymbol}{payslip.deductions?.professionalTax?.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>TDS / Income Tax</span><span className="font-mono">{currencySymbol}{payslip.deductions?.tds?.toLocaleString()}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-300 bg-slate-50 border-t border-slate-300 p-2 font-bold">
                      <div className="flex justify-between"><span>Gross Total:</span><span className="font-mono">{currencySymbol}{payslip.earnings?.totalGross?.toLocaleString()}</span></div>
                      <div className="flex justify-between pl-2"><span>Deduction Total:</span><span className="font-mono">{currencySymbol}{payslip.deductions?.totalDeductions?.toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="border border-slate-900 p-2.5 rounded flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">NET SALARY PAYABLE:</span>
                      <p className="text-xl font-bold font-mono text-slate-900">{currencySymbol}{payslip.netPay?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-600 italic">Rupees: {payslip.netPayInWords}</p>
                    </div>
                    <div className="text-right">
                      <ProfuseSignatoryBlock align="right" />
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <ProfuseFooter />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
