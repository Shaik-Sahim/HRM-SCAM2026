const { calculateSalaryStructure } = require('../services/payrollEngine');

const statutorySettings = {
  currency: 'INR',
  currencySymbol: '₹',
  enablePF: true,
  capPF: false, // calculate full 12% or cap at 1800
  pfRate: 12,
  enableESI: true,
  esiWageCeiling: 21000,
  esiRate: 0.75,
  enablePTax: true,
  standardPTax: 200,
  includePFInCTC: true
};

const companyProfile = {
  name: "Margey Labs Pvt. Ltd.",
  legalName: "MARGEY LABS PRIVATE LIMITED",
  tagline: "MARGEY LABS PVT. LTD.",
  cin: "U58200KA2024PTC191015",
  pan: "AABCM9823M",
  tan: "BLRM01234D",
  gstin: "29AABCM9823M1Z8",
  address: "4th Floor, GR Arcade, Marathahalli, Bengaluru – 560037",
  website: "margeylabs.com",
  email: "info@margeylabs.com",
  phone: "+91 86608 03099 | +91 9100588005",
  signatoryName: "Murali K",
  signatoryTitle: "Manager - Human Resources",
  bankName: "HDFC Bank Ltd.",
  bankBranch: "Marathahalli Branch, Bangalore",
  salaryAccountNo: "50200088991234",
  ifscCode: "HDFC0000128"
};

const rawEmployees = [
  {
    id: "EMP001",
    fullName: "Aarav Sharma",
    email: "aarav.sharma@margeylabs.com",
    phone: "+91 98765 43210",
    department: "Engineering",
    designation: "Lead Software Architect",
    dateOfJoining: "2022-03-15",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 2400000,
    panNumber: "BKAPS1289A",
    uanNumber: "101928374650",
    bankName: "HDFC Bank",
    bankAccountNumber: "501004561234",
    ifscCode: "HDFC0001234",
    monthlyTDS: 15400
  },
  {
    id: "EMP002",
    fullName: "Priya Nair",
    email: "priya.nair@margeylabs.com",
    phone: "+91 98234 56789",
    department: "Product & Design",
    designation: "Senior Staff Product Designer",
    dateOfJoining: "2022-06-01",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 1800000,
    panNumber: "CMMPN7821C",
    uanNumber: "101928374651",
    bankName: "ICICI Bank",
    bankAccountNumber: "002305001928",
    ifscCode: "ICIC0000023",
    monthlyTDS: 8500
  },
  {
    id: "EMP003",
    fullName: "Rohan Verma",
    email: "rohan.verma@margeylabs.com",
    phone: "+91 97654 32109",
    department: "Engineering",
    designation: "Senior Full Stack Engineer",
    dateOfJoining: "2023-01-10",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 1350000,
    panNumber: "DJRPV5632E",
    uanNumber: "101928374652",
    bankName: "Axis Bank",
    bankAccountNumber: "918020045678",
    ifscCode: "UTIB0000123",
    monthlyTDS: 4200
  },
  {
    id: "EMP004",
    fullName: "Ananya Patel",
    email: "ananya.patel@margeylabs.com",
    phone: "+91 96543 21098",
    department: "Human Resources",
    designation: "Lead HR Business Partner",
    dateOfJoining: "2023-04-12",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 960000,
    panNumber: "ELPAP8921G",
    uanNumber: "101928374653",
    bankName: "State Bank of India",
    bankAccountNumber: "389201948271",
    ifscCode: "SBIN0004567",
    monthlyTDS: 2200
  },
  {
    id: "EMP005",
    fullName: "Vikram Malhotra",
    email: "vikram.malhotra@margeylabs.com",
    phone: "+91 95432 10987",
    department: "Sales & Growth",
    designation: "Enterprise Sales Director",
    dateOfJoining: "2021-11-01",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 2800000,
    panNumber: "FKMVM3412K",
    uanNumber: "101928374654",
    bankName: "Kotak Mahindra Bank",
    bankAccountNumber: "782019284756",
    ifscCode: "KKBK0000456",
    monthlyTDS: 21000
  },
  {
    id: "EMP006",
    fullName: "Meera Krishnan",
    email: "meera.krishnan@margeylabs.com",
    phone: "+91 94321 09876",
    department: "Engineering",
    designation: "QA Automation Lead",
    dateOfJoining: "2023-08-20",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 1200000,
    panNumber: "GNPMK9012L",
    uanNumber: "101928374655",
    bankName: "HDFC Bank",
    bankAccountNumber: "501007894561",
    ifscCode: "HDFC0001234",
    monthlyTDS: 3500
  },
  {
    id: "EMP007",
    fullName: "Kabir Sen",
    email: "kabir.sen@margeylabs.com",
    phone: "+91 93210 98765",
    department: "Cloud & DevOps",
    designation: "Senior Site Reliability Engineer",
    dateOfJoining: "2022-09-05",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 1550000,
    panNumber: "HPBKS6782M",
    uanNumber: "101928374656",
    bankName: "ICICI Bank",
    bankAccountNumber: "002305004589",
    ifscCode: "ICIC0000023",
    monthlyTDS: 5800
  },
  {
    id: "EMP008",
    fullName: "Sneha Kulkarni",
    email: "sneha.kulkarni@margeylabs.com",
    phone: "+91 92109 87654",
    department: "Finance & Accounts",
    designation: "Senior Financial Analyst",
    dateOfJoining: "2023-02-18",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 1100000,
    panNumber: "JPRSK2398P",
    uanNumber: "101928374657",
    bankName: "Axis Bank",
    bankAccountNumber: "918020089123",
    ifscCode: "UTIB0000123",
    monthlyTDS: 2900
  },
  {
    id: "EMP009",
    fullName: "Tanvi Saxena",
    email: "tanvi.saxena@margeylabs.com",
    phone: "+91 91098 76543",
    department: "Marketing",
    designation: "Brand & Growth Lead",
    dateOfJoining: "2023-09-01",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 1150000,
    panNumber: "KLMTS4509R",
    uanNumber: "101928374658",
    bankName: "HDFC Bank",
    bankAccountNumber: "501009871234",
    ifscCode: "HDFC0001234",
    monthlyTDS: 3100
  },
  {
    id: "EMP010",
    fullName: "Arjun Reddy",
    email: "arjun.reddy@margeylabs.com",
    phone: "+91 90987 65432",
    department: "Engineering",
    designation: "Associate Full Stack Developer",
    dateOfJoining: "2024-01-15",
    status: "Active",
    employmentType: "Full-Time",
    annualCTC: 750000,
    panNumber: "MNPAR1234T",
    uanNumber: "101928374659",
    bankName: "State Bank of India",
    bankAccountNumber: "389209871234",
    ifscCode: "SBIN0004567",
    monthlyTDS: 800
  }
];

