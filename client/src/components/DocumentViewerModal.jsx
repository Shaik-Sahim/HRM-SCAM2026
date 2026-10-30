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
  ProfuseHeader, 
  ProfuseFooter, 
  ProfuseSignatoryBlock 
} from './ProfuseLetterhead';
import { printDocument } from '../utils/printDocument';
import { calculateTenure, formatOrdinalDate } from '../utils/dateUtils';

export default function DocumentViewerModal({ document, company, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullAnnexure, setShowFullAnnexure] = useState(true); // 7-page full package vs 2-page brief
  const printRef = useRef(null);

  if (!document) return null;

  const candidateName = document.candidate?.fullName || document.employee?.fullName || 'Doddetipalli Gowtham';
  const designation = document.employment?.designation || document.employee?.designation || 'Software Developer';
  const joiningDate = document.employment?.formattedJoiningDate || document.employment?.joiningDate || '05th Mar, 2025';
  const ctcFormatted = document.compensation?.formattedCTC || '9,40,000';
  const ctcWords = document.compensation?.inWords || 'Nine Lakh Forty Thousand only';
  const struct = document.compensation?.structure;

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
    const title = `${document.title || 'Margey Labs Document'} - ${candidateName}`;
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
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {document.title}
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
                    showFullAnnexure ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Full 7-page offer letter including complete employment terms & conditions"
                >
                  Full Package (7 Pages)
                </button>
                <button
                  onClick={() => setShowFullAnnexure(false)}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    !showFullAnnexure ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Brief 2-page offer letter with compensation breakup table"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
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

        {/* Scrollable Document Area (Pure Clean White Paper - No Shadows, No Rounded Corners) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950">
          <div ref={printRef} className="printable-area w-full max-w-3xl space-y-8 font-sans">
            {/* ==================== TEMPLATE TYPE 1: OFFER LETTER PACKAGE ==================== */}
            {document.type === 'offer' && (
              <>
                {/* PAGE 1: Formal Offer Letter & Salutation */}
                <div
                  className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                  style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                >
                  <div>
                    <ProfuseHeader
                      refId={document.id}
                      dateStr={document.formattedIssueDate || document.issueDate}
                      isConfidential={true}
                    />

                    {/* Centered Heading */}
                    <div className="text-center my-3">
                      <h2 className="text-base font-bold text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4 tracking-wide font-sans">
                        Offer Letter
                      </h2>
                    </div>

                    {/* Candidate Salutation & Content */}
                    <div className="space-y-2.5 text-[12px] leading-[1.5] text-slate-800 font-sans">
                      <p className="font-bold text-slate-900 text-[13px]">
                        Dear {candidateName},
                      </p>

                      <p className="font-bold text-slate-900">
                        Huge Congratulations!
                      </p>

                      <p>
                        We are delighted to confirm your offer of employment at <strong>Margey Labs Pvt Ltd</strong>:
                      </p>

                      <div className="space-y-1 font-sans pl-1 text-[12px]">
                        <p>
                          <strong>Designation:</strong> {designation}
                        </p>
                        <p>
                          <strong>Joining Date:</strong> {joiningDate}
                        </p>
                        <p>
                          <strong>Annual Total Compensation:</strong> INR {ctcFormatted} ({ctcWords})
                        </p>
                      </div>

                      <p className="text-slate-800">
                        However, the structure of your compensation may be altered / changed from time to time based on Company's policy.
                      </p>

                      <p className="text-slate-800 text-justify">
                        You will be in probation for {document.employment?.probationMonths || 6} months. Your employment is effective from the date of your joining and your initial posting will be at our {document.employment?.workLocation || 'Bangalore office'}. Not with standing your initial place of posting, the Company reserves the right to transfer / depute / second your service to any other division/location/department/segment/branch/unit/associated concern under the ownership of the Company or Group (Margey Labs), if and when required.
                      </p>

                      <p className="font-bold text-slate-900">
                        This offer of employment is subject to the following:
                      </p>

                      <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-slate-800">
                        <li>You are sending confirmation of acceptance of this offer within {document.employment?.acceptanceDays || 3} days.</li>
                        <li>You shall be joining our organization on or before <strong>{document.employment?.joiningDate || '05/03/2025'}</strong>.</li>
                        <li>Submission of necessary relieving documents from your present & previous employer(s).</li>
                        <li>Experience & Education certificates and other testimonials at the time of joining.</li>
                        <li>Your character antecedents, professional reference, background and substance abuse test.</li>
                      </ul>

                      <p className="text-slate-800 text-justify">
                        If the terms and conditions stated in the offer are acceptable, please sign the duplicate/digital copy of this letter as a token of your acceptance and return it to us indicating your proposed date of joining within {document.employment?.acceptanceDays || 3} days of receipt of this offer. For Margey Labs Pvt Ltd.,
                      </p>
                    </div>

                    {/* Manager HR Signatory Block on Left with Fixed-Size Stamp */}
                    <div className="mt-3">
                      <ProfuseSignatoryBlock align="left" stampSize={90} />
                    </div>
                  </div>

                  <ProfuseFooter />
                </div>

                {/* ================= OPTIONAL FULL ANNEXURE PAGES (PAGES 2-6) ================= */}
                {showFullAnnexure && (
                  <>
                    {/* PAGE 2: Terms and Conditions of Employment (Part 1) */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <ProfuseHeader isConfidential={true} />

                        <h2 className="text-[13px] font-bold text-slate-900 mb-2 font-sans">
                          Terms and Conditions of Employment
                        </h2>

                        <p className="text-[11.5px] leading-relaxed text-slate-800 mb-3 text-justify">
                          You shall be governed by the following terms and Conditions of Service during your employment with Margey Labs Private Limited (hereafter referred to as the "Company"), and those that may be amended from time to time.
                        </p>

                        <div className="space-y-2.5 text-[11.5px] leading-relaxed text-slate-800 font-sans">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">1. Statement of facts</h3>
                            <p className="text-justify">
                              The company has made the offer of employment on the basis of the bonafide statements and facts provided by you. A background verification will be conducted which is a mandatory requirement for all employees of Margey Labs to continue with this engagement.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">2. Duties</h3>
                            <ul className="list-disc pl-5 space-y-1.5 text-justify">
                              <li>
                                During working hours, you shall use your best energies and abilities to serve the Company faithfully and shall comply with the rules, regulations and procedures as notified by the Company in letter and spirit. You are expected at all times assiduously and to the best of your ability, experience and talent, perform all of the duties that may be assigned, from time to time by the Company.
                              </li>
                              <li>
                                During the employment, you shall not directly or indirectly engage in any conduct averse to the best interests of the Company. Also, you shall not divulge any confidential information or violate any agreement with any third party including your prior employers or their clients.
                              </li>
                              <li>
                                You may also at any time, be seconded/ transferred to or re-appointed by any of the Company’s Affiliates, as the case may be. In such an event, you will be required to observe and comply with policies and regulations of the Company, seconded/ transferred/ re-appointed to.
                              </li>
                              <li>
                                You shall adhere to all applicable Company policies which may be subject to change from time to time.
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">3. Conduct</h3>
                            <p className="text-justify">
                              You shall always, maintain exemplary conduct and decorum and shall uphold honesty and integrity in all your actions. You shall honour and comply with all rules and regulations of the Company and statutory requirements, in letter and spirit.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">4. Confidentiality</h3>
                            <ul className="list-disc pl-5 space-y-1 text-justify">
                              <li>
                                You must maintain utmost secrecy with regard to confidential and proprietary information relating to the company. This information includes and is not limited to trade secrets, technical processes, finances, dealings with information relating to suppliers, employees, agents, distributors and customers.
                              </li>
                              <li>
                                You shall not take copies of confidential documents or information for your own purposes and forthwith upon termination, you shall return to the Company all documents, records and accounts in any form.
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <ProfuseFooter />
                    </div>

                    {/* PAGE 3: Terms and Conditions of Employment (Part 2) */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <ProfuseHeader isConfidential={true} />

                        <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-800 font-sans">
                          <div>
                            <ul className="list-disc pl-5 space-y-1.5 text-justify">
                              <li>
                                not limited to, electronic, mechanical, photographic, & optic recording) relating to matters concerning the business or dealings or affairs of the Company.
                              </li>
                              <li>
                                You shall not during the employment and at all times thereafter do or say anything that may injure directly or indirectly damage the business of the Company.
                              </li>
                              <li>
                                You shall maintain utmost confidentiality with regard to your compensation and benefits. You shall not discuss your compensation and benefits with anyone, but with the Manager you report to or the local HR head.
                              </li>
                              <li>
                                You shall follow all Company confidentiality policies including IT security policies and Code of Ethics.
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">5. Place of work</h3>
                            <ul className="list-disc pl-5 space-y-1 text-justify">
                              <li>
                                You will be in employment at Company premises or as directed by the Company or Company officials, but, as and when necessary you may work at other Margey Labs group Company's offices.
                              </li>
                              <li>
                                The Company reserves the right to transfer on a temporary or permanent basis to the other job functions or departments within the Company and assign such other duties as may be deemed fit in the interest of the Company.
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">6. Hours of work</h3>
                            <ul className="list-disc pl-5 space-y-1 text-justify">
                              <li>
                                Specific working hours will be determined by your respective local Manager.
                              </li>
                              <li>
                                Depending on the needs of the department, you may be required to work outside the official hours for the proper performance and discharge of your duties.
                              </li>
                              <li>
                                Depending on Business needs, you may be required to work on shift basis (applicable for certain teams). The shift timings will be notified by the Manager and may change from time to time with prior notice.
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">7. Probationary Period</h3>
                            <p className="text-justify">
                              You will be on 6 month of assessment from the date of joining before the employment is made permanent. Company reserves the right to terminate the employment in case your performance, behavior and / or conduct during the probation period is found unsatisfactory, with immediate effect. Probation will be deemed confirmed/permanent if there is no communication from your Manager/HR regarding extension during the probation period. In case you wish to resign during the probation period, you are required to pay 60 days’ basic salary in lieu of notice period shortfall. The Company reserves the right to either continue your employment during your notice period or relieve you with immediate effect at its discretion without payment.
                            </p>
                          </div>
                        </div>
                      </div>

                      <ProfuseFooter />
                    </div>

                    {/* PAGE 4: Terms and Conditions of Employment (Part 3) */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <ProfuseHeader isConfidential={true} />

                        <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-800 font-sans">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">8. Alternate Employment</h3>
                            <p className="text-justify">
                              As a full-time employee of Company, you are not allowed to undertake any other job, honorary or remunerative, employment, contract, freelance work, business, or assume any public office, without written permission from Company.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">9. Background Verification</h3>
                            <p className="text-justify">
                              This offer and employment is subject to successful verification of your history of employment, educational qualifications, and other details deemed appropriate by the company. Any discrepancy in the verification of the declared information will result in termination of employment without notice or revocation of the offer.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">10. Termination of Employment & Notice Period</h3>
                            <p className="text-justify mb-1.5">
                              The employment may be terminated at any time, either by you or Company without any reason by giving 60 calendar days’ written notice or two months’ basic salary in lieu of the notice to the other party. If the termination is initiated by Company, the company will give 60 days’ notice period or two months’ basic salary in lieu of the notice to the employee. The Company reserves the right to waive off the notice period.
                            </p>
                            <p className="text-justify mb-1.5">
                              If the termination is initiated by the employee, the employee must give 60 days’ written notice period to the Company. It is important to complete all activities related to knowledge transfer and training other employees, as necessary. In certain circumstances where an employee fails to serve the 60 days’ notice period or any shortfall in notice period, then at the discretion of the Company, Company may agree two months’ basic salary or basic salary proportionate to the notice period shortfall as recovery from employee in lieu of the notice period to the Company, failure to pay recovery amount in lieu of the notice period shortfall to the Company will lead to withholding of the Full and Final settlement of the employee.
                            </p>
                            <p className="text-justify">
                              The Company reserves the right to terminate your service / employment at any time without notice period should you be guilty of misdemeanor, misconduct, negligence, or any breach of terms and conditions of your employment. The Company has the right to recover any training, conferences, summits, events, classroom courses, web courses, or any other investment on employee development costs incurred for you during the preceding 12 months from the date of employment termination.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">11. User and Non-Disclosure Agreement</h3>
                            <p className="text-justify">
                              You must not during the employment (other than in the proper performance of your duties) or at any time thereafter use for your own purposes or disclose to any third party any Confidential Material that You will be making use of/ acquiring or adding to and/ or which will be disclosed to You as a result of your relationship with the Company and You must use your best endeavors to prevent such disclosure.
                            </p>
                          </div>
                        </div>
                      </div>

                      <ProfuseFooter />
                    </div>

                    {/* PAGE 5: Terms and Conditions of Employment (Part 4) */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <ProfuseHeader isConfidential={true} />

                        <div className="space-y-3 text-[11.5px] leading-relaxed text-slate-800 font-sans">
                          <p className="text-justify">
                            All Confidential Material and all other Property which may have been made or prepared by You, or at your request or have come into your possession or under your control in the course of your employment or which relate in any way to the business (including prospective business) or the affairs of any member of the Company or any Affiliate of the Company or those of any customer, supplier, agent, distributor or sub-contractor of the Company or any Affiliate of the Company are, as between us deemed to be the Company’s property. You must handover all such Property, to the Company immediately upon the termination of your employment (or at any earlier time on demand).
                          </p>

                          <p className="text-justify">
                            You must immediately inform the Company if you become aware of the possession, use or knowledge of any of the Confidential Material by any person not authorized to possess, use or have knowledge of the Confidential Material, whether during your employment or thereafter and you must at the Company’s request provide such reasonable assistance as is, to deal with such event.
                          </p>

                          <p className="text-justify">
                            Nothing in this Clause will prevent you from disclosing Confidential Material where it is required to be disclosed by judicial, administrative, governmental or regulatory process in connection with any action, suit, proceeding or claim or otherwise by applicable law, provided you promptly inform the Company of such requirement.
                          </p>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-1">12. Ownership of Intellectual Property/ Inventions</h3>
                            <p className="text-justify mb-1.5">
                              For the purposes of this Clause, "Intellectual Property" includes copyrights, patents, trademarks and design rights (whether registered or unregistered), and any applications for such rights, discoveries, inventions, confidential information, know-how and all other equivalent or related rights worldwide.
                            </p>
                            <p className="text-justify mb-1.5">
                              If at any time during the course of the employment, an employee may create or discover or participate in the creation or discovery of any Intellectual Property relating to or capable of being used in the Company's business or the business of any Affiliate from time to time, employee must immediately communicate full details of the Intellectual Property to the Company and such Intellectual Property shall be the Company’s or any Affiliate’s absolute property worldwide.
                            </p>
                            <p className="text-justify mb-1.5">
                              At the Company’s request and expense, an employee will give and supply all information and assistance as may be required to enable the Company to exploit the Intellectual Property and in this connection will assign, make, execute and deliver all and any documents requested by the Company and in relation to such Intellectual Property, do all things that may be necessary or desirable for obtaining, maintaining, extending and if necessary, enforcing and defending, protection for and/ or assigning to the Company or any Affiliate.
                            </p>
                            <p className="text-justify">
                              An employee will assign to the Company by way of future assignment all copyrights arising in any works or material produced by you during your employment and will do nothing during or after the employment to affect or imperil the validity of any Intellectual Property rights obtained, applied for or to be applied for by the Company or any Affiliate. Employee hereby waive absolutely the moral rights (if any) in respect of any such Intellectual Property.
                            </p>
                          </div>
                        </div>
                      </div>

                      <ProfuseFooter />
                    </div>

                    {/* PAGE 6: Terms and Conditions of Employment (Part 5) */}
                    <div
                      className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                      style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                    >
                      <div>
                        <ProfuseHeader isConfidential={true} />

                        <div className="space-y-3.5 text-[11.5px] leading-relaxed text-slate-800 font-sans">
                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-1">13. Non-Compete and Non-Solicitation Clause</h3>
                            <p className="text-justify mb-2">
                              During the term of this employment and for a period of 12 months after the termination of your employment with the Company.
                            </p>
                            <ul className="space-y-2 text-justify pl-1">
                              <li>
                                <strong>a.</strong> You will not directly or indirectly be associated with, manage, operate, control, invest in, or participate in the ownership, management and operation of, undertake, carry on or be employed, engaged or interested in any capacity, or advise, a company or firm that is in business which is competitive with a certain business of the company, unless with the specific approval of the company, in writing.
                              </li>
                              <li>
                                <strong>b.</strong> You shall not interfere with or endeavor to entice away from employment or engagement with the Company or any other Affiliate of the Company (or procure or assist the solicitation, interference with or enticement of) any employee, independent contractor and/ or consultant or do any act whereby such employee, independent contractor and or consultant as the case may be is encouraged to terminate their employment or engagement, with the Company or any other Affiliate of the Company.
                              </li>
                              <li>
                                <strong>c.</strong> You shall not directly or indirectly, induce or attempt to induce any customer, supplier, dealers, licensee, agents or business relations to cease doing business with the Company, or in any way interfere with the relationship between any customer, supplier, licensee or business entity and the Company or any Affiliate of the Company.
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">14. Retirement Age</h3>
                            <p className="text-justify">
                              The retirement age in the company will be Sixty (60) years.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-[12px] mb-0.5">15. Miscellaneous</h3>
                            <p className="text-justify">
                              This letter represents the entire agreement between the parties with respect to your employment by the Company and supersedes any previous written or verbal agreement between the parties in relation to this matter.
                            </p>
                          </div>
                        </div>
                      </div>

                      <ProfuseFooter />
                    </div>
                  </>
                )}

                {/* ================= PAGE 7 (OR PAGE 2 IN QUICK MODE): COMPENSATION BREAKUP ================= */}
                <div
                  className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                  style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
                >
                  <div>
                    <ProfuseHeader isConfidential={true} />

                    <h2 className="text-sm font-bold text-slate-900 mb-3 font-sans uppercase tracking-wide">
                      YOUR ANNUAL TOTAL COMPENSATION
                    </h2>

                    {/* Table 1: Salary Components Summary */}
                    <div className="border border-slate-800 text-[12px] mb-4">
                      <div className="bg-white p-2 font-bold text-center border-b border-slate-800 uppercase tracking-wide text-xs">
                        SALARY COMPONENTS
                      </div>
                      <div className="divide-y divide-slate-800 font-sans">
                        <div className="flex justify-between p-2.5">
                          <span className="font-bold text-slate-900">Annual Fixed Compensation</span>
                          <span className="font-mono font-bold text-slate-900">INR {ctcFormatted}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-slate-50">
                          <span className="font-bold text-slate-900">Annual Total Compensation</span>
                          <span className="font-mono font-bold text-slate-900">ATC INR {ctcFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-slate-700 leading-relaxed mb-4 text-justify">
                      All other terms and conditions of your employment agreement will remain unchanged. Your salary details are strictly private and confidential and should not be disclosed or discussed with others.
                    </p>

                    <div className="space-y-1 text-xs text-slate-900 mb-4 font-sans">
                      <p><strong>Name:</strong> {candidateName}</p>
                      <p><strong>Designation:</strong> {designation}</p>
                    </div>

                    {/* Table 2: Compensation Breakup */}
                    <div className="border border-slate-800 text-[11.5px] mb-6">
                      <div className="bg-white p-2 font-bold text-center border-b border-slate-800 uppercase tracking-wide text-xs">
                        COMPENSATION BREAKUP
                      </div>
                      <table className="w-full text-[11.5px]">
                        <tbody className="divide-y divide-slate-800 font-mono">
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">Basic Pay (50%)</td>
                            <td className="p-2.5 text-right">{struct?.monthly?.basic?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '39,166.67'}</td>
                            <td className="p-2.5 text-right">{struct?.annual?.basic?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '4,70,000.00'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">HRA (40% Basic)</td>
                            <td className="p-2.5 text-right">{struct?.monthly?.hra?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '15,666.67'}</td>
                            <td className="p-2.5 text-right">{struct?.annual?.hra?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '1,88,000.00'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">Conveyance Allowance</td>
                            <td className="p-2.5 text-right">{struct?.monthly?.conveyance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '800.00'}</td>
                            <td className="p-2.5 text-right">{struct?.annual?.conveyance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '9,600.00'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">Medical Allowance</td>
                            <td className="p-2.5 text-right">{struct?.monthly?.medical?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '1,250.00'}</td>
                            <td className="p-2.5 text-right">{struct?.annual?.medical?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '15,000.00'}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">Network & Internet Bill</td>
                            <td className="p-2.5 text-right">{(struct?.monthly?.networkAllowance ?? 1000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right">{(struct?.annual?.networkAllowance ?? 12000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">Other Allowance</td>
                            <td className="p-2.5 text-right">{(struct?.monthly?.otherAllowance ?? 1000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right">{(struct?.annual?.otherAllowance ?? 12000)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-sans text-slate-900">Special Allowance</td>
                            <td className="p-2.5 text-right">{struct?.monthly?.specialAllowance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '19,450.00'}</td>
                            <td className="p-2.5 text-right">{struct?.annual?.specialAllowance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '2,33,400.00'}</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                            <td className="p-2.5 font-sans text-slate-900">Gross Pay</td>
                            <td className="p-2.5 text-right">{struct?.monthly?.gross?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '78,333.33'}</td>
                            <td className="p-2.5 text-right">{struct?.annual?.gross?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '9,40,000.00'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Candidate Acceptance Box */}
                    <div className="space-y-5 text-xs text-slate-800 mt-6">
                      <p className="text-justify leading-relaxed text-[11.5px]">
                        I have read and understood the terms of the Offer Letter and accept the above-mentioned terms and conditions of employment with the Margey Labs Private Limited.
                      </p>

                      <div className="pt-12 flex flex-col items-end">
                        <div className="w-72 border-b border-slate-900 pb-1"></div>
                        <span className="text-xs font-semibold text-slate-900 mt-1">Candidate Acceptance Sign and Date</span>
                      </div>
                    </div>
                  </div>

                  <ProfuseFooter />
                </div>
              </>
            )}

            {/* ==================== TEMPLATE TYPE 2: EXPERIENCE CERTIFICATE ==================== */}
            {document.type === 'experience' && (
              <div
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div>
                  <ProfuseHeader
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
                      This is to certify that <strong>{document.employee?.fullName || candidateName}</strong> (Employee ID: <strong>{document.employee?.id || 'EMP001'}</strong>) was employed with <strong>Margey Labs Private Limited</strong> from <strong>{expJoiningDate}</strong> to <strong>{expRelievingDate}</strong>.
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
                    <ProfuseSignatoryBlock align="left" stampSize={90} />
                  </div>
                </div>

                <ProfuseFooter />
              </div>
            )}

            {/* ==================== TEMPLATE TYPE 3: RELIEVING ORDER ==================== */}
            {document.type === 'relieving' && (
              <div
                className="printable-page bg-white text-slate-900 rounded-none shadow-none border-none p-7 sm:p-8 font-sans flex flex-col justify-between"
                style={{ width: '210mm', minHeight: '296mm', height: '296mm' }}
              >
                <div>
                  <ProfuseHeader
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
                      With reference to your formal letter of resignation dated <strong>{relResignationDate}</strong>, we wish to confirm that your resignation from the services of <strong>Margey Labs Pvt Ltd</strong> as <strong>{designation}</strong> has been formally accepted.
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
                    <ProfuseSignatoryBlock align="left" stampSize={90} />
                  </div>
                </div>

                <ProfuseFooter />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
