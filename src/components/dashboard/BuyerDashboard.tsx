import { useState } from "react";
import { Search, Eye, MessageSquare, Sparkles, ArrowRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import SavedAuditsPanel from "./SavedAuditsPanel";
import NegotiationInbox from "./NegotiationInbox";

const TABS = [
  { id: "overview", label: "Overview", icon: Search },
  { id: "inbox", label: "Inbox", icon: Inbox },
] as const;

type TabId = typeof TABS[number]["id"];

const quickStats = [
  { label: "Saved Properties", value: "—", icon: Search, accent: "from-emerald-500/15 to-teal-500/15" },
  { label: "Viewings Booked", value: "0", icon: Eye, accent: "from-blue-500/15 to-indigo-500/15" },
  { label: "Active Negotiations", value: "0", icon: MessageSquare, accent: "from-amber-500/15 to-orange-500/15" },
  { label: "AI Recommendations", value: "—", icon: Sparkles, accent: "from-violet-500/15 to-purple-500/15" },
];

interface Props { onOpenAudit?: (url: string) => void; maxAudits?: number; initialTab?: string; }

export default function BuyerDashboard({ onOpenAudit, maxAudits, initialTab }: Props) {
  const [tab, setTab] = useState<TabId>(initialTab === "inbox" ? "inbox" : "overview");

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-border pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
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
              <h3 className="text-base font-black mb-1.5">Viewing Schedule</h3>
              <p className="text-xs text-muted-foreground mb-6">Your upcoming property viewings</p>
              <div className="text-center py-10 rounded-xl border border-dashed border-border">
                <Eye size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No viewings booked yet</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Audit a property and book one!</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="text-base font-black mb-1.5">Negotiation Hub</h3>
              <p className="text-xs text-muted-foreground mb-6">AI-powered deal negotiations</p>
              <button onClick={() => setTab("inbox")}
                className="w-full text-center py-10 rounded-xl border border-dashed border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                <MessageSquare size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Open Negotiation Inbox</p>
                <p className="text-primary text-xs font-bold mt-2 flex items-center justify-center gap-1">
                  View Conversations <ArrowRight size={12} />
                </p>
              </button>
            </div>
          </div>

          <SavedAuditsPanel onOpenAudit={onOpenAudit} maxAudits={maxAudits} />
        </>
      ) : (
        <NegotiationInbox />
      )}
    </div>
  );
}
