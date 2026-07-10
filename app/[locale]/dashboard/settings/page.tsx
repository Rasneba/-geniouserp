"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BiometricDevices from "@/components/BiometricDevices";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [showPensionForm, setShowPensionForm] = useState(false);
  const [pension, setPension] = useState({ employee_rate: 0.07, employer_rate: 0.11 });
  const [pensionSaving, setPensionSaving] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const sRes = await fetch("/api/settings", { headers: { Authorization: `Bearer ${tok}` } });
        const sData = await sRes.json();
        if (sData && !sData.error) setSettings(sData);
      } catch { /* settings failed */ }

      try {
        const dbRes = await fetch("/api/health", { headers: { Authorization: `Bearer ${tok}` } });
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          setDbStatus(dbData?.database === "connected" ? "Connected" : "Disconnected");
        } else {
          setDbStatus("Disconnected");
        }
      } catch { setDbStatus("Disconnected"); }
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    if (res.ok) alert("Settings saved");
    else alert("Failed to save settings");
    setSaving(false);
  };

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) return;
      try {
        const res = await fetch("/api/pension-settings", { headers: { Authorization: `Bearer ${tok}` } });
        const data = await res.json();
        if (data && !data.error) setPension({ employee_rate: parseFloat(data.employee_rate), employer_rate: parseFloat(data.employer_rate) });
      } catch {}
    };
    if (showPensionForm) load();
  }, [showPensionForm]);

  const savePension = async (e: React.FormEvent) => {
    e.preventDefault();
    setPensionSaving(true);
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch("/api/pension-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(pension),
      });
      if (res.ok) alert("Pension settings saved");
      else alert("Failed to save pension settings");
    } catch { alert("Server error"); }
    setPensionSaving(false);
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  const fields = [
    { key: "company_name", label: "Company Name", type: "text" },
    { key: "company_address", label: "Company Address", type: "text" },
    { key: "company_phone", label: "Company Phone", type: "text" },
    { key: "company_email", label: "Company Email", type: "email" },
    { key: "currency", label: "Currency", type: "text" },
    { key: "tax_rate", label: "Tax Rate (%)", type: "number" },
    { key: "payroll_frequency", label: "Payroll Frequency", type: "text" },
    { key: "working_days_per_month", label: "Working Days per Month", type: "number" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">System Settings</h4>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <i className="bi bi-save me-1"></i>{saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold">Company & System Configuration</div>
            <div className="card-body">
              <div className="row g-3">
                {fields.map((f) => (
                  <div className="col-md-6" key={f.key}>
                    <label className="form-label small fw-semibold">{f.label}</label>
                    <input
                      type={f.type}
                      className="form-control"
                      value={settings[f.key] || ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header fw-semibold"><i className="bi bi-info-circle me-2"></i>System Information</div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small">Database Status</span>
                <span className={`badge ${dbStatus === "Connected" ? "bg-success" : "bg-danger"}`}>
                  {dbStatus === "Connected" ? <><i className="bi bi-check-circle me-1"></i>Connected</> : <><i className="bi bi-exclamation-circle me-1"></i>{dbStatus || "Unknown"}</>}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small">App Version</span>
                <span className="badge bg-secondary">0.1.0</span>
              </div>
              <hr />
              <div className="small text-muted">Next.js 16 · React 19 · Bootstrap 5 · PostgreSQL</div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header fw-semibold"><i className="bi bi-file-earmark-text me-2"></i>Document Templates</div>
            <div className="card-body">
              <p className="small text-muted mb-2">Manage document templates and generate documents.</p>
              <Link href="/dashboard/documents" className="btn btn-outline-primary btn-sm w-100">
                <i className="bi bi-file-earmark me-1"></i>Go to Documents
              </Link>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header fw-semibold"><i className="bi bi-diagram-3 me-2"></i>Branch Management</div>
            <div className="card-body">
              <p className="small text-muted mb-2">Manage company branches and locations.</p>
              <Link href="/dashboard/branches" className="btn btn-outline-primary btn-sm w-100">
                <i className="bi bi-building me-1"></i>Go to Branches
              </Link>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold"><i className="bi bi-shield-lock me-2"></i>User Management</div>
            <div className="card-body">
              <p className="small text-muted mb-2">Manage system users, roles, and permissions.</p>
              <Link href="/dashboard/users" className="btn btn-outline-primary btn-sm w-100 mb-2">
                <i className="bi bi-people me-1"></i>Go to Users
              </Link>
              <Link href="/dashboard/roles" className="btn btn-outline-primary btn-sm w-100">
                <i className="bi bi-shield me-1"></i>Go to Roles & Permissions
              </Link>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold"><i className="bi bi-wallet2 me-2"></i>Payroll & Tax</div>
            <div className="card-body">
              <p className="small text-muted mb-2">Manage payroll periods, pension settings, and tax brackets.</p>
              <Link href="/dashboard/payroll" className="btn btn-outline-primary btn-sm w-100 mb-2">
                <i className="bi bi-wallet2 me-1"></i>Go to Payroll
              </Link>
              <Link href="/dashboard/settings?tab=pension" className="btn btn-outline-primary btn-sm w-100 mb-2" onClick={(e) => { e.preventDefault(); setShowPensionForm(!showPensionForm); }}>
                <i className="bi bi-piggy-bank me-1"></i>Pension Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header fw-semibold"><i className="bi bi-fingerprint me-2"></i>Biometric Device Integration</div>
        <div className="card-body">
          <BiometricDevices />
        </div>
      </div>

      {showPensionForm && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header fw-semibold"><i className="bi bi-piggy-bank me-2"></i>Pension Settings</div>
          <div className="card-body">
            <form onSubmit={savePension}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Employee Contribution Rate (%)</label>
                  <input type="number" step="0.01" className="form-control" value={pension.employee_rate * 100} onChange={e => setPension({...pension, employee_rate: parseFloat(e.target.value) / 100})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Employer Contribution Rate (%)</label>
                  <input type="number" step="0.01" className="form-control" value={pension.employer_rate * 100} onChange={e => setPension({...pension, employer_rate: parseFloat(e.target.value) / 100})} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={pensionSaving}>
                    <i className="bi bi-save me-1"></i>{pensionSaving ? "Saving..." : "Save Pension Settings"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
