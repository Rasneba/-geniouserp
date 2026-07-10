"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const badgeColors: Record<string, string> = {
  initial: "primary",
  promotion: "success",
  demotion: "warning",
  transfer: "info",
  suspension: "secondary",
  termination: "danger",
};

export default function PlacementsPage() {
  const router = useRouter();
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    fetch("/api/placements", { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPlacements(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Placement & Benefits</h4>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/placements/new")}>
          <i className="bi bi-plus-lg me-1"></i>New Placement
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Stage</th>
                <th>Department</th>
                <th>Position</th>
                <th>Branch</th>
                <th>Salary</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : placements.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-muted py-4">No placements found</td></tr>
              ) : (
                placements.map((p: any) => (
                  <tr key={p.id} role="button" style={{ cursor: "pointer" }} onClick={() => router.push(`/dashboard/placements/${p.id}`)}>
                    <td className="fw-semibold">{p.employee_name}</td>
                    <td><span className={`badge bg-${badgeColors[p.placement_type] || "secondary"}`}>{p.placement_type}</span></td>
                    <td>{p.employment_stage_name || "-"}</td>
                    <td>{p.department_name || "-"}</td>
                    <td>{p.position_title || "-"}</td>
                    <td>{p.branch || "-"}</td>
                    <td>{p.salary ? `$${parseFloat(p.salary).toLocaleString()}` : "-"}</td>
                    <td>{p.start_date}</td>
                    <td>{p.end_date || "-"}</td>
                    <td>
                      <span className={`badge bg-${p.status === "active" ? "success" : p.status === "ended" ? "secondary" : "warning"}`}>
                        {p.status}
                      </span>
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
