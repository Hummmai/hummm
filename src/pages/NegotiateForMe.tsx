import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import {
  ArrowRight, Sparkles, ShieldCheck, Zap, MessageSquare, FileText,
  Target, TrendingDown, Clock, Award, ChevronDown, ChevronUp,
  Mail, BarChart3, Lock, CheckCircle2, Star, Users, PoundSterling,
} from "lucide-react";

/* ─── Hero Background ─── */
const HeroBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(222 47% 16%) 0%, hsl(222 50% 9%) 55%, hsl(222 55% 6%) 100%)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "30%", left: "35%",
          width: "70vw", height: "70vw", maxWidth: 1100, maxHeight: 1100,
          background: "radial-gradient(circle, hsl(168 75% 42% / 0.35) 0%, transparent 60%)",
          filter: "blur(80px)",
          transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "65%", left: "65%",
          width: "55vw", height: "55vw", maxWidth: 800, maxHeight: 800,
          background: "radial-gradient(circle, hsl(190 85% 50% / 0.2) 0%, transparent 60%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(222 50% 6% / 0.55) 100%)" }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

/* ─── FAQ Item ─── */
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm sm:text-base font-bold text-foreground pr-4">{question}</span>
        {open ? (
          <ChevronUp size={18} className="text-primary shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

/* ─── Testimonials Data ─── */
const testimonials = [
  {
    quote: "The AI drafted an opening offer £18k below asking. The agent accepted after one counter. I saved £12,000 and weeks of stress.",
    name: "James R.",
    role: "Buyer, Manchester",
    stars: 5,
  },
  {
    quote: "I was dreading negotiating my rent renewal. Hummm handled everything — polite, professional, and got me a 7% reduction.",
    name: "Priya K.",
    role: "Renter, London",
    stars: 5,
  },
  {
    quote: "As a seller, I had three low offers. The AI helped me craft a response that highlighted my property's strengths. Sold at 98% of asking.",
    name: "Sarah T.",
    role: "Seller, Bristol",
    stars: 5,
  },
  {
    quote: "I tried it free and was blown away. The negotiation strategy alone was worth 10x what they charge. Absolutely brilliant service.",
    name: "Marcus L.",
    role: "Buyer, Birmingham",
    stars: 5,
  },
];

/* ─── FAQ Data ─── */
const faqs = [
  {
    question: "What's included in my free negotiation?",
    answer: "You get a full AI-powered negotiation service: market analysis, a tailored strategy, professionally drafted emails (opening offer, counter-offers, replies), and ongoing guidance until your deal is done. All handled by our Negotiation Agent.",
  },
  {
    question: "Is this a subscription or one-time fee?",
    answer: "Your first negotiation is completely free (50 credits). After that, Starter is £9/mo for 300 credits (~6 negotiations), Pro is £29/mo for unlimited negotiations, and Investor is £79/mo with portfolio tools. No commission, ever. Cancel anytime.",
  },
  {
    question: "How much can I realistically save?",
    answer: "Our users typically save 6–9% off the asking price on purchases, or secure rent reductions of 5–10%. On a £400,000 property, that's £24,000–£36,000 saved — and your first negotiation is free.",
  },
  {
    question: "Does the AI actually send emails to agents?",
    answer: "Yes — if you provide the agent's email, we can send on your behalf. Or you can copy our drafts and send them yourself. You're always in control.",
  },
  {
    question: "What if I'm not happy with the service?",
    answer: "We offer a full satisfaction guarantee. If our negotiation strategy and drafts don't provide clear value, contact us within 14 days for a full refund. No questions asked.",
  },
  {
    question: "Can I use this for rentals too?",
    answer: "Absolutely. Our Negotiation Agent works for buyers, sellers, renters, and landlords. Whether you're negotiating a purchase price, rent reduction, or tenancy terms — we've got you covered.",
  },
];

/* ─── Features ─── */
const features = [
  {
    icon: BarChart3,
    title: "Market Analysis",
    desc: "AI scans comparable sales, local trends, and listing history to find your leverage.",
  },
  {
    icon: Target,
    title: "Smart Strategy",
    desc: "A step-by-step negotiation plan tailored to your position and the property.",
  },
  {
    icon: MessageSquare,
    title: "Drafted Emails",
    desc: "Professional opening offers, counters, and replies — written by AI, approved by you.",
  },
  {
    icon: Clock,
    title: "Ongoing Support",
    desc: "Guidance through every round of negotiation until the deal is sealed.",
  },
  {
    icon: ShieldCheck,
    title: "You Stay in Control",
    desc: "Every email is reviewed by you before sending. No surprises, full transparency.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    desc: "Strategy and first draft delivered within minutes, not days.",
  },
];

/* ─── How It Works ─── */
const steps = [
  {
    num: "01",
    title: "Paste Your Property Link",
    desc: "Drop any Rightmove, Zoopla, or listing URL. Our AI extracts key details instantly.",
  },
  {
    num: "02",
    title: "Tell Us Your Goal",
    desc: "Whether you want a lower price, better terms, or a faster close — we tailor everything to you.",
  },
  {
    num: "03",
    title: "Get Your Strategy",
    desc: "Receive a clear, actionable negotiation plan with market-backed talking points.",
  },
  {
    num: "04",
    title: "Send & Save",
    desc: "Review AI-drafted emails, hit send, and watch the savings roll in.",
  },
];

/* ─── Main Page ─── */
const NegotiateForMe = () => {
  const [heroReady, setHeroReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [propertyInput, setPropertyInput] = useState("");

  const handleStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = propertyInput.trim();
    if (trimmed) {
      navigate(`/negotiate-for-me-ai?url=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/negotiate-for-me-ai");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="AI Property Negotiation — First One Completely Free | Hummm AI"
        description="Let our AI negotiate your property deal. Paste any listing and get a full strategy + email drafts. Your first negotiation is 100% free — no card, no commission, no commitment."
        canonical="/negotiate-for-me"
        ogImage="https://hummm.pro/og-image.png"
      />
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center overflow-hidden pt-44 sm:pt-48 lg:pt-52 pb-16">
        <HeroBackground />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div
                className="transition-[opacity,transform] ease-out"
                style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transitionDuration: "1s", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                    <span className="relative w-2 h-2 rounded-full bg-primary" />
                  </span>
                  Your First Negotiation Is On Us
                </div>
              </div>

              {/* Headline */}
              <div
                className="transition-[opacity,transform] ease-out"
                style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(24px)", transitionDuration: "1.2s", transitionDelay: "150ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] tracking-tight leading-[1.15] mb-6 text-balance max-w-[22ch]" style={{ fontFamily: '"Cormorant Garamond","Playfair Display",Georgia,serif', fontWeight: 500, letterSpacing: "-0.01em" }}>
                  Hummm Negotiator —{" "}
                  <span className="relative inline-block text-primary drop-shadow-[0_0_30px_hsl(168_80%_48%/0.55)]">
                    Your first deal, free
                    <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  </span>
                </h1>
              </div>

              {/* Subhead */}
              <div
                className="transition-[opacity,transform] ease-out"
                style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transitionDuration: "1.1s", transitionDelay: "300ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <p className="text-lg sm:text-xl text-white/60 max-w-lg mb-6 leading-relaxed">
                  Paste any property link. Our AI handles the strategy, drafts the emails, and fights for every extra pound on your behalf. <span className="text-foreground font-semibold">No card. No commission.</span>
                </p>
              </div>

              {/* Paste-link input + CTA */}
              <div
                className="transition-[opacity,transform] ease-out"
                style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(18px)", transitionDuration: "1s", transitionDelay: "450ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <form
                  onSubmit={handleStart}
                  className="rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-xl p-2.5 shadow-[0_15px_50px_-15px_hsl(168,80%,48%,0.35)] flex flex-col sm:flex-row gap-2.5"
                >
                  <input
                    type="text"
                    inputMode="url"
                    value={propertyInput}
                    onChange={(e) => setPropertyInput(e.target.value)}
                    placeholder="Paste any Rightmove, Zoopla or property link…"
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    aria-label="Paste property link"
                  />
                  <button
                    type="submit"
                    className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-black bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all rounded-xl shrink-0"
                  >
                    <Zap size={18} />
                    Start Free
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
                <p className="mt-3 text-xs text-muted-foreground text-center sm:text-left">
                  No link? <button onClick={() => handleStart()} className="text-primary font-semibold hover:underline">Start without one →</button>
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck size={11} className="text-primary" /> 14-day money-back guarantee</span>
                  <span className="inline-flex items-center gap-1.5"><Sparkles size={11} className="text-primary" /> Avg 6–9% saved</span>
                  <span className="inline-flex items-center gap-1.5"><Users size={11} className="text-primary" /> 2,400+ deals supported</span>
                </div>
              </div>
            </div>

            {/* Right — Visual */}
            <div
              className="hidden lg:block transition-[opacity,transform] ease-out"
              style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(40px)", transitionDuration: "1.4s", transitionDelay: "600ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-8 bg-primary/10 rounded-[2.5rem] blur-3xl pointer-events-none" />
                {/* Card */}
                <div className="relative rounded-[2rem] border border-primary/20 bg-card/80 backdrop-blur-xl p-8 space-y-5 shadow-[0_0_60px_-15px_hsl(168_80%_48%/0.2)]">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-5 border-b border-border/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <MessageSquare size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Negotiation Agent</p>
                      <p className="text-[10px] text-muted-foreground">Drafting in progress…</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">AI</span>
                  </div>

                  {/* Email preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">To:</span> estate.agent@example.com
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Subject:</span> Offer on 42 Oak Lane — £485,000
                    </div>
                    <div className="rounded-xl bg-background/60 border border-border/30 p-4 text-xs text-white/70 leading-relaxed space-y-2">
                      <p>Dear Ms. Henderson,</p>
                      <p>Thank you for showing me the property at 42 Oak Lane. After thorough market analysis and comparable sales review, I would like to submit an offer of <span className="text-primary font-semibold">£485,000</span>…</p>
                      <p className="text-muted-foreground/50">…strategy continues with market data, chain-free status, and flexible completion timeline.</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <span className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold text-center">Approve & Send</span>
                    <span className="flex-1 py-2.5 rounded-xl border border-border/40 text-xs font-semibold text-center text-muted-foreground">Edit Draft</span>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-xl border border-primary/20 shadow-lg">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Potential Savings</p>
                  <p className="text-xl font-black text-primary">£15,000+</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} className="text-primary/40" />
        </div>
      </section>

      {/* ═══════════ TRUST BAR ═══════════ */}
      <section className="w-full bg-white/[0.02] border-y border-white/[0.06] py-5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <p className="text-white/25 text-xs uppercase tracking-widest font-medium whitespace-nowrap shrink-0">
            Trusted by data from
          </p>
          <div className="flex flex-wrap gap-3">
            {["Land Registry", "Rightmove", "Zoopla", "ONS", "RICS"].map((s) => (
              <span
                key={s}
                className="border border-white/[0.08] rounded-full px-4 py-1.5 text-xs font-semibold text-white/40 hover:text-white/60 hover:border-white/20 transition-all cursor-default"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT YOU GET ═══════════ */}
      <section className="py-24 sm:py-32 section-padding">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <Sparkles size={11} /> What's Included
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              Your AI negotiator{" "}
              <span className="text-primary">does it all</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Analyse your property. Build a smart strategy. Draft professional emails. Handle the back-and-forth. All for one flat fee.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <AnimatedSection key={f.title} delay={i * 100} className="group">
                  <div className="h-full rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6 hover:bg-card/60 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_hsl(168_80%_48%/0.15)]">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h3 className="text-base font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24 sm:py-32 section-padding bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <Target size={11} /> Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              Four steps to a <span className="text-primary">better deal</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              No forms, no phone calls, no waiting. Start in under 60 seconds.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <AnimatedSection key={s.num} delay={i * 120}>
                <div className="relative text-center p-6">
                  <div className="text-5xl font-black text-primary/10 mb-4 tabular-nums">{s.num}</div>
                  <h3 className="text-base font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 right-0 w-full h-px bg-gradient-to-r from-primary/20 to-transparent translate-x-1/2" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMPARISON ═══════════ */}
      <section className="py-24 sm:py-32 section-padding">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <TrendingDown size={11} /> The Comparison
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              20–30% cheaper than traditional agents, with{" "}
              <span className="text-primary">superior AI</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Traditional agents charge thousands. Your first negotiation with us is free — after that, just £9/mo on Starter or £29/mo Pro for unlimited deals.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="rounded-3xl border border-border/30 overflow-hidden bg-card/40 backdrop-blur-sm">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 p-6 sm:p-8 border-b border-border/30 bg-white/[0.02]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service</div>
                <div className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Traditional Agent</div>
                <div className="text-center text-[10px] font-bold uppercase tracking-widest text-primary">Hummm AI</div>
              </div>

              {/* Rows */}
              {[
                { label: "Fee on £400k property", trad: "£4,000–£8,000", humm: "Free → £29/mo Pro", highlight: true },
                { label: "Fee on £750k property", trad: "£7,500–£15,000", humm: "Free → £29/mo Pro", highlight: true },
                { label: "Contract length", trad: "12–24 weeks", humm: "No contract" },
                { label: "Commission", trad: "1.0–2.0%", humm: "£0" },
                { label: "Strategy & advice", trad: "Limited / generic", humm: "AI-powered, bespoke" },
                { label: "Email drafting", trad: "You do it yourself", humm: "Done by AI, approved by you" },
                { label: "Market analysis", trad: "Extra cost / DIY", humm: "Included instantly" },
                { label: "Hidden fees", trad: "Often present", humm: "None — ever" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 gap-4 p-5 sm:p-6 items-center ${i % 2 === 0 ? "bg-white/[0.015]" : ""}`}
                >
                  <div className="text-sm font-semibold text-foreground">{row.label}</div>
                  <div className="text-center text-sm text-muted-foreground">{row.trad}</div>
                  <div className={`text-center text-sm font-bold ${row.highlight ? "text-primary" : "text-foreground"}`}>
                    {row.humm}
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="p-6 sm:p-8 border-t border-border/30 bg-primary/5 text-center">
                <p className="text-sm text-foreground font-semibold">
                  On a £400,000 property, Hummm AI saves you{" "}
                  <span className="text-primary font-black">£3,911–£7,911</span> in fees alone —
                  before any negotiation savings.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SAVINGS HIGHLIGHT ═══════════ */}
      <section className="py-20 sm:py-24 section-padding bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-y border-primary/10">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <PoundSterling size={11} /> Real Savings
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6 text-balance">
              Average users save{" "}
              <span className="text-primary">£15,000+</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 text-balance">
              Our AI analyses thousands of comparable transactions to find leverage you didn't know you had. Then it crafts the perfect approach.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                { value: "6–9%", label: "Average price reduction achieved" },
                { value: "Free", label: "Your first negotiation, on us" },
                { value: "24hrs", label: "From start to first email sent" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6">
                  <p className="text-3xl sm:text-4xl font-black text-primary mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 sm:py-32 section-padding">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <Star size={11} /> Social Proof
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              Real people, <span className="text-primary">real savings</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 100}>
                <div
                  className="rounded-2xl p-6 flex flex-col h-full"
                  style={{
                    background: "#111c30",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: "2px solid hsl(168, 80%, 48%)",
                  }}
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed italic flex-1 mb-5">
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST SIGNALS ═══════════ */}
      <section className="py-20 sm:py-24 section-padding bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-balance">
              Why buyers & sellers <span className="text-primary">trust Hummm</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { icon: ShieldCheck, label: "GDPR Compliant" },
                { icon: Lock, label: "Data Encrypted" },
                { icon: Award, label: "14-Day Guarantee" },
                { icon: Users, label: "2,400+ Users" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/20 bg-card/30 text-center">
                    <Icon size={22} className="text-primary" />
                    <p className="text-xs font-bold text-foreground">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-24 sm:py-32 section-padding">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              <MessageSquare size={11} /> Questions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
              Still have <span className="text-primary">questions?</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6 sm:p-8">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24 sm:py-32 section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Zap size={11} /> Special Launch Price
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-5 text-balance">
              Who wants Hummm to negotiate <span className="text-primary">their next property?</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-balance leading-relaxed">
              Most people leave money on the table. Your first negotiation with us is completely free — we fight for every extra pound on your behalf. No commission. No long contracts. Full control.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/negotiate-for-me-ai"
                className="group inline-flex items-center justify-center gap-3 px-10 py-6 text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl shadow-[0_20px_60px_-15px_hsl(168,80%,48%,0.5)]"
              >
                <Zap size={22} />
                Start Your Free Negotiation
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/free-valuation"
                className="inline-flex items-center justify-center gap-2 px-10 py-6 text-lg font-bold rounded-2xl border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-all"
              >
                Free Valuation First
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={11} className="text-primary" /> 14-day money-back guarantee</span>
              <span className="inline-flex items-center gap-1.5"><Lock size={11} className="text-primary" /> Secure payment</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles size={11} className="text-primary" /> No subscription required</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NegotiateForMe;
