// API Client for OmniaHRM

const API_BASE = '/api';

export async function fetchCompany() {
  const res = await fetch(`${API_BASE}/company`);
  if (!res.ok) throw new Error('Failed to fetch company profile');
  return res.json();
}

export async function updateCompany(data) {
  const res = await fetch(`${API_BASE}/company`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update company profile');
  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function getUniqueEmployeeId() {
  const res = await fetch(`${API_BASE}/employees/generate-id`);
  if (!res.ok) throw new Error('Failed to generate unique employee ID');
  return res.json();
}

export async function createEmployee(data) {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create employee');
  }
  return res.json();
}

export async function updateEmployee(id, data) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update employee');
  }
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete employee');
  return res.json();
}

export async function calculateSalaryStructure(annualCTC) {
  const res = await fetch(`${API_BASE}/salary/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ annualCTC })
  });
  if (!res.ok) throw new Error('Failed to calculate structure');
  return res.json();
}

export async function fetchAttendance(monthYear) {
  const res = await fetch(`${API_BASE}/attendance/${monthYear}`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function saveAttendance(monthYear, data) {
  const res = await fetch(`${API_BASE}/attendance/${monthYear}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save attendance');
  return res.json();
}

export async function fetchHikes() {
  const res = await fetch(`${API_BASE}/hikes`);
  if (!res.ok) throw new Error('Failed to fetch hikes');
  return res.json();
}

export async function simulateHike(payload) {
  const res = await fetch(`${API_BASE}/hikes/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to simulate hike');
  return res.json();
}

export async function applyHike(payload) {
  const res = await fetch(`${API_BASE}/hikes/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to apply hike');
  return res.json();
}

export async function fetchAppraisalLetter(hikeId) {
  const res = await fetch(`${API_BASE}/hikes/letter/${hikeId}`);
  if (!res.ok) throw new Error('Failed to fetch appraisal letter');
  return res.json();
}

export async function fetchPayrollRuns() {
  const res = await fetch(`${API_BASE}/payroll/runs`);
  if (!res.ok) throw new Error('Failed to fetch payroll runs');
  return res.json();
}

export async function processPayrollRun(monthYear, adjustments = {}) {
  const res = await fetch(`${API_BASE}/payroll/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monthYear, adjustments })
  });
  if (!res.ok) throw new Error('Failed to process payroll');
  return res.json();
}

export async function fetchPayslips(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/payslips?${query}`);
  if (!res.ok) throw new Error('Failed to fetch payslips');
  return res.json();
}

export async function generateSinglePayslip(payload) {
  const res = await fetch(`${API_BASE}/payslips/generate-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate payslip');
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

// Document Studio Endpoints
export async function fetchDocuments(type) {
  const url = type ? `${API_BASE}/documents?type=${type}` : `${API_BASE}/documents`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchDocumentById(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function generateOfferLetter(data) {
  const res = await fetch(`${API_BASE}/documents/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to generate offer letter');
  return res.json();
}

export async function generateExperienceLetter(data) {
  const res = await fetch(`${API_BASE}/documents/experience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to generate experience letter');
  return res.json();
}

export async function generateRelievingLetter(data) {
  const res = await fetch(`${API_BASE}/documents/relieving`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to generate relieving letter');
  return res.json();
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

