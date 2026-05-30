import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  Clock,
  Mail,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";

type Pill = { icon: React.ComponentType<any>; label: string };
type Benefit = { icon: React.ComponentType<any>; title: string; body: string };
type Step = { title: string; body: string };

export interface ServiceLaunchPageProps {
  serviceName: string;
  headlineLead: string;        // e.g. "Sell For Me"
  headlineAccent: string;      // e.g. "0.75%"
  subheading: string;
  pills: Pill[];
  benefits: Benefit[];
  steps: Step[];
  canonical: string;
  seoTitle: string;
  seoDescription: string;
  waitlistInterest: string;
}

export default function ServiceLaunchPage({
  serviceName,
  headlineLead,
  headlineAccent,
  subheading,
  pills,
  benefits,
  steps,
  canonical,
  seoTitle,
  seoDescription,
  waitlistInterest,
}: ServiceLaunchPageProps) {
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
    } catch {
      /* swallow — still confirm */
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEOHead title={seoTitle} description={seoDescription} canonical={canonical} />
      <Navbar />

      {/* HERO */}
      <section className="relative pt-44 sm:pt-48 pb-20 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-6 px-3.5 py-1.5 rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_30px_-8px_hsl(168_80%_48%/0.45)]">
              <Clock size={12} /> {serviceName} · Launching Shortly
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-balance mb-6">
              {headlineLead}{" "}
              <span className="text-gradient">{headlineAccent}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
              {subheading}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {pills.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/5 text-xs font-semibold"
                >
                  <Icon size={13} className="text-primary" /> {label}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Teaser strip — First Negotiation Free */}
          <AnimatedSection delay={120}>
            <div className="relative max-w-2xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-card/30 backdrop-blur p-5 sm:p-6 mb-8 shadow-[0_20px_60px_-25px_hsl(168_80%_48%/0.55)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-foreground">
                      First Negotiation is <span className="text-primary">Free</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Full Service Launching Soon — start saving today.
                    </p>
                  </div>
                </div>
                <Link
                  to="/negotiate-for-me"
                  className="btn-press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm whitespace-nowrap shadow-[0_10px_30px_-12px_hsl(168_80%_48%/0.6)] hover:shadow-[0_18px_40px_-12px_hsl(168_80%_48%/0.85)] transition-shadow"
                >
                  Start Free Negotiation <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Waitlist form */}
          <AnimatedSection delay={200}>
            <div className="max-w-xl mx-auto">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-3">
                <Mail size={11} /> Join the early access list
              </p>
              {submitted ? (
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 flex items-center justify-center gap-2 text-sm text-foreground">
                  <CheckCircle2 size={16} className="text-primary" />
                  You're on the list — we'll email you the moment {serviceName} goes live.
                </div>
              ) : (
                <form
                  onSubmit={handleWaitlist}
                  className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl border border-border bg-background/70 backdrop-blur-md focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_hsl(168_80%_48%/0.12)] transition-all"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none rounded-xl"
                    aria-label="Email for waitlist"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 transition-all whitespace-nowrap"
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        Join Waitlist <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground/60">
                Early access · launch pricing locked in · no spam.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-3">
                Why {serviceName}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
                Premium service. AI economics.
              </h2>
            </div>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: Icon, title, body }, i) => (
              <AnimatedSection key={title} delay={i * 80}>
                <div className="group relative h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 transition-[box-shadow,border-color] hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_hsl(168_80%_48%/0.35)]">
                  <div className="w-11 h-11 rounded-xl bg-primary/12 ring-1 ring-primary/25 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-3">
                How it works
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
                Four steps. Fully managed.
              </h2>
            </div>
          </AnimatedSection>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 70}>
                <li className="flex gap-5 rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-5 sm:p-6 hover:border-primary/30 transition-colors">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/12 ring-1 ring-primary/30 flex items-center justify-center text-primary font-black tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </li>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/70 to-card/40 backdrop-blur p-8 sm:p-12 text-center shadow-[0_30px_80px_-30px_hsl(168_80%_48%/0.5)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.22em] mb-5">
                <Zap size={12} /> Live today
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance mb-3">
                Don't wait — your <span className="text-gradient">first negotiation is free</span>.
              </h3>
              <p className="text-base text-muted-foreground max-w-xl mx-auto mb-7">
                Let Hummm AI fight for a better deal on your next move. {serviceName} unlocks the moment it's ready.
              </p>
              <Link
                to="/negotiate-for-me"
                className="btn-press inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-[0_15px_40px_-15px_hsl(168_80%_48%/0.7)] hover:shadow-[0_25px_55px_-15px_hsl(168_80%_48%/0.9)] transition-shadow"
              >
                Start Your Free Negotiation <ArrowRight size={15} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}