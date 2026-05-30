import { lazy, Suspense, ComponentType } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

function lazyRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch((err) => {
      const k = "chunk-reload-index";
      if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, "1"); window.location.reload(); }
      throw err;
    })
  );
}

const HowItWorks = lazyRetry(() => import("@/components/HowItWorks"));
const TrustBar = lazyRetry(() => import("@/components/TrustBar"));
const TestimonialsSection = lazyRetry(() => import("@/components/Testimonials"));
const RoleShowcase = lazyRetry(() => import("@/components/RoleShowcase"));
const AIAdvantage = lazyRetry(() => import("@/components/AIAdvantage"));
const AboutSection = lazyRetry(() => import("@/components/AboutSection"));
const ContactSection = lazyRetry(() => import("@/components/ContactSection"));
const Footer = lazyRetry(() => import("@/components/Footer"));
const ChatWidget = lazyRetry(() => import("@/components/ChatWidget"));
const HomePricingStrip = lazyRetry(() => import("@/components/HomePricingStrip"));

const SectionFallback = () => (
  <div className="py-20 flex justify-center">
    <div className="w-6 h-6 border-2 border-primary/10 border-t-primary/40 rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="Hummm AI | Free AI Property Valuation + AI Negotiation (First One Free)"
        description="Get an instant, data-driven AI property valuation in seconds. Then let our AI negotiate your best deal — starting with your first negotiation completely free. No card required."
        canonical="/"
        ogImage="https://hummm.pro/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Hummm AI Valuation Tool",
          "url": "https://hummm.pro/free-valuation",
          "description": "Free AI-powered property valuation and deep audit. Get accurate valuations, comparables, yield analysis and renovation insights in seconds.",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
          },
          "provider": {
            "@type": "Organization",
            "name": "Hummm AI",
            "url": "https://hummm.pro"
          }
        }}
      />
      <Navbar />
      <HeroSection />

      <Suspense fallback={<SectionFallback />}>
        <TrustBar />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="cv-auto">
          <HowItWorks />
        </div>
        <div className="cv-auto bg-white/[0.02]">
          <RoleShowcase />
        </div>
        <div className="cv-auto bg-white/[0.03]">
          <AIAdvantage />
        </div>
        <div className="cv-auto">
          <TestimonialsSection />
        </div>
        <div className="cv-auto bg-white/[0.02]">
          <AboutSection />
        </div>

        <div className="cv-auto bg-white/[0.03]">
          <HomePricingStrip />
        </div>

        <section className="py-6 section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] text-muted-foreground/25">
              🔒 We take your privacy seriously. Hummm is fully GDPR compliant.{" "}
              <Link to="/privacy-policy" className="text-primary/30 hover:text-primary/50 hover:underline font-medium transition-colors">Read our Privacy Policy</Link>.
            </p>
          </div>
        </section>

        {/* Teal CTA band */}
        <section
          className="py-20 px-4 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(29,185,140,0.15) 0%, rgba(29,185,140,0.05) 100%)",
            borderTop: "1px solid rgba(29,185,140,0.2)",
            borderBottom: "1px solid rgba(29,185,140,0.2)",
          }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Your First Negotiation Is Free</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Let Hummm AI Negotiate Your Next Deal.</h2>
            <p className="text-white/50 mb-8 text-lg">No card. No commission. No commitment. Hummm fights for every extra pound on your behalf — and you only pay if we save you money.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/negotiate-for-me" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Start Your Free Negotiation
              </Link>
              <Link to="/free-valuation" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-primary/50 bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 transition-all">
                Try Free Valuation First
              </Link>
            </div>
          </div>
        </section>

        <ContactSection />
        <Footer />
        <ChatWidget />
      </Suspense>
    </div>
  );
};

export default Index;
