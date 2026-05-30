import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, ChevronDown, ChevronUp, Loader2, Check, X,
  MessageSquare, TrendingUp, BarChart3, Mail, Sparkles,
} from "lucide-react";

interface Offer {
  id: string;
  property_address: string;
  offer_amount: number;
  offered_by: string | null;
  offer_date: string | null;
  status: string;
  notes: string | null;
  counter_amount: number | null;
  created_at: string;
}

const fmt = (n: number) => `£${n.toLocaleString()}`;

function analyseOffer(offerAmount: number, estimatedValue: number | null): { label: string; color: string } {
  if (!estimatedValue || estimatedValue === 0) return { label: "Pending review", color: "text-muted-foreground" };
  const ratio = offerAmount / estimatedValue;
  if (ratio >= 0.98) return { label: "Strong offer", color: "text-emerald-400" };
  if (ratio >= 0.9) return { label: "Fair offer", color: "text-amber-400" };
  return { label: "Below market", color: "text-red-400" };
}

function offerColor(offerAmount: number, askingPrice: number | null): string {
  if (!askingPrice || askingPrice === 0) return "text-foreground";
  const ratio = offerAmount / askingPrice;
  if (ratio >= 0.95) return "text-emerald-400";
  if (ratio >= 0.9) return "text-amber-400";
  return "text-red-400";
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  accepted: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-white/[0.06] text-muted-foreground",
  countered: "bg-blue-500/15 text-blue-400",
};

