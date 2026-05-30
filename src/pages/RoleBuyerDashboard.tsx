import { Link } from "react-router-dom";
import { Search, Target, MessageSquare, TrendingUp, Sparkles, Trophy, Eye, Calculator, ArrowRight, Crosshair, Zap, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";

const tactics = [
  { label: "Drop a property URL", to: "/humm-ai-negotiator", icon: Crosshair, accent: "from-emerald-500/20 to-teal-500/5", desc: "Audit any listing in under 60s" },
  { label: "Calculate max offer", to: "/budget", icon: Calculator, accent: "from-blue-500/20 to-indigo-500/5", desc: "Mortgage + deposit modelling" },
  { label: "Saved searches", to: "/saved-searches", icon: Search, accent: "from-violet-500/20 to-purple-500/5", desc: "Be first when listings drop" },
  { label: "Open negotiations", to: "/dashboard", icon: MessageSquare, accent: "from-amber-500/20 to-orange-500/5", desc: "AI-drafted counter offers" },
];

export default function RoleBuyerDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Buyer Command Centre | Hummm AI" description="Find, audit and win the right property with your AI buying co-pilot." canonical="/dashboard/buyer" />
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-background to-background p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <Crosshair size={12} /> Buyer · Tactical Negotiator
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
              Find it. Audit it. <span className="text-primary">Win it.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
              Your AI buying co-pilot scouts listings, runs forensic audits, and drafts the strongest possible offer — so you stop overpaying and start winning.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/humm-ai-negotiator" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-background text-sm font-bold hover:shadow-[0_0_30px_hsl(168_80%_48%/0.4)] transition-all">
                <Zap size={16} /> Audit a Property
              </Link>
              <Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card hover:border-primary/40 text-sm font-semibold transition-all">
                <Search size={16} /> Browse Listings
              </Link>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Avg. Saving", value: "£23,400", icon: TrendingUp },
            { label: "Audit Speed", value: "47s", icon: Zap },
            { label: "Win Rate", value: "78%", icon: Trophy },
            { label: "Markets", value: "14", icon: MapPin },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <s.icon size={18} className="text-primary mb-3" />
              <p className="text-2xl sm:text-3xl font-black tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Tactical playbook */}
        <section className="mt-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
            <Target size={12} /> Buyer Playbook
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tactics.map((t) => (
              <Link key={t.label} to={t.to} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px_hsl(168_80%_48%/0.3)] transition-all flex items-center gap-5">
                <div className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${t.accent} flex items-center justify-center border border-border`}>
                  <t.icon size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </div>
                <ArrowRight size={18} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Hummm AI assistant prompt */}
        <section className="mt-12 rounded-3xl border border-border bg-card p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Ask Hummm AI</h3>
            <p className="text-sm text-muted-foreground mt-1">"Should I offer £465k on a £495k Victorian terrace in SW11?" — get a strategic answer in seconds.</p>
          </div>
          <Link to="/negotiate-for-me" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
            Open Assistant <ArrowRight size={14} />
          </Link>
        </section>
      </main>
    </div>
  );
}