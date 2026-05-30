import { Briefcase, TrendingUp, PieChart, Percent, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SavedAuditsPanel from "./SavedAuditsPanel";

const quickStats = [
  { label: "Portfolio Size", value: "0", icon: Briefcase, accent: "from-amber-500/15 to-orange-500/15" },
  { label: "Avg Yield Estimate", value: "—", icon: Percent, accent: "from-emerald-500/15 to-teal-500/15" },
  { label: "Total Fair Value", value: "—", icon: PieChart, accent: "from-blue-500/15 to-indigo-500/15" },
  { label: "Opportunities", value: "—", icon: TrendingUp, accent: "from-violet-500/15 to-purple-500/15" },
];

interface Props { onOpenAudit?: (url: string) => void; maxAudits?: number; }

export default function InvestorDashboard({ onOpenAudit, maxAudits }: Props) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6 hover:shadow-[0_4px_24px_-6px_hsl(168_100%_45%/0.08)] transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-4`}>
              <s.icon size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-black tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-base font-black mb-1.5">Cash-Flow Projections</h3>
          <p className="text-xs text-muted-foreground mb-6">AI-estimated monthly cash flow for your portfolio</p>
          <div className="text-center py-10 rounded-xl border border-dashed border-border">
            <PieChart size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Add properties to see projections</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-base font-black mb-1.5">Market Opportunities</h3>
          <p className="text-xs text-muted-foreground mb-6">AI-identified undervalued properties in target areas</p>
          <div className="text-center py-10 rounded-xl border border-dashed border-border">
            <TrendingUp size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Set up saved searches to find deals</p>
            <Link to="/property-scout" className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mt-3 hover:underline">
              Open Property Scout <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <SavedAuditsPanel onOpenAudit={onOpenAudit} maxAudits={maxAudits} />
    </div>
  );
}
