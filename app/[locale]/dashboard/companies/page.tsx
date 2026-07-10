"use client";

import { useEffect, useState } from "react";

interface Module {
  id: number;
  code: string;
  name: string;
  icon: string;
}

interface Company {
  id: number;
  name: string;
  code: string;
  tin: string;
  address: string;
  phone: string;
  email: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  license_type: string;
  status: string;
  registration_date: string;
  notes: string;
  license_count: number;
  user_count: number;
  enabled_modules: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ name: "", tin: "", address: "", phone: "", email: "", contact_person: "", contact_phone: "", contact_email: "", license_type: "demo", notes: "", modules: [] });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSuper, setIsSuper] = useState(false);

  const load = async () => {
    const tok = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!tok || !stored) return;
    const u = JSON.parse(stored);
    setIsSuper(u.role === "super_admin");
    setLoading(true);
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/companies", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/modules", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const cData = await cRes.json();
      const mData = await mRes.json();
      if (Array.isArray(cData)) setCompanies(cData);
      if (Array.isArray(mData)) setModules(mData);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleModule = (id: number) => {
    setForm((prev: any) => ({
      ...prev,
      modules: prev.modules.includes(id) ? prev.modules.filter((m: number) => m !== id) : [...prev.modules, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setSaving(true);
    try {
      const url = editId ? `/api/companies/${editId}` : "/api/companies";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditId(null);
        setForm({ name: "", address: "", phone: "", email: "", contact_person: "", contact_phone: "", contact_email: "", tin: "", license_type: "demo", notes: "", modules: [] });
        load();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch { alert("Server error"); }
    setSaving(false);
  };

  const edit = async (c: Company) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    const res = await fetch(`/api/companies/${c.id}`, { headers: { Authorization: `Bearer ${tok}` } });
    const data = await res.json();
    setForm({
      name: data.name, address: data.address || "", phone: data.phone || "", email: data.email || "",
      contact_person: data.contact_person || "", contact_phone: data.contact_phone || "",
      contact_email: data.contact_email || "", tin: data.tin || "",
      license_type: data.license_type || "demo", notes: data.notes || "",
      modules: (data.modules || []).filter((m: any) => m.enabled).map((m: any) => m.id),
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const remove = async (id: number) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    if (!confirm("Delete this company?")) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok}` } });
      if (res.ok) load();
    } catch {}
  };

  const licenseBadge = (t: string) => {
    const map: Record<string, string> = { demo: "bg-info", trial: "bg-warning", full: "bg-success", enterprise: "bg-primary" };
    return <span className={`badge ${map[t] || "bg-secondary"}`}>{t}</span>;
  };

  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-building me-2"></i>Company Registration</h4>
          <p className="text-muted small mb-0">Register companies and assign licensed modules</p>
        </div>
        {isSuper && (
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", address: "", phone: "", email: "", contact_person: "", contact_phone: "", contact_email: "", tin: "", license_type: "demo", notes: "", modules: [] }); }}>
            <i className={`bi ${showForm ? "bi-x" : "bi-plus-lg"} me-1`}></i>{showForm ? "Cancel" : "New Company"}
          </button>
        )}
      </div>

      {isSuper && showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold"><i className="bi bi-building-add me-2"></i>{editId ? "Edit Company" : "Register New Company"}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Company Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">License Type</label>
                  <select className="form-select" value={form.license_type} onChange={e => setForm({...form, license_type: e.target.value})}>
                    <option value="demo">Demo</option>
                    <option value="trial">Trial</option>
                    <option value="full">Full</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">TIN</label>
                  <input type="text" className="form-control" value={form.tin} onChange={e => setForm({...form, tin: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Address</label>
                  <input type="text" className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Phone</label>
                  <input type="text" className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Person</label>
                  <input type="text" className="form-control" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Phone</label>
                  <input type="text" className="form-control" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Email</label>
                  <input type="email" className="form-control" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Licensed Modules</label>
                  <div className="d-flex flex-wrap gap-2">
                    {modules.map(m => (
                      <div key={m.id} className={`form-check form-check-inline border rounded-3 px-3 py-2 ${form.modules.includes(m.id) ? "border-primary bg-primary bg-opacity-10" : ""}`} style={{ cursor: "pointer" }} onClick={() => toggleModule(m.id)}>
                        <input type="checkbox" className="form-check-input" checked={form.modules.includes(m.id)} onChange={() => {}} />
                        <label className="form-check-label small ms-1"><i className={`bi ${m.icon} me-1`}></i>{m.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <i className="bi bi-save me-1"></i>{saving ? "Saving..." : editId ? "Update Company" : "Register Company"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header fw-semibold"><i className="bi bi-table me-2"></i>Registered Companies ({companies.length})</div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
          ) : companies.length === 0 ? (
            <div className="text-center text-muted py-4"><i className="bi bi-building fs-2 d-block mb-2"></i>No companies registered</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>TIN</th>
                    <th>Contact</th>
                    <th>License</th>
                    <th>Users</th>
                    <th>Licensed Modules</th>
                    <th>Status</th>
                    {isSuper && <th className="text-end">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td><code className="small">{c.tin}</code></td>
                      <td className="small">
                        {c.contact_person && <div>{c.contact_person}</div>}
                        {c.contact_email && <div className="text-muted">{c.contact_email}</div>}
                      </td>
                      <td>{licenseBadge(c.license_type)}</td>
                      <td><span className="badge bg-secondary">{c.user_count || 0}</span></td>
                      <td className="small text-muted">{c.enabled_modules || "None assigned"}</td>
                      <td><span className={`badge ${c.status === "active" ? "bg-success" : "bg-secondary"}`}>{c.status}</span></td>
                      {isSuper && (
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(c)}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c.id)}><i className="bi bi-trash"></i></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
