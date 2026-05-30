import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import {
  Search, FileCheck, Users, ShieldCheck, Settings, ArrowRight,
} from "lucide-react";

const steps = [
  {
    num: 1,
    icon: Search,
    title: "Know Exactly What Your Property Should Earn",
    desc: "AI analyses hyper-local rental data, demand trends, and comparable lets — so you price for maximum yield with minimal void periods.",
  },
  {
    num: 2,
    icon: FileCheck,
    title: "Effortless Instruction",
    desc: "Confirm you want to let. We handle full Renters' Rights Act compliance, energy certificates, safety checks and legal documentation automatically.",
  },
  {
    num: 3,
    icon: Users,
    title: "Tenants You'll Actually Want",
    desc: "AI screens every applicant, runs comprehensive referencing, and matches you with reliable tenants — fast, fair, and thorough.",
  },
  {
    num: 4,
    icon: ShieldCheck,
    title: "Smart Move-In & Contracts",
    desc: "Automated tenancy agreements, deposit protection and professional inventory — everything ready for a seamless move-in day.",
  },
  {
    num: 5,
    icon: Settings,
    title: "Management That Runs Itself",
    desc: "24/7 maintenance triage, rent collection, inspections, and tenant communication — all AI-powered with human oversight where it matters.",
  },
];

const LettingProcess = () => {
  return (
    <section className="py-24 md:py-32 section-padding" id="letting-process">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-6">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-xs font-medium tracking-wider uppercase text-primary">
                Hassle-Free Lettings
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-balance">
              How Letting With Hummm Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              From rental valuation to ongoing management — AI does the work, experts provide the oversight.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, i) => (
            <AnimatedSection key={step.num} delay={i * 80}>
              <div className="group relative rounded-2xl p-8 border border-border bg-card hover:border-primary/40 transition-all h-full overflow-hidden">
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
            AI that manages smarter. Tenants that stay longer. Income you can count on.
          </p>
          <div className="text-center">
            <Link
              to="/sell-your-property"
              className="inline-flex items-center justify-center gap-3 px-12 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group"
            >
              Let Your Property With Us
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default LettingProcess;
