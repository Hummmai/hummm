import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ChatWithHistory from "@/components/dashboard/ChatWithHistory";
import NegotiationInbox from "@/components/dashboard/NegotiationInbox";
import RoleSelector from "@/components/dashboard/RoleSelector";
import OnboardingFlow from "@/components/dashboard/OnboardingFlow";
import EmailWriter from "@/components/dashboard/EmailWriter";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const MortgageCommandCenter = lazy(() => import("@/components/MortgageCommandCenter"));
import {
  Loader2, Link2, LayoutDashboard, Search, MessageSquare,
  Bot, ChevronLeft, ChevronRight, Sparkles, LogOut,
  TrendingUp, ArrowRight, CheckSquare, Square,
  Home, Star, MapPin, Bed, Bath, Mail, FileText, Download, Key,
  BarChart3, Shield, Eye, X, ExternalLink, Bell, AlertTriangle, Activity,
  ChevronDown, ChevronUp, CalendarDays, Wrench, Wallet, Calculator, Users, Clock, Check,
} from "lucide-react";

/* ─── Types ─── */
type TabId = "overview" | "audits" | "negotiations" | "mortgage" | "ai" | "email";

type NavItem = { id?: TabId; to?: string; label: string; icon: any };

const ROLE_TABS: Record<string, NavItem[]> = {
  buyer: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "audits", label: "Saved Properties", icon: Star },
    { id: "negotiations", label: "Active Negotiations", icon: MessageSquare },
    { id: "mortgage", label: "Mortgage Tools", icon: TrendingUp },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "email", label: "Email Writer", icon: Mail },
  ],
  seller: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "audits", label: "My Listings", icon: Home },
    { id: "negotiations", label: "Incoming Offers", icon: MessageSquare },
    { to: "/negotiations", label: "AI Negotiation", icon: Sparkles },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "email", label: "Email Writer", icon: Mail },
  ],
  landlord: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "audits", label: "My Properties", icon: Home },
    { to: "/tenants", label: "Tenant Referencing", icon: Users },
    { to: "/tenants?tab=rent", label: "Rent Collection", icon: Wallet },
    { to: "/compliance", label: "Compliance Alerts", icon: Shield },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "email", label: "Email Writer", icon: Mail },
  ],
  renter: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "audits", label: "Saved Rentals", icon: Star },
    { id: "negotiations", label: "Active Enquiries", icon: MessageSquare },
    { to: "/budget-calculator", label: "Budget Calculator", icon: Calculator },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "email", label: "Email Writer", icon: Mail },
  ],
};

const ROLE_CONFIG: Record<string, { label: string; icon: any; welcome: string; hero: string; heroSub: string; gradient: string }> = {
  buyer:    { label: "Buyer",    icon: Home,       welcome: "Ready to find your next home?",        hero: "Find & Win Your Next Home",   heroSub: "AI-powered property intelligence to secure the best deal.",                  gradient: "from-blue-500/25 via-cyan-500/10 to-primary/15" },
  seller:   { label: "Seller",   icon: TrendingUp, welcome: "Let's get your property sold.",        hero: "Sell Smarter. Get More.",      heroSub: "Maximise your sale price with AI negotiation and market insight.",          gradient: "from-amber-500/25 via-orange-500/10 to-rose-500/10" },
  landlord: { label: "Landlord", icon: Shield,     welcome: "Your portfolio, on autopilot.",        hero: "Your Portfolio, On Autopilot", heroSub: "Compliance, yield optimisation, and tenant management in one place.",        gradient: "from-emerald-500/25 via-teal-500/15 to-cyan-500/10" },
  renter:   { label: "Renter",   icon: Key,        welcome: "Let's find your perfect rental.",      hero: "Find Your Perfect Rental",     heroSub: "Search, negotiate, and protect your tenancy with AI.",                       gradient: "from-purple-500/25 via-fuchsia-500/10 to-pink-500/15" },
};

