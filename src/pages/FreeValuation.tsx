import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Shield, Zap, Clock, CheckCircle2, TrendingUp, BarChart3, MapPin, Lock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AddressLookup from "@/components/AddressLookup";
import CountrySelector from "@/components/CountrySelector";
import { usePricing } from "@/lib/pricing";

const trustItems = [
  { icon: Shield, label: "GDPR compliant" },
  { icon: Lock, label: "No spam, ever" },
  { icon: Zap, label: "Under 30 seconds" },
  { icon: CheckCircle2, label: "100% free" },
];

const benefits = [
  { icon: TrendingUp, title: "Accurate AI valuation", desc: "Live Land Registry, Rightmove & Zoopla comps blended with hyper-local AI." },
  { icon: BarChart3, title: "Full deep audit report", desc: "Market momentum, rental yield, renovation uplift and risk flags." },
  { icon: MapPin, title: "14 markets covered", desc: "Local laws, taxes and regulations baked into every report." },
];

type Cta = { href: string; title: string; price: string; desc: string; highlight?: boolean; comingSoon?: boolean };
const ctas: Cta[] = [
  { href: "/negotiate-for-me", title: "Negotiate For Me", price: "Free", desc: "Your first negotiation is on us. Hummm AI runs the whole playbook and fights for every pound.", highlight: true },
  { href: "/let-my-property", title: "Let My Property", price: "5.5%", desc: "End-to-end AI letting vs 8–12% traditional agents." },
  { href: "/sell-my-property", title: "Sell For Me", price: "Soon", desc: "Full AI selling service launching shortly. Join the waitlist.", comingSoon: true },
];

