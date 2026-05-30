import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles, ArrowRight, Link2, ShieldCheck, Zap, Brain, Mail,
  CheckCircle2, Car, Home, Ship, Watch, Bike, Gem, MessageSquare, Eye, Clock,
  Crown, TrendingUp, Rocket,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

type Tier = {
  id: "free" | "starter" | "pro" | "investor";
  name: string;
  tagline: string;
  monthly: number;
  credits: string;
  popular?: boolean;
  icon: typeof Crown;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Your first negotiation is on us",
    monthly: 0,
    credits: "50 credits",
    icon: Sparkles,
    features: [
      "1 full negotiation (50 credits)",
      "Instant AI valuation + audit",
      "Email drafts in your tone of voice",
      "No card required",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "For occasional deals",
    monthly: 9,
    credits: "300 credits / month",
    icon: Rocket,
    features: [
      "~6 negotiations per month (300 credits)",
      "Full AI valuation engine",
      "Email drafts + reply handling",
      "Tone selector (Polite / Firm / Aggressive)",
      "Cancel anytime",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Unlimited negotiations",
    monthly: 29,
    credits: "Unlimited",
    popular: true,
    icon: Crown,
    features: [
      "Unlimited AI negotiations",
      "Priority AI processing",
      "Multi-property strategy mode",
      "Conversation memory across deals",
      "Pause or downgrade easily",
      "Cancel anytime",
    ],
  },
  {
    id: "investor",
    name: "Investor",
    tagline: "Unlimited + portfolio extras",
    monthly: 79,
    credits: "Unlimited + extras",
    icon: TrendingUp,
    features: [
      "Everything in Pro",
      "Portfolio command-centre tools",
      "Yield, ROI & cashflow modelling",
      "Bulk listing analysis",
      "Dedicated account success",
      "Early access to new markets",
    ],
  },
];

const SUPPORTED_SITES = [
  "Rightmove", "Zoopla", "OnTheMarket", "AutoTrader", "eBay",
  "PropertyFinder", "Bayut", "Boats.com", "Chrono24", "Gumtree",
];

const CATEGORIES = [
  { icon: Home, label: "Property" },
  { icon: Car, label: "Cars" },
  { icon: Bike, label: "Bikes" },
  { icon: Ship, label: "Boats" },
  { icon: Watch, label: "Watches" },
  { icon: Gem, label: "Luxury Items" },
];

const STEPS = [
  {
    n: "01",
    icon: Link2,
    title: "Paste a link or enter details",
    desc: "Drop any listing URL — property, car, boat, watch — or describe the item manually. We support all major marketplaces.",
  },
  {
    n: "02",
    icon: Brain,
    title: "AI analyses the real value",
    desc: "Our engine cross-references comparable sales, condition signals and current market data to expose the true fair value.",
  },
  {
    n: "03",
    icon: Mail,
    title: "AI negotiates for you",
    desc: "We draft the strategy and every message. You stay in full control — approve, edit or reject each step before it sends.",
  },
];

const FEATURES = [
  { icon: Link2, title: "Works on any listing", desc: "Rightmove, Zoopla, AutoTrader, eBay, PropertyFinder, Chrono24 and more — paste any link." },
  { icon: Sparkles, title: "Multi-asset support", desc: "Property, cars, bikes, boats, watches and luxury items — one AI, every category." },
  { icon: MessageSquare, title: "Tone selector", desc: "Choose Polite, Firm or Aggressive. The AI adapts every email to match your style." },
  { icon: Mail, title: "Full email drafting", desc: "From the opening offer to the closing handshake — every reply professionally written." },
  { icon: Eye, title: "You approve every step", desc: "Nothing sends without you. Transparent, audit-ready, fully under your control." },
  { icon: Clock, title: "Handles the back-and-forth", desc: "Counter-offers, objections, stalling tactics — the AI keeps the deal moving for days or weeks." },
];

export default function NegotiateForMeAI() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefAddress = params.get("address") || "";
  const prefPrice = Number(params.get("price")) || 0;
  const prefFair = Number(params.get("fairValue")) || 0;

  useEffect(() => {
    if (prefAddress && !input) setInput(prefAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefAddress]);

  const startNegotiation = () => {
    const trimmed = input.trim();
    const qp = new URLSearchParams();
    if (trimmed) qp.set("source", trimmed);
    if (prefPrice) qp.set("price", String(prefPrice));
    if (prefFair) qp.set("fairValue", String(prefFair));
    const qs = qp.toString() ? `?${qp.toString()}` : "";
    navigate(`/negotiate-for-me${qs}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      <SEOHead
        title="Negotiate For Me AI — Drop Any Link. First Negotiation Free."
        description="Our AI finds real value and negotiates harder than you ever could. Property, cars, boats, watches and more. Your first negotiation is completely free. Average savings £1,850."
        canonical="/negotiate-for-me-ai"
      />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-20">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(222 47% 16%) 0%, hsl(222 50% 9%) 55%, hsl(222 55% 6%) 100%)",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "30%", left: "50%",
              width: "70vw", height: "70vw", maxWidth: 1100, maxHeight: 1100,
              background: "radial-gradient(circle, hsl(168 75% 42% / 0.30) 0%, transparent 60%)",
              filter: "blur(80px)",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.22em] mb-7">
            <Sparkles size={12} />
            Hummm Negotiator
            <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px]">First Free</span>
          </div>

          {prefAddress && (
            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl border border-primary/30 bg-primary/5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Continuing from your audit</p>
              <p className="text-sm font-semibold text-foreground">{prefAddress}</p>
              {(prefPrice > 0 || prefFair > 0) && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {prefPrice > 0 && <>Asking £{prefPrice.toLocaleString()}</>}
                  {prefPrice > 0 && prefFair > 0 && " · "}
                  {prefFair > 0 && <>Fair value £{prefFair.toLocaleString()}</>}
                </p>
              )}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black tracking-tight leading-[1.05] mb-6 text-balance">
            Negotiate Your Next Deal –{" "}
            <span className="block sm:inline relative text-primary drop-shadow-[0_0_40px_hsl(168_80%_48%/0.55)]">
              First One Free.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            AI-powered negotiations on property, cars, boats, watches and more. Your first one is on us — no card needed.
          </p>

          {/* Input + CTA */}
          <div className="max-w-2xl mx-auto mb-5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl opacity-70 shadow-[0_0_60px_-8px_hsl(168_80%_48%/0.45)] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-0 bg-card/85 backdrop-blur-xl border border-primary/30 rounded-2xl p-2 sm:p-2.5">
                <div className="relative flex-1 flex items-center">
                  <Link2 size={18} className="absolute left-4 text-primary/70" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") startNegotiation(); }}
                    placeholder="Paste link or describe your item…"
                    className="w-full pl-12 pr-4 py-4 sm:py-5 rounded-xl text-base font-medium outline-none bg-transparent text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <button
                  onClick={startNegotiation}
                  className="btn-press inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 sm:py-5 rounded-xl text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap hover:-translate-y-0.5 shadow-[0_15px_50px_-10px_hsl(168,80%,48%,0.55)]"
                >
                  <Zap size={16} />
                  Start Free Negotiation
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Trust line */}
          <p className="text-sm text-white/50 max-w-2xl mx-auto">
            Used on properties, cars, boats, watches &amp; more
            <span className="mx-2 text-primary/60">•</span>
            <span className="text-primary font-semibold">Average savings £1,850</span>
          </p>

          {/* Asset categories */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {CATEGORIES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 backdrop-blur text-xs font-semibold text-white/70"
              >
                <Icon size={13} className="text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-5 sm:px-8 bg-card/30 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] text-primary uppercase tracking-[0.22em] font-bold mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              Three steps. <span className="text-primary">Better deal.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto">
              From paste to signed deal — Negotiate For Me AI handles the entire battle for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div
                key={n}
                className="card-hover relative p-7 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/40 transition-colors"
              >
                <div className="absolute top-5 right-5 text-[44px] font-black text-primary/10 leading-none tabular-nums">{n}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-balance">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] text-primary uppercase tracking-[0.22em] font-bold mb-3">Built to win</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              Everything you need to <span className="text-primary">close harder.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-card/40 backdrop-blur border border-border/40 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Supported sites */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl border border-border/30 bg-card/30">
            <p className="text-[11px] text-primary/80 uppercase tracking-[0.22em] font-bold mb-4 text-center">
              Works seamlessly with
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {SUPPORTED_SITES.map((s) => (
                <span
                  key={s}
                  className="px-3.5 py-1.5 rounded-full border border-white/10 bg-background/40 text-xs font-semibold text-white/60"
                >
                  {s}
                </span>
              ))}
              <span className="px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                + any listing URL
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION PRICING ── */}
      <PricingSection startNegotiation={startNegotiation} />

      <Footer />
    </div>
  );
}

function PricingSection({ startNegotiation }: { startNegotiation: () => void }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const formatPrice = (monthly: number) =>
    billing === "monthly"
      ? { price: monthly, unit: "/month", note: "Billed monthly" }
      : { price: Math.round(monthly * 0.8), unit: "/month", note: "Billed annually · save 20%" };

  return (
    <section id="pricing" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] text-primary uppercase tracking-[0.22em] font-bold mb-3">
            Subscription plans
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
            Pick your plan. <span className="text-primary">Negotiate everything.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto mb-8">
            Cancel anytime · Pause or downgrade easily · 14-day money-back guarantee.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border/50 bg-card/60 backdrop-blur">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  billing === b
                    ? "bg-primary text-primary-foreground"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {b}
                {b === "annual" && (
                  <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${billing === "annual" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/20 text-primary"}`}>
                    SAVE 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {TIERS.map((tier) => {
            const isFree = tier.id === "free";
            const { price, unit, note } = isFree
              ? { price: 0, unit: "forever", note: "No card required" }
              : formatPrice(tier.monthly);
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl p-7 sm:p-8 transition-all ${
                  tier.popular
                    ? "border-2 border-primary bg-gradient-to-br from-primary/15 via-card/80 to-background shadow-[0_30px_80px_-20px_hsl(168,80%,48%,0.45)] md:-mt-4 md:mb-4"
                    : "border border-border/40 bg-card/40 backdrop-blur"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.18em] shadow-lg">
                    <Sparkles size={11} /> Most Popular
                  </span>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tier.popular ? "bg-primary/20 ring-1 ring-primary/40" : "bg-primary/10 ring-1 ring-primary/20"}`}>
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-black">{tier.name}</p>
                    <p className="text-xs text-white/55">{tier.tagline}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black text-foreground tabular-nums leading-none">£{price}</span>
                  <span className="text-sm text-white/50 font-medium">{unit}</span>
                </div>
                <p className="text-[11px] text-primary/80 font-bold uppercase tracking-wider mb-1">{tier.credits}</p>
                <p className="text-[11px] text-white/45 mb-6">{note}</p>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                      <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={startNegotiation}
                  className={`btn-press inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-black transition-all ${
                    tier.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_15px_50px_-10px_hsl(168,80%,48%,0.55)]"
                      : "border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                  }`}
                >
                  {tier.popular ? <Zap size={15} /> : null}
                  {isFree ? "Start Your Free Negotiation" : `Start ${tier.name} — £${price}${unit}`}
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/55">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={11} className="text-primary" /> 14-day money-back guarantee</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={11} className="text-primary" /> Cancel anytime</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles size={11} className="text-primary" /> Pause or downgrade easily</span>
        </div>
      </div>
    </section>
  );
}