import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, TrendingUp, ShieldAlert, ArrowRight, CheckCircle } from "lucide-react";

function fmt(amount: number, currency: string = "GBP") {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `£${Math.round(amount).toLocaleString()}`;
  }
}

interface SavantUpgradeCTAProps {
  price?: number;
  currency?: string;
  score?: number | null;
  band?: string | null;
}

/**
 * Dynamic upgrade CTA framed against the property value + Intelligence Score.
 * Shown to free-tier users below the Intelligence Score gauge.
 */
export function SavantUpgradeCTA({ price = 0, currency = "GBP", score, band }: SavantUpgradeCTAProps) {
  const navigate = useNavigate();

  // Assume ~5% achievable saving on a typical negotiation
  const expectedSaving = price > 0 ? Math.round((price * 0.05) / 1000) * 1000 : 0;
  const proCost = 19;
  const roi = expectedSaving > 0 ? Math.round(expectedSaving / proCost) : 0;

  // Score-aware framing
  const lowScore = typeof score === "number" && score < 55;
  const highScore = typeof score === "number" && score >= 75;

  const headline = lowScore
    ? "This property has red flags — don't overpay"
    : highScore
      ? "Strong deal — move fast with a Savant report"
      : "Unlock the full Savant report";

  const subline = lowScore
    ? `Your Intelligence Score of ${score}/100 means you need every data point before bidding.`
    : highScore
      ? `Score of ${score}/100 — good fundamentals. Lock it in with the full intelligence pack.`
      : "Comparables, area metrics, cash-flow modelling and full negotiation tools.";

  const Icon = lowScore ? ShieldAlert : highScore ? TrendingUp : Sparkles;

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-card p-6 sm:p-8 shadow-[0_0_60px_-20px_hsl(168_100%_45%/0.15)]">
      {/* glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row gap-6 lg:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/15 border border-primary/30">
              <Icon size={16} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Savant Upgrade</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight mb-2 text-balance">
            {headline}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
            {subline}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            {[
              { label: "+12 comparables", icon: CheckCircle },
              { label: "Full area intel", icon: CheckCircle },
              { label: "Cash-flow model", icon: CheckCircle },
              { label: "Negotiation Mode", icon: CheckCircle },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-muted/40 border border-border/60">
                <f.icon size={11} className="text-primary shrink-0" />
                <span className="text-[11px] font-semibold text-foreground/90 truncate">{f.label}</span>
              </div>
            ))}
          </div>

          {expectedSaving > 0 && (
            <p className="text-xs text-foreground/80 leading-relaxed">
              Spend{" "}
              <span className="font-bold text-foreground tabular-nums">{fmt(proCost, currency)}</span>{" "}
              to negotiate up to{" "}
              <span className="font-black text-emerald-400 tabular-nums">{fmt(expectedSaving, currency)}</span>{" "}
              off this {fmt(price, currency)} property —{" "}
              <span className="font-bold text-primary tabular-nums">{roi.toLocaleString()}× ROI</span>.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0 w-full lg:w-auto">
          <button
            onClick={() => navigate("/pricing?tier=pro&from=audit")}
            className="btn-press flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
          >
            Unlock full report <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Compare plans →
          </button>
        </div>
      </div>
    </div>
  );
}

interface SavantLockedTeaserProps {
  title: string;
  lockedCount?: string;
  children: React.ReactNode;
}

/**
 * Renders the children blurred behind a glass overlay with an unlock CTA.
 * Use to gate deeper report sections for free-tier users.
 */
export function SavantLockedTeaser({ title, lockedCount, children }: SavantLockedTeaserProps) {
  const navigate = useNavigate();
  return (
    <div className="relative rounded-3xl overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-md opacity-60 max-h-72 overflow-hidden">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/40 via-background/80 to-background backdrop-blur-[2px]">
        <div className="text-center px-6 py-8 max-w-md">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 mb-3">
            <Lock size={16} className="text-primary" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary mb-1.5">Savant Only</p>
          <h4 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{title}</h4>
          {lockedCount && (
            <p className="text-xs text-muted-foreground mb-4">{lockedCount}</p>
          )}
          <button
            onClick={() => navigate("/pricing?tier=pro&from=audit")}
            className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
          >
            Unlock with Savant <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}