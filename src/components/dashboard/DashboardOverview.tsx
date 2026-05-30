import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MessageSquare, TrendingUp, Star, MapPin, ArrowRight, Bed, Bath, Loader2, Sparkles, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useHumm } from "@/contexts/HummContext";

interface SavedAudit {
  id: string;
  property_url: string;
  address: string | null;
  postcode: string | null;
  asking_price: number | null;
  currency: string | null;
  humm_fair_value: number | null;
  ai_score: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  images: string[] | null;
  status: string;
  created_at: string;
}

function formatPrice(amount: number, currency = "GBP") {
  const s: Record<string, string> = { GBP: "£", USD: "$", SGD: "S$", EUR: "€", AED: "AED ", ZAR: "R" };
  return `${s[currency] || currency + " "}${amount.toLocaleString()}`;
}

/* ── Animated counter hook ── */
function useAnimatedCount(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = ref.current;
    const diff = target - start;
    const startTime = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + diff * eased);
      setCount(current);
      if (progress < 1) raf = requestAnimationFrame(step);
      else ref.current = target;
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

const ROLE_WELCOME: Record<string, { greeting: string; subtitle: string; emoji: string }> = {
  buyer: { greeting: "Let's find your perfect home", subtitle: "Your property search command centre", emoji: "🏠" },
  seller: { greeting: "Let's maximise your sale", subtitle: "Track offers, strategy & market position", emoji: "📈" },
  renter: { greeting: "Let's find your perfect rental", subtitle: "Negotiate better terms with AI-powered insights", emoji: "🔑" },
  investor: { greeting: "Let's grow your portfolio", subtitle: "Analyse deals, yields & market opportunities", emoji: "💎" },
  landlord: { greeting: "Let's manage your portfolio", subtitle: "Compliance, rent analysis & tenant management", emoji: "🏢" },
};

interface Props {
  onOpenAudit: (url: string) => void;
  onTabChange: (tab: string) => void;
  userName?: string;
}

