"use client";

import { useEffect, useState } from "react";

export default function BiometricDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", ip_address: "", port: 4370, serial_number: "",
    model: "", location: "", timezone: "UTC",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => { loadDevices(); }, []);

  const loadDevices = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    try {
      const res = await fetch("/api/biometric-devices", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (Array.isArray(data)) setDevices(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const addDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch("/api/biometric-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", ip_address: "", port: 4370, serial_number: "", model: "", location: "", timezone: "UTC" });
        loadDevices();
      }
    } catch { /* ignore */ }
  };

  const deleteDevice = async (id: number) => {
    if (!confirm("Delete this device?")) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      await fetch(`/api/biometric-devices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok}` },
      });
      loadDevices();
    } catch { /* ignore */ }
  };

  const syncDevice = async (id: number) => {
    setSyncing(id);
    const tok = localStorage.getItem("token");
    if (!tok) { setSyncing(null); return; }
    try {
      const res = await fetch("/api/biometric-devices/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ device_id: id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Sync complete: ${data.imported} records imported`);
        loadDevices();
      } else {
        alert(data.error || "Sync failed");
      }
    } catch { alert("Connection error"); }
    setSyncing(null);
  };

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-semibold mb-0"><i className="bi bi-fingerprint me-2"></i>Biometric Devices</h6>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-lg me-1"></i>{showForm ? "Cancel" : "Add Device"}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-3 page-enter">
          <div className="card-body">
            <form onSubmit={addDevice}>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Device Name *</label>
                  <input name="name" className="form-control form-control-sm" value={form.name} onChange={handleChange} required placeholder="Main Office Gate" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">IP Address *</label>
                  <input name="ip_address" className="form-control form-control-sm" value={form.ip_address} onChange={handleChange} required placeholder="192.168.1.100" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Port</label>
                  <input type="number" name="port" className="form-control form-control-sm" value={form.port} onChange={handleChange} placeholder="4370" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Serial Number</label>
                  <input name="serial_number" className="form-control form-control-sm" value={form.serial_number} onChange={handleChange} placeholder="SN12345" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Model</label>
                  <input name="model" className="form-control form-control-sm" value={form.model} onChange={handleChange} placeholder="ZK4500, MB360, etc." />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Location</label>
                  <input name="location" className="form-control form-control-sm" value={form.location} onChange={handleChange} placeholder="Main Entrance" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Timezone</label>
                  <select name="timezone" className="form-control form-control-sm" value={form.timezone} onChange={handleChange}>
                    <option value="UTC">UTC</option>
                    <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (UTC+3)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                    <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm mt-3">
                <i className="bi bi-save me-1"></i>Save Device
              </button>
            </form>
          </div>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-muted small py-3 text-center">No biometric devices registered.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>Model</th>
                <th>Location</th>
                <th>Status</th>
                <th>Last Sync</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d: any) => (
                <tr key={d.id}>
                  <td className="fw-semibold">{d.name}</td>
                  <td><code>{d.ip_address}</code></td>
                  <td>{d.port}</td>
                  <td>{d.model || "-"}</td>
                  <td>{d.location || "-"}</td>
                  <td>
                    <span className={`badge ${d.is_active ? "bg-success" : "bg-danger"}`}>
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="small text-muted">
                    {d.last_sync ? new Date(d.last_sync).toLocaleString() : "Never"}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => syncDevice(d.id)}
                        disabled={syncing === d.id}
                        title="Sync attendance from device"
                      >
                        {syncing === d.id ? (
                          <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }}></span>
                        ) : (
                          <i className="bi bi-arrow-repeat"></i>
                        )}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteDevice(d.id)} title="Delete device">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