/* ─── Helpers ─── */
function formatPrice(amount: number, currency = "GBP") {
  const s: Record<string, string> = { GBP: "£", USD: "$", SGD: "S$", EUR: "€", AED: "AED ", ZAR: "R", CHF: "CHF ", SEK: "kr", NOK: "kr", DKK: "kr" };
  return `${s[currency] || currency + " "}${amount.toLocaleString()}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Dashboard ─── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { currentRole, switchRole, userEmail, userId: ctxUserId, isLoggedIn, signOut } = useHumm();

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsRole, setNeedsRole] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const initialTab = (searchParams.get("tab") as TabId) || "overview";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [initialThreadId] = useState(() => searchParams.get("thread") || null);

  // Data
  const [savedAudits, setSavedAudits] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [landlordProperties, setLandlordProperties] = useState<any[]>([]);

  // Selections
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropUrl, setDropUrl] = useState("");
  const [dropLoading, setDropLoading] = useState(false);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addPropForm, setAddPropForm] = useState({ address: "", postcode: "", bedrooms: "", current_rent: "", property_type: "flat" });
  const [addPropLoading, setAddPropLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) setRoleMenuOpen(false);
    };
    if (roleMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [roleMenuOpen]);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast({ title: "Payment successful! 🎉", description: "Your service has been activated." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { navigate("/auth"); return; }
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_role, name, email")
        .eq("user_id", data.user.id)
        .single();

      setUserName((profile as any)?.name || data.user.email?.split("@")[0] || "there");

      const savedRole = (profile as any)?.user_role;
      if (savedRole && ["buyer", "seller", "renter", "landlord"].includes(savedRole)) {
        switchRole(savedRole);
        setNeedsRole(false);
      } else {
        setNeedsRole(true);
      }
      fetchData(data.user.id);
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    const [auditRes, negRes, landlordRes] = await Promise.all([
      supabase.from("saved_audits").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("negotiation_messages").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
      supabase.from("landlord_properties").select("*").eq("user_id", uid),
    ]);
    setSavedAudits(auditRes.data || []);
    setNegotiations(negRes.data || []);
    setLandlordProperties(landlordRes.data || []);
    setLoading(false);
  };

  const handleRoleSelect = async (role: string) => {
    await switchRole(role);
    // Check if onboarding already completed
    const uid = ctxUserId || userId;
    if (uid && localStorage.getItem(`onboarding_complete_${uid}`)) {
      setNeedsRole(false);
    } else {
      setPendingRole(role);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setPendingRole(null);
    setNeedsRole(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({ title: "Signed out", description: "See you soon! 🐦" });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    if (dropOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  const handleDropLink = async () => {
    const url = dropUrl.trim();
    if (!url) return;
    if (!url.startsWith("http")) {
      toast({ title: "Invalid URL", description: "Please paste a full property link starting with http.", variant: "destructive" });
      return;
    }
    setDropLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data: scrapeData, error: scrapeErr } = await supabase.functions.invoke("scrape-property", { body: { url } });
      if (scrapeErr || !scrapeData?.success) throw new Error(scrapeErr?.message || scrapeData?.error || "Failed to scrape property");
      const { data: auditData, error: auditErr } = await supabase.functions.invoke("deal-audit", { body: { property: scrapeData.data, url } });
      if (auditErr || !auditData) throw new Error(auditErr?.message || "Failed to analyse property");
      const p = scrapeData.data;
      const a = auditData;
      const { data: saved, error: saveErr } = await supabase.from("saved_audits").insert({
        user_id: user.id, property_url: url, address: p.address || a.address || url,
        postcode: p.postcode || a.postcode || null, asking_price: p.price || a.askingPrice || null,
        currency: a.currency || "GBP", bedrooms: p.bedrooms ?? a.bedrooms ?? null,
        bathrooms: p.bathrooms ?? a.bathrooms ?? null, property_type: p.propertyType || a.propertyType || null,
        images: p.images || [], description: p.description || null, key_features: p.keyFeatures || [],
        epc_rating: p.epcRating || null, agent_name: p.agent?.name || null, agent_email: p.agent?.email || null,
        humm_fair_value: a.hummFairValue || null, humm_fair_value_high: a.hummFairValueHigh || null,
        ai_score: a.aiScore || null, score_breakdown: a.scoreBreakdown || null,
        rental_yield_estimate: a.grossYield || null, risks: a.risks || [], opportunities: a.opportunities || [],
        recent_sales: a.recentSales || [], renovation_suggestions: a.renovationSuggestions || [],
        report_json: a, sqft: p.sqft || null, floorplan: p.floorplan || null, status: "audited",
      }).select().single();
      if (saveErr) throw saveErr;
      toast({ title: "Audit complete! ✅", description: `${p.address || "Property"} has been added to your audits.` });
      setDropUrl(""); setDropOpen(false);
      await fetchData(user.id);
      if (saved?.id) navigate(`/dashboard/audit/${saved.id}`);
    } catch (err: any) {
      console.error("Drop link error:", err);
      toast({ title: "Audit failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally { setDropLoading(false); }
  };

  const handleAddProperty = async () => {
    if (!addPropForm.address.trim()) return;
    setAddPropLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { error } = await supabase.from("landlord_properties").insert({
        user_id: user.id,
        address: addPropForm.address.trim(),
        postcode: addPropForm.postcode.trim() || null,
        bedrooms: addPropForm.bedrooms ? parseInt(addPropForm.bedrooms) : null,
        current_rent: addPropForm.current_rent ? parseFloat(addPropForm.current_rent) : null,
        property_type: addPropForm.property_type,
      });
      if (error) throw error;
      toast({ title: "Property added ✅", description: `${addPropForm.address} added to your portfolio.` });
      setAddPropForm({ address: "", postcode: "", bedrooms: "", current_rent: "", property_type: "flat" });
      setAddPropertyOpen(false);
      await fetchData(user.id);
    } catch (err: any) {
      toast({ title: "Failed to add property", description: err.message, variant: "destructive" });
    } finally { setAddPropLoading(false); }
  };

  const totalValue = savedAudits.reduce((sum, a) => sum + (a.humm_fair_value || 0), 0);
  const highScoreCount = savedAudits.filter(a => (a.ai_score || 0) >= 70).length;
  const role = ROLE_CONFIG[currentRole || "buyer"] || ROLE_CONFIG.buyer;

  const realComplianceScore = landlordProperties.length > 0
    ? Math.round(landlordProperties.reduce((sum, p) => {
        let s = 0;
        const now = Date.now();
        const soon = 60 * 24 * 60 * 60 * 1000;
        if (p.gas_cert_valid && p.gas_cert_expiry && new Date(p.gas_cert_expiry).getTime() > now) s += 25;
        else if (p.gas_cert_expiry && new Date(p.gas_cert_expiry).getTime() - now < soon && new Date(p.gas_cert_expiry).getTime() > now) s += 12;
        if (p.electrical_cert_valid && p.electrical_cert_expiry && new Date(p.electrical_cert_expiry).getTime() > now) s += 25;
        else if (p.electrical_cert_expiry && new Date(p.electrical_cert_expiry).getTime() - now < soon && new Date(p.electrical_cert_expiry).getTime() > now) s += 12;
        if (p.epc_rating && !["F", "G"].includes(p.epc_rating)) s += 25;
        else if (p.epc_rating) s += 10;
        if (p.decent_homes_compliant) s += 25;
        return sum + s;
      }, 0) / landlordProperties.length)
    : 0;

  const avgPortfolioRentGap = landlordProperties.length > 0
    ? Math.round(landlordProperties.reduce((s, p) => s + ((p.ai_market_rent || 0) - (p.current_rent || 0)), 0) / landlordProperties.length)
    : 0;

  const avgPortfolioYield = landlordProperties.length > 0 && landlordProperties.some(p => p.current_rent && p.humm_fair_value)
    ? (landlordProperties.reduce((s, p) => {
        if (p.current_rent && p.humm_fair_value) return s + ((p.current_rent * 12) / p.humm_fair_value) * 100;
        return s;
      }, 0) / landlordProperties.filter(p => p.current_rent && p.humm_fair_value).length).toFixed(1)
    : null;

  if (needsRole && !loading) {
    return (
      <>
        <SEOHead title="Choose Your Role | Hummm" description="Select your role." />
        <RoleSelector onSelect={handleRoleSelect} />
        {showOnboarding && pendingRole && (
          <OnboardingFlow
            role={pendingRole}
            userName={userName}
            userId={(ctxUserId || userId)!}
            onComplete={handleOnboardingComplete}
          />
        )}
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <SEOHead title="Command Centre | Hummm" description="Your Hummm Command Centre." />
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title={
        currentRole === "landlord" ? "Portfolio Dashboard | Hummm — Property Management"
        : currentRole === "renter" ? "Rental Dashboard | Hummm — Find Your Perfect Rental"
        : "Command Centre | Hummm — Find & Win Your Next Home"
      } description="Your Hummm Command Centre." canonical="/dashboard" />

      <div className="flex min-h-screen bg-[hsl(222,47%,5%)]">
        {/* ─── Sidebar (desktop) ─── */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 bg-[hsl(222,47%,7%)]/80 backdrop-blur-xl text-foreground transition-all duration-300 border-r border-white/[0.06] ${
            sidebarOpen ? "w-[240px]" : "w-[68px]"
          }`}
        >
          {/* Logo */}
          <div className={`flex items-center h-[64px] border-b border-white/[0.06] ${sidebarOpen ? "px-5" : "justify-center px-2"}`}>
            <span className="relative inline-flex items-center">
              <img src="/logo-transparent.png" alt="Hummm" className="h-14 w-auto" />
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-5 px-2.5 space-y-0.5">
            {(ROLE_TABS[currentRole || "buyer"] || ROLE_TABS.buyer).map((t, i) => {
              const active = !!t.id && activeTab === t.id;
              const handle = () => t.to ? navigate(t.to) : t.id && setActiveTab(t.id);
              return (
                <button
                  key={t.id || t.to || i}
                  onClick={handle}
                  title={sidebarOpen ? undefined : t.label}
                  className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                    sidebarOpen ? "px-3.5 py-3" : "justify-center px-0 py-3"
                  } ${
                    active
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  <t.icon size={17} className={active ? "text-primary" : ""} />
                  {sidebarOpen && <span className="text-[13px]">{t.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-2.5 pb-4 space-y-0.5 border-t border-white/[0.06] pt-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
            >
              {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              {sidebarOpen && <span className="text-xs">Collapse</span>}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={15} />
              {sidebarOpen && <span className="text-xs">Sign Out</span>}
            </button>
            {sidebarOpen && userEmail && (
              <p className="px-3.5 pt-2 text-[10px] text-muted-foreground/50 truncate">{userEmail}</p>
            )}
          </div>
        </aside>

        {/* ─── Main ─── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top header bar — monitoring dashboard style */}
          <header className="sticky top-0 z-30 bg-[hsl(222,47%,7%)]/90 backdrop-blur-2xl border-b border-white/[0.06]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            {/* Mobile */}
            <div className="sm:hidden flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="relative inline-flex items-center">
                  <img src="/logo-transparent.png" alt="Hummm" className="h-14 w-auto shrink-0" />
                </span>
                <span className="text-sm font-bold text-foreground truncate">Command Centre</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <RoleSwitcher
                  compact
                  currentRole={currentRole || "buyer"}
                  onSelect={(r) => { switchRole(r); setRoleMenuOpen(false); }}
                  open={roleMenuOpen}
                  setOpen={setRoleMenuOpen}
                  containerRef={roleMenuRef}
                />
                <div className="relative" ref={dropRef}>
                  <button onClick={() => currentRole === "landlord" ? setAddPropertyOpen(true) : currentRole === "seller" ? navigate("/seller/valuation") : setDropOpen(!dropOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold active:scale-[0.97] shadow-lg shadow-primary/20">
                    <Link2 size={12} /> {currentRole === "landlord" ? "Add" : currentRole === "seller" ? "Value" : "Drop"}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex items-center justify-between h-[64px] px-6 lg:px-8">
              {/* Left: logo + search */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="relative inline-flex items-center">
                    <img src="/logo-transparent.png" alt="Hummm" className="h-12 w-auto" />
                  </span>
                  <span className="text-[15px] font-bold text-foreground">Command Centre</span>
                </div>
                <div className="hidden lg:flex relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <input type="text" placeholder="Search audits, properties..."
                    className="w-[280px] pl-8 pr-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-all" />
                </div>
              </div>

              {/* Center: time filters (decorative — matches screenshot) */}
              <div className="hidden lg:flex items-center gap-1 text-xs">
                <span className="text-muted-foreground/60 mr-2">Show data for last</span>
                {["24 hours", "7 days", "30 days"].map((t, i) => (
                  <button key={t} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    i === 1 ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}>{t}</button>
                ))}
                <button className="px-3.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] font-semibold flex items-center gap-1">
                  Custom <ChevronRight size={10} className="rotate-90" />
                </button>
              </div>

              {/* Right: user + actions */}
              <div className="flex items-center gap-3">
                <RoleSwitcher
                  currentRole={currentRole || "buyer"}
                  onSelect={(r) => { switchRole(r); setRoleMenuOpen(false); }}
                  open={roleMenuOpen}
                  setOpen={setRoleMenuOpen}
                  containerRef={roleMenuRef}
                />
                <div className="relative" ref={dropRef}>
                  <button onClick={() => currentRole === "landlord" ? setAddPropertyOpen(true) : currentRole === "seller" ? navigate("/seller/valuation") : setDropOpen(!dropOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all active:scale-[0.97] shadow-lg shadow-primary/20">
                    <Link2 size={13} /> {currentRole === "landlord" ? "Add Property" : currentRole === "seller" ? "Get Valuation" : currentRole === "renter" ? "Drop Rental Link" : "Drop New Link"}
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-2 border-l border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{userName?.charAt(0)?.toUpperCase() || "U"}</span>
                  </div>
                  {userName && <span className="text-xs font-semibold text-foreground hidden xl:inline">{userName}</span>}
                </div>
              </div>
            </div>

            {/* Drop Link Dropdown */}
            {dropOpen && (
              <div className="absolute right-4 sm:right-8 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] rounded-2xl bg-[hsl(222,47%,9%)] border border-white/[0.08] shadow-2xl shadow-black/40 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-foreground">Run Property Audit</p>
                  <button onClick={() => setDropOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Paste a Rightmove, Zoopla, or any property listing URL.</p>
                <div className="flex gap-2">
                  <input type="url" value={dropUrl} onChange={(e) => setDropUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleDropLink()}
                    placeholder="https://www.rightmove.co.uk/..." disabled={dropLoading}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 disabled:opacity-50"
                    autoFocus />
                  <button onClick={handleDropLink} disabled={dropLoading || !dropUrl.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 shrink-0">
                    {dropLoading ? <><Loader2 size={14} className="animate-spin" /> Auditing...</> : <><Search size={14} /> Audit</>}
                  </button>
                </div>
                {dropLoading && (
                  <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/15">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <p className="text-xs text-primary font-medium">Scraping and analysing...</p>
                  </div>
                )}
              </div>
            )}
          </header>

          {/* Mobile Tab Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[hsl(222,47%,7%)]/95 backdrop-blur-xl border-t border-white/[0.06] flex justify-around px-1"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
            {(ROLE_TABS[currentRole || "buyer"] || ROLE_TABS.buyer).slice(0, 5).map((t, i) => {
              const active = !!t.id && activeTab === t.id;
              const handle = () => t.to ? navigate(t.to) : t.id && setActiveTab(t.id);
              return (
                <button key={t.id || t.to || i} onClick={handle}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-[9px] font-semibold transition-all min-w-[56px] min-h-[52px] active:scale-95 ${
                    active ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}>
                  <t.icon size={20} />
                  <span className="truncate">{t.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8 overflow-y-auto">
            {activeTab === "overview" && (
              <OverviewTab savedAudits={savedAudits} negotiations={negotiations} totalValue={totalValue}
                highScoreCount={highScoreCount} role={role} currentRole={currentRole || "buyer"} navigate={navigate} setActiveTab={setActiveTab} onDropLink={() => setDropOpen(true)}
                landlordProperties={landlordProperties} realComplianceScore={realComplianceScore} avgPortfolioYield={avgPortfolioYield}
                onAddProperty={() => setAddPropertyOpen(true)} />
            )}
            {activeTab === "audits" && (
              <AuditsTab savedAudits={savedAudits} selectedIds={selectedIds} toggleSelect={toggleSelect} navigate={navigate} onDropLink={() => setDropOpen(true)} />
            )}
            {activeTab === "negotiations" && <NegotiationInbox initialThreadId={initialThreadId} />}
            {activeTab === "mortgage" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Mortgage Tools</h2>
                  <p className="text-sm text-muted-foreground">Calculate payments, compare rates, and track your mortgage journey.</p>
                </div>
                <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={24} /></div>}>
                  <MortgageCommandCenter />
                </Suspense>
              </div>
            )}
            {activeTab === "ai" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">AI Assistant</h2>
                  <p className="text-sm text-muted-foreground">Ask anything about your properties, market trends, or negotiation strategy.</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-[hsl(222,47%,7%)] shadow-xl overflow-hidden" style={{ height: "calc(100vh - 240px)", minHeight: 400 }}>
                  <ChatWithHistory />
                </div>
              </div>
            )}
            {activeTab === "email" && <EmailWriter audits={savedAudits} />}
          </main>
        </div>
      </div>

      {/* ── Add Property Modal ── */}
      {addPropertyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setAddPropertyOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[hsl(222,47%,9%)] border border-white/[0.08] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-foreground">Add Property</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add a property to your portfolio</p>
              </div>
              <button onClick={() => setAddPropertyOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Address *</label>
                <input type="text" value={addPropForm.address} onChange={e => setAddPropForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Oak Street, London"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Postcode</label>
                  <input type="text" value={addPropForm.postcode} onChange={e => setAddPropForm(f => ({ ...f, postcode: e.target.value.toUpperCase() }))}
                    placeholder="SW1A 1AA"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Bedrooms</label>
                  <input type="number" min="1" max="20" value={addPropForm.bedrooms} onChange={e => setAddPropForm(f => ({ ...f, bedrooms: e.target.value }))}
                    placeholder="2"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Monthly Rent (£)</label>
                  <input type="number" min="0" value={addPropForm.current_rent} onChange={e => setAddPropForm(f => ({ ...f, current_rent: e.target.value }))}
                    placeholder="1200"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Property Type</label>
                  <select value={addPropForm.property_type} onChange={e => setAddPropForm(f => ({ ...f, property_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:border-primary/40">
                    <option value="flat">Flat</option>
                    <option value="house">House</option>
                    <option value="hmo">HMO</option>
                    <option value="studio">Studio</option>
                    <option value="maisonette">Maisonette</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">You can add compliance details (EPC, gas cert, EICR) from the Compliance Dashboard after adding.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddPropertyOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all font-medium">
                Cancel
              </button>
              <button onClick={handleAddProperty} disabled={addPropLoading || !addPropForm.address.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {addPropLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {addPropLoading ? "Adding..." : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Glassmorphic Card ─── */
const GlassCard = ({ children, className = "", glow = false, onClick }: { children: React.ReactNode; className?: string; glow?: boolean; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl transition-all duration-300
      ${glow ? "shadow-[0_0_30px_-5px_hsl(168,80%,48%,0.08)]" : ""}
      ${onClick ? "cursor-pointer hover:border-white/[0.12] hover:shadow-[0_0_40px_-5px_hsl(168,80%,48%,0.12)]" : ""}
      ${className}`}
  >
    {children}
  </div>
);

/* ─── SVG Ring Chart ─── */
const RingChart = ({ percentage, size = 130, strokeWidth = 10, color = "hsl(168,80%,48%)", label }: { percentage: number; size?: number; strokeWidth?: number; color?: string; label?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(222,47%,14%)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-[10px] text-muted-foreground font-medium">{label}</span>}
        <span className="text-2xl font-black tabular-nums" style={{ color }}>{percentage}%</span>
      </div>
    </div>
  );
};

const MiniRing = ({ percentage, size = 56, color = "hsl(168,80%,48%)" }: { percentage: number; size?: number; color?: string }) => {
  const sw = 5; const r = (size - sw) / 2; const c = 2 * Math.PI * r; const o = c - (percentage / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(222,47%,14%)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{percentage}</span>
      </div>
    </div>
  );
};

/* ─── Overview Tab ─── */
const OverviewTab = ({ savedAudits, negotiations, totalValue, highScoreCount, role, currentRole, navigate, setActiveTab, onDropLink, landlordProperties, realComplianceScore, avgPortfolioYield, onAddProperty }: any) => {
  const avgScore = savedAudits.length > 0
    ? Math.round(savedAudits.reduce((s: number, a: any) => s + (a.ai_score || 0), 0) / savedAudits.length) : 0;

  const priorityProperties = savedAudits
    .filter((a: any) => a.ai_score != null)
    .sort((a: any, b: any) => (b.ai_score || 0) - (a.ai_score || 0))
    .slice(0, 3);

  const highPotential = savedAudits.filter((a: any) => a.ai_score >= 70).slice(0, 4);
  const caution = savedAudits.filter((a: any) => a.ai_score != null && a.ai_score < 50).slice(0, 3);
  const recentActivity = savedAudits.slice(0, 6);

  // ── Derived role metrics ──
  const potentialSavings = savedAudits.reduce((sum: number, a: any) => {
    const ask = Number(a.asking_price) || 0;
    const fv = Number(a.humm_fair_value) || 0;
    return sum + Math.max(0, ask - fv);
  }, 0);
  const monthlyIncome = landlordProperties.reduce((sum: number, p: any) => sum + (Number(p.current_rent) || 0), 0);
  const occupiedCount = landlordProperties.filter((p: any) => p.tenant_name || p.is_occupied).length;
  const occupancyRate = landlordProperties.length > 0 ? Math.round((occupiedCount / landlordProperties.length) * 100) : 0;

  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [notifExpanded, setNotifExpanded] = useState(true);
  const COLLAPSED_COUNT = 3;
  const allAlerts = [...highPotential, ...caution];
  const visibleAlerts = alertsExpanded ? allAlerts : allAlerts.slice(0, COLLAPSED_COUNT);
  const visibleNotifs = notifExpanded ? recentActivity : recentActivity.slice(0, COLLAPSED_COUNT);

  // ── Role-specific config ──
  const roleStats: Record<string, { label: string; value: string; icon: any; iconColor: string; bgColor: string; link: string; action: () => void; shrinkText?: boolean }[]> = {
    buyer: [
      { label: "Properties Saved", value: savedAudits.length.toString(), icon: Home, iconColor: "text-blue-400", bgColor: "bg-blue-500/15", link: "View Audits", action: () => setActiveTab("audits") },
      { label: "Active Negotiations", value: negotiations.length.toString(), icon: MessageSquare, iconColor: "text-purple-400", bgColor: "bg-purple-500/15", link: "View Negotiations", action: () => setActiveTab("negotiations") },
      { label: "Potential Savings", value: potentialSavings > 0 ? formatPrice(potentialSavings) : "—", icon: TrendingUp, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/15", link: "Negotiate Now", action: () => setActiveTab("negotiations"), shrinkText: true },
      { label: "Deals in Pipeline", value: negotiations.filter((n: any) => n.status && n.status !== "completed").length.toString(), icon: Activity, iconColor: "text-cyan-400", bgColor: "bg-cyan-500/15", link: "View Pipeline", action: () => setActiveTab("negotiations") },
    ],
    seller: [
      { label: "Properties Listed", value: savedAudits.length.toString(), icon: Home, iconColor: "text-amber-400", bgColor: "bg-amber-500/15", link: "View Listings", action: () => setActiveTab("audits") },
      { label: "Offers Received", value: negotiations.length.toString(), icon: MessageSquare, iconColor: "text-blue-400", bgColor: "bg-blue-500/15", link: "Review Offers", action: () => navigate("/seller/offers") },
      { label: "Avg Offer vs Asking", value: negotiations.length > 0 ? "—" : "—", icon: TrendingUp, iconColor: "text-amber-400", bgColor: "bg-amber-500/15", link: "Review Offers", action: () => navigate("/seller/offers"), shrinkText: true },
      { label: "Days on Market", value: savedAudits[0]?.created_at ? `${Math.max(0, Math.floor((Date.now() - new Date(savedAudits[0].created_at).getTime()) / 86400000))}d` : "—", icon: Clock, iconColor: "text-rose-400", bgColor: "bg-rose-500/15", link: "View Listings", action: () => setActiveTab("audits") },
    ],
    landlord: [
      { label: "Properties Managed", value: landlordProperties.length.toString(), icon: Home, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/15", link: "Portfolio", action: () => navigate("/tenants") },
      { label: "Monthly Income", value: monthlyIncome > 0 ? formatPrice(monthlyIncome) : "—", icon: TrendingUp, iconColor: "text-blue-400", bgColor: "bg-blue-500/15", link: "Rent Collection", action: () => navigate("/tenants"), shrinkText: true },
      { label: "Occupancy Rate", value: landlordProperties.length > 0 ? `${occupancyRate}%` : "—", icon: BarChart3, iconColor: "text-amber-400", bgColor: "bg-amber-500/15", link: "Manage Tenants", action: () => navigate("/tenants") },
      { label: "Compliance Score", value: landlordProperties.length > 0 ? `${realComplianceScore}%` : "—", icon: Shield, iconColor: "text-teal-400", bgColor: "bg-teal-500/15", link: "Compliance", action: () => navigate("/compliance") },
    ],
    renter: [
      { label: "Saved Rentals", value: savedAudits.length.toString(), icon: Home, iconColor: "text-purple-400", bgColor: "bg-purple-500/15", link: "View Rentals", action: () => setActiveTab("audits") },
      { label: "Active Applications", value: negotiations.length.toString(), icon: MessageSquare, iconColor: "text-fuchsia-400", bgColor: "bg-fuchsia-500/15", link: "View Enquiries", action: () => setActiveTab("negotiations") },
      { label: "Viewings Booked", value: "—", icon: CalendarDays, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/15", link: "View Viewings", action: () => navigate("/viewings") },
      { label: "Avg Rent Negotiated", value: "—", icon: Wallet, iconColor: "text-pink-400", bgColor: "bg-pink-500/15", link: "Negotiate", action: () => setActiveTab("negotiations"), shrinkText: true },
    ],
  };

  const roleActions: Record<string, { label: string; icon: any; desc: string; action?: () => void; path?: string }[]> = {
    buyer: [
      { label: "Drop New Link", icon: Link2, action: onDropLink, desc: "Audit any listing" },
      { label: "Browse Saved Audits", icon: Search, action: () => setActiveTab("audits"), desc: "Your reports" },
      { label: "Mortgage Calculator", icon: TrendingUp, action: () => setActiveTab("mortgage"), desc: "Repayment & DIP" },
      { label: "Book Viewing", icon: CalendarDays, path: "/viewings", desc: "Schedule a visit" },
    ],
    seller: [
      { label: "List New Property", icon: Home, path: "/sell-my-property", desc: "Start your listing" },
      { label: "Review Offers", icon: MessageSquare, path: "/seller/offers", desc: "Manage offers" },
      { label: "AI Negotiation Assistant", icon: Bot, action: () => setActiveTab("negotiations"), desc: "Counter smarter" },
      { label: "Get Valuation", icon: Sparkles, path: "/seller/valuation", desc: "AI price estimate" },
    ],
    landlord: [
      { label: "Add Property", icon: Home, action: onAddProperty, desc: "Portfolio audit" },
      { label: "Tenant Referencing", icon: Shield, path: "/tenants", desc: "Vet applicants" },
      { label: "Set Up Rent Collection", icon: Wallet, path: "/tenants", desc: "Track payments" },
      { label: "Maintenance Requests", icon: Wrench, path: "/tenants", desc: "Issues & repairs" },
    ],
    renter: [
      { label: "Drop Rental Link", icon: Link2, action: onDropLink, desc: "Audit rental" },
      { label: "Browse Rentals", icon: Search, action: () => setActiveTab("audits"), desc: "Saved rentals" },
      { label: "Negotiation Assistant", icon: Bot, action: () => setActiveTab("negotiations"), desc: "Negotiate rent" },
      { label: "Budget Calculator", icon: Calculator, path: "/budget-calculator", desc: "Plan affordability" },
    ],
  };

  const stats = roleStats[currentRole] || roleStats.buyer;
  const actions = roleActions[currentRole] || roleActions.buyer;
  const rc = role;

  // Right sidebar alert labels based on role
  const alertTitle = currentRole === "landlord" ? "Compliance Alerts" : currentRole === "seller" ? "Offer Alerts" : "Market Alerts";
  const notifTitle = currentRole === "landlord" ? "Portfolio Updates" : currentRole === "seller" ? "Listing Updates" : currentRole === "renter" ? "Rental Updates" : "Notifications";

  return (
    <div className="flex gap-6">
      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Hero Banner */}
        <GlassCard className={`p-6 sm:p-8 bg-gradient-to-br ${rc.gradient} overflow-hidden relative`} glow>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <rc.icon size={20} className="text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{rc.label} Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1 text-balance">{rc.hero}</h1>
            <p className="text-sm text-muted-foreground max-w-md">{rc.heroSub}</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04]">
            <rc.icon size={160} />
          </div>
        </GlassCard>

        {/* Stats Row: Ring + Role Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Donut */}
          <GlassCard className="p-6 flex flex-col items-center justify-center" glow>
            <RingChart percentage={avgScore} label={currentRole === "landlord" ? "Compliance" : "All Audits"}
              color={avgScore >= 70 ? "hsl(48,95%,55%)" : avgScore >= 50 ? "hsl(168,80%,48%)" : "hsl(0,70%,55%)"} />
            <p className="text-[11px] text-muted-foreground mt-3 font-medium">
              {currentRole === "landlord" ? "Compliance Score" : "Avg. AI Score"}
            </p>
          </GlassCard>

          {/* Stat Cards */}
          {stats.map((s) => (
            <GlassCard key={s.label} className="p-5 flex flex-col justify-between overflow-hidden" glow>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <div className="flex items-center gap-3 mb-5 min-w-0">
                <div className={`w-9 h-9 rounded-lg ${s.bgColor} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className={s.iconColor} />
                </div>
                <span className={`font-extrabold tabular-nums text-foreground truncate ${s.shrinkText ? "text-xl sm:text-2xl" : "text-3xl"}`}>{s.value}</span>
              </div>
              <button onClick={s.action} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                {s.link} <ArrowRight size={12} />
              </button>
            </GlassCard>
          ))}
        </div>

        {/* Priority Properties / Portfolio */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">
              {currentRole === "landlord" ? "Portfolio Overview" : currentRole === "seller" ? "My Listings" : currentRole === "renter" ? "Saved Rentals" : "Priority Properties"}
            </h3>
            <button onClick={() => setActiveTab("audits")} className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={10} />
            </button>
          </div>

          {priorityProperties.length === 0 ? (
            <GlassCard className="p-12 text-center border-2 border-dashed border-white/[0.06]">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/10">
                <rc.icon size={22} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {currentRole === "landlord" ? "No properties in portfolio" : currentRole === "seller" ? "No listings yet" : currentRole === "renter" ? "No saved rentals" : "No properties yet"}
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                {currentRole === "landlord" ? "Add a property to start tracking compliance and yield." : currentRole === "seller" ? "Get an AI valuation to start selling." : "Drop a property link to start your AI-powered audit."}
              </p>
              <button onClick={onDropLink} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">
                <Link2 size={14} /> {currentRole === "landlord" ? "Add Property" : currentRole === "seller" ? "Get Valuation" : "Drop a Link"}
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {priorityProperties.map((a: any) => {
                const scoreColor = a.ai_score >= 70 ? "hsl(168,80%,48%)" : a.ai_score >= 50 ? "hsl(48,95%,55%)" : "hsl(0,70%,55%)";
                return (
                  <GlassCard key={a.id} className="p-5 group" onClick={() => navigate(`/dashboard/audit/${a.id}`)}>
                    <p className="text-sm font-bold text-foreground mb-4 line-clamp-1 group-hover:text-primary transition-colors">{a.address || "Property"}</p>
                    <div className="flex items-start gap-4">
                      <MiniRing percentage={a.ai_score || 0} color={scoreColor} />
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Key Metrics</p>
                        {a.asking_price && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            <span className="text-foreground/80 font-medium">{formatPrice(a.asking_price, a.currency || "GBP")}</span>
                          </div>
                        )}
                        {a.humm_fair_value && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-foreground/80 font-medium">FV: {formatPrice(a.humm_fair_value, a.currency || "GBP")}</span>
                          </div>
                        )}
                        {a.bedrooms && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="text-muted-foreground">{a.bedrooms} bed · {a.property_type || "Property"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 mt-4 transition-colors">
                      View Report <ArrowRight size={12} />
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((a) => (
              <GlassCard key={a.label} className="p-4 text-center group" onClick={() => a.action ? a.action() : navigate(a.path!)}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ring-1 ring-primary/10">
                  <a.icon size={18} className="text-primary" />
                </div>
                <p className="text-xs font-bold text-foreground mb-0.5">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="hidden xl:flex flex-col w-[280px] shrink-0 gap-5">
        <GlassCard className="p-5" glow>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <h4 className="text-sm font-bold text-foreground">{alertTitle}</h4>
            </div>
            <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-2.5">
            {visibleAlerts.length > 0 ? (
              visibleAlerts.map((a: any) => {
                const isHigh = (a.ai_score || 0) >= 70;
                return (
                  <div key={a.id} className="flex items-start gap-2.5 cursor-pointer hover:bg-white/[0.03] rounded-lg p-2 -mx-2 transition-colors"
                    onClick={() => navigate(`/dashboard/audit/${a.id}`)}>
                    <div className={`w-5 h-5 rounded-md ${isHigh ? "bg-emerald-500/15" : "bg-red-500/15"} flex items-center justify-center shrink-0 mt-0.5`}>
                      {isHigh ? <Star size={10} className="text-emerald-400" /> : <Shield size={10} className="text-red-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{a.address?.split(",")[0] || "Property"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {timeAgo(a.created_at)} · <span className={isHigh ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>{isHigh ? "High Potential" : "Caution"}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground/50 text-center py-3">No alerts yet.</p>
            )}
          </div>
          {allAlerts.length > COLLAPSED_COUNT && (
            <button onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="flex items-center gap-1 mx-auto mt-3 text-[10px] text-primary font-medium hover:underline transition-colors">
              {alertsExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show all ({allAlerts.length})</>}
            </button>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-primary" />
              <h4 className="text-sm font-bold text-foreground">{notifTitle}</h4>
            </div>
            <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-2.5">
            {visibleNotifs.length > 0 ? (
              visibleNotifs.map((a: any) => {
                const colors = ["text-emerald-400", "text-blue-400", "text-amber-400", "text-purple-400"];
                const bgColors = ["bg-emerald-500/15", "bg-blue-500/15", "bg-amber-500/15", "bg-purple-500/15"];
                const icons = [Activity, Search, Star, Bell];
                const idx = Math.abs((a.id?.charCodeAt(0) || 0)) % 4;
                const Ic = icons[idx];
                return (
                  <div key={a.id} className="flex items-start gap-2.5 cursor-pointer hover:bg-white/[0.03] rounded-lg p-2 -mx-2 transition-colors"
                    onClick={() => navigate(`/dashboard/audit/${a.id}`)}>
                    <div className={`w-5 h-5 rounded-md ${bgColors[idx]} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Ic size={10} className={colors[idx]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{a.address?.split(",")[0] || "Audit"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        {timeAgo(a.created_at)}
                        {a.ai_score != null && (
                          <span className={`font-medium ${a.ai_score >= 70 ? "text-emerald-400" : a.ai_score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                            · Score {a.ai_score}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground/50 text-center py-3">No updates yet.</p>
            )}
          </div>
          {recentActivity.length > COLLAPSED_COUNT && (
            <button onClick={() => setNotifExpanded(!notifExpanded)}
              className="flex items-center gap-1 mx-auto mt-3 text-[10px] text-primary font-medium hover:underline transition-colors">
              {notifExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show all ({recentActivity.length})</>}
            </button>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

/* ─── Audits Tab ─── */
const AuditsTab = ({ savedAudits, selectedIds, toggleSelect, navigate, onDropLink }: any) => {
  const selectedAudits = savedAudits.filter((a: any) => selectedIds.has(a.id));
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Audits</h2>
          <p className="text-sm text-muted-foreground mt-1">{savedAudits.length} {savedAudits.length === 1 ? "property" : "properties"} audited</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.size >= 2 && (
            <button onClick={() => setShowCompare(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              <Sparkles size={14} /> Compare {selectedIds.size}
            </button>
          )}
          <button onClick={onDropLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Link2 size={14} /> Drop New Link
          </button>
        </div>
      </div>

      {savedAudits.length === 0 ? (
        <GlassCard className="p-16 sm:p-20 text-center border-2 border-dashed border-white/[0.06]">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 ring-1 ring-primary/10">
            <Search size={24} className="text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground mb-2">No audits yet</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Drop a property link to get your first AI-powered report.</p>
          <button onClick={onDropLink} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20">
            <Link2 size={15} /> Drop Your First Link
          </button>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {savedAudits.map((a: any) => {
            const isSelected = selectedIds.has(a.id);
            return (
              <div key={a.id}
                className={`group rounded-2xl border overflow-hidden transition-all duration-300 relative ${
                  isSelected ? "border-primary/40 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "border-white/[0.06] hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                } bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl`}>
                <button onClick={(e) => { e.stopPropagation(); toggleSelect(a.id); }}
                  className="absolute top-3 left-3 z-10 w-8 h-8 rounded-xl border border-white/10 bg-[hsl(222,47%,8%)]/90 backdrop-blur-sm flex items-center justify-center hover:border-primary transition-colors">
                  {isSelected ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} className="text-muted-foreground" />}
                </button>
                <div className="h-44 bg-[hsl(222,47%,12%)] relative overflow-hidden cursor-pointer" onClick={() => navigate(`/dashboard/audit/${a.id}`)}>
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Home size={28} className="text-muted-foreground/40" /></div>
                  )}
                  {a.ai_score != null && (
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm shadow-lg ${
                      a.ai_score >= 70 ? "bg-primary/90 text-primary-foreground shadow-primary/30" : a.ai_score >= 50 ? "bg-amber-500/90 text-white shadow-amber-500/20" : "bg-white/15 text-foreground"
                    }`}>AI {a.ai_score}</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-3 cursor-pointer leading-snug"
                    onClick={() => navigate(`/dashboard/audit/${a.id}`)}>{a.address || "Property"}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-4">
                    {a.asking_price && <span className="font-bold text-foreground/90">{formatPrice(a.asking_price, a.currency || "GBP")}</span>}
                    {a.humm_fair_value && <span className="text-primary font-bold">Fair: {formatPrice(a.humm_fair_value, a.currency || "GBP")}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    {a.bedrooms && <span className="flex items-center gap-1"><Bed size={12} /> {a.bedrooms} bed</span>}
                    {a.bathrooms && <span className="flex items-center gap-1"><Bath size={12} /> {a.bathrooms} bath</span>}
                    {a.property_type && <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-medium">{a.property_type}</span>}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
                    <button onClick={() => navigate(`/dashboard/audit/${a.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
                      <Eye size={13} /> View Report
                    </button>
                    <button onClick={() => navigate("/negotiate-for-me", { state: { propertyUrl: a.property_url, propertyAddress: a.address, agentEmail: a.agent_email || "", askingPrice: a.asking_price, fairValue: a.humm_fair_value } })}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-[0.97]">
                      <MessageSquare size={13} /> Hummm
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCompare && selectedIds.size >= 2 && (
        <CompareModal audits={selectedAudits} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
};

/* ─── Compare Modal ─── */
const CompareModal = ({ audits, onClose }: { audits: any[]; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
    <div className="bg-[hsl(222,47%,8%)] border border-white/[0.08] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06]">
        <h3 className="text-lg font-bold text-foreground">Property Comparison</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">Close</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-7 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metric</th>
              {audits.map((a) => (
                <th key={a.id} className="text-left px-5 py-4 text-xs font-bold text-foreground max-w-[200px] truncate">{a.address || "Property"}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {[
              { label: "Asking Price", fn: (a: any) => a.asking_price ? formatPrice(a.asking_price, a.currency || "GBP") : "—" },
              { label: "Fair Value", fn: (a: any) => a.humm_fair_value ? formatPrice(a.humm_fair_value, a.currency || "GBP") : "—" },
              { label: "AI Score", fn: (a: any) => a.ai_score != null ? `${a.ai_score}/100` : "—" },
              { label: "Bedrooms", fn: (a: any) => a.bedrooms?.toString() || "—" },
              { label: "Bathrooms", fn: (a: any) => a.bathrooms?.toString() || "—" },
              { label: "Type", fn: (a: any) => a.property_type || "—" },
              { label: "Yield Est.", fn: (a: any) => a.rental_yield_estimate ? `${a.rental_yield_estimate}%` : "—" },
            ].map((row) => (
              <tr key={row.label} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-7 py-4 text-xs font-semibold text-muted-foreground">{row.label}</td>
                {audits.map((a) => (
                  <td key={a.id} className="px-5 py-4 text-xs text-foreground font-medium">{row.fn(a)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Dashboard;

/* ─── Premium Role Switcher ─── */
const ROLE_OPTIONS = [
  { id: "buyer",    label: "Buyer",    short: "Buy",  icon: Home,       tint: "from-blue-500/30 to-cyan-500/10",    ring: "text-blue-300" },
  { id: "seller",   label: "Seller",   short: "Sell", icon: TrendingUp, tint: "from-amber-500/30 to-rose-500/10",   ring: "text-amber-300" },
  { id: "landlord", label: "Landlord", short: "Let",  icon: Shield,     tint: "from-emerald-500/30 to-teal-500/10", ring: "text-emerald-300" },
  { id: "renter",   label: "Renter",   short: "Rent", icon: Key,        tint: "from-purple-500/30 to-fuchsia-500/10", ring: "text-purple-300" },
];

const RoleSwitcher = ({
  currentRole, onSelect, open, setOpen, containerRef, compact = false,
}: {
  currentRole: string;
  onSelect: (r: string) => void;
  open: boolean;
  setOpen: (b: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  compact?: boolean;
}) => {
  const current = ROLE_OPTIONS.find((r) => r.id === currentRole) || ROLE_OPTIONS[0];
  const CurrentIcon = current.icon;
  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`group relative inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-gradient-to-br ${current.tint} backdrop-blur-xl text-foreground font-semibold transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_24px_-6px_hsl(168_80%_48%/0.45)] active:scale-[0.97] ${
          compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"
        }`}
      >
        <span className={`flex items-center justify-center rounded-lg bg-background/40 ring-1 ring-white/[0.06] ${compact ? "w-5 h-5" : "w-6 h-6"}`}>
          <CurrentIcon size={compact ? 11 : 13} className={current.ring} />
        </span>
        <span>{compact ? current.short : current.label}</span>
        <ChevronDown size={compact ? 11 : 13} className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[220px] rounded-2xl bg-[hsl(222,47%,9%)]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/50 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Switch Role</p>
          {ROLE_OPTIONS.map((r) => {
            const Ic = r.icon;
            const active = r.id === currentRole;
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={`group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  active
                    ? `bg-gradient-to-r ${r.tint} ring-1 ring-primary/30`
                    : "hover:bg-white/[0.05]"
                }`}
              >
                <span className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${r.tint} ring-1 ring-white/[0.06] shrink-0 transition-transform group-hover:scale-110`}>
                  <Ic size={16} className={r.ring} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-foreground">{r.label}</span>
                  <span className="block text-[10px] text-muted-foreground">
                    {r.id === "buyer" ? "Find & win deals" : r.id === "seller" ? "Sell smarter" : r.id === "landlord" ? "Portfolio autopilot" : "Find your rental"}
                  </span>
                </span>
                {active && <Check size={14} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
