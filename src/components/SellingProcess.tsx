import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import {
  Sparkles, FileCheck, Camera, Users, Brain, CheckCircle, ArrowRight,
} from "lucide-react";

const steps = [
  {
    num: 1,
    icon: Sparkles,
    title: "Instant AI Valuation",
    desc: "Receive the most accurate, data-rich valuation in the UK using live PropertyData, Land Registry and hyper-local insights.",
  },
  {
    num: 2,
    icon: FileCheck,
    title: "Simple Instruction",
    desc: "Tell us you're ready to sell. We take care of everything — no chasing, no paperwork.",
  },
  {
    num: 3,
    icon: Camera,
    title: "Listings That Attract Serious Buyers, Not Time-Wasters",
    desc: "AI-crafted listings, professional visuals, and targeted campaigns across every major portal.",
  },
  {
    num: 4,
    icon: Users,
    title: "Seamless Viewings",
    desc: "We handle scheduling, virtual tours and all buyer enquiries 24/7.",
  },
  {
    num: 5,
    icon: Brain,
    title: "AI That Fights For Every Extra Thousand",
    desc: "Real-time market data, buyer psychology, and adaptive strategies to extract peak value.",
  },
  {
    num: 6,
    icon: CheckCircle,
    title: "Stress-Free Completion",
    desc: "Full end-to-end transaction management with licensed human oversight and complete compliance.",
  },
];

const SellingProcess = () => {
  return (
    <section className="py-24 md:py-32 section-padding" id="selling-process">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-6">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-medium tracking-wider uppercase text-primary">
                Simple 6-Step Process
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-balance">
              How Selling With Hummm Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              From valuation to completion — AI does the heavy lifting, experts provide the oversight.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, i) => (
            <AnimatedSection key={step.num} delay={i * 80}>
              <div className="group relative rounded-2xl p-8 border border-border bg-card hover:border-primary/40 transition-all h-full overflow-hidden">
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-primary/0 rounded-t-2xl" />

                <div className="flex items-center gap-3 mb-5">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 tabular-nums">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                    <step.icon size={20} className="text-primary" />
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={500}>
          <p className="text-center text-lg md:text-xl font-semibold text-foreground mb-8 tracking-tight">
            AI that works harder. Humans that care more. Results that speak for themselves.
          </p>
          <div className="text-center">
            <Link
              to="/ai-valuation"
              className="inline-flex items-center justify-center gap-3 px-12 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group"
            >
              <Sparkles size={18} />
              Start Your Sale Today
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SellingProcess;
