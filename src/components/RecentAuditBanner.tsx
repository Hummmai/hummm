import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X, Home } from "lucide-react";

type LastAudit = {
  url: string; address: string; postcode?: string;
  askingPrice?: number; fairValue?: number; currency?: string;
  savedAt: number;
};

const fmt = (n?: number, c = "GBP") => {
  if (!n || n <= 0) return "—";
  try { return new Intl.NumberFormat("en-GB", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n); }
  catch { return `${c} ${n.toLocaleString()}`; }
};

export default function RecentAuditBanner({ intent }: { intent: "sale" | "let" }) {
  const navigate = useNavigate();
  const [audit, setAudit] = useState<LastAudit | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("humm_last_audit");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastAudit;
      // Only show audits from the last 24h
      if (!parsed?.address || Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) return;
      setAudit(parsed);
    } catch { /* ignore */ }
  }, []);

  if (!audit || dismissed) return null;

  return (
    <div className="px-6 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/[0.08] to-primary/[0.02] backdrop-blur-sm p-4 sm:p-5">
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="absolute top-2 right-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-10">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Sparkles size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Continue from your recent audit</p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                <Home size={13} className="text-muted-foreground shrink-0" />
                <span className="truncate">{audit.address}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hummingbird Fair Value <span className="text-primary font-bold tabular-nums">{fmt(audit.fairValue, audit.currency)}</span>
                {audit.askingPrice ? <> · Asking <span className="tabular-nums">{fmt(audit.askingPrice, audit.currency)}</span></> : null}
              </p>
            </div>
            <button
              onClick={() => navigate(`/property-audit?url=${encodeURIComponent(audit.url)}`)}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all min-h-[48px]"
            >
              {intent === "sale" ? "Use for selling" : "Use for letting"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
