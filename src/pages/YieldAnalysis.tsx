import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { ArrowLeft, Home, TrendingUp, TrendingDown, Minus, Copy, Check, Pencil, X } from "lucide-react";

export default function YieldAnalysis() {
  const navigate = useNavigate();
  const { isLoggedIn } = useHumm();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ current_rent: "", ai_market_rent: "", humm_fair_value: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchProperties = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: props } = await supabase.from("landlord_properties").select("*").eq("user_id", userData.user.id);
    setProperties(props || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate("/auth?redirect=/yield"); return; }
    fetchProperties();
  }, [isLoggedIn]);

  const totalUnderMarket = properties.reduce((s, p) => {
    const gap = p.ai_market_rent && p.current_rent ? p.ai_market_rent - p.current_rent : 0;
    return s + (gap > 0 ? gap : 0);
  }, 0);

  const yieldProperties = properties.filter(p => p.current_rent && p.humm_fair_value);
  const avgYield = yieldProperties.length > 0
    ? yieldProperties.reduce((s, p) => s + (p.current_rent * 12 / p.humm_fair_value) * 100, 0) / yieldProperties.length
    : null;

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditError(null);
    setEditForm({
      current_rent: p.current_rent?.toString() || "",
      ai_market_rent: p.ai_market_rent?.toString() || "",
      humm_fair_value: p.humm_fair_value?.toString() || "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    setEditError(null);
    const updates: any = {
      current_rent: editForm.current_rent ? parseInt(editForm.current_rent) : null,
      ai_market_rent: editForm.ai_market_rent ? parseInt(editForm.ai_market_rent) : null,
      humm_fair_value: editForm.humm_fair_value ? parseInt(editForm.humm_fair_value) : null,
    };
    const { error } = await supabase.from("landlord_properties").update(updates).eq("id", editingId);
    setSaving(false);
    if (error) {
      setEditError("Failed to save — " + error.message);
      return;
    }
    toast.success("Property updated");
    setEditingId(null);
    await fetchProperties();
  };

  const generateLetter = (p: any) => {
    const increase = p.ai_market_rent && p.current_rent ? p.ai_market_rent - p.current_rent : 50;
    return `Dear Tenant,\n\nI am writing to inform you of a proposed rent increase for the property at ${p.address}.\n\nThe current monthly rent of £${p.current_rent?.toLocaleString() || "—"} will increase to £${(p.current_rent + increase)?.toLocaleString() || "—"} per calendar month, effective from [DATE — minimum 1 month notice for periodic tenancies].\n\nThis adjustment reflects current market conditions. According to our analysis, the estimated market rent for comparable properties in ${p.postcode || "your area"} is approximately £${p.ai_market_rent?.toLocaleString() || "—"} pcm.\n\nPlease do not hesitate to contact me if you wish to discuss this further.\n\nYours sincerely,\n[Your Name]`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <SEOHead title="Yield Analysis | Hummm" description="Analyse rent yields across your portfolio." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <h1 className="text-2xl sm:text-3xl font-black mb-1">Rent & Yield Analysis</h1>
          <p className="text-sm text-muted-foreground mb-2">Compare current rents vs estimated market rents. Get AI recommendations.</p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {properties.length > 0 && totalUnderMarket > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  Portfolio is £{totalUnderMarket.toLocaleString()}/mo under market — potential uplift available
                </span>
              </div>
            )}
            {avgYield !== null && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">
                  Avg Portfolio Yield: {avgYield.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)] p-12 text-center">
              <Home size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold mb-2">No properties yet</p>
              <p className="text-xs text-muted-foreground mb-5">Add properties to your portfolio to see yield analysis.</p>
              <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                Add Property
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {properties.map((p) => {
                const gap = p.ai_market_rent && p.current_rent ? p.ai_market_rent - p.current_rent : null;
                const recommendation = gap === null ? "review" : gap > 50 ? "increase" : "hold";
                const letter = generateLetter(p);
                const isEditing = editingId === p.id;
                const propYield = p.current_rent && p.humm_fair_value ? ((p.current_rent * 12 / p.humm_fair_value) * 100).toFixed(1) : null;

                return (
                  <div key={p.id} className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-sm font-bold">{p.address}</p>
                        <p className="text-xs text-muted-foreground">{p.postcode} · {p.bedrooms || "—"} bed{propYield ? ` · ${propYield}% yield` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <button onClick={() => startEdit(p)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground border border-white/[0.08] hover:border-white/20 transition-colors">
                            <Pencil size={10} /> Edit
                          </button>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          recommendation === "increase" ? "bg-emerald-500/15 text-emerald-400"
                            : recommendation === "hold" ? "bg-blue-500/15 text-blue-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>
                          AI: {recommendation}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="rounded-xl border border-white/[0.06] p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Current Rent</p>
                        <p className="text-lg font-black">£{p.current_rent?.toLocaleString() || "—"}</p>
                        <p className="text-[10px] text-muted-foreground">pcm</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Market Estimate</p>
                        <p className="text-lg font-black text-primary">£{p.ai_market_rent?.toLocaleString() || "—"}</p>
                        <p className="text-[10px] text-muted-foreground">pcm</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Gap</p>
                        <div className="flex items-center justify-center gap-1">
                          {gap !== null && gap > 0 ? <TrendingUp size={14} className="text-emerald-400" /> : gap !== null && gap < 0 ? <TrendingDown size={14} className="text-red-400" /> : <Minus size={14} className="text-muted-foreground" />}
                          <p className={`text-lg font-black ${gap !== null && gap > 0 ? "text-emerald-400" : gap !== null && gap < 0 ? "text-red-400" : ""}`}>
                            {gap !== null ? `£${Math.abs(gap).toLocaleString()}` : "—"}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{gap !== null && gap > 0 ? "Under market" : gap !== null && gap < 0 ? "Over market" : ""}/mo</p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-5">
                        <p className="text-xs font-bold text-primary mb-3">Edit Rent & Value</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-1">Current monthly rent (£)</label>
                            <input type="number" value={editForm.current_rent} onChange={e => setEditForm(f => ({ ...f, current_rent: e.target.value }))} className="w-full rounded-lg border border-white/[0.1] bg-background px-3 py-2 text-sm" placeholder="e.g. 1200" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-1">Market rent estimate (£)</label>
                            <input type="number" value={editForm.ai_market_rent} onChange={e => setEditForm(f => ({ ...f, ai_market_rent: e.target.value }))} className="w-full rounded-lg border border-white/[0.1] bg-background px-3 py-2 text-sm" placeholder="e.g. 1400" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-1">Property value (£)</label>
                            <input type="number" value={editForm.humm_fair_value} onChange={e => setEditForm(f => ({ ...f, humm_fair_value: e.target.value }))} className="w-full rounded-lg border border-white/[0.1] bg-background px-3 py-2 text-sm" placeholder="e.g. 350000" />
                          </div>
                        </div>
                        {editError && <p className="text-xs text-red-400 mb-2">{editError}</p>}
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)} className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.1] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                          <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
                        </div>
                      </div>
                    )}

                    {recommendation === "increase" && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-emerald-400">AI-Drafted Rent Increase Letter</p>
                          <button onClick={() => handleCopy(p.id, letter)} className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
                            {copiedId === p.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                          </button>
                        </div>
                        <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">{letter}</pre>
                      </div>
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