const employees = rawEmployees.map(emp => ({
  ...emp,
  salaryStructure: calculateSalaryStructure(emp.annualCTC, statutorySettings)
}));

// Default monthly attendance matrix for current month (e.g. October 2026, 30 days)
const defaultAttendance = {
  "2026-10": {
    monthYear: "2026-10",
    monthName: "October 2026",
    totalWorkingDays: 31,
    records: {
      "EMP001": { presentDays: 29, paidLeaves: 2, halfDays: 0, unpaidLeaves: 0, overtimeHours: 12, holidays: 4 },
      "EMP002": { presentDays: 28, paidLeaves: 2, halfDays: 1, unpaidLeaves: 0, overtimeHours: 6, holidays: 4 },
      "EMP003": { presentDays: 27, paidLeaves: 1, halfDays: 0, unpaidLeaves: 2, overtimeHours: 18, holidays: 4 },
      "EMP004": { presentDays: 30, paidLeaves: 1, halfDays: 0, unpaidLeaves: 0, overtimeHours: 4, holidays: 4 },
      "EMP005": { presentDays: 29, paidLeaves: 2, halfDays: 0, unpaidLeaves: 0, overtimeHours: 8, holidays: 4 },
      "EMP006": { presentDays: 28, paidLeaves: 2, halfDays: 2, unpaidLeaves: 0, overtimeHours: 15, holidays: 4 },
      "EMP007": { presentDays: 29, paidLeaves: 1, halfDays: 0, unpaidLeaves: 1, overtimeHours: 24, holidays: 4 },
      "EMP008": { presentDays: 30, paidLeaves: 1, halfDays: 0, unpaidLeaves: 0, overtimeHours: 5, holidays: 4 },
      "EMP009": { presentDays: 26, paidLeaves: 2, halfDays: 0, unpaidLeaves: 3, overtimeHours: 0, holidays: 4 },
      "EMP010": { presentDays: 29, paidLeaves: 1, halfDays: 1, unpaidLeaves: 0, overtimeHours: 10, holidays: 4 }
    }
  },
  "2026-09": {
    monthYear: "2026-09",
    monthName: "September 2026",
    totalWorkingDays: 30,
    records: {
      "EMP001": { presentDays: 28, paidLeaves: 2, halfDays: 0, unpaidLeaves: 0, overtimeHours: 10, holidays: 4 },
      "EMP002": { presentDays: 27, paidLeaves: 2, halfDays: 0, unpaidLeaves: 1, overtimeHours: 4, holidays: 4 },
      "EMP003": { presentDays: 29, paidLeaves: 1, halfDays: 0, unpaidLeaves: 0, overtimeHours: 12, holidays: 4 },
      "EMP004": { presentDays: 28, paidLeaves: 2, halfDays: 0, unpaidLeaves: 0, overtimeHours: 0, holidays: 4 },
      "EMP005": { presentDays: 28, paidLeaves: 1, halfDays: 0, unpaidLeaves: 1, overtimeHours: 10, holidays: 4 },
      "EMP006": { presentDays: 29, paidLeaves: 1, halfDays: 0, unpaidLeaves: 0, overtimeHours: 16, holidays: 4 },
      "EMP007": { presentDays: 30, paidLeaves: 0, halfDays: 0, unpaidLeaves: 0, overtimeHours: 20, holidays: 4 },
      "EMP008": { presentDays: 28, paidLeaves: 2, halfDays: 0, unpaidLeaves: 0, overtimeHours: 2, holidays: 4 },
      "EMP009": { presentDays: 27, paidLeaves: 2, halfDays: 0, unpaidLeaves: 1, overtimeHours: 0, holidays: 4 },
      "EMP010": { presentDays: 29, paidLeaves: 1, halfDays: 0, unpaidLeaves: 0, overtimeHours: 8, holidays: 4 }
    }
  }
};

