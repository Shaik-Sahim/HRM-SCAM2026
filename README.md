# OmniaHRM - Enterprise Payroll, Attendance, Compensation & Document Studio

**OmniaHRM** is a comprehensive, enterprise-grade Human Resource Management (HRM) system designed for end-to-end workforce operations: attendance tracking, compliant payroll proration, compensation hike appraisals, high-fidelity payslips, and a complete **HR Document Studio** for issuing **Offer Letters**, **Experience Certificates**, and **Relieving Orders**.

---

## 🌟 Key Functional Modules

### 1. 📜 HR Document Studio (Offer, Experience & Relieving Letters)
- **Offer Letter Generator**:
  - Takes candidate details (Name, Email, Phone, Address), Position, Department, Reporting Manager, Work Location, Joining Date, and Probation/Notice periods.
  - Automatically breaks down the proposed **Annual CTC** into a compliant **Annexure A** compensation table (Basic 45%, HRA 50%, Conveyance, Medical, Special Allowance, and Employer EPF) in both monthly and annual figures.
  - Generates official employment terms, confidentiality clauses, and candidate acceptance signature blocks.
- **Experience Certificate Generator**:
  - Automatically pre-fills from existing active/past employees or custom entries.
  - Computes exact tenure between Date of Joining and Relieving Date (e.g. *"3 years 9 months"*).
  - Customizes conduct evaluations (*"Exemplary & High Velocity Performance"*), project contributions, and authorized company seal.
- **Relieving & Clearance Order Generator**:
  - Documents resignation submission date and official last working day.
  - Confirms IT asset handover, repository/key surrender, and Full & Final (FnF) financial settlement clearance.
- **Document Viewer Modal**:
  - Renders all letters on authentic corporate letterhead with company CIN, PAN, address, QR verification code, official stamp, and authorized signatory signature.
  - Instant high-resolution **A4 PDF Download** (via `jspdf` + `html2canvas`), **Direct Print**, **Copy Text**, and **Email Letter Simulation**.
- **Document Archive**:
  - Central ledger to filter, search, view, download, or revoke previously issued letters.

---

### 2. 🧾 Dual Payslip Generation Engine
- **HR Quick Payslip Studio**: HR inputs working days, present days, paid leaves, **Loss of Pay (LWP)**, and overtime hours, adds variable performance bonuses/incentives, and triggers real-time backend calculation.
- **Full Monthly Payroll Run Wizard**: Guided 4-step monthly payroll processor company-wide.
- **3 Premium Payslip Templates**:
  1. **Silicon Executive**: Modern corporate styling with QR verification, proration metrics, and in-words net pay.
  2. **Modern Clean**: Clean minimalist design with clear tabular summaries and paid badges.
  3. **Enterprise Classic**: Formal corporate audit certificate with double borders, employer seal watermark, and authorized signature.
- **Export & Delivery**: Instant high-resolution **A4 PDF Download**, direct **Print Preview**, and simulated employee email delivery.

---

### 3. 📅 Attendance & Loss of Pay (LWP) Tracking
- Matrix view tracking calendar working days, days present, paid leaves (PL/CL), half days (0.5), and unpaid leaves (LWP).
- **Automatic Salary Proration**: Deductions for loss of pay are automatically computed based on payable vs. total working days and itemized on payslips.
- **Overtime Engine**: Auto-computes overtime pay based on hourly rate multipliers (1.5x base pay).

---

### 4. 📈 Compensation & Hike Studio
- **Dynamic Appraisal Simulator**: Adjust hikes via percentage sliders (0% to 60%) or fixed amounts (+₹200,000).
- **Component-by-Component Revision**: Live comparison of Basic (45%), HRA (50% of Basic), Special Allowance, and EPF before and after revision.
- **Retroactive Arrears Calculator**: Computes retroactive arrears when effective dates precede announcement cycles.
- **Appraisal Letters**: Generates official Company Salary Revision & Appraisal letters with PDF export and print.

---

### 5. 👥 Workforce Directory & ⚙️ Company Customization
- 10 pre-seeded realistic employee profiles across Engineering, Design, HR, Sales, DevOps, Finance, and Marketing.
- Company branding controls: Trade name, CIN, PAN, TAN, GSTIN, registered corporate address, bank details, and authorized HR signatory.
- Multi-currency support: Indian Rupee (`₹ INR`) and US Dollar (`$ USD`).

---

## 🚀 Running the Application

The application is already running live on port **5000**:
- **Application URL**: [http://localhost:5000](http://localhost:5000)

### Manual Startup Commands
From the project folder (`apex-hrm`):
```bash
# Start backend (serves both REST API & client bundle)
npm start

# Run frontend development server with hot-reload
npm run client
```

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS v4, Lucide React, Recharts, jsPDF, html2canvas, canvas-confetti, Vite.
- **Backend**: Node.js, Express, RESTful APIs, in-memory DB with hydration and pre-seeded enterprise dataset.
