const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const {
  calculateSalaryStructure,
  processMonthlyPayroll,
  numberToWords
} = require('./services/payrollEngine');

const {
  calculateHike,
  generateAppraisalLetter
} = require('./services/hikeEngine');

const {
  generateOfferLetter,
  generateExperienceLetter,
  generateRelievingLetter,
  calculateTenure
} = require('./services/documentEngine');

const {
  statutorySettings: initialStatutory,
  companyProfile: initialCompany,
  employees: initialEmployees,
  defaultAttendance,
  defaultHikes
} = require('./data/defaultData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-memory persistent database with auto-hydration
const employeesJsonPath = path.join(__dirname, 'data', 'employees.json');

function persistEmployees() {
  try {
    fs.writeFileSync(employeesJsonPath, JSON.stringify(db.employees, null, 2), 'utf8');
  } catch (err) {
    console.error('Error persisting employees to employees.json:', err);
  }
}

let db = {
  company: { ...initialCompany },
  statutory: { ...initialStatutory },
  employees: [...initialEmployees],
  attendance: { ...defaultAttendance },
  hikes: [...defaultHikes],
  payrollRuns: [],
  payslips: [],
  documents: []
};

// Initial pre-generation of September 2026 payroll & payslips so dashboard has immediate rich data
function seedInitialPayroll() {
  const month = "2026-09";
  const attMonth = db.attendance[month] || { totalWorkingDays: 30, records: {} };
  const generatedSlips = [];

  db.employees.forEach(emp => {
    const attRecord = attMonth.records[emp.id] || {
      presentDays: 28,
      paidLeaves: 2,
      halfDays: 0,
      unpaidLeaves: 0,
      overtimeHours: 5,
      holidays: 4
    };

    const slip = processMonthlyPayroll(
      emp,
      { ...attRecord, totalWorkingDays: attMonth.totalWorkingDays },
      { bonus: emp.id === 'EMP005' ? 25000 : 0 },
      db.statutory
    );

    slip.id = `PAY-${month}-${emp.id}`;
    slip.monthYear = month;
    slip.monthName = "September 2026";
    slip.status = "Disbursed";
    slip.paymentMode = "Direct Bank Transfer";
    slip.disbursedDate = "2026-09-30";
    generatedSlips.push(slip);
  });

  db.payslips = generatedSlips;
  db.payrollRuns = [
    {
      id: `RUN-${month}`,
      monthYear: month,
      monthName: "September 2026",
      processedAt: "2026-09-30T17:00:00Z",
      employeeCount: db.employees.length,
      totalGross: generatedSlips.reduce((sum, s) => sum + s.earnings.totalGross, 0),
      totalDeductions: generatedSlips.reduce((sum, s) => sum + s.deductions.totalDeductions, 0),
      totalNetPay: generatedSlips.reduce((sum, s) => sum + s.netPay, 0),
      status: "Disbursed"
    }
  ];
}

function seedInitialDocuments() {
  const todayIso = new Date().toISOString().split('T')[0];
  const sampleOffer = generateOfferLetter({
    id: "MARGEY/OFFER/2026/101",
    candidateName: "Ms. Batta Vyshnavi",
    email: "vyshnavi.batta@example.com",
    phone: "+91 86608 03099",
    address: "Papireddypalem,\nT.P. Gudur Mandal, Nellore District,\nAndhra Pradesh",
    designation: "HR Executive",
    department: "Human Resources",
    annualCTC: 600000,
    joiningDate: "2026-11-15",
    probationMonths: 6,
    noticePeriodDays: 60,
    workLocation: "Bangalore",
    reportingTo: "[Name / Designation]",
    issueDate: todayIso
  }, db.company, db.statutory);

  const sampleExp = generateExperienceLetter({
    id: "MARGEY/EXP/2026/042",
    employeeId: "EMP-089",
    employeeName: "Neha Kapur",
    designation: "Staff Product Designer",
    department: "Product & Design",
    dateOfJoining: "2023-04-01",
    relievingDate: "2026-09-30",
    conductRating: "Outstanding & Creative Leader",
    responsibilitiesSummary: "Established global design systems, conducted enterprise user research, and delivered award-winning cloud UI experiences across multi-tenant platforms.",
    issueDate: "2026-09-30"
  }, db.company);

  const sampleRel = generateRelievingLetter({
    id: "MARGEY/REL/2026/039",
    employeeId: "EMP-076",
    employeeName: "Kunal Mehta",
    designation: "Senior Backend Systems Engineer",
    department: "Engineering",
    resignationDate: "2026-08-15",
    relievingDate: "2026-10-15",
    clearanceStatus: "All IT Assets, Keys & Access Tokens Surrendered",
    settlementDetails: "Full & Final settlement disbursed including leave encashment and gratuity with zero pending liabilities.",
    issueDate: "2026-10-15"
  }, db.company);

  db.documents = [sampleOffer, sampleExp, sampleRel];
}

seedInitialPayroll();
seedInitialDocuments();

// ======================= API ROUTES ======================= //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', app: 'Apex HRM Engine', timestamp: new Date().toISOString() });
});

