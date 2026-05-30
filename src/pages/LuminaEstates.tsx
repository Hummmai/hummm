import { ArrowRight, Award, Sparkles, Building2, Key, Briefcase, ShieldCheck, Cpu, Banknote, Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import LuminaShell, {
  LuminaEyebrow,
  LuminaHeading,
  LuminaButton,
  LuminaCard,
  LUMINA_GOLD,
  LUMINA_GOLD_SOFT,
  LUMINA_CREAM,
  LUMINA_NAVY_DEEP,
  luminaSerif,
  luminaSans,
} from "@/components/lumina/LuminaShell";

const services = [
  {
    icon: Building2,
    title: "Sell With Hummm Home",
    fee: "0.75% success fee",
    benchmark: "vs 1.5–2.5% traditional",
    desc: "AI-led pricing, professional photography, premium multi-portal launch, and our AI Negotiator securing every pound on completion.",
    to: "/hummm-home-sell",
  },
  {
    icon: Key,
    title: "Let With Hummm Home",
    fee: "5.0% first year rent",
    benchmark: "vs 8–12% traditional",
    desc: "Full tenant-find concierge — AI marketing, vetted referencing, contracts, and move-in handled with white-glove care.",
    to: "/hummm-home-let",
  },
  {
    icon: Briefcase,
    title: "Hummm Home Management",
    fee: "2.75% monthly",
    benchmark: "vs 10–15% traditional",
    desc: "End-to-end management — rent collection, certified contractors, compliance, and 24/7 AI tenant support.",
    to: "/hummm-home-manage",
  },
];

const pillars = [
  { icon: Award, title: "Heritage Service", desc: "Dedicated client director, hand-curated marketing, and the discretion serious portfolios demand." },
  { icon: Cpu, title: "AI Advantage", desc: "Live valuation models, negotiation drafting, and market timing powered by Hummm AI's analysis engine." },
  { icon: ShieldCheck, title: "Compliance First", desc: "TPO regulated, AML certified, GDPR compliant. Every transaction documented and protected." },
  { icon: Banknote, title: "Transparent Fees", desc: "Industry-leading rates, no upfront charges, no withdrawal fees, no hidden uplifts at completion." },
];

const testimonials = [
  { quote: "Hummm Home sold our Marylebone flat 9% above asking in 17 days. The AI strategy was uncanny.", author: "Sarah T., Marylebone", role: "Vendor" },
  { quote: "Best lettings experience I've had in 20 years of landlording. Three references in 48 hours.", author: "Marcus L., Hampstead", role: "Landlord" },
  { quote: "It feels like Savills — but the numbers don't lie. We saved £18k in fees on a single sale.", author: "Priya K., Notting Hill", role: "Vendor" },
];

export default function LuminaEstates() {
  return (
    <>
      <SEOHead
        title="Hummm Home — AI-Powered Luxury Property Agency"
        description="Traditional excellence. Powered by AI. Premium sales, lettings and management across London and the UK. 0.75% sales fee. Book a valuation today."
        canonical="https://hummm.pro/hummm-home"
      />
      <LuminaShell>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 70% 20%, ${LUMINA_GOLD}33, transparent 60%)`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-44 sm:pt-48 pb-24 sm:pb-32">
            <div className="max-w-4xl">
              <LuminaEyebrow>Est. 2026 · London</LuminaEyebrow>
              <h1
                className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight mb-8"
                style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}
              >
                Hummm Home
                <span className="block mt-3" style={{ color: LUMINA_GOLD, fontStyle: "italic", fontSize: "0.55em" }}>
                  The new standard in British property.
                </span>
              </h1>
              <p
                className="max-w-2xl text-lg sm:text-xl leading-relaxed mb-12"
                style={{ ...luminaSerif, color: `${LUMINA_CREAM}CC`, fontStyle: "italic", fontWeight: 300 }}
              >
                Traditional excellence. Powered by AI. A new kind of agency — combining the refinement of Mayfair's finest with intelligence no high-street firm can match.
              </p>
              <div className="flex flex-wrap gap-4">
                <LuminaButton to="/hummm-home-sell">Sell With Hummm Home <ArrowRight size={14} /></LuminaButton>
                <LuminaButton to="/hummm-home-let" variant="outline">Let With Hummm Home</LuminaButton>
                <LuminaButton to="/free-valuation" variant="outline">Book Valuation</LuminaButton>
              </div>

              {/* Trust strip */}
              <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4">
                {["TPO Regulated", "AML Certified", "GDPR Compliant", "Powered by Hummm AI"].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <Sparkles size={12} style={{ color: LUMINA_GOLD }} />
                    <span
                      className="uppercase"
                      style={{ ...luminaSans, color: `${LUMINA_CREAM}88`, fontSize: 10, letterSpacing: "0.28em" }}
                    >{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section
          className="px-6 sm:px-10 lg:px-12 py-24"
          style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <LuminaEyebrow>Our Services</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl mb-5">
                Three services. <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>One standard.</span>
              </LuminaHeading>
              <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}99`, fontSize: 17, fontStyle: "italic" }}>
                Whether selling, letting, or entrusting your portfolio to us — every interaction is held to the same exacting standard.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {services.map((s) => {
                const Icon = s.icon;
                return (
                  <LuminaCard key={s.title} className="flex flex-col">
                    <div
                      className="w-12 h-12 flex items-center justify-center mb-6"
                      style={{ border: `1px solid ${LUMINA_GOLD}44`, color: LUMINA_GOLD }}
                    ><Icon size={20} /></div>
                    <h3
                      className="text-2xl mb-2"
                      style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500 }}
                    >{s.title}</h3>
                    <div className="mb-5">
                      <p style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 13, letterSpacing: "0.12em", fontWeight: 600 }}>{s.fee}</p>
                      <p style={{ ...luminaSans, color: `${LUMINA_CREAM}55`, fontSize: 11, letterSpacing: "0.06em" }}>{s.benchmark}</p>
                    </div>
                    <p className="mb-7 flex-1" style={{ ...luminaSans, color: `${LUMINA_CREAM}AA`, fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
                    <Link
                      to={s.to}
                      className="inline-flex items-center gap-2 uppercase transition-opacity hover:opacity-80"
                      style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 11, letterSpacing: "0.28em", fontWeight: 600 }}
                    >
                      Explore <ArrowRight size={12} />
                    </Link>
                  </LuminaCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section
          className="px-6 sm:px-10 lg:px-12 py-24"
          style={{ background: `${LUMINA_NAVY_DEEP}66`, borderTop: `1px solid ${LUMINA_GOLD}1F`, borderBottom: `1px solid ${LUMINA_GOLD}1F` }}
        >
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <LuminaEyebrow>Why Hummm Home</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl mb-6">
                Built for the next era of <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>British property.</span>
              </LuminaHeading>
              <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}99`, fontSize: 18, fontStyle: "italic", lineHeight: 1.7 }}>
                Founded by veterans of London's finest agencies and engineered by AI pioneers, Hummm Home pairs traditional white-glove representation with an intelligence layer no high-street firm can match.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="p-6"
                    style={{ border: `1px solid ${LUMINA_GOLD}22`, background: `${LUMINA_NAVY_DEEP}AA` }}
                  >
                    <Icon size={20} style={{ color: LUMINA_GOLD }} />
                    <h4 className="mt-4 mb-2 text-xl" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500 }}>{p.title}</h4>
                    <p style={{ ...luminaSans, color: `${LUMINA_CREAM}99`, fontSize: 13, lineHeight: 1.65 }}>{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="px-6 sm:px-10 lg:px-12 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <LuminaEyebrow>Clients</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl">A reputation, <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>quietly earned.</span></LuminaHeading>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.author}
                  className="p-8"
                  style={{ border: `1px solid ${LUMINA_GOLD}22`, background: `${LUMINA_NAVY_DEEP}99` }}
                >
                  <Quote size={20} style={{ color: LUMINA_GOLD }} />
                  <p className="my-5 leading-relaxed" style={{ ...luminaSerif, color: LUMINA_CREAM, fontSize: 18, fontStyle: "italic", fontWeight: 300 }}>
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={LUMINA_GOLD} stroke={LUMINA_GOLD} />)}
                  </div>
                  <p style={{ ...luminaSans, color: LUMINA_CREAM, fontSize: 12, fontWeight: 600 }}>{t.author}</p>
                  <p style={{ ...luminaSans, color: `${LUMINA_CREAM}66`, fontSize: 10, letterSpacing: "0.16em" }} className="uppercase">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 sm:px-10 lg:px-12 py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <LuminaEyebrow>Begin</LuminaEyebrow>
            <LuminaHeading className="text-4xl sm:text-6xl mb-8">
              Your private valuation, <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>complimentary.</span>
            </LuminaHeading>
            <p className="mb-10 max-w-xl mx-auto" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 17, fontStyle: "italic" }}>
              A 30-second AI-led valuation, followed by a confidential strategy call with a Hummm Home director.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <LuminaButton to="/free-valuation">Book Valuation <ArrowRight size={14} /></LuminaButton>
              <LuminaButton to="/hummm-home-sell" variant="outline">Sell With Hummm Home</LuminaButton>
            </div>
          </div>
        </section>
      </LuminaShell>
    </>
  );
}