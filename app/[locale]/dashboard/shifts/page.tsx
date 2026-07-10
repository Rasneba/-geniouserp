"use client";

import { useEffect, useState } from "react";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({ name: "", start_time: "", end_time: "", description: "" });

  const loadShifts = () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    fetch("/api/shifts", { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setShifts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadShifts(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", start_time: "", end_time: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/shifts/${editingId}` : "/api/shifts";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      resetForm();
      loadShifts();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save shift");
    }
  };

  const startEdit = (s: any) => {
    setForm({ name: s.name, start_time: s.start_time, end_time: s.end_time, description: s.description || "" });
    setEditingId(s.id);
    setShowForm(true);
  };

  const deleteShift = async (id: number) => {
    if (!confirm("Delete this shift?")) return;
    await fetch(`/api/shifts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadShifts();
  };

  const toggleStatus = async (id: number, is_active: boolean) => {
    await fetch(`/api/shifts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_active: !is_active }),
    });
    loadShifts();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Shifts</h4>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <i className="bi bi-plus-lg me-1"></i>{showForm && !editingId ? "Cancel" : "Add Shift"}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold">{editingId ? "Edit Shift" : "New Shift"}</div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Name *</label>
                  <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Start Time *</label>
                  <input type="time" name="start_time" className="form-control" value={form.start_time} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">End Time *</label>
                  <input type="time" name="end_time" className="form-control" value={form.end_time} onChange={handleChange} required />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-semibold">Description</label>
                  <input type="text" name="description" className="form-control" value={form.description} onChange={handleChange} />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-1"></i>{editingId ? "Update" : "Save"}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
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
                <th>Name</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{width: "140px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No shifts found</td></tr>
              ) : (
                shifts.map((s: any) => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{s.name}</td>
                    <td>{s.start_time}</td>
                    <td>{s.end_time}</td>
                    <td className="text-muted small">{s.description || "-"}</td>
                    <td>
                      {s.is_active !== false ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-warning text-white" onClick={() => startEdit(s)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => toggleStatus(s.id, s.is_active)}>
                          <i className={`bi ${s.is_active !== false ? "bi-pause" : "bi-play"}`}></i>
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteShift(s.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
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
