"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const modules = [
  { name: "Sales", moduleCode: "sales", icon: "bi-cart3", href: "/dashboard/sales", color: "#3b82f6", desc: "Orders, invoices, customers, quotations" },
  { name: "Stock", moduleCode: "stock", icon: "bi-box-seam", href: "/dashboard/stock", color: "#10b981", desc: "Inventory, warehouses, stock movements" },
  { name: "Finance", moduleCode: "finance", icon: "bi-cash-stack", href: "/dashboard/finance", color: "#f59e0b", desc: "Ledgers, payments, accounts, budget" },
  { name: "Production", moduleCode: "production", icon: "bi-gear", href: "/dashboard/production", color: "#8b5cf6", desc: "Manufacturing, BOM, work orders" },
  { name: "HRMS", moduleCode: "hrms", icon: "bi-people", href: "/dashboard/employees", color: "#ef4444", desc: "Employees, payroll, attendance, leave" },
  { name: "Procurement", moduleCode: "procurement", icon: "bi-truck", href: "/dashboard/procurement", color: "#06b6d4", desc: "Purchase orders, suppliers, RFQ" },
  { name: "E-Commerce", moduleCode: "ecommerce", icon: "bi-shop", href: "/dashboard/ecommerce", color: "#ec4899", desc: "Online store, products, orders" },
  { name: "Membership", moduleCode: "membership", icon: "bi-person-badge", href: "/dashboard/membership", color: "#6366f1", desc: "Plans, members, renewals, payments" },
  { name: "Audit", icon: "bi-journal-text", href: "/dashboard/audit-logs", color: "#14b8a6", desc: "Audit trails, activity logs" },
  { name: "Reports", icon: "bi-bar-chart", href: "/dashboard/reports", color: "#f97316", desc: "Analytics, charts, exports" },
];

const quickActions = [
  { label: "New Employee", icon: "bi-person-plus", href: "/dashboard/employees/add", color: "primary" },
  { label: "New Sale", icon: "bi-cart-plus", href: "/dashboard/sales/new", color: "success" },
  { label: "New Purchase", icon: "bi-truck-flatbed", href: "/dashboard/procurement/new", color: "info" },
  { label: "New Voucher", icon: "bi-file-earmark-plus", href: "/dashboard/vouchers/add", color: "warning" },
];

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [currency, setCurrency] = useState("Birr");
  const [greeting, setGreeting] = useState("");
  const [licensedModules, setLicensedModules] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      const role = (u.role || "").toLowerCase();
      setUserRole(role);
      setCompanyName(u.company_name || "");
      if (u.company_id) {
        const tok = localStorage.getItem("token");
        if (tok) {
          fetch(`/api/companies/${u.company_id}`, { headers: { Authorization: `Bearer ${tok}` } })
            .then(r => r.json())
            .then(data => {
              if (data?.modules && Array.isArray(data.modules)) {
                setLicensedModules(data.modules.filter((m: any) => m.enabled).map((m: any) => m.code));
              }
            })
            .catch(() => {});
        }
      }
    }

    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const tok = localStorage.getItem("token");
    if (!tok) return;
    Promise.all([
      fetch("/api/dashboard/stats", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch("/api/settings", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()).catch(() => ({})),
    ]).then(([s, settings]) => {
      setStats(s);
      if (settings?.currency) setCurrency(settings.currency);
    }).catch(console.error);
  }, [router]);

  if (!stats) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const isSuper = userRole === "super_admin";
  const hasLicense = (code: string) => isSuper || licensedModules.includes(code);

  const visibleModules = modules.filter(m => {
    if (!m.moduleCode) return hasLicense("reports") || hasLicense("audit");
    return hasLicense(m.moduleCode);
  });

  const visibleQuickActions = quickActions.filter(a => {
    if (a.href.includes("/employees")) return hasLicense("hrms");
    if (a.href.includes("/sales")) return hasLicense("sales");
    if (a.href.includes("/procurement")) return hasLicense("procurement");
    if (a.href.includes("/vouchers")) return hasLicense("finance");
    return false;
  });

  const hrCards = hasLicense("hrms") ? [
    { title: "Employees", value: stats.totalEmployees, color: "text-primary", icon: "bi-people", href: "/dashboard/employees" },
    { title: "Present Today", value: stats.presentToday, color: "text-success", icon: "bi-calendar-check", href: "/dashboard/attendance" },
    { title: "Pending Leave", value: stats.pendingLeave, color: "text-warning", icon: "bi-calendar-event", href: "/dashboard/leave" },
    { title: "Payroll", value: `${currency} ${stats.totalPayroll?.toLocaleString()}`, color: "text-info", icon: "bi-wallet2", href: "/dashboard/payroll" },
  ] : [];

  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">{greeting}</h3>
          <p className="text-muted mb-0 small">Welcome to {companyName || "Genius ERP"}</p>
        </div>
        <div className="d-flex gap-2">
          {visibleQuickActions.map((a) => (
            <Link key={a.label} href={a.href} className={`btn btn-outline-${a.color} btn-sm d-flex align-items-center gap-1`}>
              <i className={`bi ${a.icon}`}></i> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {visibleModules.length > 0 && (
        <>
          <h5 className="fw-semibold mb-3"><i className="bi bi-grid me-2"></i>ERP Modules</h5>
          <div className="row g-3 mb-4">
            {visibleModules.map((mod) => (
              <div className="col-md-4 col-lg-3" key={mod.name}>
                <Link href={mod.href} className="text-decoration-none">
                  <div className="card interactive-card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-3 d-flex align-items-start gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{ width: "48px", height: "48px", backgroundColor: `${mod.color}15` }}
                      >
                        <i className={`bi ${mod.icon} fs-4`} style={{ color: mod.color }}></i>
                      </div>
                      <div className="min-w-0">
                        <h6 className="fw-bold mb-1" style={{ color: "var(--foreground)" }}>{mod.name}</h6>
                        <p className="text-muted small mb-0" style={{ fontSize: "12px", lineHeight: 1.3 }}>{mod.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {hrCards.length > 0 && (
        <>
          <h5 className="fw-semibold mb-3"><i className="bi bi-speedometer2 me-2"></i>HR Quick Stats</h5>
          <div className="row g-3 mb-4">
            {hrCards.map((item) => (
              <div className="col-md-3" key={item.title}>
                <Link href={item.href} className="text-decoration-none">
                  <div className="card interactive-card border-0 shadow-sm p-3 rounded-3 h-100">
                    <div className="d-flex align-items-center gap-3">
                      <i className={`bi ${item.icon} fs-2 ${item.color}`}></i>
                      <div>
                        <div className="text-muted small text-uppercase fw-bold">{item.title}</div>
                        <div className={`fs-4 fw-bold counter-value ${item.color}`}>{item.value}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {hasLicense("hrms") && (
        <div className="card border-0 shadow-sm">
          <div className="card-header fw-semibold d-flex justify-content-between align-items-center" style={{ backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}>
            <span>Recent Employees</span>
            <Link href="/dashboard/employees" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmployees?.length > 0 ? (
                  stats.recentEmployees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td>{emp.code}</td>
                      <td>{emp.first_name} {emp.last_name}</td>
                      <td>{emp.department_name || "-"}</td>
                      <td>
                        {emp.is_active ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">No employees yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center text-muted small mt-4">
        <i className="bi bi-building me-1"></i>{companyName || "Genius ERP"} &middot;
        <i className="bi bi-laptop ms-2 me-1"></i>Genius ERP ICT Solutions PLC
      </div>
    </div>
  );
}
