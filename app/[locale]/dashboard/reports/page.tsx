"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";

const reportCategories = [
  {
    title: "Personnel Reports",
    icon: "bi-people",
    color: "primary",
    reports: [
      { name: "Employee List Export", endpoint: "/api/employees", description: "Export complete employee directory with contact details", tab: "personnel" },
      { name: "Age Group Report", endpoint: "/api/employees", description: "Workforce age distribution and demographics", tab: "personnel" },
      { name: "Salary Group Report", endpoint: "/api/employees", description: "Employee salary band breakdown by category", tab: "personnel" },
    ],
  },
  {
    title: "Placement Reports",
    icon: "bi-briefcase",
    color: "success",
    reports: [
      { name: "Placement History", endpoint: "/api/placements", description: "Complete placement records and assignment history", tab: "placement" },
      { name: "Promotion Report", endpoint: "/api/placements", description: "Promotion records, trends, and approvals", tab: "placement" },
      { name: "Demotion Report", endpoint: "/api/placements", description: "Demotion records and reassignment tracking", tab: "placement" },
      { name: "Transfer Report", endpoint: "/api/placements", description: "Inter-department and inter-branch transfers", tab: "placement" },
    ],
  },
  {
    title: "Time & Attendance",
    icon: "bi-clock-history",
    color: "warning",
    reports: [
      { name: "Attendance Sheet", endpoint: "/api/attendance", description: "Daily attendance records, check-in/out patterns", tab: "attendance" },
      { name: "Leave Report", endpoint: "/api/leave-requests", description: "Leave requests, balances, and approval status", tab: "attendance" },
      { name: "Overtime Report", endpoint: "/api/overtime", description: "Overtime hours logged and compensation data", tab: "attendance" },
    ],
  },
  {
    title: "Payroll Reports",
    icon: "bi-wallet2",
    color: "info",
    reports: [
      { name: "Monthly Payroll", endpoint: "/api/payroll", description: "Monthly salary processing and disbursement summary", tab: "payroll" },
      { name: "Bank Letter", endpoint: "/api/employees", description: "Generate bank salary transfer authorization letters", tab: "payroll" },
      { name: "Income Tax Report", endpoint: "/api/payroll/enhanced", description: "PAYE tax deduction and remittance statements", tab: "payroll" },
      { name: "Pension Report", endpoint: "/api/payroll/enhanced", description: "Pension contribution statements per employee", tab: "payroll" },
    ],
  },
];

const tabs = [
  { key: "all", label: "All Reports", icon: "bi-grid-3x3-gap" },
  { key: "personnel", label: "Personnel", icon: "bi-people" },
  { key: "placement", label: "Placement", icon: "bi-briefcase" },
  { key: "attendance", label: "Time & Attendance", icon: "bi-clock-history" },
  { key: "payroll", label: "Payroll", icon: "bi-wallet2" },
];

