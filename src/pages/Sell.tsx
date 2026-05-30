import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import ListingWizard from "@/components/ListingWizard";
import SEOHead from "@/components/SEOHead";
import { Link, useNavigate } from "react-router-dom";
import AddressLookup from "@/components/AddressLookup";
import CountrySelector from "@/components/CountrySelector";
import { usePricing } from "@/lib/pricing";
import {
  Sparkles, ArrowRight, Shield, TrendingUp, Zap, Globe,
  Brain, Target, Scale, Rocket, CheckCircle, MapPin,
} from "lucide-react";

const benefits = [
  { icon: Target, title: "AI Valuation That Beats Traditional Agents", desc: "Live market data, Land Registry records, and hyper-local insights — not guesswork." },
  { icon: Brain, title: "World-Class AI Negotiation", desc: "Adaptive counter-strategies and buyer psychology to maximise your sale price." },
  { icon: Shield, title: "Full Compliance & Legal Support", desc: "AML checks, TPO protection, and licensed human oversight on every binding decision." },
  { icon: Zap, title: "Faster Sales With Less Stress", desc: "AI handles marketing, viewings, and buyer enquiries 24/7 — you stay informed." },
  { icon: Globe, title: "Global Reach, Local Expertise", desc: "Operating in UK, USA, and SE Asia with deep local market knowledge." },
];

const steps = [
  { num: 1, title: "Drop your property link or address", desc: "Paste any listing URL or enter your address to get started instantly." },
  { num: 2, title: "Get instant AI valuation & insights", desc: "Receive an accurate, data-rich valuation with market comparisons in seconds." },
  { num: 3, title: "Choose your service", desc: "Pick Hummm or Full Sell — whatever suits you." },
  { num: 4, title: "AI handles everything", desc: "Marketing, viewings, and negotiation — all powered by AI with human oversight." },
  { num: 5, title: "Smooth completion", desc: "End-to-end transaction management with solicitor coordination and full compliance." },
];

const Sell = () => {
  const { country, setCountry, pricing } = usePricing();
  const [formOpen, setFormOpen] = useState(false);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleValuation = () => {
    navigate("/ai-valuation", { state: { prefillAddress: address } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="Sell Your Property Smarter with AI | Hummm"
        description="Sell your home with Hummm. AI valuations, world-class negotiation, and end-to-end support. Operating in UK, USA & SE Asia."
        canonical="/sell-your-property"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Property Sales",
          "provider": { "@type": "RealEstateAgent", "name": "Hummmingbird AI" },
          "description": "AI-powered property selling service with smarter valuations, stronger negotiation, and global reach.",
          "areaServed": ["United Kingdom", "United States", "Singapore"],
        }}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-32 pb-4 section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-6">
              HQ Singapore · Operating in UK · USA · SE Asia
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6 text-balance">
              Sell Smarter. Get More.{" "}
              <span className="text-gradient">Stress Less.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed text-balance">
              Our AI delivers accurate valuation, world-class negotiation, and end-to-end support.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Instant AI Valuation Box ── */}
      <section className="section-padding pb-0">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection delay={100}>
            <div className="rounded-3xl border border-primary/30 bg-card p-8 md:p-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin size={16} className="text-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Instant AI Valuation
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your full address or postcode to get started
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <AddressLookup
                    value={address}
                    onChange={setAddress}
                    placeholder="Start typing your address or postcode..."
                  />
                </div>
                <button
                  onClick={handleValuation}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-2xl whitespace-nowrap"
                >
                  <Sparkles size={16} />
                  Get My Free AI Valuation
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Benefits Grid ── */}
      <section className="py-20 section-padding">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-balance">
                Why Sellers Choose Us
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Everything you need to sell faster, for more, with less stress.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 80}>
                <div className="group rounded-3xl p-8 border border-border bg-card hover:border-primary/40 hover:shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)] transition-all h-full">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 mb-5">
                    <b.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 section-padding" id="how-it-works">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-balance">
                How Selling With Us Works
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Five simple steps from listing to completion.
              </p>
            </div>
          </AnimatedSection>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 80}>
                <div className="group flex items-start gap-6 rounded-3xl p-6 md:p-8 border border-border bg-card hover:border-primary/40 transition-all">
                  <span className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-black tabular-nums shadow-lg shadow-primary/20">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold mb-1 tracking-tight">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 section-padding">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-10 md:p-14 text-center">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <Scale size={11} /> {pricing.flag} {pricing.name}
                </div>
                <CountrySelector value={country} onChange={setCountry} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-balance relative z-10">
                Transparent, Competitive Pricing
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6 relative z-10 leading-relaxed">
                {pricing.traditional.summary}. No hidden fees. No tie-in periods.
              </p>
              <div className="relative z-10 inline-flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-black text-primary tabular-nums">{pricing.sell.fee}</span>
                <span className="text-muted-foreground text-lg">{pricing.sell.unit}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-4 relative z-10 leading-relaxed">
                No sale, no fee. Dramatically cheaper than traditional agents ({pricing.traditional.sell}).
              </p>
              <div className="relative z-10 mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
                {pricing.saleExamples.map((ex) => (
                  <div key={ex.label} className="rounded-2xl border border-border bg-card/60 p-3">
                    <p className="text-xs text-muted-foreground">{ex.label}</p>
                    <p className="text-lg font-black text-primary tabular-nums">{ex.fee}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 section-padding">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-10 md:p-16 text-center">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Sparkles size={28} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight text-balance">
                  Ready to sell smarter?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Get your free AI valuation and see exactly what your property is worth today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/ai-valuation"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group"
                  >
                    <Sparkles size={18} />
                    Start Your Free AI Valuation
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-5 text-base font-semibold border-2 border-border text-foreground hover:bg-foreground/5 transition-all rounded-full"
                  >
                    <Rocket size={16} />
                    Let Us Sell For You
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Trust Line ── */}
      <section className="pb-20 section-padding">
        <AnimatedSection>
          <p className="text-center text-xs text-muted-foreground tracking-widest uppercase">
            <CheckCircle size={12} className="inline mr-1.5 text-primary" />
            Used by landlords and tenants in UK, USA and SE Asia · Backed by real market data
          </p>
        </AnimatedSection>
      </section>

      <Footer />
      <ListingWizard open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default Sell;
