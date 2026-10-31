// Apex HRM Compensation & Hike Engine
// Computes hikes, appraisals, retroactive arrears, and generates official hike letters

const { calculateSalaryStructure } = require('./payrollEngine');

/**
 * Calculate compensation hike
 * @param {number} currentCTC 
 * @param {object} hikeDetails { type: 'percentage' | 'fixed', value: number, effectiveDate: string, reviewPeriod: string, rating: string }
 * @param {object} statutorySettings 
 */
function calculateHike(currentCTC, hikeDetails, statutorySettings = {}) {
  const current = Number(currentCTC) || 0;
  let hikeAmount = 0;
  let hikePercentage = 0;

  if (hikeDetails.type === 'percentage') {
    hikePercentage = Number(hikeDetails.value) || 0;
    hikeAmount = Math.round(current * (hikePercentage / 100));
  } else {
    hikeAmount = Number(hikeDetails.value) || 0;
    hikePercentage = current > 0 ? Number(((hikeAmount / current) * 100).toFixed(2)) : 0;
  }

  const revisedCTC = current + hikeAmount;
  const currentStructure = calculateSalaryStructure(current, statutorySettings);
  const revisedStructure = calculateSalaryStructure(revisedCTC, statutorySettings);

  const monthlyCurrentGross = currentStructure.monthly.gross || Number((current / 12).toFixed(2));
  const monthlyRevisedGross = revisedStructure.monthly.gross || Number((revisedCTC / 12).toFixed(2));

  const monthlyHikeDifference = monthlyRevisedGross - monthlyCurrentGross;

  // Retroactive arrears calculation
  // If effectiveDate is in the past compared to announcement date
  let retroactiveMonths = 0;
  let arrearsPayable = 0;

  if (hikeDetails.effectiveDate) {
    const effective = new Date(hikeDetails.effectiveDate);
    const announcement = hikeDetails.announcementDate ? new Date(hikeDetails.announcementDate) : new Date();

    if (effective < announcement) {
      const yearDiff = announcement.getFullYear() - effective.getFullYear();
      const monthDiff = announcement.getMonth() - effective.getMonth();
      retroactiveMonths = Math.max(0, (yearDiff * 12) + monthDiff);
      arrearsPayable = monthlyHikeDifference * retroactiveMonths;
    }
  }

  return {
    currentCTC: current,
    revisedCTC,
    hikeAmount,
    hikePercentage,
    monthlyHikeDifference,
    retroactiveMonths,
    arrearsPayable,
    currentStructure,
    revisedStructure,
    effectiveDate: hikeDetails.effectiveDate,
    rating: hikeDetails.rating || 'Exceeds Expectations',
    reviewPeriod: hikeDetails.reviewPeriod || 'Annual Appraisal 2026',
    remarks: hikeDetails.remarks || 'Recognizing exceptional performance and technical contributions.'
  };
}

/**
 * Generate official Appraisal & Hike Letter
 */
function generateAppraisalLetter(employee, hikeResult, company) {
  const currencySymbol = 'INR';
  const effectiveFormatted = new Date(hikeResult.effectiveDate || new Date()).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  const dateToday = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const refId = `MARGEY/APP/${new Date().getFullYear()}/ML${String(Math.floor(1000 + Math.random() * 9000))}`;

  return {
    letterRef: refId,
    id: refId,
    type: 'appraisal',
    title: 'Salary Revision & Appraisal Letter',
    issuedDate: `Date: ${dateToday}`,
    issueDate: new Date().toISOString().split('T')[0],
    employee: {
      name: employee.fullName,
      fullName: employee.fullName,
      id: employee.id || 'ML1307',
      designation: employee.designation,
      department: employee.department
    },
    company: {
      name: company.name || 'Margey Labs Pvt Ltd',
      legalName: company.legalName || 'MARGEY LABS PRIVATE LIMITED',
      address: company.address || '6th Floor, Gamma Block, Sigma Soft Tech Park, Varthur Hobli, Bangalore-560066.',
      phone: company.phone || '080-95883256',
      email: company.email || 'hr@margeylabs.com',
      website: company.website || 'www.margeylabs.com',
      signatoryName: company.signatoryName || 'Mohammed Vastulla Baig',
      signatoryTitle: company.signatoryTitle || 'Manager - Human Resources'
    },
    hikeDetails: {
      previousCTC: hikeResult.currentCTC,
      revisedCTC: hikeResult.revisedCTC,
      hikePercentage: hikeResult.hikePercentage,
      hikeAmount: hikeResult.hikeAmount,
      effectiveDate: effectiveFormatted,
      rating: hikeResult.rating,
      reviewPeriod: hikeResult.reviewPeriod,
      arrearsPayable: hikeResult.arrearsPayable || 0,
      retroactiveMonths: hikeResult.retroactiveMonths || 0,
      currentStructure: hikeResult.currentStructure,
      revisedStructure: hikeResult.revisedStructure
    },
    subject: 'Salary Revision and Appreciation for Your Contributions',
    content: `HIKE LETTER
Date: ${dateToday}
To,
${employee.fullName}
${employee.designation || 'Team Member'}
Employee ID: ${employee.id || 'ML1307'}

Subject: Salary Revision and Appreciation for Your Contributions

Dear ${employee.fullName},

It gives us immense pleasure to inform you that your salary has been revised in recognition of your dedication, commitment, and exceptional contribution to the organization. Your professionalism, responsibility, and positive attitude have significantly contributed to the success of our team.

As a token of our appreciation, we are pleased to revise your compensation package as follows:

Revised Annual CTC: INR ${hikeResult.revisedCTC.toLocaleString('en-IN')} (+${hikeResult.hikePercentage}% Hike)
Revised Monthly Gross: INR ${hikeResult.revisedStructure.monthly.gross.toLocaleString('en-IN')}

Management is pleased to effect the following changes in your terms of employment with effective from ${effectiveFormatted}. This revision reflects our confidence in your abilities and our appreciation for the value you bring to the organization. We sincerely thank you for your hard work and dedication. We look forward to your continued growth and contribution in achieving greater milestones together.

All other terms and conditions of your employment shall remain unchanged.

Congratulations on this well-deserved salary revision. We wish you continued success in your professional journey with us.

With Appreciation,
For MARGEY LABS PVT LIMITED
Authorized Signatory
Human Resources Department`
  };
}

module.exports = {
  calculateHike,
  generateAppraisalLetter
};

