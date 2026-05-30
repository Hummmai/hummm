import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  PoundSterling,
  Activity,
  Users,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  MessagesSquare,
  Megaphone,
} from "lucide-react";
import { format, startOfMonth, startOfDay, subDays } from "date-fns";

const OWNER_EMAILS = ["rob@hummm.pro", "rpe976@gmail.com"];

// Revenue per event type (GBP)
const REV = {
  deep_audit: 29,
  negotiate_onetime: 49,
  negotiate_pro: 39,
  negotiate_starter: 19,
  negotiate_investor: 79,
};

type EventRow = {
  id: string;
  event_type: string;
  email: string | null;
  property_address: string | null;
  property_price: number | null;
  fair_value: number | null;
  created_at: string;
  metadata: any;
  source: string | null;
};

const isPaid = (t: string) =>
  ["deep_audit_purchased", "negotiate_onetime_purchased", "negotiate_subscription_started"].includes(t);

function revenueOf(ev: EventRow): number {
  switch (ev.event_type) {
    case "deep_audit_purchased":
      return REV.deep_audit;
    case "negotiate_onetime_purchased":
      return REV.negotiate_onetime;
    case "negotiate_subscription_started": {
      const tier = String(ev.metadata?.tier || "pro").toLowerCase();
      if (tier === "starter") return REV.negotiate_starter;
      if (tier === "investor") return REV.negotiate_investor;
      return REV.negotiate_pro;
    }
    default:
      return 0;
  }
}

