import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Download, TrendingUp, Sparkles, Target, Mail, Building2, ArrowRight } from "lucide-react";

const pricing = [
  { v: "0.8%", l: "Sell", s: "vs 1.4–3% market" },
  { v: "5.5%", l: "Let", s: "vs 8–15% market" },
  { v: "3%", l: "Management", s: "vs 10–12% market" },
  { v: "Free", l: "Negotiate", s: "first one on us" },
];

const traction = [
  { v: "47k+", l: "Property audits run" },
  { v: "£2.4bn+", l: "Property value analysed" },
  { v: "14", l: "Global markets live" },
  { v: "GPT-5.x", l: "+ Savant AI engine" },
];

export default function ForInvestors() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEOHead
        title="For Investors – Hummm AI"
        description="Hummm AI is raising £1M at £5M pre-money to scale the intelligent AI platform transforming real estate. Download the full pitch deck."
        canonical="/for-investors"
        noindex
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-44 sm:pt-48 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-5 inline-flex items-center gap-2">
              <Sparkles size={12} /> Investor Relations · Confidential
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-balance mb-6">
              Invest in the <span className="text-gradient">Future of Property</span>.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Hummm AI — the intelligent AI platform transforming real estate for buyers, sellers, landlords and renters.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/Hummm-AI-Pitch-Deck.pdf"
                download
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press shadow-[0_10px_40px_-10px_hsl(168_80%_48%/0.6)] hover:shadow-[0_14px_50px_-10px_hsl(168_80%_48%/0.8)] transition-shadow"
              >
                <Download size={16} /> Download Full Pitch Deck (PDF)
              </a>
              <a
                href="/Hummm-AI-Pitch-Deck.pptx"
                download
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-primary/40 text-sm font-bold hover:border-primary/80 transition-colors"
              >
                <Download size={16} /> Editable (.pptx · Keynote)
              </a>
              <a
                href="mailto:rob@hummm.pro?subject=Hummm%20AI%20Investment%20Enquiry"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-sm font-bold hover:border-primary/60 transition-colors"
              >
                <Mail size={16} /> Contact Rob
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* One-pager */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* About */}
          <AnimatedSection>
            <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-8 sm:p-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-4">The Company</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-balance">
                One AI co-pilot for every property decision.
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                Hummm AI replaces the legacy estate-agent model with an AI-native platform: instant audits and
                valuations, autonomous negotiation, full letting and selling services, and role-specific Command
                Centres for Buyers, Sellers, Landlords and Renters — across 14 global markets.
              </p>
            </div>
          </AnimatedSection>

          {/* Pricing */}
          <AnimatedSection delay={80}>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-4">Disruptive Pricing</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {pricing.map((p) => (
                <div key={p.l} className="rounded-2xl border border-border bg-card p-6 card-hover">
                  <p className="text-4xl font-black text-primary tabular-nums">{p.v}</p>
                  <p className="mt-2 text-base font-bold">{p.l}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.s}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Traction */}
          <AnimatedSection delay={120}>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-4">Traction Highlights</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {traction.map((t) => (
                <div key={t.l} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp size={18} className="text-primary" />
                  </div>
                  <p className="text-2xl font-black tabular-nums">{t.v}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">{t.l}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* The Ask */}
          <AnimatedSection delay={160}>
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-4 inline-flex items-center gap-2">
                  <Target size={12} /> The Ask
                </p>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
                  £1M raise <span className="text-primary">·</span> £5M pre-money
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  18-month runway to £2M ARR and Series A readiness. SEIS/EIS advance assurance pending. Lead investor
                  allocation available — £250k minimum cheque.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Download CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="rounded-3xl border border-border bg-card p-10 sm:p-14 text-center">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-6">
                <Download size={28} className="text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-balance">
                Read the full investor story.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                12-slide deck covering problem, solution, market, business model, traction, 5-year projections, team
                and the ask.
              </p>
              <a
                href="/Hummm-AI-Pitch-Deck.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base btn-press shadow-[0_10px_40px_-10px_hsl(168_80%_48%/0.6)]"
              >
                <Download size={18} /> Download Pitch Deck (PDF)
              </a>
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Mail size={12} /> Direct enquiries:&nbsp;
                <a href="mailto:rob@hummm.pro" className="text-primary font-semibold hover:underline">rob@hummm.pro</a>
                <ArrowRight size={12} />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div className="mt-10 flex items-start gap-3 text-xs text-muted-foreground justify-center">
              <Building2 size={14} className="text-primary mt-0.5" />
              <p>
                Hummm AI · Registered Office: 128 City Road, London EC1V 2NX, United Kingdom
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}