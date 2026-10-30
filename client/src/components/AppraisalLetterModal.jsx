import React, { useRef, useState } from 'react';
import { X, Printer, Download, Award, CheckCircle2, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  MargeyHeader, 
  MargeyFooter, 
  MargeySignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';

export default function AppraisalLetterModal({ letterData, company, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const printRef = useRef(null);

  if (!letterData) return null;
  const { letter, hike } = letterData;

  const empName = letter?.employee?.fullName || letter?.employee?.name || 'Employee';
  const designation = letter?.employee?.designation || 'Software Engineer';
  const employeeId = letter?.employee?.id || 'EMP001';
  const hikeDetails = letter?.hikeDetails || hike || {};
  const currentStruct = hikeDetails.currentStructure?.monthly;
  const revisedStruct = hikeDetails.revisedStructure?.monthly;

  const handlePrint = () => {
    if (!printRef.current) return;
    const title = `Hike Letter - ${empName}`;
    printDocument(printRef.current, title);
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const pageElements = printRef.current.querySelectorAll('.printable-page');
      const targetElement = pageElements.length > 0 ? pageElements[0] : printRef.current;

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

      pdf.save(`Margey_Hike_Letter_${empName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailSimulate = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const formattedDate = letter?.issuedDate || `Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden my-4 flex flex-col max-h-[96vh]">
        {/* Controls */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Official Hike Letter</h3>
              <p className="text-[11px] text-slate-400">{empName} • {letter?.letterRef || letter?.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmailSimulate}
              disabled={emailSent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {emailSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Letter
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print Letter
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letter Sheet (A4 Pure White) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950">
          <div ref={printRef} className="printable-area w-full max-w-3xl font-sans">
            <div
              className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
              style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
            >
              <div>
                <MargeyHeader
                  refId={letter?.letterRef || letter?.id}
                  dateStr={formattedDate}
                  isConfidential={true}
                />

                {/* Title */}
                <div className="text-center my-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-wider uppercase font-sans">
                    HIKE LETTER
                  </h2>
                </div>

                {/* Date & Addressee */}
                <div className="text-[11.5px] text-slate-900 font-sans mb-3 space-y-0.5">
                  <p className="font-semibold">{formattedDate}</p>
                  <div className="pt-1 leading-snug">
                    <p className="font-semibold">To,</p>
                    <p className="font-bold text-slate-900">{empName}</p>
                    <p className="text-slate-800">{designation}</p>
                    <p className="text-slate-800">Employee ID: <span className="font-mono font-semibold">{employeeId}</span></p>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-2.5">
                  <p className="text-[12px] font-bold text-slate-900">
                    Subject: Salary Revision and Appreciation for Your Contributions
                  </p>
                </div>

                {/* Body Text */}
                <div className="space-y-2 text-[11px] leading-[1.4] text-slate-800 font-sans text-justify">
                  <p className="font-semibold text-slate-900">
                    Dear {empName},
                  </p>

                  <p>
                    It gives us immense pleasure to inform you that your salary has been revised in recognition of your dedication, commitment, and exceptional contribution to the organization. Your professionalism, responsibility, and positive attitude have significantly contributed to the success of our team.
                  </p>

                  <p>
                    As a token of our appreciation, we are pleased to revise your compensation package as follows:
                  </p>

                  {/* 3-Column Earnings Table */}
                  <div className="my-2">
                    <table className="w-full text-[10.5px] border border-slate-400">
                      <thead className="bg-slate-100 text-slate-900 uppercase text-[9.5px] font-bold border-b border-slate-400">
                        <tr>
                          <th className="p-1.5 text-left border-r border-slate-300">EARNINGS</th>
                          <th className="p-1.5 text-right border-r border-slate-300">CURRENT SALARY (₹)</th>
                          <th className="p-1.5 text-right text-slate-900">REVISED SALARY (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 font-mono">
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Basic Pay</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.basic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.basic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">HRA</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.hra || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.hra || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Traveling Allowance</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.conveyance || 800).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.conveyance || 800).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Medical Allowance</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.medical || 1250).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.medical || 1250).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Internet Allowance</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.networkAllowance || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.networkAllowance || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Food Allowance</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.otherAllowance || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.otherAllowance || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium text-slate-800 border-r border-slate-300">Special Allowance</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.specialAllowance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.specialAllowance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                          <td className="p-1.5 font-sans text-slate-900 border-r border-slate-300">Gross Pay</td>
                          <td className="p-1.5 text-right border-r border-slate-300">{(currentStruct?.gross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct?.gross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p>
                    Management is pleased to effect the following changes in your terms of employment with effective from <strong>{hikeDetails.effectiveDate || '01st October 2026'}</strong>. This revision reflects our confidence in your abilities and our appreciation for the value you bring to the organization. We sincerely thank you for your hard work and dedication. We look forward to your continued growth and contribution in achieving greater milestones together.
                  </p>

                  <p>
                    All other terms and conditions of your employment shall remain unchanged.
                  </p>

                  <p>
                    Congratulations on this well-deserved salary revision. We wish you continued success in your professional journey with us.
                  </p>
                </div>

                {/* Signatory Section */}
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-slate-800">With Appreciation,</p>
                  <p className="text-[11.5px] font-bold text-slate-900 mt-0.5">For MARGEY LABS PVT LIMITED</p>
                  <div className="mt-1">
                    <MargeySignatoryBlock align="left" stampSize={85} />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <MargeyFooter />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
