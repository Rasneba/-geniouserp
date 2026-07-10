"use client";

import { useEffect, useState } from "react";

export default function LeavePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([
    { id: 1, name: "Annual Leave" },
    { id: 2, name: "Sick Leave" },
    { id: 3, name: "Personal Leave" },
    { id: 4, name: "Maternity Leave" },
    { id: 5, name: "Paternity Leave" },
  ]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Leave definitions
  const [leaveDefs, setLeaveDefs] = useState<any[]>([]);
  const [showDefForm, setShowDefForm] = useState(false);

  const [form, setForm] = useState({
    employee_id: "", leave_type_id: "", start_date: "", end_date: "", total_days: 1, reason: "",
  });

  const [defForm, setDefForm] = useState({
    employee_id: "", leave_type_id: "", year: new Date().getFullYear().toString(), total_days: "",
  });

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [lRes, eRes, ltRes, ldRes] = await Promise.all([
        fetch("/api/leave-requests", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/leave-types", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/leave-definitions", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const lData = await lRes.json();
      const eData = await eRes.json();
      const ltData = await ltRes.json();
      const ldData = await ldRes.json();
      if (Array.isArray(lData)) setRequests(lData);
      if (Array.isArray(eData)) setEmployees(eData);
      if (Array.isArray(ltData) && ltData.length > 0) setLeaveTypes(ltData);
      if (Array.isArray(ldData)) setLeaveDefs(ldData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm({ ...form, [e.target.name]: val });

    if (e.target.name === "start_date" || e.target.name === "end_date") {
      const start = e.target.name === "start_date" ? val : form.start_date;
      const end = e.target.name === "end_date" ? val : form.end_date;
      if (start && end) {
        const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setForm((f: any) => ({ ...f, total_days: diff > 0 ? diff : 1 }));
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/leave-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        employee_id: parseInt(form.employee_id),
        leave_type_id: parseInt(form.leave_type_id),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ employee_id: "", leave_type_id: "", start_date: "", end_date: "", total_days: 1, reason: "" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to submit");
    }
  };

  const approveReject = async (id: number, status: string) => {
    await fetch(`/api/leave-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const submitDef = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/leave-definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        employee_id: parseInt(defForm.employee_id),
        leave_type_id: parseInt(defForm.leave_type_id),
        year: parseInt(defForm.year),
        total_days: parseInt(defForm.total_days),
      }),
    });
    if (res.ok) {
      setShowDefForm(false);
      setDefForm({ employee_id: "", leave_type_id: "", year: new Date().getFullYear().toString(), total_days: "" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save leave definition");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Leave Management</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => setShowDefForm(!showDefForm)}>
            <i className="bi bi-gear me-1"></i>{showDefForm ? "Cancel" : "Manage Definitions"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-plus-lg me-1"></i>{showForm ? "Cancel" : "New Leave Request"}
          </button>
        </div>
      </div>

      {showDefForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold">Add Leave Definition</div>
          <div className="card-body">
            <form onSubmit={submitDef}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Employee *</label>
                  <select name="employee_id" className="form-control" value={defForm.employee_id} onChange={(e) => setDefForm({ ...defForm, employee_id: e.target.value })} required>
                    <option value="">Select Employee</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Leave Type *</label>
                  <select name="leave_type_id" className="form-control" value={defForm.leave_type_id} onChange={(e) => setDefForm({ ...defForm, leave_type_id: e.target.value })} required>
                    <option value="">Select Type</option>
                    {leaveTypes.map((lt: any) => (
                      <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Year *</label>
                  <input type="number" name="year" className="form-control" value={defForm.year} onChange={(e) => setDefForm({ ...defForm, year: e.target.value })} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Total Days *</label>
                  <input type="number" name="total_days" className="form-control" value={defForm.total_days} onChange={(e) => setDefForm({ ...defForm, total_days: e.target.value })} required />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100"><i className="bi bi-save me-1"></i>Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold">Leave Definitions</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Year</th>
                <th>Total Days</th>
                <th>Used</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {leaveDefs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-3">No leave definitions</td></tr>
              ) : (
                leaveDefs.map((ld: any) => (
                  <tr key={ld.id}>
                    <td>{ld.employee_name}</td>
                    <td>{ld.leave_type_name}</td>
                    <td>{ld.year}</td>
                    <td>{ld.total_days}</td>
                    <td>{ld.used_days || 0}</td>
                    <td className="fw-semibold">{(ld.total_days || 0) - (ld.used_days || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold">New Leave Request</div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Employee *</label>
                  <select name="employee_id" className="form-control" value={form.employee_id} onChange={handleChange} required>
                    <option value="">Select Employee</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Leave Type *</label>
                  <select name="leave_type_id" className="form-control" value={form.leave_type_id} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    {leaveTypes.map((lt: any) => (
                      <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Start Date *</label>
                  <input type="date" name="start_date" className="form-control" value={form.start_date} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">End Date *</label>
                  <input type="date" name="end_date" className="form-control" value={form.end_date} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Total Days</label>
                  <input type="number" name="total_days" className="form-control" value={form.total_days} onChange={handleChange} min={1} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Reason</label>
                  <textarea name="reason" className="form-control" rows={2} value={form.reason} onChange={handleChange}></textarea>
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary px-4"><i className="bi bi-send me-1"></i>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{width: "180px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">No leave requests</td></tr>
              ) : (
                requests.map((r: any) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.employee_name}</td>
                    <td>{r.leave_type_name}</td>
                    <td>{r.start_date}</td>
                    <td>{r.end_date}</td>
                    <td>{r.total_days}</td>
                    <td className="text-muted small">{r.reason || "-"}</td>
                    <td>
                      <span className={`badge bg-${r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : r.status === "cancelled" ? "secondary" : "warning"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "pending" ? (
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-success" onClick={() => approveReject(r.id, "approved")}>
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-danger" onClick={() => approveReject(r.id, "rejected")}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">{r.status === "approved" ? "Approved" : r.status === "rejected" ? "Rejected" : "Cancelled"}</span>
                      )}
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
