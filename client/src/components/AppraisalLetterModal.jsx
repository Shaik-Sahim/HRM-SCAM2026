import React, { useRef, useState } from 'react';
import { X, Printer, Download, Award, CheckCircle2, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  ProfuseHeader, 
  ProfuseFooter, 
  ProfuseSignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';

export default function AppraisalLetterModal({ letterData, company, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const printRef = useRef(null);

  if (!letterData) return null;
  const { letter, hike } = letterData;

  const handlePrint = () => {
    if (!printRef.current) return;
    const title = `Salary Revision Letter - ${letter?.employee?.fullName || letter?.employee?.name || ''}`;
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

      const empName = letter?.employee?.fullName || letter?.employee?.name || 'Employee';
      pdf.save(`Profuse_Appraisal_${empName.replace(/\s+/g, '_')}.pdf`);
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

  const empName = letter?.employee?.fullName || letter?.employee?.name || 'Valued Team Member';
  const hikeDetails = letter?.hikeDetails || hike || {};
  const currentStruct = hikeDetails.currentStructure?.monthly;
  const revisedStruct = hikeDetails.revisedStructure?.monthly;

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
              <h3 className="text-sm font-bold text-white">Salary Revision & Appraisal Letter</h3>
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

        {/* Printable Letter Sheet (Pure Flat Clean White Paper - No Shadows, No Rounded Corners) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950">
          <div ref={printRef} className="printable-area w-full max-w-3xl font-sans">
            <div
              className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-6 sm:p-7 font-sans flex flex-col justify-between"
              style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
            >
              <div>
                <ProfuseHeader
                  refId={letter?.letterRef || letter?.id}
                  dateStr={letter?.issuedDate || `Dated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`}
                  isConfidential={true}
                />

                <div className="text-center my-2">
                  <h2 className="text-sm font-bold text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4 tracking-wide font-sans">
                    Salary Revision & Appraisal Letter
                  </h2>
                </div>

                <div className="space-y-2 text-[11px] leading-[1.38] text-slate-800 font-sans">
                  <p className="font-bold text-slate-900 text-xs">
                    Dear {empName},
                  </p>

                  <p className="font-semibold text-slate-900">
                    Huge Congratulations!
                  </p>

                  <p className="text-justify">
                    On behalf of the leadership team at <strong>Profuse Transtech Solutions Pvt Ltd</strong>, we are delighted to convey your annual performance evaluation and compensation review results for the cycle <strong>{hikeDetails.reviewPeriod || 'Annual Appraisal'}</strong>.
                  </p>

                  <p className="text-justify">
                    Your overall performance rating has been evaluated as <strong>"{hikeDetails.rating || 'Exceeds Expectations'}"</strong>. The management deeply appreciates your sustained dedication, leadership, and exemplary contributions toward our mission.
                  </p>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-0.5 font-sans">
                    <p className="font-bold text-slate-900 text-xs">Revised Compensation Summary:</p>
                    <p>• <strong>Previous Annual CTC:</strong> INR {hikeDetails.previousCTC?.toLocaleString('en-IN')}</p>
                    <p>• <strong>Revised Annual CTC:</strong> INR {hikeDetails.revisedCTC?.toLocaleString('en-IN')}</p>
                    <p>• <strong>Hike Increment:</strong> +{hikeDetails.hikePercentage}% (+INR {hikeDetails.hikeAmount?.toLocaleString('en-IN')} per annum)</p>
                    <p>• <strong>Effective Date:</strong> {hikeDetails.effectiveDate}</p>
                    {hikeDetails.arrearsPayable > 0 && (
                      <p className="text-amber-800 font-bold">• <strong>Retroactive Arrears ({hikeDetails.retroactiveMonths} months):</strong> INR {hikeDetails.arrearsPayable?.toLocaleString('en-IN')}</p>
                    )}
                  </div>

                  {/* Compensation Breakup Table */}
                  {currentStruct && revisedStruct && (
                    <div className="mt-2">
                      <p className="font-bold text-[11px] text-slate-900 mb-1">Revised Monthly Compensation Breakup (INR):</p>
                      <table className="w-full text-[10.5px] border border-slate-300">
                        <thead className="bg-slate-100 text-slate-800 uppercase text-[9.5px] font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-1.5 text-left">Salary Component</th>
                            <th className="p-1.5 text-right">Previous (/mo)</th>
                            <th className="p-1.5 text-right text-amber-700">Revised (/mo)</th>
                            <th className="p-1.5 text-right text-emerald-700">Increment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">Basic Pay</td>
                            <td className="p-1.5 text-right">{currentStruct.basic?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{revisedStruct.basic?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-emerald-700">+{(revisedStruct.basic - currentStruct.basic)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">HRA</td>
                            <td className="p-1.5 text-right">{currentStruct.hra?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{revisedStruct.hra?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-emerald-700">+{(revisedStruct.hra - currentStruct.hra)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">Conveyance Allowance</td>
                            <td className="p-1.5 text-right">{currentStruct.conveyance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{revisedStruct.conveyance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-slate-500">-</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">Medical Allowance</td>
                            <td className="p-1.5 text-right">{currentStruct.medical?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{revisedStruct.medical?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-slate-500">-</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">Network & Internet Bill</td>
                            <td className="p-1.5 text-right">{(currentStruct.networkAllowance || 1000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct.networkAllowance || 1000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-slate-500">-</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">Other Allowance</td>
                            <td className="p-1.5 text-right">{(currentStruct.otherAllowance || 1000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{(revisedStruct.otherAllowance || 1000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-slate-500">-</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-sans text-slate-800">Special Allowance</td>
                            <td className="p-1.5 text-right">{currentStruct.specialAllowance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{revisedStruct.specialAllowance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-emerald-700">+{(revisedStruct.specialAllowance - currentStruct.specialAllowance)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                            <td className="p-1.5 font-sans text-slate-900">Total Monthly Gross</td>
                            <td className="p-1.5 text-right">{currentStruct.gross?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-amber-700 font-bold">{revisedStruct.gross?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-right text-emerald-700 font-bold">+{(revisedStruct.gross - currentStruct.gross)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="text-slate-700 text-justify text-[10.5px]">
                    However, the structure of your compensation may be altered / changed from time to time based on Company's policy. All other terms and conditions of your employment agreement remain unchanged. Your salary details are strictly private and confidential and should not be disclosed or discussed with others.
                  </p>
                </div>

                <div className="mt-2">
                  <ProfuseSignatoryBlock align="left" />
                </div>
              </div>

              <ProfuseFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