const Stat = ({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) => (
  <Card
    className={`p-5 border-white/10 bg-[#0b1426]/80 backdrop-blur-sm ${
      accent ? "ring-1 ring-teal-400/40 shadow-[0_0_40px_-12px_rgba(45,212,191,0.4)]" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div
        className={`p-2 rounded-lg ${
          accent ? "bg-teal-400/15 text-teal-300" : "bg-white/5 text-white/60"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className={`text-3xl font-semibold tabular-nums ${accent ? "text-teal-300" : "text-white"}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
  </Card>
);

const fmtGBP = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

const RevenueDashboard = () => {
  const { userEmail } = useHumm();
  const navigate = useNavigate();
  const isOwner = !!userEmail && OWNER_EMAILS.includes(userEmail.toLowerCase());

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const since = subDays(new Date(), 30).toISOString();
    const { data } = await supabase
      .from("revenue_events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    setEvents((data as EventRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isOwner) return;
    fetchData();
    const channel = supabase
      .channel("revenue-dash")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "revenue_events" },
        () => fetchData()
      )
      .subscribe();
    const t = setInterval(fetchData, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(t);
    };
  }, [isOwner]);

  const metrics = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const dayStart = startOfDay(new Date());
    const thisMonth = events.filter((e) => new Date(e.created_at) >= monthStart);
    const today = events.filter((e) => new Date(e.created_at) >= dayStart);

    const valToday = today.filter((e) => e.event_type === "valuation_completed").length;
    const valMonth = thisMonth.filter((e) => e.event_type === "valuation_completed").length;
    const auditMonth = thisMonth.filter((e) => e.event_type === "audit_viewed").length;
    const deepAuditMonth = thisMonth.filter((e) => e.event_type === "deep_audit_purchased").length;
    const negOneMonth = thisMonth.filter((e) => e.event_type === "negotiate_onetime_purchased").length;
    const negSubMonth = thisMonth.filter((e) => e.event_type === "negotiate_subscription_started").length;

    const revenueMonth = thisMonth.reduce((s, e) => s + revenueOf(e), 0);
    const revenueToday = today.reduce((s, e) => s + revenueOf(e), 0);

    const uniqueLeads = new Set(thisMonth.filter((e) => e.event_type === "valuation_completed").map((e) => e.email)).size;
    const uniqueConverters = new Set(thisMonth.filter((e) => isPaid(e.event_type)).map((e) => e.email)).size;
    const conversion = uniqueLeads > 0 ? (uniqueConverters / uniqueLeads) * 100 : 0;

    return {
      valToday,
      valMonth,
      auditMonth,
      deepAuditMonth,
      negOneMonth,
      negSubMonth,
      revenueMonth,
      revenueToday,
      conversion,
      uniqueLeads,
      uniqueConverters,
    };
  }, [events]);

  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "MMM dd");
      map.set(d, 0);
    }
    events.forEach((e) => {
      const r = revenueOf(e);
      if (r === 0) return;
      const d = format(new Date(e.created_at), "MMM dd");
      if (map.has(d)) map.set(d, (map.get(d) || 0) + r);
    });
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  }, [events]);

  const funnel = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const m = events.filter((e) => new Date(e.created_at) >= monthStart);
    const valuations = new Set(m.filter((e) => e.event_type === "valuation_completed").map((e) => e.email)).size;
    const audits = new Set(m.filter((e) => e.event_type === "audit_viewed" || e.event_type === "deep_audit_purchased").map((e) => e.email)).size;
    const deepPaid = new Set(m.filter((e) => e.event_type === "deep_audit_purchased").map((e) => e.email)).size;
    const negotiate = new Set(
      m
        .filter(
          (e) =>
            e.event_type === "negotiate_onetime_purchased" ||
            e.event_type === "negotiate_subscription_started"
        )
        .map((e) => e.email)
    ).size;
    return [
      { label: "Free Valuation", count: Math.max(valuations, 1), key: "val" },
      { label: "Audit Viewed", count: audits, key: "audit" },
      { label: "Deep Audit £29", count: deepPaid, key: "deep" },
      { label: "Negotiate For Me", count: negotiate, key: "neg" },
    ];
  }, [events]);

  const recent = useMemo(() => {
    // Group by email — latest event per email
    const byEmail = new Map<string, EventRow[]>();
    events.forEach((e) => {
      if (!e.email) return;
      const list = byEmail.get(e.email) || [];
      list.push(e);
      byEmail.set(e.email, list);
    });
    return Array.from(byEmail.entries())
      .map(([email, evs]) => {
        const sorted = evs.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        const latest = sorted[0];
        const totalRev = evs.reduce((s, e) => s + revenueOf(e), 0);
        const converted = evs.some((e) => isPaid(e.event_type));
        return {
          email,
          latest,
          totalRev,
          converted,
          address: sorted.find((e) => e.property_address)?.property_address || "—",
        };
      })
      .sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
      .slice(0, 20);
  }, [events]);

  const agentPerf = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const m = events.filter((e) => new Date(e.created_at) >= monthStart);
    const salesShown = m.filter((e) => e.event_type === "sales_agent_shown").length;
    const salesConverted = m.filter((e) => e.source === "sales_agent" && isPaid(e.event_type)).length;
    const negActivity = m.filter((e) => e.event_type === "negotiation_message_drafted" || e.event_type === "negotiation_email_sent").length;
    const marketingPosts = m.filter((e) => e.event_type === "marketing_content_generated").length;
    const salesRate = salesShown > 0 ? (salesConverted / salesShown) * 100 : 0;
    return { salesShown, salesConverted, salesRate, negActivity, marketingPosts };
  }, [events]);

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[#0a1020] text-white flex items-center justify-center px-6">
        <Card className="p-8 max-w-md text-center bg-[#0b1426] border-white/10">
          <h1 className="text-xl font-semibold mb-2">Sign in required</h1>
          <p className="text-white/60 mb-6">This dashboard is restricted to the platform owner.</p>
          <Button onClick={() => navigate("/auth")}>Sign in</Button>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0a1020] text-white flex items-center justify-center px-6">
        <Card className="p-8 max-w-md text-center bg-[#0b1426] border-white/10">
          <h1 className="text-xl font-semibold mb-2">Access restricted</h1>
          <p className="text-white/60">This dashboard is only visible to rob@hummm.pro.</p>
        </Card>
      </div>
    );
  }

  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="min-h-screen bg-[#0a1020] text-white antialiased">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-teal-400/15 text-teal-300 border-teal-400/30">
                <Activity className="w-3 h-3 mr-1 animate-pulse" /> Live
              </Badge>
              <span className="text-xs text-white/40">Updated {format(new Date(), "HH:mm")}</span>
            </div>
            <h1 className="text-3xl font-semibold text-balance">Revenue Funnel</h1>
            <p className="text-sm text-white/50 mt-1">End-to-end conversion intelligence — Hummingbird AI</p>
          </div>
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={fetchData}
          >
            <Zap className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Hero revenue number */}
        <Card className="p-8 border-teal-400/30 bg-gradient-to-br from-[#0b1426] via-[#0d1a30] to-[#0a1f2e] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-teal-300/80 mb-2">
              Revenue this month
            </div>
            <div className="text-6xl md:text-7xl font-semibold tracking-tight tabular-nums text-white">
              {fmtGBP(metrics.revenueMonth)}
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-300" />
                {fmtGBP(metrics.revenueToday)} today
              </span>
              <span>·</span>
              <span>{metrics.conversion.toFixed(1)}% valuation → paid</span>
              <span>·</span>
              <span>{metrics.uniqueConverters} paying customers</span>
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Stat
            icon={Users}
            label="Valuations Today"
            value={String(metrics.valToday)}
            sub={`${metrics.valMonth} this month`}
          />
          <Stat
            icon={Sparkles}
            label="Deep Audits £29"
            value={String(metrics.deepAuditMonth)}
            sub={fmtGBP(metrics.deepAuditMonth * REV.deep_audit)}
          />
          <Stat
            icon={Target}
            label="Negotiate £49"
            value={String(metrics.negOneMonth)}
            sub={fmtGBP(metrics.negOneMonth * REV.negotiate_onetime)}
          />
          <Stat
            icon={PoundSterling}
            label="Pro Subs £39/mo"
            value={String(metrics.negSubMonth)}
            sub="New this month"
            accent
          />
          <Stat
            icon={TrendingUp}
            label="Conversion"
            value={`${metrics.conversion.toFixed(1)}%`}
            sub={`${metrics.uniqueConverters}/${metrics.uniqueLeads} leads`}
          />
        </div>

        {/* Revenue chart + Funnel */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-[#0b1426] border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Revenue · last 30 days</h2>
                <p className="text-xs text-white/40">Daily realized revenue from paid conversions</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: "#0a1020",
                      border: "1px solid #ffffff20",
                      borderRadius: 8,
                      color: "white",
                    }}
                    formatter={(v: number) => [fmtGBP(v), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2dd4bf" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-[#0b1426] border-white/10">
            <h2 className="text-lg font-semibold mb-1">Conversion Funnel</h2>
            <p className="text-xs text-white/40 mb-5">This month</p>
            <div className="space-y-3">
              {funnel.map((f, i) => {
                const pct = (f.count / maxFunnel) * 100;
                const prev = i > 0 ? funnel[i - 1].count : f.count;
                const dropoff = i > 0 && prev > 0 ? 100 - (f.count / prev) * 100 : 0;
                return (
                  <div key={f.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white/80">{f.label}</span>
                      <span className="text-sm tabular-nums font-medium text-white">{f.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {i > 0 && (
                      <div className="text-[10px] text-white/40 mt-1">
                        {dropoff > 0 ? `${dropoff.toFixed(0)}% drop-off` : "→ converted"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent activity */}
        <Card className="p-6 bg-[#0b1426] border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">Recent leads</h2>
              <p className="text-xs text-white/40">Latest 20 users · click to open Sales Agent</p>
            </div>
          </div>
          {loading ? (
            <div className="text-white/40 text-sm py-8 text-center">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center">No activity yet in the last 30 days.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((r) => (
                <div key={r.email} className="py-3 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-medium text-white truncate">{r.email}</div>
                    <div className="text-xs text-white/40 truncate">{r.address}</div>
                  </div>
                  <div className="text-xs text-white/50 tabular-nums">
                    {format(new Date(r.latest.created_at), "dd MMM HH:mm")}
                  </div>
                  {r.converted ? (
                    <Badge className="bg-teal-400/15 text-teal-300 border-teal-400/30">
                      {fmtGBP(r.totalRev)} · Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/15 text-white/60">
                      Lead
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-teal-400/30 bg-teal-400/10 text-teal-200 hover:bg-teal-400/20"
                    onClick={() =>
                      navigate(
                        `/negotiate-for-me-ai?email=${encodeURIComponent(r.email)}${
                          r.address && r.address !== "—" ? `&address=${encodeURIComponent(r.address)}` : ""
                        }`
                      )
                    }
                  >
                    Open Sales Agent <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Agent performance */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 bg-[#0b1426] border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/70">
              <MessagesSquare className="w-4 h-4 text-teal-300" />
              <span className="text-xs uppercase tracking-wider">Sales Agent</span>
            </div>
            <div className="text-3xl font-semibold tabular-nums">{agentPerf.salesRate.toFixed(1)}%</div>
            <div className="text-xs text-white/40 mt-1">
              {agentPerf.salesConverted} / {agentPerf.salesShown} shown converted
            </div>
          </Card>
          <Card className="p-5 bg-[#0b1426] border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/70">
              <Target className="w-4 h-4 text-teal-300" />
              <span className="text-xs uppercase tracking-wider">Negotiation Agent</span>
            </div>
            <div className="text-3xl font-semibold tabular-nums">{agentPerf.negActivity}</div>
            <div className="text-xs text-white/40 mt-1">Drafts + emails this month</div>
          </Card>
          <Card className="p-5 bg-[#0b1426] border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/70">
              <Megaphone className="w-4 h-4 text-teal-300" />
              <span className="text-xs uppercase tracking-wider">Marketing Agent</span>
            </div>
            <div className="text-3xl font-semibold tabular-nums">{agentPerf.marketingPosts}</div>
            <div className="text-xs text-white/40 mt-1">Content pieces generated</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;