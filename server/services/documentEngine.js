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
 * Generate Offer Letter adhering to the official Profuse template
 */
function generateOfferLetter(data, company, statutorySettings = {}) {
  const ctc = Number(data.annualCTC) || 940000;
  const salaryStructure = calculateSalaryStructure(ctc, statutorySettings);
  const currencySymbol = company.currency === 'USD' ? '$' : 'INR';

  const refSeq = Math.floor(1000 + Math.random() * 9000);
  const refId = data.id || `Profuse/EMP/${new Date().getFullYear()}/PTS${refSeq}`;
  const issueDate = data.issueDate || new Date().toISOString().split('T')[0];

  return {
    id: refId,
    type: 'offer',
    title: 'Offer Letter',
    issueDate,
    formattedIssueDate: formatDate(issueDate),
    candidate: {
      fullName: data.candidateName || 'Doddetipalli Gowtham',
      email: data.email || 'gowtham@example.com',
      phone: data.phone || '080-95883256',
      address: data.address || 'Bangalore, Karnataka'
    },
    employment: {
      designation: data.designation || 'Software Developer',
      department: data.department || 'Engineering',
      joiningDate: data.joiningDate || '2025-03-05',
      formattedJoiningDate: formatOrdinalDate(data.joiningDate || '2025-03-05'),
      probationMonths: Number(data.probationMonths) || 6,
      workLocation: data.workLocation || 'Bangalore office',
      reportingTo: data.reportingTo || 'Engineering Manager',
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
      name: company.name || 'Profuse Transtech Solutions Pvt Ltd',
      legalName: company.legalName || 'PROFUSE TRANSTECH SOLUTIONS PRIVATE LIMITED',
      address: company.address || '6th Floor, Gamma Block, Sigma Soft Tech Park, Varthur Hobli, Bangalore-560066.',
      phone: company.phone || '080-95883256',
      email: company.email || 'hr@protps.com',
      website: company.website || 'www.protps.com',
      signatoryName: company.signatoryName || 'Murali K',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    }
  };
}

/**
 * Generate Experience Certificate adhering to the official Profuse template
 */
function generateExperienceLetter(data, company) {
  const refSeq = Math.floor(1000 + Math.random() * 9000);
  const refId = data.id || `Profuse/EXP/${new Date().getFullYear()}/PTS${refSeq}`;
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
      id: data.employeeId || 'PTS1307',
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
      name: company.name || 'Profuse Transtech Solutions Pvt Ltd',
      legalName: company.legalName || 'PROFUSE TRANSTECH SOLUTIONS PRIVATE LIMITED',
      address: company.address || '6th Floor, Gamma Block, Sigma Soft Tech Park, Varthur Hobli, Bangalore-560066.',
      phone: company.phone || '080-95883256',
      email: company.email || 'hr@protps.com',
      website: company.website || 'www.protps.com',
      signatoryName: company.signatoryName || 'Murali K',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    },
    conductRating: data.conductRating || 'Exemplary & Diligent',
    responsibilitiesSummary: data.responsibilitiesSummary || 'Contributed with distinction towards software development, project delivery, and cross-functional technology initiatives.',
    bodyText: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${data.employeeName} (Emp ID: ${data.employeeId || 'PTS1307'}) was employed with Profuse Transtech Solutions Pvt Ltd from ${formattedJoining} to ${formattedRelieving}, serving our organization for a tenure of ${tenure}.

During the period of their employment, ${data.employeeName} worked in the capacity of ${data.designation} within our ${data.department || 'Technology'} division at our Bangalore office.

Core Area of Contribution:
${data.responsibilitiesSummary || 'Exhibited technical leadership in software engineering, demonstrated high quality craftsmanship, and complied diligently with company policies.'}

During their association with Profuse Transtech Solutions, we found them to be sincere, hardworking, honest, and result-oriented. Their character and conduct have been evaluated as "${data.conductRating || 'Exemplary & Diligent'}".

We wish ${data.employeeName} all the best and continued success in all their future endeavors.`
  };
}

/**
 * Generate Relieving Letter adhering to the official Profuse template
 */
function generateRelievingLetter(data, company) {
  const refSeq = Math.floor(1000 + Math.random() * 9000);
  const refId = data.id || `Profuse/REL/${new Date().getFullYear()}/PTS${refSeq}`;
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
      id: data.employeeId || 'PTS1307',
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
      name: company.name || 'Profuse Transtech Solutions Pvt Ltd',
      legalName: company.legalName || 'PROFUSE TRANSTECH SOLUTIONS PRIVATE LIMITED',
      address: company.address || '6th Floor, Gamma Block, Sigma Soft Tech Park, Varthur Hobli, Bangalore-560066.',
      phone: company.phone || '080-95883256',
      email: company.email || 'hr@protps.com',
      website: company.website || 'www.protps.com',
      signatoryName: company.signatoryName || 'Murali K',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    },
    clearanceStatus: data.clearanceStatus || 'All Company IT Assets, Keys & Data Handover Completed',
    settlementDetails: data.settlementDetails || 'Full and Final (FnF) settlement has been cleared and accounted with zero pending dues.',
    bodyText: `Dear ${data.employeeName},

Sub: Relieving Letter & Acceptance of Resignation

With reference to your resignation letter dated ${formattedResignation}, we wish to advise that your resignation has been accepted by the management of Profuse Transtech Solutions Pvt Ltd.

You are formally relieved from the services and duties of the Company as ${data.designation} with effect from the close of business hours on ${formattedRelieving}.

Clearance & Departmental Handover:
1. All organizational assets, intellectual property, code repositories, access cards, and company documents under your custody have been surrendered in full (${data.clearanceStatus || 'Completed'}).
2. ${data.settlementDetails || 'Your Full and Final settlement has been reconciled according to company policy with no outstanding liabilities.'}
3. Non-Disclosure & IP: Please be advised that your obligations regarding Confidentiality, Non-Disclosure of trade secrets, and Non-Solicitation continue to remain in full force post-employment as per your appointment terms.

We thank you for your contributions during your tenure with Profuse Transtech Solutions and wish you every success in your future professional endeavors.`
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
