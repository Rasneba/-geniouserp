"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VoucherDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [voucher, setVoucher] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [payrollItems, setPayrollItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({ payroll_item_id: "", description: "", quantity: "1", unit_price: "0" });

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [vRes, iRes, pRes] = await Promise.all([
        fetch(`/api/vouchers/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
        fetch(`/api/vouchers/${id}/items`, { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/payroll-items", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const vData = await vRes.json();
      const iData = await iRes.json();
      const pData = await pRes.json();
      setVoucher(vData);
      if (Array.isArray(iData)) setItems(iData);
      if (Array.isArray(pData)) setPayrollItems(pData);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/vouchers/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        payroll_item_id: parseInt(form.payroll_item_id) || null,
        description: form.description,
        quantity: parseInt(form.quantity) || 1,
        unit_price: parseFloat(form.unit_price) || 0,
      }),
    });
    if (res.ok) {
      setForm({ payroll_item_id: "", description: "", quantity: "1", unit_price: "0" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add item");
    }
  };

  const updateStatus = async (status: string) => {
    if (status === "void" && !confirm("Void this voucher?")) return;
    await fetch(`/api/vouchers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!voucher) {
    return <div className="text-center py-5 text-muted">Voucher not found</div>;
  }

  const badgeBg = (s: string) => {
    const map: Record<string, string> = { prepared: "warning", approved: "success", void: "danger", completed: "info" };
    return map[s] || "secondary";
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">{voucher.code}</h4>
          <span className={`badge bg-${badgeBg(voucher.status)} mt-1`}>{voucher.status}</span>
        </div>
        <div className="d-flex gap-2">
          {voucher.status === "prepared" && (
            <>
              <button className="btn btn-primary" onClick={() => updateStatus("approved")}>
                <i className="bi bi-check-lg me-1"></i>Approve
              </button>
              <button className="btn btn-danger" onClick={() => updateStatus("void")}>
                <i className="bi bi-x-lg me-1"></i>Void
              </button>
            </>
          )}
          {(voucher.status === "approved" || voucher.status === "completed") && (
            <button className="btn btn-danger" onClick={() => updateStatus("void")}>
              <i className="bi bi-x-lg me-1"></i>Void
            </button>
          )}
          <button className="btn btn-outline-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Voucher Type</div>
              <div className="fw-bold">{voucher.voucher_type}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Employee</div>
              <div className="fw-bold">{voucher.employee_name}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Prepared By</div>
              <div className="fw-bold">{voucher.prepared_by_name || "-"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Amount</div>
              <div className="fw-bold">{(voucher.total_amount || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold">Voucher Notes</div>
        <div className="card-body">
          <p className="mb-0">{voucher.notes || "No notes"}</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold">Items</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Payroll Item</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-3">No items</td></tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.payroll_item_name || "-"}</td>
                    <td>{item.description || "-"}</td>
                    <td>{item.quantity}</td>
                    <td>{(item.unit_price || 0).toLocaleString()}</td>
                    <td className="fw-bold">{(item.quantity * (item.unit_price || 0)).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {voucher.status === "prepared" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header fw-semibold">Add Item</div>
          <div className="card-body">
            <form onSubmit={addItem}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Payroll Item</label>
                  <select name="payroll_item_id" className="form-control" value={form.payroll_item_id} onChange={handleChange}>
                    <option value="">None (Manual)</option>
                    {payrollItems.map((pi: any) => (
                      <option key={pi.id} value={pi.id}>{pi.name} ({pi.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Description *</label>
                  <input type="text" name="description" className="form-control" value={form.description} onChange={handleChange} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Quantity *</label>
                  <input type="number" name="quantity" className="form-control" value={form.quantity} onChange={handleChange} min={1} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Unit Price *</label>
                  <input type="number" step="0.01" name="unit_price" className="form-control" value={form.unit_price} onChange={handleChange} min={0} required />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="bi bi-plus me-1"></i>Add
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
