"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ViewEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/employees/${id}/full-profile`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (data && !data.error) setProfile(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const fetchData = async (endpoint: string) => {
    const tok = localStorage.getItem("token");
    if (!tok) return [];
    try {
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  };

  const postData = async (endpoint: string, body: any) => {
    const tok = localStorage.getItem("token");
    if (!tok) return null;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        loadProfile();
        return await res.json();
      }
      const err = await res.json();
      alert(err.error || "Failed to save");
      return null;
    } catch { alert("Server error"); return null; }
  };

  const deleteData = async (endpoint: string) => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) loadProfile();
      else { const err = await res.json(); alert(err.error || "Delete failed"); }
    } catch { alert("Server error"); }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="alert alert-danger">Employee not found</div>;
  }

  const e = profile;

  const tabs = [
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "banks", label: "Bank Info", icon: "bi-bank" },
    { key: "dependents", label: "Dependents", icon: "bi-people" },
    { key: "spouse", label: "Spouse", icon: "bi-person-heart" },
    { key: "education", label: "Education", icon: "bi-book" },
    { key: "experience", label: "Work Experience", icon: "bi-briefcase" },
    { key: "training", label: "Training", icon: "bi-mortarboard" },
    { key: "documents", label: "Documents", icon: "bi-file-earmark" },
    { key: "hobbies", label: "Hobbies", icon: "bi-heart" },
    { key: "placements", label: "Placements", icon: "bi-arrow-left-right" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-person me-2"></i>
          {e.first_name} {e.last_name}
        </h4>
        <div className="d-flex gap-2">
          <Link href={`/dashboard/employees/edit/${e.id}`} className="btn btn-warning text-white">
            <i className="bi bi-pencil me-1"></i>Edit
          </Link>
          <button className="btn btn-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {tabs.map((t) => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${activeTab === t.key ? "active fw-semibold" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`bi ${t.icon} me-1`}></i>
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {activeTab === "profile" && <ProfileTab emp={e} />}
        {activeTab === "banks" && (
          <SubTab
            title="Bank Information"
            columns={["Bank Name", "Account Number", "Account Holder", "Branch", "Status"]}
            rows={(e.banks || []).map((b: any) => ({
              id: b.id,
              cells: [b.bank_name, b.account_number, b.account_holder, b.branch, b.is_active ? "Active" : "Inactive"],
              deleteUrl: `/api/employees/${id}/banks/${b.id}`,
            }))}
            addForm={<BankForm employeeId={id as string} onSave={() => loadProfile()} />}
          />
        )}
        {activeTab === "dependents" && (
          <SubTab
            title="Dependents"
            columns={["Full Name", "Relationship", "Date of Birth", "Phone"]}
            rows={(e.dependents || []).map((d: any) => ({
              id: d.id,
              cells: [d.full_name, d.relationship, d.date_of_birth?.split("T")[0], d.phone || "-"],
              deleteUrl: `/api/employees/${id}/dependents/${d.id}`,
            }))}
            addForm={<DependentForm employeeId={id as string} onSave={() => loadProfile()} />}
          />
        )}
        {activeTab === "education" && (
          <SubTab
            title="Education"
            columns={["Institution", "Degree", "Field of Study", "Start", "End", "Grade"]}
            rows={(e.education || []).map((ed: any) => ({
              id: ed.id,
              cells: [ed.institution, ed.degree || "-", ed.field_of_study || "-", ed.start_date?.split("T")[0], ed.end_date?.split("T")[0], ed.grade || "-"],
              deleteUrl: `/api/employees/${id}/education/${ed.id}`,
            }))}
            addForm={<EducationForm employeeId={id as string} onSave={() => loadProfile()} />}
          />
        )}
        {activeTab === "experience" && (
          <SubTab
            title="Work Experience"
            columns={["Company", "Position", "Start", "End", "Reason for Leaving"]}
            rows={(e.experience || []).map((ex: any) => ({
              id: ex.id,
              cells: [ex.company, ex.position || "-", ex.start_date?.split("T")[0], ex.end_date?.split("T")[0], ex.reason_leaving || "-"],
              deleteUrl: `/api/employees/${id}/experience/${ex.id}`,
            }))}
            addForm={<ExperienceForm employeeId={id as string} onSave={() => loadProfile()} />}
          />
        )}
        {activeTab === "documents" && (
          <SubTab
            title="Documents"
            columns={["Document Type", "Document Name", "File Path", "Expiry Date"]}
            rows={(e.documents || []).map((doc: any) => ({
              id: doc.id,
              cells: [doc.document_type, doc.document_name || "-", doc.file_path || "-", doc.expiry_date?.split("T")[0] || "-"],
              deleteUrl: `/api/employees/${id}/documents/${doc.id}`,
            }))}
            addForm={<DocumentForm employeeId={id as string} onSave={() => loadProfile()} />}
          />
        )}
        {activeTab === "hobbies" && (
          <HobbiesTab
            hobbies={e.hobbies || []}
            employeeId={id as string}
            onRefresh={() => loadProfile()}
          />
        )}
        {activeTab === "spouse" && (
          <SpouseTab
            spouse={e.spouse || []}
            employeeId={id as string}
            onRefresh={() => loadProfile()}
          />
        )}
        {activeTab === "training" && (
          <TrainingTab
            training={e.training || []}
            employeeId={id as string}
            onRefresh={() => loadProfile()}
          />
        )}
        {activeTab === "placements" && (
          <PlacementsTab placements={e.placements || []} />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ emp }: { emp: any }) {
  const [currency, setCurrency] = useState("Birr");
  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) return;
    fetch("/api/settings", { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json()).then(s => { if (s?.currency) setCurrency(s.currency); }).catch(() => {});
  }, []);

  const fields = [
    { label: "Employee Code", value: emp.code },
    { label: "Title", value: emp.title || "-" },
    { label: "Full Name", value: `${emp.first_name} ${emp.middle_name || ""} ${emp.last_name}` },
    { label: "Gender", value: emp.gender },
    { label: "Date of Birth", value: emp.date_of_birth?.split("T")[0] || "-" },
    { label: "Nationality", value: emp.nationality || "-" },
    { label: "Marital Status", value: emp.marital_status || "-" },
    { label: "Phone", value: emp.phone || "-" },
    { label: "Email", value: emp.email || "-" },
    { label: "Address", value: emp.address || "-" },
    { label: "Department", value: emp.department_name || "-" },
    { label: "Position", value: emp.position_title || "-" },
    { label: "Hire Date", value: emp.hire_date?.split("T")[0] || "-" },
    { label: "Salary", value: emp.salary ? `$${parseFloat(emp.salary).toLocaleString()}` : "-" },
    { label: "Employment Stage", value: emp.employment_stage_name || "-" },
    { label: "Branch", value: emp.branch || "-" },
    { label: "Probation Start", value: emp.probation_start_date?.split("T")[0] || "-" },
    { label: "Probation End", value: emp.probation_end_date?.split("T")[0] || "-" },
    { label: "Contract End", value: emp.contract_end_date?.split("T")[0] || "-" },
    { label: "TIN", value: emp.tin || "-" },
    { label: "Biometric ID", value: emp.biold || "-" },
    { label: "Passport ID", value: emp.passport_id || "-" },
    { label: "National ID", value: emp.national_id || "-" },
    { label: "Status", value: emp.is_active ? "Active" : "Inactive" },
    { label: "Emergency Contact", value: emp.emergency_contact || "-" },
    { label: "Emergency Phone", value: emp.emergency_phone || "-" },
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header fw-semibold d-flex align-items-center gap-2">
        <i className="bi bi-info-circle"></i>Employee Details
      </div>
      <div className="card-body">
        <div className="d-flex align-items-center gap-4 mb-4 pb-3 border-bottom">
          {emp.photo ? (
            <img src={emp.photo} alt="Employee" loading="lazy" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%", border: "3px solid var(--card-border)" }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: "50%", backgroundColor: "var(--table-hover)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--card-border)" }}>
              <i className="bi bi-person fs-1 text-muted"></i>
            </div>
          )}
          <div>
            <h5 className="fw-bold mb-1">{emp.first_name} {emp.middle_name || ""} {emp.last_name}</h5>
            <div className="text-muted small">{emp.position_title || emp.title || "-"}</div>
            <div className="mt-1">
              {emp.is_active ? (
                <span className="badge bg-success">Active</span>
              ) : (
                <span className="badge bg-danger">Inactive</span>
              )}
              <span className="badge bg-secondary ms-1">{emp.code}</span>
            </div>
          </div>
        </div>
        <div className="row">
          {fields.map((f) => (
            <div className="col-md-4 mb-3" key={f.label}>
              <div className="text-muted small text-uppercase fw-semibold">{f.label}</div>
              <div className="fw-medium">{f.label === "Salary" ? `${currency} ${emp.salary ? parseFloat(emp.salary).toLocaleString() : "-"}` : f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubTab({
  title,
  columns,
  rows,
  addForm,
}: {
  title: string;
  columns: string[];
  rows: { id: number; cells: string[]; deleteUrl: string }[];
  addForm: React.ReactNode;
}) {
  const [showForm, setShowForm] = useState(false);

  const deleteRow = async (url: string) => {
    if (!confirm("Delete this record?")) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${tok}` } });
      if (!res.ok) { const err = await res.json(); alert(err.error || "Delete failed"); }
      else window.location.reload();
    } catch { alert("Server error"); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">{title}</h5>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? "bi-x" : "bi-plus-lg"} me-1`}></i>
          {showForm ? "Cancel" : "Add New"}
        </button>
      </div>
      {showForm && <div className="mb-3">{addForm}</div>}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
                <th style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="text-center text-muted py-3">No records</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    {r.cells.map((c, i) => <td key={i}>{c}</td>)}
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteRow(r.deleteUrl)}>
                        <i className="bi bi-trash"></i>
                      </button>
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

function BankForm({ employeeId, onSave }: { employeeId: string; onSave: () => void }) {
  const [form, setForm] = useState({ bank_name: "", account_number: "", account_holder: "", branch: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/banks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setForm({ bank_name: "", account_number: "", account_holder: "", branch: "" }); onSave(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };
  return (
    <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border">
      <div className="col-md-3">
        <input name="bank_name" className="form-control form-control-sm" placeholder="Bank Name" value={form.bank_name} onChange={handleChange} required />
      </div>
      <div className="col-md-3">
        <input name="account_number" className="form-control form-control-sm" placeholder="Account Number" value={form.account_number} onChange={handleChange} required />
      </div>
      <div className="col-md-3">
        <input name="account_holder" className="form-control form-control-sm" placeholder="Account Holder" value={form.account_holder} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input name="branch" className="form-control form-control-sm" placeholder="Branch" value={form.branch} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check"></i></button>
      </div>
    </form>
  );
}

function DependentForm({ employeeId, onSave }: { employeeId: string; onSave: () => void }) {
  const [form, setForm] = useState({ full_name: "", relationship: "", date_of_birth: "", phone: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/dependents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setForm({ full_name: "", relationship: "", date_of_birth: "", phone: "" }); onSave(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };
  return (
    <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border">
      <div className="col-md-3">
        <input name="full_name" className="form-control form-control-sm" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
      </div>
      <div className="col-md-2">
        <input name="relationship" className="form-control form-control-sm" placeholder="Relationship" value={form.relationship} onChange={handleChange} required />
      </div>
      <div className="col-md-2">
        <input type="date" name="date_of_birth" className="form-control form-control-sm" value={form.date_of_birth} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input name="phone" className="form-control form-control-sm" placeholder="Phone" value={form.phone} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check"></i></button>
      </div>
    </form>
  );
}

function EducationForm({ employeeId, onSave }: { employeeId: string; onSave: () => void }) {
  const [form, setForm] = useState({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/education`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setForm({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "" }); onSave(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };
  return (
    <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border">
      <div className="col-md-3">
        <input name="institution" className="form-control form-control-sm" placeholder="Institution" value={form.institution} onChange={handleChange} required />
      </div>
      <div className="col-md-2">
        <input name="degree" className="form-control form-control-sm" placeholder="Degree" value={form.degree} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input name="field_of_study" className="form-control form-control-sm" placeholder="Field of Study" value={form.field_of_study} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <input type="date" name="start_date" className="form-control form-control-sm" value={form.start_date} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <input type="date" name="end_date" className="form-control form-control-sm" value={form.end_date} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <input name="grade" className="form-control form-control-sm" placeholder="Grade" value={form.grade} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check"></i></button>
      </div>
    </form>
  );
}

function ExperienceForm({ employeeId, onSave }: { employeeId: string; onSave: () => void }) {
  const [form, setForm] = useState({ company: "", position: "", start_date: "", end_date: "", reason_leaving: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setForm({ company: "", position: "", start_date: "", end_date: "", reason_leaving: "" }); onSave(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };
  return (
    <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border">
      <div className="col-md-3">
        <input name="company" className="form-control form-control-sm" placeholder="Company" value={form.company} onChange={handleChange} required />
      </div>
      <div className="col-md-2">
        <input name="position" className="form-control form-control-sm" placeholder="Position" value={form.position} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input type="date" name="start_date" className="form-control form-control-sm" value={form.start_date} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input type="date" name="end_date" className="form-control form-control-sm" value={form.end_date} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input name="reason_leaving" className="form-control form-control-sm" placeholder="Reason Leaving" value={form.reason_leaving} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check"></i></button>
      </div>
    </form>
  );
}

function DocumentForm({ employeeId, onSave }: { employeeId: string; onSave: () => void }) {
  const [form, setForm] = useState({ document_type: "", document_name: "", file_path: "", expiry_date: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setForm({ document_type: "", document_name: "", file_path: "", expiry_date: "" }); onSave(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };
  return (
    <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border">
      <div className="col-md-3">
        <input name="document_type" className="form-control form-control-sm" placeholder="Document Type" value={form.document_type} onChange={handleChange} required />
      </div>
      <div className="col-md-3">
        <input name="document_name" className="form-control form-control-sm" placeholder="Document Name" value={form.document_name} onChange={handleChange} />
      </div>
      <div className="col-md-3">
        <input name="file_path" className="form-control form-control-sm" placeholder="File Path" value={form.file_path} onChange={handleChange} />
      </div>
      <div className="col-md-2">
        <input type="date" name="expiry_date" className="form-control form-control-sm" value={form.expiry_date} onChange={handleChange} />
      </div>
      <div className="col-md-1">
        <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check"></i></button>
      </div>
    </form>
  );
}

function HobbiesTab({ hobbies, employeeId, onRefresh }: { hobbies: any[]; employeeId: string; onRefresh: () => void }) {
  const [newHobby, setNewHobby] = useState("");

  const addHobby = async () => {
    if (!newHobby.trim()) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/hobbies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ hobby: newHobby.trim() }),
      });
      if (res.ok) { setNewHobby(""); onRefresh(); }
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  const deleteHobby = async (hobbyId: number) => {
    if (!confirm("Delete this hobby?")) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/hobbies/${hobbyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) onRefresh();
      else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addHobby(); }
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <input
          className="form-control form-control-sm"
          style={{ maxWidth: "300px" }}
          placeholder="Add a hobby..."
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary btn-sm" onClick={addHobby}>
          <i className="bi bi-plus-lg me-1"></i>Add
        </button>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {hobbies.length === 0 ? (
          <span className="text-muted">No hobbies listed</span>
        ) : (
          hobbies.map((h: any) => (
            <span key={h.id} className="badge bg-info fs-6 px-3 py-2 d-inline-flex align-items-center gap-2">
              <i className="bi bi-heart-fill"></i>
              {h.hobby}
              <button
                className="btn-close btn-close-white"
                style={{ fontSize: "0.6rem" }}
                onClick={() => deleteHobby(h.id)}
                aria-label="Remove"
              ></button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function SpouseTab({ spouse, employeeId, onRefresh }: { spouse: any[]; employeeId: string; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", date_of_birth: "", phone: "", occupation: "", employer: "", national_id: "", is_dependent: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/spouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ full_name: "", date_of_birth: "", phone: "", occupation: "", employer: "", national_id: "", is_dependent: false });
        setShowForm(false);
        onRefresh();
      } else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  const deleteSpouse = async (spouseId: number) => {
    if (!confirm("Delete this record?")) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/spouse/${spouseId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) onRefresh();
    } catch { alert("Server error"); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Spouse Information</h5>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? "bi-x" : "bi-plus-lg"} me-1`}></i>
          {showForm ? "Cancel" : "Add Spouse"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border mb-3">
          <div className="col-md-3">
            <label className="form-label small">Full Name *</label>
            <input name="full_name" className="form-control form-control-sm" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Date of Birth</label>
            <input type="date" name="date_of_birth" className="form-control form-control-sm" value={form.date_of_birth} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Phone</label>
            <input name="phone" className="form-control form-control-sm" value={form.phone} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Occupation</label>
            <input name="occupation" className="form-control form-control-sm" value={form.occupation} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Employer</label>
            <input name="employer" className="form-control form-control-sm" value={form.employer} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">National ID</label>
            <input name="national_id" className="form-control form-control-sm" value={form.national_id} onChange={handleChange} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <div className="form-check">
              <input type="checkbox" name="is_dependent" className="form-check-input" checked={form.is_dependent} onChange={handleChange} />
              <label className="form-check-label small">Is Dependent</label>
            </div>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check-lg"></i></button>
          </div>
        </form>
      )}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr><th>Full Name</th><th>DOB</th><th>Phone</th><th>Occupation</th><th>Employer</th><th>National ID</th><th>Dependent</th><th>Action</th></tr>
            </thead>
            <tbody>
              {spouse.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-3">No spouse records</td></tr>
              ) : spouse.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.full_name}</td>
                  <td>{s.date_of_birth?.split("T")[0] || "-"}</td>
                  <td>{s.phone || "-"}</td>
                  <td>{s.occupation || "-"}</td>
                  <td>{s.employer || "-"}</td>
                  <td>{s.national_id || "-"}</td>
                  <td>{s.is_dependent ? <span className="badge bg-success">Yes</span> : <span className="badge bg-secondary">No</span>}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteSpouse(s.id)}><i className="bi bi-trash"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrainingTab({ training, employeeId, onRefresh }: { training: any[]; employeeId: string; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_name: "", institution: "", start_date: "", end_date: "", duration_days: "", certificate: "", status: "completed", notes: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tok = localStorage.getItem("token");
    if (!tok) return;
    const body = { ...form, duration_days: form.duration_days ? parseInt(form.duration_days) : undefined };
    try {
      const res = await fetch(`/api/employees/${employeeId}/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setForm({ course_name: "", institution: "", start_date: "", end_date: "", duration_days: "", certificate: "", status: "completed", notes: "" });
        setShowForm(false);
        onRefresh();
      } else { const d = await res.json(); alert(d.error || "Failed"); }
    } catch { alert("Server error"); }
  };

  const deleteTraining = async (trainingId: number) => {
    if (!confirm("Delete this record?")) return;
    const tok = localStorage.getItem("token");
    if (!tok) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/training/${trainingId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) onRefresh();
    } catch { alert("Server error"); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { planned: "bg-info", in_progress: "bg-warning text-dark", completed: "bg-success", cancelled: "bg-secondary" };
    return <span className={`badge ${map[s] || "bg-secondary"} text-capitalize`}>{s.replace("_", " ")}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Training Records</h5>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? "bi-x" : "bi-plus-lg"} me-1`}></i>
          {showForm ? "Cancel" : "Add Training"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="row g-2 bg-light p-3 rounded border mb-3">
          <div className="col-md-3">
            <label className="form-label small">Course Name *</label>
            <input name="course_name" className="form-control form-control-sm" value={form.course_name} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Institution</label>
            <input name="institution" className="form-control form-control-sm" value={form.institution} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Start Date</label>
            <input type="date" name="start_date" className="form-control form-control-sm" value={form.start_date} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">End Date</label>
            <input type="date" name="end_date" className="form-control form-control-sm" value={form.end_date} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Duration (Days)</label>
            <input type="number" name="duration_days" className="form-control form-control-sm" value={form.duration_days} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Certificate</label>
            <input name="certificate" className="form-control form-control-sm" value={form.certificate} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Status</label>
            <select name="status" className="form-select form-select-sm" value={form.status} onChange={handleChange}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small">Notes</label>
            <textarea name="notes" className="form-control form-control-sm" rows={1} value={form.notes} onChange={handleChange}></textarea>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button type="submit" className="btn btn-success btn-sm w-100"><i className="bi bi-check-lg"></i></button>
          </div>
        </form>
      )}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr><th>Course</th><th>Institution</th><th>Start</th><th>End</th><th>Days</th><th>Certificate</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {training.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-3">No training records</td></tr>
              ) : training.map((t: any) => (
                <tr key={t.id}>
                  <td>{t.course_name}</td>
                  <td>{t.institution || "-"}</td>
                  <td>{t.start_date?.split("T")[0] || "-"}</td>
                  <td>{t.end_date?.split("T")[0] || "-"}</td>
                  <td>{t.duration_days || "-"}</td>
                  <td>{t.certificate || "-"}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteTraining(t.id)}><i className="bi bi-trash"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlacementsTab({ placements }: { placements: any[] }) {
  if (!placements || placements.length === 0) {
    return <div className="text-muted">No placement history</div>;
  }
  return (
    <div className="card border-0 shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>Type</th>
              <th>Department</th>
              <th>Position</th>
              <th>Branch</th>
              <th>Salary</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p: any) => (
              <tr key={p.id}>
                <td><span className="badge bg-secondary text-capitalize">{p.placement_type}</span></td>
                <td>{p.department_name || "-"}</td>
                <td>{p.position_title || "-"}</td>
                <td>{p.branch || "-"}</td>
                <td>{p.salary ? `$${parseFloat(p.salary).toLocaleString()}` : "-"}</td>
                <td>{p.start_date?.split("T")[0]}</td>
                <td>{p.end_date?.split("T")[0] || "-"}</td>
                <td>{p.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
