"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPositionPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const [posRes, deptRes] = await Promise.all([
          fetch(`/api/positions/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/departments", { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const posData = await posRes.json();
        const deptData = await deptRes.json();
        if (posData && !posData.error) setForm(posData);
        if (Array.isArray(deptData)) setDepartments(deptData);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/positions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        department_id: form.department_id ? parseInt(form.department_id) : null,
        min_salary: form.min_salary ? parseFloat(form.min_salary) : null,
        max_salary: form.max_salary ? parseFloat(form.max_salary) : null,
      }),
    });
    if (res.ok) router.push("/dashboard/positions");
    else alert("Failed to update position");
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Edit Position</h4>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Title *</label>
                <input name="title" className="form-control" value={form.title || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Department</label>
                <select name="department_id" className="form-control" value={form.department_id || ""} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Description</label>
                <textarea name="description" className="form-control" rows={3} value={form.description || ""} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Min Salary</label>
                <input type="number" name="min_salary" className="form-control" value={form.min_salary || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Max Salary</label>
                <input type="number" name="max_salary" className="form-control" value={form.max_salary || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold d-block">Status</label>
                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" id="is_active"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  <label className="form-check-label" htmlFor="is_active">Active</label>
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-1"></i>Update</button>
              <button type="button" className="btn btn-secondary px-4" onClick={() => router.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
