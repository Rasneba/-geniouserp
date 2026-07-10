"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ShieldCheck, CreditCard, AlertTriangle, XOctagon, Activity,
  ArrowRight, ArrowLeft, CheckCircle, XCircle, Wifi, WifiOff,
  RefreshCw, Maximize2, Minimize2, Monitor, DoorOpen
} from "lucide-react";

function MiniSpark({ value, max, color }: { value: number; max: number; color: string }) {
  const bars = 5;
  const heights = Array.from({ length: bars }, (_, i) => {
    const base = Math.round((value / max) * 12);
    return Math.max(2, base + Math.floor(Math.sin(i * 1.2) * 3));
  });
  return (
    <div className="flex items-end gap-[2px] h-3 mt-1.5">
      {heights.map((h, i) => (
        <div key={i} className={`w-[3px] rounded-sm ${color}`} style={{ height: h * 2, opacity: 0.4 + (i / bars) * 0.6 }} />
      ))}
    </div>
  );
}

export default function StandaloneAccessPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const lastEventIdRef = useRef("0");
  const [gates, setGates] = useState<any[]>([]);
  const [selectedGateId, setSelectedGateId] = useState<string>("");
  const [selectedGate, setSelectedGate] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const pollRef = useRef<any>(null);
  const pingRef = useRef<any>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showLimit, setShowLimit] = useState(100);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [doorMsg, setDoorMsg] = useState("");

  const cellPad = density === "compact" ? "py-2.5 px-3" : "py-3.5 px-4";

  const controllerCmd = async () => {
    try { await fetch("/api/parking/access/relay", { method: "POST", body: JSON.stringify({ action: "open" }) }); } catch {}
  };

  const openDoor = async () => {
    try { const r = await fetch("/api/parking/access/relay", { method: "POST", body: JSON.stringify({ action: "open" }) }); const d = await r.json(); if (d.success) { setDoorMsg("Door command sent!"); setTimeout(() => setDoorMsg(""), 3000); return; } } catch {}
    setDoorMsg("Door command sent!");
    setTimeout(() => setDoorMsg(""), 3000);
  };

  const loadGates = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/membership/parking/gates", { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setGates(list);
      const stored = localStorage.getItem("selectedGateStandalone");
      const found = stored ? list.find((g: any) => g.id == stored) : null;
      const initial = found || list.find((g: any) => g.is_rfid_enabled) || list[0];
      if (initial) { setSelectedGateId(String(initial.id)); setSelectedGate(initial); localStorage.setItem("selectedGateStandalone", String(initial.id)); }
    } catch {}
  };

  const handleGateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedGateId(id);
    setSelectedGate(gates.find(g => g.id == id) || null);
    localStorage.setItem("selectedGateStandalone", id);
    setConnected(false);
    lastEventIdRef.current = "0";
  };

  const loadCards = async () => {
    if (!token) return;
    try {
      const [cardRes, subRes] = await Promise.all([
        fetch("/api/membership/parking/rfid-cards?status=active", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/membership/parking/subscriptions", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const cardData = await cardRes.json();
      const subData = await subRes.json();
      const subs = Array.isArray(subData) ? subData : subData.data || [];
      const today = new Date().toISOString().split("T")[0];
      setCards((Array.isArray(cardData) ? cardData : cardData.data || []).map((c: any) => {
        const sub = subs.find((s: any) => s.customer_id === c.member_id && ["active", "pending"].includes(s.status) && s.start_date <= today && s.end_date >= today);
        return { ...c, subscription: sub, days_remaining: sub ? Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / 86400000)) : 0 };
      }));
    } catch {}
  };

  const ping = useCallback(async () => {
    try { const r = await fetch("/api/parking/access?action=ping"); const d = await r.json(); setConnected(d.ok); } catch { setConnected(false); }
  }, []);

  const storeSwipe = async (swipe: any, lookupResult: any) => {
    try {
      const dir = (selectedGate?.direction === "both" ? swipe.direction || "in" : selectedGate?.direction) || swipe.direction || null;
      await fetch("/api/parking/access/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_uid: swipe.card, member_id: lookupResult?.member?.id || null,
          member_name: lookupResult?.member?.name || swipe.name || null,
          direction: dir, event_type: "SWIPE", controller_id: selectedGateId || null,
          granted: lookupResult?.granted || false,
          reason: lookupResult?.granted ? "ACCESS_GRANTED" : (lookupResult?.reason || "UNKNOWN"),
          message: lookupResult?.message || null, days_remaining: lookupResult?.days_remaining ?? 0,
          plan_name: lookupResult?.subscription?.plan_name || null, subscription_id: lookupResult?.subscription?.id || null,
        }),
      });
    } catch {}
  };

  const lookupCard = async (cardUid: string) => {
    try {
      const tok = localStorage.getItem("token");
      if (!tok) return null;
      const r = await fetch("/api/membership/parking/rfid-card-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ card_uid: cardUid, gate_id: selectedGateId ? parseInt(selectedGateId) : undefined }),
      });
      return await r.json();
    } catch { return null; }
  };

  const pollEvent = useCallback(async () => {
    const id = lastEventIdRef.current;
    try {
      const r = await fetch(`/api/parking/access?action=event&ID=${id}`);
      const d = await r.json();
      if (d.ok && d.data) {
        const txt = d.data.replace(/>\s+</g, "><").replace(/\s+/g, " ");
        const m = txt.match(/<response>(.*?)<\/response>/);
        if (m) {
          const ev = JSON.parse(m[1].replace(/<!--.*?-->/g, "").trim());
          if (ev.ID && ev.ID !== lastEventIdRef.current) {
            lastEventIdRef.current = ev.ID;
            const dir = selectedGate?.direction === "both" ? (ev.Direction || "in") : (selectedGate?.direction || ev.Direction || "");
            const newSwipe: any = {
              card: ev.Card, name: ev.Name || "", direction: dir,
              note: ev.Note || ev.Event || "", time: ev.Time || new Date().toLocaleString(),
              lookup: null, granted: false,
            };
            if (ev.Card) {
              const lookup = await lookupCard(ev.Card);
              newSwipe.lookup = lookup;
              if (lookup?.granted) { newSwipe.granted = true; controllerCmd(); }
            }
            storeSwipe(newSwipe, newSwipe.lookup);
            setActivities(prev => [newSwipe, ...prev].slice(0, 500));
          }
        }
      }
    } catch {}
  }, [selectedGateId, selectedGate]);

  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); setFullscreen(true); }
      else { await document.exitFullscreen(); setFullscreen(false); }
    } catch { setFullscreen(!fullscreen); }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadGates();
      loadCards();
      ping();
    }, 0);
    pingRef.current = setInterval(ping, 10000);
    return () => {
      clearInterval(pingRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(pollEvent, 1500);
    return () => clearInterval(pollRef.current);
  }, [pollEvent]);

  const expired = cards.filter(c => c.days_remaining === 0);
  const valid = cards.filter(c => c.days_remaining > 0);
  const expiringSoon = cards.filter(c => c.days_remaining > 0 && c.days_remaining <= 7);
  const allCards = cards.length || 1;

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", color: "#fff", fontFamily: "'Inter','SF Pro',system-ui,sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Monitor size={18} className="text-emerald-400" />
            <span className="font-bold tracking-tight" style={{ fontSize: "1rem" }}>Access Control</span>
          </div>
          <select className="text-xs rounded-lg px-3 py-1.5" style={{ background: "rgba(255,255,255,0.08)", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)", minWidth: 140 }}
            value={selectedGateId} onChange={handleGateChange}>
            {gates.map(g => <option key={g.id} value={g.id} style={{ background: "#1a1d27" }}>{g.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openDoor} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm transition-all active:scale-[0.97]">
            <DoorOpen size={13} /> Open
          </button>
          {doorMsg && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 animate-pulse">
              {doorMsg}
            </span>
          )}
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${connected ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? "Online" : "Offline"}
          </div>
          <button onClick={toggleFs} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "#aaa", border: "1px solid rgba(255,255,255,0.1)" }}>
            {fullscreen ? <Minimize2 size={13} className="inline mr-1" /> : <Maximize2 size={13} className="inline mr-1" />}
            {fullscreen ? "Exit" : "Fullscreen"}
          </button>
          <button onClick={() => { loadCards(); ping(); }} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "#aaa", border: "1px solid rgba(255,255,255,0.1)" }}>
            <RefreshCw size={13} className="inline mr-1" />Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-5 py-4">
        {[
          { label: "Active Cards", value: cards.length, max: allCards, icon: CreditCard, color: "from-blue-500 to-blue-600" },
          { label: "Valid Subs", value: valid.length, max: allCards, icon: ShieldCheck, color: "from-emerald-500 to-emerald-600" },
          { label: "Expiring Soon", value: expiringSoon.length, max: allCards, icon: AlertTriangle, color: "from-amber-500 to-amber-600" },
          { label: "Expired", value: expired.length, max: allCards, icon: XOctagon, color: "from-red-500 to-red-600" },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
                <MiniSpark value={c.value} max={c.max} color="bg-emerald-400" />
              </div>
              <div className={`bg-gradient-to-br ${c.color} p-3 rounded-xl`}><c.icon size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Live table */}
      <div className="mx-5 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-emerald-400" />
            <span className="text-sm font-semibold">Live Event</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>({activities.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <button className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${density === "compact" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500"}`}
              onClick={() => setDensity("compact")}>Compact</button>
            <button className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${density === "comfortable" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500"}`}
              onClick={() => setDensity("comfortable")}>Comfortable</button>
            {activities.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>LIVE
              </span>
            )}
          </div>
        </div>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: "rgba(255,255,255,0.2)" }}>
            <CreditCard size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium">Waiting for card swipe...</p>
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr style={{ background: "#0f1117" }}>
                  {["Time", "Name", "Plan", "Left", "Card", "Dir", "Event"].map(h => (
                    <th key={h} className={`text-left font-semibold uppercase tracking-wider ${cellPad}`} style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activities.slice(0, showLimit).map((a, i) => {
                  const lk = a.lookup;
                  const name = lk?.member?.name || a.member_name || a.name || null;
                  const days = a.days_remaining ?? lk?.days_remaining ?? null;
                  const plan = lk?.subscription?.plan_name || a.plan_name || null;
                  const ev = a.granted ? "Access granted" : (!name && a.card ? "Card not registered" : a.note || "Access denied");
                  return (
                    <tr key={i} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className={cellPad}><span className="font-mono tabular-nums" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{a.time}</span></td>
                      <td className={cellPad}>
                        {name ? <span className="font-semibold text-sm text-white">{name}</span> : <span className="italic" style={{ color: "rgba(255,255,255,0.25)" }}>Unknown</span>}
                      </td>
                      <td className={cellPad}>
                        {plan ? <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>{plan}</span> : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                      </td>
                      <td className={cellPad}>
                        {days !== null ? (
                          <span className={`text-xs font-bold ${days > 0 ? "text-emerald-400" : "text-red-400"}`}>{days > 0 ? `${days}d` : "Expired"}</span>
                        ) : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                      </td>
                      <td className={cellPad}><code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#60a5fa" }}>{a.card}</code></td>
                      <td className={cellPad}>
                        {a.direction ? (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${a.direction === "IN" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                            {a.direction === "IN" ? <ArrowRight size={10} /> : <ArrowLeft size={10} />}{a.direction}
                          </span>
                        ) : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                      </td>
                      <td className={cellPad}>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${a.granted ? "text-emerald-400" : "text-red-400"}`}>
                          {a.granted ? <CheckCircle size={12} /> : <XCircle size={12} />}{ev}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {activities.length > showLimit && (
              <div className="flex justify-center py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button className="text-xs font-medium px-4 py-2 rounded-lg" style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)" }}
                  onClick={() => setShowLimit(p => p + 100)}>Show more ({activities.length - showLimit})</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-3 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
        Access Control v1 &middot; {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
