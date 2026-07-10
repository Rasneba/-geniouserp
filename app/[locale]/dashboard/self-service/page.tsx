"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LocaleProvider";

const sections = [
  { key: "overview", label: "Overview", icon: "bi-speedometer2" },
  { key: "profile", label: "My Profile", icon: "bi-person-badge" },
  { key: "attendance", label: "My Attendance", icon: "bi-calendar-check" },
  { key: "leave", label: "My Leave", icon: "bi-calendar-event" },
  { key: "payroll", label: "My Payroll", icon: "bi-wallet2" },
  { key: "documents", label: "My Documents", icon: "bi-file-earmark" },
];

export default function SelfServicePage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("overview");
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: "", start_date: "", end_date: "", total_days: 1, reason: "",
  });

  const loadAll = useCallback(async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [pRes, aRes, lRes, ltRes] = await Promise.all([
        fetch("/api/self-service/profile", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/self-service/attendance", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/self-service/leave", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/leave-types", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const pData = await pRes.json();
      const aData = await aRes.json();
      const lData = await lRes.json();
      const ltData = await ltRes.json();
      if (pData && !pData.error) setProfile(pData);
      if (Array.isArray(aData)) {
        setAttendance(aData);
        const today = new Date().toISOString().split("T")[0];
        const todayRec = aData.find((r: any) => r.date === today);
        setTodayAttendance(todayRec || null);
      }
      if (Array.isArray(lData)) setLeaveRequests(lData);
      if (Array.isArray(ltData)) setLeaveTypes(ltData);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleLeaveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLeaveForm({ ...leaveForm, [e.target.name]: val });
    if (e.target.name === "start_date" || e.target.name === "end_date") {
      const start = e.target.name === "start_date" ? val : leaveForm.start_date;
      const end = e.target.name === "end_date" ? val : leaveForm.end_date;
      if (start && end) {
        const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setLeaveForm((f: any) => ({ ...f, total_days: diff > 0 ? diff : 1 }));
      }
    }
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/self-service/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        leave_type_id: parseInt(leaveForm.leave_type_id),
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        total_days: leaveForm.total_days,
        reason: leaveForm.reason,
      }),
    });
    if (res.ok) {
      setShowLeaveForm(false);
      setLeaveForm({ leave_type_id: "", start_date: "", end_date: "", total_days: 1, reason: "" });
      loadAll();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to submit leave request");
    }
  };

  const handleClock = async (action: "clock_in" | "clock_out") => {
    setClocking(true);
    try {
      const res = await fetch("/api/self-service/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadAll();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action}`);
      }
    } catch (err) {
      alert("Network error");
    }
    setClocking(false);
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const res = await fetch("/api/self-service/attendance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ field: editingField, value: editValue }),
    });
    if (res.ok) {
      setEditingField(null);
      loadAll();
    } else {
      alert("Failed to update");
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  const statusBg = (s: string) => {
    const map: Record<string, string> = { approved: "success", rejected: "danger", pending: "warning", cancelled: "secondary" };
    return map[s] || "secondary";
  };

  const pendingLeaves = leaveRequests.filter((lr: any) => lr.status === "pending").length;
  const isClockedIn = !!todayAttendance?.time_in && !todayAttendance?.time_out;
  const isClockedOut = !!todayAttendance?.time_out;
  const empName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">{t("self_service.title")}</h4>
      </div>

      {activeSection === "overview" && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm bg-gradient-primary text-white" style={{ background: "linear-gradient(135deg, #0d6efd, #6610f2)" }}>
                <div className="card-body">
                  <h5 className="fw-bold mb-1">{t("self_service.welcome")}, {empName}!</h5>
                  <p className="mb-3 opacity-75 small">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <div className="d-flex gap-3">
                    {!isClockedOut ? (
                      <button
                        className={`btn ${isClockedIn ? "btn-outline-light" : "btn-light"} px-4 fw-semibold`}
                        onClick={() => handleClock(isClockedIn ? "clock_out" : "clock_in")}
                        disabled={clocking}
                      >
                        <i className={`bi ${isClockedIn ? "bi-box-arrow-right" : "bi-box-arrow-in-right"} me-2`}></i>
                        {clocking ? "..." : isClockedIn ? t("self_service.clock_out") : t("self_service.clock_in")}
                      </button>
                    ) : (
                      <span className="badge bg-light text-dark fs-6 px-3 py-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        {t("self_service.clocked_out")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="row g-2">
                <div className="col-6">
                  <div className="card border-0 shadow-sm text-center p-3 h-100">
                    <i className="bi bi-calendar-check fs-3 text-primary mb-1"></i>
                    <div className="fs-4 fw-bold">{todayAttendance ? (isClockedOut ? "✓" : isClockedIn ? "↻" : "—") : "—"}</div>
                    <div className="small text-muted">{t("self_service.today")}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 shadow-sm text-center p-3 h-100">
                    <i className="bi bi-send fs-3 text-warning mb-1"></i>
                    <div className="fs-4 fw-bold">{pendingLeaves}</div>
                    <div className="small text-muted">{t("self_service.pending")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            {sections.filter(s => s.key !== "overview").map((sec) => (
              <div className="col-md-4 col-lg-3" key={sec.key}>
                <div
                  className="card border-0 shadow-sm text-center p-3 h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveSection(sec.key)}
                >
                  <i className={`bi ${sec.icon} fs-2 d-block mb-2 text-primary`}></i>
                  <div className="fw-semibold">{t("self_service.tab." + sec.key)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection !== "overview" && (
        <div className="mb-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setActiveSection("overview")}>
            <i className="bi bi-arrow-left me-1"></i>{t("self_service.back")}
          </button>
        </div>
      )}

      <div className="row g-3 mb-4 d-none">
        {sections.filter(s => s.key !== "overview").map((sec) => (
          <div className="col" key={sec.key}>
            <div
              className={`card border-0 shadow-sm text-center p-3 cursor-pointer ${activeSection === sec.key ? "bg-primary text-white" : ""}`}
              style={{ cursor: "pointer", minWidth: "120px" }}
              onClick={() => setActiveSection(sec.key)}
            >
              <i className={`bi ${sec.icon} fs-2 d-block mb-2`}></i>
              <div className="small fw-semibold">{t("self_service.tab." + sec.key)}</div>
            </div>
          </div>
        ))}
      </div>

      {activeSection === "profile" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
            <span>{t("self_service.profile_title")}</span>
          </div>
          <div className="card-body">
            {profile ? (
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.full_name")}</div>
                  <div className="fw-bold">{profile.title} {profile.first_name} {profile.middle_name} {profile.last_name}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.employee_code")}</div>
                  <div className="fw-bold">{profile.code}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Email</div>
                  <div className="fw-bold">{profile.email}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.phone")}</div>
                  {editingField === "phone" ? (
                    <div className="d-flex gap-1">
                      <input type="text" className="form-control form-control-sm" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                      <button className="btn btn-sm btn-success" onClick={saveEdit}><i className="bi bi-check"></i></button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}><i className="bi bi-x"></i></button>
                    </div>
                  ) : (
                    <div className="fw-bold d-flex align-items-center gap-2">
                      {profile.phone || "-"}
                      <i className="bi bi-pencil small text-muted" style={{ cursor: "pointer" }} onClick={() => startEdit("phone", profile.phone)}></i>
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.department")}</div>
                  <div className="fw-bold">{profile.department_name || "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.position")}</div>
                  <div className="fw-bold">{profile.position_title || "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.gender")}</div>
                  <div className="fw-bold">{profile.gender || "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.dob")}</div>
                  <div className="fw-bold">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.hire_date")}</div>
                  <div className="fw-bold">{profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">{t("self_service.address")}</div>
                  {editingField === "address" ? (
                    <div className="d-flex gap-1">
                      <input type="text" className="form-control form-control-sm" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                      <button className="btn btn-sm btn-success" onClick={saveEdit}><i className="bi bi-check"></i></button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}><i className="bi bi-x"></i></button>
                    </div>
                  ) : (
                    <div className="fw-bold d-flex align-items-center gap-2">
                      {profile.address || "-"}
                      <i className="bi bi-pencil small text-muted" style={{ cursor: "pointer" }} onClick={() => startEdit("address", profile.address)}></i>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted">{t("self_service.no_profile")}</div>
            )}
          </div>
        </div>
      )}

      {activeSection === "attendance" && (
        <div>
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold mb-1">{t("self_service.today_attendance")}</h6>
                <span className="text-muted small">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                {isClockedOut ? (
                  <span className="badge bg-success fs-6 px-3 py-2">
                    <i className="bi bi-check-circle me-1"></i>{t("self_service.completed")}
                  </span>
                ) : (
                  <button
                    className={`btn ${isClockedIn ? "btn-danger" : "btn-primary"} px-4`}
                    onClick={() => handleClock(isClockedIn ? "clock_out" : "clock_in")}
                    disabled={clocking}
                  >
                    <i className={`bi ${isClockedIn ? "bi-box-arrow-right" : "bi-box-arrow-in-right"} me-2`}></i>
                    {clocking ? "..." : isClockedIn ? t("self_service.clock_out") : t("self_service.clock_in")}
                  </button>
                )}
              </div>
            </div>
            {todayAttendance && (
              <div className="card-footer bg-light d-flex gap-4 small">
                <div><span className="text-muted">{t("self_service.time_in")}:</span> <strong>{todayAttendance.time_in || "-"}</strong></div>
                <div><span className="text-muted">{t("self_service.time_out")}:</span> <strong>{todayAttendance.time_out || "-"}</strong></div>
                <div><span className="text-muted">{t("self_service.status")}:</span> <strong className="text-capitalize">{todayAttendance.status}</strong></div>
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold">{t("self_service.history")}</div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>{t("self_service.date")}</th>
                    <th>{t("self_service.time_in")}</th>
                    <th>{t("self_service.time_out")}</th>
                    <th>{t("self_service.status")}</th>
                    <th>{t("self_service.remarks")}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">{t("self_service.no_records")}</td></tr>
                  ) : (
                    attendance.map((a: any) => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td>{a.time_in || "-"}</td>
                        <td>{a.time_out || "-"}</td>
                        <td>
                          <span className={`badge bg-${a.status === "present" ? "success" : a.status === "late" ? "warning" : a.status === "half-day" ? "info" : a.status === "leave" ? "primary" : "danger"}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="text-muted small">{a.remarks || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSection === "leave" && (
        <div>
          {profile?.leave_definitions && profile.leave_definitions.length > 0 && (
            <div className="row g-2 mb-3">
              {profile.leave_definitions.map((ld: any) => (
                <div className="col-md-3 col-6" key={ld.id}>
                  <div className="card border-0 shadow-sm text-center p-2">
                    <div className="fs-5 fw-bold text-primary">{ld.days_entitled - ld.days_used}</div>
                    <div className="small text-muted">{ld.leave_type_name}</div>
                    <div className="small text-muted">{t("self_service.remaining")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">{t("self_service.my_leave")}</h5>
            <button className="btn btn-primary" onClick={() => setShowLeaveForm(!showLeaveForm)}>
              <i className="bi bi-plus-lg me-1"></i>{showLeaveForm ? t("common.cancel") : t("self_service.request_leave")}
            </button>
          </div>

          {showLeaveForm && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header fw-semibold">{t("self_service.new_leave")}</div>
              <div className="card-body">
                <form onSubmit={submitLeave}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">{t("self_service.leave_type")} *</label>
                      <select name="leave_type_id" className="form-control" value={leaveForm.leave_type_id} onChange={handleLeaveChange} required>
                        <option value="">{t("self_service.select_type")}</option>
                        {leaveTypes.map((lt: any) => (
                          <option key={lt.id} value={lt.id}>{lt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">{t("self_service.start_date")} *</label>
                      <input type="date" name="start_date" className="form-control" value={leaveForm.start_date} onChange={handleLeaveChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">{t("self_service.end_date")} *</label>
                      <input type="date" name="end_date" className="form-control" value={leaveForm.end_date} onChange={handleLeaveChange} required />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold">{t("self_service.days")}</label>
                      <input type="number" name="total_days" className="form-control" value={leaveForm.total_days} readOnly />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">{t("self_service.reason")}</label>
                      <textarea name="reason" className="form-control" rows={2} value={leaveForm.reason} onChange={handleLeaveChange}></textarea>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button type="submit" className="btn btn-primary px-4"><i className="bi bi-send me-1"></i>{t("self_service.submit")}</button>
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
                    <th>{t("self_service.leave_type")}</th>
                    <th>{t("self_service.from")}</th>
                    <th>{t("self_service.to")}</th>
                    <th>{t("self_service.days")}</th>
                    <th>{t("self_service.reason")}</th>
                    <th>{t("self_service.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">{t("self_service.no_leave")}</td></tr>
                  ) : (
                    leaveRequests.map((lr: any) => (
                      <tr key={lr.id}>
                        <td>{lr.leave_type_name}</td>
                        <td>{lr.start_date}</td>
                        <td>{lr.end_date}</td>
                        <td>{lr.total_days}</td>
                        <td className="text-muted small">{lr.reason || "-"}</td>
                        <td><span className={`badge bg-${statusBg(lr.status)}`}>{lr.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSection === "payroll" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header fw-semibold">{t("self_service.payroll_title")}</div>
          <div className="card-body">
            <p className="text-muted mb-0">{t("self_service.payroll_placeholder")}</p>
          </div>
        </div>
      )}

      {activeSection === "documents" && (
        <div className="card border-0 shadow-sm">
          <div className="card-header fw-semibold">{t("self_service.documents_title")}</div>
          <div className="card-body">
            {profile?.documents && profile.documents.length > 0 ? (
              <div className="list-group">
                {profile.documents.map((d: any) => (
                  <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-file-earmark me-2"></i>
                      {d.document_name || d.file_name}
                    </div>
                    <span className="badge bg-secondary">{d.document_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">{t("self_service.no_documents")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
