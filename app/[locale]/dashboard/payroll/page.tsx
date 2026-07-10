"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PayrollPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, start_date: "", end_date: "", notes: "" });

  const loadPeriods = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/periods", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      if (Array.isArray(data)) setPeriods(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadPeriods(); }, []);

  const createPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch("/api/payroll/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, start_date: "", end_date: "", notes: "" });
        loadPeriods();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create period");
      }
    } catch { alert("Server error"); }
  };

  const processPayroll = async (periodId: number) => {
    if (!confirm("Process payroll for this period? This will calculate PAYE and pension for all active employees.")) return;
    setProcessing(true);
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch("/api/payroll/process", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ period_id: periodId }),
      });
      if (res.ok) {
        alert("Payroll processed successfully!");
        loadPeriods();
      } else {
        const err = await res.json();
        alert(err.error || "Payroll processing failed");
      }
    } catch { alert("Server error"); }
    setProcessing(false);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { draft: "secondary", finalized: "success", paid: "primary" };
    return <span className={`badge bg-${map[s] || "secondary"}`}>{s}</span>;
  };

  const monthName = (m: number) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1] || m;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-wallet2 me-2"></i>Payroll</h4>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? "bi-x" : "bi-plus-lg"} me-1`}></i>
          {showForm ? "Cancel" : "New Period"}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={createPeriod}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Year</label>
                  <input type="number" className="form-control" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Month</label>
                  <select className="form-control" value={form.month} onChange={e => setForm({...form, month: parseInt(e.target.value)})}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{monthName(m)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Start Date</label>
                  <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">End Date</label>
                  <input type="date" className="form-control" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Notes</label>
                  <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary"><i className="bi bi-check-lg me-1"></i>Create Period</button>
                </div>
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
                <th>Period</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Processed By</th>
                <th>Processed At</th>
                <th style={{width: "220px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : periods.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">No payroll periods found</td></tr>
              ) : (
                periods.map((p: any) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{monthName(p.month)} {p.year}</td>
                    <td>{p.start_date?.split("T")[0]}</td>
                    <td>{p.end_date?.split("T")[0]}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td>{p.processed_by_name || "-"}</td>
                    <td>{p.processed_at ? new Date(p.processed_at).toLocaleString() : "-"}</td>
                    <td>
                      <Link href={`/dashboard/payroll/periods/${p.id}`} className="btn btn-success btn-sm me-1">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {p.status === "draft" && (
                        <button className="btn btn-primary btn-sm me-1" onClick={() => processPayroll(p.id)} disabled={processing}>
                          <i className="bi bi-calculator me-1"></i>Process
                        </button>
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
