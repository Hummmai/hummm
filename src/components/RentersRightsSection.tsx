import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { ShieldCheck, BarChart3, FileCheck, Users, ArrowRight, Sparkles, Scale } from "lucide-react";

const benefits = [
  {
    icon: BarChart3,
    title: "Instant, Data-Rich Valuations",
    desc: "AI analyses thousands of live data points to deliver accurate rental valuations in minutes — not weeks.",
  },
  {
    icon: FileCheck,
    title: "Automatic Renters' Rights Act Compliance",
    desc: "Gas safety, EPC, electrical checks and rent pricing rules — tracked and enforced automatically. Zero risk of non-compliance.",
  },
  {
    icon: Scale,
    title: "Reports Built to Withstand Ombudsman Scrutiny",
    desc: "Every report includes clear comparable evidence trails designed for PRS Ombudsman disputes.",
  },
  {
    icon: Users,
    title: "Human Oversight for Complete Peace of Mind",
    desc: "Licensed professionals review every report before official use — full accountability and TPO protection.",
  },
];

const RentersRightsSection = () => {
  return (
    <section className="py-20 section-padding">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-6">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-xs font-bold tracking-wider uppercase text-primary">
                Rental Reform Ready
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5 text-balance">
              Ready for the New Renters' Rights Act &amp; PRS Ombudsman
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-3">
              The rules have changed. Landlords now need fair, transparent, and defensible rent pricing.
            </p>
            <p className="text-foreground font-semibold max-w-2xl mx-auto leading-relaxed">
              Hummm delivers fast AI valuations with built-in compliance checks — so you stay protected and avoid disputes.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {benefits.map((b, i) => (
            <AnimatedSection key={b.title} delay={i * 80}>
              <div className="group rounded-2xl p-8 border border-border bg-card hover:border-primary/40 transition-all h-full">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <b.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={400}>
          <div className="mt-12 text-center">
            <Link
              to="/ai-valuation"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 group"
            >
              <Sparkles size={18} />
              Get Your PRS-Compliant AI Valuation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default RentersRightsSection;
