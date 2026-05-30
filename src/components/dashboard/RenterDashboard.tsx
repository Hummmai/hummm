import { Key, FileText, CreditCard, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import SavedAuditsPanel from "./SavedAuditsPanel";

const quickStats = [
  { label: "Applications", value: "0", icon: FileText, accent: "from-violet-500/15 to-purple-500/15" },
  { label: "Upcoming Viewings", value: "0", icon: Eye, accent: "from-emerald-500/15 to-teal-500/15" },
  { label: "Lease Documents", value: "0", icon: Key, accent: "from-blue-500/15 to-indigo-500/15" },
  { label: "Rent Payments", value: "—", icon: CreditCard, accent: "from-amber-500/15 to-orange-500/15" },
];

interface Props { onOpenAudit?: (url: string) => void; maxAudits?: number; }

export default function RenterDashboard({ onOpenAudit, maxAudits }: Props) {
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
          <h3 className="text-base font-black mb-1.5">Rental Applications</h3>
          <p className="text-xs text-muted-foreground mb-6">Track your applications and their status</p>
          <div className="text-center py-10 rounded-xl border border-dashed border-border">
            <FileText size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No active applications</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-base font-black mb-1.5">Your Rights</h3>
          <p className="text-xs text-muted-foreground mb-6">Know your tenant rights and protections</p>
          <div className="text-center py-10 rounded-xl border border-dashed border-border">
            <ShieldCheck size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Stay protected with AI-powered advice</p>
            <Link to="/humm-ai-negotiator" className="inline-flex items-center gap-1.5 text-primary text-xs font-bold mt-3 hover:underline">
              Negotiate Your Rent <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <SavedAuditsPanel onOpenAudit={onOpenAudit} maxAudits={maxAudits} />
    </div>
  );
}
