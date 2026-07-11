"use client";
import { useEffect, useState } from "react";
import { GemPage, GemHeader, GemCard, GemCardBare, GemBtn, GemTable, GemBadge, GemInput, GemSelect } from "@/lib/gem-ui";
import { CreditCard, Plus, X, Save } from "lucide-react";

export default function MembershipPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ member_id: "", amount: "", payment_method: "cash", reference: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [payRes, memRes] = await Promise.all([
        fetch("/api/membership/payments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/membership/members", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const payData = await payRes.json();
      const memData = await memRes.json();
      if (Array.isArray(payData)) setPayments(payData);
      if (Array.isArray(memData)) setMembers(memData);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch("/api/membership/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, member_id: parseInt(form.member_id), amount: parseFloat(form.amount) }),
      });
      if (res.ok) { setShowForm(false); setForm({ member_id: "", amount: "", payment_method: "cash", reference: "", notes: "" }); load(); }
      else { const err = await res.json(); alert(err.error); }
    } catch { alert("Server error"); }
    setSaving(false);
  };

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <GemPage>
      <GemHeader
        title="Membership Payments"
        subtitle={`Track membership fee collections — Total: ETB ${totalRevenue.toLocaleString()}`}
        actions={
          <GemBtn onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}{showForm ? "Cancel" : "Record Payment"}
          </GemBtn>
        }
      />

      {showForm && (
        <GemCard className="mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><CreditCard size={18} />Record Payment</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-gray-500 font-medium mb-1 block">Member <span className="text-red-500">*</span></label>
              <GemSelect required value={form.member_id} onChange={(e: any) => setForm({...form, member_id: e.target.value})}>
                <option value="">Select Member</option>
                {members.filter(m => m.status === "active").map(m => (
                  <option key={m.id} value={m.id}>{m.full_name} — {m.plan_name}</option>
                ))}
              </GemSelect>
            </div>
            <div>
              <label className="text-sm text-gray-500 font-medium mb-1 block">Amount (ETB) <span className="text-red-500">*</span></label>
              <GemInput type="number" required value={form.amount} onChange={(e: any) => setForm({...form, amount: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-500 font-medium mb-1 block">Method</label>
              <GemSelect value={form.payment_method} onChange={(e: any) => setForm({...form, payment_method: e.target.value})}>
                <option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="telebirr">Telebirr</option>
                <option value="cbebirr">CBE Birr</option><option value="chapa">Chapa</option><option value="addispay">AddisPay</option><option value="credit_card">Credit Card</option>
              </GemSelect>
            </div>
            <div>
              <label className="text-sm text-gray-500 font-medium mb-1 block">Reference</label>
              <GemInput type="text" value={form.reference} onChange={(e: any) => setForm({...form, reference: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-500 font-medium mb-1 block">Date</label>
              <GemInput type="date" value={form.payment_date || new Date().toISOString().split("T")[0]} onChange={(e: any) => setForm({...form, payment_date: e.target.value})} />
            </div>
            <div className="md:col-span-5">
              <label className="text-sm text-gray-500 font-medium mb-1 block">Notes</label>
              <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all" rows={2} value={form.notes} onChange={(e: any) => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="md:col-span-5">
              <GemBtn type="submit" disabled={saving}>
                <Save size={16} />{saving ? "Saving..." : "Record Payment"}
              </GemBtn>
            </div>
          </form>
        </GemCard>
      )}

      <GemCardBare>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" /></div>
        ) : payments.length === 0 ? (
          <div className="text-center text-gray-400 py-8"><CreditCard size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No payments recorded</p></div>
        ) : (
          <div className="overflow-x-auto p-6">
            <GemTable
              headers={["Member", "Plan", "Amount", "Method", "Reference", "Date"]}
              rows={payments.map(p => [
                <span className="font-semibold">{p.member_name}</span>,
                <GemBadge variant="info">{p.plan_name}</GemBadge>,
                <span className="font-bold">ETB {Number(p.amount).toLocaleString()}</span>,
                <GemBadge>{p.payment_method}</GemBadge>,
                <span className="text-sm text-gray-400">{p.reference || "-"}</span>,
                <span className="text-sm">{new Date(p.payment_date).toLocaleDateString()}</span>,
              ])}
            />
          </div>
        )}
      </GemCardBare>
    </GemPage>
  );
}
