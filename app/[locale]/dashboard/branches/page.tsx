"use client";

import { useEffect, useState } from "react";

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "", email: "", is_head_office: false, is_active: true });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => { loadBranches(); }, []);

  const loadBranches = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/branches", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (Array.isArray(data)) setBranches(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const resetForm = () => setForm({ name: "", code: "", address: "", phone: "", email: "", is_head_office: false, is_active: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowAdd(false); resetForm(); loadBranches(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  const startEdit = (b: any) => {
    setEditingId(b.id);
    setForm({ name: b.name, code: b.code || "", address: b.address || "", phone: b.phone || "", email: b.email || "", is_head_office: !!b.is_head_office, is_active: b.is_active !== false });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const res = await fetch(`/api/branches/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setEditingId(null); resetForm(); loadBranches(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  const deleteBranch = async (id: number) => {
    if (!confirm("Delete this branch?")) return;
    try {
      await fetch(`/api/branches/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      loadBranches();
    } catch (err) { console.error(err); }
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, onCancel: () => void) => (
    <form onSubmit={onSubmit} className="row g-2 mb-3 p-3 bg-light rounded-3 border">
      <div className="col-md-3">
        <input name="name" className="form-control form-control-sm" placeholder="Name *" value={form.name} onChange={handleChange} required />
      </div>
      <div className="col-md-2">
        <input name="code" className="form-control form-control-sm" placeholder="Code" value={form.code} onChange={handleChange} />
      </div>
      <div className="col-md-3">
        <input name="address" className="form-control form-control-sm" placeholder="Address" value={form.address} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input name="phone" className="form-control form-control-sm" placeholder="Phone" value={form.phone} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input name="email" className="form-control form-control-sm" placeholder="Email" value={form.email} onChange={handleChange} />
      </div>
      <div className="col-md-2 d-flex align-items-center gap-3">
        <div className="form-check">
          <input className="form-check-input" type="checkbox" name="is_head_office" id="head_office" checked={form.is_head_office} onChange={handleChange} />
          <label className="form-check-label small" htmlFor="head_office">Head Office</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" name="is_active" id="active" checked={form.is_active} onChange={handleChange} />
          <label className="form-check-label small" htmlFor="active">Active</label>
        </div>
      </div>
      <div className="col-md-2 d-flex gap-1">
        <button type="submit" className="btn btn-primary btn-sm"><i className="bi bi-check"></i></button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}><i className="bi bi-x"></i></button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Branches</h4>
        <button className="btn btn-primary" onClick={() => { setShowAdd(!showAdd); setEditingId(null); resetForm(); }}>
          <i className="bi bi-plus-lg me-1"></i>{showAdd ? "Cancel" : "Add Branch"}
        </button>
      </div>

      {showAdd && renderForm(submitAdd, () => { setShowAdd(false); resetForm(); })}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Head Office?</th>
                <th>Status</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : branches.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">No branches found</td></tr>
              ) : (
                branches.map((b: any) => (
                  <tr key={b.id}>
                    {editingId === b.id ? (
                      <td colSpan={8} className="p-2">{renderForm(submitEdit, () => { setEditingId(null); resetForm(); })}</td>
                    ) : (
                      <>
                        <td>{b.name}</td>
                        <td>{b.code || "-"}</td>
                        <td>{b.address || "-"}</td>
                        <td>{b.phone || "-"}</td>
                        <td>{b.email || "-"}</td>
                        <td>{b.is_head_office ? <i className="bi bi-check-lg text-success"></i> : "-"}</td>
                        <td>{b.is_active !== false ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Inactive</span>}</td>
                        <td>
                          <button className="btn btn-warning btn-sm me-1 text-white" onClick={() => startEdit(b)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteBranch(b.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </>
                    )}
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
