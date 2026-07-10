"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState<any>({});
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    if (form?.photo) setPhotoPreview(form.photo);
  }, [form?.photo]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setPhotoPreview(data);
      setForm((f: any) => ({ ...f, photo: data }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const load = async () => {
      const tok = localStorage.getItem("token");
      if (!tok) { setLoading(false); return; }
      try {
        const [empRes, deptRes, posRes, stageRes] = await Promise.all([
          fetch(`/api/employees/${id}`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/departments", { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/positions", { headers: { Authorization: `Bearer ${tok}` } }),
          fetch("/api/employment-stages", { headers: { Authorization: `Bearer ${tok}` } }),
        ]);
        const emp = await empRes.json();
        const depts = await deptRes.json();
        const poses = await posRes.json();
        const stgs = await stageRes.json();
        if (emp && !emp.error) setForm(emp);
        if (Array.isArray(depts)) setDepartments(depts);
        if (Array.isArray(poses)) setPositions(poses);
        if (Array.isArray(stgs)) setStages(stgs);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          department_id: form.department_id ? parseInt(form.department_id) : null,
          position_id: form.position_id ? parseInt(form.position_id) : null,
          employment_stage_id: form.employment_stage_id ? parseInt(form.employment_stage_id) : null,
          salary: form.salary ? parseFloat(form.salary) : null,
        }),
      });
      if (res.ok) {
        router.push(`/dashboard/employees/view/${id}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Edit Employee</h4>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Employee Code</label>
                <input name="code" className="form-control" value={form.code || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-4 d-flex flex-column align-items-center justify-content-center">
                <label className="form-label small fw-semibold">Photo</label>
                <div className="d-flex flex-column align-items-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" loading="lazy" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: "50%", backgroundColor: "var(--table-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-person fs-1 text-muted"></i>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="form-control form-control-sm mt-2" onChange={handlePhoto} style={{ maxWidth: 200 }} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Title</label>
                <input name="title" className="form-control" value={form.title || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">First Name</label>
                <input name="first_name" className="form-control" value={form.first_name || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Middle Name</label>
                <input name="middle_name" className="form-control" value={form.middle_name || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Last Name</label>
                <input name="last_name" className="form-control" value={form.last_name || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Gender</label>
                <select name="gender" className="form-control" value={form.gender || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Date of Birth</label>
                <input type="date" name="date_of_birth" className="form-control" value={form.date_of_birth?.split("T")[0] || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Nationality</label>
                <input name="nationality" className="form-control" value={form.nationality || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Marital Status</label>
                <select name="marital_status" className="form-control" value={form.marital_status || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Phone</label>
                <input name="phone" className="form-control" value={form.phone || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Email</label>
                <input type="email" name="email" className="form-control" value={form.email || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Department</label>
                <select name="department_id" className="form-control" value={form.department_id || ""} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Position</label>
                <select name="position_id" className="form-control" value={form.position_id || ""} onChange={handleChange}>
                  <option value="">Select Position</option>
                  {positions.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Hire Date</label>
                <input type="date" name="hire_date" className="form-control" value={form.hire_date?.split("T")[0] || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Salary</label>
                <input type="number" name="salary" className="form-control" value={form.salary || ""} onChange={handleChange} />
              </div>

              <div className="col-12"><hr /><h6 className="fw-bold text-secondary">Employment Details</h6></div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">Employment Stage</label>
                <select name="employment_stage_id" className="form-control" value={form.employment_stage_id || ""} onChange={handleChange}>
                  <option value="">Select Stage</option>
                  {stages.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Branch</label>
                <input name="branch" className="form-control" value={form.branch || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Probation Start Date</label>
                <input type="date" name="probation_start_date" className="form-control" value={form.probation_start_date?.split("T")[0] || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Probation End Date</label>
                <input type="date" name="probation_end_date" className="form-control" value={form.probation_end_date?.split("T")[0] || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Contract End Date</label>
                <input type="date" name="contract_end_date" className="form-control" value={form.contract_end_date?.split("T")[0] || ""} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold d-block">Status</label>
                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" name="is_active" id="is_active"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  <label className="form-check-label" htmlFor="is_active">Active</label>
                </div>
              </div>

              <div className="col-12"><hr /><h6 className="fw-bold text-secondary">IDs & Documents</h6></div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">TIN</label>
                <input name="tin" className="form-control" value={form.tin || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Biometric ID</label>
                <input name="biold" className="form-control" value={form.biold || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Passport ID</label>
                <input name="passport_id" className="form-control" value={form.passport_id || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">National ID</label>
                <input name="national_id" className="form-control" value={form.national_id || ""} onChange={handleChange} />
              </div>

              <div className="col-12"><hr /><h6 className="fw-bold text-secondary">Address & Emergency Contact</h6></div>

              <div className="col-md-12">
                <label className="form-label small fw-semibold">Address</label>
                <textarea name="address" className="form-control" rows={2} value={form.address || ""} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Emergency Contact Name</label>
                <input name="emergency_contact" className="form-control" value={form.emergency_contact || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Emergency Contact Phone</label>
                <input name="emergency_phone" className="form-control" value={form.emergency_phone || ""} onChange={handleChange} />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary px-4">
                <i className="bi bi-save me-1"></i>Update Employee
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
