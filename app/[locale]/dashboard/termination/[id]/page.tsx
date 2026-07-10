"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProcessTerminationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({
    termination_date: new Date().toISOString().split("T")[0],
    reason: "",
    is_voluntary: false,
    clearance_status: "pending",
  });

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/employees/${id}`, { headers: { Authorization: `Bearer ${tok}` } });
        const data = await res.json();
        if (data && !data.error) setEmployee(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${id}/termination`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || "Failed to process termination");
      }
    } catch { alert("Server error"); }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!employee) {
    return <div className="text-center py-5 text-muted">Employee not found</div>;
  }

  if (result) {
    return (
      <div>
        <h4 className="fw-bold mb-4">Termination Processed</h4>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>Termination has been processed successfully for <strong>{employee.first_name} {employee.last_name}</strong>.
            </div>
            <div className="d-flex gap-3 mt-3">
              {result.terv_voucher_link && (
                <a href={result.terv_voucher_link} className="btn btn-outline-primary" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-file-earmark-text me-1"></i>View TERV Voucher
                </a>
              )}
              {result.termination_letter_link && (
                <a href={result.termination_letter_link} className="btn btn-outline-primary" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-file-earmark-text me-1"></i>View Termination Letter
                </a>
              )}
            </div>
            <div className="mt-3">
              <button className="btn btn-secondary" onClick={() => router.push("/dashboard/termination")}>
                <i className="bi bi-arrow-left me-1"></i>Back to Termination List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Process Termination</h4>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0 fw-semibold">Employee: {employee.first_name} {employee.last_name} ({employee.code})</h6>
          <small className="text-muted">{employee.department_name} | {employee.position_title}</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Termination Date *</label>
                <input type="date" name="termination_date" className="form-control" value={form.termination_date} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Clearance Status</label>
                <select name="clearance_status" className="form-control" value={form.clearance_status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="cleared">Cleared</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" name="is_voluntary" id="is_voluntary"
                    checked={form.is_voluntary} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="is_voluntary">Voluntary Resignation</label>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Reason for Termination *</label>
                <textarea name="reason" className="form-control" rows={4} value={form.reason} onChange={handleChange} required placeholder="Provide detailed reason for termination..."></textarea>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-danger px-4" disabled={submitting}>
                <i className="bi bi-person-x me-1"></i>{submitting ? "Processing..." : "Process Termination"}
              </button>
              <button type="button" className="btn btn-secondary px-4" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
