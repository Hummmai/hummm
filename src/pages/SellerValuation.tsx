import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Loader2, Home, TrendingUp, BarChart3, Clock,
  MapPin, CheckCircle, Star, Sparkles, FileText, Search, Save,
} from "lucide-react";

const PROPERTY_TYPES = ["flat", "terraced", "semi-detached", "detached", "bungalow"];
const CONDITIONS = ["needs work", "good", "excellent", "newly renovated"];
const LOADING_MESSAGES = [
  "Analysing local sales data…",
  "Checking comparable properties…",
  "Calculating optimal listing price…",
  "Preparing your report…",
];

interface FormData {
  address: string;
  postcode: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  condition: string;
  improvements: string;
}

function RingChart({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "hsl(var(--primary))" : score >= 50 ? "hsl(45,90%,55%)" : "hsl(0,70%,55%)";
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted)/0.15)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} className="transition-all duration-1000" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="currentColor"
        className="text-foreground font-extrabold" style={{ fontSize: size * 0.26 }}>{score}</text>
    </svg>
  );
}

export default function SellerValuation() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useHumm();
  const [form, setForm] = useState<FormData>({
    address: "", postcode: "", propertyType: "semi-detached",
    bedrooms: "3", bathrooms: "1", sqft: "", condition: "good", improvements: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth?redirect=/seller/valuation");
  }, [isLoggedIn]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsg((p) => (p + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim() || !form.postcode.trim()) {
      toast.error("Please enter the property address and postcode.");
      return;
    }
    setLoading(true);
    setLoadingMsg(0);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-valuation", {
        body: {
          address: `${form.address}, ${form.postcode}`,
          propertyType: form.propertyType,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          sqft: form.sqft || "unknown",
          improvements: `Condition: ${form.condition}. ${form.improvements}`.trim(),
          email: "",
          phone: "",
          tenure: "",
          parking: "",
          garden: "",
          garage: "",
          specialFeatures: [],
          goal: "sell",
          name: "",
        },
      });
      if (error) throw new Error(error.message);
      if (!data) throw new Error("No valuation data returned");
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Valuation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving || !result) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const val = result;
      await supabase.from("saved_audits").insert({
        user_id: user.id,
        property_url: `seller-valuation://${form.postcode}`,
        address: form.address,
        postcode: form.postcode,
        asking_price: val.recommendedPrice || val.valuationHigh || null,
        bedrooms: parseInt(form.bedrooms) || null,
        bathrooms: parseInt(form.bathrooms) || null,
        property_type: form.propertyType,
        sqft: form.sqft ? parseInt(form.sqft) : null,
        humm_fair_value: val.valuationLow || null,
        humm_fair_value_high: val.valuationHigh || null,
        ai_score: val.confidence || val.aiScore || null,
        report_json: val,
        status: "audited",
      });
      toast.success("Valuation saved to your dashboard!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => `£${n.toLocaleString()}`;

  // Derive display values from result
  const valLow = result?.valuationLow || result?.valuation_low || 0;
  const valHigh = result?.valuationHigh || result?.valuation_high || 0;
  const recommendedPrice = result?.recommendedPrice || Math.round((valLow + valHigh) / 2 * 1.03);
  const confidence = result?.confidence || result?.aiScore || 72;
  const comparables = result?.recentSales || result?.comparables || [];
  const recommendations = result?.recommendations || result?.opportunities || [];
  const risks = result?.risks || [];
  const scoreBreakdown = result?.scoreBreakdown || result?.score_breakdown || {};
  const locationScore = scoreBreakdown?.location || scoreBreakdown?.Location || Math.round(confidence * 0.25);
  const conditionScore = scoreBreakdown?.condition || scoreBreakdown?.Condition || Math.round(confidence * 0.22);
  const timingScore = scoreBreakdown?.timing || scoreBreakdown?.["Market Timing"] || Math.round(confidence * 0.26);
  const priceScore = scoreBreakdown?.price || scoreBreakdown?.["Price Competitiveness"] || Math.round(confidence * 0.27);
  const streetAvg = result?.streetAverage || result?.areaAverage || (valLow && valHigh ? Math.round((valLow + valHigh) / 2 * 0.95) : 0);
  const pricePerSqft = result?.pricePerSqft || (form.sqft && valHigh ? Math.round(valHigh / parseInt(form.sqft)) : null);
  const avgDays = result?.avgDaysOnMarket || result?.daysOnMarket || 38;
  const bestTimeText = result?.bestTimeToList || result?.marketMomentum || "Spring (March–May) typically sees the strongest buyer demand and highest sale prices in this area. The current market shows moderate momentum — listing within the next 4–6 weeks is recommended.";

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors";
  const labelClasses = "block text-xs font-semibold text-foreground/70 mb-1.5";

  // Loading state
  if (loading) {
    return (
      <>
        <SEOHead title="Analysing Property | Hummm" description="Generating your seller valuation." noindex />
        <div className="min-h-screen bg-[hsl(222,47%,5%)] flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
            <p className="text-lg font-semibold text-foreground animate-pulse">{LOADING_MESSAGES[loadingMsg]}</p>
            <div className="flex justify-center gap-1.5">
              {LOADING_MESSAGES.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === loadingMsg ? "bg-primary scale-125" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Results state
  if (result) {
    return (
      <>
        <SEOHead title="Seller Valuation | Hummm" description="Your AI property valuation report." noindex />
        <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
            {/* Back */}
            <button onClick={() => setResult(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft size={16} /> New valuation
            </button>

            {/* 1. VALUATION HERO */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider mb-1">Estimated Value Range</p>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    {valLow ? fmt(valLow) : "—"} <span className="text-muted-foreground/40 mx-1">–</span> {valHigh ? fmt(valHigh) : "—"}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-sm font-bold text-primary">Recommended listing price: {recommendedPrice ? fmt(recommendedPrice) : "—"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/40 mt-3">{form.address}, {form.postcode}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <RingChart score={confidence} size={90} />
                  <span className="text-[10px] text-muted-foreground/50 font-medium">AI Confidence</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.97] disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save to dashboard
                </button>
              </div>
            </div>

            {/* 2. MARKET POSITION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Street Average", value: streetAvg ? fmt(streetAvg) : "—", icon: MapPin, color: "text-blue-400" },
                { label: "Price per sqft", value: pricePerSqft ? `£${pricePerSqft}` : "N/A", icon: Home, color: "text-emerald-400" },
                { label: "Avg Days on Market", value: `${avgDays} days`, icon: Clock, color: "text-amber-400" },
              ].map((tile) => (
                <div key={tile.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <tile.icon size={14} className={tile.color} />
                    <span className="text-[11px] text-muted-foreground/50 font-medium">{tile.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{tile.value}</p>
                </div>
              ))}
            </div>

            {/* 3. COMPARABLE SALES */}
            {comparables.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
                <h3 className="text-sm font-bold text-foreground mb-4">Comparable Sales</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground/40 border-b border-white/[0.06]">
                        <th className="pb-2 font-medium">Address</th>
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparables.slice(0, 5).map((c: any, i: number) => (
                        <tr key={i} className="border-b border-white/[0.04]">
                          <td className="py-2.5 text-foreground/70">{c.address || c.street || "Nearby property"}</td>
                          <td className="py-2.5 font-semibold text-foreground">{c.price ? fmt(c.price) : "—"}</td>
                          <td className="py-2.5 text-muted-foreground/50">{c.date || c.sold_date || "—"}</td>
                          <td className="py-2.5 text-muted-foreground/50">{c.propertyType || c.type || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. SELLER SCORE BREAKDOWN */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Seller Score Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Location", score: Math.min(locationScore, 25), icon: MapPin },
                  { label: "Condition", score: Math.min(conditionScore, 25), icon: Home },
                  { label: "Market Timing", score: Math.min(timingScore, 25), icon: TrendingUp },
                  { label: "Price Competitiveness", score: Math.min(priceScore, 25), icon: BarChart3 },
                ].map((f) => (
                  <div key={f.label} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <f.icon size={16} className="text-primary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{f.score}<span className="text-muted-foreground/40 text-xs">/25</span></p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
                <h3 className="text-sm font-bold text-foreground mb-4">Recommendations Before Listing</h3>
                <ul className="space-y-2.5">
                  {recommendations.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/70">
                      <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. BEST TIME TO LIST */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
              <h3 className="text-sm font-bold text-foreground mb-3">Best Time to List</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">{bestTimeText}</p>
            </div>

            {/* 7. ACTION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Track offers", desc: "Manage and respond to buyer offers", icon: FileText, path: "/seller/offers" },
                { label: "Prepare for listing", desc: "Pre-sale checklist and prep guide", icon: Star, path: "/seller/listing-prep" },
                { label: "Find an agent", desc: "Compare local estate agents", icon: Search, path: "/find-an-agent" },
              ].map((card) => (
                <button key={card.label} onClick={() => navigate(card.path)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 text-left hover:bg-white/[0.06] hover:border-primary/20 transition-all group">
                  <card.icon size={18} className="text-primary mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">{card.label}</p>
                  <p className="text-[11px] text-muted-foreground/50">{card.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-primary text-[11px] font-semibold">
                    Go <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Input form state
  return (
    <>
      <SEOHead title="Seller Valuation | Hummm" description="Get an AI-powered valuation for your property." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          <div className="text-center mb-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">What's Your Property Worth?</h1>
            <p className="text-sm text-muted-foreground/60">Get an AI-powered valuation based on local sales data, market trends, and property condition.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClasses}>Property Address *</label>
              <input type="text" value={form.address} onChange={set("address")} required placeholder="e.g. 42 Victoria Road, Bristol" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Postcode *</label>
              <input type="text" value={form.postcode} onChange={set("postcode")} required placeholder="e.g. BS6 5LA" className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Property Type</label>
                <select value={form.propertyType} onChange={set("propertyType")} className={inputClasses}>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Bedrooms</label>
                <select value={form.bedrooms} onChange={set("bedrooms")} className={inputClasses}>
                  {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Bathrooms</label>
                <select value={form.bathrooms} onChange={set("bathrooms")} className={inputClasses}>
                  {[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Size (sqft, optional)</label>
                <input type="number" value={form.sqft} onChange={set("sqft")} placeholder="e.g. 1200" className={inputClasses} />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Current Condition</label>
              <select value={form.condition} onChange={set("condition")} className={inputClasses}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Any recent improvements?</label>
              <textarea value={form.improvements} onChange={set("improvements")} rows={3}
                placeholder="e.g. new kitchen 2023, loft conversion" className={inputClasses} />
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.97] shadow-lg shadow-primary/20">
              <Sparkles size={16} /> Get My Valuation
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
