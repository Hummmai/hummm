import { Link } from "react-router-dom";
import { Key, FileText, ShieldCheck, ArrowRight, Search, MessageSquare, Sparkles, Eye, AlertTriangle, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";

export default function RoleRenterDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Renter Hub | Hummm AI" description="Find rentals, audit contracts and protect your tenancy." canonical="/dashboard/tenant" />
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-background to-background p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-10 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <Key size={12} /> Renter · Tenant Flex
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
              Find a home. <span className="text-violet-400">Stay protected.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
              Hummm AI scans listings, audits tenancy agreements, and drafts the right reply when your landlord pushes back.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/properties?type=rent" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-400 text-background text-sm font-bold hover:shadow-[0_0_30px_hsl(265_90%_70%/0.4)] transition-all">
                <Search size={16} /> Find a Rental
              </Link>
              <Link to="/humm-rent" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card hover:border-violet-500/40 text-sm font-semibold transition-all">
                <MessageSquare size={16} /> Negotiate Rent
              </Link>
            </div>
          </div>
        </section>

        {/* Side-by-side: Rights + Search */}
        <section className="grid md:grid-cols-3 gap-5 mt-8">
          {/* Search */}
          <Link to="/saved-searches" className="md:col-span-2 group rounded-3xl border border-border bg-card p-7 hover:border-violet-500/40 transition-all">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-4">
              <Search size={12} /> Live Search
            </div>
            <h3 className="text-2xl font-bold">Saved searches & alerts</h3>
            <p className="text-sm text-muted-foreground mt-2">Be the first to apply when matching rentals hit Rightmove or Zoopla.</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[{l:"Active",v:"0"},{l:"This week",v:"0"},{l:"Saved",v:"0"}].map(s => (
                <div key={s.l} className="rounded-xl bg-background/40 border border-border p-3">
                  <p className="text-xl font-black tabular-nums">{s.v}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 mt-5">
              Manage searches <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Rights */}
          <Link to="/rights" className="group rounded-3xl border border-border bg-card p-7 hover:border-violet-500/40 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-bold">Know your rights</h3>
            <p className="text-sm text-muted-foreground mt-2 flex-1">Renters' Rights Act 2025 — instantly check what's enforceable.</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 mt-5">
              Run rights check <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </section>

        {/* Toolset */}
        <section className="mt-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400 mb-5 flex items-center gap-2">
            <Sparkles size={12} /> Renter Toolkit
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Audit a tenancy", to: "/humm-ai-negotiator", icon: FileText, desc: "Spot unfair clauses" },
              { label: "Repair request", to: "/tenants", icon: AlertTriangle, desc: "Formal letter, your rights" },
              { label: "Pet application", to: "/tenants", icon: Home, desc: "RRA 2025 framework" },
              { label: "Viewings calendar", to: "/viewings", icon: Eye, desc: "Track every appointment" },
            ].map((t) => (
              <Link key={t.label} to={t.to} className="group rounded-2xl border border-border bg-card p-5 hover:border-violet-500/40 transition-all">
                <t.icon size={20} className="text-violet-400 mb-3" />
                <p className="text-sm font-bold">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}