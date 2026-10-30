// OmniaHRM Document Engine - Official Profuse Transtech Solutions Template
const { calculateSalaryStructure, numberToWords } = require('./payrollEngine');

function calculateTenure(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return '0 Years';

  const [y1, m1, d1] = String(startDateStr).slice(0, 10).split('-').map(Number);
  const [y2, m2, d2] = String(endDateStr).slice(0, 10).split('-').map(Number);

  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return '0 Years';

  let start = new Date(y1, m1 - 1, d1);
  let end = new Date(y2, m2 - 1, d2);

  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
  if (days > 0 && years === 0 && months === 0) {
    parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
  }

  return parts.join(' and ') || '0 Days';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[m - 1]} ${String(d).padStart(2, '0')}, ${y}`;
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

function formatOrdinalDate(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    const day = d;
    const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[m - 1] || 'Jan';
    return `${String(day).padStart(2, '0')}${suffix} ${month}, ${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = d.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${String(day).padStart(2, '0')}${suffix} ${month}, ${year}`;
}

/**
 * Generate Offer Letter adhering to the official Margey Labs template
 */
function generateOfferLetter(data, company, statutorySettings = {}) {
  const ctc = Number(data.annualCTC) || 600000;
  const salaryStructure = calculateSalaryStructure(ctc, statutorySettings);
  const currencySymbol = company.currency === 'USD' ? '$' : 'INR';

  const refSeq = Math.floor(1000 + Math.random() * 9000);
  const refId = data.id || `MARGEY/OFFER/${new Date().getFullYear()}/ML${refSeq}`;
  const issueDate = data.issueDate || '2025-10-27';

  return {
    id: refId,
    type: 'offer',
    title: 'LETTER OF OFFER',
    issueDate,
    formattedIssueDate: '27TH Oct 2025',
    candidate: {
      fullName: data.candidateName || 'Ms. Batta Vyshnavi',
      email: data.email || 'vyshnavi.batta@example.com',
      phone: data.phone || '+91 86608 03099',
      address: data.address || 'Papireddypalem,\nT.P. Gudur Mandal, Nellore District,\nAndhra Pradesh'
    },
    employment: {
      designation: data.designation || 'HR Executive',
      department: data.department || 'Human Resources',
      joiningDate: data.joiningDate || '2025-11-12',
      formattedJoiningDate: formatOrdinalDate(data.joiningDate || '2025-11-12') || '12th Nov 2025',
      probationMonths: Number(data.probationMonths) || 6,
      probationPeriod: data.probationPeriod || `${Number(data.probationMonths) || 6} months`,
      noticePeriodDays: Number(data.noticePeriodDays) || 60,
      workLocation: data.workLocation || 'Bangalore',
      reportingTo: data.reportingTo || '[Name / Designation]',
      acceptanceDays: 3
    },
    compensation: {
      annualCTC: ctc,
      formattedCTC: ctc.toLocaleString('en-IN'),
      monthlyGross: salaryStructure.monthly.gross,
      structure: salaryStructure,
      currency: 'INR',
      currencySymbol: 'INR',
      inWords: numberToWords(ctc, 'INR')
    },
    company: {
      name: company.name || 'MARGEY LABS PVT. LTD.',
      legalName: company.legalName || 'MARGEY LABS PRIVATE LIMITED',
      cin: company.cin || 'U58200KA2024PTC191015',
      address: company.address || '4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037',
      phone: company.phone || '+91 86608 03099 | +91 9100588005',
      email: company.email || 'info@margeylabs.com',
      website: company.website || 'margeylabs.com',
      signatoryName: company.signatoryName || 'Murali K',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    }
  };
}

/**
 * Generate Experience Certificate adhering to the official Margey Labs template
 */
function generateExperienceLetter(data, company) {
  const refSeq = Math.floor(1000 + Math.random() * 9000);
  const refId = data.id || `MARGEY/EXP/${new Date().getFullYear()}/ML${refSeq}`;
  const issueDate = data.issueDate || new Date().toISOString().split('T')[0];
  const tenure = calculateTenure(data.dateOfJoining, data.relievingDate);

  const formattedJoining = formatOrdinalDate(data.dateOfJoining);
  const formattedRelieving = formatOrdinalDate(data.relievingDate);

  return {
    id: refId,
    type: 'experience',
    title: 'Service & Experience Certificate',
    issueDate,
    formattedIssueDate: formatDate(issueDate),
    tenure,
    tenureFormatted: tenure,
    formattedJoiningDate: formattedJoining,
    formattedRelievingDate: formattedRelieving,
    employee: {
      id: data.employeeId || 'ML1307',
      fullName: data.employeeName,
      designation: data.designation,
      department: data.department,
      dateOfJoining: data.dateOfJoining,
      relievingDate: data.relievingDate,
      tenure,
      tenureFormatted: tenure,
      formattedJoining,
      formattedRelieving,
      formattedJoiningDate: formattedJoining,
      formattedRelievingDate: formattedRelieving
    },
    company: {
      name: company.name || 'MARGEY LABS PVT. LTD.',
      legalName: company.legalName || 'MARGEY LABS PRIVATE LIMITED',
      cin: company.cin || 'U58200KA2024PTC191015',
      address: company.address || '4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037',
      phone: company.phone || '+91 86608 03099 | +91 9100588005',
      email: company.email || 'info@margeylabs.com',
      website: company.website || 'margeylabs.com',
      signatoryName: company.signatoryName || 'Murali K',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    },
    conductRating: data.conductRating || 'Exemplary & Diligent',
    responsibilitiesSummary: data.responsibilitiesSummary || 'Contributed with distinction towards software development, project delivery, and cross-functional technology initiatives.',
    bodyText: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${data.employeeName} (Emp ID: ${data.employeeId || 'ML1307'}) was employed with Margey Labs Pvt Ltd from ${formattedJoining} to ${formattedRelieving}, serving our organization for a tenure of ${tenure}.

During the period of their employment, ${data.employeeName} worked in the capacity of ${data.designation} within our ${data.department || 'Technology'} division at our Bangalore office.

Core Area of Contribution:
${data.responsibilitiesSummary || 'Exhibited technical leadership in software engineering, demonstrated high quality craftsmanship, and complied diligently with company policies.'}

During their association with Margey Labs Pvt Ltd, we found them to be sincere, hardworking, honest, and result-oriented. Their character and conduct have been evaluated as "${data.conductRating || 'Exemplary & Diligent'}".

We wish ${data.employeeName} all the best and continued success in all their future endeavors.`
  };
}

