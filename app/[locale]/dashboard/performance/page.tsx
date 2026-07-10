"use client";

import { useEffect, useState } from "react";

const StarRating = ({ rating, onChange, readonly }: { rating: number; onChange?: (v: number) => void; readonly?: boolean }) => (
  <span className="d-inline-flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={`bi ${star <= rating ? "bi-star-fill text-warning" : "bi-star text-muted"} ${onChange ? "cursor-pointer" : ""}`}
        style={onChange ? { cursor: "pointer", fontSize: "1.1rem" } : { fontSize: "1.1rem" }}
        onClick={() => onChange?.(star)}
      ></i>
    ))}
  </span>
);

export default function PerformancePage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({
    employee_id: "", rating: 0, comments: "", strengths: "", improvements: "",
  });

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [eRes, empRes] = await Promise.all([
        fetch("/api/performance", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const eData = await eRes.json();
      const empData = await empRes.json();
      if (Array.isArray(eData)) setEvaluations(eData);
      if (Array.isArray(empData)) setEmployees(empData);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) { alert("Please select a rating"); return; }
    const res = await fetch("/api/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        employee_id: parseInt(form.employee_id),
        reviewer_id: parseInt(form.employee_id),
        evaluation_date: new Date().toISOString().split("T")[0],
        rating: form.rating,
        comments: form.comments,
        strengths: form.strengths,
        improvements: form.improvements,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ employee_id: "", rating: 0, comments: "", strengths: "", improvements: "" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to submit evaluation");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/performance/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const statusBg = (s: string) => {
    const map: Record<string, string> = { draft: "secondary", submitted: "primary", acknowledged: "success" };
    return map[s] || "secondary";
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Performance Evaluations</h4>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-lg me-1"></i>{showForm ? "Cancel" : "New Evaluation"}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header fw-semibold">New Performance Evaluation</div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Employee *</label>
                  <select name="employee_id" className="form-control" value={form.employee_id} onChange={handleChange} required>
                    <option value="">Select Employee</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Rating *</label>
                  <div className="py-2">
                    <StarRating rating={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Comments</label>
                  <textarea name="comments" className="form-control" rows={3} value={form.comments} onChange={handleChange}></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Strengths</label>
                  <textarea name="strengths" className="form-control" rows={2} value={form.strengths} onChange={handleChange}></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Areas for Improvement</label>
                  <textarea name="improvements" className="form-control" rows={2} value={form.improvements} onChange={handleChange}></textarea>
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary px-4"><i className="bi bi-send me-1"></i>Submit Evaluation</button>
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
                <th>Employee</th>
                <th>Reviewer</th>
                <th>Date</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Strengths</th>
                <th>Improvements</th>
                <th>Status</th>
                <th style={{ width: "140px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : evaluations.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No evaluations found</td></tr>
              ) : (
                evaluations.map((ev: any) => (
                  <tr key={ev.id}>
                    <td className="fw-semibold">{ev.employee_name}</td>
                    <td>{ev.reviewer_name || "-"}</td>
                    <td className="small">{ev.evaluation_date?.split("T")[0]}</td>
                    <td><StarRating rating={ev.rating} readonly /></td>
                    <td className="small text-muted" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.comments || "-"}</td>
                    <td className="small text-muted" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.strengths || "-"}</td>
                    <td className="small text-muted" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.improvements || "-"}</td>
                    <td><span className={`badge bg-${statusBg(ev.status)}`}>{ev.status}</span></td>
                    <td>
                      {ev.status === "draft" ? (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(ev.id, "submitted")}>
                          <i className="bi bi-send me-1"></i>Submit
                        </button>
                      ) : ev.status === "submitted" ? (
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(ev.id, "acknowledged")}>
                          <i className="bi bi-check-lg me-1"></i>Acknowledge
                        </button>
                      ) : (
                        <span className="text-muted small">Done</span>
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
