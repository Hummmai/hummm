import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePricingStrip from "@/components/HomePricingStrip";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import {
  Search, Megaphone, UserCheck, Wallet, CalendarCheck,
  ArrowRight, ShieldCheck, Camera, Bot, Clock, Sparkles,
  Building2, ExternalLink,
} from "lucide-react";

const steps = [
  { num: 1, icon: Search, title: "Get Instant AI Valuation & Rental Estimate", desc: "Know exactly what your property is worth in seconds." },
  { num: 2, icon: Megaphone, title: "List with AI-Optimised Marketing", desc: "Professional photos, compelling descriptions, maximum reach." },
  { num: 3, icon: UserCheck, title: "AI Screens Tenants & Handles Compliance", desc: "Credit checks, references, and legal compliance — automated." },
  { num: 4, icon: Wallet, title: "Automated Rent Collection & Reporting", desc: "On-time payments and clear financial reports, every month." },
  { num: 5, icon: CalendarCheck, title: "AI Manages Enquiries & Viewings", desc: "AI handles tenant comms, bookings, and follow-ups for you." },
];

const benefits = [
  { icon: ShieldCheck, text: "Full Renters' Rights Act compliance built-in" },
  { icon: UserCheck, text: "AI tenant screening and referencing" },
  { icon: Clock, text: "Automated rent reminders and collection" },
  { icon: Camera, text: "Professional photography & marketing included" },
  { icon: Bot, text: "24/7 AI support for landlords" },
];

const Let = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="AI-Powered Lettings & Property Management | Hummmingbird AI Global"
        description="Let your property with Hummm Global. AI-powered lettings with full compliance, automated tenant screening and rent collection."
        canonical="/let-your-property"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Property Lettings & Management",
          "provider": { "@type": "RealEstateAgent", "name": "Hummmingbird AI Global Pte. Ltd." },
          "description": "Smart AI lettings with automated compliance, tenant screening, and rent collection.",
          "areaServed": ["United Kingdom", "United States", "Singapore"],
        }}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-36 sm:pt-44 pb-20 md:pb-28 section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 text-balance">
              Let Profitably.{" "}
              <span className="text-gradient">Manage Effortlessly.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
              AI-powered lettings with full compliance, automated rent collection, and zero hassle.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ai-valuation"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group min-h-[56px]"
              >
                <Sparkles size={18} />
                Start Your AI Letting
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://sentinel-pm.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-5 text-base font-bold border-2 border-primary/40 text-primary hover:bg-primary/10 transition-all rounded-full min-h-[56px]"
              >
                <Building2 size={18} />
                Full Professional Management
                <ExternalLink size={14} />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 5-Step Process ── */}
      <section className="py-20 section-padding">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-balance">
                How It Works
              </h2>
              <p className="text-muted-foreground">Five simple steps. AI does the heavy lifting.</p>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <AnimatedSection key={s.num} delay={i * 80}>
                <div className="flex items-start gap-5 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 tabular-nums shadow-md shadow-primary/20">
                    {s.num}
                  </span>
                  <div>
                    <h3 className="text-base font-bold mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Benefits ── */}
      <section className="py-20 section-padding">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-balance">
                Why Landlords Choose Us
              </h2>
            </div>
          </AnimatedSection>

          <div className="space-y-3">
            {benefits.map((b, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon size={20} className="text-primary" />
                  </div>
                  <p className="text-sm font-semibold">{b.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sentinel PM Partner ── */}
      <section className="py-20 section-padding">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-10 md:p-14 text-center">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Building2 size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-balance">
                  Full Professional Property Management
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                  Need completely hands-off management? Our dedicated partner handles everything — tenants, maintenance, compliance.
                </p>
                <a
                  href="https://sentinel-pm.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group min-h-[56px]"
                >
                  <Building2 size={18} />
                  Full Professional Property Management
                  <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <p className="text-sm text-muted-foreground mt-5">
                  Managed by <span className="font-semibold text-foreground/70">Sentinel PM</span> — Our dedicated property management partner
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 section-padding">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-balance">
              Ready to let your property the smart way?
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Get your free AI rental valuation and start letting with zero hassle.
            </p>
            <Link
              to="/ai-valuation"
              className="inline-flex items-center justify-center gap-3 px-12 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group min-h-[56px]"
            >
              <Sparkles size={18} />
              Start Your AI Letting Journey
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <HomePricingStrip />

      <Footer />
    </div>
  );
};

export default Let;
