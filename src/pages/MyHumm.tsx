import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import {
  Home,
  Plus,
  Sparkles,
  ArrowRight,
  Tag,
  Key,
  Shield,
  MessageSquare,
  Settings2,
  Loader2,
  Activity,
} from "lucide-react";

type AutonomyLevel = "full" | "approve" | "manual";

interface UnifiedProperty {
  key: string;
  address: string;
  postcode?: string | null;
  status: string;
  intent: "sale" | "let" | "valuation" | "managed" | "audit" | "negotiation";
  autonomy: AutonomyLevel;
  source: string;
  href?: string;
  meta?: string;
  createdAt?: string;
}

const intentLabel: Record<UnifiedProperty["intent"], string> = {
  sale: "For Sale",
  let: "To Let",
  valuation: "Valued",
  managed: "Managed",
  audit: "Audited",
  negotiation: "Negotiating",
};

const intentTone: Record<UnifiedProperty["intent"], string> = {
  sale: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  let: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  valuation: "bg-primary/15 text-primary border-primary/30",
  managed: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  audit: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  negotiation: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function getStoredAutonomy(key: string): AutonomyLevel {
  if (typeof window === "undefined") return "approve";
  const v = localStorage.getItem(`humm_autonomy_${key}`);
  return (v as AutonomyLevel) || "approve";
}
function setStoredAutonomy(key: string, level: AutonomyLevel) {
  localStorage.setItem(`humm_autonomy_${key}`, level);
}

export default function MyHumm() {
  const { isLoggedIn, userId } = useHumm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<UnifiedProperty[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth?redirect=/my-hummm");
      return;
    }
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [listings, landlord, vals, audits, threads] = await Promise.all([
        supabase.from("property_listings").select("id,address,postcode,listing_intent,live_status,asking_price,created_at").eq("user_id", user.id),
        supabase.from("landlord_properties").select("id,address,postcode,current_rent,compliance_status,created_at").eq("user_id", user.id),
        supabase.from("ai_valuations").select("id,address,postcode,valuation_low,valuation_high,created_at").or(`user_id.eq.${user.id},email.eq.${user.email}`),
        supabase.from("saved_audits").select("id,address,postcode,property_url,asking_price,created_at").eq("user_id", user.id).limit(20),
        supabase.from("negotiation_loop_threads").select("id,property_address,property_url,current_offer,status,created_at").eq("user_id", user.id),
      ]);

      const unified: UnifiedProperty[] = [];

      (listings.data || []).forEach((l: any) => {
        const intent = l.listing_intent === "let" ? "let" : "sale";
        const key = `listing-${l.id}`;
        unified.push({
          key,
          address: l.address,
          postcode: l.postcode,
          status: l.live_status || "draft",
          intent: intent as any,
          autonomy: getStoredAutonomy(key),
          source: "listing",
          href: intent === "let" ? "/let-my-property" : "/sell-my-property",
          meta: l.asking_price || undefined,
          createdAt: l.created_at,
        });
      });
      (landlord.data || []).forEach((l: any) => {
        const key = `landlord-${l.id}`;
        unified.push({
          key,
          address: l.address,
          postcode: l.postcode,
          status: l.compliance_status === "green" ? "compliant" : l.compliance_status || "review",
          intent: "managed",
          autonomy: getStoredAutonomy(key),
          source: "landlord",
          href: "/dashboard/landlord",
          meta: l.current_rent ? `£${l.current_rent} pcm` : undefined,
          createdAt: l.created_at,
        });
      });
      (vals.data || []).forEach((v: any) => {
        const key = `val-${v.id}`;
        unified.push({
          key,
          address: v.address,
          postcode: v.postcode,
          status: "valuation ready",
          intent: "valuation",
          autonomy: getStoredAutonomy(key),
          source: "valuation",
          href: "/dashboard/valuations",
          meta: v.valuation_low && v.valuation_high ? `£${(v.valuation_low/1000).toFixed(0)}k – £${(v.valuation_high/1000).toFixed(0)}k` : undefined,
          createdAt: v.created_at,
        });
      });
      (audits.data || []).forEach((a: any) => {
        const key = `audit-${a.id}`;
        unified.push({
          key,
          address: a.address || a.property_url,
          postcode: a.postcode,
          status: "audited",
          intent: "audit",
          autonomy: getStoredAutonomy(key),
          source: "audit",
          href: `/dashboard/audit/${a.id}`,
          meta: a.asking_price ? `£${a.asking_price.toLocaleString()}` : undefined,
          createdAt: a.created_at,
        });
      });
      (threads.data || []).forEach((t: any) => {
        const key = `neg-${t.id}`;
        unified.push({
          key,
          address: t.property_address || t.property_url || "Negotiation",
          status: t.status || "active",
          intent: "negotiation",
          autonomy: getStoredAutonomy(key),
          source: "negotiation",
          href: "/humm-ai-negotiator",
          meta: t.current_offer ? `Offer: £${Number(t.current_offer).toLocaleString()}` : undefined,
          createdAt: t.created_at,
        });
      });

      unified.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setProperties(unified);
      setLoading(false);
    })();
  }, [isLoggedIn, userId, tick, navigate]);

  const updateAutonomy = (key: string, level: AutonomyLevel) => {
    setStoredAutonomy(key, level);
    setTick((t) => t + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEOHead
        title="My Hummm — Your Autonomous Property Agent"
        description="One dashboard for every property. Hummm AI values, sells, lets, negotiates, and manages on your behalf — with the autonomy you choose."
        canonical="/my-hummm"
        noindex
      />
      <Navbar />

      <main className="relative pt-40 sm:pt-44 pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Header */}
          <header className="mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">My Hummm</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-balance" style={{ fontFamily: '"Cormorant Garamond","Playfair Display",Georgia,serif', fontWeight: 500 }}>
              Your <span className="text-primary italic">autonomous property agent</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/65 max-w-2xl">
              Every property in one place. Hummm AI values, lists, negotiates, and manages —
              you choose how much it does on its own.
            </p>
          </header>

          {/* Quick actions */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <QuickAction to="/sell-my-property" icon={Tag} label="Start a Sale" tone="emerald" />
            <QuickAction to="/let-my-property" icon={Key} label="Start a Letting" tone="sky" />
            <QuickAction to="/humm-ai-negotiator" icon={MessageSquare} label="Negotiate a Deal" tone="rose" />
            <QuickAction to="/free-valuation" icon={Sparkles} label="Free AI Valuation" tone="primary" />
          </section>

          {/* Property list */}
          <section className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Your portfolio
                </h2>
                <p className="text-xs text-muted-foreground mt-1">All properties, all stages — one view.</p>
              </div>
              <Link to="/free-valuation" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20">
                <Plus size={12} /> Add Property
              </Link>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {properties.map((p) => (
                  <PropertyRow key={p.key} p={p} onAutonomy={updateAutonomy} />
                ))}
              </div>
            )}
          </section>

          {/* Next best actions */}
          <NextBestActions properties={properties} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, tone }: { to: string; icon: any; label: string; tone: "emerald" | "sky" | "rose" | "primary" }) {
  const toneClass = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/30",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-300 border-sky-500/30",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300 border-rose-500/30",
    primary: "from-primary/20 to-primary/5 text-primary border-primary/30",
  }[tone];
  return (
    <Link to={to} className={`group card-hover rounded-2xl border bg-gradient-to-br ${toneClass} p-5 flex items-center gap-4 transition-all`}>
      <div className="w-11 h-11 rounded-xl bg-background/40 border border-white/5 flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold tracking-tight">{label}</p>
        <p className="text-[11px] text-white/50 mt-0.5">Hummm handles the rest</p>
      </div>
      <ArrowRight size={14} className="opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
    </Link>
  );
}

