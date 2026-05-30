import { useState } from "react";
import { ChevronDown, Sparkles, ShieldAlert, TrendingUp } from "lucide-react";

interface Breakdown { pillar: string; weight: number; score: number; detail: string }
interface Props {
  score: number;
  band: string;
  breakdown: Breakdown[];
  topReasons?: string[];
  redFlags?: string[];
  defaultOpen?: boolean;
}

const bandColor = (s: number) =>
  s >= 85 ? { text: "text-emerald-400", bg: "from-emerald-500/30 to-emerald-500/5", ring: "stroke-emerald-400" }
    : s >= 70 ? { text: "text-primary", bg: "from-primary/30 to-primary/5", ring: "stroke-primary" }
    : s >= 55 ? { text: "text-amber-400", bg: "from-amber-500/25 to-amber-500/5", ring: "stroke-amber-400" }
    : s >= 40 ? { text: "text-orange-400", bg: "from-orange-500/25 to-orange-500/5", ring: "stroke-orange-400" }
    : { text: "text-red-400", bg: "from-red-500/30 to-red-500/5", ring: "stroke-red-400" };

export const IntelligenceScoreGauge = ({ score, band, breakdown, topReasons = [], redFlags = [], defaultOpen = false }: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const c = bandColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-3xl border border-border/80 bg-gradient-to-br ${c.bg} bg-card p-6 sm:p-7 shadow-[0_8px_60px_-20px_hsl(168_100%_45%/0.18)]`}>
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={14} className="text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Hummingbird Intelligence Score</span>
      </div>

      <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
        {/* Gauge */}
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" className="stroke-muted/30" />
            <circle
              cx="60" cy="60" r="54" fill="none" strokeWidth="10" strokeLinecap="round"
              className={`${c.ring} transition-[stroke-dashoffset] duration-1000 ease-out`}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold tabular-nums ${c.text}`}>{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap mb-2">
            <span className={`text-2xl font-bold ${c.text}`}>{band}</span>
            <span className="text-xs text-muted-foreground">Composite signal across 6 pillars</span>
          </div>
          {topReasons.length > 0 && (
            <div className="space-y-1 mb-3">
              {topReasons.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/85">
                  <TrendingUp size={12} className="text-emerald-400 mt-0.5 shrink-0" /> <span>{r}</span>
                </div>
              ))}
            </div>
          )}
          {redFlags.length > 0 && (
            <div className="space-y-1">
              {redFlags.slice(0, 2).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-300/90">
                  <ShieldAlert size={12} className="text-red-400 mt-0.5 shrink-0" /> <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-5 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-background/40 border border-border hover:bg-background/60 transition-all text-xs font-semibold"
      >
        <span>{open ? "Hide" : "Show"} 6-pillar breakdown</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {breakdown.map((b) => {
            const bc = bandColor(b.score);
            return (
              <div key={b.pillar} className="rounded-xl bg-background/30 border border-border/60 p-3.5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{b.pillar}</span>
                    <span className="text-[10px] text-muted-foreground">Weight {b.weight}%</span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${bc.text}`}>{b.score}</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${bc.ring.replace("stroke", "bg")} transition-all duration-700`} style={{ width: `${b.score}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{b.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};