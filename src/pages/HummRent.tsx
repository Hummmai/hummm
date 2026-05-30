import { useState } from "react";
import Disclaimer from "@/components/Disclaimer";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import {
  ShieldCheck, FileText, AlertTriangle, Scale, UserCheck,
  Wallet, ClipboardList, Wrench, BarChart3, LayoutDashboard,
  Sparkles, ArrowRight,
} from "lucide-react";

const shieldItems = [
  { icon: ShieldCheck, title: "Automatic Compliance Checks", desc: "Instant Renters' Rights Act & regulatory compliance scanning for every property." },
  { icon: UserCheck, title: "Full Tenant Vetting & AML", desc: "Comprehensive identity verification, credit checks, and Anti-Money Laundering protection." },
  { icon: FileText, title: "Instant Legal Documents", desc: "Generate tenancy agreements, Section notices, and compliance certificates in seconds." },
  { icon: AlertTriangle, title: "Risk Alerts & Early Warnings", desc: "Proactive alerts for expiring certificates, missed deadlines, and regulatory changes." },
  { icon: Scale, title: "Dispute Resolution Support", desc: "AI-guided mediation tools and Ombudsman-ready documentation for any dispute." },
];

const managementItems = [
  { icon: Wallet, title: "Automated Rent Collection", desc: "Smart payment tracking with automatic reminders and receipt generation." },
  { icon: ClipboardList, title: "Tenant Screening & Onboarding", desc: "Seamless digital onboarding with document collection and reference checks." },
  { icon: Wrench, title: "Maintenance Request Handling", desc: "Tenants log issues digitally — you track, prioritise, and resolve from one place." },
  { icon: BarChart3, title: "Monthly Financial Reports", desc: "Clear income, expenses, and yield reports generated automatically every month." },
  { icon: LayoutDashboard, title: "Portfolio Overview", desc: "See all your properties, tenancies, and compliance status in your Command Centre." },
];

type Tab = "shield" | "management";

const HummRent = () => {
  const [activeTab, setActiveTab] = useState<Tab>("shield");

  const items = activeTab === "shield" ? shieldItems : managementItems;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Hummm Rent | Protect. Manage. Profit."
        description="Hummm makes renting simple, compliant, and profitable with powerful protection tools and effortless property management."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 20%, hsl(168 100% 45% / 0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-balance">
              Hummm Rent
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <p className="text-lg sm:text-xl font-semibold text-primary mb-3 tracking-wide">
              Protect. Manage. Profit. All in one place.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Hummm makes renting simple, compliant, and profitable with powerful protection tools and effortless management.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <AnimatedSection delay={300}>
          <div className="flex rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-1.5 mb-10">
            {([
              { key: "shield" as Tab, label: "Property Shield", icon: ShieldCheck },
              { key: "management" as Tab, label: "Property Management", icon: LayoutDashboard },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-[0_4px_24px_-4px_hsl(168_100%_45%/0.35)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Cards */}
        <div className="grid gap-4 sm:gap-5">
          {items.map((item, i) => (
            <AnimatedSection key={item.title} delay={350 + i * 80}>
              <div className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-3xl border border-border/30 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_8px_30px_-10px_hsl(168_100%_45%/0.12)] transition-all duration-300">
                <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection delay={800}>
          <div className="mt-14 text-center">
            <Link
              to="/ai-valuation"
              className="inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl text-base font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_6px_32px_-6px_hsl(168_100%_45%/0.4)] hover:shadow-[0_8px_40px_-6px_hsl(168_100%_45%/0.55)]"
            >
              <Sparkles size={18} />
              Get Started with Hummm Rent
              <ArrowRight size={18} />
            </Link>
          </div>
        </AnimatedSection>
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <Disclaimer />
      </section>

      <Footer />
    </div>
  );
};

export default HummRent;
