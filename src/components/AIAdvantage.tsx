import AnimatedSection from "@/components/AnimatedSection";
import { Brain, Target, Shield, Quote } from "lucide-react";

const stats = [
  { value: "6–9%", label: "Better sale outcomes" },
  { value: "3x", label: "Faster negotiations" },
  { value: "96%", label: "Client satisfaction" },
  { value: "£18K", label: "Extra value secured" },
];

const features = [
  { icon: Brain, title: "Deep Local Intelligence", desc: "Street-level insights, transport links, school catchments, and hyperlocal market data across 13 countries." },
  { icon: Target, title: "Negotiation That Reads the Room", desc: "Buyer psychology, comparable sales, and chain strength — all analysed in real time." },
  { icon: Shield, title: "Risk Eliminated Before It Hits", desc: "Buyer credibility, chain risk, regulatory compliance, and local tax implications — managed automatically." },
];

const testimonials = [
  { name: "Sarah Mitchell", location: "Kensington, London", text: "The AI negotiated £45,000 above the highest offer I'd received.", role: "Seller" },
  { name: "James Patterson", location: "Didsbury, Manchester", text: "Sold in 11 days at 4% above asking.", role: "Seller" },
  { name: "Dr. Priya Sharma", location: "Edgbaston, Birmingham", text: "The compliance automation saves me thousands each year.", role: "Landlord" },
  { name: "Michael Chen", location: "Canary Wharf, London", text: "It secured me £32,000 more than the best offer from two other agents.", role: "Seller" },
  { name: "Rebecca Thompson", location: "Roundhay, Leeds", text: "Managing my 5 rental properties used to be a nightmare. Now it's on autopilot.", role: "Landlord" },
];

const AIAdvantage = () => {
  return (
    <section id="ai-advantage" className="py-28 sm:py-36 section-padding">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary/60 mb-4">
            AI Advantage
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-foreground/90">
            The World's Most Powerful Property Expert Delivers{" "}
            <span className="text-gradient">Better Results</span>
          </h2>
          <p className="text-white/60 text-base max-w-2xl mb-20">
            Licensing-exam level knowledge across 13 major markets, deep local intelligence, and adaptive counter-strategies powered by professional-grade analysis.
          </p>
        </AnimatedSection>

        {/* Stats — minimal, wide spacing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 100}>
              <div className="text-center py-8 border border-border/20 rounded-2xl bg-card/20 transition-[border-color,box-shadow] duration-500 hover:border-primary/10 hover:shadow-[0_4px_30px_-10px_hsl(168_80%_48%/0.06)]">
                <div className="text-2xl sm:text-3xl font-bold text-primary/80 tabular-nums mb-2">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground/40">{stat.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Features — clean cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-24">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 120}>
              <div className="p-8 border border-border/15 rounded-2xl bg-card/15 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-primary/10 hover:shadow-[0_8px_40px_-12px_hsl(168_80%_48%/0.06)]">
                <f.icon size={22} className="text-primary/50 mb-5" />
                <h3 className="text-base font-semibold text-foreground/90 mb-3">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Testimonials — compact */}
        <AnimatedSection>
          <h3 className="text-xl font-semibold text-foreground/80 mb-8">What Our Clients Say</h3>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 80}>
              <div className="p-5 border border-border/15 rounded-2xl bg-card/10 h-full flex flex-col transition-[border-color] duration-500 hover:border-primary/10">
                <Quote size={14} className="text-primary/20 mb-3" />
                <p className="text-xs text-white/50 leading-relaxed mb-4 flex-1">"{t.text}"</p>
                <div>
                  <p className="text-xs font-semibold text-foreground/70">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground/30">{t.location}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-primary/5 text-primary/50 rounded-full">
                    {t.role}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIAdvantage;