// Company Settings
app.get('/api/company', (req, res) => {
  res.json({ company: db.company, statutory: db.statutory });
});

app.put('/api/company', (req, res) => {
  if (req.body.company) db.company = { ...db.company, ...req.body.company };
  if (req.body.statutory) db.statutory = { ...db.statutory, ...req.body.statutory };
  res.json({ success: true, company: db.company, statutory: db.statutory });
});

// Helper: Generate guaranteed unique alphanumeric employee ID
function generateUniqueEmployeeId(existingEmployees = []) {
  const prefix = 'ML';
  const existingIds = new Set(existingEmployees.map(e => String(e.id || '').toUpperCase()));
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let attempt = 0; attempt < 10000; attempt++) {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidate = `${prefix}${code}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  // Fallback timestamp-based alphanumeric unique code
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

// Employees CRUD
app.get('/api/employees', (req, res) => {
  res.json(db.employees);
});

// Endpoint to generate a fresh unique alphanumeric Employee ID
app.get('/api/employees/generate-id', (req, res) => {
  const newId = generateUniqueEmployeeId(db.employees);
  res.json({ id: newId });
});

app.get('/api/employees/:id', (req, res) => {
  const emp = db.employees.find(e => String(e.id).toUpperCase() === String(req.params.id).toUpperCase());
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(emp);
});

app.post('/api/employees', (req, res) => {
  const data = req.body;
  if (!data.fullName || (!data.annualCTC && !data.customSalary && !data.salaryStructure)) {
    return res.status(400).json({ error: 'Full name and salary details are required' });
  }

  let empId = data.id ? String(data.id).trim().toUpperCase() : '';

  if (empId) {
    // Validate alphanumeric (letters, numbers, hyphens/underscores, 3 to 20 chars)
    if (!/^[A-Z0-9_-]{3,20}$/.test(empId)) {
      return res.status(400).json({ 
        error: 'Employee ID must be alphanumeric (3 to 20 characters, letters and numbers only).' 
      });
    }
    // Validate uniqueness against existing employees
    const exists = db.employees.some(e => String(e.id).toUpperCase() === empId);
    if (exists) {
      return res.status(400).json({ 
        error: `Employee ID "${empId}" is already assigned. Employee ID must be unique.` 
      });
    }
  } else {
    empId = generateUniqueEmployeeId(db.employees);
  }

  const annualCTC = Number(data.annualCTC) || (data.salaryStructure?.annual?.gross ? Number(data.salaryStructure.annual.gross) : 600000);

  const newEmp = {
    id: empId,
    fullName: data.fullName.trim(),
    email: data.email || `${data.fullName.toLowerCase().replace(/\s+/g, '.')}@margeylabs.com`,
    phone: data.phone || '+91 99000 00000',
    dateOfBirth: data.dateOfBirth || data.dob || '1992-05-15',
    dateOfJoining: data.dateOfJoining || new Date().toISOString().split('T')[0],
    groupDOJ: data.groupDOJ || data.groupDoj || data.dateOfJoining || new Date().toISOString().split('T')[0],
    pfNumber: data.pfNumber || data.pfNo || 'MH/BAN/43477',
    location: data.location || data.workLocation || 'BANGALORE 04',
    department: data.department || 'Engineering',
    designation: data.designation || 'Specialist',
    status: data.status || 'Active',
    employmentType: data.employmentType || 'Full-Time',
    annualCTC: annualCTC,
    panNumber: data.panNumber || 'ABCDE1234F',
    uanNumber: data.uanNumber || '101900000000',
    bankName: data.bankName || 'HDFC Bank',
    bankAccountNumber: data.bankAccountNumber || '501000000000',
    ifscCode: data.ifscCode || 'HDFC0001234',
    monthlyTDS: Number(data.monthlyTDS) || 0,
    customSalary: data.customSalary || null
  };

  // If user provided custom monthly salary breakdown, calculate or preserve it precisely
  if (data.salaryStructure && data.salaryStructure.monthly) {
    newEmp.salaryStructure = data.salaryStructure;
  } else {
    newEmp.salaryStructure = calculateSalaryStructure(newEmp.annualCTC, db.statutory, data.customSalary);
  }

  db.employees.push(newEmp);
  persistEmployees();

  res.status(201).json(newEmp);
});

app.put('/api/employees/:id', (req, res) => {
  const index = db.employees.findIndex(e => String(e.id).toUpperCase() === String(req.params.id).toUpperCase());
  if (index === -1) return res.status(404).json({ error: 'Employee not found' });

  const existing = db.employees[index];
  const updated = { ...existing, ...req.body };

  if (req.body.id) {
    const candidateId = String(req.body.id).trim().toUpperCase();
    if (candidateId !== String(existing.id).toUpperCase()) {
      if (!/^[A-Z0-9_-]{3,20}$/.test(candidateId)) {
        return res.status(400).json({ 
          error: 'Employee ID must be alphanumeric (3 to 20 characters, letters and numbers only).' 
        });
      }
      const duplicate = db.employees.some((e, i) => i !== index && String(e.id).toUpperCase() === candidateId);
      if (duplicate) {
        return res.status(400).json({ 
          error: `Employee ID "${candidateId}" already exists. Employee ID must be unique.` 
        });
      }
      updated.id = candidateId;
    }
  }

  if (req.body.salaryStructure && req.body.salaryStructure.monthly) {
    updated.salaryStructure = req.body.salaryStructure;
    if (req.body.salaryStructure.annual?.gross) {
      updated.annualCTC = req.body.salaryStructure.annual.gross;
    }
  } else if (req.body.annualCTC && Number(req.body.annualCTC) !== existing.annualCTC) {
    updated.annualCTC = Number(req.body.annualCTC);
    updated.salaryStructure = calculateSalaryStructure(updated.annualCTC, db.statutory, req.body.customSalary || existing.customSalary);
  }

  db.employees[index] = updated;
  persistEmployees();
  res.json(updated);
});

app.delete('/api/employees/:id', (req, res) => {
  const index = db.employees.findIndex(e => String(e.id).toUpperCase() === String(req.params.id).toUpperCase());
  if (index === -1) return res.status(404).json({ error: 'Employee not found' });
  const removed = db.employees.splice(index, 1);
  persistEmployees();
  res.json({ success: true, removed: removed[0] });
});

// Salary Structure Calculator Endpoint (Preview without saving)
app.post('/api/salary/calculate', (req, res) => {
  const { annualCTC, customSalary } = req.body;
  if (!annualCTC && !customSalary) return res.status(400).json({ error: 'annualCTC or customSalary is required' });
  const structure = calculateSalaryStructure(annualCTC, db.statutory, customSalary);
  res.json(structure);
});

// Attendance Management
app.get('/api/attendance/:monthYear', (req, res) => {
  const { monthYear } = req.params;
  let monthData = db.attendance[monthYear];

  // If month does not exist, create empty template with default 30 days
  if (!monthData) {
    const [year, month] = monthYear.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    monthData = {
      monthYear,
      monthName: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalWorkingDays: daysInMonth,
      records: {}
    };

    // Prepopulate defaults for each active employee
    db.employees.forEach(emp => {
      monthData.records[emp.id] = {
        presentDays: daysInMonth - 4, // 4 weekend days
        paidLeaves: 2,
        halfDays: 0,
        unpaidLeaves: 0,
        overtimeHours: 0,
        holidays: 2
      };
    });

    db.attendance[monthYear] = monthData;
  }

  res.json(monthData);
});

app.post('/api/attendance/:monthYear', (req, res) => {
  const { monthYear } = req.params;
  const { totalWorkingDays, records } = req.body;

  if (!db.attendance[monthYear]) {
    const [year, month] = monthYear.split('-').map(Number);
    db.attendance[monthYear] = {
      monthYear,
      monthName: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalWorkingDays: totalWorkingDays || 30,
      records: {}
    };
  }

  if (totalWorkingDays) db.attendance[monthYear].totalWorkingDays = Number(totalWorkingDays);
  if (records) {
    db.attendance[monthYear].records = {
      ...db.attendance[monthYear].records,
      ...records
    };
  }

  res.json({ success: true, data: db.attendance[monthYear] });
});

// Compensation & Hike Engine
app.get('/api/hikes', (req, res) => {
  res.json(db.hikes);
});

// Simulate hike without applying
app.post('/api/hikes/simulate', (req, res) => {
  const { employeeId, type, value, effectiveDate, announcementDate, rating, reviewPeriod, remarks } = req.body;
  const emp = db.employees.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const hikeResult = calculateHike(emp.annualCTC, {
    type: type || 'percentage',
    value: Number(value),
    effectiveDate,
    announcementDate,
    rating,
    reviewPeriod,
    remarks
  }, db.statutory);

  const letter = generateAppraisalLetter(emp, hikeResult, db.company);

  res.json({
    simulation: hikeResult,
    letterPreview: letter
  });
});

// Commit & Apply Hike to Employee
app.post('/api/hikes/apply', (req, res) => {
  const { employeeId, type, value, effectiveDate, announcementDate, rating, reviewPeriod, remarks } = req.body;
  const empIndex = db.employees.findIndex(e => e.id === employeeId);
  if (empIndex === -1) return res.status(404).json({ error: 'Employee not found' });

  const emp = db.employees[empIndex];
  const hikeResult = calculateHike(emp.annualCTC, {
    type: type || 'percentage',
    value: Number(value),
    effectiveDate,
    announcementDate,
    rating,
    reviewPeriod,
    remarks
  }, db.statutory);

  const hikeRecord = {
    id: `HIKE-${new Date().getFullYear()}-${String(db.hikes.length + 1).padStart(3, '0')}`,
    employeeId: emp.id,
    employeeName: emp.fullName,
    department: emp.department,
    designation: emp.designation,
    previousCTC: emp.annualCTC,
    revisedCTC: hikeResult.revisedCTC,
    hikePercentage: hikeResult.hikePercentage,
    hikeAmount: hikeResult.hikeAmount,
    retroactiveMonths: hikeResult.retroactiveMonths,
    arrearsPayable: hikeResult.arrearsPayable,
    effectiveDate: hikeResult.effectiveDate || new Date().toISOString().split('T')[0],
    reviewPeriod: hikeResult.reviewPeriod,
    rating: hikeResult.rating,
    status: 'Approved',
    approvedBy: db.company.signatoryName || 'Head of People',
    remarks: hikeResult.remarks,
    createdAt: new Date().toISOString()
  };

  // Update employee CTC and salary structure
  emp.annualCTC = hikeResult.revisedCTC;
  emp.salaryStructure = hikeResult.revisedStructure;
  db.employees[empIndex] = emp;

  // Add hike record
  db.hikes.unshift(hikeRecord);

  // Generate official letter
  const appraisalLetter = generateAppraisalLetter(emp, hikeResult, db.company);

  res.status(201).json({
    success: true,
    hike: hikeRecord,
    employee: emp,
    appraisalLetter
  });
});

// Get Appraisal Letter by Hike ID
app.get('/api/hikes/letter/:hikeId', (req, res) => {
  const hike = db.hikes.find(h => h.id === req.params.hikeId);
  if (!hike) return res.status(404).json({ error: 'Hike record not found' });

  const emp = db.employees.find(e => e.id === hike.employeeId) || {
    id: hike.employeeId,
    fullName: hike.employeeName,
    department: hike.department,
    designation: hike.designation || 'Staff'
  };

  const hikeResult = {
    currentCTC: hike.previousCTC,
    revisedCTC: hike.revisedCTC,
    hikePercentage: hike.hikePercentage,
    hikeAmount: hike.hikeAmount,
    effectiveDate: hike.effectiveDate,
    rating: hike.rating,
    reviewPeriod: hike.reviewPeriod,
    remarks: hike.remarks,
    arrearsPayable: hike.arrearsPayable || 0,
    retroactiveMonths: hike.retroactiveMonths || 0,
    revisedStructure: calculateSalaryStructure(hike.revisedCTC, db.statutory)
  };

  const letter = generateAppraisalLetter(emp, hikeResult, db.company);
  res.json({ hike, letter });
});

// ======================= PAYROLL PROCESSING RUNS ======================= //

app.get('/api/payroll/runs', (req, res) => {
  res.json(db.payrollRuns);
});

// Process payroll run for a specific month
app.post('/api/payroll/process', (req, res) => {
  const { monthYear, adjustments = {} } = req.body;
  if (!monthYear) return res.status(400).json({ error: 'monthYear is required (YYYY-MM)' });

  const [year, month] = monthYear.split('-').map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get attendance data for this month
  const attData = db.attendance[monthYear] || {
    totalWorkingDays: new Date(year, month, 0).getDate(),
    records: {}
  };

  const generatedPayslips = [];

  db.employees.forEach(emp => {
    if (emp.status !== 'Active') return;

    const empAtt = attData.records[emp.id] || {
      presentDays: attData.totalWorkingDays - 4,
      paidLeaves: 2,
      halfDays: 0,
      unpaidLeaves: 0,
      overtimeHours: 0,
      holidays: 2
    };

    const empAdj = adjustments[emp.id] || {};

    const slip = processMonthlyPayroll(
      emp,
      { ...empAtt, totalWorkingDays: attData.totalWorkingDays },
      empAdj,
      db.statutory
    );

    const slipId = `PAY-${monthYear}-${emp.id}`;
    slip.id = slipId;
    slip.monthYear = monthYear;
    slip.monthName = monthName;
    slip.status = 'Approved';
    slip.paymentMode = 'Direct Bank Transfer';
    slip.company = {
      name: db.company.name,
      legalName: db.company.legalName,
      address: db.company.address,
      cin: db.company.cin,
      pan: db.company.pan,
      gstin: db.company.gstin,
      signatoryName: db.company.signatoryName,
      signatoryTitle: db.company.signatoryTitle
    };

    // Remove existing payslip for same month/employee if exists
    db.payslips = db.payslips.filter(s => s.id !== slipId);
    db.payslips.push(slip);
    generatedPayslips.push(slip);
  });

  const totalGross = generatedPayslips.reduce((acc, s) => acc + s.earnings.totalGross, 0);
  const totalDeductions = generatedPayslips.reduce((acc, s) => acc + s.deductions.totalDeductions, 0);
  const totalNet = generatedPayslips.reduce((acc, s) => acc + s.netPay, 0);

  // Update or add payroll run
  const runId = `RUN-${monthYear}`;
  const runRecord = {
    id: runId,
    monthYear,
    monthName,
    processedAt: new Date().toISOString(),
    employeeCount: generatedPayslips.length,
    totalGross,
    totalDeductions,
    totalNetPay: totalNet,
    status: 'Processed'
  };

  db.payrollRuns = db.payrollRuns.filter(r => r.id !== runId);
  db.payrollRuns.unshift(runRecord);

  res.status(200).json({
    success: true,
    run: runRecord,
    payslipCount: generatedPayslips.length,
    payslips: generatedPayslips
  });
});

// ======================= PAYSLIPS HUB ======================= //

app.get('/api/payslips', (req, res) => {
  const { monthYear, employeeId } = req.query;
  let slips = [...db.payslips];

  if (monthYear) {
    slips = slips.filter(s => s.monthYear === monthYear);
  }
  if (employeeId) {
    slips = slips.filter(s => s.employeeId === employeeId);
  }

  res.json(slips);
});

app.get('/api/payslips/:id', (req, res) => {
  const slip = db.payslips.find(s => s.id === req.params.id);
  if (!slip) return res.status(404).json({ error: 'Payslip not found' });
  res.json(slip);
});

// Single payslip direct custom generator (HR can instantly preview or generate for any employee)
app.post('/api/payslips/generate-single', (req, res) => {
  const { employeeId, monthYear, attendance, adjustments } = req.body;
  const emp = db.employees.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const mYear = monthYear || '2026-10';
  const [year, month] = mYear.split('-').map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const att = attendance || {
    totalWorkingDays: 31,
    presentDays: 29,
    paidLeaves: 2,
    halfDays: 0,
    unpaidLeaves: 0,
    overtimeHours: 0,
    holidays: 4
  };

  const slip = processMonthlyPayroll(emp, att, adjustments || {}, db.statutory);
  slip.id = `PAY-${mYear}-${emp.id}-${Date.now().toString().slice(-4)}`;
  slip.monthYear = mYear;
  slip.monthName = monthName;
  slip.status = 'Generated';
  slip.paymentMode = 'Direct Bank Transfer';
  slip.company = {
    name: db.company.name,
    legalName: db.company.legalName,
    address: db.company.address,
    cin: db.company.cin,
    pan: db.company.pan,
    gstin: db.company.gstin,
    signatoryName: db.company.signatoryName,
    signatoryTitle: db.company.signatoryTitle
  };

  // Ensure slip is persisted in db.payslips for viewing in Payslips Hub
  const existingIdx = db.payslips.findIndex(s => s.employeeId === emp.id && s.monthYear === mYear);
  if (existingIdx !== -1) {
    db.payslips[existingIdx] = slip;
  } else {
    db.payslips.unshift(slip);
  }

  res.json(slip);
});

// ======================= DASHBOARD STATS ======================= //

app.get('/api/dashboard/stats', (req, res) => {
  const totalEmployees = db.employees.length;
  const activeEmployees = db.employees.filter(e => e.status === 'Active').length;

  const totalAnnualCTC = db.employees.reduce((acc, e) => acc + (Number(e.annualCTC) || 0), 0);
  const avgCTC = totalEmployees > 0 ? Math.round(totalAnnualCTC / totalEmployees) : 0;
  const monthlyPayrollExpense = Math.round(totalAnnualCTC / 12);

  // Department distribution
  const deptCount = {};
  const deptSalary = {};
  db.employees.forEach(e => {
    deptCount[e.department] = (deptCount[e.department] || 0) + 1;
    deptSalary[e.department] = (deptSalary[e.department] || 0) + Math.round((e.annualCTC || 0) / 12);
  });

  const departmentData = Object.keys(deptCount).map(dept => ({
    name: dept,
    count: deptCount[dept],
    monthlyExpense: deptSalary[dept]
  }));

  // Recent hikes
  const recentHikes = db.hikes.slice(0, 5);

  // Recent payroll runs
  const latestRun = db.payrollRuns[0] || null;

  // Attendance stats for latest tracked month
  const currentMonthKey = "2026-10";
  const currentAtt = db.attendance[currentMonthKey];
  let avgAttendanceRate = 95.8;
  if (currentAtt && currentAtt.records) {
    const records = Object.values(currentAtt.records);
    if (records.length > 0) {
      const totalPresent = records.reduce((acc, r) => acc + (r.presentDays || 0) + (r.paidLeaves || 0), 0);
      const totalPossible = records.length * currentAtt.totalWorkingDays;
      avgAttendanceRate = Number(((totalPresent / totalPossible) * 100).toFixed(1));
    }
  }

  res.json({
    totalEmployees,
    activeEmployees,
    totalAnnualCTC,
    avgCTC,
    monthlyPayrollExpense,
    avgAttendanceRate,
    currency: db.statutory.currency,
    currencySymbol: db.statutory.currencySymbol,
    departmentData,
    recentHikes,
    latestRun,
    totalPayslipsGenerated: db.payslips.length,
    totalDocumentsIssued: db.documents.length
  });
});

// ======================= HR DOCUMENTS & LETTERS ======================= //

app.get('/api/documents', (req, res) => {
  const { type } = req.query;
  let docs = [...db.documents];
  if (type) {
    docs = docs.filter(d => d.type === type);
  }
  res.json(docs);
});

app.get('/api/documents/:id', (req, res) => {
  const doc = db.documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

app.post('/api/documents/offer', (req, res) => {
  const letter = generateOfferLetter(req.body, db.company, db.statutory);
  db.documents.unshift(letter);
  res.status(201).json(letter);
});

app.post('/api/documents/experience', (req, res) => {
  const letter = generateExperienceLetter(req.body, db.company);
  db.documents.unshift(letter);
  res.status(201).json(letter);
});

app.post('/api/documents/relieving', (req, res) => {
  const letter = generateRelievingLetter(req.body, db.company);
  db.documents.unshift(letter);
  res.status(201).json(letter);
});

app.delete('/api/documents/:id', (req, res) => {
  const idx = db.documents.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });
  const removed = db.documents.splice(idx, 1);
  res.json({ success: true, removed: removed[0] });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Only listen when executed directly (not when required as a serverless handler on Vercel)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Apex HRM Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
