import { Check, Key, Users, FileCheck2, Camera, ShieldCheck, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LuminaShell, {
  LuminaEyebrow,
  LuminaHeading,
  LUMINA_GOLD,
  LUMINA_GOLD_SOFT,
  LUMINA_CREAM,
  LUMINA_NAVY_DEEP,
  luminaSerif,
  luminaSans,
} from "@/components/lumina/LuminaShell";
import LuminaWizard, { WizardStep } from "@/components/lumina/LuminaWizard";

const journey = [
  { icon: Key, title: "Property Onboarding", desc: "Compliance check, EPC, EICR, gas safety — all verified by your director." },
  { icon: Camera, title: "Premium Marketing", desc: "Magazine-grade photography, floor plans, video reels and AI-written listings." },
  { icon: Users, title: "Tenant Sourcing", desc: "Pre-vetted database + Rightmove, Zoopla, OnTheMarket featured listings." },
  { icon: FileCheck2, title: "AI Referencing", desc: "Right-to-rent, credit, employer and landlord references in 48 hours." },
  { icon: ShieldCheck, title: "Contracts & Deposit", desc: "AST, deposit protection, inventory and check-in — all handled." },
  { icon: Sparkles, title: "Move-In Concierge", desc: "Welcome pack, utilities switched, AI tenant support from day one." },
];

const steps: WizardStep[] = [
  {
    id: "owner",
    title: "Your Details",
    subtitle: "Confidential — for your director's eyes only.",
    fields: [
      { key: "name", label: "Full Name", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "address", label: "Property Address", required: true },
    ],
  },
  {
    id: "property",
    title: "About the Property",
    subtitle: "The fundamentals.",
    fields: [
      { key: "propertyType", label: "Property Type" },
      { key: "bedrooms", label: "Bedrooms", type: "number" },
      { key: "bathrooms", label: "Bathrooms", type: "number" },
      { key: "furnished", label: "Furnished?", placeholder: "Furnished / Part / Unfurnished" },
      { key: "rentExpectation", label: "Expected Rent (£ pcm)", type: "number" },
      { key: "availableFrom", label: "Available From", placeholder: "DD/MM/YYYY" },
    ],
  },
  {
    id: "compliance",
    title: "Compliance",
    subtitle: "We'll verify everything — but knowing now saves time.",
    fields: [
      { key: "epc", label: "EPC Rating", placeholder: "A–G" },
      { key: "gasSafety", label: "Gas Safety", placeholder: "In date / Required" },
      { key: "electrical", label: "EICR", placeholder: "In date / Required" },
      { key: "deposit", label: "Deposit Scheme", placeholder: "DPS / TDS / mydeposits" },
    ],
    narrative: (
      <>
        Renters' Rights Act compliance is built into every Hummm Home tenancy. <span style={{ color: LUMINA_GOLD }}>You will never miss a deadline.</span>
      </>
    ),
  },
  {
    id: "confirm",
    title: "Review & Instruct",
    subtitle: "5.0% of the first year's rent. No upfront charges.",
    narrative: (
      <ul className="space-y-3">
        {[
          "Premium photography, floor plan and video reel — included",
          "Featured listings on Rightmove, Zoopla and OnTheMarket",
          "AI tenant referencing in 48 hours, fully Right-to-Rent verified",
          "AST drafting, deposit protection and inventory",
          "Renters' Rights Act compliant from day one",
          "5.0% of the first year's rent — paid on tenancy commencement",
        ].map((line) => (
          <li key={line} className="flex items-start gap-3">
            <Check size={16} style={{ color: LUMINA_GOLD, marginTop: 3 }} />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

export default function LuminaLet() {
  return (
    <>
      <SEOHead
        title="Let With Hummm Home — 5% Premium Tenant-Find Service"
        description="Let your property with Hummm Home — premium photography, AI tenant sourcing and referencing, fully compliant tenancies. 5% of first year's rent."
        canonical="https://hummm.pro/hummm-home-let"
      />
      <LuminaShell>
        <section className="px-6 sm:px-10 lg:px-12 pt-44 sm:pt-48 pb-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <LuminaEyebrow>Let With Hummm Home</LuminaEyebrow>
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight mb-6" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}>
                The right tenant. <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>First time.</span>
              </h1>
              <p className="mb-8 max-w-xl" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 18, fontStyle: "italic", lineHeight: 1.7 }}>
                AI sourcing meets concierge-grade letting. We find the tenant, vet them properly, and protect every clause — so your asset works harder, sooner.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#instruct" className="inline-flex items-center gap-2 px-7 py-3.5 uppercase"
                  style={{ ...luminaSans, background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`, color: LUMINA_NAVY_DEEP, fontSize: 11, letterSpacing: "0.22em", fontWeight: 600 }}>
                  Instruct Hummm Home
                </a>
                <a href="/hummm-home-manage" className="inline-flex items-center gap-2 px-7 py-3.5 uppercase"
                  style={{ ...luminaSans, border: `1px solid ${LUMINA_GOLD}66`, color: LUMINA_CREAM, fontSize: 11, letterSpacing: "0.22em" }}>
                  Add Management
                </a>
              </div>
            </div>

            <div className="p-10 text-center" style={{ border: `1px solid ${LUMINA_GOLD}44`, background: `${LUMINA_NAVY_DEEP}AA` }}>
              <p className="uppercase mb-3" style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.32em", fontWeight: 600 }}>Tenant-Find Fee</p>
              <p className="text-7xl mb-2" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 400 }}>
                5.0<span style={{ color: LUMINA_GOLD }}>%</span>
              </p>
              <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}99`, fontSize: 15, fontStyle: "italic" }}>of the first year's rent</p>
              <div className="mt-8 pt-8 grid grid-cols-2 gap-6" style={{ borderTop: `1px solid ${LUMINA_GOLD}22` }}>
                <div>
                  <p style={{ ...luminaSans, color: `${LUMINA_CREAM}66`, fontSize: 10, letterSpacing: "0.22em" }} className="uppercase mb-2">High-Street</p>
                  <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}66`, fontSize: 28, textDecoration: "line-through" }}>8–12%</p>
                </div>
                <div>
                  <p style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.22em" }} className="uppercase mb-2">Avg. Time-to-Let</p>
                  <p style={{ ...luminaSerif, color: LUMINA_GOLD, fontSize: 28 }}>11 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 sm:px-10 lg:px-12 py-20" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <LuminaEyebrow>The Journey</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl">Move-in <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>in six steps.</span></LuminaHeading>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {journey.map((j, i) => {
                const Icon = j.icon;
                return (
                  <div key={j.title} className="p-7 relative" style={{ border: `1px solid ${LUMINA_GOLD}22`, background: `${LUMINA_NAVY_DEEP}99` }}>
                    <span style={{ ...luminaSerif, color: `${LUMINA_GOLD}66`, fontSize: 42, position: "absolute", top: 10, right: 18 }}>0{i + 1}</span>
                    <Icon size={22} style={{ color: LUMINA_GOLD }} />
                    <h4 className="mt-4 mb-2 text-xl" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500 }}>{j.title}</h4>
                    <p style={{ ...luminaSans, color: `${LUMINA_CREAM}99`, fontSize: 13, lineHeight: 1.65 }}>{j.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="instruct" className="px-6 sm:px-10 lg:px-12 py-24" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <LuminaEyebrow>Instruct</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl">Instruct Hummm Home <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>to let your property.</span></LuminaHeading>
            </div>
            <LuminaWizard
              steps={steps}
              serviceName="Let With Hummm Home"
              serviceTag="lumina_let"
              completionMessage="Your director will be in touch within 2 working hours to schedule photography and begin marketing."
            />
          </div>
        </section>
      </LuminaShell>
    </>
  );
}