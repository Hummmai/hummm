import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ShieldCheck, Sparkles, Zap, Crown, TrendingUp, Gift, Rocket } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { CREDIT_TIERS } from "@/lib/negotiationStatus";

const TIER_ICONS = {
  free: Gift,
  starter: Zap,
  pro: Crown,
  investor: Rocket,
} as const;

export default function Pricing() {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setShowSuccess(true);
      const t = setTimeout(() => {
        setShowSuccess(false);
        navigate("/dashboard", { replace: true });
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [searchParams, navigate]);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Check size={36} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome to Hummm AI!</h2>
          <p className="text-muted-foreground/60">Redirecting you to your Command Centre…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEOHead
        title="Hummm AI Pricing — Free AI Negotiation + Pro Plans from £29/mo"
        description="Your first AI property negotiation is completely free. Then choose from flexible plans starting at £29/mo for unlimited negotiations, full audits, and autonomous selling/letting services."
        canonical="/pricing"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 sm:pt-48 pb-12 px-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[700px] h-[350px] rounded-full bg-primary/[0.05] blur-[160px]"
            style={{ top: "10%", left: "50%", transform: "translate(-50%, 0)" }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/[0.06] text-[11px] font-semibold tracking-wide text-primary mb-6">
            <Zap size={12} className="fill-primary" />
            <span>Credit-based. Cancel anytime. First negotiation always free.</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground text-balance leading-tight">
            Simple credits.
            <span className="block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Unlimited negotiations on Pro.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground/75 max-w-2xl mx-auto mb-7 text-balance leading-relaxed">
            Start free — your first negotiation is on us (50 credits). Upgrade to Starter for 300 credits a month, or go Pro for unlimited negotiations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 text-[11px] font-medium text-foreground/75">
              <ShieldCheck size={12} className="text-primary" />
              First negotiation free
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 text-[11px] font-medium text-foreground/75">
              <Check size={12} className="text-primary" />
              Cancel anytime
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 text-[11px] font-medium text-foreground/75">
              <Crown size={12} className="text-primary" />
              Pro = Unlimited Negotiations
            </span>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="px-5 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch animate-fade-in">
          {CREDIT_TIERS.map((tier, i) => {
            const Icon = TIER_ICONS[tier.id];
            const isPopular = !!tier.popular;
            const ctaLink = tier.id === "free" ? "/negotiate-for-me-ai" : `/auth?next=${encodeURIComponent("/dashboard?upgrade=" + tier.id)}`;
            const ctaLabel =
              tier.id === "free" ? "Start Your Free Negotiation" :
              tier.id === "starter" ? "Get Starter" :
              tier.id === "pro" ? "Go Pro — Unlimited" :
              "Get Investor";

            return (
              <div
                key={tier.id}
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: `${100 + i * 80}ms`, animationFillMode: "forwards" }}
              >
                <div
                  className={`relative flex flex-col h-full p-6 sm:p-7 rounded-2xl border transition-all duration-500 ${
                    isPopular
                      ? "bg-gradient-to-b from-primary/[0.08] via-card/80 to-card border-primary/40 shadow-[0_0_80px_-15px_hsl(168,80%,48%,0.28)] lg:-my-4 lg:scale-[1.02]"
                      : "bg-card/40 border-border/30 hover:border-primary/25 hover:bg-card/60 hover:-translate-y-0.5"
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(168,80%,48%,0.4)]">
                      {tier.badge}
                    </span>
                  )}

                  <div className="mb-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPopular ? "bg-primary/20 ring-1 ring-primary/30" : "bg-foreground/[0.05]"}`}>
                        <Icon size={18} className={isPopular ? "text-primary" : "text-primary/70"} />
                      </div>
                      <span className="text-base font-bold text-foreground tracking-tight">{tier.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-[2.75rem] sm:text-5xl font-extrabold tracking-tighter text-foreground tabular-nums leading-none">
                        {tier.price}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60 font-medium">{tier.unit}</span>
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-primary/80 mb-2.5">
                      {tier.credits} · {tier.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(ctaLink)}
                    className={`btn-press w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 mb-6 min-h-[44px] ${
                      isPopular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_24px_-6px_hsl(168,80%,48%,0.4)]"
                        : "bg-foreground/[0.06] text-foreground/90 hover:bg-foreground/[0.1] hover:text-foreground"
                    }`}
                  >
                    {ctaLabel}
                  </button>

                  <div className="flex-1 space-y-2.5 border-t border-border/20 pt-5">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-[12.5px]">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPopular ? "bg-primary/15" : "bg-foreground/[0.06]"
                          }`}
                        >
                          <Check size={10} strokeWidth={3} className={isPopular ? "text-primary" : "text-primary/70"} />
                        </div>
                        <span className="leading-snug text-foreground/80">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How credits work */}
        <div className="max-w-5xl mx-auto mt-14">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card p-7 sm:p-9 shadow-[0_0_60px_-25px_hsl(168,80%,48%,0.25)]">
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/80">How credits work</p>
                <p className="text-base sm:text-lg text-foreground/90 leading-relaxed text-balance">
                  A full AI negotiation costs roughly <span className="font-bold text-foreground">50 credits</span> —
                  covering the audit, opening offer, agent replies and counter-offers. Your free account starts with 50 credits,
                  so your first negotiation is always on us. Pro and Investor are completely unlimited.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center mt-16 space-y-3">
          <p className="text-sm text-muted-foreground/50">
            All prices in GBP. Cancel anytime from your dashboard. No tie-in contracts.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Questions?{" "}
            <a href="mailto:hello@hummm.pro" className="text-primary/70 hover:text-primary transition-colors hover:underline">
              hello@hummm.pro
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
