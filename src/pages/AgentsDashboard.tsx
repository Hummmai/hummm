import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, TrendingUp, Users, Target, ArrowUpRight, Zap, Bot,
  Megaphone, BarChart3, FileText, Plus, Send, Activity, Flame,
  Heart, MessageCircle, Eye, ChevronRight, Radio, MessageSquare, Mail, Calendar, PenTool,
  Scale, ShieldCheck, Gavel, ClipboardCheck, Wand2, Loader2
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const hotLeads = [
  { name: "Sarah Thompson", detail: "£850k valuation • Wandsworth", score: 94, status: "Hot", tag: "Replied 2h ago" },
  { name: "Marcus Lin", detail: "£1.2M • Notting Hill", score: 88, status: "Warm", tag: "Viewing booked" },
  { name: "Priya Kapoor", detail: "£620k • Hackney", score: 81, status: "Warm", tag: "Awaiting AML" },
  { name: "James O'Connor", detail: "£475k • Clapham", score: 76, status: "Nurture", tag: "Follow up Fri" },
  { name: "Aisha Rahman", detail: "£3.4M • Mayfair", score: 72, status: "Nurture", tag: "Sent brochure" },
];

const contentQueue = [
  { title: "5 signs your agent is overpricing", type: "LinkedIn Carousel", eta: "Ready in 2m" },
  { title: "Wandsworth Q2 market pulse", type: "Blog + Email", eta: "Drafting" },
  { title: "Why AI negotiation beats commission", type: "Video Script", eta: "Queued" },
  { title: "Renters' Rights Act explained", type: "Instagram Reel", eta: "Queued" },
];

const recentPosts = [
  { platform: "LinkedIn", title: "We saved a buyer £42k last week. Here's how.", impressions: "12.4k", likes: 487, comments: 63, color: "from-blue-500/20 to-cyan-500/10" },
  { platform: "Instagram", title: "London rent dropped 3.1% in Zone 2 — chart", impressions: "8.9k", likes: 612, comments: 41, color: "from-pink-500/20 to-rose-500/10" },
  { platform: "X / Twitter", title: "Estate agents hate this one trick (it's AI)", impressions: "6.2k", likes: 298, comments: 88, color: "from-slate-500/20 to-zinc-500/10" },
];

const StatusDot = ({ color = "bg-primary" }: { color?: string }) => (
  <span className="relative inline-flex h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
    <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
  </span>
);

