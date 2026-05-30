import { TrendingUp, Users, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SavedAuditsPanel from "./SavedAuditsPanel";

const quickStats = [
  { label: "Listed Properties", value: "0", icon: FileText, accent: "from-blue-500/15 to-indigo-500/5" },
  { label: "Offers Received", value: "0", icon: Users, accent: "from-emerald-500/15 to-teal-500/5" },
  { label: "Negotiations", value: "0", icon: BarChart3, accent: "from-amber-500/15 to-orange-500/5" },
  { label: "Market Position", value: "—", icon: TrendingUp, accent: "from-violet-500/15 to-purple-500/5" },
];

interface Props { onOpenAudit?: (url: string) => void; maxAudits?: number; }

export default function SellerDashboard({ onOpenAudit, maxAudits }: Props) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6 card-hover transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-4`}>
              <s.icon size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-black tabular-nums text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-base font-black mb-1.5 text-foreground">Offers & Negotiations</h3>
          <p className="text-xs text-muted-foreground mb-6">Track offers and AI-powered counter-offer strategy</p>
          <div className="text-center py-10 rounded-xl border border-dashed border-border">
            <Users size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No active offers yet</p>
            <Link to="/sell-my-property" className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mt-3 hover:underline">
              List a property <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-base font-black mb-1.5 text-foreground">Marketing Performance</h3>
          <p className="text-xs text-muted-foreground mb-6">How your listings perform across portals</p>
          <div className="text-center py-10 rounded-xl border border-dashed border-border">
            <BarChart3 size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">List a property to see analytics</p>
          </div>
        </div>
      </div>

      <SavedAuditsPanel onOpenAudit={onOpenAudit} maxAudits={maxAudits} />
    </div>
  );
}
