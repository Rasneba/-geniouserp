"use client";

import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Shift assignment
  const [shifts, setShifts] = useState<any[]>([]);
  const [employeeShifts, setEmployeeShifts] = useState<any[]>([]);
  const [shiftForm, setShiftForm] = useState({ employee_id: "", shift_id: "", start_date: "", end_date: "" });

  const loadData = async () => {
    const tok = localStorage.getItem("token");
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    try {
      const [attRes, empRes, shRes, esRes] = await Promise.all([
        fetch(`/api/attendance?date=${date}`, { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/shifts", { headers: { Authorization: `Bearer ${tok}` } }),
        fetch("/api/employee-shifts", { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      const attData = await attRes.json();
      const empData = await empRes.json();
      const shData = await shRes.json();
      const esData = await esRes.json();
      if (Array.isArray(attData)) setRecords(attData);
      if (Array.isArray(empData)) setEmployees(empData);
      if (Array.isArray(shData)) setShifts(shData);
      if (Array.isArray(esData)) setEmployeeShifts(esData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [date]);

  const markAttendance = async (employee_id: number, status: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const body: any = { employee_id, date, status };
    if (status === "present" || status === "late") {
      body.time_in = time;
    }
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    loadData();
  };

  const addShiftAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/employee-shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        employee_id: parseInt(shiftForm.employee_id),
        shift_id: parseInt(shiftForm.shift_id),
        start_date: shiftForm.start_date,
        end_date: shiftForm.end_date || undefined,
      }),
    });
    if (res.ok) {
      setShiftForm({ employee_id: "", shift_id: "", start_date: "", end_date: "" });
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to assign shift");
    }
  };

  const existingIds = new Set(records.map((r: any) => r.employee_id));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Attendance</h4>
        <div>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold">Today's Attendance</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Status</th>
                <th>Remarks</th>
                <th style={{width: "300px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No attendance records for this date</td></tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.employee_name}</td>
                    <td>{r.time_in || "-"}</td>
                    <td>{r.time_out || "-"}</td>
                    <td>
                      <span className={`badge bg-${r.status === "present" ? "success" : r.status === "late" ? "warning" : r.status === "half-day" ? "info" : r.status === "leave" ? "primary" : "danger"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-muted small">{r.remarks || "-"}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-success" onClick={() => markAttendance(r.employee_id, "present")}>Present</button>
                        <button className="btn btn-warning" onClick={() => markAttendance(r.employee_id, "late")}>Late</button>
                        <button className="btn btn-info text-white" onClick={() => markAttendance(r.employee_id, "half-day")}>Half Day</button>
                        <button className="btn btn-danger" onClick={() => markAttendance(r.employee_id, "absent")}>Absent</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header fw-semibold">Quick Mark Attendance</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th style={{width: "400px"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter((e: any) => !existingIds.has(e.id) && e.is_active).map((emp: any) => (
                <tr key={emp.id}>
                  <td>{emp.first_name} {emp.last_name} ({emp.code})</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-success" onClick={() => markAttendance(emp.id, "present")}>Present</button>
                      <button className="btn btn-outline-warning" onClick={() => markAttendance(emp.id, "late")}>Late</button>
                      <button className="btn btn-outline-info" onClick={() => markAttendance(emp.id, "half-day")}>Half Day</button>
                      <button className="btn btn-outline-danger" onClick={() => markAttendance(emp.id, "absent")}>Absent</button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.filter((e: any) => !existingIds.has(e.id) && e.is_active).length === 0 && (
                <tr><td colSpan={2} className="text-center text-muted py-3">All employees marked for today</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
          <span>Shift Assignments</span>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Shift</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {employeeShifts.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-muted py-3">No shift assignments</td></tr>
              ) : (
                employeeShifts.map((es: any) => (
                  <tr key={es.id}>
                    <td>{es.employee_name}</td>
                    <td>{es.shift_name}</td>
                    <td>{es.start_date}</td>
                    <td>{es.end_date || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="card-body border-top">
          <form onSubmit={addShiftAssignment} className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Employee</label>
              <select className="form-control" value={shiftForm.employee_id} onChange={(e) => setShiftForm({ ...shiftForm, employee_id: e.target.value })} required>
                <option value="">Select Employee</option>
                {employees.filter((e: any) => e.is_active).map((e: any) => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.code})</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Shift</label>
              <select className="form-control" value={shiftForm.shift_id} onChange={(e) => setShiftForm({ ...shiftForm, shift_id: e.target.value })} required>
                <option value="">Select Shift</option>
                {shifts.filter((s: any) => s.is_active !== false).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Start Date</label>
              <input type="date" className="form-control" value={shiftForm.start_date} onChange={(e) => setShiftForm({ ...shiftForm, start_date: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">End Date</label>
              <input type="date" className="form-control" value={shiftForm.end_date} onChange={(e) => setShiftForm({ ...shiftForm, end_date: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100"><i className="bi bi-plus-lg me-1"></i>Assign</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
