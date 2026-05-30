import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import PropertyAuditFlow from "@/components/PropertyAuditFlow";
import HummLogo from "@/components/HummLogo";
import { Button } from "@/components/ui/button";
import {
  Mail, BarChart3, MessageSquare, ShieldCheck, Clock, FileText,
  Brain, Users, ArrowRight, Link2, Search, ClipboardCheck, CheckCircle2,
} from "lucide-react";

const CAPABILITIES = [
  { icon: Mail, title: "Professional Emails", desc: "Drafts polished messages to agents and landlords on your behalf." },
  { icon: BarChart3, title: "Market Analysis", desc: "Scans comparable properties, recent sales, and local trends instantly." },
  { icon: MessageSquare, title: "Objection Handling", desc: "Handles pushback with calm, professional responses grounded in evidence." },
  { icon: ShieldCheck, title: "Buyers & Renters", desc: "Negotiates better prices for buyers and fairer terms for renters." },
  { icon: Clock, title: "Works 24/7", desc: "Never sleeps, never gets emotional. Always strategic, always ready." },
  { icon: FileText, title: "Full Transparency", desc: "Every message and decision is logged so you're always in control." },
  { icon: Brain, title: "Adapts & Learns", desc: "Reads negotiation patterns and adjusts strategy in real time." },
  { icon: Users, title: "Coordinates Everyone", desc: "Works with agents, solicitors, landlords, and managers seamlessly." },
];

const STEPS = [
  { icon: Link2, num: "01", title: "Drop Any Property Link", desc: "Paste a Rightmove, Zoopla, or any listing URL." },
  { icon: Search, num: "02", title: "We Analyse Everything", desc: "Market data, comparable deals, days listed, pricing trends — all checked." },
  { icon: ClipboardCheck, num: "03", title: "Review the Strategy", desc: "See exactly what we plan to do before any message is sent." },
  { icon: CheckCircle2, num: "04", title: "You Stay in Control", desc: "We travel with you through the conversation. You approve every step." },
];

const RentNegotiation = () => {
  const navigate = useNavigate();
  const [auditStarted, setAuditStarted] = useState(false);

  if (auditStarted) {
    return (
      <>
        <SEOHead
          title="Hummm | Your AI Negotiation Companion"
          description="Drop any property link. Get smart strategy, professional message drafting, objection handling, and clear next steps — while you stay in full control."
        />
        <Navbar />
        <main className="min-h-screen bg-background pt-28 pb-16 overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <PropertyAuditFlow initialUrl="" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Hummm | Your AI Negotiation Companion — World-Class Property Expertise"
        description="Strategy, professional messaging, objection handling, and guidance powered by licensing-level property expertise across 13 major markets. You stay in full control."
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16 overflow-x-hidden">

        {/* ── Hero ── */}
        <AnimatedSection className="text-center max-w-4xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-14 sm:pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-6">
            <Brain size={14} /> AI Negotiation Companion
          </div>

          <div className="flex justify-center mb-4">
            <HummLogo logoHeight="h-12 sm:h-16 lg:h-20" linkHome={false} />
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-2 text-balance">
            <span className="text-primary">Your AI Negotiation Companion</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-3 leading-relaxed">
            Strategy, professional messaging, objection handling, and guidance powered by world-class property expertise. You stay in full control.
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-lg mx-auto mb-10">
            Deep local intelligence across 13 major markets · Licensing-exam level knowledge · With Hummm, you are the property expert
          </p>

          <Button
            size="lg"
            className="bg-primary text-primary-foreground font-bold text-base px-8 py-6 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            onClick={() => setAuditStarted(true)}
          >
            Drop a Property Link & Start Hummm <ArrowRight size={18} className="ml-2" />
          </Button>
        </AnimatedSection>

        {/* ── Capabilities ── */}
        <AnimatedSection delay={100} className="max-w-6xl mx-auto px-5 sm:px-6 pb-20 sm:pb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3">
            What Hummm Does For You
          </h2>
          <p className="text-center text-muted-foreground text-sm max-w-lg mx-auto mb-12">
            Everything you need to get a better deal — handled by AI, approved by you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="group rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 transition-all hover:border-primary/40 hover:shadow-[0_0_24px_hsl(168_100%_45%/0.08)]"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <c.icon size={20} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── How It Works ── */}
        <AnimatedSection delay={200} className="max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <s.icon size={24} className="text-primary" />
                </div>
                <span className="text-xs font-black text-primary/60 tracking-widest">{s.num}</span>
                <h4 className="text-base font-bold text-foreground mt-1 mb-2">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>

                {i < STEPS.length - 1 && (
                  <ArrowRight size={16} className="hidden lg:block absolute top-7 -right-3 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Final CTA ── */}
        <AnimatedSection delay={300} className="max-w-3xl mx-auto px-5 sm:px-6 pb-12">
          <div
            className="rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center"
            style={{ boxShadow: "0 4px 32px hsl(168 100% 45% / 0.08)" }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to Get a Better Deal?
            </h3>
            <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
              Drop a property link and let your AI companion guide you through every step.
            </p>
            <p className="text-xs text-muted-foreground/50 mb-6 max-w-sm mx-auto">
              With Hummm, you are the property expert
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground font-bold text-base px-8 py-6 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
              onClick={() => setAuditStarted(true)}
            >
              Drop a Property Link & Start Hummm <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={350} className="pb-12">
          <p className="text-center text-xs text-muted-foreground/50 max-w-lg mx-auto">
            Trusted by buyers, sellers, renters, and landlords across the UK, USA, and SE Asia.
          </p>
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
};

export default RentNegotiation;
