// Apex HRM Payroll Engine
// Accurate salary breakdown, proration, statutory deductions, and in-words translation

function numberToWords(amount, currency = 'INR') {
  if (isNaN(amount) || amount === 0) return 'Zero';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(num) {
    if (num < 20) return ones[num];
    const unit = num % 10;
    return tens[Math.floor(num / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(num) {
    let result = '';
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    if (hundred > 0) {
      result += ones[hundred] + ' Hundred';
      if (rest > 0) result += ' and ';
    }
    if (rest > 0) {
      result += convertTwoDigits(rest);
    }
    return result;
  }

  const intVal = Math.floor(Math.abs(amount));
  
  if (currency === 'INR') {
    // Indian numbering system: Crores, Lakhs, Thousands, Hundreds
    let remaining = intVal;
    let parts = [];

    const crores = Math.floor(remaining / 10000000);
    remaining %= 10000000;

    const lakhs = Math.floor(remaining / 100000);
    remaining %= 100000;

    const thousands = Math.floor(remaining / 1000);
    remaining %= 1000;

    const hundredsAndRest = remaining;

    if (crores > 0) parts.push(convertThreeDigits(crores) + ' Crore');
    if (lakhs > 0) parts.push(convertTwoDigits(lakhs) + ' Lakh');
    if (thousands > 0) parts.push(convertTwoDigits(thousands) + ' Thousand');
    if (hundredsAndRest > 0) parts.push(convertThreeDigits(hundredsAndRest));

    const words = parts.join(' ') + ' Rupees Only';
    return words.trim();
  } else {
    // Standard Western numbering: Millions, Thousands
    let remaining = intVal;
    let parts = [];

    const millions = Math.floor(remaining / 1000000);
    remaining %= 1000000;

    const thousands = Math.floor(remaining / 1000);
    remaining %= 1000;

    const hundreds = remaining;

    if (millions > 0) parts.push(convertThreeDigits(millions) + ' Million');
    if (thousands > 0) parts.push(convertThreeDigits(thousands) + ' Thousand');
    if (hundreds > 0) parts.push(convertThreeDigits(hundreds));

    const words = (currency === 'USD' ? 'US Dollars ' : currency + ' ') + parts.join(' ') + ' Only';
    return words.trim();
  }
}

/**
 * Deconstruct annual CTC into monthly salary structure components
 * Follows the official Profuse Transtech Solutions structure:
 * - Basic Pay: 60% of CTC
 * - HRA: 40% of Basic Pay (24% of CTC)
 * - Conveyance Allowance: ₹9,600/yr (₹800/mo)
 * - Medical Allowance: ₹15,000/yr (₹1,250/mo)
 * - Special Allowance: Balance to match Gross CTC
 */
function calculateSalaryStructure(annualCTC, statutorySettings = {}) {
  const ctc = Math.max(0, Number(annualCTC) || 0);
  const monthlyCTC = Number((ctc / 12).toFixed(2));

  // Component ratios based on Profuse template standard
  const basicAnnual = Math.round(ctc * 0.60);
  const hraAnnual = Math.round(basicAnnual * 0.40);
  const conveyanceAnnual = ctc > 100000 ? 9600 : 0;
  const medicalAnnual = ctc > 100000 ? 15000 : 0;
  
  // Special Allowance is the balancing figure
  const specialAllowanceAnnual = Math.max(0, ctc - (basicAnnual + hraAnnual + conveyanceAnnual + medicalAnnual));

  const basicMonthly = Number((basicAnnual / 12).toFixed(2));
  const hraMonthly = Number((hraAnnual / 12).toFixed(2));
  const conveyanceMonthly = Number((conveyanceAnnual / 12).toFixed(2));
  const medicalMonthly = Number((medicalAnnual / 12).toFixed(2));
  const specialAllowanceMonthly = Number((specialAllowanceAnnual / 12).toFixed(2));

  return {
    annualCTC: ctc,
    monthlyCTC,
    annual: {
      basic: basicAnnual,
      hra: hraAnnual,
      conveyance: conveyanceAnnual,
      medical: medicalAnnual,
      specialAllowance: specialAllowanceAnnual,
      gross: ctc
    },
    monthly: {
      basic: basicMonthly,
      hra: hraMonthly,
      conveyance: conveyanceMonthly,
      medical: medicalMonthly,
      specialAllowance: specialAllowanceMonthly,
      gross: monthlyCTC
    }
  };
}

/**
 * Calculate Monthly Payroll with Attendance Proration and Statutory Deductions
 */
function processMonthlyPayroll(employee, attendance, adjustments = {}, statutorySettings = {}) {
  const structure = employee.salaryStructure || calculateSalaryStructure(employee.annualCTC, statutorySettings);
  const m = structure.monthly;

  // Attendance metrics
  const totalDays = Number(attendance.totalWorkingDays) || 30;
  const presentDays = Number(attendance.presentDays) || 0;
  const paidLeaves = Number(attendance.paidLeaves) || 0;
  const holidays = Number(attendance.holidays) || 0;
  const halfDays = Number(attendance.halfDays) || 0;
  const unpaidLeaves = Number(attendance.unpaidLeaves || attendance.lwp) || 0;
  const overtimeHours = Number(attendance.overtimeHours) || 0;

  // Effective payable days
  // half day counts as 0.5 present, 0.5 loss of pay if unpaid
  const effectivePresent = presentDays + (halfDays * 0.5);
  const payableDays = Math.max(0, Math.min(totalDays, effectivePresent + paidLeaves + holidays));
  const lwpDays = Math.max(0, totalDays - payableDays);

  const prorationRatio = totalDays > 0 ? payableDays / totalDays : 1;

  // Prorated Earnings
  const earnedBasic = Math.round(m.basic * prorationRatio);
  const earnedHRA = Math.round(m.hra * prorationRatio);
  const earnedConveyance = Math.round(m.conveyance * prorationRatio);
  const earnedMedical = Math.round(m.medical * prorationRatio);
  const earnedSpecial = Math.round(m.specialAllowance * prorationRatio);

  // Overtime computation: hourly rate = (Basic / totalDays / 8) * overtimeRateMultiplier (1.5x)
  const hourlyRate = totalDays > 0 ? (m.basic / totalDays / 8) : 0;
  const overtimePay = Math.round(hourlyRate * 1.5 * overtimeHours);

  // Adjustments & Variable Pay
  const bonus = Number(adjustments.bonus) || 0;
  const incentive = Number(adjustments.incentive) || 0;
  const arrears = Number(adjustments.arrears) || 0;
  const otherAllowances = Number(adjustments.otherAllowances) || 0;

  const totalGrossEarnings = earnedBasic + earnedHRA + earnedConveyance + earnedMedical + 
                             earnedSpecial + overtimePay + bonus + incentive + arrears + otherAllowances;

  // Statutory Deductions
  // 1. Employee Provident Fund (PF): 12% of basic (capped at ₹1,800 or actual)
  let pfDeduction = 0;
  if (employee.pfOptOut !== true && statutorySettings.enablePF !== false) {
    if (statutorySettings.capPF !== false) {
      pfDeduction = Math.min(1800, Math.round(earnedBasic * 0.12));
    } else {
      pfDeduction = Math.round(earnedBasic * 0.12);
    }
  }

  // 2. Employee State Insurance (ESI): 0.75% of gross if gross <= ₹21,000/mo
  let esiDeduction = 0;
  if (statutorySettings.enableESI !== false) {
    const esiCeiling = statutorySettings.esiWageCeiling || 21000;
    if (totalGrossEarnings <= esiCeiling && totalGrossEarnings > 0) {
      esiDeduction = Math.round(totalGrossEarnings * 0.0075);
    }
  }

  // 3. Professional Tax (PTax)
  let ptaxDeduction = 0;
  if (statutorySettings.enablePTax !== false) {
    if (totalGrossEarnings > 15000) {
      ptaxDeduction = 200; // Standard typical slab
    } else if (totalGrossEarnings > 10000) {
      ptaxDeduction = 150;
    }
  }

  // 4. Tax Deducted at Source (TDS) / Income Tax
  const tdsDeduction = Number(adjustments.tdsDeduction !== undefined ? adjustments.tdsDeduction : (employee.monthlyTDS || 0));

  // 5. Loss of pay calculated explicitly for display
  const lwpDeductionAmount = Math.round((m.basic + m.hra + m.specialAllowance) * (lwpDays / totalDays));

  // 6. Other deductions (advances, loan repayment, penalties)
  const advanceDeduction = Number(adjustments.advanceDeduction) || 0;
  const otherDeductions = Number(adjustments.otherDeductions) || 0;

  const totalDeductions = pfDeduction + esiDeduction + ptaxDeduction + tdsDeduction + advanceDeduction + otherDeductions;
  const netPay = Math.max(0, totalGrossEarnings - totalDeductions);

  return {
    employeeId: employee.id,
    employeeName: employee.fullName,
    department: employee.department,
    designation: employee.designation,
    panNumber: employee.panNumber,
    bankAccountNumber: employee.bankAccountNumber,
    bankName: employee.bankName,
    ifscCode: employee.ifscCode,
    uanNumber: employee.uanNumber,
    attendance: {
      totalWorkingDays: totalDays,
      presentDays,
      paidLeaves,
      holidays,
      halfDays,
      unpaidLeaves: lwpDays,
      payableDays,
      overtimeHours
    },
    earnings: {
      basic: earnedBasic,
      hra: earnedHRA,
      conveyance: earnedConveyance,
      medical: earnedMedical,
      specialAllowance: earnedSpecial,
      overtime: overtimePay,
      bonus,
      incentive,
      arrears,
      otherAllowances,
      totalGross: totalGrossEarnings
    },
    deductions: {
      providentFund: pfDeduction,
      esi: esiDeduction,
      professionalTax: ptaxDeduction,
      tds: tdsDeduction,
      advance: advanceDeduction,
      lossOfPayDays: lwpDays,
      lossOfPayAmount: lwpDeductionAmount,
      otherDeductions,
      totalDeductions
    },
    netPay,
    netPayInWords: numberToWords(netPay, statutorySettings.currency || 'INR'),
    currency: statutorySettings.currency || 'INR',
    processedAt: new Date().toISOString()
  };
}

module.exports = {
  calculateSalaryStructure,
  processMonthlyPayroll,
  numberToWords
};

