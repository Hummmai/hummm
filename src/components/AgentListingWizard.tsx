import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddressLookup from "@/components/AddressLookup";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Brain, Rocket,
  Home, Bed, Bath, Ruler, Loader2, Wand2, Megaphone, Target, Calendar, ListChecks,
} from "lucide-react";

interface Props { intent: "sale" | "let"; }

const steps = ["Property Details", "AI Strategy", "Launch as Agent"] as const;

export default function AgentListingWizard({ intent }: Props) {
  const isLet = intent === "let";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [editedCopy, setEditedCopy] = useState("");
  const [recentAudit, setRecentAudit] = useState<any>(null);

  const [form, setForm] = useState({
    address: "",
    postcode: "",
    property_type: "House",
    bedrooms: "3",
    bathrooms: "2",
    sqft: "",
    asking_price: "",
    description: "",
    name: "",
    email: "",
    phone: "",
  });

  // Pull prefill from valuation/audit if present in nav state
  useEffect(() => {
    const s: any = location.state || {};
    if (s.prefill) {
      setForm((f) => ({ ...f, ...s.prefill }));
    }
    // Also try to load most recent saved audit for this user
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("saved_audits")
        .select("address,postcode,property_type,bedrooms,bathrooms,sqft,asking_price,description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setRecentAudit(data);
    })();
  }, []);

  const useAudit = () => {
    if (!recentAudit) return;
    setForm((f) => ({
      ...f,
      address: recentAudit.address || f.address,
      postcode: recentAudit.postcode || f.postcode,
      property_type: recentAudit.property_type || f.property_type,
      bedrooms: recentAudit.bedrooms?.toString() || f.bedrooms,
      bathrooms: recentAudit.bathrooms?.toString() || f.bathrooms,
      sqft: recentAudit.sqft?.toString() || f.sqft,
      asking_price: recentAudit.asking_price?.toString() || f.asking_price,
      description: recentAudit.description || f.description,
    }));
    toast({ title: "Prefilled from your recent audit" });
  };

  const generateStrategy = async () => {
    if (!form.address) { toast({ title: "Address required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-strategy", {
        body: { intent, ...form },
      });
      if (error) throw error;
      setStrategy(data.strategy);
      setEditedCopy(data.strategy?.listing_copy || "");
      setStep(1);
    } catch (e: any) {
      toast({ title: "AI strategy failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const launchListing = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "Create a free account to launch your listing.", variant: "destructive" });
        navigate("/auth", { state: { redirectTo: location.pathname } });
        return;
      }
      const payload: any = {
        listing_intent: intent,
        address: form.address,
        postcode: form.postcode,
        property_type: form.property_type,
        bedrooms: Number(form.bedrooms) || null,
        bathrooms: Number(form.bathrooms) || null,
        sqft: form.sqft || null,
        asking_price: form.asking_price,
        description: form.description,
        email: form.email || user.email || null,
        name: form.name,
        phone: form.phone,
        strategy,
        listing_copy: editedCopy,
        live_status: "listed",
        status: "active",
        user_id: user.id,
      };
      const { error } = await supabase.from("property_listings").insert(payload);
      if (error) throw error;
      toast({ title: "🚀 Hummm AI is now your agent", description: "Listing live. Enquiries route to your inbox." });
      navigate("/dashboard");
    } catch (e: any) {
      toast({ title: "Launch failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex items-center">
            <div className={`flex items-center gap-3 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border ${i < step ? "bg-primary text-primary-foreground border-primary" : i === step ? "border-primary text-primary" : "border-border"}`}>
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 0 && (
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Tell us about the property</h2>
              <p className="text-sm text-muted-foreground mt-1">Hummm AI will build a bespoke {isLet ? "letting" : "sales"} strategy.</p>
            </div>
            {recentAudit && (
              <button onClick={useAudit} className="shrink-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition">
                <Sparkles size={14} /> Use my recent audit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Address</label>
              <AddressLookup value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Start typing your address..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={Home} label="Property Type" value={form.property_type} onChange={(v) => setForm({ ...form, property_type: v })} />
              <Field label="Postcode" value={form.postcode} onChange={(v) => setForm({ ...form, postcode: v })} />
              <Field icon={Bed} label="Bedrooms" value={form.bedrooms} onChange={(v) => setForm({ ...form, bedrooms: v })} type="number" />
              <Field icon={Bath} label="Bathrooms" value={form.bathrooms} onChange={(v) => setForm({ ...form, bathrooms: v })} type="number" />
              <Field icon={Ruler} label="Size (sq ft)" value={form.sqft} onChange={(v) => setForm({ ...form, sqft: v })} />
              <Field label={isLet ? "Asking Rent (pcm)" : "Asking Price"} value={form.asking_price} onChange={(v) => setForm({ ...form, asking_price: v })} placeholder={isLet ? "£2,500" : "£550,000"} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Notable Features</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="e.g. recently refurbished, garden, EV charger, period features…"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <Field label="Your Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={generateStrategy}
              disabled={loading || !form.address}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {loading ? "Hummm AI is analysing…" : "Generate AI Strategy"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && strategy && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Wand2 size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Hummm AI Strategy</p>
                <h2 className="text-2xl font-black tracking-tight">{strategy.headline || "Your bespoke strategy"}</h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <StratCard icon={Target} label={isLet ? "Recommended Rent" : "Recommended Price"} value={strategy.recommended_rent || strategy.recommended_price} />
              <StratCard icon={Calendar} label="Timeline" value={strategy.timeline} />
              <StratCard icon={Megaphone} label="Target Audience" value={strategy.target_audience} />
              <StratCard icon={ListChecks} label="Portals" value={(strategy.portals || []).join(" · ")} />
            </div>
            {strategy.pricing_rationale && (
              <div className="mt-5 p-4 rounded-2xl bg-background/60 border border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Pricing Rationale</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{strategy.pricing_rationale}</p>
              </div>
            )}
            {Array.isArray(strategy.marketing_plan) && strategy.marketing_plan.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-background/60 border border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Marketing Plan</p>
                <ul className="space-y-1.5">
                  {strategy.marketing_plan.map((m: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                      <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm font-semibold hover:bg-muted/40">
              <ArrowLeft size={16} /> Edit details
            </button>
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90">
              Approve & Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Rocket size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Final Approval</p>
                <h2 className="text-2xl font-black tracking-tight">{strategy?.listing_title || "Your listing"}</h2>
              </div>
            </div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Listing Copy (edit if needed)</label>
            <textarea
              value={editedCopy}
              onChange={(e) => setEditedCopy(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-5 p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">What happens when you launch</p>
              <ul className="space-y-1.5 text-sm text-foreground/90">
                <li className="flex gap-2"><CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" /> Listing prepared for {isLet ? "Rightmove, Zoopla, OpenRent" : "Rightmove, Zoopla, Property Finder"}.</li>
                <li className="flex gap-2"><CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" /> Hummm AI handles enquiries 24/7.</li>
                <li className="flex gap-2"><CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" /> {isLet ? "Tenant" : "Buyer"} negotiation drafts await your approval.</li>
                <li className="flex gap-2"><CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" /> Live status appears in your Command Centre.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm font-semibold hover:bg-muted/40">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={launchListing}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
              {loading ? "Launching…" : `Launch — Hummm AI is my agent`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, icon: Icon }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: any }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={12} />} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

function StratCard({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-background/60 border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="text-base font-bold text-foreground">{value || "—"}</p>
    </div>
  );
}