/**
 * Generate Relieving Letter adhering to the official Margey Labs template
 */
function generateRelievingLetter(data, company) {
  const refSeq = Math.floor(1000 + Math.random() * 9000);
  const refId = data.id || `MARGEY/REL/${new Date().getFullYear()}/ML${refSeq}`;
  const issueDate = data.issueDate || new Date().toISOString().split('T')[0];

  const formattedResignation = formatOrdinalDate(data.resignationDate || data.dateOfJoining);
  const formattedRelieving = formatOrdinalDate(data.relievingDate);

  return {
    id: refId,
    type: 'relieving',
    title: 'Relieving Order & Clearance Certificate',
    issueDate,
    formattedIssueDate: formatDate(issueDate),
    formattedResignationDate: formattedResignation,
    formattedRelievingDate: formattedRelieving,
    employee: {
      id: data.employeeId || 'ML1307',
      fullName: data.employeeName,
      designation: data.designation,
      department: data.department,
      resignationDate: data.resignationDate,
      relievingDate: data.relievingDate,
      formattedResignation,
      formattedRelieving,
      formattedResignationDate: formattedResignation,
      formattedRelievingDate: formattedRelieving
    },
    company: {
      name: company.name || 'MARGEY LABS PVT. LTD.',
      legalName: company.legalName || 'MARGEY LABS PRIVATE LIMITED',
      cin: company.cin || 'U58200KA2024PTC191015',
      address: company.address || '4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037',
      phone: company.phone || '+91 86608 03099 | +91 9100588005',
      email: company.email || 'info@margeylabs.com',
      website: company.website || 'margeylabs.com',
      signatoryName: company.signatoryName || 'Murali K',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    },
    clearanceStatus: data.clearanceStatus || 'All Company IT Assets, Keys & Data Handover Completed',
    settlementDetails: data.settlementDetails || 'Full and Final (FnF) settlement has been cleared and accounted with zero pending dues.',
    bodyText: `Dear ${data.employeeName},

Sub: Relieving Letter & Acceptance of Resignation

With reference to your resignation letter dated ${formattedResignation}, we wish to advise that your resignation has been accepted by the management of Margey Labs Pvt Ltd.

You are formally relieved from the services and duties of the Company as ${data.designation} with effect from the close of business hours on ${formattedRelieving}.

Clearance & Departmental Handover:
1. All organizational assets, intellectual property, code repositories, access cards, and company documents under your custody have been surrendered in full (${data.clearanceStatus || 'Completed'}).
2. ${data.settlementDetails || 'Your Full and Final settlement has been reconciled according to company policy with no outstanding liabilities.'}
3. Non-Disclosure & IP: Please be advised that your obligations regarding Confidentiality, Non-Disclosure of trade secrets, and Non-Solicitation continue to remain in full force post-employment as per your appointment terms.

We thank you for your contributions during your tenure with Margey Labs Pvt Ltd and wish you every success in your future professional endeavors.`
  };
}

module.exports = {
  generateOfferLetter,
  generateExperienceLetter,
  generateRelievingLetter,
  calculateTenure,
  formatDate,
  formatOrdinalDate
};
