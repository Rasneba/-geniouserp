"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PositionsPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("Birr");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    Promise.all([
      fetch("/api/positions", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch("/api/settings", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()).catch(() => ({})),
    ]).then(([data, settings]) => {
      if (Array.isArray(data)) setPositions(data);
      if (settings?.currency) setCurrency(settings.currency);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Positions</h4>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/positions/add")}>
          <i className="bi bi-plus-lg me-1"></i>Add Position
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Description</th>
                <th>Min Salary</th>
                <th>Max Salary</th>
                <th>Status</th>
                <th style={{width: "120px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : positions.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">No positions found</td></tr>
              ) : (
                positions.map((p: any) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.title}</td>
                    <td>{p.department_name || "-"}</td>
                    <td className="text-muted small">{p.description || "-"}</td>
                    <td>{p.min_salary ? `${currency} ${p.min_salary}` : "-"}</td>
                    <td>{p.max_salary ? `${currency} ${p.max_salary}` : "-"}</td>
                    <td>{p.is_active ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Inactive</span>}</td>
                    <td>
                      <Link href={`/dashboard/positions/${p.id}`} className="btn btn-warning btn-sm text-white me-1">
                        <i className="bi bi-pencil"></i>
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