// Historical Hikes & Appraisals
const defaultHikes = [
  {
    id: "HIKE-2026-001",
    employeeId: "EMP001",
    employeeName: "Aarav Sharma",
    department: "Engineering",
    previousCTC: 2000000,
    revisedCTC: 2400000,
    hikePercentage: 20,
    hikeAmount: 400000,
    effectiveDate: "2026-07-01",
    reviewPeriod: "Mid-Year Performance Cycle 2026",
    rating: "Outstanding (5/5)",
    status: "Approved",
    approvedBy: "Chief People Officer",
    remarks: "Spearheaded the migration of the core microservices architecture to Kubernetes and zero-downtime deployment pipelines.",
    createdAt: "2026-07-15T10:30:00Z"
  },
  {
    id: "HIKE-2026-002",
    employeeId: "EMP002",
    employeeName: "Priya Nair",
    department: "Product & Design",
    previousCTC: 1550000,
    revisedCTC: 1800000,
    hikePercentage: 16.13,
    hikeAmount: 250000,
    effectiveDate: "2026-08-01",
    reviewPeriod: "Annual Appraisal 2026",
    rating: "Exceeds Expectations (4.5/5)",
    status: "Approved",
    approvedBy: "VP of Product",
    remarks: "Delivered complete brand refresh and unified multi-tenant design system adopted across 4 major flagship apps.",
    createdAt: "2026-08-05T14:15:00Z"
  },
  {
    id: "HIKE-2026-003",
    employeeId: "EMP003",
    employeeName: "Rohan Verma",
    department: "Engineering",
    previousCTC: 1150000,
    revisedCTC: 1350000,
    hikePercentage: 17.39,
    hikeAmount: 200000,
    effectiveDate: "2026-09-01",
    reviewPeriod: "Promotion Cycle 2026",
    rating: "Exceeds Expectations (4.5/5)",
    status: "Approved",
    approvedBy: "Engineering Director",
    remarks: "Promoted to Senior Full Stack Engineer. Mentored 3 junior engineers and reduced API response latencies by 42%.",
    createdAt: "2026-09-10T09:00:00Z"
  }
];

module.exports = {
  statutorySettings,
  companyProfile,
  employees,
  defaultAttendance,
  defaultHikes
};

