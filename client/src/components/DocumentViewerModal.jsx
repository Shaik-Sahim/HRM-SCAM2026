import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Mail, 
  CheckCircle, 
  FileText, 
  Copy,
  Layers,
  BadgeCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  MargeyHeader, 
  MargeyFooter, 
  MargeyStamp,
  MargeySignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';
import { calculateTenure, formatOrdinalDate } from '../utils/dateUtils';

function numberToWords(amount) {
  if (!amount || isNaN(amount)) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function convertTwoDigits(num) {
    if (num < 20) return ones[num];
    const unit = num % 10;
    return tens[Math.floor(num / 10)] + (unit ? ' ' + ones[unit] : '');
  }
  function convertThreeDigits(num) {
    let result = '';
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    if (hundred > 0) result += ones[hundred] + ' Hundred';
    if (rest > 0) {
      if (hundred > 0) result += ' and ';
      result += convertTwoDigits(rest);
    }
    return result;
  }
  let remaining = Math.floor(Math.abs(amount));
  let parts = [];
  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundreds = remaining;
  if (crores > 0) parts.push(convertThreeDigits(crores) + ' Crore');
  if (lakhs > 0) parts.push(convertTwoDigits(lakhs) + ' Lakh');
  if (thousands > 0) parts.push(convertTwoDigits(thousands) + ' Thousand');
  if (hundreds > 0) parts.push(convertThreeDigits(hundreds));
  return (parts.join(' ') || 'Zero') + ' Rupees Only';
}

