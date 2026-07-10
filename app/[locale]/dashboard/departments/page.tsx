"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    fetch("/api/departments", { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDepartments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Departments</h4>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/departments/add")}>
          <i className="bi bi-plus-lg me-1"></i>Add Department
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Manager</th>
                <th>Employees</th>
                <th>Status</th>
                <th style={{width: "120px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">No departments found</td></tr>
              ) : (
                departments.map((d: any) => (
                  <tr key={d.id}>
                    <td><span className="badge bg-secondary">{d.code}</span></td>
                    <td className="fw-semibold">{d.name}</td>
                    <td className="text-muted small">{d.description || "-"}</td>
                    <td>{d.manager_name || "-"}</td>
                    <td>{d.employee_count || 0}</td>
                    <td>{d.is_active ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Inactive</span>}</td>
                    <td>
                      <Link href={`/dashboard/departments/${d.id}`} className="btn btn-warning btn-sm text-white me-1">
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
