"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteEmployee = async (id: number) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Employees</h4>
        <Link href="/dashboard/employees/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Add Employee
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{width: "50px"}}>Photo</th>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th style={{width: "200px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">No employees found</td>
                </tr>
              ) : (
                employees.map((emp: any) => (
                  <tr key={emp.id}>
                    <td>
                      {emp.photo ? (
                        <img src={emp.photo} alt="" loading="lazy" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "var(--table-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="bi bi-person text-muted" style={{ fontSize: 18 }}></i>
                        </div>
                      )}
                    </td>
                    <td>{emp.id}</td>
                    <td>{emp.code}</td>
                    <td>{emp.first_name} {emp.middle_name} {emp.last_name}</td>
                    <td>{emp.gender}</td>
                    <td>{emp.department_name || "-"}</td>
                    <td>{emp.position_title || "-"}</td>
                    <td>
                      {emp.is_active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/dashboard/employees/view/${emp.id}`} className="btn btn-success btn-sm me-1">
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link href={`/dashboard/employees/edit/${emp.id}`} className="btn btn-warning btn-sm me-1 text-white">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteEmployee(emp.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
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
