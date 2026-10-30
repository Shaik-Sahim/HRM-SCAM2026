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

  const monthlyCurrentGross = currentStructure.monthly.basic + currentStructure.monthly.hra + 
                              currentStructure.monthly.conveyance + currentStructure.monthly.medical + 
                              currentStructure.monthly.specialAllowance;
  const monthlyRevisedGross = revisedStructure.monthly.basic + revisedStructure.monthly.hra + 
                              revisedStructure.monthly.conveyance + revisedStructure.monthly.medical + 
                              revisedStructure.monthly.specialAllowance;

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

  const refId = `Profuse/APP/${new Date().getFullYear()}/PTS${String(Math.floor(1000 + Math.random() * 9000))}`;

  return {
    letterRef: refId,
    id: refId,
    type: 'appraisal',
    title: 'Salary Revision & Appraisal Letter',
    issuedDate: `Dated: ${dateToday}`,
    issueDate: new Date().toISOString().split('T')[0],
    employee: {
      name: employee.fullName,
      fullName: employee.fullName,
      id: employee.id || 'PTS1307',
      designation: employee.designation,
      department: employee.department
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
    subject: `Annual Performance Review & Salary Revision - ${new Date().getFullYear()}`,
    content: `Dear ${employee.fullName},

Huge Congratulations!

We are delighted to confirm your compensation review at Profuse Transtech Solutions Pvt Ltd for the performance cycle ${hikeResult.reviewPeriod}.

Your overall performance rating has been evaluated as "${hikeResult.rating}". The management deeply appreciates your sustained dedication, excellence, and valuable contributions to the growth of the company.

In recognition of your performance and valued contribution, we are pleased to revise your Annual Total Compensation effective ${effectiveFormatted}:

  • Previous Annual CTC: INR ${hikeResult.currentCTC.toLocaleString('en-IN')}
  • Revised Annual CTC:  INR ${hikeResult.revisedCTC.toLocaleString('en-IN')}
  • Hike Percentage:     +${hikeResult.hikePercentage}% (+INR ${hikeResult.hikeAmount.toLocaleString('en-IN')} per annum)
  • Revised Monthly Gross: INR ${hikeResult.revisedStructure.monthly.gross.toLocaleString('en-IN')}
  ${hikeResult.arrearsPayable > 0 ? `• Retroactive Arrears (${hikeResult.retroactiveMonths} months): INR ${hikeResult.arrearsPayable.toLocaleString('en-IN')} (to be disbursed in upcoming payroll)` : ''}

${hikeResult.remarks}

However, the structure of your compensation may be altered / changed from time to time based on Company's policy. All other terms and conditions of your employment agreement will remain unchanged. Your salary details are strictly private and confidential and should not be disclosed or discussed with others.

Best Wishes,
Yours Sincerely,
For Profuse Transtech Solutions Pvt Ltd.`
  };
}

module.exports = {
  calculateHike,
  generateAppraisalLetter
};

