import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { hasUsedFirstNegotiation } from "@/lib/negotiationStatus";

/**
 * Site-wide push for the "Negotiate For Me" service — the primary offer right now.
 * Two variants:
 *  - "hero"  → big standalone section (use after a completed valuation/audit)
 *  - "bar"   → slim horizontal CTA bar (use top + bottom of audit reports)
 */
export default function NegotiateForMeCTA({
  variant = "hero",
  className = "",
  context,
}: {
  variant?: "hero" | "bar";
  className?: string;
  /** Optional metadata to personalise the headline (e.g. address). */
  context?: { address?: string };
}) {
  const addressLine = context?.address ? ` for ${context.address}` : "";
  const usedFree = hasUsedFirstNegotiation();

  if (variant === "bar") {
    return (
      <Link
        to="/negotiate-for-me"
        className={`group relative block overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent px-4 sm:px-6 py-3.5 sm:py-4 hover:border-primary/60 hover:shadow-[0_12px_40px_-12px_hsl(168,80%,48%,0.5)] transition-all ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/20 ring-1 ring-primary/30 flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-0.5">
                {usedFree ? "Next negotiation" : "Your first one's free"}
              </p>
              <p className="text-sm sm:text-base font-bold text-foreground truncate">
                {usedFree
                  ? <>Go Pro — <span className="text-primary">£29/mo Unlimited</span></>
                  : "Start Your Free Negotiation"}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black group-hover:bg-primary/90 transition-colors shrink-0">
            {usedFree ? "Upgrade" : "Start free"} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
          <ArrowRight size={18} className="sm:hidden text-primary shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-primary/35 bg-gradient-to-br from-primary/15 via-card to-primary/5 p-6 sm:p-10 md:p-14 text-center ${className}`}>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
          <Sparkles size={11} /> {usedFree ? "Welcome back" : "Your first one is on us"}
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-balance mb-4">
          {usedFree ? (
            <>Unlock <span className="text-primary">unlimited negotiations</span> with Pro</>
          ) : (
            <>Let <span className="text-primary">Hummm Negotiator</span> fight your next deal — free</>
          )}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground/85 max-w-xl mx-auto mb-8 text-balance leading-relaxed">
          {usedFree
            ? <>Starter <span className="text-foreground font-semibold">£9/mo</span> (300 credits), Pro <span className="text-foreground font-semibold">£29/mo</span> unlimited, or Investor <span className="text-foreground font-semibold">£79/mo</span> with portfolio tools. Cancel anytime.</>
            : <>Forensic audit, strategic offers and agent comms{addressLine} — all handled. No card needed for your first one.</>}
        </p>
        <Link
          to="/negotiate-for-me-ai"
          className="inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl shadow-[0_15px_50px_-10px_hsl(168,80%,48%,0.55)]"
        >
          <Zap size={20} />
          {usedFree ? "Go Pro — £29/mo Unlimited" : "Start Your Free Negotiation"}
          <ArrowRight size={18} />
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={11} className="text-primary" /> No commission · Cancel anytime</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles size={11} className="text-primary" /> Pro = Unlimited negotiations</span>
        </div>
      </div>
    </section>
  );
}