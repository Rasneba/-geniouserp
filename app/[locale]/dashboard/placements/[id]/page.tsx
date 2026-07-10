"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const badgeColors: Record<string, string> = {
  initial: "primary", promotion: "success", demotion: "warning",
  transfer: "info", suspension: "secondary", termination: "danger",
};

export default function PlacementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [placement, setPlacement] = useState<any>(null);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [payrollItems, setPayrollItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [benefitForm, setBenefitForm] = useState({ payroll_item_id: "", amount: "" });

  const loadPlacement = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const [pRes, bRes] = await Promise.all([
        fetch(`/api/placements/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
        fetch(`/api/placements/${id}/benefits`, { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const pData = await pRes.json();
      const bData = await bRes.json();
      setPlacement(pData);
      if (Array.isArray(bData)) setBenefits(bData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetch(`/api/placements/${id}`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch(`/api/placements/${id}/benefits`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch("/api/payroll-items", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
    ]).then(([pData, bData, piData]) => {
      setPlacement(pData);
      if (Array.isArray(bData)) setBenefits(bData);
      if (Array.isArray(piData)) setPayrollItems(piData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const addBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/placements/${id}/benefits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        payroll_item_id: parseInt(benefitForm.payroll_item_id),
        amount: parseFloat(benefitForm.amount),
      }),
    });
    if (res.ok) {
      setBenefitForm({ payroll_item_id: "", amount: "" });
      const bData = await (await fetch(`/api/placements/${id}/benefits`, { headers: { Authorization: `Bearer ${token}` } })).json();
      if (Array.isArray(bData)) setBenefits(bData);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add benefit");
    }
  };

  const updateStatus = async (status: string) => {
    await fetch(`/api/placements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadPlacement();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!placement) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Placement not found</p>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/placements")}>Back to Placements</button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Placement Details</h4>
        <div className="d-flex gap-2">
          {placement.status === "active" && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => updateStatus("ended")}>
                <i className="bi bi-check-circle me-1"></i>End Placement
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => updateStatus("voided")}>
                <i className="bi bi-x-circle me-1"></i>Void
              </button>
            </>
          )}
          <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/dashboard/placements")}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold">Placement Information</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small text-muted">Employee</label>
              <p className="fw-semibold mb-0">{placement.employee_name}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Type</label>
              <p className="mb-0"><span className={`badge bg-${badgeColors[placement.placement_type] || "secondary"}`}>{placement.placement_type}</span></p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Employment Stage</label>
              <p className="fw-semibold mb-0">{placement.employment_stage_name || "-"}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Status</label>
              <p className="mb-0"><span className={`badge bg-${placement.status === "active" ? "success" : placement.status === "ended" ? "secondary" : "danger"}`}>{placement.status}</span></p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Department</label>
              <p className="fw-semibold mb-0">{placement.department_name || "-"}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Position</label>
              <p className="fw-semibold mb-0">{placement.position_title || "-"}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Branch</label>
              <p className="fw-semibold mb-0">{placement.branch || "-"}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Salary</label>
              <p className="fw-semibold mb-0">{placement.salary ? `$${parseFloat(placement.salary).toLocaleString()}` : "-"}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Start Date</label>
              <p className="fw-semibold mb-0">{placement.start_date}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">End Date</label>
              <p className="fw-semibold mb-0">{placement.end_date || "-"}</p>
            </div>
            <div className="col-12">
              <label className="form-label small text-muted">Reason</label>
              <p className="mb-0">{placement.reason || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
          <span>Benefits</span>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Payroll Item</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {benefits.length === 0 ? (
                <tr><td colSpan={2} className="text-center text-muted py-3">No benefits attached</td></tr>
              ) : (
                benefits.map((b: any) => (
                  <tr key={b.id}>
                    <td>{b.payroll_item_name || `Item #${b.payroll_item_id}`}</td>
                    <td>${parseFloat(b.amount).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="card-body border-top">
          <form onSubmit={addBenefit} className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Payroll Item</label>
              <select className="form-control" value={benefitForm.payroll_item_id} onChange={(e) => setBenefitForm({ ...benefitForm, payroll_item_id: e.target.value })} required>
                <option value="">Select Item</option>
                {payrollItems.map((pi: any) => (
                  <option key={pi.id} value={pi.id}>{pi.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Amount</label>
              <input type="number" className="form-control" value={benefitForm.amount} onChange={(e) => setBenefitForm({ ...benefitForm, amount: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Add Benefit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
