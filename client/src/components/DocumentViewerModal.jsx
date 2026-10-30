import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Mail, 
  CheckCircle, 
  FileText, 
  Copy,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  MargeyHeader, 
  MargeyFooter, 
  MargeySignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';
import { calculateTenure, formatOrdinalDate } from '../utils/dateUtils';

export default function DocumentViewerModal({ document, company, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullAnnexure, setShowFullAnnexure] = useState(true); // Full 6-page package vs 2-page brief
  const printRef = useRef(null);

  if (!document) return null;

  const candidateName = document.candidate?.fullName || document.employee?.fullName || 'Ms. Batta Vyshnavi';
  const candidateAddress = document.candidate?.address || 'Papireddypalem,\nT.P. Gudur Mandal, Nellore District,\nAndhra Pradesh';
  const designation = document.employment?.designation || document.employee?.designation || 'HR Executive';
  const department = document.employment?.department || document.employee?.department || 'Human Resources';
  const joiningDate = document.employment?.formattedJoiningDate || document.employment?.joiningDate || '12th Nov 2025';
  const workLocation = document.employment?.workLocation || 'Bangalore';
  const reportingManager = document.employment?.reportingTo || '[Name / Designation]';
  const probationPeriod = document.employment?.probationPeriod || (document.employment?.probationMonths ? `${document.employment.probationMonths} months` : '[Insert duration]');
  const noticePeriod = document.employment?.noticePeriodDays ? `${document.employment.noticePeriodDays} days` : '[insert period]';

  const rawCTC = Number(document.compensation?.annualCTC) || 600000;
  const ctcFormatted = rawCTC.toLocaleString('en-IN');
  const monthlyCTCEquivalent = Math.round(rawCTC / 12).toLocaleString('en-IN');
  const ctcWords = document.compensation?.inWords || 'Rupees Six Lakh only';

  // Compensation Breakdown Components (Annexure I)
  const struct = document.compensation?.structure;
  const monthlyBasic = struct?.monthly?.basic || Math.round(rawCTC * 0.50 / 12);
  const annualBasic = struct?.annual?.basic || Math.round(rawCTC * 0.50);

  const monthlyHRA = struct?.monthly?.hra || Math.round(annualBasic * 0.40 / 12);
  const annualHRA = struct?.annual?.hra || Math.round(annualBasic * 0.40);

  const monthlyTravel = struct?.monthly?.conveyance || 2000;
  const annualTravel = struct?.annual?.conveyance || 24000;

  const monthlyMedical = struct?.monthly?.medical || 1500;
  const annualMedical = struct?.annual?.medical || 18000;

  const monthlyInternet = struct?.monthly?.networkAllowance || 1500;
  const annualInternet = struct?.annual?.networkAllowance || 18000;

  const monthlyFood = struct?.monthly?.otherAllowance || 2000;
  const annualFood = struct?.annual?.otherAllowance || 24000;

  const monthlyFixedSum = monthlyBasic + monthlyHRA + monthlyTravel + monthlyMedical + monthlyInternet + monthlyFood;
  const monthlyGrossNum = Math.round(rawCTC / 12);
  const monthlySpecial = struct?.monthly?.specialAllowance || Math.max(0, monthlyGrossNum - monthlyFixedSum);
  const annualSpecial = struct?.annual?.specialAllowance || Math.max(0, rawCTC - (annualBasic + annualHRA + annualTravel + annualMedical + annualInternet + annualFood));

  // Dynamic Tenure & Formatted Dates for Experience & Relieving Certificates
  const expJoiningDate = document.employee?.formattedJoiningDate || 
    document.employee?.formattedJoining || 
    document.formattedJoiningDate || 
    formatOrdinalDate(document.employee?.dateOfJoining) || 
    '15th Mar, 2022';

  const expRelievingDate = document.employee?.formattedRelievingDate || 
    document.employee?.formattedRelieving || 
    document.formattedRelievingDate || 
    formatOrdinalDate(document.employee?.relievingDate) || 
    '30th Oct, 2026';

  const expTenure = document.tenureFormatted || 
    document.employee?.tenureFormatted || 
    document.employee?.tenure || 
    document.tenure || 
    calculateTenure(document.employee?.dateOfJoining, document.employee?.relievingDate).formatted ||
    '4 Years';

  const relResignationDate = document.employee?.formattedResignationDate || 
    document.employee?.formattedResignation || 
    document.formattedResignationDate || 
    formatOrdinalDate(document.employee?.resignationDate) || 
    '30th Sep, 2026';

  const relRelievingDate = document.employee?.formattedRelievingDate || 
    document.employee?.formattedRelieving || 
    document.formattedRelievingDate || 
    formatOrdinalDate(document.employee?.relievingDate) || 
    '30th Oct, 2026';

  const handlePrint = () => {
    if (!printRef.current) return;
    const title = `${document.title || 'Letter of Offer'} - ${candidateName}`;
    printDocument(printRef.current, title);
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const pageElements = printRef.current.querySelectorAll('.printable-page');
      if (!pageElements || pageElements.length === 0) {
        throw new Error('No printable pages found');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 1024
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      pdf.save(`Margey_${document.type.toUpperCase()}_${candidateName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const text = document.bodyText || `${document.title}\nRef: ${document.id}\n${candidateName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSimulate = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const formattedIssueDate = document.formattedIssueDate || '27TH Oct 2025';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden my-4 flex flex-col max-h-[96vh]">
        {/* Header Controls Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 no-print shrink-0 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {document.title || 'Letter of Offer'}
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {document.id}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Margey Labs Official Template • {candidateName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {document.type === 'offer' && (
              <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs mr-1">
                <button
                  onClick={() => setShowFullAnnexure(true)}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    showFullAnnexure ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Full package including all 5 Annexures (6 Pages)"
                >
                  Full Package (6 Pages)
                </button>
                <button
                  onClick={() => setShowFullAnnexure(false)}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    !showFullAnnexure ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Brief 2-page offer letter with Annexure I compensation table"
                >
                  Quick (2 Pages)
                </button>
              </div>
            )}

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleEmailSimulate}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950">
          <div ref={printRef} className="printable-area w-full max-w-3xl space-y-8 font-sans">
            
            {/* ============================================================== */}
            {/* TEMPLATE TYPE 1: MARGEY LABS OFFICIAL OFFER LETTER PACKAGE      */}
            {/* ============================================================== */}
            {document.type === 'offer' && (
              <>
                {/* PAGE 1: Main Letter of Offer */}
                <div
                  className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                  style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                >
                  <div>
                    <MargeyHeader
                      refId={document.id}
                      dateStr={formattedIssueDate}
                      isConfidential={true}
                    />

                    {/* Date & Addressee */}
                    <div className="text-[11px] leading-relaxed text-slate-900 font-sans mb-2">
                      <p className="font-semibold">Date: {formattedIssueDate},</p>
                      <div className="mt-1 font-sans">
                        <p className="font-semibold">To,</p>
                        <p className="font-bold text-slate-900">{candidateName}</p>
                        {candidateAddress.split('\n').map((line, idx) => (
                          <p key={idx} className="text-slate-700">{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Centered Heading */}
                    <div className="text-center my-2">
                      <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                        LETTER OF OFFER
                      </h2>
                      <p className="text-[11.5px] font-bold text-slate-900 mt-0.5">
                        Subject: Offer of Employment – {designation}
                      </p>
                    </div>

                    {/* Salutation & Body Text */}
                    <div className="space-y-2 text-[10.5px] leading-[1.4] text-slate-800 font-sans text-justify">
                      <p className="font-semibold text-slate-900">
                        Dear {candidateName},
                      </p>

                      <p>
                        We are pleased to offer you employment with <strong>MARGEY LABS PRIVATE LIMITED</strong> as an {designation} in the {department} Department. This letter summarises the principal terms of the offer. The attached annexures provide further details regarding compensation, role responsibilities, employment conditions, and workplace policies.
                      </p>

                      {/* Section 1: Position and Employment Details Table */}
                      <div>
                        <p className="font-bold text-slate-900 text-[11px] mb-1">1. Position and Employment Details</p>
                        <table className="w-full text-[10px] border border-slate-400">
                          <tbody className="divide-y divide-slate-300">
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 w-1/3 bg-slate-50 border-r border-slate-300">Job Title</td>
                              <td className="p-1.5 font-bold text-slate-900">{designation}</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Department</td>
                              <td className="p-1.5 text-slate-800">{department}</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Annual CTC</td>
                              <td className="p-1.5 font-mono font-bold text-slate-900">₹{ctcFormatted} ({ctcWords})</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Monthly CTC Equivalent</td>
                              <td className="p-1.5 font-mono font-bold text-slate-900">₹{monthlyCTCEquivalent}</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Joining Date</td>
                              <td className="p-1.5 text-slate-800">{joiningDate}</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Work Location</td>
                              <td className="p-1.5 text-slate-800">{workLocation}</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Reporting Manager</td>
                              <td className="p-1.5 text-slate-800">{reportingManager}</td>
                            </tr>
                            <tr>
                              <td className="p-1.5 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Probation Period</td>
                              <td className="p-1.5 text-slate-800">{probationPeriod}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Section 2 */}
                      <div>
                        <p className="font-bold text-slate-900 text-[11px] mb-0.5">2. Compensation and Payroll</p>
                        <p>
                          Your annual Cost to Company (CTC) will be ₹{ctcFormatted}. The monthly CTC equivalent is ₹{monthlyCTCEquivalent}. Accordingly, the gross salary and take-home amount may be different from the monthly CTC equivalent. Annexure I contains an illustrative compensation schedule; the final breakup will be approved by the company and applied through payroll.
                        </p>
                      </div>

                      {/* Section 3 */}
                      <div>
                        <p className="font-bold text-slate-900 text-[11px] mb-0.5">3. Role and Workplace Expectations</p>
                        <p>
                          In this position, you will support recruitment, onboarding, employee documentation, attendance and leave administration, payroll coordination, employee communication, and implementation of HR policies. You are expected to protect confidential information, follow authorized procedures, and perform duties assigned by your reporting manager.
                        </p>
                      </div>

                      {/* Section 4 */}
                      <div>
                        <p className="font-bold text-slate-900 text-[11px] mb-0.5">4. Conditions and Company Policies</p>
                        <p>
                          The offer is subject to completion of joining formalities and reasonable verification of the information and documents provided. Your employment will be governed by the conditions in Annexure III, applicable company policies in Annexure IV, and prevailing law. The company should complete all bracketed fields and confirm the final compensation structure before issuing this letter.
                        </p>
                      </div>

                      <p>
                        We look forward to welcoming you to <strong>MARGEY LABS PRIVATE LIMITED</strong> and wish you success in your role.
                      </p>
                    </div>

                    {/* Closing Signatures */}
                    <div className="mt-2.5">
                      <p className="text-[10.5px] font-medium text-slate-800">Regards,</p>
                      <p className="text-[11px] font-bold text-slate-900">Human Resources Department</p>
                      <p className="text-[11px] font-bold text-slate-900">MARGEY LABS PRIVATE LIMITED</p>
                      <div className="mt-1">
                        <MargeySignatoryBlock align="left" stampSize={80} />
                      </div>
                    </div>
                  </div>

                  <MargeyFooter />
                </div>

                {/* PAGE 2: ANNEXURE – I: Compensation & Salary Structure */}
                <div
                  className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                  style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                >
                  <div>
                    <MargeyHeader
                      refId={document.id}
                      dateStr={formattedIssueDate}
                      isConfidential={true}
                    />

                    <div className="text-center my-2">
                      <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                        ANNEXURE – I
                      </h2>
                      <p className="text-[11.5px] font-bold text-slate-900 uppercase">
                        COMPENSATION AND SALARY STRUCTURE
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-300 p-2 text-[10.5px] font-sans mb-2.5 space-y-0.5">
                      <p><strong>Employee:</strong> {candidateName} &nbsp;|&nbsp; <strong>Designation:</strong> {designation}</p>
                      <p><strong>Annual CTC:</strong> ₹{ctcFormatted} &nbsp;|&nbsp; <strong>Monthly CTC equivalent:</strong> ₹{monthlyCTCEquivalent}</p>
                    </div>

                    <p className="text-[10px] text-slate-700 italic mb-2 text-justify">
                      The following is an illustrative allocation for discussion. It must be revised if employer contributions, insurance, gratuity, bonus, or other benefits are included in CTC.
                    </p>

                    {/* Compensation Breakup Table */}
                    <div className="border border-slate-400 text-[10.5px] mb-3">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 uppercase text-[9.5px] font-bold border-b border-slate-400">
                            <th className="p-1.5 text-left border-r border-slate-300">EARNINGS</th>
                            <th className="p-1.5 text-right border-r border-slate-300">Per Month (₹)</th>
                            <th className="p-1.5 text-right">Per Annum (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 font-mono">
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Basic Pay</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyBasic.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualBasic.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">HRA</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyHRA.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualHRA.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Traveling Allowance</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyTravel.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualTravel.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Medical Allowance</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyMedical.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualMedical.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Internet Allowance</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyInternet.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualInternet.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Food Allowance</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyFood.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualFood.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Special Allowance</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlySpecial.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualSpecial.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                            <td className="p-1.5 font-sans text-slate-900 border-r border-slate-300">Gross Total</td>
                            <td className="p-1.5 text-right border-r border-slate-300 font-bold">{monthlyGrossNum.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right font-bold">{rawCTC.toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[10px] text-slate-700 leading-relaxed text-justify mb-4">
                      This illustration totals ₹{ctcFormatted} as gross-pay components and does not separately account for employer contributions or benefits. The final CTC breakup must be confirmed by payroll. Applicable employee deductions may reduce take-home pay.
                    </p>

                    {/* Dual Signatory Block */}
                    <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-4 text-[10.5px]">
                      <div>
                        <p className="font-bold text-slate-900">For MARGEY LABS PVT. LTD.</p>
                        <div className="mt-1">
                          <MargeySignatoryBlock align="left" stampSize={75} />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <p className="font-bold text-slate-900 mb-6">Candidate Acceptance Signature</p>
                        <div className="border-b border-slate-800 w-48 mb-1"></div>
                        <p className="text-[10px] text-slate-700">Signature: {candidateName}</p>
                        <p className="text-[10px] text-slate-700">Date: ________________________</p>
                      </div>
                    </div>
                  </div>

                  <MargeyFooter />
                </div>

                {/* ================= OPTIONAL FULL ANNEXURES II, III, IV, V (PAGES 3-6) ================= */}
                {showFullAnnexure && (
                  <>
                    {/* PAGE 3: ANNEXURE – II: Role Profile */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={formattedIssueDate}
                          isConfidential={true}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – II
                          </h2>
                          <p className="text-[11.5px] font-bold text-slate-900 uppercase">
                            {designation.toUpperCase()} ROLE PROFILE
                          </p>
                        </div>

                        <div className="space-y-3 text-[10.5px] leading-relaxed text-slate-800 font-sans text-justify mt-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Purpose of the role</h3>
                            <p>
                              To assist with efficient HR administration and employee support, while maintaining accurate records and helping the organization follow its employment procedures.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Principal responsibilities</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700">
                              <li>Assist with recruitment activities, including vacancy posting, candidate screening, interview scheduling, and follow-up.</li>
                              <li>Coordinate joining documentation, induction, onboarding checklists, and employee file creation.</li>
                              <li>Maintain employee records, HR databases, attendance, leave information, and personnel documentation accurately.</li>
                              <li>Coordinate attendance and payroll inputs with payroll/accounts and raise discrepancies for resolution.</li>
                              <li>Answer routine employee questions about HR processes, attendance, leave, and required documentation.</li>
                              <li>Support employee engagement, training coordination, internal communications, and performance review administration.</li>
                              <li>Prepare HR reports, letters, trackers, and routine correspondence as assigned.</li>
                              <li>Assist in communicating company policies, confidentiality requirements, and applicable POSH procedures.</li>
                              <li>Handle employee information discreetly and access it only for authorized work purposes.</li>
                              <li>Complete other reasonable HR duties assigned by the reporting manager.</li>
                            </ul>
                          </div>

                          <div className="pt-2">
                            <p className="font-bold text-slate-900">
                              Reporting line: <span className="font-medium text-slate-800">{reportingManager}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>

                    {/* PAGE 4: ANNEXURE – III: Company Policies and Employee Information */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={formattedIssueDate}
                          isConfidential={true}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – III
                          </h2>
                          <p className="text-[11.5px] font-bold text-slate-900 uppercase">
                            COMPANY POLICIES AND EMPLOYEE INFORMATION
                          </p>
                        </div>

                        <div className="space-y-3 text-[10px] leading-relaxed text-slate-800 font-sans text-justify mt-2">
                          <p className="italic text-slate-600">
                            The company should provide the employee with the applicable policies or access to them and identify which policies have been formally adopted.
                          </p>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">Adopted Corporate Policies</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li>Code of Conduct and Professional Behavior</li>
                              <li>Attendance, Leave, and Working Hours</li>
                              <li>Confidentiality, Data Privacy, and Information Security</li>
                              <li>IT, Internet, Email, Password, and Acceptable Use</li>
                              <li>Prevention of Sexual Harassment (POSH) and reporting procedure</li>
                              <li>Conflict of Interest and Gifts, where adopted</li>
                              <li>Grievance Redressal and Disciplinary Procedure</li>
                              <li>Employee Records and Document Retention, where applicable</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">Financial and Statutory benefits</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Annual Performance Bonus:</strong> Additional payment based on individual or company performance.</li>
                              <li><strong>Festival Bonus:</strong> Additional company-provided festive reward.</li>
                              <li><strong>EPF (Employee Provident Fund):</strong> Employer contributes towards employee retirement savings as applicable.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">Insurance and Medical benefits</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Family Health Insurance:</strong> Medical coverage for eligible dependents.</li>
                              <li><strong>Maternity Benefit:</strong> Statutory maternity benefits and any additional company benefits.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">Transportation & Welfare Benefits</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Cab Facility:</strong> Eligible employees may be provided with cab facilities based on shift timings, business requirements and company transportation policy.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>

                    {/* PAGE 5: ANNEXURE – IV: Confidentiality and Data Protection */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={formattedIssueDate}
                          isConfidential={true}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – IV
                          </h2>
                          <p className="text-[11.5px] font-bold text-slate-900 uppercase">
                            CONFIDENTIALITY AND DATA PROTECTION
                          </p>
                        </div>

                        <div className="space-y-3 text-[10.5px] leading-relaxed text-slate-800 font-sans text-justify mt-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">Confidential information</h3>
                            <p>
                              Confidential information includes non-public employee and candidate records, compensation data, recruitment plans, client information, business plans, passwords, internal reports, financial data and proprietary processes.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">Required safeguards</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700">
                              <li>Access information only for authorised work purposes.</li>
                              <li>Do not disclose, copy, photograph, download or transfer confidential information without approval.</li>
                              <li>Use approved systems and storage; do not send company information to personal email or unauthorised cloud accounts.</li>
                              <li>Verify recipients before sharing HR records and apply appropriate access controls.</li>
                              <li>Report suspected loss, unauthorised access, phishing or accidental disclosure promptly.</li>
                              <li>Retain and dispose of records according to the company’s retention schedule and applicable law.</li>
                            </ul>
                          </div>

                          <div className="pt-2">
                            <p className="text-slate-700 leading-relaxed">
                              Confidentiality obligations continue after employment ends, subject to lawful disclosures and information legitimately in the public domain. This annexure does not prevent lawful reporting to authorised bodies.
                            </p>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>

                    {/* PAGE 6: ANNEXURE – V: Employment Terms and Conditions & Acceptance */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={formattedIssueDate}
                          isConfidential={true}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – V
                          </h2>
                          <p className="text-[11.5px] font-bold text-slate-900 uppercase">
                            EMPLOYMENT TERMS AND CONDITIONS
                          </p>
                        </div>

                        <div className="space-y-1.5 text-[9.8px] leading-[1.38] text-slate-800 font-sans text-justify mt-2">
                          <p><strong>Commencement:</strong> Employment begins on the joining date confirmed in writing after completion of joining formalities.</p>
                          <p><strong>Probation:</strong> Probation will last {probationPeriod}. Performance and suitability may be reviewed; any extension or confirmation will be communicated in writing.</p>
                          <p><strong>Working hours:</strong> Working hours, breaks, shifts, and weekly holidays will follow the company schedule and applicable law.</p>
                          <p><strong>Attendance and leave:</strong> The employee must follow company procedures for attendance, leave applications, approvals, and records. Leave entitlements are subject to company policy and applicable law.</p>
                          <p><strong>Salary payment:</strong> Salary will be paid monthly according to the final approved compensation structure and payroll calendar, subject to applicable deductions.</p>
                          <p><strong>Notice period:</strong> The notice period during probation and after confirmation will be {noticePeriod}, subject to the final written terms, company policy, and applicable law.</p>
                          <p><strong>Confidentiality:</strong> Confidential business information and personal data must be protected and used only for authorized work.</p>
                          <p><strong>Company assets:</strong> Company property, records, devices, access cards, and credentials must be safeguarded and returned when requested or at separation.</p>
                          <p><strong>Professional conduct:</strong> The employee must act professionally, avoid conflicts of interest, and comply with lawful instructions and applicable policies.</p>
                          <p><strong>Verification:</strong> The offer is subject to reasonable verification of information and documents provided. Material discrepancies will be addressed under applicable law and company procedure.</p>
                          <p><strong>Amendments:</strong> Changes to material employment terms will be communicated in writing by an authorized representative.</p>
                          <p><strong>Applicable law:</strong> Employment terms are subject to applicable laws in India and the relevant state.</p>
                        </div>

                        {/* Candidate Acceptance Box */}
                        <div className="mt-4 p-3 border border-slate-400 bg-slate-50 text-[10px] space-y-2">
                          <p className="font-semibold text-slate-900">
                            I have read, understood, and accept the offer of employment and the terms and conditions outlined in this Letter of Offer and Annexures.
                          </p>
                          <div className="pt-4 flex justify-between items-end">
                            <div>
                              <p className="font-bold text-slate-900">Candidate Name: {candidateName}</p>
                              <p className="text-slate-700">Date: ________________________</p>
                            </div>
                            <div className="text-right">
                              <div className="border-b border-slate-800 w-44 mb-1"></div>
                              <span className="font-bold text-slate-900">Candidate Signature</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ============================================================== */}
            {/* TEMPLATE TYPE 2: EXPERIENCE CERTIFICATE                        */}
            {/* ============================================================== */}
            {document.type === 'experience' && (
              <div
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div>
                  <MargeyHeader
                    refId={document.id}
                    dateStr={document.formattedIssueDate || document.issueDate}
                    isConfidential={false}
                  />

                  <div className="text-center my-4">
                    <h2 className="text-base font-bold text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4 tracking-wide font-sans">
                      Service & Experience Certificate
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs sm:text-[12px] text-slate-800 leading-relaxed font-sans text-justify mt-4">
                    <p className="font-bold text-slate-900 text-center uppercase tracking-widest text-xs border-y border-slate-200 py-1.5">
                      TO WHOMSOEVER IT MAY CONCERN
                    </p>

                    <p>
                      This is to certify that <strong>{document.employee?.fullName || candidateName}</strong> (Employee ID: <strong>{document.employee?.id || 'EMP001'}</strong>) was employed with <strong>MARGEY LABS PRIVATE LIMITED</strong> from <strong>{expJoiningDate}</strong> to <strong>{expRelievingDate}</strong>.
                    </p>

                    <p>
                      During their tenure of <strong>{expTenure}</strong> with us, they served in the role of <strong>{designation}</strong> in the <strong>{document.employee?.department || 'Engineering'}</strong> department.
                    </p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                      <p><strong>Professional Conduct & Rating:</strong> {document.conductRating || 'Exemplary & High Velocity Performance'}</p>
                      <p><strong>Key Contributions:</strong> {document.responsibilitiesSummary || 'Showcased strong ownership, cross-functional collaboration, and consistently delivered high impact solutions.'}</p>
                    </div>

                    <p>
                      Their conduct during the employment was exemplary. They demonstrated high standards of integrity, commitment, and technical excellence.
                    </p>

                    <p>
                      We take this opportunity to appreciate their contributions to Margey Labs and wish them grand success in all future professional and personal endeavors.
                    </p>
                  </div>

                  <div className="mt-8">
                    <MargeySignatoryBlock align="left" stampSize={90} />
                  </div>
                </div>

                <MargeyFooter />
              </div>
            )}

            {/* ============================================================== */}
            {/* TEMPLATE TYPE 3: RELIEVING ORDER                               */}
            {/* ============================================================== */}
            {document.type === 'relieving' && (
              <div
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div>
                  <MargeyHeader
                    refId={document.id}
                    dateStr={document.formattedIssueDate || document.issueDate}
                    isConfidential={true}
                  />

                  <div className="text-center my-4">
                    <h2 className="text-base font-bold text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4 tracking-wide font-sans">
                      Relieving Order
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs sm:text-[12px] text-slate-800 leading-relaxed font-sans mt-3">
                    <p className="font-bold text-slate-900 text-sm">
                      Dear {document.employee?.fullName || candidateName},
                    </p>

                    <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                      Sub: Acceptance of Resignation & Official Relieving Order
                    </p>

                    <p className="text-justify">
                      With reference to your formal letter of resignation dated <strong>{relResignationDate}</strong>, we wish to confirm that your resignation from the services of <strong>MARGEY LABS PRIVATE LIMITED</strong> as <strong>{designation}</strong> has been formally accepted.
                    </p>

                    <p className="text-justify">
                      You are officially relieved from your duties and employment with effect from the close of business hours on <strong>{relRelievingDate}</strong>.
                    </p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5 text-xs">
                      <p className="font-bold text-slate-900">Clearance & Settlement Confirmation:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700">
                        <li><strong>Asset & Clearance:</strong> {document.clearanceStatus || 'All IT assets, security tokens, and company equipment surrendered in full.'}</li>
                        <li><strong>Full & Final Settlement:</strong> {document.settlementDetails || 'FnF settlement has been processed and disbursed with zero pending dues.'}</li>
                        <li><strong>Non-Disclosure:</strong> Your obligations regarding confidentiality and proprietary trade secrets remain binding post-employment.</li>
                      </ul>
                    </div>

                    <p className="text-justify">
                      We thank you for your services during your tenure with Margey Labs and wish you the very best in all your future endeavors.
                    </p>
                  </div>

                  <div className="mt-8">
                    <MargeySignatoryBlock align="left" stampSize={90} />
                  </div>
                </div>

                <MargeyFooter />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
