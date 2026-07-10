"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { GemPage, GemHeader, GemCardBare } from "@/lib/gem-ui";
import { ShieldCheck, CreditCard, AlertTriangle, XOctagon, Activity, DoorOpen, ArrowRight, ArrowLeft, CheckCircle, XCircle, Wifi, WifiOff, RefreshCw, SlidersHorizontal, Monitor } from "lucide-react";

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

export default function AccessControlPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [doorMsg, setDoorMsg] = useState("");
  const lastEventIdRef = useRef("0");
  const [gates, setGates] = useState<any[]>([]);
  const [selectedGateId, setSelectedGateId] = useState<string>("");
  const [selectedGate, setSelectedGate] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const pollRef = useRef<any>(null);
  const pingRef = useRef<any>(null);
  const [showLimit, setShowLimit] = useState(50);
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");

  const cellPad = density === "compact" ? "py-2 px-3" : "py-3.5 px-4";
  const textSize = density === "compact" ? "text-[11px]" : "text-xs";

  const getControllerIp = () => selectedGate?.ip_address || "192.168.0.68";

  const controllerCmd = async () => {
    try { await fetch("/api/parking/access/relay", { method: "POST", body: JSON.stringify({ action: "open" }) }); } catch {}
  };

  const loadGates = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/membership/parking/gates", { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setGates(list);
      const stored = localStorage.getItem("selectedGateId");
      const found = stored ? list.find((g: any) => g.id == stored) : null;
      const initial = found || list.find((g: any) => g.is_rfid_enabled) || list[0];
      if (initial) { setSelectedGateId(String(initial.id)); setSelectedGate(initial); localStorage.setItem("selectedGateId", String(initial.id)); }
    } catch {}
  };

  const handleGateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedGateId(id);
    setSelectedGate(gates.find(g => g.id == id) || null);
    localStorage.setItem("selectedGateId", id);
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
      const enriched = (Array.isArray(cardData) ? cardData : cardData.data || []).map((c: any) => {
        const sub = subs.find((s: any) => s.customer_id === c.member_id && ["active", "pending"].includes(s.status) && s.start_date <= today && s.end_date >= today);
        const days = sub ? Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / 86400000)) : 0;
        return { ...c, subscription: sub, days_remaining: days };
      });
      setCards(enriched);
    } catch {}
    setLoading(false);
  };

  const ping = useCallback(async () => {
    try { const r = await fetch("/api/parking/access?action=ping"); const d = await r.json(); setConnected(d.ok); } catch { setConnected(false); }
  }, []);

  const storeSwipe = async (swipe: any, lookupResult: any) => {
    try {
      const gateDirection = selectedGate?.direction || swipe.direction || null;
      const direction = gateDirection === "both" ? swipe.direction || "in" : gateDirection;
      await fetch("/api/parking/access/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_uid: swipe.card, member_id: lookupResult?.member?.id || null, member_name: lookupResult?.member?.name || swipe.name || null,
          direction, event_type: "SWIPE", controller_id: selectedGateId || null,
          granted: lookupResult?.granted || false, reason: lookupResult?.granted ? "ACCESS_GRANTED" : (lookupResult?.reason || "UNKNOWN"),
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
            const gateDir = selectedGate?.direction || "";
            const dir = gateDir === "both" ? (ev.Direction || "in") : gateDir;
            const newSwipe: any = {
              card: ev.Card, name: ev.Name || "", direction: dir, note: ev.Note || ev.Event || "",
              time: ev.Time || new Date().toLocaleString(), lookup: null, granted: false,
            };
            if (ev.Card) {
              const lookup = await lookupCard(ev.Card);
              newSwipe.lookup = lookup;
              if (lookup?.granted) { newSwipe.granted = true; controllerCmd(); setDoorMsg(`Door opened for ${lookup.member?.name || ev.Card}`); }
              else { setDoorMsg(`${lookup ? "Access DENIED" : "Lookup FAILED"} for ${ev.Card}: ${lookup?.reason || lookup?.message || "Unknown"}`); }
            }
            storeSwipe(newSwipe, newSwipe.lookup);
            setActivities(prev => [newSwipe, ...prev].slice(0, 200));
          }
        }
      }
    } catch {}
  }, [selectedGateId, selectedGate]);

  const openDoor = async () => {
    try { const r = await fetch("/api/parking/access/relay", { method: "POST", body: JSON.stringify({ action: "open" }) }); const d = await r.json(); if (d.success) { setDoorMsg("Door command sent!"); return; } } catch {}
    setDoorMsg("Door command sent!");
    setTimeout(() => setDoorMsg(""), 3000);
  };

  useEffect(() => { loadGates(); loadCards(); ping(); pingRef.current = setInterval(ping, 10000); return () => { clearInterval(pingRef.current); if (pollRef.current) clearInterval(pollRef.current); }; }, []);
  useEffect(() => { if (pollRef.current) clearInterval(pollRef.current); pollRef.current = setInterval(pollEvent, 1500); return () => clearInterval(pollRef.current); }, [pollEvent]);

  const expiredCards = cards.filter(c => c.days_remaining === 0);
  const validCards = cards.filter(c => c.days_remaining > 0);
  const expiringSoon = cards.filter(c => c.days_remaining > 0 && c.days_remaining <= 7);
  const allCards = cards.length || 1;

  const visibleActivities = activities.slice(0, showLimit);

  return (
    <GemPage>
      <GemHeader
        title="Access Control"
        subtitle="Real-time RFID door monitoring"
        actions={
          <div className="flex items-center gap-3">
            <a href="/en/access-control" target="_blank"
              className="border border-gray-300 px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100 transition-all inline-flex items-center gap-2">
              <Monitor size={15} /> Desktop App
            </a>
            <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" style={{ minWidth: 180 }}
              value={selectedGateId} onChange={handleGateChange}>
              {gates.map(g => <option key={g.id} value={g.id}>{g.name} ({g.ip_address || "no IP"})</option>)}
            </select>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? "Online" : "Offline"}
            </div>
            <button onClick={openDoor} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-[0.97] inline-flex items-center gap-2 shadow-sm shadow-emerald-200">
              <DoorOpen size={16} /> Open Door
            </button>
            <button className="border border-gray-200 p-2.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95" onClick={() => { setLoading(true); loadCards(); ping(); }}>
              <RefreshCw size={16} className="text-gray-600" />
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          value={selectedGateId} onChange={handleGateChange} style={{ minWidth: 160 }}>
          {gates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <button className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all ${density === "compact" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200"}`}
          onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")}>
          <SlidersHorizontal size={13} className="inline mr-1" />{density === "compact" ? "Compact" : "Comfortable"}
        </button>
      </div>

      {doorMsg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border mb-6 text-sm font-medium ${doorMsg.includes("DENIED") || doorMsg.includes("FAILED") || doorMsg.includes("Failed") ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}>
          {doorMsg.includes("DENIED") || doorMsg.includes("FAILED") || doorMsg.includes("Failed") ? <XCircle size={16} /> : <CheckCircle size={16} />}
          <span className="flex-1">{doorMsg}</span>
          <button onClick={() => setDoorMsg("")} className="text-current opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}

      {!connected && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-amber-50 text-amber-800 border-amber-200 mb-6 text-sm font-medium">
          <WifiOff size={16} />
          <span>Controller at <strong>{getControllerIp()}</strong> not reachable</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {[
          { title: "Active Cards", value: cards.length, max: allCards, icon: CreditCard, color: "blue", bg: "from-blue-500 to-blue-600" },
          { title: "Valid Subs", value: validCards.length, max: allCards, icon: ShieldCheck, color: "emerald", bg: "from-emerald-500 to-emerald-600" },
          { title: "Expiring Soon", value: expiringSoon.length, max: allCards, icon: AlertTriangle, color: "amber", bg: "from-amber-500 to-amber-600" },
          { title: "Expired / No Sub", value: expiredCards.length, max: allCards, icon: XOctagon, color: "red", bg: "from-red-500 to-red-600" },
        ].map(card => (
          <div key={card.title} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{card.title}</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h2>
                <MiniSpark value={card.value} max={card.max} color={`bg-${card.color}-500`} />
              </div>
              <div className={`bg-gradient-to-br ${card.bg} text-white p-3.5 rounded-2xl`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <GemCardBare>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-gray-700" />
            <span className="font-semibold text-base">Live Event</span>
            <span className="text-xs text-gray-400 font-medium ml-1">({activities.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${activities.length > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              <span className={`w-2 h-2 rounded-full ${activities.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
              {activities.length > 0 ? "LIVE" : "WAITING"}
            </span>
          </div>
        </div>
        {activities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard size={40} className="mx-auto mb-4 opacity-40" />
            <p className="text-sm font-medium">Waiting for card swipe...</p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto" style={{ maxHeight: density === "compact" ? 800 : 620 }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-white">
                    {["Time", "Name", "Plan", "Remaining", "Card", "Direction", "Event"].map(h => (
                      <th key={h} className={`text-left ${textSize} text-gray-500 font-semibold uppercase tracking-wider ${cellPad} border-b border-gray-100`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleActivities.map((a, i) => {
                    const lookup = a.lookup;
                    const memberName = lookup?.member?.name || a.member_name || a.name || null;
                    const daysLeft = a.days_remaining ?? lookup?.days_remaining ?? null;
                    const planName = lookup?.subscription?.plan_name || a.plan_name || null;
                    const eventText = a.granted ? "Access granted" : (!memberName && a.card ? "Card not registered" : a.note || "Access denied");
                    return (
                      <tr key={i} className={`border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${a.granted ? "bg-emerald-50/20 border-l-[3px] border-l-emerald-500" : "bg-red-50/20 border-l-[3px] border-l-red-400"}`}>
                        <td className={cellPad}><span className={`${textSize} text-gray-400 font-mono tabular-nums`}>{a.time}</span></td>
                        <td className={cellPad}>
                          {memberName ? (
                            <span className={`font-semibold ${density === "compact" ? "text-xs" : "text-sm"} text-gray-800`}>{memberName}</span>
                          ) : (
                            <span className={`text-gray-400 italic ${density === "compact" ? "text-xs" : "text-sm"}`}>Unknown</span>
                          )}
                        </td>
                        <td className={cellPad}>
                          {planName ? (
                            <span className={`${textSize} font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block max-w-[130px] truncate`}>{planName}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className={cellPad}>
                          {daysLeft !== null ? (
                            <span className={`${textSize} font-bold ${daysLeft > 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className={cellPad}><code className={`${textSize} bg-gray-50 px-2.5 py-1 rounded-md font-mono text-blue-600`}>{a.card}</code></td>
                        <td className={cellPad}>
                          {a.direction ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${textSize} font-bold ${a.direction === "IN" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                              {a.direction === "IN" ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
                              {a.direction}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className={cellPad}>
                          <span className={`inline-flex items-center gap-1.5 ${textSize} font-semibold ${a.granted ? "text-emerald-600" : "text-red-500"}`}>
                            {a.granted ? <CheckCircle size={13} /> : <XCircle size={13} />}
                            {eventText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {activities.length > showLimit && (
              <div className="flex justify-center py-3 border-t border-gray-100">
                <button className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors px-4 py-2 rounded-xl hover:bg-gray-50"
                  onClick={() => setShowLimit(prev => prev + 50)}>
                  Show more ({activities.length - showLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </GemCardBare>
    </GemPage>
  );
}
