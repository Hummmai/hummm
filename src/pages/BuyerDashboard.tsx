import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import NegotiationInbox from "@/components/dashboard/NegotiationInbox";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import ChatWidget from "@/components/ChatWidget";
import MultiNegotiationWizard from "@/components/dashboard/MultiNegotiationWizard";
import {
  ShoppingBag, Loader2, Zap, CreditCard, ChevronRight, BarChart3,
  Link2, Activity, Pencil, ExternalLink, Home, TrendingUp,
  MessageSquare, Calculator, Search, ArrowRight, Sparkles, Bot, Inbox,
  CheckSquare, Square,
} from "lucide-react";

/* ─── Mortgage Mini-Calculator ─── */
const MortgageCalc = () => {
  const [price, setPrice] = useState(450000);
  const [deposit, setDeposit] = useState(90000);
  const [rate, setRate] = useState(5.2);
  const [term, setTerm] = useState(25);

  const monthly = useMemo(() => {
    const loan = price - deposit;
    if (loan <= 0) return 0;
    const r = rate / 100 / 12;
    const n = term * 12;
    return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [price, deposit, rate, term]);

  const totalCost = monthly * term * 12;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Property Price</label>
          <div className="text-lg font-black tabular-nums text-foreground">£{price.toLocaleString()}</div>
          <Slider value={[price]} onValueChange={([v]) => setPrice(v)} min={50000} max={2000000} step={5000} className="mt-2" />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Deposit</label>
          <div className="text-lg font-black tabular-nums text-foreground">£{deposit.toLocaleString()}</div>
          <Slider value={[deposit]} onValueChange={([v]) => setDeposit(v)} min={0} max={price * 0.5} step={5000} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Interest Rate</label>
          <div className="text-lg font-black tabular-nums text-foreground">{rate.toFixed(1)}%</div>
          <Slider value={[rate * 10]} onValueChange={([v]) => setRate(v / 10)} min={10} max={100} step={1} className="mt-2" />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Term (years)</label>
          <div className="text-lg font-black tabular-nums text-foreground">{term} years</div>
          <Slider value={[term]} onValueChange={([v]) => setTerm(v)} min={5} max={40} step={1} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40">
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
          <p className="text-[10px] text-primary/70 font-medium uppercase tracking-wider mb-1">Monthly Payment</p>
          <p className="text-2xl font-black text-primary tabular-nums">£{Math.round(monthly).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-muted/20 border border-border/30 p-4 text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Cost</p>
          <p className="text-2xl font-black tabular-nums">£{Math.round(totalCost).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Active Strategy Card ─── */
const ActiveStrategyCard = ({ strategy, onUpdate }: { strategy: any; onUpdate: (s: any) => void }) => {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(strategy.display_name || "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const displayText = strategy.display_name || strategy.property_address || strategy.property_link;

  const saveNickname = async () => {
    const trimmed = nickname.trim();
    if (trimmed === (strategy.display_name || "")) { setEditing(false); return; }
    setSaving(true);
    const { error } = await supabase.from("negotiate_requests").update({ display_name: trimmed || null } as any).eq("id", strategy.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Nickname saved ✓" }); onUpdate({ ...strategy, display_name: trimmed || null }); }
    setEditing(false);
  };

  return (
    <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/5 to-primary/[0.02] p-6 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
        <Activity size={22} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Active Strategy</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input ref={inputRef} value={nickname} onChange={(e) => setNickname(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveNickname()} onBlur={saveNickname} placeholder="e.g. Dream Flat in E14" className="flex-1 bg-muted/30 border border-primary/30 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 min-w-0" disabled={saving} />
            {saving && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
          </div>
        ) : (
          <button onClick={() => { setNickname(strategy.display_name || ""); setEditing(true); }} className="group flex items-center gap-2 max-w-full text-left">
            <p className="text-base font-black truncate">{displayText}</p>
            <Pencil size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">
          {strategy.package?.charAt(0).toUpperCase() + strategy.package?.slice(1)} · {strategy.status}
        </p>
      </div>
      <a href={strategy.property_link} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <Badge className="text-[10px] font-bold border-0 text-background px-4 py-1.5 rounded-xl" style={{ background: 'linear-gradient(to right, #72F1B8, #2FD1B5)' }}>
          <ExternalLink size={11} className="mr-1.5" /> Live
        </Badge>
      </a>
    </div>
  );
};

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<any>(null);
  const [mortgageLead, setMortgageLead] = useState<any>(null);
  const [savedAudits, setSavedAudits] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "inbox">(searchParams.get("tab") === "inbox" ? "inbox" : "overview");
  const [selectedForNeg, setSelectedForNeg] = useState<Set<string>>(new Set());
  const [showMultiNeg, setShowMultiNeg] = useState(false);

  const toggleSelectForNeg = (id: string) => {
    setSelectedForNeg(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/auth"); return; }
      setUserId(data.user.id);
      fetchData(data.user.id);
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    const [negRes, mortRes, stratRes, auditRes] = await Promise.all([
      supabase.from("negotiation_messages").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("mortgage_leads").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
      supabase.from("negotiate_requests").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
      supabase.from("saved_audits").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(6),
    ]);
    setNegotiations(negRes.data || []);
    setMortgageLead(mortRes.data?.[0] || null);
    setActiveStrategy(stratRes.data?.[0] || null);
    setSavedAudits(auditRes.data || []);
    setLoading(false);
  };

  const strengthScore = (n: any) => {
    let score = 50;
    if (n.buyer_status === "chain-free") score += 20;
    if (n.max_budget && n.property_price && n.max_budget >= n.property_price) score += 15;
    return Math.min(score + 15, 100);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Buyer Dashboard | Hummm" description="Your Buyer Command Centre — track offers, mortgage, and negotiations." />
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
                  Buyer Command Centre
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back — here's everything you need at a glance.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/home")} className="bg-primary text-primary-foreground rounded-xl font-bold gap-2 shadow-[0_4px_20px_-4px_hsl(168_100%_45%/0.3)]">
                  <Link2 size={16} /> Drop New Link
                </Button>
                <Button variant="outline" onClick={() => setShowChat(!showChat)} className="rounded-xl font-bold gap-2 border-primary/30 text-primary hover:bg-primary/10">
                  <Bot size={16} /> AI Assistant
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Tab Switcher */}
          <div className="flex gap-2 border-b border-border pb-0 mb-8">
            {[
              { id: "overview" as const, label: "Overview", icon: Search },
              { id: "inbox" as const, label: "Inbox", icon: Inbox },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "inbox" ? (
            <NegotiationInbox />
          ) : (
          <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Active Strategy */}
              {activeStrategy && (
                <AnimatedSection delay={50}>
                  <ActiveStrategyCard strategy={activeStrategy} onUpdate={setActiveStrategy} />
                </AnimatedSection>
              )}

              {/* Top Stats Row */}
              <AnimatedSection delay={80}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Saved Properties", value: String(savedAudits.length), icon: Search, accent: "from-emerald-500/15 to-teal-500/15" },
                    { label: "Active Negotiations", value: String(negotiations.length), icon: MessageSquare, accent: "from-blue-500/15 to-indigo-500/15" },
                    { label: "Mortgage Status", value: mortgageLead ? "Active" : "—", icon: CreditCard, accent: "from-amber-500/15 to-orange-500/15" },
                    { label: "AI Recommendations", value: String(savedAudits.filter(a => (a.ai_score || 0) >= 70).length), icon: Sparkles, accent: "from-violet-500/15 to-purple-500/15" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-3xl border border-border/60 bg-card/40 p-6 hover:border-primary/30 hover:shadow-[0_4px_24px_-6px_hsl(168_100%_45%/0.08)] transition-all duration-300">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-4`}>
                        <s.icon size={20} className="text-primary" />
                      </div>
                      <p className="text-3xl font-black tabular-nums">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Mortgage Command Centre */}
              <AnimatedSection delay={120}>
                <div className="rounded-3xl border border-border/60 bg-card/40 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calculator size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Mortgage Command Centre</h2>
                      <p className="text-xs text-muted-foreground">Calculate your monthly payments instantly</p>
                    </div>
                    {mortgageLead?.has_dip && (
                      <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 text-[10px] font-bold rounded-xl px-3">DIP Verified ✓</Badge>
                    )}
                  </div>
                  <MortgageCalc />
                </div>
              </AnimatedSection>

              {/* Saved Properties */}
              <AnimatedSection delay={160}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black">Saved Properties</h2>
                  <div className="flex gap-2 items-center">
                    {selectedForNeg.size >= 2 && (
                      <Button
                        onClick={() => setShowMultiNeg(true)}
                        className="bg-primary text-primary-foreground rounded-xl font-bold gap-2 text-xs shadow-[0_4px_20px_-4px_hsl(168_100%_45%/0.3)] animate-in fade-in"
                      >
                        <Sparkles size={14} /> Negotiate {selectedForNeg.size} Properties
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => navigate("/propertyscout")} className="text-primary text-xs font-bold gap-1">
                      View All <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
                {savedAudits.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/60 bg-card/20 p-16 text-center">
                    <Home size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No saved properties yet</p>
                    <Button onClick={() => navigate("/home")} className="bg-primary text-primary-foreground rounded-xl font-bold gap-2">
                      <Link2 size={14} /> Drop a Property Link
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedAudits.map((a) => {
                      const isNegSelected = selectedForNeg.has(a.id);
                      return (
                        <div key={a.id} className={`group rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer relative ${isNegSelected ? "border-primary/60 ring-1 ring-primary/20 bg-primary/[0.02]" : "border-border/60 bg-card/40 hover:border-primary/30"} hover:shadow-[0_4px_30px_rgba(0,229,204,0.08)]`} onClick={() => navigate("/home")}>
                          {/* Selection checkbox */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelectForNeg(a.id); }}
                            className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center hover:border-primary/50 transition-colors"
                          >
                            {isNegSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground/50" />}
                          </button>
                          <div className="h-36 bg-muted/20 relative overflow-hidden">
                            {a.images?.[0] ? (
                              <img src={a.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home size={28} className="text-muted-foreground/20" />
                              </div>
                            )}
                            {a.ai_score && (
                              <div className={`absolute top-3 right-3 px-3 py-1 rounded-xl text-[10px] font-black ${a.ai_score >= 70 ? 'bg-primary/90 text-background' : 'bg-muted/80 text-foreground'}`}>
                                AI {a.ai_score}/100
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <p className="text-sm font-black line-clamp-2 group-hover:text-primary transition-colors mb-2">
                              {a.address || "Property Audit"}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {a.asking_price && <span className="font-bold text-foreground">£{a.asking_price.toLocaleString()}</span>}
                              {a.humm_fair_value && <span className="text-primary font-semibold">Fair: £{a.humm_fair_value.toLocaleString()}</span>}
                            </div>
                            {a.bedrooms && (
                              <p className="text-[11px] text-muted-foreground mt-2">{a.bedrooms} bed · {a.bathrooms || "—"} bath · {a.property_type || "Property"}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnimatedSection>

              {/* Negotiations */}
              <AnimatedSection delay={200}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black">My Negotiations</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/humm-ai-negotiator")} className="text-primary text-xs font-bold gap-1">
                    Start New <ArrowRight size={14} />
                  </Button>
                </div>
                {negotiations.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/60 bg-card/20 p-12 text-center">
                    <MessageSquare size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No active negotiations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {negotiations.slice(0, 5).map((n) => {
                      const score = strengthScore(n);
                      return (
                        <div key={n.id} className="group rounded-3xl border border-border/60 bg-card/40 p-6 hover:border-primary/30 hover:shadow-[0_4px_30px_rgba(0,229,204,0.08)] transition-all duration-300 cursor-pointer" onClick={() => navigate("/dashboard/deal-room")}>
                          <div className="flex gap-5 items-start">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-muted/20 border border-border/30">
                              <img src={`https://image.thum.io/get/width/128/crop/128/${encodeURIComponent(n.property_address || '')}`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-black leading-snug line-clamp-1 group-hover:text-primary transition-colors mb-2">{n.property_address || "Negotiation"}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-xl ${score >= 70 ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground border border-border'}`}>
                                  <Zap size={10} className="inline mr-1" />Strength {score}
                                </span>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase rounded-xl">{n.status?.replace("_", " ")}</Badge>
                              </div>
                              {n.property_price && (
                                <p className="text-xs text-muted-foreground mt-2">Asking: <span className="font-bold text-foreground">£{n.property_price.toLocaleString()}</span></p>
                              )}
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary shrink-0 mt-2 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnimatedSection>

              {/* Quick Actions */}
              <AnimatedSection delay={240}>
                <h2 className="text-lg font-black mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Property Scout", icon: Search, path: "/propertyscout" },
                    { label: "AI Negotiator", icon: Zap, path: "/humm-ai-negotiator" },
                    { label: "AI Valuations", icon: BarChart3, path: "/dashboard/valuations" },
                    { label: "Find Agent", icon: TrendingUp, path: "/find-agent" },
                  ].map((a) => (
                    <button key={a.path} onClick={() => navigate(a.path)} className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                      <a.icon size={22} className="mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold">{a.label}</p>
                    </button>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* AI Chat Sidebar (desktop) */}
            {showChat && (
              <div className="hidden lg:block w-[380px] shrink-0">
                <div className="sticky top-24 rounded-3xl border border-primary/20 bg-card/60 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot size={18} className="text-primary" />
                      <span className="text-sm font-black">AI Buyer Assistant</span>
                    </div>
                    <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                  </div>
                  <div className="h-[calc(100%-60px)]">
                    <ChatWidget />
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Multi-Negotiation Wizard */}
      {showMultiNeg && userId && (
        <MultiNegotiationWizard
          properties={savedAudits.filter(a => selectedForNeg.has(a.id))}
          userId={userId}
          onClose={() => setShowMultiNeg(false)}
          onComplete={() => {
            setSelectedForNeg(new Set());
            setActiveTab("inbox");
            fetchData(userId);
          }}
        />
      )}
    </>
  );
};

export default BuyerDashboard;
