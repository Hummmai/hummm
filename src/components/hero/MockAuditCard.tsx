import { CheckCircle2 } from "lucide-react";

const metrics = [
  { value: "£408k", label: "Fair value" },
  { value: "-4.1%", label: "Overpriced by" },
  { value: "5.8%", label: "Gross yield" },
];

const flags = [
  { color: "bg-emerald-400", text: "EPC rating C — compliant" },
  { color: "bg-emerald-400", text: "No flood risk detected" },
  { color: "bg-amber-400", text: "Leasehold — 82 years remaining" },
];

const trustItems = ["GDPR compliant", "No data sold", "Land Registry data", "Free to start"];

const MockAuditCard = () => (
  <div
    className="audit-card-hover w-full max-w-md rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_-20px_hsl(168_80%_30%/0.3)]"
    style={{
      background: "#111c30",
      animation: "hero-card-float 6s ease-in-out infinite",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
        AI audit report
      </span>
      <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
        Score 88/100
      </span>
    </div>

    {/* Property row */}
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-base shrink-0">
        🏠
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground truncate">14 Clarence Mews, Bristol BS8</p>
        <p className="text-[11px] text-muted-foreground/50">3 bed · Semi-detached · £425,000 asking</p>
      </div>
    </div>

    {/* Metric tiles */}
    <div className="grid grid-cols-3 gap-2">
      {metrics.map((m) => (
        <div key={m.label} className="data-refresh rounded-xl bg-white/[0.03] p-3 text-center">
          <p className="text-sm font-bold text-primary">{m.value}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{m.label}</p>
        </div>
      ))}
    </div>

    {/* Verdict */}
    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5">
      <p className="text-xs font-bold text-primary mb-1">AI verdict — negotiate down</p>
      <p className="text-[11px] text-white/45 leading-relaxed">
        Listed £17,000 above street average. Open at £395k — comparable sales support this. Strong negotiation position.
      </p>
    </div>

    {/* Flags */}
    <div className="flex flex-col gap-2">
      {flags.map((f) => (
        <div key={f.text} className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${f.color} shrink-0`} />
          <span className="text-[11px] text-foreground/60">{f.text}</span>
        </div>
      ))}
    </div>

    {/* Trust bar */}
    <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {trustItems.map((t) => (
        <div key={t} className="flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-primary/50 shrink-0" />
          <span className="text-[10px] text-white/25">{t}</span>
        </div>
      ))}
    </div>
  </div>
);

export default MockAuditCard;
