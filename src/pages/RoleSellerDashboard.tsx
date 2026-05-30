import { Link } from "react-router-dom";
import { TrendingUp, Users, FileText, BarChart3, ArrowRight, Trophy, Camera, Megaphone, Gavel, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import MyListingsPanel from "@/components/dashboard/MyListingsPanel";

const pipeline = [
  { stage: "Valuation", desc: "AI-modelled price band with confidence score", to: "/seller/valuation", icon: TrendingUp },
  { stage: "Listing prep", desc: "Photos, copy, TA6 pre-audit", to: "/seller/listing-prep", icon: Camera },
  { stage: "Marketing", desc: "Rightmove, Zoopla, social syndication", to: "/sell-your-property", icon: Megaphone },
  { stage: "Offers & chain", desc: "Compare offers, AI counter-strategy", to: "/seller/offers", icon: Gavel },
];

export default function RoleSellerDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Seller Mission Control | Hummm AI" description="Sell smarter with AI valuation, marketing and offer strategy." canonical="/dashboard/seller" />
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-background to-background p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <Trophy size={12} /> Seller · Mission Control
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
              Sell smarter. <span className="text-amber-400">Net more.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
              Pricing, marketing and offer strategy — orchestrated by AI so you walk away with the best possible exit.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/seller/valuation" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-background text-sm font-bold hover:shadow-[0_0_30px_hsl(40_90%_55%/0.4)] transition-all">
                <TrendingUp size={16} /> Get AI Valuation
              </Link>
              <Link to="/sell-your-property" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card hover:border-amber-500/40 text-sm font-semibold transition-all">
                <Megaphone size={16} /> List a Property
              </Link>
            </div>
          </div>
        </section>

        {/* KPI strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Avg. Days to Sell", value: "32", icon: BarChart3 },
            { label: "Avg. % of Asking", value: "98.4%", icon: TrendingUp },
            { label: "Offers / Listing", value: "4.7", icon: Users },
            { label: "AI Strategy Uplift", value: "+6.9%", icon: Sparkles },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <s.icon size={18} className="text-amber-400 mb-3" />
              <p className="text-2xl sm:text-3xl font-black tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Pipeline */}
        <section className="mt-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 mb-5 flex items-center gap-2">
            <FileText size={12} /> Sale Pipeline
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map((p, i) => (
              <Link key={p.stage} to={p.to} className="group relative rounded-2xl border border-border bg-card p-6 hover:border-amber-500/40 hover:shadow-[0_8px_40px_-12px_hsl(40_90%_55%/0.3)] transition-all">
                <span className="absolute top-4 right-4 text-[10px] font-bold text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <p.icon size={20} className="text-amber-400" />
                </div>
                <p className="text-base font-bold">{p.stage}</p>
                <p className="text-xs text-muted-foreground mt-1.5 mb-4">{p.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                  Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Active offers placeholder */}
        <section className="mt-12 rounded-3xl border border-border bg-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Active Offers</h3>
              <p className="text-xs text-muted-foreground mt-1">AI ranks and benchmarks every offer you receive</p>
            </div>
            <Link to="/seller/offers" className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Gavel size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No live offers yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">List your property to start receiving AI-scored offers.</p>
          </div>
        </section>

        <section className="mt-12">
          <MyListingsPanel />
        </section>
      </main>
    </div>
  );
}