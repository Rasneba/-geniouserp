"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPlacementPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({
    employee_id: "", placement_type: "", employment_stage_id: "",
    department_id: "", position_id: "", branch: "", salary: "",
    start_date: "", end_date: "", reason: "",
  });

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch("/api/employment-stages", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch("/api/departments", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch("/api/positions", { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
    ]).then(([empData, stgData, depData, posData]) => {
      if (Array.isArray(empData)) setEmployees(empData);
      if (Array.isArray(stgData)) setStages(stgData);
      if (Array.isArray(depData)) setDepartments(depData);
      if (Array.isArray(posData)) setPositions(posData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/placements", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        employee_id: parseInt(form.employee_id),
        placement_type: form.placement_type,
        employment_stage_id: form.employment_stage_id ? parseInt(form.employment_stage_id) : undefined,
        department_id: form.department_id ? parseInt(form.department_id) : undefined,
        position_id: form.position_id ? parseInt(form.position_id) : undefined,
        branch: form.branch || undefined,
        salary: form.salary ? parseFloat(form.salary) : undefined,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
        reason: form.reason || undefined,
      }),
    });
    if (res.ok) {
      router.push("/dashboard/placements");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create placement");
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">New Placement</h4>
        <button className="btn btn-outline-secondary" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header fw-semibold">Placement Details</div>
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Employee *</label>
                <select name="employee_id" className="form-control" value={form.employee_id} onChange={handleChange} required>
                  <option value="">Select Employee</option>
                  {employees.filter((e: any) => e.is_active).map((e: any) => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Placement Type *</label>
                <select name="placement_type" className="form-control" value={form.placement_type} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="initial">Initial</option>
                  <option value="promotion">Promotion</option>
                  <option value="demotion">Demotion</option>
                  <option value="transfer">Transfer</option>
                  <option value="suspension">Suspension</option>
                  <option value="termination">Termination</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Employment Stage</label>
                <select name="employment_stage_id" className="form-control" value={form.employment_stage_id} onChange={handleChange}>
                  <option value="">Select Stage</option>
                  {stages.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Department</label>
                <select name="department_id" className="form-control" value={form.department_id} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.filter((d: any) => d.is_active).map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Position</label>
                <select name="position_id" className="form-control" value={form.position_id} onChange={handleChange}>
                  <option value="">Select Position</option>
                  {positions.filter((p: any) => p.is_active).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Branch</label>
                <input type="text" name="branch" className="form-control" value={form.branch} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Salary</label>
                <input type="number" name="salary" className="form-control" value={form.salary} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Start Date *</label>
                <input type="date" name="start_date" className="form-control" value={form.start_date} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">End Date</label>
                <input type="date" name="end_date" className="form-control" value={form.end_date} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Reason</label>
                <textarea name="reason" className="form-control" rows={2} value={form.reason} onChange={handleChange}></textarea>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-1"></i>Save Placement</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