export default function AgentsDashboard() {
  const [tab, setTab] = useState<"sales" | "marketing" | "negotiation">("sales");
  const [orchInput, setOrchInput] = useState("");
  const [orchLoading, setOrchLoading] = useState(false);
  const navigate = useNavigate();

  // Lightweight intent router → picks the best specialist agent for the query.
  const routeIntent = (raw: string): "sales" | "negotiation" | "marketing" => {
    const q = raw.toLowerCase();
    const score = { sales: 0, negotiation: 0, marketing: 0 };
    const bump = (k: keyof typeof score, kws: string[]) => kws.forEach(w => { if (q.includes(w)) score[k] += 1; });
    bump("negotiation", ["offer", "counter", "negotiat", "ask", "asking price", "best and final", "viewing", "vendor", "agent reply", "below ask", "chase", "deal", "audit", "fair value"]);
    bump("marketing", ["post", "linkedin", "instagram", "blog", "seo", "campaign", "email sequence", "newsletter", "lead magnet", "content", "caption", "headline", "ad copy", "carousel"]);
    bump("sales", ["lead", "follow up", "follow-up", "qualify", "valuation", "book call", "strategy call", "convert", "sell for me", "let for me", "pricing", "objection"]);
    const best = (Object.entries(score) as [keyof typeof score, number][])
      .sort((a, b) => b[1] - a[1])[0];
    return best[1] === 0 ? "sales" : best[0];
  };

  const submitOrchestrator = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = orchInput.trim();
    if (!text || orchLoading) return;
    setOrchLoading(true);
    // AI-based routing with deterministic fallback
    let agent: "sales" | "negotiation" | "marketing" = routeIntent(text);
    let refined = text;
    try {
      const { data, error } = await supabase.functions.invoke("agent-orchestrator", { body: { message: text } });
      if (!error && data?.agent && ["sales", "negotiation", "marketing"].includes(data.agent)) {
        agent = data.agent;
        if (typeof data.refined_prompt === "string" && data.refined_prompt.trim()) refined = data.refined_prompt;
      }
    } catch { /* keep keyword fallback */ }
    navigate(`/agents/${agent}?prefill=${encodeURIComponent(refined)}&auto=1`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEOHead title="AI Agents | Hummingbird AI" description="Your autonomous Sales, Marketing & Negotiation AI agents working 24/7." canonical="/agents" />
      <Navbar />

      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_80%)]" />
      </div>

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-[0.18em] mb-5">
            <Sparkles size={12} /> Agent Command Centre
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-balance max-w-3xl">
            Your AI workforce, <span className="text-primary">working while you sleep</span>.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-sm sm:text-base">
            Three autonomous agents running in parallel — closing leads, growing your audience, and negotiating the best deals without a single coffee break.
          </p>

          {/* Orchestrator — intent router */}
          <form onSubmit={submitOrchestrator} className="mt-8 group relative rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 backdrop-blur-xl p-1.5 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.35)] focus-within:border-primary/50 focus-within:shadow-[0_25px_70px_-15px_hsl(var(--primary)/0.5)] transition-all">
            <div className="flex items-center gap-2 pl-4 pr-1.5 py-1">
              <Wand2 size={16} className="text-primary shrink-0" />
              <input
                value={orchInput}
                onChange={(e) => setOrchInput(e.target.value)}
                placeholder="Ask anything — I'll route you to the right specialist agent…"
                className="flex-1 bg-transparent py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <button type="submit" disabled={!orchInput.trim() || orchLoading} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all">
                {orchLoading ? <><Loader2 size={13} className="animate-spin" /> Routing</> : <>Route <ArrowUpRight size={13} /></>}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-1">
              {[
                "Draft an offer £40k below ask",
                "Write a LinkedIn post about AI valuations",
                "Follow up with my £850k valuation lead",
                "SEO blog on first-time landlords",
              ].map(s => (
                <button key={s} type="button" onClick={() => { setOrchInput(s); }} className="px-2.5 py-1 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-primary/30 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all">
                  {s}
                </button>
              ))}
            </div>
          </form>

          {/* Agent launch cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Link to="/agents/sales" className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)] transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                  <Bot size={20} className="text-primary" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <StatusDot color="bg-emerald-400" /> Active
                </span>
              </div>
              <h3 className="text-lg font-black mb-1.5">Hummm Sales Agent</h3>
              <p className="text-xs text-muted-foreground mb-4">Qualifies valuation leads, drafts personalised follow-ups, books strategy calls.</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[{ i: Users, l: "Qualify" }, { i: Mail, l: "Follow-up" }, { i: Calendar, l: "Book calls" }].map(({ i: I, l }) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/15 text-[10px] font-bold text-primary"><I size={10} /> {l}</span>
                ))}
              </div>
              <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black group-hover:bg-primary/90 transition-colors">
                Open Agent <ArrowUpRight size={13} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <Link to="/agents/negotiation" className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 hover:border-amber-500/40 hover:shadow-[0_20px_60px_-20px_hsl(40_90%_50%/0.4)] transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Scale size={20} className="text-amber-400" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  <StatusDot color="bg-amber-400" /> Ready
                </span>
              </div>
              <h3 className="text-lg font-black mb-1.5">Hummm Negotiation Agent</h3>
              <p className="text-xs text-muted-foreground mb-4">Elite property negotiator — drafts offers, counters, and ready-to-send emails from your audit data.</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[{ i: Gavel, l: "Offers" }, { i: ShieldCheck, l: "Strategy" }, { i: ClipboardCheck, l: "Email drafts" }].map(({ i: I, l }) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/5 border border-amber-500/15 text-[10px] font-bold text-amber-400"><I size={10} /> {l}</span>
                ))}
              </div>
              <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black transition-colors">
                Open Agent <ArrowUpRight size={13} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <Link to="/agents/marketing" className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card p-6 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-20px_hsl(280_80%_60%/0.4)] transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/30 to-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Megaphone size={20} className="text-violet-300" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  <StatusDot color="bg-violet-400" /> Running
                </span>
              </div>
              <h3 className="text-lg font-black mb-1.5">Hummm Marketing Agent</h3>
              <p className="text-xs text-muted-foreground mb-4">LinkedIn, Instagram, email campaigns, SEO blogs, and lead magnets — finished, ready-to-publish copy.</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[{ i: PenTool, l: "Copy" }, { i: FileText, l: "SEO blogs" }, { i: BarChart3, l: "Analytics" }].map(({ i: I, l }) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-violet-500/5 border border-violet-500/15 text-[10px] font-bold text-violet-300"><I size={10} /> {l}</span>
                ))}
              </div>
              <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs font-black transition-colors">
                Open Agent <ArrowUpRight size={13} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <MessageSquare size={11} /> Below: a live snapshot of what each agent has been doing.
          </p>

          {/* Mobile tab switcher */}
          <div className="lg:hidden mt-6 grid grid-cols-3 gap-2 p-1 rounded-2xl border border-border bg-card">
            <button onClick={() => setTab("sales")} className={`py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "sales" ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]" : "text-muted-foreground"}`}>
              <Bot size={14} className="inline mr-1.5" /> Sales
            </button>
            <button onClick={() => setTab("negotiation")} className={`py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "negotiation" ? "bg-amber-500 text-white shadow-[0_4px_20px_-4px_hsl(40_90%_50%/0.5)]" : "text-muted-foreground"}`}>
              <Scale size={14} className="inline mr-1.5" /> Negotiate
            </button>
            <button onClick={() => setTab("marketing")} className={`py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "marketing" ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]" : "text-muted-foreground"}`}>
              <Megaphone size={14} className="inline mr-1.5" /> Marketing
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ========== SALES AGENT ========== */}
          <section className={`${tab === "sales" ? "block" : "hidden"} lg:block`}>
            <div className="relative rounded-3xl border border-primary/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Agent header */}
              <div className="relative flex items-center justify-between mb-7">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <Bot size={22} className="text-primary" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-card animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight">Hummingbird Sales Agent</h2>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                      <StatusDot color="bg-emerald-400" /> Active • Closing leads
                    </div>
                  </div>
                </div>
                <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  Logs <ChevronRight size={12} />
                </button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl border border-border bg-background/40 backdrop-blur p-4">
                  <Users size={14} className="text-primary mb-2" />
                  <p className="text-2xl font-black tabular-nums">47</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Live leads</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 backdrop-blur p-4">
                  <TrendingUp size={14} className="text-primary mb-2" />
                  <p className="text-2xl font-black tabular-nums">28%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Conversion</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 backdrop-blur p-4">
                  <Target size={14} className="text-primary mb-2" />
                  <p className="text-2xl font-black tabular-nums">£4.2M</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Pipeline</p>
                </div>
              </div>

              {/* Next action */}
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Next Best Action</p>
                    <p className="text-sm font-semibold text-foreground text-pretty">
                      Follow up with <span className="text-primary">Sarah</span> on her £850k valuation — replied 2h ago, high intent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hot leads */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                    <Flame size={12} className="text-orange-400" /> Hot Leads
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Confidence score</span>
                </div>
                <div className="space-y-2">
                  {hotLeads.map((lead) => (
                    <div key={lead.name} className="group rounded-xl border border-border bg-background/30 hover:bg-background/60 hover:border-primary/30 p-3.5 transition-all cursor-pointer">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/20 flex items-center justify-center text-[11px] font-black text-primary shrink-0">
                            {lead.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{lead.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{lead.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted-foreground">{lead.tag}</p>
                          </div>
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${lead.score * 0.94} 100`} strokeLinecap="round" />
                            </svg>
                            <span className="text-[11px] font-black tabular-nums text-primary">{lead.score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button className="w-full group relative overflow-hidden rounded-2xl bg-primary text-primary-foreground font-black text-sm py-4 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)] hover:shadow-[0_15px_50px_-10px_hsl(var(--primary)/0.8)] transition-all active:scale-[0.98]">
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <Send size={15} /> Start New Outreach
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
          </section>

          {/* ========== NEGOTIATION AGENT ========== */}
          <section className={`${tab === "negotiation" ? "block" : "hidden"} lg:block`}>
            <div className="relative rounded-3xl border border-amber-500/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-20px_hsl(40_90%_50%/0.25)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Agent header */}
              <div className="relative flex items-center justify-between mb-7">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Scale size={22} className="text-amber-400" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-card animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight">Hummm Negotiation Agent</h2>
                    <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                      <StatusDot color="bg-amber-400" /> Active • Closing deals
                    </div>
                  </div>
                </div>
                <button className="text-xs font-bold text-muted-foreground hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  Logs <ChevronRight size={12} />
                </button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl border border-border bg-background/40 backdrop-blur p-4">
                  <Gavel size={14} className="text-amber-400 mb-2" />
                  <p className="text-2xl font-black tabular-nums">12</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Active deals</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 backdrop-blur p-4">
                  <TrendingUp size={14} className="text-amber-400 mb-2" />
                  <p className="text-2xl font-black tabular-nums">£142k</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Saved YTD</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 backdrop-blur p-4">
                  <ShieldCheck size={14} className="text-amber-400 mb-2" />
                  <p className="text-2xl font-black tabular-nums">91%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Win rate</p>
                </div>
              </div>

              {/* Next action */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Zap size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Next Best Action</p>
                    <p className="text-sm font-semibold text-foreground text-pretty">
                      Send counter-offer for <span className="text-amber-400">Clapham 2-bed</span> — anchor at 94% of fair value using comparable sold data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active deals */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                    <Flame size={12} className="text-orange-400" /> Active Deals
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Saved vs ask</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Wandsworth 3-bed", detail: "£850k ask → £795k target", saved: "£55k", score: 94 },
                    { name: "Notting Hill flat", detail: "£1.2M ask → £1.08M target", saved: "£120k", score: 88 },
                    { name: "Hackney terrace", detail: "£620k ask → £585k target", saved: "£35k", score: 81 },
                    { name: "Clapham 2-bed", detail: "£475k ask → £445k target", saved: "£30k", score: 76 },
                  ].map((deal) => (
                    <div key={deal.name} className="group rounded-xl border border-border bg-background/30 hover:bg-background/60 hover:border-amber-500/30 p-3.5 transition-all cursor-pointer">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center text-[11px] font-black text-amber-400 shrink-0">
                            <Scale size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{deal.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{deal.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-amber-400 font-bold">{deal.saved} saved</p>
                          </div>
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(40 90% 50%)" strokeWidth="3" strokeDasharray={`${deal.score * 0.94} 100`} strokeLinecap="round" />
                            </svg>
                            <span className="text-[11px] font-black tabular-nums text-amber-400">{deal.score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-sm py-4 shadow-[0_10px_40px_-10px_hsl(40_90%_50%/0.6)] hover:shadow-[0_15px_50px_-10px_hsl(40_90%_50%/0.8)] transition-all active:scale-[0.98]">
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <Send size={15} /> Start New Negotiation
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
          </section>

          {/* ========== MARKETING AGENT ========== */}
          <section className={`${tab === "marketing" ? "block" : "hidden"} lg:block`}>
            <div className="relative rounded-3xl border border-violet-500/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-20px_hsl(280_80%_60%/0.25)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Agent header */}
              <div className="relative flex items-center justify-between mb-7">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                    <Megaphone size={22} className="text-violet-300" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-violet-400 border-2 border-card animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight">Hummingbird Marketing Agent</h2>
                    <div className="flex items-center gap-2 text-[11px] text-violet-300 font-bold uppercase tracking-wider mt-0.5">
                      <StatusDot color="bg-violet-400" /> Running • Generating content
                    </div>
                  </div>
                </div>
                <button className="text-xs font-bold text-muted-foreground hover:text-violet-300 transition-colors inline-flex items-center gap-1">
                  Logs <ChevronRight size={12} />
                </button>
              </div>

              {/* Campaign performance hero */}
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                    <Radio size={11} /> Live Campaign
                  </div>
                  <span className="text-[10px] text-muted-foreground">Last 24h</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">LinkedIn Post</p>
                <p className="text-lg font-black mb-3 text-pretty">"We saved a buyer £42k last week. Here's how."</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1"><Eye size={10} /> Impressions</div>
                    <p className="text-xl font-black tabular-nums text-violet-300">12.4k</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1"><Heart size={10} /> Likes</div>
                    <p className="text-xl font-black tabular-nums">487</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1"><MessageCircle size={10} /> Comments</div>
                    <p className="text-xl font-black tabular-nums">63</p>
                  </div>
                </div>
                {/* Mini bar chart */}
                <div className="mt-4 flex items-end gap-1 h-10">
                  {[40, 65, 52, 78, 90, 72, 95, 88, 100, 84, 76, 92].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-violet-500/40 to-violet-400/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Content queue */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                    <FileText size={12} /> Content Queue
                  </h3>
                  <span className="text-[10px] text-muted-foreground">{contentQueue.length} queued</span>
                </div>
                <div className="space-y-2">
                  {contentQueue.map((item, i) => (
                    <div key={item.title} className="group rounded-xl border border-border bg-background/30 hover:bg-background/60 hover:border-violet-500/30 p-3.5 transition-all cursor-pointer flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-300 shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">{item.type}</p>
                      </div>
                      <span className="text-[10px] font-bold text-violet-300 shrink-0 hidden sm:inline">{item.eta}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent posts */}
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2 mb-3">
                  <Activity size={12} /> Recent Posts
                </h3>
                <div className="space-y-2">
                  {recentPosts.map((post) => (
                    <div key={post.title} className={`rounded-xl border border-border bg-gradient-to-r ${post.color} p-3.5`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70">{post.platform}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{post.impressions} views</span>
                      </div>
                      <p className="text-xs font-semibold mb-2 truncate">{post.title}</p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Heart size={10} /> {post.likes}</span>
                        <span className="inline-flex items-center gap-1"><MessageCircle size={10} /> {post.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-black text-sm py-4 shadow-[0_10px_40px_-10px_hsl(280_80%_60%/0.6)] hover:shadow-[0_15px_50px_-10px_hsl(280_80%_60%/0.8)] transition-all active:scale-[0.98]">
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <Plus size={15} /> Generate New Lead Magnet
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
          </section>
        </div>

        {/* Footer strip */}
        <div className="mt-8 rounded-2xl border border-border bg-card/40 backdrop-blur p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <BarChart3 size={14} className="text-primary" />
            All agents synced with your data • Last activity 12s ago
          </div>
          <button className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
            View full agent settings <ChevronRight size={12} />
          </button>
        </div>
      </main>
    </div>
  );
}