import AnimatedSection from "@/components/AnimatedSection";
import { ShieldCheck, FileText, Wallet, UserCheck, BarChart, AlertTriangle, Clock } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Renters' Rights Act Compliance, Handled Automatically", desc: "Gas safety, EPC, electrical — tracked and managed. You stay compliant without lifting a finger." },
  { icon: Clock, title: "Tenancies That Run Themselves", desc: "Rolling periodic tenancies, rent reviews, notice periods — nothing slips through." },
  { icon: UserCheck, title: "Tenants You Can Count On", desc: "Credit, employment, rental history, affordability — reliable tenants found in minutes." },
  { icon: Wallet, title: "Rent In Your Account, On Time", desc: "Automated collection and arrears chasing. No awkward calls. No missed payments." },
  { icon: FileText, title: "Contracts That Stay Legal", desc: "AI-generated agreements, always current with the latest regulations." },
  { icon: BarChart, title: "Yields That Keep Climbing", desc: "Real-time market data ensures you're always charging what the market will bear." },
];

const LandlordsSection = () => {
  return (
    <section id="landlords" className="section-spacing section-padding bg-card/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <AnimatedSection>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">For Landlords</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Your Portfolio, <span className="text-gradient">On Autopilot</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                The Renters' Rights Act 2026 changes everything. Section 21 is gone, periodic tenancies are mandatory, and compliance is more complex than ever. Our AI handles it all — so you focus on growing your portfolio, not managing paperwork.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={80}>
              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Renters' Rights Act Ready</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our compliance engine automatically audits your properties against the latest legislation, generates compliant documentation, and alerts you to any action required.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full"
              >
                List Your Property
              </a>
            </AnimatedSection>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 70}>
                <div className="flex gap-4 p-4 border border-border rounded-lg bg-card hover-lift">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-lg">
                    <f.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandlordsSection;