"use client";

import { useEffect, useState } from "react";

const rateMultipliers: Record<string, number> = {
  day: 1.5,
  night: 2.0,
  weekly_rest: 2.5,
  public_holiday: 3.0,
};

export default function OvertimePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({
    employee_id: "", date: "", start_time: "", end_time: "",
    rate_type: "day", rate_multiplier: "1.5", total_hours: "0", amount: "0",
  });

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [oRes, eRes] = await Promise.all([
        fetch("/api/overtime", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const oData = await oRes.json();
      const eData = await eRes.json();
      if (Array.isArray(oData)) setRecords(oData);
      if (Array.isArray(eData)) setEmployees(eData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const calcHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff / 60 : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "rate_type") {
        const mult = rateMultipliers[value] || 1.5;
        updated.rate_multiplier = mult.toString();
      }

      const hours = calcHours(
        name === "start_time" ? value : updated.start_time,
        name === "end_time" ? value : updated.end_time,
      );
      updated.total_hours = hours.toFixed(2);

      const emp = employees.find((em: any) => em.id === parseInt(updated.employee_id || "0"));
      const rate = parseFloat(emp?.salary || "0") / 240;
      const mult = parseFloat(updated.rate_multiplier || "1.5");
      updated.amount = (hours * rate * mult).toFixed(2);

      return updated;
    });
  };

  const selectEmployee = (id: string) => {
    setForm((prev) => {
      const emp = employees.find((e: any) => e.id === parseInt(id));
      const rate = parseFloat(emp?.salary || "0") / 240;
      const mult = parseFloat(prev.rate_multiplier || "1.5");
      const hours = parseFloat(prev.total_hours || "0");
      return {
        ...prev,
        employee_id: id,
        amount: (hours * rate * mult).toFixed(2),
      };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/overtime", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        employee_id: parseInt(form.employee_id),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        total_hours: parseFloat(form.total_hours),
        rate_type: form.rate_type,
        rate_multiplier: parseFloat(form.rate_multiplier),
        amount: parseFloat(form.amount),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ employee_id: "", date: "", start_time: "", end_time: "", rate_type: "day", rate_multiplier: "1.5", total_hours: "0", amount: "0" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create overtime");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/overtime/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Overtime</h4>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-lg me-1"></i>{showForm ? "Cancel" : "New Overtime"}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold">New Overtime Record</div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Employee *</label>
                  <select name="employee_id" className="form-control" value={form.employee_id} onChange={(e) => selectEmployee(e.target.value)} required>
                    <option value="">Select Employee</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Date *</label>
                  <input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Start Time *</label>
                  <input type="time" name="start_time" className="form-control" value={form.start_time} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">End Time *</label>
                  <input type="time" name="end_time" className="form-control" value={form.end_time} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Rate Type *</label>
                  <select name="rate_type" className="form-control" value={form.rate_type} onChange={handleChange} required>
                    <option value="day">Day (1.5x)</option>
                    <option value="night">Night (2.0x)</option>
                    <option value="weekly_rest">Weekly Rest (2.5x)</option>
                    <option value="public_holiday">Public Holiday (3.0x)</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Total Hours</label>
                  <input type="number" className="form-control" value={form.total_hours} readOnly />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Rate Multiplier</label>
                  <input type="number" step="0.1" className="form-control" value={form.rate_multiplier} readOnly />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Amount</label>
                  <input type="number" className="form-control" value={form.amount} readOnly />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-1"></i>Save Overtime</button>
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
                <th>Date</th>
                <th>Start - End</th>
                <th>Total Hours</th>
                <th>Rate Type</th>
                <th>Multiplier</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{width: "140px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No overtime records</td></tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.employee_name}</td>
                    <td>{r.date}</td>
                    <td>{r.start_time} - {r.end_time}</td>
                    <td>{r.total_hours}</td>
                    <td><span className="badge bg-secondary">{r.rate_type}</span></td>
                    <td>{r.rate_multiplier}x</td>
                    <td>${parseFloat(r.amount).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "pending" ? (
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-success" onClick={() => updateStatus(r.id, "approved")}>
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-danger" onClick={() => updateStatus(r.id, "rejected")}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">{r.status === "approved" ? "Approved" : "Rejected"}</span>
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
