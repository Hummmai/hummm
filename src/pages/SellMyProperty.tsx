import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import HomePricingStrip from "@/components/HomePricingStrip";
import RecentAuditBanner from "@/components/RecentAuditBanner";
import NegotiateForMeCTA from "@/components/NegotiateForMeCTA";
import { Shield, Brain, Megaphone, ArrowRight, Zap, Target, Users, Loader2, Clock } from "lucide-react";

export default function SellMyProperty() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="AI-Powered Property Selling Service | Sell My Property | Hummm AI"
        description="Hummm AI sells your property for you. Professional valuation, high-converting listings, full negotiation and buyer management — with full human oversight. Launching soon."
        canonical="/sell-my-property"
      />
      <Navbar />
      <section className="pt-44 sm:pt-48 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10">
              <Clock size={12} /> Sell For Me · Coming Soon
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-balance mb-5">
              Sell For Me — <span className="text-gradient">launching shortly.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              We're putting the finishing touches on full AI-managed selling. In the meantime, our most powerful service is live today.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
              <Pill icon={Brain} label="AI Pricing & Strategy" />
              <Pill icon={Megaphone} label="Multi-portal Launch" />
              <Pill icon={Shield} label="You approve every step" />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <NegotiateForMeCTA variant="hero" className="text-left sm:text-center" />
          </AnimatedSection>
        </div>
      </section>
      <section className="pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Want early access when Sell For Me launches?</p>
        </div>
        <ValuationHook />
        <RecentAuditBanner intent="sale" />
      </section>
      <HomePricingStrip />
      <Footer />
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold">
      <Icon size={13} className="text-primary" /> {label}
    </div>
  );
}

function ValuationHook() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (v.length < 3) return;
    setSubmitting(true);
    const isLink = /^https?:\/\//i.test(v);
    try {
      if (isLink) {
        sessionStorage.setItem("humm_audit_prefill_url", v);
        navigate("/property-audit?url=" + encodeURIComponent(v));
        return;
      }
      const draft = {
        form: {
          name: "", email: "", phone: "", address: v,
          propertyType: "", bedrooms: "", bathrooms: "", sqft: "",
          tenure: "", parking: "", garden: "", garage: "",
          improvements: "", specialFeatures: [], goal: "sell",
        },
        step: 1,
        addressSelected: true,
      };
      sessionStorage.setItem("humm_valuation_session", JSON.stringify(draft));
      navigate("/ai-valuation");
    } catch {
      navigate("/free-valuation");
    }
  };

  return (
    <section className="px-6 pb-16 sm:pb-20">
      <AnimatedSection>
        <div className="relative max-w-4xl mx-auto">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -inset-6 sm:-inset-10 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-3xl opacity-60" />
          </div>

          <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-[0_20px_70px_-20px_rgba(0,230,200,0.25)] overflow-hidden">
            {/* Top hairline accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="px-6 sm:px-12 py-10 sm:py-14 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                <Zap size={12} className="animate-pulse" /> Free · No Sign-up
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-balance mb-4">
                Get Your Free AI Valuation
                <br className="hidden sm:block" />
                <span className="text-gradient"> in 30 Seconds</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 text-balance">
                See exactly what your property is worth today — powered by Hummm AI's Savant engine.
              </p>

              <form
                onSubmit={handleSubmit}
                className="relative max-w-2xl mx-auto group"
              >
                <div className="flex flex-col sm:flex-row items-stretch gap-3 p-2 sm:p-2 rounded-2xl border border-border bg-background/70 backdrop-blur-md focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_rgba(0,230,200,0.12)] transition-all">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter your postcode or property link"
                    className="flex-1 bg-transparent px-4 py-3 sm:py-3.5 text-base sm:text-[15px] placeholder:text-muted-foreground/70 focus:outline-none rounded-xl"
                    aria-label="Postcode or property link"
                  />
                  <button
                    type="submit"
                    disabled={submitting || value.trim().length < 3}
                    className="btn-press inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-[15px] shadow-[0_10px_30px_-10px_rgba(0,230,200,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(0,230,200,0.8)] disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Working…
                      </>
                    ) : (
                      <>
                        Get Valuation <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} className="text-primary" />
                  Used by <strong className="text-foreground font-semibold">47,000+</strong> property owners
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Target size={13} className="text-primary" />
                  Accurate to within <strong className="text-foreground font-semibold">2.1%</strong>
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap size={13} className="text-primary" />
                  Instant results
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}