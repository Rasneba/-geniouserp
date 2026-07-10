"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TerminationPage() {
  const [terminations, setTerminations] = useState<any[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [empRes, termRes] = await Promise.all([
        fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employees?is_active=false", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const allEmp = await empRes.json();
      const termEmp = await termRes.json();

      if (Array.isArray(allEmp)) setActiveEmployees(allEmp.filter((e: any) => e.is_active !== false));
      if (Array.isArray(termEmp)) setTerminations(termEmp.filter((e: any) => e.is_active === false || e.termination_date));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const processTermination = async (employeeId: number) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    const form = { termination_date: new Date().toISOString().split("T")[0], reason: "", is_voluntary: false, clearance_status: "pending" };
    try {
      const res = await fetch(`/api/employees/${employeeId}/termination`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { loadData(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Termination Management</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(!showModal)}>
          <i className="bi bi-plus-lg me-1"></i>Process Termination
        </button>
      </div>

      {showModal && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold">Select Active Employee to Process Termination</div>
          <div className="card-body">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th style={{ width: "160px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted py-3">No active employees</td></tr>
                ) : (
                  activeEmployees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td>{emp.code}</td>
                      <td>{emp.first_name} {emp.last_name}</td>
                      <td>{emp.department_name || "-"}</td>
                      <td>
                        <Link href={`/dashboard/termination/${emp.id}`} className="btn btn-danger btn-sm">
                          <i className="bi bi-person-x me-1"></i>Terminate
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="mt-2">
              <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Termination Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {terminations.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No terminated employees</td></tr>
              ) : (
                terminations.map((emp: any) => (
                  <tr key={emp.id}>
                    <td>{emp.code}</td>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.department_name || "-"}</td>
                    <td>{emp.termination_date ? new Date(emp.termination_date).toLocaleDateString() : "-"}</td>
                    <td>{emp.termination_reason || emp.reason || "-"}</td>
                    <td><span className="badge bg-danger">Terminated</span></td>
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
