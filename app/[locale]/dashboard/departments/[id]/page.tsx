"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditDepartmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    fetch(`/api/departments/${id}`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(data => { if (data && !data.error) setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/dashboard/departments");
    else alert("Failed to update department");
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Edit Department</h4>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Name *</label>
                <input name="name" className="form-control" value={form.name || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Code</label>
                <input name="code" className="form-control" value={form.code || ""} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Description</label>
                <textarea name="description" className="form-control" rows={3} value={form.description || ""} onChange={handleChange}></textarea>
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
