"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const VOUCHER_TYPES = ["LV", "OTV", "FIV", "PBV", "PAV", "MCV", "SPV", "CMV", "JEV"];
const STATUSES = ["prepared", "approved", "void", "completed"];

const badgeBg = (status: string) => {
  const map: Record<string, string> = { prepared: "warning", approved: "success", void: "danger", completed: "info" };
  return map[status] || "secondary";
};

const typeBadgeBg = (t: string) => {
  const map: Record<string, string> = { LV: "primary", OTV: "success", FIV: "info", PBV: "warning", PAV: "secondary", MCV: "dark", SPV: "primary", CMV: "info", JEV: "warning" };
  return map[t] || "secondary";
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({ voucher_type: "", employee_id: "", notes: "" });

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const url = statusFilter ? `/api/vouchers?status=${statusFilter}` : "/api/vouchers";
      const [vRes, eRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const vData = await vRes.json();
      const eData = await eRes.json();
      if (Array.isArray(vData)) setVouchers(vData);
      if (Array.isArray(eData)) setEmployees(eData);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        voucher_type: form.voucher_type,
        employee_id: parseInt(form.employee_id),
        notes: form.notes,
        total_amount: 0,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ voucher_type: "", employee_id: "", notes: "" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create voucher");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (status === "void" && !confirm("Void this voucher?")) return;
    await fetch(`/api/vouchers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Vouchers</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1"></i>New Voucher
        </button>
      </div>

      <div className="mb-3">
        <select className="form-control w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Voucher</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={submit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Voucher Type *</label>
                    <select name="voucher_type" className="form-control" value={form.voucher_type} onChange={handleChange} required>
                      <option value="">Select Type</option>
                      {VOUCHER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Employee *</label>
                    <select name="employee_id" className="form-control" value={form.employee_id} onChange={handleChange} required>
                      <option value="">Select Employee</option>
                      {employees.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notes</label>
                    <textarea name="notes" className="form-control" rows={3} value={form.notes} onChange={handleChange}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Voucher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Prepared By</th>
                <th>Date</th>
                <th style={{ width: "180px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">No vouchers found</td></tr>
              ) : (
                vouchers.map((v: any) => (
                  <tr key={v.id}>
                    <td className="fw-semibold">{v.code}</td>
                    <td><span className={`badge bg-${typeBadgeBg(v.voucher_type)}`}>{v.voucher_type}</span></td>
                    <td>{v.employee_name}</td>
                    <td><span className={`badge bg-${badgeBg(v.status)}`}>{v.status}</span></td>
                    <td>{(v.total_amount || 0).toLocaleString()}</td>
                    <td>{v.prepared_by_name || "-"}</td>
                    <td className="small">{v.created_at?.split("T")[0]}</td>
                    <td>
                      <Link href={`/dashboard/vouchers/${v.id}`} className="btn btn-success btn-sm me-1">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {v.status === "prepared" && (
                        <>
                          <button className="btn btn-primary btn-sm me-1" onClick={() => updateStatus(v.id, "approved")}>
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(v.id, "void")}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      {(v.status === "approved" || v.status === "completed") && (
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(v.id, "void")}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                      {v.status === "void" && <span className="text-muted small">Voided</span>}
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
