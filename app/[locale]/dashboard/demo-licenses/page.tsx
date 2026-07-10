"use client";

import { useEffect, useState } from "react";

interface Module {
  id: number;
  code: string;
  name: string;
  icon: string;
}

interface DemoLicense {
  id: number;
  license_key: string;
  company_name: string;
  company_tin: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  issued_date: string;
  expiry_date: string;
  duration_days: number;
  status: string;
  notes: string;
  issued_by_name: string;
  registered_company: string;
  licensed_modules: { code: string; name: string }[];
}

export default function DemoLicensesPage() {
  const [licenses, setLicenses] = useState<DemoLicense[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ company_name: "", company_tin: "", contact_name: "", contact_email: "", contact_phone: "", duration_days: "15", notes: "", module_ids: [] });
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [manualEntry, setManualEntry] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSuper, setIsSuper] = useState(false);

  const load = async () => {
    const tok = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!tok || !stored) return;
    const u = JSON.parse(stored);
    setIsSuper(u.role === "super_admin");
    setLoading(true);
    try {
      const [lRes, mRes, cRes] = await Promise.all([
        fetch("/api/demo-licenses", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/modules", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/companies", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const lData = await lRes.json();
      const mData = await mRes.json();
      const cData = await cRes.json();
      if (Array.isArray(lData)) setLicenses(lData);
      if (Array.isArray(mData)) setModules(mData);
      if (Array.isArray(cData)) setCompanies(cData);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    if (!companyId) {
      setManualEntry(true);
      return;
    }
    setManualEntry(false);
    const c = companies.find(c => c.id.toString() === companyId);
    if (c) {
      setForm((prev: any) => ({
        ...prev,
        company_name: c.name,
        company_tin: c.tin,
        contact_name: c.contact_person || prev.contact_name,
        contact_email: c.contact_email || prev.contact_email,
        contact_phone: c.contact_phone || prev.contact_phone,
      }));
    }
  };

  const toggleModule = (id: number) => {
    setForm((prev: any) => ({
      ...prev,
      module_ids: prev.module_ids.includes(id) ? prev.module_ids.filter((m: number) => m !== id) : [...prev.module_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setSaving(true);
    try {
      const res = await fetch("/api/demo-licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setSelectedCompanyId("");
        setManualEntry(true);
        setForm({ company_name: "", company_tin: "", contact_name: "", contact_email: "", contact_phone: "", duration_days: "15", notes: "", module_ids: [] });
        load();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create license");
      }
    } catch { alert("Server error"); }
    setSaving(false);
  };

  const updateStatus = async (id: number, status: string) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    if (!confirm(`Set this license to "${status}"?`)) return;
    try {
      const res = await fetch(`/api/demo-licenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) load();
    } catch {}
  };

  const remove = async (id: number) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    if (!confirm("Delete this license record?")) return;
    try {
      const res = await fetch(`/api/demo-licenses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${tok}` } });
      if (res.ok) load();
    } catch {}
  };

  const filtered = statusFilter === "all" ? licenses : licenses.filter(l => l.status === statusFilter);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { active: "bg-success", expired: "bg-secondary", revoked: "bg-danger", suspended: "bg-warning" };
    return <span className={`badge ${map[s] || "bg-secondary"}`}>{s}</span>;
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="page-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-key me-2"></i>Demo License Administration</h4>
          <p className="text-muted small mb-0">Issue and manage demo trial licenses with per-module access</p>
        </div>
        <div className="d-flex gap-2">
          <a href="/dashboard/companies" className="btn btn-outline-primary">
            <i className="bi bi-building me-1"></i>Companies
          </a>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <i className={`bi ${showForm ? "bi-x" : "bi-plus-lg"} me-1`}></i>{showForm ? "Cancel" : "New License"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold"><i className="bi bi-key me-2"></i>Issue New Demo License</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {isSuper && (
                  <div className="col-md-12">
                    <label className="form-label small fw-semibold">Select Registered Company</label>
                    <select className="form-select" value={selectedCompanyId} onChange={e => handleCompanySelect(e.target.value)}>
                      <option value="">── Enter Manually ──</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.tin})</option>
                      ))}
                    </select>
                  </div>
                )}
                {isSuper && manualEntry && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Company Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" required value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold">Company TIN <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" required value={form.company_tin} onChange={e => setForm({...form, company_tin: e.target.value})} />
                    </div>
                  </>
                )}
                {!isSuper && companies.length > 0 && (
                  <div className="col-12">
                    <div className="alert alert-info small py-2 mb-0">
                      <i className="bi bi-building me-1"></i>
                      License will be issued for your company: <strong>{companies[0]?.name}</strong> (TIN: {companies[0]?.tin}).
                    </div>
                  </div>
                )}
                {isSuper && !manualEntry && (
                  <div className="col-12">
                    <div className="alert alert-info small py-2 mb-0">
                      <i className="bi bi-building me-1"></i>
                      License will link to <strong>{form.company_name}</strong> (TIN: {form.company_tin}).
                      Contact fields below will pre-fill from the company profile.
                    </div>
                  </div>
                )}
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Duration (days)</label>
                  <input type="number" className="form-control" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Expiry</label>
                  <input type="text" className="form-control" readOnly value={new Date(Date.now() + parseInt(form.duration_days || "15") * 86400000).toLocaleDateString()} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Name</label>
                  <input type="text" className="form-control" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Email</label>
                  <input type="email" className="form-control" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Phone</label>
                  <input type="text" className="form-control" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Licensed Modules</label>
                  <div className="d-flex flex-wrap gap-2">
                    {modules.map(m => (
                      <div key={m.id} className={`form-check form-check-inline border rounded-3 px-3 py-2 ${form.module_ids.includes(m.id) ? "border-primary bg-primary bg-opacity-10" : ""}`} style={{ cursor: "pointer" }} onClick={() => toggleModule(m.id)}>
                        <input type="checkbox" className="form-check-input" checked={form.module_ids.includes(m.id)} onChange={() => {}} />
                        <label className="form-check-label small ms-1"><i className={`bi ${m.icon} me-1`}></i>{m.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <i className="bi bi-send me-1"></i>{saving ? "Issuing..." : "Issue License"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-semibold"><i className="bi bi-table me-2"></i>Licenses ({filtered.length})</span>
          <div className="d-flex gap-1">
            {["all","active","expired","revoked","suspended"].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted py-4"><i className="bi bi-inbox fs-2 d-block mb-2"></i>No licenses found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                    <tr>
                      <th>License Key</th>
                      <th>Company</th>
                      <th>TIN</th>
                      <th>Modules</th>
                      <th>Contact</th>
                      <th>Issued</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td><code className="small">{l.license_key}</code></td>
                      <td className="fw-semibold">{l.company_name}</td>
                      <td><code className="small text-muted">{l.company_tin || l.registered_company || "-"}</code></td>
                      <td>
                        {l.licensed_modules && l.licensed_modules.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {l.licensed_modules.map((m: any, i: number) => (
                              <span key={i} className="badge bg-info bg-opacity-25 text-info small">{m.name}</span>
                            ))}
                          </div>
                        ) : <span className="text-muted small">-</span>}
                      </td>
                      <td className="small">
                        {l.contact_name && <div>{l.contact_name}</div>}
                        {l.contact_email && <div className="text-muted">{l.contact_email}</div>}
                      </td>
                      <td className="small">{new Date(l.issued_date).toLocaleDateString()}</td>
                      <td className="small">
                        <span className={isExpired(l.expiry_date) ? "text-danger fw-semibold" : ""}>
                          {new Date(l.expiry_date).toLocaleDateString()}
                          {isExpired(l.expiry_date) && <i className="bi bi-exclamation-circle ms-1"></i>}
                        </span>
                      </td>
                      <td>{statusBadge(l.status)}</td>
                      <td className="text-end">
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown"><i className="bi bi-three-dots"></i></button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            {l.status !== "active" && <li><button className="dropdown-item small" onClick={() => updateStatus(l.id, "active")}><i className="bi bi-check-circle text-success me-2"></i>Activate</button></li>}
                            {l.status !== "suspended" && <li><button className="dropdown-item small" onClick={() => updateStatus(l.id, "suspended")}><i className="bi bi-pause-circle text-warning me-2"></i>Suspend</button></li>}
                            {l.status !== "revoked" && <li><button className="dropdown-item small" onClick={() => updateStatus(l.id, "revoked")}><i className="bi bi-x-circle text-danger me-2"></i>Revoke</button></li>}
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item small text-danger" onClick={() => remove(l.id)}><i className="bi bi-trash me-2"></i>Delete</button></li>
                          </ul>
                        </div>
                      </td>
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
