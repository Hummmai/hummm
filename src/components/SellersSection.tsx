import AnimatedSection from "@/components/AnimatedSection";
import { TrendingUp, Eye, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const SellersSection = () => {
  return (
    <section id="sellers" className="section-spacing section-padding">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">For Sellers & Buyers</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Your Unfair Advantage in <span className="text-gradient">Property</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mb-16">
            Whether you're selling or searching, our AI tips the scales in your favour — delivering better prices, faster timelines, and zero guesswork.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingUp,
              title: "Pricing You Can Trust",
              desc: "AI-driven pricing that adapts to live market conditions — so you never leave money on the table or scare buyers away.",
              cta: "Get AI Valuation",
              href: "/ai-valuation",
              isRoute: true,
            },
            {
              icon: Eye,
              title: "Viewings That Filter Out Time-Wasters",
              desc: "Immersive 3D walkthroughs that qualify serious buyers before a single in-person visit — saving you time and hassle.",
              cta: "View Demo Tour",
              href: "#contact",
              isRoute: false,
            },
            {
              icon: Zap,
              title: "Completion Without the Chaos",
              desc: "AI coordinates solicitors, mortgage brokers, and surveys — so the deal closes faster and nothing falls through the cracks.",
              cta: "Learn More",
              href: "#how-it-works",
              isRoute: false,
            },
          ].map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 120}>
              <div className="p-8 border border-border rounded-lg bg-card hover-lift h-full flex flex-col">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg mb-6">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{item.desc}</p>
                {item.isRoute ? (
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                  >
                    {item.cta} <ArrowRight size={14} />
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                  >
                    {item.cta} <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SellersSection;
