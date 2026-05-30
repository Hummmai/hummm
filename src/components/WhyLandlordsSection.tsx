import AnimatedSection from "@/components/AnimatedSection";
import { Zap, ShieldCheck, Scale, PoundSterling } from "lucide-react";
import HummInline from "@/components/HummInline";

const reasons = [
  {
    icon: Zap,
    title: "Faster & More Accurate Than Traditional Valuations",
    desc: "AI analyses thousands of data points in seconds — no waiting days for a surveyor's opinion.",
  },
  {
    icon: ShieldCheck,
    title: "Built-In Renters' Rights Act Compliance",
    desc: "Automated checks ensure your property meets every requirement under the new legislation.",
  },
  {
    icon: Scale,
    title: "Defensible Reports for the PRS Ombudsman",
    desc: "Every valuation comes with comparable evidence trails that stand up to official scrutiny.",
  },
  {
    icon: PoundSterling,
    title: "Lower Cost & Faster Turnaround",
    desc: "Professional-grade reports at a fraction of the cost — delivered in minutes, not weeks.",
  },
];

const WhyLandlordsSection = () => {
  return (
    <section className="py-20 section-padding">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-balance">
              Why Landlords Choose <HummInline size="sm" /> for Rental Reform
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Purpose-built for the new PRS landscape. Stay compliant, stay profitable.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <AnimatedSection key={r.title} delay={i * 80}>
              <div className="group rounded-2xl p-7 border border-border bg-card hover:border-primary/40 transition-all h-full text-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 mb-4 mx-auto">
                  <r.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLandlordsSection;
