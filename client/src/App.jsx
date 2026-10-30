import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PayslipModal from './components/PayslipModal';
import AppraisalLetterModal from './components/AppraisalLetterModal';
import QuickPayslipGeneratorModal from './components/QuickPayslipGeneratorModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import DocumentViewerModal from './components/DocumentViewerModal';

import DashboardView from './views/DashboardView';
import EmployeesView from './views/EmployeesView';
import AttendanceView from './views/AttendanceView';
import HikeView from './views/HikeView';
import PayrollView from './views/PayrollView';
import PayslipsView from './views/PayslipsView';
import DocumentStudioView from './views/DocumentStudioView';
import SettingsView from './views/SettingsView';

import { 
  fetchCompany, 
  fetchEmployees, 
  fetchDashboardStats, 
  fetchPayslips, 
  fetchAppraisalLetter 
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState('2026-10');
  
  const [company, setCompany] = useState(null);
  const [statutory, setStatutory] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentPayslips, setRecentPayslips] = useState([]);

  // Modals
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [quickSlipOpen, setQuickSlipOpen] = useState(false);
  const [addEmpOpen, setAddEmpOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [currentMonth]);

  const loadInitialData = async () => {
    try {
      const [compRes, empsRes, statsRes, slipsRes] = await Promise.all([
        fetchCompany(),
        fetchEmployees(),
        fetchDashboardStats(),
        fetchPayslips()
      ]);

      setCompany(compRes.company);
      setStatutory(compRes.statutory);
      setEmployees(empsRes);
      setStats(statsRes);
      setRecentPayslips(slipsRes);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const handleOpenAppraisalLetter = async (hikeId) => {
    try {
      const data = await fetchAppraisalLetter(hikeId);
      setSelectedLetter(data);
    } catch (err) {
      alert('Error fetching appraisal letter: ' + err.message);
    }
  };

  const handleOpenQuickSlip = (empId) => {
    setQuickSlipOpen(true);
  };

  const handlePayslipGenerated = (newPayslip) => {
    setQuickSlipOpen(false);
    setSelectedPayslip(newPayslip);
    // Refresh slips & stats
    fetchPayslips().then(setRecentPayslips).catch(console.error);
    fetchDashboardStats().then(setStats).catch(console.error);
  };

  const handleEmployeeCreated = (newEmp) => {
    setAddEmpOpen(false);
    setEmployees(prev => [newEmp, ...prev]);
    fetchDashboardStats().then(setStats).catch(console.error);
  };

  const handleHikeApplied = (updatedEmp) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    fetchDashboardStats().then(setStats).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        company={company}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        onOpenQuickSlip={() => setQuickSlipOpen(true)}
        onOpenAddEmp={() => setAddEmpOpen(true)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          company={company}
          stats={stats}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                company={company}
                recentPayslips={recentPayslips}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenQuickSlip={() => setQuickSlipOpen(true)}
                onViewPayslip={(slip) => setSelectedPayslip(slip)}
                onViewAppraisalLetter={handleOpenAppraisalLetter}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeesView
                employees={employees}
                company={company}
                onOpenAddEmp={() => setAddEmpOpen(true)}
                onOpenQuickSlip={(empId) => setQuickSlipOpen(true)}
                onRefreshEmployees={() => {
                  fetchEmployees().then(setEmployees);
                  fetchDashboardStats().then(setStats);
                }}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                currentMonth={currentMonth}
                employees={employees}
                onAttendanceUpdated={() => {
                  fetchDashboardStats().then(setStats);
                }}
              />
            )}

            {activeTab === 'hikes' && (
              <HikeView
                employees={employees}
                company={company}
                onViewAppraisalLetter={handleOpenAppraisalLetter}
                onHikeApplied={handleHikeApplied}
              />
            )}

            {activeTab === 'payroll' && (
              <PayrollView
                currentMonth={currentMonth}
                employees={employees}
                company={company}
                onPayrollCompleted={() => {
                  fetchPayslips().then(setRecentPayslips);
                  fetchDashboardStats().then(setStats);
                }}
                onViewPayslip={(slip) => setSelectedPayslip(slip)}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'payslips' && (
              <PayslipsView
                currentMonth={currentMonth}
                company={company}
                onViewPayslip={(slip) => setSelectedPayslip(slip)}
                onOpenQuickSlip={() => setQuickSlipOpen(true)}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentStudioView
                employees={employees}
                company={company}
                onViewDocument={(doc) => setSelectedDocument(doc)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onCompanyUpdated={(updatedComp, updatedStat) => {
                  setCompany(updatedComp);
                  setStatutory(updatedStat);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          company={company}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

      {selectedLetter && (
        <AppraisalLetterModal
          letterData={selectedLetter}
          company={company}
          onClose={() => setSelectedLetter(null)}
        />
      )}

      {selectedDocument && (
        <DocumentViewerModal
          document={selectedDocument}
          company={company}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {quickSlipOpen && (
        <QuickPayslipGeneratorModal
          employees={employees}
          company={company}
          onClose={() => setQuickSlipOpen(false)}
          onPayslipGenerated={handlePayslipGenerated}
        />
      )}

      {addEmpOpen && (
        <AddEmployeeModal
          company={company}
          employees={employees}
          onClose={() => setAddEmpOpen(false)}
          onEmployeeCreated={handleEmployeeCreated}
        />
      )}
    </div>
  );
}
