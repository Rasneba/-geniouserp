"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClearancePage() {
  const [clearances, setClearances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clearance", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (Array.isArray(data)) setClearances(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { pending: "warning", in_progress: "info", cleared: "success", rejected: "danger" };
    return <span className={`badge bg-${map[s] || "secondary"}`}>{s.replace("_", " ")}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-door-open me-2"></i>Employee Clearance</h4>
        <Link href="/dashboard/termination" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>New Clearance
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Termination Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Initiated By</th>
                <th>Approved By</th>
                <th style={{width: "120px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : clearances.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">No clearance records found</td></tr>
              ) : (
                clearances.map((c: any) => (
                  <tr key={c.id}>
                    <td className="fw-medium">{c.first_name} {c.middle_name || ""} {c.last_name}<br /><small className="text-muted">{c.employee_code}</small></td>
                    <td>{c.department_name || "-"}</td>
                    <td>{c.termination_date?.split("T")[0]}</td>
                    <td>{c.termination_type || "-"}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td>{c.initiated_by_name || "-"}</td>
                    <td>{c.approved_by_name || "-"}</td>
                    <td>
                      <Link href={`/dashboard/clearance/${c.id}`} className="btn btn-success btn-sm">
                        <i className="bi bi-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
