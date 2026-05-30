import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import SellerDashboardTab from "@/components/SellerDashboardTab";
import StrategyBuilder from "@/components/StrategyBuilder";
import TemplateLibrary from "@/components/TemplateLibrary";
import StrategyCoach from "@/components/StrategyCoach";
import GoldHummm from "@/components/GoldHummm";
import GoldCelebration from "@/components/GoldCelebration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sparkles, LogOut, Shield, Briefcase, BarChart3, Zap, ArrowRight, Loader2,
  CheckCircle, Circle, FileText, ShoppingBag, House, KeyRound, Bot,
  TrendingUp, Banknote, PawPrint, Leaf, Star, MessageSquare, Eye,
  CalendarDays, Users, BadgeCheck, Wrench, Copy, Check, Upload, Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DealMode = "buying" | "selling" | "renting";

/* ─── Strength Score Badge ─── */
function StrengthScoreBadge({ score }: { score: number }) {
  const isPulsing = score >= 90;
  const color =
    score >= 90 ? "bg-primary/15 text-primary border-primary/40"
    : score >= 70 ? "bg-green-500/15 text-green-400 border-green-500/30"
    : score >= 50 ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
    : "bg-destructive/15 text-destructive border-destructive/30";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-full border shrink-0 ${color} ${isPulsing ? "humm-pulse" : ""}`}
    >
      <Sparkles size={10} />
      {score}%
    </span>
  );
}

function generateScore(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  return 55 + Math.abs(hash % 46); // 55–100
}

const MODE_CONFIG: Record<DealMode, { label: string; icon: any; color: string }> = {
  buying: { label: "Buying", icon: ShoppingBag, color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  selling: { label: "Selling", icon: House, color: "bg-primary/15 text-primary border-primary/30" },
  renting: { label: "Renting", icon: KeyRound, color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

/* ─── Static checklists ─── */

const TA6_CHECKLIST = [
  { id: "ta6-1", label: "TA6 Property Information Form (6th Ed.)", description: "Updated March 2026 — includes flooding, Japanese knotweed, and building safety." },
  { id: "ta6-2", label: "TA7 Leasehold Information Form", description: "Required if leasehold. Updated service charge disclosure rules." },
  { id: "ta6-3", label: "TA10 Fittings & Contents Form", description: "List all items included/excluded in the sale." },
  { id: "ta6-4", label: "Energy Performance Certificate (EPC)", description: "Valid EPC required before marketing. Must be C or above for new tenancies." },
  { id: "ta6-5", label: "Title Deeds / Land Registry", description: "Confirm registered title. Obtain official copies from HM Land Registry." },
  { id: "ta6-6", label: "Building Regulations Certificates", description: "For any works done — extensions, loft conversions, rewiring." },
  { id: "ta6-7", label: "FENSA / Gas Safe Certificates", description: "Required for replacement windows and gas appliance installations." },
  { id: "ta6-8", label: "Management Pack (Leasehold)", description: "Service charges, ground rent, lease length, and building insurance." },
];

const RENTER_CHECKLIST = [
  { id: "rent-1", label: "Periodic Tenancy Agreement", description: "All new tenancies must be periodic from May 1st 2026 — no more fixed-term Section 21 notices." },
  { id: "rent-2", label: "Pet Request Submitted", description: "Landlords cannot unreasonably refuse a pet. Submit a formal request with pet details." },
  { id: "rent-3", label: "EPC Rating C or Above", description: "Properties must meet minimum EPC C from April 2026 for new tenancies." },
  { id: "rent-4", label: "Deposit Protection Registered", description: "Deposit must be registered within 30 days. Check your deposit certificate." },
  { id: "rent-5", label: "Gas Safety Certificate (CP12)", description: "Annual gas safety check must be current. Landlord must provide a copy." },
  { id: "rent-6", label: "How to Rent Guide Received", description: "Landlord must provide the latest 'How to Rent' booklet before tenancy starts." },
];

const BUYER_CHECKLIST = [
  { id: "buy-1", label: "Mortgage Agreement in Principle", description: "Get a Decision in Principle from your lender to prove borrowing power." },
  { id: "buy-2", label: "Proof of Funds / Deposit Ready", description: "Bank statements or investment proof showing your deposit is accessible." },
  { id: "buy-3", label: "Solicitor Instructed", description: "Appoint a conveyancer early so you can move quickly when an offer is accepted." },
  { id: "buy-4", label: "Property Survey Booked", description: "Homebuyer report or full building survey — essential before exchange." },
  { id: "buy-5", label: "Searches Ordered", description: "Local authority, environmental, drainage, and chancel repair searches." },
  { id: "buy-6", label: "Mortgage Offer Received", description: "Formal mortgage offer from lender confirming the loan terms." },
];

const DashboardDealRoom = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [mode, setMode] = useState<DealMode>(() => {
    return (localStorage.getItem("deal_room_mode") as DealMode) || "selling";
  });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("deal_room_checklist");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [isGold, setIsGold] = useState(() => !!localStorage.getItem("humm_dip_url"));
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoldChange = useCallback((v: boolean) => {
    setIsGold(v);
    if (v && !localStorage.getItem("humm_gold_celebrated")) {
      setShowCelebration(true);
      localStorage.setItem("humm_gold_celebrated", "1");
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, plansRes, negoRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("seller_plans").select("id").eq("user_id", user.id).limit(1),
        supabase.from("negotiate_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(profileRes.data);
      setHasActivePlan((plansRes.data as any)?.length > 0);
      setNegotiations(negoRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const toggleChecked = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("deal_room_checklist", JSON.stringify([...next]));
      return next;
    });
  };

  const switchMode = (m: DealMode) => {
    setMode(m);
    localStorage.setItem("deal_room_mode", m);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out" });
    navigate("/");
  };

  const currentChecklist = mode === "selling" ? TA6_CHECKLIST : mode === "renting" ? RENTER_CHECKLIST : BUYER_CHECKLIST;
  const completedCount = currentChecklist.filter(i => checkedItems.has(i.id)).length;
  const totalCount = currentChecklist.length;
  const completionPct = Math.round((completedCount / totalCount) * 100);

  const modeDescriptions: Record<DealMode, string> = {
    buying: isGold
      ? "Gold Strategy Hub — AI coaching, templates, and tactical negotiation tools."
      : "Track your offers, mortgage progress, and AI negotiation activity.",
    selling: "Manage incoming offers, viewings, and legal compliance.",
    renting: "Stay compliant with the Renters' Reform Act — tenancy, pets, and EPC.",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">Loading AI Hub...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Hummm | AI Property Intelligence" description="Hummm — AI-powered property intelligence. Manage negotiations, viewings, and legal tracking." />
      <Navbar />
      <GoldCelebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <div className="pt-28 pb-24 section-padding">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-4">
                  <Briefcase size={12} className="text-primary" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">AI Intelligence</span>
                  {isGold && <GoldHummm size={12} pulse={false} />}
                </div>
                <h1
                  className="text-3xl sm:text-4xl font-black tracking-tight"
                  
                >
                   AI Hub 📡
                  {isGold && <GoldHummm size={22} pulse={true} className="ml-3 inline-flex align-middle" showLabel />}
                </h1>
                <p className="text-muted-foreground text-sm mt-2">{modeDescriptions[mode]}</p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <Link
                  to="/dashboard/valuations"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/15 transition-all"
                >
                  <BarChart3 size={13} /> My Valuations
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-xl transition-all"
                >
                  <LogOut size={13} /> Log Out
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* Mode Toggle */}
          <AnimatedSection delay={50}>
            <div className="flex gap-2 mb-8 p-1.5 bg-card/60 border border-border rounded-2xl w-fit">
              {(Object.keys(MODE_CONFIG) as DealMode[]).map((m) => {
                const cfg = MODE_CONFIG[m];
                const Icon = cfg.icon;
                const active = m === mode;
                return (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                      active
                        ? `${cfg.color} shadow-sm`
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Icon size={14} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>

          {/* ═══ SELLING MODE ═══ */}
          {mode === "selling" && (
            <>
              {!hasActivePlan ? (
                <AnimatedSection delay={100}>
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                      <Briefcase size={28} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-3">No Active Sale</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      The Deal Room activates once you choose a selling plan. Start with a free AI valuation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link to="/ai-valuation" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                        <Zap size={16} /> Get AI Valuation
                      </Link>
                      <Link to="/dashboard/valuations" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold border border-border rounded-full hover:border-primary/30 hover:text-primary transition-all">
                        <BarChart3 size={16} /> View My Valuations
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
              ) : (
                <>
                  {user && <SellerDashboardTab userId={user.id} />}

                  {/* Seller Legal Tracker */}
                  <AnimatedSection delay={200}>
                    <div className="mt-10">
                      <ChecklistSection
                        title="Legal Tracker — TA6 (6th Edition)"
                        icon={<FileText size={18} className="text-primary" />}
                        items={TA6_CHECKLIST}
                        checkedItems={checkedItems}
                        onToggle={toggleChecked}
                        completedCount={completedCount}
                        totalCount={totalCount}
                        completionPct={completionPct}
                        footerNote="Updated for the TA6 6th Edition effective March 30, 2026. Consult your solicitor for specific requirements."
                      />
                    </div>
                  </AnimatedSection>
                </>
              )}
            </>
          )}

          {/* ═══ BUYING MODE ═══ */}
          {mode === "buying" && (
            <>
              {/* Active Offers / Negotiations */}
              <AnimatedSection delay={100}>
                <div className="mb-8">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <MessageSquare size={18} className="text-blue-400" />
                    My Offers & AI Negotiator
                  </h3>
                  {negotiations.length === 0 ? (
                    <div className="text-center py-12 border border-border rounded-2xl bg-card/40">
                      <Bot size={32} className="text-blue-400 mx-auto mb-4" />
                      <h4 className="font-bold mb-2">No Active Negotiations</h4>
                      <p className="text-sm text-muted-foreground mb-4">Start your first AI-powered negotiation to see it here.</p>
                      <Link to="/negotiate-for-me" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-blue-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                        <Zap size={14} /> Hummm
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {negotiations.map(n => (
                        <div key={n.id} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card/40">
                          <img
                            src={`https://image.thum.io/get/width/120/crop/80/${n.property_link}`}
                            alt="Property"
                            className="w-[56px] h-[42px] rounded-lg object-cover bg-muted shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{n.property_address || n.property_link}</p>
                            <p className="text-xs text-muted-foreground">
                              Goal: <span className="capitalize">{n.goal}</span> · Package: <span className="capitalize">{n.package}</span>
                            </p>
                          </div>
                          <StrengthScoreBadge score={generateScore(n.id)} />
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400">
                            {n.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AnimatedSection>

              {/* Verified Funds & DIP Upload */}
              <AnimatedSection delay={150}>
                <DIPUploadSection userId={user?.id} onGoldChange={handleGoldChange} />
              </AnimatedSection>

              {/* ═══ GOLD STRATEGY HUB ═══ */}
              {isGold && (
                <>
                  {/* Gold Banner */}
                  <AnimatedSection delay={175}>
                    <div className="mb-8 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-primary/5">
                      <div className="flex items-center gap-4">
                        <GoldHummm size={28} pulse={true} />
                        <div>
                          <p className="text-base font-black flex items-center gap-2">
                            Hummm Gold Strategy Hub
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Elite</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            AI coaching, tactical strategies, and battle-tested templates — exclusive to verified buyers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>

                  {/* Strategy Builder */}
                  <AnimatedSection delay={200}>
                    <StrategyBuilder />
                  </AnimatedSection>

                  {/* Template Library */}
                  <AnimatedSection delay={225}>
                    <TemplateLibrary />
                  </AnimatedSection>

                  {/* AI Strategy Coach */}
                  <AnimatedSection delay={250}>
                    <StrategyCoach negotiations={negotiations} />
                  </AnimatedSection>

                  {/* Live Comps */}
                  <AnimatedSection delay={275}>
                    <LiveCompsSection />
                  </AnimatedSection>
                </>
              )}

              {/* Mortgage Progress Checklist */}
              <AnimatedSection delay={isGold ? 300 : 250}>
                <ChecklistSection
                  title="Mortgage & Purchase Progress"
                  icon={<Banknote size={18} className="text-blue-400" />}
                  items={BUYER_CHECKLIST}
                  checkedItems={checkedItems}
                  onToggle={toggleChecked}
                  completedCount={completedCount}
                  totalCount={totalCount}
                  completionPct={completionPct}
                  footerNote="Track your buying journey. Tick off each milestone as you complete it."
                />
              </AnimatedSection>
            </>
          )}

          {/* ═══ RENTING MODE ═══ */}
          {mode === "renting" && (
            <>
              {/* Reform Alert Banner */}
              <AnimatedSection delay={100}>
                <div className="mb-8 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                        Renters' Reform Act — Effective May 1st, 2026
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Section 21 'no-fault' evictions are abolished. All new tenancies are periodic.
                        Landlords cannot unreasonably refuse pets. Minimum EPC C rating required.
                        Use this tracker to ensure you're fully compliant.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Renter Status Cards */}
              <AnimatedSection delay={150}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl border border-border bg-card/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-amber-400" />
                        <span className="text-xs font-bold">Periodic Tenancy</span>
                      </div>
                      <StrengthScoreBadge score={92} />
                    </div>
                    <p className="text-2xl font-black text-amber-400">Active</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Rolling monthly — no fixed end date</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PawPrint size={16} className="text-primary" />
                        <span className="text-xs font-bold">Pet Request</span>
                      </div>
                      <StrengthScoreBadge score={45} />
                    </div>
                    <p className="text-2xl font-black text-muted-foreground">Not Submitted</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Submit a formal request to your landlord</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Leaf size={16} className="text-green-400" />
                        <span className="text-xs font-bold">EPC Rating</span>
                      </div>
                      <StrengthScoreBadge score={78} />
                    </div>
                    <p className="text-2xl font-black text-green-400">C</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Meets minimum requirement</p>
                  </div>
                </div>
              </AnimatedSection>

              {/* AI Request Drafter */}
              <AnimatedSection delay={175}>
                <RenterAIDrafter toast={toast} />
              </AnimatedSection>

              {/* Renter Compliance Checklist */}
              <AnimatedSection delay={250}>
                <ChecklistSection
                  title="Renters' Reform Compliance"
                  icon={<Shield size={18} className="text-amber-400" />}
                  items={RENTER_CHECKLIST}
                  checkedItems={checkedItems}
                  onToggle={toggleChecked}
                  completedCount={completedCount}
                  totalCount={totalCount}
                  completionPct={completionPct}
                  footerNote="Based on the Renters' Reform Act 2025, effective May 1, 2026. Check with your landlord or agent for property-specific requirements."
                />
              </AnimatedSection>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

/* ─── Live Comps Section (Gold) ─── */

type CompData = { address: string; price: number; date: string; type: string };

function LiveCompsSection({ postcode }: { postcode?: string }) {
  const [comps, setComps] = useState<CompData[]>([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(postcode || "");
  const [searched, setSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const fetchComps = async (pc: string) => {
    if (!pc.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-sold-prices", {
        body: { postcode: pc.trim() },
      });
      if (error) throw error;
      setComps(data.comps || []);
      setAvg(data.average || 0);
      setTotalResults(data.total_results || 0);
    } catch (e) {
      console.error("Failed to fetch comps:", e);
      setComps([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-amber-400" />
        Live Street Comps
        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Land Registry</span>
      </h3>

      {/* Postcode search */}
      <div className="flex gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchComps(search)}
          placeholder="Enter postcode (e.g. E14 5AB)"
          className="flex-1 px-4 py-2.5 text-sm bg-card/60 border border-border rounded-xl placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
        />
        <button
          onClick={() => fetchComps(search)}
          disabled={loading || !search.trim()}
          className="px-5 py-2.5 text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/25 transition-all disabled:opacity-40"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
        </button>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-card/40 overflow-hidden">
        {!searched ? (
          <div className="text-center py-10">
            <TrendingUp size={28} className="text-amber-400 mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">Enter a postcode to see recent sold prices from the Land Registry</p>
          </div>
        ) : loading ? (
          <div className="text-center py-10">
            <Loader2 size={24} className="animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Fetching Land Registry data...</p>
          </div>
        ) : comps.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No sold prices found for this postcode. Try a different one.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {comps.length} of {totalResults} results
              </p>
              <p className="text-sm font-black tabular-nums">Avg: £{avg.toLocaleString()}</p>
            </div>
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {comps.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-semibold truncate">{c.address}</p>
                    <p className="text-[10px] text-muted-foreground">{c.type} · Sold {formatDate(c.date)}</p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-primary shrink-0">£{c.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/20 text-center">
              <p className="text-[9px] text-muted-foreground">Source: HM Land Registry Price Paid Data via PropertyData · Last 24 months</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── DIP Upload & Verified Funds ─── */

function DIPUploadSection({ userId, onGoldChange }: { userId?: string; onGoldChange?: (v: boolean) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dipUrl, setDipUrl] = useState<string | null>(() => localStorage.getItem("humm_dip_url"));
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/dip-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("dip-documents").upload(path, file);
      if (error) throw error;
      const url = supabase.storage.from("dip-documents").getPublicUrl(path).data.publicUrl;
      setDipUrl(url);
      localStorage.setItem("humm_dip_url", url);
      onGoldChange?.(true);

      // Update mortgage lead if exists
      await (supabase.from("mortgage_leads" as any).update as any)({ has_dip: true, dip_file_url: path })
        .eq("user_id", userId);

      toast({ title: "DIP uploaded!", description: "Your offers now show the Hummm Gold badge." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Shield size={18} className="text-primary" />
        Verified Funds
      </h3>
      <div className="rounded-2xl border border-border bg-card/40 p-5">
        {dipUrl ? (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto humm-pulse">
              <Award size={28} className="text-amber-400" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 humm-pulse">
                <Award size={11} /> Hummm Gold Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your DIP is on file. Your offers display the <strong className="text-amber-400">Hummm Gold</strong> badge — sellers are <strong>3× more likely</strong> to accept.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mx-auto">
              <Upload size={24} className="text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Upload Your Decision in Principle</h4>
              <p className="text-xs text-muted-foreground">
                Verified buyers get the <strong className="text-amber-400">Hummm Gold</strong> badge, making your offers stand out to sellers.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full cursor-pointer hover:brightness-110 transition-all">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload DIP</>}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-muted-foreground">PDF, JPG, or PNG · Max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── AI Renter Request Drafter ─── */

function RenterAIDrafter({ toast }: { toast: any }) {
  const [requestType, setRequestType] = useState<"pet" | "repair">("pet");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Pet fields
  const [petType, setPetType] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petName, setPetName] = useState("");

  // Repair fields
  const [repairIssue, setRepairIssue] = useState("");
  const [repairLocation, setRepairLocation] = useState("");
  const [repairUrgency, setRepairUrgency] = useState("standard");

  // Shared
  const [propertyAddress, setPropertyAddress] = useState("");
  const [landlordName, setLandlordName] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const body: any = {
        mode: "renter",
        requestType,
        property: { address: propertyAddress || "My rented property" },
        tenancy: { landlord_name: landlordName || "My landlord", type: "Periodic" },
        details: requestType === "pet"
          ? { pet_type: petType, pet_breed: petBreed, pet_name: petName, willing_to_pay_deposit: true, has_insurance: false }
          : { issue: repairIssue, location: repairLocation, urgency: repairUrgency, first_reported: new Date().toLocaleDateString("en-GB") },
      };

      const { data, error } = await supabase.functions.invoke("analyze-offer", { body });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate request", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.body) {
      navigator.clipboard.writeText(result.body);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Bot size={18} className="text-amber-400" />
        AI Legal Request Drafter
      </h3>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        {/* Type Toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setRequestType("pet"); setResult(null); }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              requestType === "pet" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <PawPrint size={14} /> Pet Request
          </button>
          <button
            onClick={() => { setRequestType("repair"); setResult(null); }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              requestType === "repair" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Wrench size={14} /> Repair Request
          </button>
        </div>

        {/* Shared fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-xs mb-1">Property Address</Label>
            <Input placeholder="e.g. 42 Oak Lane, E14 5AB" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1">Landlord / Agent Name</Label>
            <Input placeholder="e.g. Foxtons Ltd" value={landlordName} onChange={e => setLandlordName(e.target.value)} className="text-sm" />
          </div>
        </div>

        {/* Pet-specific fields */}
        {requestType === "pet" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs mb-1">Pet Type</Label>
              <Input placeholder="e.g. Dog, Cat" value={petType} onChange={e => setPetType(e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1">Breed</Label>
              <Input placeholder="e.g. Labrador" value={petBreed} onChange={e => setPetBreed(e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1">Pet Name</Label>
              <Input placeholder="e.g. Buddy" value={petName} onChange={e => setPetName(e.target.value)} className="text-sm" />
            </div>
          </div>
        )}

        {/* Repair-specific fields */}
        {requestType === "repair" && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1">Location in Property</Label>
                <Input placeholder="e.g. Kitchen, Bathroom" value={repairLocation} onChange={e => setRepairLocation(e.target.value)} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs mb-1">Urgency</Label>
                <select
                  value={repairUrgency}
                  onChange={e => setRepairUrgency(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="standard">Standard (28 days)</option>
                  <option value="urgent">Urgent (14 days)</option>
                  <option value="critical">Critical / Emergency</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1">Describe the Issue</Label>
              <Textarea placeholder="e.g. Persistent damp on bedroom wall, mould forming..." value={repairIssue} onChange={e => setRepairIssue(e.target.value)} className="text-sm" rows={3} />
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
        >
          {loading ? <><Loader2 size={14} className="animate-spin mr-2" /> Drafting with AI...</> : <><Bot size={14} className="mr-2" /> Generate {requestType === "pet" ? "Pet" : "Repair"} Request Letter</>}
        </Button>

        {/* Result */}
        {result && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                {result.subject}
              </h4>
              <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="bg-muted/30 border border-border rounded-xl p-4">
              <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-foreground">{result.body}</pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-card/40">
                <p className="font-bold mb-1 flex items-center gap-1"><Shield size={12} className="text-amber-400" /> Legal Basis</p>
                <p className="text-muted-foreground">{result.legalBasis}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card/40">
                <p className="font-bold mb-1">Response Deadline</p>
                <p className="text-muted-foreground">{result.deadlineDays} days · Urgency: <span className="capitalize">{result.urgency}</span></p>
              </div>
            </div>

            {result.nextSteps?.length > 0 && (
              <div className="p-3 rounded-lg border border-border bg-card/40">
                <p className="text-xs font-bold mb-2">Next Steps</p>
                <ul className="space-y-1">
                  {result.nextSteps.map((step: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.escalationPath && (
              <p className="text-[10px] text-muted-foreground">
                <strong>If no response:</strong> {result.escalationPath}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Reusable Checklist Component ─── */

function ChecklistSection({
  title, icon, items, checkedItems, onToggle,
  completedCount, totalCount, completionPct, footerNote,
}: {
  title: string;
  icon: React.ReactNode;
  items: { id: string; label: string; description: string }[];
  checkedItems: Set<string>;
  onToggle: (id: string) => void;
  completedCount: number;
  totalCount: number;
  completionPct: number;
  footerNote: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
          <span className="text-xs font-bold tabular-nums text-primary">{completedCount}/{totalCount}</span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const done = checkedItems.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                done
                  ? "border-green-400/20 bg-green-400/5"
                  : "border-border bg-card/40 hover:border-primary/20"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {done ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <Circle size={18} className="text-muted-foreground/40" />
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : ""}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">{footerNote}</p>
    </div>
  );
}

export default DashboardDealRoom;
