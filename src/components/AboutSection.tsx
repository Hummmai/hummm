import AnimatedSection from "@/components/AnimatedSection";
import { Award, Shield, FileCheck, Eye } from "lucide-react";
import HummInline from "@/components/HummInline";

const AboutSection = () => {
  return (
    <section id="about" className="py-28 sm:py-36 section-padding">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <AnimatedSection>
              <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary/50 mb-4">About <HummInline size="xs" /></p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6 text-foreground/90">
                Built for People Who Expect{" "}
                <span className="text-gradient">Better</span>
              </h2>
              <p className="text-sm text-white/55 leading-relaxed mb-4">
                <HummInline size="sm" /> Global Pte. Ltd. is the global agentic protocol for property, headquartered in Singapore and operating across the UK, USA, and SE Asia. We combine advanced AI with real human oversight.
              </p>
              <p className="text-sm text-white/55 leading-relaxed mb-10">
                Our team blends decades of international property expertise with cutting-edge AI — creating a hybrid platform that consistently outperforms on price, speed, and client satisfaction.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Award, label: "TPO Member" },
                  { icon: Shield, label: "CMP Registered" },
                  { icon: FileCheck, label: "PI Insured" },
                  { icon: Eye, label: "Human Oversight" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 px-4 py-2.5 border border-border/15 rounded-xl bg-card/15 text-sm text-muted-foreground/50">
                    <badge.icon size={14} className="text-primary/40" />
                    {badge.label}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "2026", label: "Founded" },
                { value: "50+", label: "AI Models" },
                { value: "3", label: "Continents" },
                { value: "98%", label: "Success Rate" },
              ].map((stat) => (
                <div key={stat.label} className="p-8 border border-border/15 rounded-2xl bg-card/10 text-center transition-[border-color] duration-500 hover:border-primary/10">
                  <div className="text-2xl font-bold text-primary/60 tabular-nums mb-2">{stat.value}</div>
                  <p className="text-xs text-muted-foreground/35">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
