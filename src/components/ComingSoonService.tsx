import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import NegotiateForMeCTA from "@/components/NegotiateForMeCTA";
import { supabase } from "@/integrations/supabase/client";

type Pill = { icon: React.ComponentType<any>; label: string };

/**
 * Shared "Coming Soon" teaser page for services that are temporarily off
 * (Let For Me, Property Management, etc.). Funnels visitors into the two
 * live offers: Free Valuation and Negotiate For Me (£49).
 */
export default function ComingSoonService({
  serviceName,
  headline,
  subheading,
  pills,
  bullets,
  canonical,
  seoTitle,
  seoDescription,
  waitlistInterest,
}: {
  serviceName: string;
  headline: React.ReactNode;
  subheading: string;
  pills: Pill[];
  bullets: string[];
  canonical: string;
  seoTitle: string;
  seoDescription: string;
  waitlistInterest: string;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) return;
    setSubmitting(true);
    try {
      await supabase.from("early_access_requests").insert({
        email: value,
        name: null,
        reason: `Waitlist: ${waitlistInterest}`,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={seoTitle} description={seoDescription} canonical={canonical} />
      <Navbar />

      <section className="pt-44 sm:pt-48 pb-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 mb-5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10">
              <Clock size={12} /> {serviceName} · Coming Soon
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-balance mb-5">
              {headline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-9 text-balance">
              {subheading}
            </p>
            <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
              {pills.map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold">
                  <Icon size={13} className="text-primary" /> {label}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Live offers — Valuation + Negotiate */}
          <AnimatedSection delay={120}>
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur p-5 sm:p-7 mb-10 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4 text-center">Available right now</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  to="/free-valuation"
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background/40 hover:border-primary/50 hover:bg-primary/5 px-4 py-3.5 transition-all btn-press"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/15 ring-1 ring-primary/25 flex items-center justify-center shrink-0">
                    <Sparkles size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Free AI Valuation</p>
                    <p className="text-[11px] text-muted-foreground">Instant property value · 30 seconds</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link
                  to="/negotiate-for-me"
                  className="group flex items-center gap-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3.5 transition-all shadow-[0_10px_30px_-12px_hsl(168,80%,48%,0.55)] btn-press"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
                    <Sparkles size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">Negotiate For Me</p>
                    <p className="text-[11px] opacity-80">Flagship service · £49 flat</p>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Waitlist */}
          <AnimatedSection delay={200}>
            <div className="max-w-xl mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 text-center">
                Be first in line when {serviceName} launches
              </p>
              {submitted ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex items-center justify-center gap-2 text-sm text-foreground">
                  <CheckCircle2 size={16} className="text-primary" />
                  You're on the list — we'll email you the moment it's live.
                </div>
              ) : (
                <form
                  onSubmit={handleWaitlist}
                  className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl border border-border bg-background/70 backdrop-blur-md focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_hsl(168,80%,48%,0.12)] transition-all"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
                    aria-label="Email for waitlist"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 transition-all"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <>Join waitlist <ArrowRight size={14} /></>}
                  </button>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* What's coming */}
      <section className="pb-14 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection delay={250}>
            <div className="rounded-2xl border border-border/40 bg-card/40 p-6 sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">What's coming</p>
              <ul className="space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final flagship CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <NegotiateForMeCTA variant="hero" />
        </div>
      </section>

      <Footer />
    </div>
  );
}