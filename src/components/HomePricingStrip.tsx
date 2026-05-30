import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Handshake, Check, BarChart3 } from "lucide-react";

/**
 * Three-step value strip. NO upfront pricing — fully aligned with the
 * "first negotiation free" model. Pricing is only surfaced AFTER signup
 * or after the first free negotiation completes.
 */
const HomePricingStrip = () => {
  const cards = [
    {
      to: "/free-valuation",
      icon: Sparkles,
      eyebrow: "Step 1 · Always free",
      title: "Instant AI Valuation",
      desc: "Drop any property — get fair value, comps and risk flags in 30 seconds.",
      cta: "Get free valuation",
    },
    {
      to: "/humm-ai-negotiator",
      icon: BarChart3,
      eyebrow: "Step 2 · Free with negotiation",
      title: "Deep AI Audit",
      desc: "14-section forensic report. Yield, renovation uplift and your negotiation playbook.",
      cta: "Run deep audit",
    },
    {
      to: "/negotiate-for-me",
      icon: Handshake,
      eyebrow: "Step 3 · First one's free",
      title: "Negotiate For Me",
      desc: "Hummm AI handles the agent, drafts every offer, fights for every pound. Your first negotiation is on us.",
      cta: "Start your free negotiation",
      flagship: true,
    },
  ];

  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-3">Low-risk. High-leverage.</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance max-w-2xl mx-auto">
            Try Hummm AI on your next deal — <span className="text-primary">your first negotiation is free</span>.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground/85 mt-3 max-w-xl mx-auto">
            No card. No commission. No commitment. See what we can save you before you ever pay a penny.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className={`group relative flex flex-col rounded-3xl backdrop-blur p-6 sm:p-7 transition-all card-hover ${
                  c.flagship
                    ? "border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-primary/[0.04] shadow-[0_30px_80px_-30px_hsl(168,80%,48%,0.45)] hover:border-primary/60"
                    : "border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card/70"
                }`}
              >
                {c.flagship && (
                  <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.18em] shadow-[0_4px_20px_-4px_hsl(168,80%,48%,0.5)]">
                    First one free
                  </span>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-2xl ring-1 flex items-center justify-center ${c.flagship ? "bg-primary/25 ring-primary/40" : "bg-primary/15 ring-primary/25"}`}>
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{c.eyebrow}</p>
                    <p className="text-base font-bold text-foreground">{c.title}</p>
                  </div>
                </div>
                <p className="text-[13px] text-foreground/75 leading-relaxed mb-6 flex-1">{c.desc}</p>
                <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  c.flagship
                    ? "bg-primary text-primary-foreground group-hover:bg-primary/90"
                    : "text-primary group-hover:gap-3"
                }`}>
                  <Check size={14} className={c.flagship ? "text-primary-foreground" : "text-primary"} />
                  {c.cta}
                  <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[12px] text-muted-foreground/70 max-w-xl mx-auto">
          After your free negotiation: <span className="text-foreground font-semibold">Starter £9/mo</span> (300 credits),
          or <span className="text-foreground font-semibold">Pro £29/mo</span> for unlimited negotiations.
          Investors get <span className="text-foreground font-semibold">Investor £79/mo</span> with portfolio tools. Cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default HomePricingStrip;