function PropertyRow({ p, onAutonomy }: { p: UnifiedProperty; onAutonomy: (k: string, l: AutonomyLevel) => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 hover:border-primary/40 transition-all p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Home size={16} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${intentTone[p.intent]}`}>
                {intentLabel[p.intent]}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{p.status}</span>
            </div>
            <p className="text-sm font-bold truncate">{p.address}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {[p.postcode, p.meta].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AutonomyToggle value={p.autonomy} onChange={(l) => onAutonomy(p.key, l)} />
          {p.href && (
            <Link to={p.href} className="btn-press inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              Open <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function AutonomyToggle({ value, onChange }: { value: AutonomyLevel; onChange: (l: AutonomyLevel) => void }) {
  const opts: { v: AutonomyLevel; label: string }[] = [
    { v: "full", label: "Auto" },
    { v: "approve", label: "Approve" },
    { v: "manual", label: "Manual" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border/60 bg-background/60 p-0.5" title="Hummm autonomy">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all ${
            value === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-14 border border-dashed border-border/60 rounded-2xl">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <Sparkles size={22} className="text-primary" />
      </div>
      <p className="text-base font-bold mb-1">No properties yet</p>
      <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
        Add a property and Hummm AI will value it, market it, negotiate, and manage it — on the autonomy level you choose.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Link to="/free-valuation" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-primary text-primary-foreground">
          <Plus size={13} /> Add by Valuation
        </Link>
        <Link to="/sell-my-property" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-primary/40 text-primary">
          <Tag size={13} /> Add to Sell
        </Link>
        <Link to="/let-my-property" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-primary/40 text-primary">
          <Key size={13} /> Add to Let
        </Link>
      </div>
    </div>
  );
}

function NextBestActions({ properties }: { properties: UnifiedProperty[] }) {
  const suggestions: { title: string; body: string; href: string; icon: any }[] = [];
  const hasSale = properties.some((p) => p.intent === "sale");
  const hasLet = properties.some((p) => p.intent === "let");
  const hasManaged = properties.some((p) => p.intent === "managed");
  const hasNeg = properties.some((p) => p.intent === "negotiation");

  if (!hasSale) suggestions.push({ title: "List a property for sale", body: "Hummm sets the strategy, books photos, lists across portals, and negotiates.", href: "/sell-my-property", icon: Tag });
  if (!hasLet) suggestions.push({ title: "Let a property", body: "AI pricing, tenant find, screening, agreement, and rent collection.", href: "/let-my-property", icon: Key });
  if (!hasManaged) suggestions.push({ title: "Add a property to manage", body: "Compliance, maintenance, financials — handled automatically.", href: "/dashboard/landlord", icon: Shield });
  if (!hasNeg) suggestions.push({ title: "Start a negotiation", body: "Paste a listing — your first negotiation is free.", href: "/humm-ai-negotiator", icon: MessageSquare });

  if (suggestions.length === 0) return null;

  return (
    <section className="mt-10">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/70 mb-4 flex items-center gap-2">
        <Settings2 size={13} /> Hummm suggests next
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {suggestions.slice(0, 4).map((s) => (
          <Link key={s.title} to={s.href} className="card-hover group rounded-2xl border border-border/60 bg-card/60 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <s.icon size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold mb-1">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.body}</p>
            </div>
            <ArrowRight size={14} className="text-primary/60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </section>
  );
}