export default function DashboardOverview({ onOpenAudit, onTabChange, userName }: Props) {
  const { currentRole } = useHumm();
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [negotiations, setNegotiations] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [auditsRes, negoRes] = await Promise.all([
      supabase.from("saved_audits").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("negotiation_messages").select("id", { count: "exact", head: true }),
    ]);
    if (auditsRes.data) setAudits(auditsRes.data as SavedAudit[]);
    setNegotiations(negoRes.count || 0);
    setLoading(false);
  };

  const totalValue = audits.reduce((sum, a) => sum + (a.asking_price || 0), 0);
  const highScoreCount = audits.filter(a => (a.ai_score || 0) >= 80).length;

  const animAudits = useAnimatedCount(loading ? 0 : audits.length);
  const animNego = useAnimatedCount(loading ? 0 : negotiations);
  const animHigh = useAnimatedCount(loading ? 0 : highScoreCount);

  const role = ROLE_WELCOME[currentRole || "buyer"] || ROLE_WELCOME.buyer;

  /* Smart insights */
  const insights: { text: string; icon: typeof Sparkles; color: string }[] = [];
  const negotiationReady = audits.filter(a => (a.ai_score || 0) >= 70).length;
  if (negotiationReady > 0) insights.push({ text: `${negotiationReady} propert${negotiationReady === 1 ? "y has" : "ies have"} strong negotiation potential`, icon: Zap, color: "text-primary" });
  if (audits.length > 0 && highScoreCount === 0) insights.push({ text: "No high-score properties yet — keep auditing to find gems", icon: Search, color: "text-amber-400" });
  if (audits.length >= 3) insights.push({ text: "Compare your top properties side-by-side in My Audits", icon: FileText, color: "text-blue-400" });

  const stats = [
    { label: "Total Audits", value: loading ? null : animAudits.toString(), icon: Search, accent: "from-primary/20 to-primary/5", glow: "shadow-[0_0_20px_-4px_hsl(168_80%_48%/0.15)]" },
    { label: "Active Negotiations", value: loading ? null : animNego.toString(), icon: MessageSquare, accent: "from-blue-500/20 to-blue-500/5", glow: "shadow-[0_0_20px_-4px_hsl(210_80%_55%/0.12)]" },
    { label: "Est. Portfolio Value", value: loading ? null : (totalValue > 0 ? formatPrice(totalValue) : "—"), icon: TrendingUp, accent: "from-emerald-500/20 to-emerald-500/5", glow: "shadow-[0_0_20px_-4px_hsl(155_60%_45%/0.12)]" },
    { label: "High-Score Properties", value: loading ? null : animHigh.toString(), icon: Star, accent: "from-amber-500/20 to-amber-500/5", glow: "shadow-[0_0_20px_-4px_hsl(40_80%_55%/0.12)]" },
  ];

  const recentAudits = audits.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome Banner ── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/[0.08] via-card to-card border border-primary/10 p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl mb-2">{role.emoji}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {userName ? `${userName}, ` : ""}{role.greeting}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">{role.subtitle}</p>
            <p className="text-xs text-primary/70 mt-1 font-medium italic">With Hummm, you are the property expert</p>
          </div>
          {insights.length > 0 && (
            <div className="hidden md:block shrink-0 ml-6 max-w-xs">
              {insights.slice(0, 2).map((ins, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground/80 mb-2">
                  <ins.icon size={14} className={ins.color} />
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-2xl bg-card border border-border p-5 sm:p-6 card-hover transition-all duration-300 ${s.glow}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-4`}>
              <s.icon size={20} className="text-primary" />
            </div>
            {s.value === null ? (
              <Skeleton className="h-8 w-16 mb-1 bg-muted" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{s.value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Mobile Insights ── */}
      {insights.length > 0 && (
        <div className="md:hidden rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> Smart Insights
          </h3>
          <div className="space-y-2.5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/80">
                <ins.icon size={13} className={ins.color} />
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Two-Column Content ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Audits - 2 cols */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Audits</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{audits.length} propert{audits.length === 1 ? "y" : "ies"} audited</p>
            </div>
            <button
              onClick={() => onTabChange("audits")}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <Skeleton className="w-24 h-[72px] rounded-xl shrink-0 bg-muted" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                    <Skeleton className="h-3 w-1/2 bg-muted" />
                    <Skeleton className="h-3 w-1/3 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAudits.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin size={28} className="text-primary/40" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No audits yet</p>
              <p className="text-xs text-muted-foreground mt-1">Drop a property link above to start your first audit</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentAudits.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onOpenAudit(a.property_url)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.03] transition-colors text-left group"
                >
                  <div className="w-24 h-[72px] rounded-xl bg-muted/30 overflow-hidden shrink-0 ring-1 ring-border/50">
                    {a.images?.[0] ? (
                      <img src={a.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><MapPin size={18} className="text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{a.address || "Property"}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {a.asking_price != null && a.asking_price > 0 && (
                        <span className="font-medium text-foreground/80">{formatPrice(a.asking_price, a.currency || "GBP")}</span>
                      )}
                      {a.humm_fair_value != null && (
                        <span className="font-medium text-primary">FV: {formatPrice(a.humm_fair_value, a.currency || "GBP")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground/70">
                      {a.bedrooms != null && <span className="flex items-center gap-0.5"><Bed size={11} /> {a.bedrooms}</span>}
                      {a.bathrooms != null && <span className="flex items-center gap-0.5"><Bath size={11} /> {a.bathrooms}</span>}
                      {a.property_type && <span className="capitalize">{a.property_type}</span>}
                    </div>
                  </div>
                  {a.ai_score != null && (
                    <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold ring-1 ${
                      a.ai_score >= 80 ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : a.ai_score >= 60 ? "bg-amber-500/10 text-amber-400 ring-amber-500/20" : "bg-red-500/10 text-red-400 ring-red-500/20"
                    }`}>
                      {a.ai_score}
                    </div>
                  )}
                  <ArrowRight size={16} className="text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { label: "My Audits", icon: Search, tab: "audits", desc: "View all property reports" },
                { label: "Hummm Along", icon: MessageSquare, tab: "negotiations", desc: "Negotiation threads" },
                { label: "AI Assistant", icon: Sparkles, tab: "assistant", desc: "Ask anything about property" },
                { label: "Email Writer", icon: FileText, tab: "email", desc: "Draft agent enquiries" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => onTabChange(item.tab)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left hover:bg-primary/[0.05] hover:border-primary/10 transition-all group border border-transparent"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <item.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground/70 truncate">{item.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Card */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <h3 className="text-base font-bold text-foreground mb-1">Active Strategy</h3>
            <p className="text-xs text-muted-foreground mb-5">Your current property goals</p>
            <div className="rounded-xl bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/10 p-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground/80 mb-1">Set Your Strategy</p>
              <p className="text-xs text-muted-foreground">Define your goals to unlock personalised insights.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