export default function SellerOffers() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useHumm();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [audits, setAudits] = useState<{ address: string | null; humm_fair_value: number | null; asking_price: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [counteringId, setCounteringId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");

  const [form, setForm] = useState({
    property_address: "",
    offer_amount: "",
    offered_by: "",
    offer_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth?redirect=/seller/offers");
  }, [isLoggedIn]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [offersRes, auditsRes] = await Promise.all([
      supabase.from("seller_offers_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("saved_audits").select("address, humm_fair_value, asking_price").eq("user_id", user.id),
    ]);
    setOffers((offersRes.data as Offer[]) || []);
    setAudits(auditsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.property_address.trim() || !form.offer_amount) {
      toast.error("Please enter property address and offer amount.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("seller_offers_log").insert({
        user_id: user.id,
        property_address: form.property_address.trim(),
        offer_amount: parseFloat(form.offer_amount),
        offered_by: form.offered_by.trim() || null,
        offer_date: form.offer_date || null,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
      toast.success("Offer logged!");
      setForm({ property_address: "", offer_amount: "", offered_by: "", offer_date: new Date().toISOString().split("T")[0], notes: "" });
      setFormOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to log offer.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("seller_offers_log").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update."); return; }
    toast.success(`Offer ${status}.`);
    fetchData();
  };

  const handleCounter = (offer: Offer) => {
    if (!counterAmount) { toast.error("Enter a counter amount."); return; }
    const amt = parseFloat(counterAmount);
    supabase.from("seller_offers_log").update({ status: "countered", counter_amount: amt }).eq("id", offer.id).then(({ error }) => {
      if (error) { toast.error("Failed to counter."); return; }
      toast.success("Counter-offer recorded!");
      setCounteringId(null);
      setCounterAmount("");
      fetchData();
      // Navigate to email writer with pre-filled template
      const body = `Dear ${offer.offered_by || "[Buyer Name]"},\n\nThank you for your offer of ${fmt(offer.offer_amount)} for ${offer.property_address}.\n\nAfter careful consideration, we would like to counter-propose a sale price of ${fmt(amt)}.\n\nWe believe this reflects the true market value of the property and recent comparable sales in the area.\n\nWe look forward to hearing from you.\n\nKind regards,\n[Your Name]`;
      navigate("/dashboard?tab=email", { state: { prefillBody: body, prefillSubject: `Counter-offer for ${offer.property_address}` } });
    });
  };

  const getEstimate = (address: string) => {
    const match = audits.find((a) => a.address === address);
    return match?.humm_fair_value || match?.asking_price || null;
  };

  const uniqueAddresses = [...new Set(audits.map((a) => a.address).filter(Boolean))];

  // Summary stats
  const totalOffers = offers.length;
  const highest = offers.length > 0 ? Math.max(...offers.map((o) => o.offer_amount)) : 0;
  const average = offers.length > 0 ? Math.round(offers.reduce((s, o) => s + o.offer_amount, 0) / offers.length) : 0;
  const acceptedCount = offers.filter((o) => o.status === "accepted").length;
  const acceptanceRate = totalOffers > 0 ? Math.round((acceptedCount / totalOffers) * 100) : 0;

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors";
  const labelClasses = "block text-xs font-semibold text-foreground/70 mb-1.5";

  return (
    <>
      <SEOHead title="Track Offers | Hummm" description="Manage and respond to buyer offers on your property." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Offer Tracker</h1>
              <p className="text-sm text-muted-foreground/60 mt-1">Log, compare, and respond to buyer offers.</p>
            </div>
            <button onClick={() => setFormOpen(!formOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.97]">
              {formOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
              Log New Offer
            </button>
          </div>

          {/* 1. ADD OFFER FORM */}
          {formOpen && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6 animate-fade-in space-y-4">
              <div>
                <label className={labelClasses}>Property Address *</label>
                {uniqueAddresses.length > 0 ? (
                  <select value={form.property_address} onChange={set("property_address")} className={inputClasses}>
                    <option value="">Select or type manually…</option>
                    {uniqueAddresses.map((a) => <option key={a!} value={a!}>{a}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.property_address} onChange={set("property_address")} required placeholder="e.g. 42 Victoria Road, Bristol" className={inputClasses} />
                )}
                {uniqueAddresses.length > 0 && !form.property_address && (
                  <input type="text" onChange={set("property_address")} placeholder="Or type a new address…" className={`${inputClasses} mt-2`} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Offer Amount (£) *</label>
                  <input type="number" value={form.offer_amount} onChange={set("offer_amount")} required placeholder="e.g. 395000" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Offered By</label>
                  <input type="text" value={form.offered_by} onChange={set("offered_by")} placeholder="Buyer / agent name" className={inputClasses} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Offer Date</label>
                <input type="date" value={form.offer_date} onChange={set("offer_date")} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Notes</label>
                <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Any conditions, chain-free, etc." className={inputClasses} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.97] disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Log Offer
              </button>
            </form>
          )}

          {/* 2. SUMMARY BAR */}
          {!loading && offers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Offers", value: totalOffers.toString(), icon: MessageSquare, color: "text-blue-400" },
                { label: "Highest Offer", value: highest > 0 ? fmt(highest) : "—", icon: TrendingUp, color: "text-emerald-400" },
                { label: "Average Offer", value: average > 0 ? fmt(average) : "—", icon: BarChart3, color: "text-amber-400" },
                { label: "Acceptance Rate", value: `${acceptanceRate}%`, icon: Check, color: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon size={12} className={s.color} />
                    <span className="text-[10px] text-muted-foreground/50 font-medium">{s.label}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3. OFFERS LIST */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : offers.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <MessageSquare size={32} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground/50">No offers logged yet — share your listing and track offers as they come in.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                const estimate = getEstimate(offer.property_address);
                const analysis = analyseOffer(offer.offer_amount, estimate);
                const isCountering = counteringId === offer.id;

                return (
                  <div key={offer.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-white/[0.12]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground/50 mb-0.5">{offer.property_address}</p>
                        <p className={`text-2xl font-extrabold tracking-tight ${offerColor(offer.offer_amount, estimate)}`}>
                          {fmt(offer.offer_amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[offer.status] || STATUS_STYLES.pending}`}>
                          {offer.status}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] text-[10px] font-semibold ${analysis.color}`}>
                          <Sparkles size={10} /> {analysis.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground/50 mb-4">
                      {offer.offered_by && <span>From: <span className="text-foreground/70">{offer.offered_by}</span></span>}
                      {offer.offer_date && <span>{new Date(offer.offer_date).toLocaleDateString("en-GB")}</span>}
                      {offer.notes && <span className="truncate max-w-[200px]">{offer.notes}</span>}
                    </div>

                    {offer.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => updateStatus(offer.id, "accepted")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors">
                          <Check size={12} /> Accept
                        </button>
                        <button onClick={() => updateStatus(offer.id, "rejected")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] text-muted-foreground text-xs font-semibold hover:bg-white/[0.1] transition-colors">
                          <X size={12} /> Reject
                        </button>
                        <button onClick={() => { setCounteringId(isCountering ? null : offer.id); setCounterAmount(""); }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-semibold hover:bg-blue-500/25 transition-colors">
                          <Mail size={12} /> Counter
                        </button>
                      </div>
                    )}

                    {isCountering && (
                      <div className="mt-3 flex items-center gap-2 animate-fade-in">
                        <input type="number" value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)}
                          placeholder="Counter amount (£)" className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
                        <button onClick={() => handleCounter(offer)}
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all active:scale-[0.97]">
                          Send Counter
                        </button>
                      </div>
                    )}

                    {offer.status === "countered" && offer.counter_amount && (
                      <p className="mt-2 text-xs text-blue-400">Counter-offer: <span className="font-bold">{fmt(offer.counter_amount)}</span></p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
