"use client";

import { useState } from "react";

const sections = [
  { id: "overview", label: "System Overview", icon: "bi-info-circle" },
  { id: "login", label: "Login & Access", icon: "bi-box-arrow-in-right" },
  { id: "implementation", label: "Implementation Guide", icon: "bi-gear" },
  { id: "developer", label: "Developer Guide", icon: "bi-code-slash" },
  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { id: "parking", label: "Parking", icon: "bi-car-front" },
  { id: "access-control", label: "Access Control & Relay", icon: "bi-shield-check" },
  { id: "hrms", label: "HRMS Module", icon: "bi-people" },
  { id: "stock", label: "Stock Module", icon: "bi-boxes" },
  { id: "sales", label: "Sales Module", icon: "bi-cart" },
  { id: "finance", label: "Finance Module", icon: "bi-wallet2" },
  { id: "procurement", label: "Procurement Module", icon: "bi-truck" },
  { id: "production", label: "Production Module", icon: "bi-gear" },
  { id: "ecommerce", label: "E-Commerce Module", icon: "bi-shop" },
  { id: "payroll", label: "Payroll", icon: "bi-calculator" },
  { id: "selfservice", label: "Self Service", icon: "bi-person-badge" },
  { id: "admin", label: "Administration", icon: "bi-shield-lock" },
  { id: "faq", label: "FAQ", icon: "bi-question-circle" },
];

