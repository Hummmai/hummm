import { useState, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { Link } from "react-router-dom";

import { Target, Sparkles, ArrowRight, Loader2, Link2, CheckCircle2, BarChart3, Camera, MapPin, PlayCircle } from "lucide-react";
import MockAuditCard from "@/components/hero/MockAuditCard";
import { toast as sonnerToast } from "sonner";

const PropertyAuditFlow = lazy(() => import("@/components/PropertyAuditFlow"));

const DEMO_STEPS = [
  { text: "Scanning listing…", icon: Link2 },
  { text: "Extracting property data…", icon: Camera },
  { text: "Running AI valuation model…", icon: BarChart3 },
  { text: "Analysing local market…", icon: MapPin },
  { text: "Generating full report…", icon: Sparkles },
];

const HeroSection = () => {
  const [urlValue, setUrlValue] = useState("");
  const [auditStarted, setAuditStarted] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [pasteFlash, setPasteFlash] = useState(false);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { setScrollY(window.scrollY); ticking = false; });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!demoActive) return;
    if (demoStep >= DEMO_STEPS.length) {
      const t = setTimeout(() => { setDemoActive(false); setDemoStep(0); }, 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDemoStep((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [demoActive, demoStep]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    if (text && text.includes("http")) {
      setPasteFlash(true);
      setTimeout(() => setPasteFlash(false), 1200);
    }
  }, []);

  const isValidUrl = (val: string) => {
    const v = val.trim();
    if (!v) return false;
    try {
      const u = new URL(v.startsWith("http") ? v : `https://${v}`);
      return !!u.hostname && u.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const handleAudit = () => {
    if (!isValidUrl(urlValue)) {
      sonnerToast.error("Paste a property listing URL", {
        description: "e.g. a Rightmove, Zoopla or OnTheMarket link.",
      });
      document.getElementById("hero-audit-bar")?.focus();
      return;
    }
    setAuditStarted(true);
  };
  const triggerDemo = () => {
    setUrlValue("https://rightmove.co.uk/properties/12345678");
    setDemoActive(true);
    setDemoStep(0);
    setPasteFlash(true);
    setTimeout(() => setPasteFlash(false), 1200);
  };

  if (auditStarted) {
    return (
      <section className="relative min-h-[90svh] flex items-start overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 pt-44 sm:pt-48 pb-16">
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>}>
            <PropertyAuditFlow initialUrl={urlValue} />
          </Suspense>
        </div>
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base radial */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(222 47% 16%) 0%, hsl(222 50% 9%) 55%, hsl(222 55% 6%) 100%)",
          }}
        />
        {/* Aurora orb 1 — teal */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "30%", left: "30%",
            width: "70vw", height: "70vw", maxWidth: 1100, maxHeight: 1100,
            background: "radial-gradient(circle, hsl(168 75% 42% / 0.32) 0%, transparent 60%)",
            filter: "blur(80px)",
            animation: "hero-aurora-1 22s ease-in-out infinite",
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)`,
          }}
        />
        {/* Aurora orb 2 — cyan */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "60%", left: "70%",
            width: "60vw", height: "60vw", maxWidth: 900, maxHeight: 900,
            background: "radial-gradient(circle, hsl(190 85% 50% / 0.22) 0%, transparent 60%)",
            filter: "blur(90px)",
            animation: "hero-aurora-2 28s ease-in-out infinite",
          }}
        />
        {/* Vignette + bottom fade */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(222 50% 6% / 0.55) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 will-change-transform"
        style={{
          paddingTop: "max(9rem, calc(env(safe-area-inset-top) + 8rem))",
          paddingBottom: "max(4rem, calc(env(safe-area-inset-bottom) + 3rem))",
          opacity: Math.max(1 - scrollY / 1200, 0),
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,0.95fr] gap-12 lg:gap-20 items-center">
          {/* ====== LEFT COLUMN ====== */}
          <div className="max-w-2xl">
            {/* Pill badge */}
            <div
              className="transition-[opacity,transform] ease-out"
              style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transitionDuration: "1s", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/[0.08] backdrop-blur-md mb-7"
                style={{ animation: "badge-pulse 3s ease-in-out infinite" }}
              >
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-primary" />
                </span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">Now covering 14 markets</span>
              </span>
            </div>

            {/* H1 */}
              <div
                className="transition-[opacity,transform] ease-out"
                style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(24px)", transitionDuration: "1.2s", transitionDelay: "150ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.15] mb-5 sm:mb-6 text-balance max-w-[22ch]" style={{ fontFamily: '"Cormorant Garamond","Playfair Display",Georgia,serif', fontWeight: 500, letterSpacing: "-0.01em" }}>
                  <span className="headline-shimmer block">Free AI Valuation.</span>
                  <span className="block">
                    <span className="relative inline-block text-primary drop-shadow-[0_0_30px_hsl(168_80%_48%/0.55)]" style={{ fontStyle: "italic" }}>
                      AI That Wins Deals
                      <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    </span>
                  </span>
                </h1>
              </div>

              {/* Subheading */}
              <div
                className="transition-[opacity,transform] ease-out"
                style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transitionDuration: "1.1s", transitionDelay: "300ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <p className="text-base sm:text-lg lg:text-xl text-white/65 max-w-xl mb-6 leading-relaxed">
                  Get a precise AI valuation in seconds powered by Land Registry and Rightmove data. Then let our AI negotiate your best price — starting with your first negotiation completely free.
                </p>
                <ul className="space-y-1.5 mb-6 text-sm text-white/55">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary/70 shrink-0" /> Free AI Valuation + First Negotiation on us</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary/70 shrink-0" /> 2–9% better outcomes on average vs traditional agents</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary/70 shrink-0" /> TPO regulated • AML compliant • Human oversight on every deal</li>
                </ul>
                <div className="flex flex-wrap gap-3 mb-2">
                  <Link to="/free-valuation" className="btn-press inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-[0.14em] bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_30px_-8px_hsl(168_80%_48%/0.5)]">
                    Get Your Free AI Valuation
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/negotiate-for-me" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold uppercase tracking-[0.14em] border border-primary/40 text-white/90 hover:bg-primary/10 transition-all">
                    Start Free Negotiation
                  </Link>
                </div>
              </div>

            {/* URL Input */}
            <div
              className="transition-[opacity,transform] ease-out"
              style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(18px)", transitionDuration: "1s", transitionDelay: "420ms", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <p className="text-[11px] text-primary/70 uppercase tracking-[0.22em] font-semibold">
                    Drop a property link
                  </p>
                  <span />
                </div>

                <div className="relative group">
                  <div className={`absolute -inset-1 rounded-2xl transition-all duration-700 ${pasteFlash ? "opacity-100 shadow-[0_0_60px_-8px_hsl(168_80%_48%/0.45)]" : inputFocused ? "opacity-80 shadow-[0_0_50px_-8px_hsl(168_80%_48%/0.25)]" : "opacity-50 shadow-[0_0_40px_-12px_hsl(168_80%_48%/0.15)]"}`} />

                  <div className={`relative flex flex-col sm:flex-row gap-2 sm:gap-0 bg-card/85 backdrop-blur-xl border rounded-2xl p-2 sm:p-2.5 transition-[border-color,box-shadow] duration-500 ${inputFocused ? "border-primary/30 shadow-[0_0_80px_-20px_hsl(168_80%_48%/0.2)]" : pasteFlash ? "border-primary/40" : "border-border/50"}`}>
                    <div className="relative flex-1 flex items-center">
                      <Link2 size={17} className={`absolute left-4 transition-colors duration-500 ${pasteFlash ? "text-primary" : inputFocused ? "text-primary/60" : "text-muted-foreground/40"}`} />
                      <input
                        id="hero-audit-bar"
                        type="url"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        onPaste={handlePaste}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        placeholder="Paste any property listing URL…"
                        className="w-full pl-11 pr-4 py-4 sm:py-5 rounded-xl text-base font-medium outline-none bg-transparent text-foreground placeholder:text-muted-foreground/40 transition-colors"
                        onKeyDown={(e) => { if (e.key === "Enter") handleAudit(); }}
                      />
                    </div>
                    <button
                      onClick={handleAudit}
                      className="group/btn btn-press btn-glow inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 sm:py-5 rounded-xl text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-[transform,background-color] duration-300 whitespace-nowrap hover:-translate-y-0.5"
                    >
                      <Target size={16} />
                      Audit Now
                      <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                    </button>
                  </div>
                </div>

                {/* Demo animation */}
                {demoActive && (
                  <div className="mt-4 p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 animate-fade-up overflow-hidden">
                    <div className="flex flex-col gap-2.5">
                      {DEMO_STEPS.map((step, i) => {
                        const StepIcon = step.icon;
                        return (
                          <div
                            key={step.text}
                            className="flex items-center gap-3 text-sm transition-[opacity,transform]"
                            style={{ opacity: i <= demoStep ? 1 : 0.12, transform: i <= demoStep ? "translateX(0)" : "translateX(10px)", transitionDuration: "0.5s", transitionDelay: `${i * 30}ms` }}
                          >
                            {i < demoStep ? (
                              <CheckCircle2 size={15} className="text-primary shrink-0" />
                            ) : i === demoStep ? (
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <div className="flex gap-[3px]">
                                  {[0, 1, 2].map((d) => (
                                    <div key={d} className="w-[3px] h-[3px] rounded-full bg-primary" style={{ animation: `typing-dot 1.2s ease-in-out ${d * 200}ms infinite` }} />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <StepIcon size={15} className="text-muted-foreground/15 shrink-0" />
                            )}
                            <span className={`${i < demoStep ? "text-foreground/70" : i === demoStep ? "text-primary font-medium" : "text-muted-foreground/20"} transition-colors duration-300`}>
                              {step.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {demoStep >= DEMO_STEPS.length && (
                      <div className="mt-3 pt-2.5 border-t border-border/20 flex items-center justify-center gap-2 animate-fade-up">
                        <CheckCircle2 size={13} className="text-primary" />
                        <p className="text-xs text-primary font-semibold">Full report ready — 14 sections generated</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ====== RIGHT COLUMN ====== */}
          <div
            className="hidden lg:flex justify-center items-center transition-[opacity,transform] ease-out"
            style={{
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0)" : "translateY(40px)",
              transitionDuration: "1.4s",
              transitionDelay: "500ms",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="flex flex-col items-center gap-5 w-full">
              <MockAuditCard />
              <button
                onClick={triggerDemo}
                className="btn-press group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-primary/30 hover:border-primary/60 hover:bg-card/90 transition-all duration-300 shadow-[0_0_40px_-12px_hsl(168_80%_48%/0.35)] hover:shadow-[0_0_60px_-10px_hsl(168_80%_48%/0.5)] hover:-translate-y-0.5"
              >
                <PlayCircle size={22} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">Watch Live Demo</span>
                <ArrowRight size={16} className="text-primary/70 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
