"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { GemPage, GemHeader, GemCard, GemCardBare, GemBtn, GemBtnOutline, GemTable, GemBadge, GemInput, GemAlert } from "@/lib/gem-ui";
import { Building, ArrowLeft, LogOut, Users, UserCheck, User, Clock, Calendar } from "lucide-react";

export default function AttendancePage() {
  const [activeCheckins, setActiveCheckins] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardUid, setCardUid] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "danger" | "info">("info");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const cardInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<any>(null);

  const showMessage = (msg: string, type: "success" | "danger" | "info" = "info") => {
    setMessage(msg); setMessageType(type); setTimeout(() => setMessage(""), 5000);
  };

  const loadToday = async () => {
    if (!token) return;
    try {
      const r = await fetch(`/api/membership/attendance?date=${date}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.ok) { setActiveCheckins(d.data.activeCheckins || []); setTodayStats(d.data.stats); setHourlyData(d.data.hourly || []); }
    } catch {}
    setLoading(false);
  };

  const loadHistory = async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const r = await fetch(`/api/membership/attendance/history?from=${historyDate}&to=${historyDate}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.ok) setHistory(d.data || []);
    } catch {}
    setHistoryLoading(false);
  };

  useEffect(() => { loadToday(); pollRef.current = setInterval(loadToday, 5000); return () => clearInterval(pollRef.current); }, [date]);
  useEffect(() => { if (historyDate) loadHistory(); }, [historyDate]);

  const handleCheckIn = async () => {
    if (!cardUid && !memberCode) { showMessage("Scan an RFID card or enter member code", "danger"); return; }
    if (!token) return;
    try {
      const body: any = {};
      if (cardUid) body.card_uid = cardUid;
      if (memberCode) body.member_id = memberCode;
      const r = await fetch("/api/membership/attendance/check-in", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.ok) {
        if (d.data.checked_in) {
          if (d.data.already_checked_in) showMessage(`${d.data.member?.name || "Member"} is already checked in`, "info");
          else showMessage(`${d.data.member?.name || "Member"} checked in successfully!`, "success");
        } else showMessage(`Check-in failed: ${d.data.reason || "Unknown"}`, "danger");
      }
    } catch { showMessage("Check-in request failed", "danger"); }
    setCardUid(""); setMemberCode(""); cardInputRef.current?.focus(); loadToday(); loadHistory();
  };

  const handleCheckOut = async (memberId: number) => {
    if (!token) return;
    try {
      const r = await fetch("/api/membership/attendance/check-out", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ member_id: memberId }) });
      const d = await r.json();
      if (d.ok && d.data.checked_out) showMessage("Member checked out", "success");
      else showMessage("Check-out failed", "danger");
    } catch { showMessage("Check-out request failed", "danger"); }
    loadToday(); loadHistory();
  };

  return (
    <GemPage>
      <GemHeader
        title="Gym Attendance"
        subtitle="RFID card check-in / check-out tracking"
        actions={<Link href="/dashboard/membership" className="text-inherit"><GemBtnOutline><ArrowLeft size={16} />Back</GemBtnOutline></Link>}
      />

      {message && <GemAlert type={messageType} onClose={() => setMessage("")}>{message}</GemAlert>}

      <GemCard className="mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Building size={18} />Quick Check-In</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-gray-500 font-medium mb-1 block">Scan RFID Card</label>
            <GemInput ref={cardInputRef} placeholder="Scan or type card UID..." value={cardUid} onChange={e => setCardUid(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCheckIn()} autoFocus />
          </div>
          <span className="text-sm text-gray-400 font-semibold pb-2">OR</span>
          <div className="w-44">
            <label className="text-sm text-gray-500 font-medium mb-1 block">Member Code</label>
            <GemInput placeholder="MEM-xxxxx" value={memberCode} onChange={e => setMemberCode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCheckIn()} />
          </div>
          <GemBtn onClick={handleCheckIn}><LogOut size={16} className="rotate-180" />Check In</GemBtn>
          <GemBtnOutline onClick={() => { setCardUid(""); setMemberCode(""); cardInputRef.current?.focus(); }}>Clear</GemBtnOutline>
        </div>
      </GemCard>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { title: "Today Total", value: todayStats?.total || 0, icon: <Users size={22} />, color: "bg-blue-500" },
              { title: "Currently Active", value: todayStats?.active || 0, icon: <UserCheck size={22} />, color: "bg-emerald-600" },
              { title: "Completed", value: todayStats?.completed || 0, icon: <User size={22} />, color: "bg-purple-500" },
              { title: "Date", value: new Date(date).toLocaleDateString(), icon: <Calendar size={22} />, color: "bg-gray-500" },
            ].map(card => (
              <GemCard key={card.title} className={card.title === "Currently Active" ? "border-l-4 border-l-emerald-500" : ""}>
                <div className="flex items-center gap-4">
                  <div className={`${card.color} text-white p-3 rounded-2xl`}>{card.icon}</div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-gray-500 font-medium uppercase">{card.title}</p>
                  </div>
                </div>
              </GemCard>
            ))}
          </div>

          {hourlyData.length > 0 && (
            <GemCard className="mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} />Check-ins by Hour</h3>
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {hourlyData.map((h: any) => {
                  const maxCount = Math.max(...hourlyData.map((x: any) => parseInt(x.count)), 1);
                  const height = (parseInt(h.count) / maxCount) * 100;
                  return (
                    <div key={h.hour} className="flex flex-col items-center flex-1">
                      <span className="text-[10px] font-bold text-gray-400 mb-1">{h.count}</span>
                      <div className="w-full rounded-t bg-black" style={{ height: `${height}%`, minHeight: 4 }}></div>
                      <span className="text-[10px] text-gray-400 mt-1">{String(h.hour).padStart(2, "0")}:00</span>
                    </div>
                  );
                })}
              </div>
            </GemCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GemCardBare>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold">Currently Checked In</h3>
                  <GemBadge variant="success">{activeCheckins.length}</GemBadge>
                </div>
                {activeCheckins.length === 0 ? (
                  <div className="text-center text-gray-400 py-8"><UserCheck size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No members currently checked in</p></div>
                ) : (
                  <div className="space-y-2">
                    {activeCheckins.map((c: any) => {
                      const duration = Math.floor((Date.now() - new Date(c.check_in_at).getTime()) / 60000);
                      return (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"><User size={14} /></div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{c.member_name}</p>
                              <p className="font-mono text-[10px] text-gray-400">{c.member_code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <GemBadge variant="info">{c.plan_name || "N/A"}</GemBadge>
                              <p className="text-xs text-gray-400 mt-1">{new Date(c.check_in_at).toLocaleTimeString()}</p>
                              <p className="text-xs font-semibold">{duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`}</p>
                            </div>
                            <button className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all" onClick={() => handleCheckOut(c.member_id)} title="Check out">
                              <LogOut size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </GemCardBare>

            <GemCardBare>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Clock size={18} />Today&apos;s History</h3>
                  <GemInput type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} className="w-40 text-xs" />
                </div>
                {historyLoading ? (
                  <div className="flex justify-center py-4"><div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" /></div>
                ) : history.length === 0 ? (
                  <div className="text-center text-gray-400 py-8"><Clock size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No check-in records for this date</p></div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <GemTable
                      headers={["Member", "Check In", "Check Out", "Status"]}
                      rows={history.map((h: any) => [
                        <div><p className="font-medium text-sm">{h.member_name}</p><p className="font-mono text-[10px] text-gray-400">{h.member_code}</p></div>,
                        <span className="text-sm">{new Date(h.check_in_at).toLocaleTimeString()}</span>,
                        <span className="text-sm">{h.check_out_at ? new Date(h.check_out_at).toLocaleTimeString() : "-"}</span>,
                        h.status === "checked_in" ? <GemBadge variant="success">Active</GemBadge> : <GemBadge>Done</GemBadge>,
                      ])}
                    />
                  </div>
                )}
              </div>
            </GemCardBare>
          </div>
        </>
      )}
    </GemPage>
  );
}
