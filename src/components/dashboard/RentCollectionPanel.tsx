import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Banknote, Loader2, Plus, X, CheckCircle2, AlertCircle,
  Clock, TrendingUp, Calendar, Send, Sparkles,
} from "lucide-react";

type Collection = {
  id: string;
  property_address: string;
  tenant_name: string;
  tenant_email: string;
  monthly_rent: number;
  frequency: string;
  collection_day: number;
  start_date: string;
  payment_method: string;
  status: string;
  next_payment_date: string | null;
  total_collected: number;
  arrears_amount: number;
};

type Payment = {
  id: string;
  due_date: string;
  amount: number;
  status: string;
  paid_at: string | null;
  late_days: number | null;
  chase_count: number | null;
};

interface Props { listingId?: string; defaultAddress?: string; }

export default function RentCollectionPanel({ listingId, defaultAddress }: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment[]>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    property_address: defaultAddress || "",
    tenant_name: "", tenant_email: "",
    monthly_rent: "", frequency: "monthly",
    collection_day: "1", start_date: "",
    payment_method: "standing_order",
  });

  const load = async () => {
    let q = supabase.from("rent_collections").select("*").order("created_at", { ascending: false });
    if (listingId) q = q.eq("listing_id", listingId);
    const { data } = await q;
    const list = (data as any) || [];
    setCollections(list);
    if (list.length) {
      const ids = list.map((c: Collection) => c.id);
      const { data: pays } = await supabase.from("rent_payments")
        .select("*").in("collection_id", ids).order("due_date", { ascending: true });
      const grouped: Record<string, Payment[]> = {};
      (pays as any || []).forEach((p: any) => {
        (grouped[p.collection_id] ||= []).push(p);
      });
      setPayments(grouped);
    }
  };

  useEffect(() => { load(); }, [listingId]);

  const generateSchedule = (collectionId: string, landlord_id: string, rent: number, start: string, day: number, freq: string) => {
    const out: any[] = [];
    const startDate = new Date(start);
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate);
      if (freq === "monthly") {
        d.setMonth(startDate.getMonth() + i);
        d.setDate(day);
      } else {
        d.setDate(startDate.getDate() + i * 7);
      }
      out.push({
        collection_id: collectionId,
        landlord_user_id: landlord_id,
        due_date: d.toISOString().slice(0, 10),
        amount: rent,
        status: "scheduled",
      });
    }
    return out;
  };

  const create = async () => {
    if (!form.property_address || !form.tenant_name || !form.tenant_email || !form.monthly_rent || !form.start_date) {
      toast.error("Fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const rent = parseInt(form.monthly_rent);
      const day = parseInt(form.collection_day);
      const startDate = new Date(form.start_date);
      const next = new Date(startDate);
      next.setDate(day);
      if (next < startDate) next.setMonth(next.getMonth() + 1);

      const { data: col, error } = await supabase.from("rent_collections").insert({
        landlord_user_id: user.id,
        listing_id: listingId,
        property_address: form.property_address,
        tenant_name: form.tenant_name,
        tenant_email: form.tenant_email,
        monthly_rent: rent,
        frequency: form.frequency,
        collection_day: day,
        start_date: form.start_date,
        payment_method: form.payment_method,
        next_payment_date: next.toISOString().slice(0, 10),
      }).select().single();
      if (error) throw error;

      const sched = generateSchedule(col.id, user.id, rent, form.start_date, day, form.frequency);
      await supabase.from("rent_payments").insert(sched);

      toast.success("Rent collection set up — schedule created");
      setOpen(false);
      setForm({ ...form, tenant_name: "", tenant_email: "", monthly_rent: "", start_date: "" });
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to set up");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (paymentId: string, amount: number) => {
    await supabase.from("rent_payments").update({
      status: "paid", paid_at: new Date().toISOString(), paid_amount: amount,
    }).eq("id", paymentId);
    toast.success("Payment marked as received");
    load();
  };

  const sendChase = async (paymentId: string, current: number) => {
    await supabase.from("rent_payments").update({
      chase_count: current + 1, last_chased_at: new Date().toISOString(),
    }).eq("id", paymentId);
    toast.success("AI chasing message queued to tenant");
    load();
  };

  // KPIs
  const allPayments = Object.values(payments).flat();
  const totalDue = allPayments.filter(p => p.status === "scheduled").reduce((s, p) => s + p.amount, 0);
  const totalCollected = collections.reduce((s, c) => s + (c.total_collected || 0), 0)
    + allPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const arrears = allPayments.filter(p => {
    const due = new Date(p.due_date);
    return p.status === "scheduled" && due < new Date();
  }).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-card/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Banknote size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-lg">Automated Rent Collection</h3>
            <p className="text-xs text-muted-foreground">Standing orders · Auto-chase · Cash flow forecast</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-background gap-2">
          <Plus size={14} /> Set Up Collection
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Kpi label="Collected (12mo)" value={`£${totalCollected.toLocaleString()}`} icon={CheckCircle2} tone="good" />
        <Kpi label="Forecast Inflow" value={`£${totalDue.toLocaleString()}`} icon={TrendingUp} tone="info" />
        <Kpi label="Arrears" value={`£${arrears.toLocaleString()}`} icon={AlertCircle} tone={arrears > 0 ? "bad" : "muted"} />
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
          <Banknote size={28} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No active rent collections</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Set one up after tenancy is signed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((c) => {
            const pays = payments[c.id] || [];
            const next = pays.find(p => p.status === "scheduled");
            const recent = pays.slice(0, 4);
            return (
              <div key={c.id} className="rounded-xl border border-border/50 bg-background/40 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.tenant_name} · {c.property_address}</p>
                    <p className="text-xs text-muted-foreground">£{c.monthly_rent}/{c.frequency === "monthly" ? "mo" : "wk"} · {c.payment_method.replace("_", " ")}</p>
                  </div>
                  {next && (
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground">Next</div>
                      <div className="text-xs font-semibold">{next.due_date}</div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {recent.map((p) => {
                    const overdue = p.status === "scheduled" && new Date(p.due_date) < new Date();
                    return (
                      <div key={p.id} className={`p-2 rounded-lg border text-center ${
                        p.status === "paid" ? "border-emerald-500/30 bg-emerald-500/5"
                        : overdue ? "border-red-500/30 bg-red-500/5"
                        : "border-border/40 bg-background/40"
                      }`}>
                        <div className="text-[10px] text-muted-foreground">{p.due_date.slice(5)}</div>
                        <div className="text-xs font-bold mt-0.5">£{p.amount}</div>
                        {p.status === "paid" ? (
                          <CheckCircle2 size={11} className="mx-auto mt-1 text-emerald-400" />
                        ) : overdue ? (
                          <div className="flex gap-1 justify-center mt-1">
                            <button onClick={() => markPaid(p.id, p.amount)} className="text-[9px] text-emerald-400 hover:underline">Paid</button>
                            <button onClick={() => sendChase(p.id, p.chase_count || 0)} className="text-[9px] text-red-400 hover:underline">Chase</button>
                          </div>
                        ) : (
                          <Clock size={11} className="mx-auto mt-1 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => !saving && setOpen(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black flex items-center gap-2"><Banknote size={20} className="text-emerald-400" /> Set Up Rent Collection</h3>
              <button onClick={() => setOpen(false)} disabled={saving}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><F label="Property *" value={form.property_address} onChange={(v) => setForm({ ...form, property_address: v })} /></div>
              <F label="Tenant Name *" value={form.tenant_name} onChange={(v) => setForm({ ...form, tenant_name: v })} />
              <F label="Tenant Email *" type="email" value={form.tenant_email} onChange={(v) => setForm({ ...form, tenant_email: v })} />
              <F label="Monthly Rent (£) *" type="number" value={form.monthly_rent} onChange={(v) => setForm({ ...form, monthly_rent: v })} />
              <div>
                <Label className="text-xs">Frequency</Label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="mt-1 w-full h-10 rounded-md bg-background border border-input px-3 text-sm">
                  <option value="monthly">Monthly</option><option value="weekly">Weekly</option>
                </select>
              </div>
              <F label="Collection Day" type="number" value={form.collection_day} onChange={(v) => setForm({ ...form, collection_day: v })} />
              <F label="Start Date *" type="date" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} />
              <div className="col-span-2">
                <Label className="text-xs">Payment Method</Label>
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="mt-1 w-full h-10 rounded-md bg-background border border-input px-3 text-sm">
                  <option value="standing_order">Standing Order</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="direct_debit">Direct Debit</option>
                </select>
              </div>
            </div>
            <Button onClick={create} disabled={saving} className="w-full mt-5 bg-emerald-500 hover:bg-emerald-600 text-background gap-2">
              {saving ? (<><Loader2 size={16} className="animate-spin" /> Setting up…</>) : (<><Sparkles size={16} /> Activate Collection</>)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: "good" | "bad" | "info" | "muted" }) {
  const c = tone === "good" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
    : tone === "bad" ? "text-red-400 border-red-500/30 bg-red-500/5"
    : tone === "info" ? "text-primary border-primary/30 bg-primary/5"
    : "text-muted-foreground border-border/40 bg-background/40";
  return (
    <div className={`rounded-xl border p-3 ${c}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-80">
        <span>{label}</span><Icon size={12} />
      </div>
      <div className="text-lg font-black mt-1">{value}</div>
    </div>
  );
}