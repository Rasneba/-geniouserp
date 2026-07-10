"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(d => { if (d && d.totalCompanies !== undefined) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  const cards = [
    { label: "Total Companies", value: data?.totalCompanies || 0, icon: "bi-building", color: "text-primary", href: "/dashboard/companies" },
    { label: "Active Licenses", value: data?.totalActiveLicenses || 0, icon: "bi-key", color: "text-success", href: "/dashboard/demo-licenses" },
    { label: "Total Users", value: data?.totalUsers || 0, icon: "bi-people", color: "text-info", href: "/dashboard/users" },
    { label: "Expiring This Week", value: data?.expiringThisWeek || 0, icon: "bi-clock", color: data?.expiringThisWeek ? "text-danger" : "text-success", href: "/dashboard/demo-licenses" },
  ];

  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-shield-lock me-2"></i>Super Admin Dashboard</h4>
          <p className="text-muted small mb-0">System-wide overview of all companies and licenses</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/dashboard/companies" className="btn btn-outline-primary btn-sm"><i className="bi bi-building me-1"></i>Companies</Link>
          <Link href="/dashboard/demo-licenses" className="btn btn-outline-primary btn-sm"><i className="bi bi-key me-1"></i>Licenses</Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {cards.map(c => (
          <div className="col-md-3" key={c.label}>
            <Link href={c.href} className="text-decoration-none">
              <div className="card interactive-card border-0 shadow-sm p-3 rounded-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <i className={`bi ${c.icon} fs-2 ${c.color}`}></i>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">{c.label}</div>
                    <div className={`fs-4 fw-bold counter-value ${c.color}`}>{c.value}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span><i className="bi bi-building me-2"></i>Companies</span>
              <Link href="/dashboard/companies" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {(!data?.recentCompanies || data.recentCompanies.length === 0) ? (
                <div className="text-center text-muted py-4">No companies registered</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Company</th>
                        <th>TIN</th>
                        <th>License</th>
                        <th>Users</th>
                        <th>Licenses</th>
                        <th>Expiry</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentCompanies.map((c: any) => (
                        <tr key={c.id}>
                          <td className="fw-semibold small">{c.name}</td>
                          <td><code className="small">{c.tin}</code></td>
                          <td><span className={`badge bg-${c.license_type === 'enterprise' ? 'primary' : c.license_type === 'full' ? 'success' : 'info'}`}>{c.license_type}</span></td>
                          <td><span className="badge bg-secondary">{c.user_count || 0}</span></td>
                          <td><span className="badge bg-secondary">{c.active_licenses || 0}</span></td>
                          <td className="small">{c.latest_expiry ? new Date(c.latest_expiry).toLocaleDateString() : "-"}</td>
                          <td><span className={`badge ${c.status === 'active' ? 'bg-success' : 'bg-danger'}`}>{c.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold"><i className="bi bi-pie-chart me-2"></i>Module Adoption</div>
            <div className="card-body">
              {data?.moduleAdoption?.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {data.moduleAdoption.map((m: any) => (
                    <div key={m.code}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">{m.name}</span>
                        <span className="text-muted">{m.active_companies} companies</span>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${Math.min(100, (m.active_companies / (data.totalCompanies || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">No data</div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header fw-semibold"><i className="bi bi-info-circle me-2"></i>Quick Actions</div>
            <div className="card-body d-flex flex-column gap-2">
              <Link href="/dashboard/companies" className="btn btn-outline-primary btn-sm w-100"><i className="bi bi-plus-lg me-1"></i>Register Company</Link>
              <Link href="/dashboard/demo-licenses" className="btn btn-outline-success btn-sm w-100"><i className="bi bi-key me-1"></i>Issue License</Link>
              <Link href="/dashboard/users" className="btn btn-outline-info btn-sm w-100"><i className="bi bi-people me-1"></i>Manage Users</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