const FreeValuation = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { country, setCountry, pricing } = usePricing();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (address.trim().length < 3) return;
    setSubmitting(true);
    try {
      const draft = {
        form: {
          name: "", email: "", phone: "", address: address.trim(),
          propertyType: "", bedrooms: "", bathrooms: "", sqft: "",
          tenure: "", parking: "", garden: "", garage: "",
          improvements: "", specialFeatures: [], goal: "",
          country,
        },
        step: 1,
        addressSelected: true,
        country,
      };
      sessionStorage.setItem("humm_valuation_session", JSON.stringify(draft));
    } catch { /* ignore */ }
    navigate("/ai-valuation");
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="Free AI Property Valuation & Deep Audit Report | Hummm AI"
        description="Get a precise, data-driven AI property valuation in under 30 seconds. Powered by Land Registry, Rightmove & Zoopla. Includes full audit with comparables, yield analysis, and renovation uplift — 100% free, no sign-up."
        canonical="/free-valuation"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Hummm AI Property Valuation",
          "url": "https://hummm.pro/free-valuation",
          "description": "Free AI-powered property valuation and deep audit tool. Get instant accurate valuations using live Land Registry, Rightmove and Zoopla data.",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
          },
          "featureList": [
            "Instant AI Valuation",
            "Deep Market Audit",
            "Comparable Sales Analysis",
            "Rental Yield Calculator",
            "Renovation Uplift Simulator",
            "Risk & Opportunity Insights"
          ],
          "provider": {
            "@type": "Organization",
            "name": "Hummm AI",
            "url": "https://hummm.pro"
          }
        }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-24 px-5 sm:px-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/[0.06] blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/[0.06] mb-6">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.18em]">100% Free · No sign-up required</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] mb-5 text-balance">
            Get Your Free AI Property Valuation
            <span className="block text-primary mt-2 drop-shadow-[0_0_24px_hsl(168_80%_48%/0.4)]">+ Deep Audit Report</span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instant, accurate valuation plus a full property report in under 30 seconds. Powered by live market data and our Savant AI engine.
          </p>

          {/* INPUT */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-3 sm:p-4 shadow-[0_20px_60px_-20px_hsl(168_80%_30%/0.3)]">
              <div className="flex items-center justify-between gap-3 mb-3 px-1">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">
                  Step 1 — Your property
                </p>
                <CountrySelector value={country} onChange={setCountry} />
              </div>
              <AddressLookup
                value={address}
                onChange={setAddress}
                onAddressSelected={setAddress}
                variant="dark"
                label=""
                placeholder={pricing.addressHint}
                country={country}
              />
              <button
                type="submit"
                disabled={address.trim().length < 3 || submitting}
                className="btn-press btn-glow mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition-all"
              >
                Get My Free Valuation Now
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon size={12} className="text-primary/70" />
                  <span className="text-[11px] text-white/50 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </form>

          {/* Social proof */}
          <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-[11px] text-white/60"><span className="font-bold text-white">47,000+</span> property reports generated</span>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-16 sm:py-20 px-5 sm:px-8 bg-white/[0.02] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">What you get — instantly</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-balance">A full property intelligence report. Free.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-xl p-6 card-hover">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2 tracking-tight">{title}</h3>
                <p className="text-[13px] text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-16 sm:py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hummm Home premium upgrade — luxury upsell */}
          <a
            href="/hummm-home"
            className="group block mb-12 relative overflow-hidden rounded-2xl border transition-all hover:scale-[1.005]"
            style={{
              borderColor: "#C9A24C66",
              background: "linear-gradient(135deg, #0B1B33 0%, #06112A 100%)",
              boxShadow: "0 30px 80px -30px rgba(201, 162, 76, 0.35)",
            }}
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 80% 30%, #C9A24C33, transparent 60%)" }}
            />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center p-7 sm:p-10">
              <div>
                <p className="uppercase mb-3 inline-flex items-center gap-3" style={{ color: "#C9A24C", fontSize: 10, letterSpacing: "0.42em", fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>
                  <span className="inline-block w-8 h-px" style={{ background: "#C9A24C" }} />
                  Premium Upgrade · New
                </p>
                <h3 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', color: "#F5EFE3", fontWeight: 400, letterSpacing: "-0.01em" }}>
                  List with <span style={{ fontStyle: "italic", color: "#E5C77A" }}>Hummm Home</span>
                </h3>
                <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', color: "#F5EFE3CC", fontSize: 16, fontStyle: "italic" }}>
                  AI-powered luxury British agency. 0.75% sales fee, magazine-grade marketing, dedicated client director.
                </p>
              </div>
              <span
                className="inline-flex items-center gap-2 px-6 py-3 uppercase shrink-0 transition-transform group-hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(135deg, #E5C77A, #C9A24C)",
                  color: "#06112A",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  fontWeight: 600,
                  fontFamily: "Inter,sans-serif",
                }}
              >
                Discover Hummm Home <ArrowRight size={14} />
              </span>
            </div>
          </a>

          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Ready to act on your report?</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-balance">Hummm AI does the heavy lifting</h2>
            <p className="mt-3 text-sm sm:text-base text-white/55 max-w-xl mx-auto">Significantly lower fees than traditional high-street agents. Transparent. AI-powered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ctas.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className={`group relative rounded-2xl border p-6 transition-all card-hover ${
                  c.highlight
                    ? "border-primary/50 bg-gradient-to-br from-primary/15 via-card/80 to-card hover:border-primary shadow-[0_20px_60px_-20px_hsl(168,80%,48%,0.45)]"
                    : c.comingSoon
                    ? "border-white/[0.06] bg-card/40 opacity-75"
                    : "border-white/[0.08] bg-card/70 hover:border-primary/40 hover:bg-card/90"
                } backdrop-blur-xl`}
              >
                {c.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.18em] whitespace-nowrap shadow-[0_4px_16px_-4px_hsl(168,80%,48%,0.5)]">
                    Most Popular
                  </span>
                )}
                {c.comingSoon && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase tracking-[0.18em] whitespace-nowrap">
                    Coming Soon
                  </span>
                )}
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-lg font-black tracking-tight">{c.title}</h3>
                  <span className={`text-2xl font-black tabular-nums ${c.comingSoon ? "text-amber-400/80" : "text-primary"}`}>{c.price}</span>
                </div>
                <p className="text-[13px] text-white/55 leading-relaxed mb-5">{c.desc}</p>
                <div className={`inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider ${c.comingSoon ? "text-amber-400/80" : "text-primary"}`}>
                  {c.highlight ? "Start now" : c.comingSoon ? "Join waitlist" : "Learn more"}
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>

          {/* Footer reassurance */}
          <div className="mt-12 text-center">
            <p className="text-[11px] text-white/40 max-w-xl mx-auto">
              <Clock size={11} className="inline -mt-0.5 mr-1 text-primary/60" />
              Average report time: under 30 seconds. No credit card. No commitment.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FreeValuation;