"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDepartmentPage() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/dashboard/departments");
    else alert("Failed to create department");
  };

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Add Department</h4>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Name *</label>
                <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Code</label>
                <input name="code" className="form-control" value={form.code} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Description</label>
                <textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange}></textarea>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-1"></i>Save</button>
              <button type="button" className="btn btn-secondary px-4" onClick={() => router.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