export default function DocumentViewerModal({ document, company, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullAnnexure, setShowFullAnnexure] = useState(true); // Full 6-page package vs 2-page brief
  const [includeStamp, setIncludeStamp] = useState(Boolean(document?.includeStamp));
  const printRef = useRef(null);

  useEffect(() => {
    setIncludeStamp(Boolean(document?.includeStamp));
  }, [document]);

  if (!document) return null;

  const employeeSignature = document.employeeSignature || document.candidateSignature || document.candidate?.signature || document.employee?.signature || null;
  const candidateName = document.candidate?.fullName || document.employee?.fullName || 'Ms. Batta Vyshnavi';
  const candidateAddress = document.candidate?.address || 'Papireddypalem,\nT.P. Gudur Mandal, Nellore District,\nAndhra Pradesh';
  const designation = document.employment?.designation || document.employee?.designation || 'HR Executive';
  const department = document.employment?.department || document.employee?.department || 'Human Resources';

  const rawIssueDate = document.issueDate || document.printingDate || new Date().toISOString().slice(0, 10);
  const formattedIssueDate = (document.formattedIssueDate && document.formattedIssueDate !== '27TH Oct 2025' && document.formattedIssueDate !== '27th Oct, 2025')
    ? document.formattedIssueDate
    : formatOrdinalDate(rawIssueDate);

  const rawJoiningDate = document.employment?.joiningDate || document.employment?.expectedJoiningDate || '2026-11-15';
  const joiningDate = (document.employment?.formattedJoiningDate && document.employment?.formattedJoiningDate !== '12th Nov 2025')
    ? document.employment.formattedJoiningDate
    : formatOrdinalDate(rawJoiningDate);

  const workLocation = document.employment?.workLocation || 'Bengaluru';
  const noticePeriod = document.employment?.noticePeriodDays ? `${document.employment.noticePeriodDays} days` : '[insert period]';

  // Strict dynamic CTC computation matching whatever the user input
  const rawCTC = Math.max(0, Number(document.compensation?.annualCTC) || 600000);
  const ctcFormatted = rawCTC.toLocaleString('en-IN');
  const monthlyGrossNum = Math.round(rawCTC / 12);
  const monthlyCTCEquivalent = monthlyGrossNum.toLocaleString('en-IN');
  const ctcWords = numberToWords(rawCTC);

  // Exact salary structure decomposition with Deferred Benefits & Net Monthly In-Hand
  // 1. Basic Pay: 50% of CTC
  let annualBasic = Math.round(rawCTC * 0.50);
  let monthlyBasic = Math.round(annualBasic / 12);

  // 2. Deferred Benefits (Annualised)
  // Provident Fund (As per the PF Act 1952) - 12% of Basic Pay
  const annualPF = Math.round(annualBasic * 0.12);
  const monthlyPF = Math.round(annualPF / 12);

  // Gratuity (As per the Gratuity Act 1972) - 4.81% of Basic Pay (15/26 days per year of service)
  const annualGratuity = Math.round(annualBasic * 0.0481);
  const monthlyGratuity = Math.round(annualGratuity / 12);

  const annualDeferred = annualPF + annualGratuity;
  const monthlyDeferred = monthlyPF + monthlyGratuity;

  // 3. Gross Annual Salary (by deducting Deferred Benefits from Total Annual CTC)
  const annualGross = Math.max(0, rawCTC - annualDeferred);
  const monthlyGross = Math.round(annualGross / 12);

  // 4. House Rent Allowance (HRA - 40% of Basic Pay)
  let annualHRA = Math.round(annualBasic * 0.40);
  let monthlyHRA = Math.round(annualHRA / 12);

  // 5. Fixed Allowances
  let annualTravel = rawCTC >= 150000 ? 24000 : 0;
  let monthlyTravel = Math.round(annualTravel / 12);

  let annualMedical = rawCTC >= 150000 ? 18000 : 0;
  let monthlyMedical = Math.round(annualMedical / 12);

  let annualInternet = rawCTC >= 200000 ? 18000 : 0;
  let monthlyInternet = Math.round(annualInternet / 12);

  let annualFood = rawCTC >= 200000 ? 24000 : 0;
  let monthlyFood = Math.round(annualFood / 12);

  let fixedAnnualSum = annualBasic + annualHRA + annualTravel + annualMedical + annualInternet + annualFood;
  if (fixedAnnualSum > annualGross) {
    annualBasic = Math.round(annualGross * 0.50);
    monthlyBasic = Math.round(annualBasic / 12);
    annualHRA = Math.round(annualBasic * 0.40);
    monthlyHRA = Math.round(annualHRA / 12);
    annualTravel = Math.min(24000, Math.round(annualGross * 0.06));
    monthlyTravel = Math.round(annualTravel / 12);
    annualMedical = Math.min(18000, Math.round(annualGross * 0.04));
    monthlyMedical = Math.round(annualMedical / 12);
    annualInternet = Math.min(18000, Math.round(annualGross * 0.04));
    monthlyInternet = Math.round(annualInternet / 12);
    annualFood = Math.min(24000, Math.round(annualGross * 0.06));
    monthlyFood = Math.round(annualFood / 12);
    fixedAnnualSum = annualBasic + annualHRA + annualTravel + annualMedical + annualInternet + annualFood;
  }

  // 6. Special Allowance: exact balancing figure to equal Gross Salary
  const annualSpecial = Math.max(0, annualGross - fixedAnnualSum);
  const fixedMonthlySum = monthlyBasic + monthlyHRA + monthlyTravel + monthlyMedical + monthlyInternet + monthlyFood;
  const monthlySpecial = Math.max(0, monthlyGross - fixedMonthlySum);

  // 7. Statutory Employee Deductions & Net Monthly In-Hand
  const monthlyPT = monthlyGross > 15000 ? 200 : (monthlyGross > 10000 ? 150 : 0);
  const annualPT = monthlyPT * 12;
  const monthlyDeductions = monthlyPF + monthlyPT;
  const annualDeductions = annualPF + annualPT;

  const monthlyInHand = Math.max(0, monthlyGross - monthlyDeductions);
  const annualInHand = Math.max(0, annualGross - annualDeductions);

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
              <>
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

                <button
                  type="button"
                  onClick={() => setIncludeStamp(!includeStamp)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    includeStamp 
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  title={includeStamp ? 'Stamp is enabled. Click to toggle OFF (signature only).' : 'Stamp is disabled. Click to toggle ON.'}
                >
                  <BadgeCheck className={`w-3.5 h-3.5 ${includeStamp ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>Company Stamp: <strong className={includeStamp ? 'text-blue-200 font-bold' : 'text-slate-400'}>{includeStamp ? 'ON' : 'OFF'}</strong></span>
                </button>
              </>
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
          <div ref={printRef} className="printable-area w-full max-w-3xl font-sans space-y-6">
            
            {/* ============================================================== */}
            {/* TEMPLATE TYPE 1: MARGEY LABS OFFICIAL OFFER LETTER PACKAGE      */}
            {/* ============================================================== */}
            {document.type === 'offer' && (
              <>
                {/* PAGE 1: Main Letter of Offer */}
                <div
                  className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                  style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
                >
                  <div className="flex-1 flex flex-col justify-between pb-1">
                    <div>
                      <MargeyHeader
                        refId={document.id}
                        dateStr={null}
                        isConfidential={false}
                      />

                      {/* Date & Addressee */}
                      <div className="text-[11px] leading-snug text-slate-900 font-sans mb-1.5">
                        <p className="font-semibold">Date: {formattedIssueDate},</p>
                        <div className="mt-0.5 font-sans">
                          <p className="font-semibold">To,</p>
                          <p className="font-bold text-slate-900 text-[11.5px]">{candidateName}</p>
                          {candidateAddress.split('\n').map((line, idx) => (
                            <p key={idx} className="text-slate-700 text-[10px]">{line}</p>
                          ))}
                        </div>
                      </div>

                      {/* Centered Heading */}
                      <div className="text-center my-1.5">
                        <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-sans">
                          LETTER OF OFFER
                        </h2>
                        <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                          Subject: Offer of Employment – {designation}
                        </p>
                      </div>

                      {/* Salutation & Body Text */}
                      <div className="space-y-1.5 text-[10.5px] leading-[1.44] text-slate-800 font-sans text-justify">
                        <p className="font-bold text-slate-900 text-[11px]">
                          Dear {candidateName},
                        </p>

                        <p>
                          We are pleased to offer you employment with <strong>MARGEY LABS PRIVATE LIMITED</strong> as {designation} in the {department} Department. This letter summarizes your principal employment terms. Comprehensive details regarding compensation, responsibilities, guidelines, and benefits are outlined in the attached Annexures I through V.
                        </p>

                        {/* Section 1: Position and Employment Details Table */}
                        <div>
                          <p className="font-bold text-slate-900 text-[11px] mb-1">1. Position and Employment Details</p>
                          <table className="w-full text-[10px] border border-slate-400">
                            <tbody className="divide-y divide-slate-300">
                              <tr>
                                <td className="p-1 px-3 font-semibold text-slate-700 w-1/3 bg-slate-50 border-r border-slate-300">Job Title</td>
                                <td className="p-1 px-3 font-bold text-slate-900">{designation}</td>
                              </tr>
                              <tr>
                                <td className="p-1 px-3 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Department</td>
                                <td className="p-1 px-3 text-slate-800">{department}</td>
                              </tr>
                              <tr>
                                <td className="p-1 px-3 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Annual CTC</td>
                                <td className="p-1 px-3 font-sans font-bold text-slate-900">₹{ctcFormatted} ({ctcWords})</td>
                              </tr>
                              <tr>
                                <td className="p-1 px-3 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Expected Joining Date</td>
                                <td className="p-1 px-3 text-slate-800 font-semibold">{joiningDate}</td>
                              </tr>
                              <tr>
                                <td className="p-1 px-3 font-semibold text-slate-700 bg-slate-50 border-r border-slate-300">Work Location</td>
                                <td className="p-1 px-3 text-slate-800">{workLocation}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Section 2: Compensation and Payroll */}
                        <div>
                          <p className="font-bold text-slate-900 text-[11px] mb-0.5">2. Compensation and Payroll</p>
                          <p>
                            Your annual Cost to Company (CTC) will be ₹{ctcFormatted} (Monthly equivalent: ₹{monthlyCTCEquivalent}). Deducting annualised Deferred Benefits (Provident Fund under the PF Act 1952 and Gratuity under the Gratuity Act 1972) yields an Annual Gross Salary of ₹{annualGross.toLocaleString('en-IN')}, and an estimated net Monthly In-Hand of ₹{monthlyInHand.toLocaleString('en-IN')} after statutory withholdings. Complete itemized breakdown is provided in Annexure I.
                          </p>
                        </div>

                        {/* Section 3: Conditions and Annexures */}
                        <div>
                          <p className="font-bold text-slate-900 text-[11px] mb-0.5">3. Terms, Code of Conduct & Annexures</p>
                          <p>
                            This offer is subject to satisfactory verification of credentials and completion of joining formalities. Your role deliverables, operational responsibilities, company policies, and service terms are detailed in Annexures II, III, and IV. Please review all terms thoroughly before signing the acceptance undertaking in Annexure V.
                          </p>
                        </div>

                        <p className="pt-0.5">
                          We look forward to welcoming you to <strong>MARGEY LABS PRIVATE LIMITED</strong> and wish you grand success and professional growth in your career with us.
                        </p>
                      </div>
                    </div>

                    {/* Closing Signatures with Authorized Signatory & Optional Stamp */}
                    <div className="mt-2 text-slate-900 font-sans">
                      <p className="text-[10.5px] font-medium text-slate-800">Yours Sincerely,</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">For MARGEY LABS PRIVATE LIMITED</p>
                      <div className={`${includeStamp ? 'h-18' : 'h-11'} flex items-end pb-1`}>
                        <MargeyStamp size={includeStamp ? 76 : 42} showStamp={includeStamp} />
                      </div>
                      <div className="border-t border-slate-500 w-56 pt-1">
                        <p className="font-bold text-slate-900 text-[10.5px] leading-tight">Authorized Signatory</p>
                        <p className="font-medium text-slate-600 text-[9.5px] leading-tight mt-0.5">Human Resources Department</p>
                      </div>
                    </div>
                  </div>

                  <MargeyFooter />
                </div>

                {/* PAGE 2: ANNEXURE – I: Compensation & Salary Structure */}
                <div
                  className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                  style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
                >
                  <div>
                    <MargeyHeader
                      refId={document.id}
                      dateStr={null}
                      isConfidential={false}
                    />

                    <div className="text-center my-2">
                      <h2 className="text-base font-bold text-slate-900 tracking-wider uppercase font-sans">
                        ANNEXURE – I
                      </h2>
                      <p className="text-[12px] font-bold text-slate-900 uppercase">
                        COMPENSATION AND SALARY STRUCTURE
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-300 p-2 text-[10.5px] font-sans mb-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <p><strong>Employee:</strong> {candidateName}</p>
                        <p><strong>Designation:</strong> {designation}</p>
                        <p><strong>Total Annual CTC:</strong> ₹{ctcFormatted}</p>
                        <p><strong>Gross Annual Salary:</strong> ₹{annualGross.toLocaleString('en-IN')}</p>
                        <p><strong>Monthly CTC Equivalent:</strong> ₹{monthlyCTCEquivalent}</p>
                        <p className="text-emerald-800 font-bold"><strong>Estimated Monthly In-Hand:</strong> ₹{monthlyInHand.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-700 italic mb-2 text-justify">
                      The schedule below outlines the structured compensation breakdown including Cash Components, annualised Deferred Benefits (Provident Fund & Gratuity), and estimated Net Monthly In-Hand salary.
                    </p>

                    {/* Compensation Breakup Table */}
                    <div className="border border-slate-400 text-[9.5px] mb-2">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-200 text-slate-900 uppercase text-[9px] font-bold border-b border-slate-400">
                            <th className="p-1.5 text-left border-r border-slate-300 w-1/2">SALARY COMPONENTS</th>
                            <th className="p-1.5 text-right border-r border-slate-300 w-1/4">Per Month (₹)</th>
                            <th className="p-1.5 text-right w-1/4">Per Annum (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 font-sans">
                          {/* PART A: EARNINGS / CASH COMPONENTS */}
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan="3" className="p-1.5 font-bold uppercase tracking-wide text-[9px] bg-slate-100 text-slate-800 border-b border-slate-300">
                              PART A: EARNINGS / CASH COMPONENTS (ANNUAL SALARY)
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Basic Pay (50%)</td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyBasic.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualBasic.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">House Rent Allowance (HRA - 40% Basic)</td>
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
                          <tr className="bg-slate-100 font-bold border-t border-b border-slate-400">
                            <td className="p-1.5 font-bold text-slate-900 border-r border-slate-300">Total Gross Salary / Annual Salary (A)</td>
                            <td className="p-1.5 text-right border-r border-slate-300 font-bold">{monthlyGross.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right font-bold">{annualGross.toLocaleString('en-IN')}</td>
                          </tr>

                          {/* PART B: DEFERRED BENEFITS */}
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan="3" className="p-1.5 font-bold uppercase tracking-wide text-[9px] bg-slate-100 text-slate-800 border-b border-slate-300">
                              PART B: DEFERRED BENEFITS (ANNUALISED) / RETIRALS
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">
                              Provident Fund (As per the PF Act 1952)
                            </td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyPF.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualPF.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">
                              Gratuity (As per the Gratuity Act 1972)
                            </td>
                            <td className="p-1.5 text-right border-r border-slate-300">{monthlyGratuity.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">{annualGratuity.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold border-t border-b border-slate-400">
                            <td className="p-1.5 font-bold text-slate-900 border-r border-slate-300">Total Deferred Benefits (B)</td>
                            <td className="p-1.5 text-right border-r border-slate-300 font-bold">{monthlyDeferred.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right font-bold">{annualDeferred.toLocaleString('en-IN')}</td>
                          </tr>

                          {/* TOTAL COST TO COMPANY */}
                          <tr className="bg-blue-50/80 font-bold border-t-2 border-b-2 border-slate-500">
                            <td className="p-1.5 font-bold text-slate-900 border-r border-slate-300">TOTAL COST TO COMPANY (CTC) (A + B)</td>
                            <td className="p-1.5 text-right border-r border-slate-300 font-bold text-slate-900">{monthlyGrossNum.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{rawCTC.toLocaleString('en-IN')}</td>
                          </tr>

                          {/* PART C: STATUTORY DEDUCTIONS */}
                          <tr className="bg-slate-100 font-bold text-slate-900">
                            <td colSpan="3" className="p-1.5 font-bold uppercase tracking-wide text-[9px] bg-slate-100 text-slate-800 border-b border-slate-300">
                              PART C: STATUTORY DEDUCTIONS & MONTHLY IN-HAND
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">
                              Employee Provident Fund (PF - 12% of Basic)
                            </td>
                            <td className="p-1.5 text-right border-r border-slate-300">(-) {monthlyPF.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">(-) {annualPF.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">
                              Professional Tax (PT)
                            </td>
                            <td className="p-1.5 text-right border-r border-slate-300">(-) {monthlyPT.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right">(-) {annualPT.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr className="bg-emerald-50/90 font-bold border-t border-slate-400">
                            <td className="p-1.5 font-bold text-emerald-950 border-r border-slate-300">
                              NET TAKE-HOME SALARY (MONTHLY IN-HAND) [A - C]
                            </td>
                            <td className="p-1.5 text-right border-r border-slate-300 font-bold text-emerald-900">{monthlyInHand.toLocaleString('en-IN')}</td>
                            <td className="p-1.5 text-right font-bold text-emerald-900">{annualInHand.toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Explanatory Compensation Notes */}
                    <div className="space-y-1 text-[9.5px] text-slate-700 leading-snug text-justify mb-2">
                      <p>
                        * <strong>Deferred Benefits:</strong> Provident Fund is computed under the Employees' Provident Funds and Miscellaneous Provisions Act, 1952. Gratuity accrual is calculated pursuant to the Payment of Gratuity Act, 1972, payable after qualifying continuous service. Deducting these deferred benefits yields your Annual Gross Salary.
                      </p>
                      <p>
                        * <strong>Net Monthly In-Hand:</strong> Reflects estimated monthly take-home pay after statutory Employee PF and Professional Tax. Income Tax (TDS) withholdings will be deducted based on applicable tax slabs and declared investment exemptions.
                      </p>
                    </div>

                    {/* Dual Signatory Block */}
                    <div className="pt-2 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px] font-sans">
                      {/* Left: Employer */}
                      <div className="w-56 text-left">
                        <p className="font-bold text-slate-900 text-[11px] leading-tight">For MARGEY LABS PRIVATE LIMITED</p>
                        <div className={`${includeStamp ? 'h-20' : 'h-12'} flex items-end pb-1`}>
                          <MargeyStamp size={includeStamp ? 78 : 44} showStamp={includeStamp} />
                        </div>
                        <div className="border-t border-slate-500 w-full pt-1">
                          <p className="font-bold text-slate-900 text-[10.5px] leading-tight">Authorized Signatory</p>
                          <p className="font-medium text-slate-600 text-[10px] leading-tight mt-0.5">Human Resources Department</p>
                        </div>
                      </div>

                      {/* Right: Employee */}
                      <div className="w-56 ml-auto text-left">
                        <p className="font-bold text-slate-900 text-[11px] leading-tight">Employee Signature</p>
                        <div className={`${includeStamp ? 'h-20' : 'h-12'} flex items-end pb-1`}>
                          {employeeSignature ? (
                            <img 
                              src={employeeSignature} 
                              alt="Employee Signature" 
                              className="h-11 w-auto max-w-[180px] object-contain object-bottom block" 
                            />
                          ) : (
                            <div className="h-11" />
                          )}
                        </div>
                        <div className="border-t border-slate-500 w-full pt-1">
                          <p className="font-bold text-slate-900 text-[10.5px] leading-tight">{candidateName}</p>
                          <p className="font-medium text-slate-600 text-[10px] leading-tight mt-0.5">Candidate</p>
                        </div>
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
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={null}
                          isConfidential={false}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-base font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – II
                          </h2>
                          <p className="text-[12px] font-bold text-slate-900 uppercase">
                            {designation.toUpperCase()} ROLE PROFILE
                          </p>
                        </div>

                        <div className="space-y-3 text-[10.5px] leading-[1.48] text-slate-800 font-sans text-justify mt-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Purpose of the Role</h3>
                            <p>
                              To drive excellence, operational efficiency, and cross-functional support within the organization, maintaining accurate documentation, upholding professional standards, and ensuring full alignment with company strategic objectives and standard operating procedures (SOPs).
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Principal Responsibilities & Deliverables</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700">
                              <li>Execute core operational duties and strategic assignments associated with the {designation} role with high accuracy and timeliness.</li>
                              <li>Coordinate recruitment, onboarding workflows, candidate pipeline tracking, and employee personnel file maintenance.</li>
                              <li>Administer Human Resource Information Systems (HRIS), daily attendance, leave approvals, and shift rosters in compliance with company guidelines.</li>
                              <li>Liaise closely with accounts and payroll divisions to guarantee flawless attendance inputs and timely resolution of employee queries.</li>
                              <li>Serve as an approachable point of contact for employee grievances, workplace procedures, and policy clarifications.</li>
                              <li>Drive employee engagement programs, professional learning & development (L&D) initiatives, and performance appraisal administration.</li>
                              <li>Prepare, analyze, and present weekly/monthly operational trackers, audit reports, and departmental metrics for leadership review.</li>
                              <li>Ensure strict adherence to statutory labor guidelines, workplace safety norms, and Prevention of Sexual Harassment (POSH) protocols.</li>
                              <li>Uphold the highest degree of confidentiality and data security regarding employee, candidate, financial, and client proprietary records.</li>
                              <li>Participate proactively in cross-functional task forces, quality audits, and operational scaling initiatives across business units.</li>
                              <li>Oversee third-party vendor management, credential checks, and background verification (BGV) validation workflows.</li>
                              <li>Maintain and continuously update standard operating procedures, checklists, and internal documentation templates.</li>
                              <li>Facilitate smooth separation formalities, asset surrender tracking, knowledge transfer sessions, and no-dues signoffs.</li>
                              <li>Perform any other reasonable responsibilities and strategic initiatives assigned by senior leadership and departmental heads.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Key Performance Indicators & Evaluation Standards</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700">
                              <li><strong>Execution Quality & SLA Adherence:</strong> Timely completion of operational tasks and adherence to quality benchmarks.</li>
                              <li><strong>Information Security & Integrity:</strong> Zero non-compliance incidents regarding data privacy, confidentiality, and company code of conduct.</li>
                              <li><strong>Collaboration & Stakeholder Ownership:</strong> Positive feedback from cross-functional peers, management, and internal customers.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Core Behavioral Competencies & Organizational Values</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700">
                              <li><strong>Integrity & Professional Governance:</strong> Unwavering commitment to truthfulness, regulatory compliance, and ethical business conduct.</li>
                              <li><strong>Analytical Problem Solving:</strong> Demonstrating critical thinking, proactive root-cause analysis, and pragmatic solution design.</li>
                              <li><strong>Cross-Functional Collaboration:</strong> Open, transparent communication and cooperative teamwork across diverse technical and business functions.</li>
                              <li><strong>Agile Delivery & Accountability:</strong> High ownership of deliverables with disciplined adherence to organizational milestones and enterprise quality standards.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">Professional Growth, Upskilling & Career Development</h3>
                            <p>
                              MARGEY LABS PRIVATE LIMITED encourages continuous learning, sponsored professional development certifications, hands-on architectural workshops, and quarterly structured leadership reviews to actively nurture your long-term career growth.
                            </p>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>

                    {/* PAGE 4: ANNEXURE – III: Company Policies and Working Conditions */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={null}
                          isConfidential={false}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-base font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – III
                          </h2>
                          <p className="text-[12px] font-bold text-slate-900 uppercase">
                            COMPANY POLICIES AND WORKING CONDITIONS
                          </p>
                        </div>

                        <div className="space-y-2.5 text-[10.5px] leading-[1.46] text-slate-800 font-sans text-justify mt-2">
                          <p className="italic text-slate-600 text-[10px]">
                            All employees of MARGEY LABS PRIVATE LIMITED are required to read, understand, and comply with the adopted policies and organizational guidelines outlined below.
                          </p>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">1. Adopted Corporate Policies & Governance</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Code of Conduct & Professional Ethics:</strong> Maintaining honesty, decorum, mutual respect, and ethical standards across all interactions.</li>
                              <li><strong>Working Hours & Hybrid Model:</strong> Standard 9-hour work schedule including meal intervals, with flexibility governed by business needs.</li>
                              <li><strong>Attendance & Leave Administration:</strong> Strict compliance with biometric/virtual attendance logs and pre-approved leave workflows.</li>
                              <li><strong>POSH & Zero Tolerance:</strong> Strict adherence to the Prevention of Sexual Harassment Act with direct access to the Internal Committee (IC).</li>
                              <li><strong>IT & Information Security:</strong> Mandatory use of authorized computing hardware, VPN access, and strict multi-factor authentication.</li>
                              <li><strong>Conflict of Interest & External Work:</strong> Full-time commitment to Margey Labs; engaging in secondary employment is strictly prohibited.</li>
                              <li><strong>Grievance Redressal Mechanism:</strong> Clear escalation channels for resolving professional disputes equitably and promptly.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">2. Financial & Statutory Benefits</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Employee Provident Fund (EPF):</strong> Statutory employer and employee contributions deposited under the EPF & MP Act, 1952.</li>
                              <li><strong>Gratuity:</strong> Gratuity benefits payable upon completion of qualifying continuous service as per Payment of Gratuity Act, 1972.</li>
                              <li><strong>Annual Performance Incentive:</strong> Merit-based performance awards evaluated during the annual organizational review cycle.</li>
                              <li><strong>Festival Rewards & Allowances:</strong> Discretionary festive bonuses and welfare disbursements as declared by executive leadership.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">3. Health, Wellness & Medical Support</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Group Medical Insurance (GMI):</strong> Comprehensive hospitalization coverage extended to the employee and eligible immediate dependents.</li>
                              <li><strong>Group Personal Accident (GPA):</strong> Financial protection against accidental injuries or disability arising during employment.</li>
                              <li><strong>Maternity & Parental Care:</strong> Fully compliant statutory maternity leave and paid benefits under the Maternity Benefit Act, 1961.</li>
                              <li><strong>Preventive Healthcare:</strong> Annual health check-up camps, mental wellbeing counseling, and ergonomic workplace assistance.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">4. Transportation, Travel & Welfare Support</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Cab Transportation Facility:</strong> Safe cab pick-and-drop arrangements provided for late-evening shifts, early rosters, and official travel.</li>
                              <li><strong>Business Travel & Daily Allowance (DA):</strong> Reimbursable lodging, boarding, and travel expenses as per corporate travel slabs.</li>
                              <li><strong>Telecommunication & Home Office:</strong> Internet and communication expense subsidies provided to support authorized hybrid working.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">5. Leave Architecture & Public Holidays</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Privilege / Annual Leave (PL):</strong> Accrued at 1.5 days per completed calendar month; eligible for annual rollover as defined in the HR Manual.</li>
                              <li><strong>Casual & Sick Leaves (CL/SL):</strong> Twelve (12) days provided annually for incidental contingencies and health recuperation.</li>
                              <li><strong>National & Festival Holidays:</strong> Ten (10) public holidays observed annually per the published Margey Labs holiday calendar.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">6. Workplace Safety, Health & Environmental Compliance</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li><strong>Ergonomics & Physical Wellbeing:</strong> Optimized workstations, ambient climate controls, and ergonomic seating provided at all corporate facilities.</li>
                              <li><strong>Emergency Readiness:</strong> Periodic fire drills, readily available first-aid facilities, and 24x7 emergency security helplines.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>

                    {/* PAGE 5: ANNEXURE – IV: Confidentiality and Data Protection */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={null}
                          isConfidential={false}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-base font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – IV
                          </h2>
                          <p className="text-[12px] font-bold text-slate-900 uppercase">
                            CONFIDENTIALITY, INTELLECTUAL PROPERTY & DATA PROTECTION
                          </p>
                        </div>

                        <div className="space-y-2.5 text-[10.5px] leading-[1.46] text-slate-800 font-sans text-justify mt-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">1. Scope of Confidential & Proprietary Information</h3>
                            <p>
                              Confidential information includes, without limitation, non-public employee records, compensation schedules, candidate pipelines, technical source code, architectural schematics, client portfolios, proprietary algorithms, financial metrics, pricing models, research findings, and internal strategy documentation of MARGEY LABS PRIVATE LIMITED and its business affiliates.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">2. Mandatory Security Protocols & Safeguards</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li>Access, view, and process confidential data strictly on a need-to-know basis solely for authorized corporate duties.</li>
                              <li>Do not photocopy, photograph, download, export, reverse engineer, or transmit proprietary records without documented management approval.</li>
                              <li>Use only company-issued hardware, secure corporate cloud repositories, and official email; personal email and external drives are prohibited.</li>
                              <li>Enforce strict password hygiene, multi-factor authentication (MFA), and locking workstations when unattended.</li>
                              <li>Promptly notify the Information Security officer of any phishing attempts, accidental data leaks, or unauthorized system access.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">3. Intellectual Property Rights & Work-for-Hire Assignment</h3>
                            <p>
                              All intellectual property, software programs, designs, documentation, workflows, and discoveries created, authored, or conceived by you during employment belong exclusively, irrevocably, and perpetually to Margey Labs Pvt Ltd under the doctrine of work-for-hire.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">4. Non-Solicitation & Non-Compete Undertaking</h3>
                            <p>
                              During employment and for twelve (12) months following separation, you shall not, directly or indirectly, solicit, divert, entice away, or recruit any client, vendor, partner, contractor, or employee of the Company to terminate or diminish their business relationship.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">5. Return of Corporate Assets & Post-Employment Obligations</h3>
                            <p>
                              Upon cessation of employment or demand, you must immediately return all company-owned laptops, storage media, software licenses, ID credentials, access cards, and files. Non-disclosure covenants remain permanently binding following separation.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">6. Acceptable Use of IT Infrastructure & Cloud Platforms</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                              <li>Corporate networks, email domains, and cloud environments must be used solely for authorized commercial purposes.</li>
                              <li>Installation of unapproved third-party software, shadow IT applications, or peer-to-peer file sharing utilities is strictly barred.</li>
                              <li>All corporate data at rest and in transit must remain encrypted in compliance with enterprise security baselines.</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[11.5px] mb-1">7. Public Communications, Social Media & Non-Disclosure Survival</h3>
                            <p>
                              You shall not post, publish, or discuss confidential organizational processes, customer accounts, internal codebases, or proprietary designs on public social media forums or blogs. All non-disclosure and intellectual property assignment covenants set forth in this Annexure survive the cessation of your employment indefinitely.
                            </p>
                          </div>
                        </div>
                      </div>

                      <MargeyFooter />
                    </div>

                    {/* PAGE 6: ANNEXURE – V: Employment Terms and Conditions & Acceptance */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
                    >
                      <div>
                        <MargeyHeader
                          refId={document.id}
                          dateStr={null}
                          isConfidential={false}
                        />

                        <div className="text-center my-2">
                          <h2 className="text-base font-bold text-slate-900 tracking-wider uppercase font-sans">
                            ANNEXURE – V
                          </h2>
                          <p className="text-[12px] font-bold text-slate-900 uppercase">
                            EMPLOYMENT TERMS AND CONDITIONS
                          </p>
                        </div>

                        <div className="space-y-1.5 text-[10px] leading-[1.42] text-slate-800 font-sans text-justify mt-1">
                          <p><strong>1. Commencement:</strong> Employment formally commences on the joining date confirmed in writing after full completion of onboarding verification.</p>
                          <p><strong>2. Terms of Appointment:</strong> Employment is subject to continuous satisfactory performance and compliance with all company standards, operating procedures, and policies.</p>
                          <p><strong>3. Working Hours & Rostering:</strong> Normal working hours follow the company operational schedule and roster, including applicable meal and rest breaks.</p>
                          <p><strong>4. Salary & Statutory Withholdings:</strong> Monthly remuneration is disbursed through direct bank transfer per the payroll calendar, subject to statutory deductions (EPF, PT, TDS).</p>
                          <p><strong>5. Attendance & Approved Leaves:</strong> Absence without approved leave is considered unauthorized. Leave entitlements are governed by the company leave policy.</p>
                          <p><strong>6. Notice Period & Voluntary Resignation:</strong> The required notice period for separation is {noticePeriod}, or equivalent gross salary in lieu thereof with mutual management consent.</p>
                          <p><strong>7. Professional Conduct & Ethics:</strong> You must comply with all company rules, maintain professional decorum, and avoid any activities adverse to the company's reputational or commercial interests.</p>
                          <p><strong>8. Pre-Employment Verification (BGV):</strong> This offer is contingent upon satisfactory verification of academic degrees, previous employment records, and background checks.</p>
                          <p><strong>9. Summary Dismissal:</strong> The Company reserves the right to terminate employment immediately without notice in cases of fraud, gross misconduct, insubordination, or material breach of trust.</p>
                          <p><strong>10. Separation Clearance & Asset Surrender:</strong> Full & Final (FnF) clearance is conditional upon surrendering all company assets, hardware, keys, and security credentials.</p>
                          <p><strong>11. Governing Law & Jurisdiction:</strong> All employment terms and disputes shall be governed by the laws of India, subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.</p>
                          <p><strong>12. Non-Disparagement & Good Faith:</strong> Neither during nor following separation shall you disparage, defame, or make derogatory statements regarding the Company, its directors, or its clients.</p>
                          <p><strong>13. Exclusivity & Outside Commercial Interests:</strong> Employment is full-time and exclusive. Engaging in secondary employment, consulting, or moonlighting without documented board approval is strictly prohibited.</p>
                          <p><strong>14. Dispute Resolution & Arbitration:</strong> In case of unresolved disputes, the matter shall be referred to binding arbitration conducted in Bengaluru in accordance with the Arbitration and Conciliation Act, 1996.</p>
                          <p><strong>15. Entire Agreement & Severability:</strong> This Offer Letter, together with Annexures I through V, constitutes the entire agreement between the parties, superseding all prior oral or written representations.</p>
                        </div>

                        {/* Candidate Acceptance Box with Signatures & Optional Stamp */}
                        <div className="mt-3 p-3.5 border border-slate-400 bg-slate-50 text-[10px] space-y-2">
                          <p className="font-semibold text-slate-900 leading-relaxed">
                            I have read, understood, and hereby unconditionally accept the offer of employment and agree to abide by all the terms, conditions, and policies set forth in this Letter of Offer and Annexures I through V.
                          </p>
                          <div className="pt-2 grid grid-cols-2 gap-8 font-sans">
                            {/* Left: Employer */}
                            <div className="w-56 text-left">
                              <p className="font-bold text-slate-900 text-[10.5px] leading-tight">For MARGEY LABS PRIVATE LIMITED</p>
                              <div className={`${includeStamp ? 'h-20' : 'h-12'} flex items-end pb-1`}>
                                <MargeyStamp size={includeStamp ? 78 : 44} showStamp={includeStamp} />
                              </div>
                              <div className="border-t border-slate-500 w-full pt-1">
                                <p className="font-bold text-slate-900 text-[10.5px] leading-tight">Authorized Signatory</p>
                                <p className="font-medium text-slate-600 text-[9.5px] leading-tight mt-0.5">Human Resources Department</p>
                              </div>
                            </div>

                            {/* Right: Candidate */}
                            <div className="w-56 ml-auto text-left">
                              <p className="font-bold text-slate-900 text-[10.5px] leading-tight">Candidate Acceptance Signature</p>
                              <div className={`${includeStamp ? 'h-20' : 'h-12'} flex items-end pb-1`}>
                                {employeeSignature ? (
                                  <img 
                                    src={employeeSignature} 
                                    alt="Candidate Signature" 
                                    className="h-11 w-auto max-w-[180px] object-contain object-bottom block" 
                                  />
                                ) : (
                                  <div className="h-11" />
                                )}
                              </div>
                              <div className="border-t border-slate-500 w-full pt-1">
                                <p className="font-bold text-slate-900 text-[10px] leading-tight">Candidate: {candidateName}</p>
                                <p className="text-slate-700 text-[9.5px] leading-tight mt-0.5">Place: Bengaluru</p>
                              </div>
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
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
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
                    <MargeySignatoryBlock align="left" stampSize={85} showStamp={includeStamp} />
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
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '295.5mm', height: '295.5mm' }}
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
                    <MargeySignatoryBlock align="left" stampSize={85} showStamp={includeStamp} />
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