export default function ManualsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const Section = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
    <div id={id} className="mb-5">
      <h5 className="fw-bold mb-3 pb-2 border-bottom">{title}</h5>
      {children}
    </div>
  );

  const Step = ({ num, text }: { num: number; text: string }) => (
    <div className="d-flex gap-2 mb-2">
      <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, minWidth: 24 }}>{num}</span>
      <span>{text}</span>
    </div>
  );

  const Note = ({ children }: { children: React.ReactNode }) => (
    <div className="alert alert-info py-2 small mb-3">
      <i className="bi bi-info-circle me-1"></i>{children}
    </div>
  );

  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-journal-bookmark-fill me-2"></i>User Manual & Guide</h4>
          <p className="text-muted small mb-0">Complete documentation for Genius ERP system</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm position-sticky" style={{ top: "20px" }}>
            <div className="card-header fw-semibold small">Table of Contents</div>
            <div className="list-group list-group-flush" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 border-0 small ${activeSection === s.id ? "active" : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  <i className={`bi ${s.icon}`}></i>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              <Section id="overview" title="1. System Overview">
                <p><strong>Genius ERP</strong> is a comprehensive Enterprise Resource Planning system designed for Ethiopian businesses. It integrates all core business functions into a single platform with multi-company (tenant) support.</p>
                <div className="row g-3 my-2">
                  <div className="col-md-4">
                    <div className="border rounded-3 p-3 text-center h-100">
                      <i className="bi bi-building fs-2 text-primary d-block mb-1"></i>
                      <strong>Multi-Tenant</strong>
                      <div className="small text-muted">Each company sees only its own data</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded-3 p-3 text-center h-100">
                      <i className="bi bi-module fs-2 text-success d-block mb-1"></i>
                      <strong>Modular</strong>
                      <div className="small text-muted">9 modules licensed per-company</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded-3 p-3 text-center h-100">
                      <i className="bi bi-translate fs-2 text-info d-block mb-1"></i>
                      <strong>Bilingual</strong>
                      <div className="small text-muted">English & Amharic supported</div>
                    </div>
                  </div>
                </div>
                <p className="mt-2"><strong>Available Modules:</strong> HRMS, Payroll, Stock/Inventory, Sales, Finance, Procurement, Production, E-Commerce, Audit & Reports.</p>
              </Section>

              <Section id="login" title="2. Login & Access">
                <h6 className="fw-semibold">How to Log In</h6>
                <Step num={1} text="Navigate to the login page at the system URL" />
                <Step num={2} text="Enter your Company TIN (Tax Identification Number) — e.g., TIN-000001" />
                <Step num={3} text="Enter your Email address and Password" />
                <Step num={4} text="Click the <strong>Sign In</strong> button" />
                <Note>Your Company TIN is provided by your system administrator. The default demo company uses TIN: <code>TIN-000001</code>.</Note>

                <h6 className="fw-semibold mt-3">User Roles</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>Role</th>
                        <th>Permissions</th>
                        <th>Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge bg-danger">Super Admin</span></td>
                        <td>Full system access, all companies, all modules</td>
                        <td>Administration panel, all data</td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-primary">Admin</span></td>
                        <td>Company-level admin, manage users and settings</td>
                        <td>Administration panel, module management</td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-secondary">Employee</span></td>
                        <td>Self-service only: attendance, leave, profile</td>
                        <td>Self Service portal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="implementation" title="Implementation Guide">
                <p className="lead">Step-by-step walkthrough to onboard a new company, issue module licenses, and grant user access.</p>

                <h6 className="fw-semibold mt-4">Step 1 — Register the Company</h6>
                <ol>
                  <li>Go to <strong>Administration → Companies</strong> and click <span className="badge bg-success">+ Add Company</span>.</li>
                  <li>Enter the company name, TIN (Tax Identification Number), contact details, and address.</li>
                  <li>A default TIN format is <code>TIN-XXXXXX</code>. Each TIN must be unique in the system.</li>
                  <li>Save the company — it will appear in the companies list with a user count of 0.</li>
                  <li>Alternatively, skip this step and let <strong>Step 2</strong> auto-create the company when you issue its first license.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 2 — Issue a License</h6>
                <p>Licenses control which modules a company can access. Two methods:</p>

                <p className="fw-semibold mb-1">Method A: Demo License (Quick Start)</p>
                <ol>
                  <li>Go to <strong>Administration → Demo Licenses</strong> and click <span className="badge bg-success">+ Issue Demo License</span>.</li>
                  <li>Enter the company TIN. If the company does not already exist, check <strong>Auto-create company</strong> to register it automatically.</li>
                  <li>Select which modules to enable: <strong>HRMS</strong>, <strong>Stock</strong>, <strong>Sales</strong>, <strong>Finance</strong>, <strong>Procurement</strong>, <strong>Production</strong> (check all that apply).</li>
                  <li>Pick a duration (e.g. 30, 60, 90 days) or set an explicit expiry date.</li>
                  <li>Submit — the license is created and the company can now log in.</li>
                  <li>A company can have multiple licenses over time (e.g. a trial followed by a paid renewal).</li>
                </ol>

                <p className="fw-semibold mb-1">Method B: Direct Company Module Assignment</p>
                <ol>
                  <li>Go to <strong>Administration → Companies</strong> and click the company name.</li>
                  <li>In the company detail view, assign individual modules via the module checklist.</li>
                  <li>This gives permanent access (no expiry) — useful for paid subscriptions.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 3 — Create a Company Admin User</h6>
                <ol>
                  <li>Go to <strong>Administration → Users</strong> and click <span className="badge bg-success">+ Add User</span>.</li>
                  <li>Provide: full name, email address, phone number, and a temporary password.</li>
                  <li>Select the target company from the <strong>Company</strong> dropdown (shows name + TIN).</li>
                  <li>Assign the role <span className="badge bg-primary">Admin</span> — this gives full company-level access.</li>
                  <li>Save — the admin can now log in and manage their company's data.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 3b — Create a Direct Employee User</h6>
                <ol>
                  <li>Follow the same steps as Step 3, but assign the role <span className="badge bg-secondary">Employee</span>.</li>
                  <li>This creates a user who can log in directly (without needing a company admin to create them first).</li>
                  <li>Useful for small companies where the Super Admin sets up everyone in one go.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 4 — Company Admin Creates Employees</h6>
                <ol>
                  <li>The company admin logs in at <a href="/login" target="_blank"><code>/login</code></a> using the company TIN and their email/password.</li>
                  <li>Once logged in, the admin lands on the <strong>Company Admin Portal</strong> at <a href="/dashboard" target="_blank"><code>/dashboard</code></a> — this shows the full admin sidebar with HRMS, Stock, Sales, and other licensed modules.</li>
                  <li>Navigate to <strong>HRMS → Employees → Add Employee</strong> to register staff.</li>
                  <li>For each employee, the system creates an end-user account (role: Employee) linked to the company.</li>
                  <li>The employee can then log in at <a href="/login" target="_blank"><code>/login</code></a> using the company TIN and their employee email.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 5 — End User Accesses Self Service</h6>
                <ol>
                  <li>Employee goes to <a href="/login" target="_blank"><code>/login</code></a>, enters the company TIN and their credentials.</li>
                  <li>After login, they land on the <strong>Employee Self Service Portal</strong> at <a href="/dashboard/self-service" target="_blank"><code>/dashboard/self-service</code></a>.</li>
                  <li>The sidebar shows only <strong>Self Service</strong> along with any modules the company has licensed.</li>
                  <li>The Self Service portal includes: attendance clock in/out, profile editing, leave requests, attendance history, and document viewing.</li>
                  <li>Employees cannot access Administration, settings, or other companies' data.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Portal Access Summary</h6>
                <div className="table-responsive">
                  <table className="table table-bordered small">
                    <thead className="table-light">
                      <tr>
                        <th>Role</th>
                        <th>Portal</th>
                        <th>URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge bg-danger">Super Admin</span></td>
                        <td>Super Admin Dashboard</td>
                        <td><a href="/dashboard/admin" target="_blank"><code>/dashboard/admin</code></a></td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-primary">Company Admin</span></td>
                        <td>Company Admin Portal</td>
                        <td><a href="/dashboard" target="_blank"><code>/dashboard</code></a></td>
                      </tr>
                      <tr>
                        <td><span className="badge bg-secondary">Employee</span></td>
                        <td>Employee Self Service</td>
                        <td><a href="/dashboard/self-service" target="_blank"><code>/dashboard/self-service</code></a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Workflow Diagram</h6>
                <pre className="bg-light p-3 rounded small" style={{ fontFamily: "monospace" }}>
Super Admin → Register Company → Issue License → Create Company Admin
                                                      ↓
                                         Company Admin adds Employees
                                                      ↓
                                         Employees log in via Self Service
                                                      ↓
                                         Clock in/out · Leave · Profile
                </pre>

                <div className="alert alert-info small mt-3 mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  <strong>Tip:</strong> Use the <strong>Demo License</strong> workflow for quick trials — it auto-creates the company and issues a time-limited license in one step.
                </div>
              </Section>

              <Section id="dashboard" title="3. Dashboard">
                <p>The main dashboard provides a visual overview of your ERP system with interactive cards for each module.</p>
                <h6 className="fw-semibold">Key Features</h6>
                <ul>
                  <li><strong>Module Cards:</strong> Click any module card to navigate directly to that module</li>
                  <li><strong>Quick Actions:</strong> Add Employee, Record Attendance, and other shortcuts</li>
                  <li><strong>Stats Overview:</strong> Total employees, attendance today, pending leaves, active placements</li>
                  <li><strong>Recent Employees:</strong> Quick list of latest added employees</li>
                </ul>
                <Note>The sidebar on the left provides navigation to all modules. Use the search bar at the top to quickly find pages.</Note>
              </Section>

              <Section id="hrms" title="4. HRMS Module">
                <p>The Human Resource Management System handles all employee-related functions.</p>

                <h6 className="fw-semibold">Employees</h6>
                <ul>
                  <li>Add new employees with personal details, employment info, and documents</li>
                  <li>Manage employee records: edit, view full profile, terminate</li>
                  <li>Employee profile includes: banks, dependents, education, experience, documents, hobbies</li>
                </ul>

                <h6 className="fw-semibold">Departments</h6>
                <ul>
                  <li>Create and manage organizational departments</li>
                  <li>Assign employees to departments for reporting structure</li>
                </ul>

                <h6 className="fw-semibold">Positions</h6>
                <ul>
                  <li>Define job positions/titles within the organization</li>
                  <li>Link positions to departments</li>
                </ul>

                <h6 className="fw-semibold">Attendance</h6>
                <ul>
                  <li>Record daily attendance with clock-in/out times</li>
                  <li>Status options: Present, Late, Half-Day, Leave, Absent</li>
                  <li>View attendance history and reports</li>
                </ul>

                <h6 className="fw-semibold">Leave Management</h6>
                <ul>
                  <li>Define leave types (Annual, Sick, Maternity, etc.)</li>
                  <li>Employees can request leave via Self Service</li>
                  <li>Approve or reject leave requests</li>
                </ul>
              </Section>

              <Section id="stock" title="5. Stock / Inventory Module">
                <p>The Stock module manages inventory across multiple warehouses.</p>

                <h6 className="fw-semibold">Item Categories</h6>
                <ul>
                  <li>Group inventory items into categories for organization</li>
                  <li>Each category can have a description</li>
                </ul>

                <h6 className="fw-semibold">Items</h6>
                <ul>
                  <li>Create inventory items with name, SKU, unit, and category</li>
                  <li>Track current stock levels across warehouses</li>
                  <li>Set reorder levels for low-stock alerts</li>
                </ul>

                <h6 className="fw-semibold">Warehouses</h6>
                <ul>
                  <li>Manage multiple warehouse locations</li>
                  <li>Track stock balances per warehouse per item</li>
                </ul>

                <h6 className="fw-semibold">Stock Movements</h6>
                <ul>
                  <li>Record stock receipts, issues, and transfers between warehouses</li>
                  <li>Automatic stock balance updates</li>
                </ul>

                <h6 className="fw-semibold">Stock Adjustments</h6>
                <ul>
                  <li>Adjust stock levels for count discrepancies</li>
                  <li>Specify reason for adjustment</li>
                </ul>
              </Section>

              <Section id="sales" title="6. Sales Module">
                <p>The Sales module manages the complete sales cycle.</p>

                <h6 className="fw-semibold">Customers</h6>
                <ul>
                  <li>Maintain customer database with contact details</li>
                  <li>Track customer purchase history</li>
                </ul>

                <h6 className="fw-semibold">Quotations</h6>
                <ul>
                  <li>Create price quotations for customers</li>
                  <li>Convert quotations to sales orders</li>
                </ul>

                <h6 className="fw-semibold">Sales Orders</h6>
                <ul>
                  <li>Process customer orders</li>
                  <li>Track order status and fulfillment</li>
                </ul>

                <h6 className="fw-semibold">Invoices</h6>
                <ul>
                  <li>Generate invoices from sales orders</li>
                  <li>Track payment status</li>
                </ul>

                <h6 className="fw-semibold">Point of Sale (POS)</h6>
                <ul>
                  <li>Quick checkout interface for retail transactions</li>
                  <li>Real-time inventory deduction</li>
                </ul>
              </Section>

              <Section id="finance" title="7. Finance Module">
                <p>The Finance module provides comprehensive financial management.</p>
                <ul>
                  <li><strong>Chart of Accounts:</strong> Define your accounting structure</li>
                  <li><strong>Journal:</strong> Record financial transactions with double-entry bookkeeping</li>
                  <li><strong>Ledger:</strong> View account balances and transaction history</li>
                  <li><strong>Payments:</strong> Manage accounts payable and receivable</li>
                  <li><strong>Budget:</strong> Set and track departmental budgets</li>
                </ul>
              </Section>

              <Section id="procurement" title="8. Procurement Module">
                <p>Manage the purchasing and supply chain process.</p>
                <ul>
                  <li><strong>Suppliers:</strong> Maintain vendor database with contact and payment terms</li>
                  <li><strong>Purchase Orders:</strong> Create and track purchase orders to suppliers</li>
                  <li><strong>RFQ:</strong> Request for Quotations from multiple suppliers</li>
                  <li><strong>Returns:</strong> Handle purchase returns and credit notes</li>
                </ul>
              </Section>

              <Section id="production" title="9. Production Module">
                <p>Manage manufacturing and production processes.</p>
                <ul>
                  <li><strong>Bill of Materials (BOM):</strong> Define product structure with raw materials and quantities</li>
                  <li><strong>Work Orders:</strong> Schedule and track production runs</li>
                  <li><strong>Routings:</strong> Define production steps and work centers</li>
                </ul>
              </Section>

              <Section id="ecommerce" title="10. E-Commerce Module">
                <p>Manage online sales channels.</p>
                <ul>
                  <li><strong>Products:</strong> Manage online product catalog with descriptions and prices</li>
                  <li><strong>Online Orders:</strong> Process orders received through online channels</li>
                  <li><strong>Customers:</strong> Manage online customer accounts</li>
                </ul>
              </Section>

              <Section id="payroll" title="11. Payroll">
                <p>The Payroll module handles employee compensation with Ethiopian compliance.</p>
                <ul>
                  <li><strong>Payroll Periods:</strong> Define monthly payroll periods</li>
                  <li><strong>Process Payroll:</strong> Calculate salaries with Ethiopian PAYE tax and pension contributions</li>
                  <li><strong>Payroll Items:</strong> View individual employee payslips</li>
                  <li><strong>PAYE Brackets:</strong> Configurable Ethiopian income tax brackets</li>
                  <li><strong>Pension Settings:</strong> Configure employer and employee pension contribution rates</li>
                </ul>
                <Note>Payroll calculations follow Ethiopian tax laws including PAYE (income tax) and pension contributions (7% employee + 11% employer).</Note>
              </Section>

              <Section id="selfservice" title="12. Employee Self Service">
                <p>The Self Service portal allows regular employees to manage their own information.</p>

                <h6 className="fw-semibold">Access</h6>
                <p>Navigate to <strong>HRMS → Self Service</strong> in the sidebar, or visit <code>/dashboard/self-service</code>.</p>

                <h6 className="fw-semibold">Features</h6>
                <ul>
                  <li><strong>Dashboard:</strong> Welcome greeting, today's attendance status, pending leaves count, quick access cards</li>
                  <li><strong>Clock In / Clock Out:</strong> Record daily attendance with one click</li>
                  <li><strong>My Profile:</strong> View personal details, edit phone number and address</li>
                  <li><strong>Attendance History:</strong> View all your attendance records with status</li>
                  <li><strong>Leave Requests:</strong> Check leave balance, submit new leave requests, track approval status</li>
                  <li><strong>My Documents:</strong> View uploaded documents</li>
                </ul>
              </Section>

              <Section id="admin" title="13. Administration">
                <p>The Administration section is for system administrators and company admins only.</p>

                <h6 className="fw-semibold">Super Admin Dashboard</h6>
                <ul>
                  <li>System-wide overview: total companies, active licenses, users</li>
                  <li>Expiring license alerts</li>
                  <li>Module adoption statistics</li>
                </ul>

                <h6 className="fw-semibold">Companies</h6>
                <ul>
                  <li>Register new companies with TIN (Tax Identification Number)</li>
                  <li>Assign module licenses per company</li>
                  <li>View user count per company</li>
                </ul>

                <h6 className="fw-semibold">Demo Licenses</h6>
                <ul>
                  <li>Issue demo/trial licenses to companies</li>
                  <li>Select which modules to enable</li>
                  <li>Auto-create company if not registered</li>
                  <li>Track license status (Active, Expiring, Expired)</li>
                </ul>

                <h6 className="fw-semibold">Users</h6>
                <ul>
                  <li>Create and manage system users</li>
                  <li>Assign roles (Admin, Employee)</li>
                  <li>Link users to companies</li>
                </ul>
              </Section>

              <Section id="parking" title="14. Parking Module (Membership)">
                <p className="lead">Complete parking management system — zones, slots, gates, cameras, QR kiosk, POS payments, subscriptions, and reports.</p>

                <h6 className="fw-semibold mt-4">System Overview</h6>
                <p>The Parking Management System handles vehicle entry &amp; exit via ANPR cameras, QR codes, NFC, or manual entry. It includes customer management, flexible pricing, POS payments (cash, Telebirr, CBE Birr, Chapa, cards), a self-service QR kiosk for walk-in visitors, subscription plans, and comprehensive reporting.</p>

                <h6 className="fw-semibold mt-4">Who Can Do What</h6>
                <div className="table-responsive" style={{ maxWidth: 500 }}>
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Feature</th><th>Admin</th><th>Super Admin</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Manage zones, slots, gates, cameras</td><td>✅ Own company</td><td>✅ All companies</td></tr>
                      <tr><td>Register customers &amp; vehicles</td><td>✅ Own company</td><td>✅ All companies</td></tr>
                      <tr><td>Create subscriptions</td><td>✅ Own company</td><td>✅ All companies</td></tr>
                      <tr><td>Set rates/pricing</td><td>✅ Own company</td><td>✅ All companies</td></tr>
                      <tr><td>Process POS payments</td><td>✅ Own company</td><td>✅ All companies</td></tr>
                      <tr><td>View reports</td><td>✅ Own company</td><td>✅ All companies</td></tr>
                      <tr><td>Access all companies' data</td><td>❌</td><td>✅</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">All Parking Pages</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>#</th><th>Page</th><th>Sidebar Icon</th><th>Purpose</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>Parking Dashboard</td><td><i className="bi bi-car-front"></i></td><td>KPI overview: occupied slots, active sessions, today's entries/revenue, customers, subscriptions. Live auto-refresh table.</td></tr>
                      <tr><td>2</td><td>Zones &amp; Lots</td><td><i className="bi bi-map"></i></td><td>Create/edit parking zones. Types: standard, VIP, disabled, electric, staff.</td></tr>
                      <tr><td>3</td><td>Slots</td><td><i className="bi bi-grid-3x3-gap"></i></td><td>Individual parking spots per zone. Status: available (green), occupied (red), reserved (yellow), maintenance (grey).</td></tr>
                      <tr><td>4</td><td>Gates</td><td><i className="bi bi-door-open"></i></td><td>Entry/exit barriers with ANPR, QR, NFC toggles. Types: entry / exit / dual.</td></tr>
                      <tr><td>5</td><td>Cameras</td><td><i className="bi bi-camera-video"></i></td><td>ANPR cameras (IP/RTSP/ONVIF) or laptop webcam. Set confidence threshold, assign to gate.</td></tr>
                      <tr><td>6</td><td>Customers</td><td><i className="bi bi-person-badge"></i></td><td>Registered parking customers with auto-generated IDs (CUT-001) and QR codes.</td></tr>
                      <tr><td>7</td><td>Vehicles</td><td><i className="bi bi-truck"></i></td><td>Link vehicles to customers. Plate search, blacklist toggle, type badges.</td></tr>
                      <tr><td>8</td><td>Subscriptions</td><td><i className="bi bi-calendar-check"></i></td><td>Monthly/quarterly/semi-annual/annual parking plans. Auto-calculate end date, auto-renew.</td></tr>
                      <tr><td>9</td><td>Sessions</td><td><i className="bi bi-clock-history"></i></td><td>All entry/exit records. Filter by status/date. Manually exit a vehicle, link to POS.</td></tr>
                      <tr><td>10</td><td>Rates</td><td><i className="bi bi-cash-coin"></i></td><td>Pricing rules: hourly/daily/weekly/monthly/annual/flat/custom. Grace period, max daily charge.</td></tr>
                      <tr><td>11</td><td>QR Tickets</td><td><i className="bi bi-qr-code"></i></td><td>Generate visitor QR tickets with expiry. Track usage status.</td></tr>
                      <tr><td>12</td><td>Kiosk</td><td><i className="bi bi-pc-display"></i></td><td>Self-service entry. Look up registered customer or enter walk-in name/phone → choose zone → generates QR + session.</td></tr>
                      <tr><td>13</td><td>POS</td><td><i className="bi bi-display"></i></td><td>5-tab payment terminal. Scan by plate, phone, QR, or webcam. Supports cash, Telebirr, CBE Birr, Chapa, SantimPay, bank, cards. Prints 80mm thermal receipt.</td></tr>
                      <tr><td>14</td><td>Reports</td><td><i className="bi bi-bar-chart"></i></td><td>Subscription report (printable) + Access log report (filterable, CSV export).</td></tr>
                      <tr><td>15</td><td>RFID Cards</td><td><i className="bi bi-credit-card-2-front"></i></td><td>Register RFID cards, assign to members, manage card status (active/inactive/lost).</td></tr>
                      <tr><td>16</td><td>Access Control</td><td><i className="bi bi-shield-check"></i></td><td>Live RFID card swipe monitoring via relay. Shows card, member, plan, remaining days. Open door button.</td></tr>
                      <tr><td>17</td><td>QR Access</td><td><i className="bi bi-qr-code-scan"></i></td><td>Live QR code scan monitoring with built-in webcam scanner. Scans subscription QR codes, validates, opens door.</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Setup — First Time Configuration</h6>
                <p>When first installing the parking module, set up the infrastructure in this order:</p>

                <p className="fw-semibold mb-1">Step 1: Create Zones</p>
                <p>Go to <strong>Zones &amp; Lots</strong> → <strong>Add Zone</strong>. Fields: Name, Code (unique), Floor, Type (standard/vip/disabled/electric/staff), Description.</p>

                <p className="fw-semibold mb-1">Step 2: Create Slots</p>
                <p>Go to <strong>Slots</strong> → <strong>Add Slot</strong>. Fields: Zone, Slot Number (unique per company), Floor, Type, Status (available/reserved/maintenance).</p>

                <p className="fw-semibold mb-1">Step 3: Create Gates</p>
                <p>Go to <strong>Gates</strong> → <strong>Add Gate</strong>. Fields: Name, Code, Type (entry/exit/dual), Direction (in/out/both), enable ANPR/QR/NFC.</p>

                <p className="fw-semibold mb-1">Step 4: Add Cameras</p>
                <p>Go to <strong>Cameras</strong> → <strong>Add Camera</strong>. Fields: Name, Code, Gate, Protocol (http/rtsp/onvif/tcp_ip/webcam), IP Address (blank for webcam), Port, RTSP URL, Direction, Confidence threshold.</p>
                <p><strong>Webcam:</strong> Select "webcam" protocol for a laptop/desktop camera. No IP address needed.</p>

                <p className="fw-semibold mb-1">Step 5: Set Rates (Pricing)</p>
                <p>Go to <strong>Rates</strong> → <strong>Add Rate</strong>. Rate types: hourly/daily/weekly/monthly/annual/flat/custom. Set base rate, per-hour, grace period, max daily charge.</p>
                <p><strong>Default fallback:</strong> If no rate matches, the system charges <strong>30 ETB per 30 minutes</strong> (rounded up).</p>

                <p className="fw-semibold mb-1">Step 6: Register Customers &amp; Vehicles</p>
                <p><strong>Customers</strong> → Add Customer (name, phone, email, photo). Then <strong>Vehicles</strong> → Add Vehicle (plate, type, model, color, owner, blacklist).</p>

                <h6 className="fw-semibold mt-4">Fee Calculation</h6>
                <p><strong>Default (fallback):</strong> 30 ETB per 30-minute block, rounded up.</p>
                <div className="table-responsive" style={{ maxWidth: 400 }}>
                  <table className="table table-sm table-bordered">
                    <thead className="table-light"><tr><th>Duration</th><th>Blocks</th><th>Fee</th></tr></thead>
                    <tbody>
                      <tr><td>1–30 min</td><td>1</td><td>30 ETB</td></tr>
                      <tr><td>31–60 min</td><td>2</td><td>60 ETB</td></tr>
                      <tr><td>61–90 min</td><td>3</td><td>90 ETB</td></tr>
                      <tr><td>91–120 min</td><td>4</td><td>120 ETB</td></tr>
                    </tbody>
                  </table>
                </div>
                <p>Custom rates set in the <strong>Rates</strong> page override the default. Grace periods give free minutes before charging.</p>

                <h6 className="fw-semibold mt-4">Payment Methods</h6>
                <div className="table-responsive" style={{ maxWidth: 500 }}>
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Method</th><th>Type</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Cash</td><td>Offline</td><td>Hand cash, receipt printed</td></tr>
                      <tr><td>Telebirr</td><td>Mobile Money</td><td>Ethiopian mobile payment</td></tr>
                      <tr><td>CBE Birr</td><td>Mobile Money</td><td>Commercial Bank of Ethiopia</td></tr>
                      <tr><td>Chapa</td><td>Online Gateway</td><td>Requires <code>CHAPA_SECRET_KEY</code> in .env. Redirects to Chapa checkout, then verify on return.</td></tr>
                      <tr><td>SantimPay</td><td>Online Gateway</td><td>Alternative processor</td></tr>
                      <tr><td>Bank Transfer</td><td>Bank</td><td>Manual bank payment</td></tr>
                      <tr><td>POS Machine</td><td>Card Terminal</td><td>Physical card reader</td></tr>
                      <tr><td>Credit/Debit Card</td><td>Card</td><td>Online card payment</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">QR Entry System</h6>
                <ul>
                  <li><strong>Kiosk:</strong> Operator enters visitor details (registered customer or walk-in name/phone) → choose zone → system generates QR code → session created as <code>pending_payment</code></li>
                  <li><strong>Ticket format:</strong> Plate shows as <code>KIO-{'{'}ticket{'}'}</code>, entry method <code>qr</code></li>
                  <li><strong>POS scan:</strong> Three formats accepted: base64 string, raw JSON object, or plain ticket number</li>
                  <li><strong>Camera scan:</strong> Hold QR to laptop webcam → auto-detected via jsQR library</li>
                </ul>

                <h6 className="fw-semibold mt-4">Database Tables</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Table</th><th>Stores</th><th>Key Fields</th></tr>
                    </thead>
                    <tbody>
                      <tr><td><code>parking_zones</code></td><td>Parking areas/lots</td><td>name, code, type, slot_count</td></tr>
                      <tr><td><code>parking_slots</code></td><td>Individual spots</td><td>zone_id, slot_number, status</td></tr>
                      <tr><td><code>parking_gates</code></td><td>Entry/exit barriers</td><td>name, type, is_anpr_enabled, is_qr_enabled</td></tr>
                      <tr><td><code>parking_cameras</code></td><td>ANPR/webcam cameras</td><td>gate_id, name, protocol, ip_address</td></tr>
                      <tr><td><code>parking_vehicles</code></td><td>Registered vehicles</td><td>plate_number, vehicle_type, owner info</td></tr>
                      <tr><td><code>parking_sessions</code></td><td>Entry/exit records</td><td>entry_time, exit_time, status, amount, paid</td></tr>
                      <tr><td><code>parking_rates</code></td><td>Pricing rules</td><td>rate_type, base_rate, per_hour_rate</td></tr>
                      <tr><td><code>parking_qr_tickets</code></td><td>Visitor QR codes</td><td>ticket_number, visitor_name, valid_until, is_used</td></tr>
                      <tr><td><code>parking_payments</code></td><td>Payment transactions</td><td>session_id, amount, payment_method</td></tr>
                      <tr><td><code>parking_subscriptions</code></td><td>Monthly/annual plans</td><td>customer_id, plan_type, start_date, end_date, qr_code, qr_image</td></tr>
                      <tr><td><code>rfid_cards</code></td><td>RFID access cards</td><td>card_uid, member_id, label, status, last_used_at</td></tr>
                      <tr><td><code>rfid_access_logs</code></td><td>Card/QR swipe log</td><td>card_uid, member_id, granted, reason, event_type, door_opened</td></tr>
                      <tr><td><code>relay_commands</code></td><td>Door open commands</td><td>action (open_door), status (pending/done), payload</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Session &amp; Slot Status Values</h6>
                <p><strong>Sessions:</strong> <code>active</code> (currently parked) → <code>pending_payment</code> (ready to pay) → <code>completed</code> (paid &amp; exited) — <code>cancelled</code> (voided)</p>
                <p><strong>Slots:</strong> <code>available</code> (empty) — <code>occupied</code> (vehicle parked) — <code>reserved</code> (held) — <code>maintenance</code> (out of service)</p>
                <p><strong>QR Tickets:</strong> <code>active</code> (valid) — <code>used</code> (scanned) — <code>expired</code> (past date) — <code>cancelled</code> (voided)</p>

                <h6 className="fw-semibold mt-4">API Endpoints</h6>
                <p>All require <code>Authorization: Bearer &lt;token&gt;</code> header (except Chapa callbacks).</p>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Method</th><th>Endpoint</th><th>Purpose</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>GET</td><td><code>/api/membership/parking/stats</code></td><td>Dashboard KPIs &amp; active sessions</td></tr>
                      <tr><td>GET</td><td><code>/api/membership/parking/sessions</code></td><td>List sessions (?status=&amp;date=&amp;zone_id=&amp;phone=)</td></tr>
                      <tr><td>POST</td><td><code>/api/membership/parking/sessions</code></td><td>Create session (vehicle entry)</td></tr>
                      <tr><td>POST</td><td><code>/api/membership/parking/payments</code></td><td>Process payment, free slot, update session to completed</td></tr>
                      <tr><td>GET</td><td><code>/api/membership/parking/zones</code></td><td>List zones</td></tr>
                      <tr><td>POST</td><td><code>/api/membership/parking/zones</code></td><td>Create zone</td></tr>
                      <tr><td>POST</td><td><code>/api/membership/parking/kiosk</code></td><td>Create kiosk QR entry + session in one call</td></tr>
                      <tr><td>POST</td><td><code>/api/membership/parking/kiosk/lookup</code></td><td>Lookup session by QR data (base64, JSON, or ticket number)</td></tr>
                      <tr><td>GET</td><td><code>/api/membership/parking/reports/access-logs</code></td><td>Access log report (?from=&amp;to=&amp;plate=&amp;status=)</td></tr>
                      <tr><td>POST</td><td><code>/api/membership/parking/chapa/initialize</code></td><td>Initialize Chapa payment for a session</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Environment Variables</h6>
                <pre className="bg-light p-3 rounded small">{`# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Authentication
JWT_SECRET=your_jwt_secret_key

# Chapa Payment Gateway
CHAPA_SECRET_KEY=your_chapa_secret_key

# Application URL (for Chapa callbacks)
NEXT_PUBLIC_APP_URL=https://your-domain.com`}</pre>

                <h6 className="fw-semibold mt-4">Quick Reference — Common Tasks</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Task</th><th>Go To</th><th>Steps</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Add a parking zone</td><td>Zones &amp; Lots</td><td>Add Zone → fill name/code/type → Save</td></tr>
                      <tr><td>Register a vehicle</td><td>Vehicles</td><td>Add Vehicle → enter plate/owner → Save</td></tr>
                      <tr><td>Process a payment</td><td>POS</td><td>Select session → enter amount → choose method → Process</td></tr>
                      <tr><td>Generate QR ticket</td><td>Kiosk</td><td>Enter walk-in name → choose zone → Generate Entry QR</td></tr>
                      <tr><td>Print receipt</td><td>POS</td><td>After payment → click Print Receipt</td></tr>
                      <tr><td>View access log</td><td>Reports</td><td>Access Log Report tab → filter → view/export CSV</td></tr>
                      <tr><td>Create subscription</td><td>Subscriptions</td><td>Select customer/vehicle → set plan/dates/amount → Save</td></tr>
                      <tr><td>Exit a vehicle manually</td><td>Sessions</td><td>Find session → click Exit → confirm</td></tr>
                      <tr><td>Set parking rates</td><td>Rates</td><td>Add Rate → configure base rate/per hour → Save</td></tr>
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="access-control" title="15. Access Control &amp; Local Relay Setup">
                <p className="lead">Complete guide to setting up RFID card readers and QR code access control with the local relay process that connects the access controller hardware to the cloud app.</p>

                <Note>This section covers installing the local relay on a Windows PC that sits on the same network as the access controller hardware (e.g. 192.168.0.68). The relay bridges the controller to the Vercel-hosted app.</Note>

                <h6 className="fw-semibold mt-4">Architecture Overview</h6>
                <div className="bg-light p-4 rounded-3 mb-4 small">
                  <pre className="mb-0">{`┌──────────────────────┐     HTTP POST     ┌─────────────────────┐
│  Access Controller   │ ◄─────────────── │   Local Relay       │
│  192.168.0.68:80     │                   │   (Node.js + PM2)   │
│  (RFID Card Reader)  │ ──GET Event.xml──►│                     │
└──────────────────────┘                   │  • Polls controller  │
                                           │  • Opens door       │
                                           │  • Reads relay_cmds │
                                           └─────────┬───────────┘
                                                     │ Direct SQL
                                                     ▼
                                           ┌─────────────────────┐
                                           │   Neon PostgreSQL   │
                                           │   (Cloud Database)  │
                                           └─────────┬───────────┘
                                                     │ REST API
                                                     ▼
                                           ┌─────────────────────┐
                                           │   Vercel App        │
                                           │   (Next.js)         │
                                           │  • QR Access page   │
                                           │  • Access Control   │
                                           │  • Webcam scanner   │
                                           └─────────────────────┘`}</pre>
                </div>

                <h6 className="fw-semibold mt-4">How It Works</h6>
                <ol>
                  <li><strong>Card Swipe:</strong> Person taps RFID card on controller → controller logs event</li>
                  <li><strong>Relay polls:</strong> Local relay fetches <code>/Event.xml?ID=0</code> every 1 second</li>
                  <li><strong>Relay looks up card:</strong> Queries Neon DB for card → finds member → checks subscription</li>
                  <li><strong>Access decision:</strong> If subscription is active → relay sends POST to <code>/cdor.cgi?open=1</code> → door opens</li>
                  <li><strong>Log written:</strong> Relay inserts result into <code>rfid_access_logs</code> table</li>
                  <li><strong>Dashboard shows:</strong> QR Access page polls <code>/api/parking/access/qr-live</code> → shows scan in real-time</li>
                </ol>
                <p>Same flow applies for QR scans — webcam on the QR Access page scans the QR, calls the <code>/api/parking/access/qr-lookup</code> API which validates and inserts a <code>relay_commands</code> entry. The local relay picks it up and opens the door.</p>

                <h6 className="fw-semibold mt-4">Prerequisites</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Requirement</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Windows PC</td><td>On the same network as the access controller (e.g. 192.168.0.x)</td></tr>
                      <tr><td>Access Controller</td><td>Chinese door controller (e.g. 192.168.0.68), port 80, Basic Auth</td></tr>
                      <tr><td>Node.js v18+</td><td>Runtime for the relay script</td></tr>
                      <tr><td>Internet</td><td>PC must reach the Vercel app and Neon database</td></tr>
                      <tr><td>Gate created</td><td>Create a gate in <strong>Gates</strong> page with the controller IP, port, and enable RFID/QR</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Step 1 — Install Node.js</h6>
                <p>Download and install Node.js from <strong>https://nodejs.org</strong> (LTS version recommended). Verify installation:</p>
                <pre className="bg-dark text-light p-3 rounded small">{`node --version
# Should show v18.x.x or higher

npm --version
# Should show 9.x.x or higher`}</pre>

                <h6 className="fw-semibold mt-4">Step 2 — Clone the Repository</h6>
                <pre className="bg-dark text-light p-3 rounded small">{`# Open Command Prompt or PowerShell as Administrator
cd C:\\
git clone https://github.com/Rasneba/-geniouserp.git genius-hrms
cd genius-hrms`}</pre>

                <h6 className="fw-semibold mt-4">Step 3 — Install Dependencies</h6>
                <pre className="bg-dark text-light p-3 rounded small">{`npm install`}</pre>
                <p>This installs all packages including <code>pg</code> (PostgreSQL client) and <code>qrcode</code> (QR generation).</p>

                <h6 className="fw-semibold mt-4">Step 4 — Configure the Relay</h6>
                <p>Create a file called <code>.env.relay</code> in the project root with this content:</p>
                <pre className="bg-dark text-light p-3 rounded small">{`{
  "DATABASE_URL": "postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXXX-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
  "CONTROLLER_IP": "192.168.0.68",
  "CONTROLLER_PORT": 80,
  "CONTROLLER_USERNAME": "admin",
  "CONTROLLER_PASSWORD": "888888",
  "COMPANY_ID": 5
}`}</pre>
                <Note><strong>COMPANY_ID</strong> is the company that owns the gate. All access logs from this relay will be recorded under this company. Find your company ID from the Companies page.</Note>

                <h6 className="fw-semibold mt-4">Step 5 — Create the Gate in the App</h6>
                <ol>
                  <li>Log in to the app → <strong>Parking</strong> → <strong>Gates</strong></li>
                  <li>Click <strong>Add Gate</strong></li>
                  <li>Fill in: Name, Code, Type (entry/exit/dual), Direction (in/out/both)</li>
                  <li>Set <strong>IP Address</strong> = <code>192.168.0.68</code> (same as CONTROLLER_IP)</li>
                  <li>Set <strong>Port</strong> = <code>80</code></li>
                  <li>Enable: <strong>RFID</strong> ✅ and/or <strong>QR</strong> ✅</li>
                  <li>Save</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 6 — Register RFID Cards</h6>
                <ol>
                  <li>Go to <strong>Parking</strong> → <strong>RFID Cards</strong></li>
                  <li>Click <strong>Add Card</strong></li>
                  <li>Enter the card UID (shown on the card or read by the controller)</li>
                  <li>Assign to a <strong>Member</strong> (must have an active subscription)</li>
                  <li>Set status to <strong>Active</strong></li>
                  <li>Save</li>
                </ol>
                <p>Or cards are auto-registered when first swiped — the relay will log a "Card not registered" event.</p>

                <h6 className="fw-semibold mt-4">Step 7 — Generate Subscription QR Codes</h6>
                <ol>
                  <li>Go to <strong>Parking</strong> → <strong>Subscriptions</strong></li>
                  <li>Create a subscription for a customer (select plan, dates, amount)</li>
                  <li>A QR code is auto-generated for each subscription</li>
                  <li>Click the <strong>QR icon</strong> (purple) in the Actions column</li>
                  <li>Click <strong>Download QR</strong> → print or send to the customer</li>
                </ol>
                <p>The QR code contains: <code>{'{"t":"sub","sid":123,"cid":5,"exp":"2026-12-31"}'}</code></p>

                <h6 className="fw-semibold mt-4">Step 8 — Install PM2 (Process Manager)</h6>
                <p>PM2 keeps the relay running 24/7 and auto-restarts on crash or reboot.</p>
                <pre className="bg-dark text-light p-3 rounded small">{`# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
# Should show 5.x.x or higher`}</pre>

                <h6 className="fw-semibold mt-4">Step 9 — Start the Relay with PM2</h6>
                <pre className="bg-dark text-light p-3 rounded small">{`# From the project directory
cd C:\\genius-hrms

# Start the relay
pm2 start scripts/local-relay.mjs --name genius-relay

# Verify it's running
pm2 list
# Should show genius-relay with status "online"

# Check logs
pm2 logs genius-relay --lines 20`}</pre>
                <p>You should see output like:</p>
                <pre className="bg-dark text-light p-3 rounded small">{`  Database: connected
  Controller: OK
  GRANTED for John Doe (30d left)
  CMD POST http://192.168.0.68:80/cdor.cgi?open=1 => 200
  CHECKIN member_id=8`}</pre>

                <h6 className="fw-semibold mt-4">Step 10 — Auto-Start on Windows Boot</h6>
                <p>Create a batch file to auto-resurrect PM2 processes on Windows startup:</p>
                <pre className="bg-dark text-light p-3 rounded small">{`# Create start-relay.bat in scripts folder
@echo off
cd /d C:\\genius-hrms
pm2 resurrect
pm2 save`}</pre>
                <p>Then create a Windows Task Scheduler task:</p>
                <ol>
                  <li>Open <strong>Task Scheduler</strong> (search in Start menu)</li>
                  <li>Click <strong>Create Basic Task</strong></li>
                  <li>Name: <code>PM2 Auto-Start</code></li>
                  <li>Trigger: <strong>When the computer starts</strong></li>
                  <li>Action: <strong>Start a program</strong></li>
                  <li>Program: <code>C:\\genius-hrms\\scripts\\start-relay.bat</code></li>
                  <li>Finish. Check <strong>Run with highest privileges</strong> in Properties.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Step 11 — Save PM2 Process List</h6>
                <pre className="bg-dark text-light p-3 rounded small">{`# After starting relay, save the process list
pm2 save

# This creates a dump file that pm2 resurrect reads on boot`}</pre>

                <h6 className="fw-semibold mt-4">Testing — Verify Everything Works</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Test</th><th>How</th><th>Expected Result</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Relay is running</td><td><code>pm2 list</code></td><td>genius-relay status = online</td></tr>
                      <tr><td>Controller reachable</td><td>Open browser → <code>http://192.168.0.68</code></td><td>Controller web UI loads</td></tr>
                      <tr><td>Card swipe (registered)</td><td>Tap RFID card on reader</td><td>Door opens, log shows "Access granted" with member name</td></tr>
                      <tr><td>Card swipe (unregistered)</td><td>Tap unknown card</td><td>Door stays closed, log shows "Card not registered"</td></tr>
                      <tr><td>QR scan (webcam)</td><td>QR Access page → Start → scan QR</td><td>Door opens, shows member name + plan</td></tr>
                      <tr><td>QR scan (USB reader)</td><td>Present QR to USB reader on Desktop</td><td>Same as webcam scan</td></tr>
                      <tr><td>Open Door button</td><td>Click "Open Door" on any access page</td><td>Door opens, log shows "Force Open"</td></tr>
                      <tr><td>Dashboard live feed</td><td>Open QR Access or Access Control page</td><td>Events appear in real-time</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Troubleshooting</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Problem</th><th>Check</th><th>Fix</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Relay shows "offline" in app</td><td><code>pm2 logs genius-relay</code></td><td>Check .env.relay has correct DATABASE_URL and CONTROLLER_IP</td></tr>
                      <tr><td>Card swipe not detected</td><td>Controller web UI → Events</td><td>Check controller is on same network, IP is correct</td></tr>
                      <tr><td>Door doesn't open</td><td><code>pm2 logs</code> for "CMD POST"</td><td>Check controller username/password in .env.relay</td></tr>
                      <tr><td>"Card not registered"</td><td>RFID Cards page</td><td>Register the card and assign to a member with active subscription</td></tr>
                      <tr><td>"No active subscription"</td><td>Subscriptions page</td><td>Create or renew subscription for the member</td></tr>
                      <tr><td>QR scan shows "Unknown"</td><td>Subscriptions page</td><td>Download QR from subscription page (must have qr_image)</td></tr>
                      <tr><td>Multiple logs per scan</td><td>Relay dedup</td><td>Relay has 3s per-card cooldown — normal if swiping rapidly</td></tr>
                      <tr><td>PM2 process died</td><td><code>pm2 list</code></td><td><code>pm2 restart genius-relay</code></td></tr>
                      <tr><td>Windows reboot — relay not running</td><td>Task Scheduler</td><td>Verify PM2 auto-start task exists and <code>pm2 save</code> was run</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">PM2 Common Commands</h6>
                <pre className="bg-dark text-light p-3 rounded small">{`pm2 list                    # Show all running processes
pm2 logs genius-relay       # View live logs
pm2 logs genius-relay --lines 50  # Last 50 lines
pm2 restart genius-relay    # Restart the relay
pm2 stop genius-relay       # Stop the relay
pm2 delete genius-relay     # Remove from PM2
pm2 save                    # Save process list (for resurrect)
pm2 resurrect               # Restore saved processes
pm2 monit                   # Real-time monitoring dashboard`}</pre>

                <h6 className="fw-semibold mt-4">Full Setup Checklist</h6>
                <div className="bg-light p-4 rounded-3 small">
                  <Step num={1} text="Install Node.js v18+ from nodejs.org" />
                  <Step num={2} text="Clone repo: git clone https://github.com/Rasneba/-geniouserp.git" />
                  <Step num={3} text="Install deps: npm install" />
                  <Step num={4} text="Create .env.relay with DATABASE_URL, CONTROLLER_IP, credentials, COMPANY_ID" />
                  <Step num={5} text="In app: create Gate with controller IP + enable RFID/QR" />
                  <Step num={6} text="In app: register RFID cards → assign to members" />
                  <Step num={7} text="In app: create subscriptions → download QR codes" />
                  <Step num={8} text="Install PM2: npm install -g pm2" />
                  <Step num={9} text="Start relay: pm2 start scripts/local-relay.mjs --name genius-relay" />
                  <Step num={10} text="Save: pm2 save" />
                  <Step num={11} text="Create start-relay.bat + Task Scheduler for auto-start on boot" />
                  <Step num={12} text="Test: swipe card → door opens → check QR Access page for live log" />
                </div>

                <h6 className="fw-semibold mt-4">Relay Source Code — scripts/local-relay.mjs</h6>
                <p className="small text-muted mb-3">This is the complete relay script. It runs on the local PC, connects to both the controller and the Neon database, and bridges card swipes/QR scans to the cloud app.</p>
                <pre className="bg-dark text-light p-3 rounded small" style={{ maxHeight: 600, overflowY: "auto", fontSize: "11px", lineHeight: "1.5" }}>{`import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import pg from "pg";

const DEFAULTS = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/genius_hrms",
  CONTROLLER_IP: "192.168.0.68",
  CONTROLLER_PORT: 80,
  CONTROLLER_USERNAME: "admin",
  CONTROLLER_PASSWORD: "888888",
};

function loadConfig() {
  for (const p of [".env.relay", join(homedir(), ".genius-relay.json")]) {
    if (existsSync(p)) {
      try {
        const fileCfg = JSON.parse(readFileSync(p, "utf8"));
        return { ...DEFAULTS, ...fileCfg };
      } catch { continue; }
    }
  }
  return { ...DEFAULTS };
}

const CFG = loadConfig();
const pool = new pg.Pool({ connectionString: CFG.DATABASE_URL });
const CONTROLLER = \\\`http://\\\${CFG.CONTROLLER_IP}:\\\${CFG.CONTROLLER_PORT}\\\`;
const CONTROLLER_AUTH = Buffer.from(
  \\\`\\\${CFG.CONTROLLER_USERNAME}:\\\${CFG.CONTROLLER_PASSWORD}\\\`
).toString("base64");
const CONTROLLER_HEADERS = { Authorization: \\\`Basic \\\${CONTROLLER_AUTH}\\\` };
const FETCH_OPTS = { headers: CONTROLLER_HEADERS };

let lastEventId = "0";

async function query(sql, params = []) {
  try {
    const r = await pool.query(sql, params);
    return r.rows;
  } catch (e) {
    console.log(\\\`  DB ERR: \\\${e.message}\\\`);
    return null;
  }
}

async function controllerFetch(path) {
  const url = \\\`\\\${CONTROLLER}\\\${path}\\\`;
  try {
    const res = await fetch(url, { ...FETCH_OPTS });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

function controllerCmd(path) {
  const url = \\\`\\\${CONTROLLER}\\\${path}\\\`;
  fetch(url, {
    method: "POST", ...FETCH_OPTS,
    signal: AbortSignal.timeout(10000),
  })
    .then(res => {
      console.log(\\\`  CMD POST \\\${url} => \\\${res.status}\\\`);
    })
    .catch(e => {
      console.log(\\\`  CMD POST \\\${url} => ERR: \\\${e.message}\\\`);
    });
}

async function openDoor() {
  controllerCmd("/cdor.cgi?open=1");
}

async function logAccess(cardUid, memberId, memberName,
    granted, reason, message, daysRemaining, doorOpened, extra = {}) {
  const cid = extra.company_id || CFG.COMPANY_ID || 1;
  await query(
    \\\`INSERT INTO rfid_access_logs
       (company_id, card_uid, member_id, member_name,
        granted, reason, message, days_remaining,
        door_opened, direction, event_type,
        plan_name, subscription_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)\\\`,
    [cid, cardUid, memberId, memberName, granted,
     reason, message, daysRemaining, doorOpened,
     extra.direction || "IN",
     extra.event_type || "SWIPE",
     extra.plan_name || null,
     extra.subscription_id || null]
  );
}

async function toggleCheckin(memberId, cardUid, companyId) {
  if (!memberId) return;
  const cid = companyId || CFG.COMPANY_ID || 1;
  const existing = await query(
    \\\`SELECT id FROM gym_checkins
       WHERE member_id = $1 AND status = 'checked_in'
         AND company_id = $2 LIMIT 1\\\`,
    [memberId, cid]
  );
  if (existing && existing.length > 0) {
    await query(
      \\\`UPDATE gym_checkins
         SET status = 'checked_out',
             check_out_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1\\\`,
      [existing[0].id]
    );
    console.log(\\\`  CHECKOUT member_id=\\\${memberId}\\\`);
  } else {
    await query(
      \\\`INSERT INTO gym_checkins
         (company_id, member_id, card_uid, status, source)
         VALUES ($1,$2,$3,'checked_in','rfid')\\\`,
      [cid, memberId, cardUid]
    );
    console.log(\\\`  CHECKIN member_id=\\\${memberId}\\\`);
  }
}

async function lookupCard(cardUid) {
  const rows = await query(
    \\\`SELECT rc.id, rc.member_id, rc.card_uid,
           rc.label, rc.status, rc.company_id,
           mm.full_name AS member_name,
           mm.customer_id AS member_code,
           mm.company_id AS member_company_id
     FROM rfid_cards rc
     LEFT JOIN membership_members mm
       ON rc.member_id = mm.id
     WHERE rc.card_uid = $1 AND rc.status = 'active'\\\`,
    [cardUid]
  );
  if (!rows || rows.length === 0) {
    await logAccess(cardUid, null, null, false,
      "CARD_NOT_FOUND", "RFID card not found", 0, false,
      { company_id: CFG.COMPANY_ID || 1 });
    return { granted: false, reason: "CARD_NOT_FOUND" };
  }

  const card = rows[0];
  const cid = CFG.COMPANY_ID || card.company_id
    || card.member_company_id || 1;

  if (!card.member_id) {
    await logAccess(cardUid, null, null, false,
      "CARD_NOT_ISSUED", "Card not issued", 0, false,
      { company_id: cid });
    return { granted: false, reason: "CARD_NOT_ISSUED" };
  }

  const today = new Date().toISOString().split("T")[0];
  const subs = await query(
    \\\`SELECT ps.id, ps.end_date, ps.plan_type,
           mp.name AS plan_name
     FROM parking_subscriptions ps
     LEFT JOIN membership_plans mp ON ps.plan_id = mp.id
     WHERE ps.customer_id = $1
       AND ps.status IN ('active','pending')
       AND ps.start_date <= $2 AND ps.end_date >= $2
     ORDER BY ps.end_date DESC LIMIT 1\\\`,
    [card.member_id, today]
  );

  if (!subs || subs.length === 0) {
    await logAccess(cardUid, card.member_id,
      card.member_name, false,
      "NO_ACTIVE_SUBSCRIPTION",
      "No active subscription", 0, false,
      { company_id: cid });
    return { granted: false,
      reason: "NO_ACTIVE_SUBSCRIPTION" };
  }

  const sub = subs[0];
  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(sub.end_date).getTime() - Date.now())
    / 86400000));

  await query(
    "UPDATE rfid_cards SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1",
    [card.id]);
  await logAccess(cardUid, card.member_id,
    card.member_name, true, "ACCESS_GRANTED",
    "Access granted", daysRemaining, true,
    { company_id: cid, plan_name: sub.plan_name,
      subscription_id: sub.id, direction: "IN" });

  return {
    granted: true, reason: "ACCESS_GRANTED",
    member: { id: card.member_id, name: card.member_name },
    days_remaining: daysRemaining, company_id: cid,
  };
}

async function pollTasks() {
  const rows = await query(
    \\\`UPDATE relay_commands
       SET status = 'running', updated_at = CURRENT_TIMESTAMP
       WHERE id = (
         SELECT id FROM relay_commands
         WHERE status = 'pending'
         ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED
       ) RETURNING *\\\`
  );
  if (!rows || rows.length === 0) return;
  for (const task of rows) {
    console.log(\\\`  TASK #\\\${task.id}: \\\${task.action}\\\`);
    if (task.action === "open_door") {
      await openDoor();
      const cid = task.company_id || CFG.COMPANY_ID || 1;
      await logAccess("BUTTON", null, null, true,
        "REMOTE_OPEN", "Door opened via button", 0, true,
        { company_id: cid, direction: "IN",
          event_type: "REMOTE_OPEN" });
    }
    await query(
      "UPDATE relay_commands SET status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [task.id]
    );
    console.log(\\\`  TASK #\\\${task.id} done\\\`);
  }
}

async function pollEvents() {
  let raw = await controllerFetch(
    \\\`/Event.xml?ID=\\\${lastEventId}\\\`);
  if (!raw) return;
  raw = raw.replace(/>\s+</g, "><").replace(/\s+/g, " ");
  const m = raw.match(/<response>(.*?)<\\/response>/);
  if (!m) return;
  try {
    const ev = JSON.parse(m[1]);
    if (!ev.Card || !ev.ID) return;
    if (String(ev.ID) === String(lastEventId)) return;
    lastEventId = ev.ID;
    const cardUid = ev.Card;
    console.log(\\\`  SWIPE card=\\\${cardUid} id=\\\${ev.ID}\\\`);
    const lookup = await lookupCard(cardUid);
    if (lookup.granted) {
      console.log(\\\`  GRANTED for \\\${lookup.member?.name}\\\`);
      await openDoor();
      await toggleCheckin(
        lookup.member?.id, cardUid, lookup.company_id);
    } else {
      console.log(\\\`  DENIED: \\\${lookup.reason}\\\`);
    }
  } catch {}
}

console.log("=".repeat(50));
console.log("  Genius HRMS - Offline Access Relay");
console.log("=".repeat(50));
console.log(\\\`  Controller: \\\${CONTROLLER}\\\`);
console.log(\\\`  Company ID: \\\${CFG.COMPANY_ID || "not set"}\\\`);
console.log("=".repeat(50));

controllerFetch("/Event.xml?ID=0").then(r =>
  console.log(\\\`  Controller: \\\${r ? "OK" : "no response"}\\\`));
query("SELECT 1 AS ok").then(r =>
  console.log(\\\`  Database: \\\${r ? "connected" : "FAILED"}\\\`));

setInterval(pollTasks, 2000);
setInterval(pollEvents, 1000);
console.log("\\n  Relay running. Press Ctrl+C to stop.");`}</pre>

                <h6 className="fw-semibold mt-4">Relay Code Walkthrough</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>Lines</th><th>Function</th><th>What It Does</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>1-31</td><td>Config + Setup</td><td>Reads <code>.env.relay</code>, connects to Neon DB, builds controller auth header</td></tr>
                      <tr><td>35-43</td><td><code>query()</code></td><td>Runs SQL against Neon DB with error handling</td></tr>
                      <tr><td>45-52</td><td><code>controllerFetch()</code></td><td>HTTP GET to controller (e.g. Event.xml) with Basic Auth</td></tr>
                      <tr><td>54-59</td><td><code>controllerCmd()</code></td><td>HTTP POST to controller (e.g. cdor.cgi?open=1) — opens door. 10s timeout.</td></tr>
                      <tr><td>61-63</td><td><code>openDoor()</code></td><td>Calls controllerCmd with the door-open path</td></tr>
                      <tr><td>65-73</td><td><code>logAccess()</code></td><td>Inserts into <code>rfid_access_logs</code> with company_id, event_type, plan info</td></tr>
                      <tr><td>75-95</td><td><code>toggleCheckin()</code></td><td>Toggles gym check-in/out (first swipe = checkin, second = checkout)</td></tr>
                      <tr><td>97-149</td><td><code>lookupCard()</code></td><td>Core logic: finds card → finds member → checks subscription → grants/denies. Logs every result.</td></tr>
                      <tr><td>151-176</td><td><code>pollTasks()</code></td><td>Every 2s: picks up pending <code>relay_commands</code> (from QR scans, Open Door button) → opens door → marks done</td></tr>
                      <tr><td>178-200</td><td><code>pollEvents()</code></td><td>Every 1s: fetches <code>/Event.xml?ID=0</code> from controller → parses card swipe → lookupCard → openDoor if granted</td></tr>
                      <tr><td>202-218</td><td>Main</td><td>Prints banner, tests controller + DB connection, starts polling intervals</td></tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-semibold mt-4">Event Flow Diagrams</h6>

                <p className="fw-semibold mt-3">RFID Card Swipe Flow:</p>
                <pre className="bg-light p-3 rounded small mb-4">{`Person taps card on controller
       │
       ▼
controller stores event in XML
       │
       ▼
relay pollEvents() fetches /Event.xml?ID=0
       │
       ▼
relay parses XML → gets Card UID
       │
       ▼
relay lookupCard(uid)
       │── Card found? ──── NO → log CARD_NOT_FOUND → stop
       │── Member assigned? ── NO → log CARD_NOT_ISSUED → stop
       │── Active sub? ── NO → log NO_ACTIVE_SUBSCRIPTION → stop
       │
       ▼ (all checks pass)
relay openDoor() → POST /cdor.cgi?open=1 → controller opens lock
relay logAccess(granted=true)
relay toggleCheckin() → gym check-in/out
       │
       ▼
QR Access page polls /api/parking/access/qr-live
→ shows "Access granted" with member name + plan`}</pre>

                <p className="fw-semibold">QR Code Scan Flow:</p>
                <pre className="bg-light p-3 rounded small mb-4">{`Person shows QR to webcam on QR Access page
       │
       ▼
html5-qrcode decodes JSON: {"t":"sub","sid":7,"cid":5}
       │
       ▼
QR Access page calls POST /api/parking/access/qr-lookup
       │
       ▼
qr-lookup API validates subscription in Neon DB
       │── Valid + active → log ACCESS_GRANTED + insert relay_commands
       │── Invalid/expired → log reason → return denied
       │
       ▼ (granted)
relay pollTasks() picks up relay_commands entry
       │
       ▼
relay openDoor() → POST /cdor.cgi?open=1 → controller opens lock
       │
       ▼
QR Access page shows member info card + "Access granted"`}</pre>
              </Section>

              <Section id="faq" title="16. Frequently Asked Questions">
                <div className="accordion" id="faqAccordion">
                  {[
                    {
                      q: "How do I reset my password?",
                      a: "Contact your system administrator to reset your password. Password reset functionality is managed at the admin level."
                    },
                    {
                      q: "Why can't I see certain modules?",
                      a: "Modules are licensed per company. If you cannot see a module, your company may not have an active license for it. Contact your company admin."
                    },
                    {
                      q: "How do I switch between English and Amharic?",
                      a: "Click the language icon in the top bar (🌐 or language code) and select your preferred language from the dropdown."
                    },
                    {
                      q: "How does multi-company access work?",
                      a: "Each user belongs to one company. You log in using your Company TIN. Super Admins can see all companies. Regular users only see their own company's data."
                    },
                    {
                      q: "How do I record attendance for employees?",
                      a: "Go to HRMS → Attendance. You can record attendance manually. Employees can also clock in/out through the Self Service portal."
                    },
                    {
                      q: "What payroll taxes are supported?",
                      a: "The system supports Ethiopian PAYE (income tax) with configurable brackets, and pension contributions (employee 7%, employer 11%)."
                    },
                    {
                      q: "Can I customize the system?",
                      a: "The system supports module licensing (you enable only the modules you need). System settings and configurations are managed through the Settings page."
                    },
                    {
                      q: "How do I get support?",
                      a: "Contact your system administrator for support. For technical issues, reach out to the Genius ERP support team."
                    }
                  ].map((faq, i) => (
                    <div className="accordion-item" key={i}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`}>
                          {faq.q}
                        </button>
                      </h2>
                      <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body small">{faq.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="developer" title="Developer Guide">
                <p className="lead">Technical reference for developers customizing the Genius ERP platform.</p>

                <h6 className="fw-semibold mt-4">Module System Architecture</h6>
                <p>Each module has a unique <code>code</code> stored in the <code>modules</code> database table. Companies are linked to modules via <code>company_modules</code> (with <code>is_enabled</code> flag). The sidebar and dashboard module grid filter by license using the <code>moduleCode</code> property.</p>

                <h6 className="fw-semibold mt-4">Registering a New Module</h6>
                <ol>
                  <li><strong>Database:</strong> Insert a row into the <code>modules</code> table:
                    <pre className="bg-dark text-light p-3 rounded small mt-2 mb-2 overflow-auto">{`INSERT INTO modules (code, name, description, icon, sort_order)
 VALUES ('my_module', 'My Module', 'Description', 'bi-plugin', 10);`}
                    </pre>
                  </li>
                  <li><strong>Sidebar group</strong> in <code>app/dashboard/layout.tsx</code> — add an entry to <code>sidebarGroups</code> with <code>moduleCode: "my_module"</code>:
                    <pre className="bg-dark text-light p-3 rounded small mt-2 mb-2 overflow-auto">{`{
  name: "My Module",
  moduleCode: "my_module",
  icon: "bi-plugin",
  adminOnly: false,
  links: [
    { name: "Dashboard", href: "/dashboard/my-module", icon: "bi-speedometer2", adminOnly: false },
  ]
}`}
                    </pre>
                  </li>
                  <li><strong>Dashboard grid card</strong> in <code>app/dashboard/page.tsx</code> — add an entry to the <code>modules</code> array with <code>moduleCode: "my_module"</code>.</li>
                  <li><strong>Issue a license</strong> — create a demo license or assign the module via the Companies page to enable it for a company. The sidebar and dashboard will auto-hide the module until licensed.</li>
                </ol>

                <h6 className="fw-semibold mt-4">How Module Gating Works</h6>
                <ul>
                  <li><strong>sidebarGroups</strong> in <code>layout.tsx</code> — groups with a <code>moduleCode</code> are hidden unless the user's company has that module enabled in <code>company_modules</code>.</li>
                  <li><strong>Dashboard grid</strong> in <code>page.tsx</code> — cards with a <code>moduleCode</code> are filtered the same way.</li>
                  <li><strong>Always-visible groups</strong> — Dashboard, Audit, System, and Administration have no <code>moduleCode</code> and are always shown (subject to role checks).</li>
                  <li><strong>Data source</strong> — licensed modules are fetched via <code>GET /api/companies/{'{companyId}'}</code>, which returns a <code>modules</code> array with <code>{'{ id, code, name, enabled }'}</code>.</li>
                </ul>

                <h6 className="fw-semibold mt-4">Adding a New Page</h6>
                <ol>
                  <li>Create the page file under <code>app/dashboard/my-module/</code> (e.g. <code>page.tsx</code>, <code>[id]/page.tsx</code>).</li>
                  <li>Add the sidebar link (see above).</li>
                  <li>Add translation keys in <code>messages/en.json</code> and <code>messages/am.json</code> — use the pattern <code>nav.{'{group}'}.{'{link}'}</code> (e.g. <code>"nav.my_module.dashboard"</code>).</li>
                  <li>Use <code>{'const { t } = useLanguage()'}</code> and call <code>t("nav.my_module.dashboard")</code> to display the translated label.</li>
                  <li>Run <code>npx next build</code> to verify zero TypeScript errors.</li>
                </ol>

                <h6 className="fw-semibold mt-4">Translation System</h6>
                <p>Translation files are nested JSON objects in <code>messages/en.json</code> and <code>messages/am.json</code>. Keys follow a dot-separated convention that maps to nested objects:</p>
                <pre className="bg-dark text-light p-3 rounded small mt-2 mb-2 overflow-auto">{`{
  "nav": {
    "sales": {
      "dashboard": "Sales",
      "customers": "Customers"
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}`}
                </pre>
                <p>The <code>t("nav.sales.dashboard")</code> function traverses the nested object to find the translation. If not found, it returns the key itself.</p>

                <h6 className="fw-semibold mt-4">API Route Pattern</h6>
                <pre className="bg-dark text-light p-3 rounded small mt-2 mb-2 overflow-auto">{`import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  // user has: id, email, role, company_id, company_name, company_tin
  try {
    const result = await pool.query("SELECT * FROM my_table WHERE company_id = $1", [user.company_id]);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}`}
                </pre>

                <h6 className="fw-semibold mt-4">Build &amp; Deploy</h6>
                <ul>
                  <li><strong>Build:</strong> <code>npx next build</code> — runs TypeScript check + Turbopack compilation. Must pass with 0 errors.</li>
                  <li><strong>Dev:</strong> <code>npx next dev</code> — hot-reload development server.</li>
                  <li><strong>Database:</strong> Uses <code>pg.Pool</code> with <code>DATABASE_URL</code> env var. Set in <code>.env</code> locally and in Vercel environment variables.</li>
                  <li><strong>Database migrations:</strong> SQL files named <code>db-migration-v{'{number}'}.sql</code>. Apply in order. Use <code>IF NOT EXISTS</code> / <code>IF EXISTS</code> for idempotent re-runs.</li>
                </ul>
              </Section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