const reportIconMap: Record<string, string> = {
  personnel: "bi-person-badge",
  placement: "bi-arrow-up-right-circle",
  attendance: "bi-calendar-check",
  payroll: "bi-receipt-cutoff",
};

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  success: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
  warning: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  info: { bg: "rgba(14,165,233,0.1)", text: "#0ea5e9" },
};

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfigSheet, setShowConfigSheet] = useState(false);
  const [filters, setFilters] = useState({ start_date: "", end_date: "", branch_id: "" });
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, departments: 0, totalReports: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setStatsLoading(false); return; }
      try {
        const [empRes, leaveRes] = await Promise.all([
          fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/leave-requests", { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const empData = await empRes.json();
        const leaveData = await leaveRes.json();
        const employees = Array.isArray(empData) ? empData : [];
        const depts = new Set(employees.map((e: any) => e.department).filter(Boolean));
        setStats({
          employees: employees.length,
          pendingLeaves: Array.isArray(leaveData) ? leaveData.filter((l: any) => l.status === "pending").length : 0,
          departments: depts.size,
          totalReports: reportCategories.reduce((acc, c) => acc + c.reports.length, 0),
        });
      } catch { /* stats remain 0 */ }
      setStatsLoading(false);
    };
    fetchStats();
  }, []);

  const filteredReports = useMemo(() => {
    let all: any[] = [];
    reportCategories.forEach((cat) => {
      cat.reports.forEach((r) => {
        all.push({ ...r, category: cat.title, categoryIcon: cat.icon, categoryColor: cat.color });
      });
    });
    if (activeTab !== "all") all = all.filter((r) => r.tab === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return all;
  }, [activeTab, searchQuery]);

  const groupedReports = useMemo(() => {
    const g: Record<string, any[]> = {};
    filteredReports.forEach((r) => {
      if (!g[r.category]) g[r.category] = [];
      g[r.category].push(r);
    });
    return g;
  }, [filteredReports]);

  const openConfigSheet = (report: any) => {
    setSelectedReport(report);
    setFilters({ start_date: "", end_date: "", branch_id: "" });
    setShowConfigSheet(true);
  };

  const generate = async () => {
    if (!selectedReport) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setLoading(true);
    setShowConfigSheet(false);
    setData([]);
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.set("start_date", filters.start_date);
      if (filters.end_date) params.set("end_date", filters.end_date);
      if (filters.branch_id) params.set("branch_id", filters.branch_id);
      const res = await fetch(`${selectedReport.endpoint}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
        if (result.length > 0) setColumns(Object.keys(result[0]).filter((k) => !["id", "password_hash", "updated_at"].includes(k)));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  const downloadCSV = () => {
    if (!data.length || !columns.length) return;
    const header = columns.join(",");
    const rows = data.map((row) =>
      columns.map((col) => {
        const val = formatValue(row[col]);
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(selectedReport?.name || "report").replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <style>{`
        @media print { .no-print { display: none !important; } .table { font-size: 0.75rem !important; } }
        .report-card { transition: all 0.2s ease; cursor: pointer; }
        .report-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }
        .report-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem; }
        .tab-pill { transition: all 0.15s ease; }
        .config-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1050; backdrop-filter: blur(2px); animation: fadeIn 0.2s ease; }
        .config-sheet { position: fixed; top: 0; right: 0; bottom: 0; width: 420px; max-width: 100vw; background: var(--card-bg); border-left: 1px solid var(--card-border); z-index: 1051; box-shadow: var(--shadow-lg); animation: slideRight 0.25s ease; display: flex; flex-direction: column; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .stat-hover { transition: all 0.2s ease; }
        .stat-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <div>
          <h4 className="fw-bold mb-0">Reports Dashboard</h4>
          <small className="text-muted">Generate, filter, and export HR reports</small>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mb-4 no-print">
        {[
          { label: "Total Employees", value: stats.employees, icon: "bi-people-fill", color: "primary" },
          { label: "Pending Leaves", value: stats.pendingLeaves, icon: "bi-hourglass-split", color: "warning" },
          { label: "Departments", value: stats.departments, icon: "bi-building", color: "success" },
          { label: "Reports Available", value: stats.totalReports, icon: "bi-file-earmark-bar-graph", color: "info" },
        ].map((s) => (
          <div className="col-sm-6 col-xl-3" key={s.label}>
            <div className="card border-0 shadow-sm h-100 stat-hover">
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div className={`rounded-3 bg-${s.color} bg-opacity-10 d-flex align-items-center justify-content-center`} style={{ width: 44, height: 44, flexShrink: 0 }}>
                  <i className={`bi ${s.icon} fs-5 text-${s.color}`}></i>
                </div>
                <div className="min-w-0">
                  <div className="text-muted small text-nowrap">{s.label}</div>
                  <div className="fw-bold fs-5">{statsLoading ? <span className="skeleton d-inline-block" style={{ width: 40, height: 24 }}>&nbsp;</span> : s.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <ul className="nav nav-pills gap-1 flex-wrap mb-0">
          {tabs.map((t) => {
            const count = t.key === "all" ? reportCategories.reduce((a, c) => a + c.reports.length, 0) : reportCategories.flatMap((c) => c.reports).filter((r) => r.tab === t.key).length;
            return (
              <li className="nav-item" key={t.key}>
                <button className={`nav-link d-flex align-items-center gap-1 tab-pill ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
                  <i className={`bi ${t.icon}`}></i>
                  {t.label}
                  <span className={`badge rounded-pill ms-1 ${activeTab === t.key ? "bg-white bg-opacity-25" : "bg-secondary bg-opacity-10 text-secondary"}`} style={{ fontSize: "0.6rem", padding: "0.1em 0.45em" }}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div style={{ width: 260 }}>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search reports..." />
        </div>
      </div>

      {/* Report Cards */}
      <div className="no-print">
        {Object.keys(groupedReports).length === 0 ? (
          <div className="empty-state-card">
            <i className="bi bi-search fs-3 d-block mb-2"></i>
            No reports match your search. Try a different term or tab.
          </div>
        ) : (
          <div className="row g-3">
            {Object.entries(groupedReports).map(([category, reports]) => (
              <div className="col-12" key={category}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${reports[0].categoryIcon} text-${reports[0].categoryColor}`}></i>
                  <span className="fw-semibold small">{category}</span>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: "0.6rem" }}>{reports.length}</span>
                </div>
                <div className="row g-3">
                  {reports.map((r: any) => {
                    const cc = categoryColorMap[r.categoryColor] || categoryColorMap.primary;
                    return (
                      <div className="col-sm-6 col-lg-4 col-xl-3" key={r.name}>
                        <div className="card border-0 shadow-sm h-100 report-card" onClick={() => openConfigSheet(r)}>
                          <div className="card-body d-flex flex-column gap-2 p-3">
                            <div className="d-flex align-items-start gap-3">
                              <div className="report-icon" style={{ background: cc.bg, color: cc.text }}>
                                <i className={`bi ${reportIconMap[r.tab] || "bi-file-earmark"}`}></i>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="fw-semibold small mb-0">{r.name}</div>
                                <div className="text-muted" style={{ fontSize: "0.7rem", lineHeight: 1.3 }}>{r.description}</div>
                              </div>
                            </div>
                            <div className="mt-auto pt-1">
                              <span className="btn btn-outline-primary btn-sm w-100">
                                <i className="bi bi-gear me-1"></i>Configure &amp; Generate
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration Side Sheet */}
      {showConfigSheet && (
        <>
          <div className="config-overlay no-print" onClick={() => setShowConfigSheet(false)} />
          <div className="config-sheet no-print">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: "var(--card-border)" }}>
              <div className="min-w-0">
                <h6 className="fw-bold mb-0">{selectedReport?.name}</h6>
                <small className="text-muted">{selectedReport?.description}</small>
              </div>
              <button className="btn btn-sm btn-outline-secondary ms-2 flex-shrink-0" onClick={() => setShowConfigSheet(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-3 flex-1" style={{ overflowY: "auto" }}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Date Range</label>
                <div className="d-flex gap-2">
                  <input type="date" className="form-control" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
                  <input type="date" className="form-control" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Department</label>
                <select className="form-select" value={filters.branch_id} onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })}>
                  <option value="">All Departments</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="engineering">Engineering</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Branch</label>
                <select className="form-select">
                  <option value="">All Branches</option>
                  <option value="hq">Headquarters</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Output Format</label>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm flex-fill active"><i className="bi bi-table me-1"></i>Table</button>
                  <button className="btn btn-outline-secondary btn-sm flex-fill"><i className="bi bi-filetype-pdf me-1"></i>PDF</button>
                </div>
              </div>
            </div>
            <div className="p-3 border-top" style={{ borderColor: "var(--card-border)" }}>
              <button className="btn btn-primary w-100" onClick={generate} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1"></span>Generating...</> : <><i className="bi bi-file-earmark-bar-graph me-1"></i>Generate Report</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Results Table */}
      {selectedReport && !showConfigSheet && (
        <div className="card border-0 shadow-sm mt-3">
          <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-bar-graph text-primary"></i>
              {selectedReport.name}
            </span>
            <div className="d-flex gap-2 align-items-center">
              {data.length > 0 && <span className="badge bg-primary">{data.length} records</span>}
              {data.length > 0 && (
                <>
                  <button className="btn btn-outline-success btn-sm" onClick={downloadCSV}>
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i>CSV
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                    <i className="bi bi-printer me-1"></i>Print
                  </button>
                </>
              )}
              <button className="btn btn-outline-danger btn-sm" onClick={() => { setSelectedReport(null); setData([]); setColumns([]); }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div className="card-body p-0" style={{ overflowX: "auto" }}>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
            ) : data.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                No data returned. Try adjusting your filters.
              </div>
            ) : (
              <table className="table table-hover mb-0" style={{ fontSize: "0.85rem" }}>
                <thead className="table-dark">
                  <tr>
                    {columns.map((col) => <th key={col}>{col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((row: any, idx: number) => (
                    <tr key={idx}>
                      {columns.map((col) => <td key={col}>{formatValue(row[col])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data.length > 50 && <div className="text-center text-muted small py-2">Showing first 50 of {data.length} records</div>}
          </div>
        </div>
      )}
    </div>
  );
}
