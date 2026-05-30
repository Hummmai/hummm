import { Check, Briefcase, Wrench, Banknote, FileCheck2, Users, ShieldCheck } from "lucide-react";
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

const features = [
  { icon: Banknote, title: "Rent Collection", desc: "Monthly rent collected, reconciled and paid to your account within 3 working days." },
  { icon: Wrench, title: "Certified Contractors", desc: "Vetted gas, electrical, plumbing and decorators — pre-approved by Hummm Home." },
  { icon: FileCheck2, title: "Compliance Calendar", desc: "EPC, gas safety, EICR, deposit renewals — never miss a deadline." },
  { icon: Users, title: "24/7 AI Tenant Support", desc: "Tenants get instant help via Hummm AI; only escalations reach you." },
  { icon: ShieldCheck, title: "Mid-Tenancy Inspections", desc: "Quarterly visits with photographic reports delivered to your dashboard." },
  { icon: Briefcase, title: "Renewals & Negotiations", desc: "AI-modelled rent reviews and concierge-grade renewal negotiations." },
];

const steps: WizardStep[] = [
  {
    id: "owner",
    title: "Your Details",
    subtitle: "Confidential introduction to your client director.",
    fields: [
      { key: "name", label: "Full Name", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "address", label: "Property Address", required: true },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio Snapshot",
    subtitle: "Single property or portfolio — we manage either with the same care.",
    fields: [
      { key: "properties", label: "Number of Properties", type: "number" },
      { key: "currentRent", label: "Total Monthly Rent (£)", type: "number" },
      { key: "currentAgent", label: "Current Managing Agent", placeholder: "Self-managed, agency name…" },
      { key: "painPoints", label: "What's Not Working?", type: "textarea", placeholder: "Voids, arrears, repairs, compliance…" },
    ],
  },
  {
    id: "confirm",
    title: "Review & Instruct",
    subtitle: "2.75% monthly. Cancel any time after 12 months. No exit fee.",
    narrative: (
      <ul className="space-y-3">
        {[
          "Monthly rent collection, reconciliation and payout",
          "24/7 AI tenant support — only escalations reach you",
          "Certified, vetted contractor network (no markup)",
          "Quarterly inspections with photographic reports",
          "Full compliance calendar — EPC, gas, EICR, deposit",
          "Renewal negotiations powered by Hummm AI",
          "2.75% monthly — paid only from collected rent",
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

export default function LuminaManage() {
  return (
    <>
      <SEOHead
        title="Hummm Home Management — 2.75% Premium Property Management"
        description="Full-service property management from Hummm Home. Rent collection, certified contractors, 24/7 AI tenant support, and full compliance — 2.75% monthly."
        canonical="https://hummm.pro/hummm-home-manage"
      />
      <LuminaShell>
        <section className="px-6 sm:px-10 lg:px-12 pt-44 sm:pt-48 pb-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <LuminaEyebrow>Hummm Home Management</LuminaEyebrow>
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight mb-6" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}>
                Your portfolio. <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>Quietly handled.</span>
              </h1>
              <p className="mb-8 max-w-xl" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 18, fontStyle: "italic", lineHeight: 1.7 }}>
                A single director. A 24/7 AI assistant for your tenants. Vetted contractors. Every compliance deadline tracked. You decide what reaches you.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#instruct" className="inline-flex items-center gap-2 px-7 py-3.5 uppercase"
                  style={{ ...luminaSans, background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`, color: LUMINA_NAVY_DEEP, fontSize: 11, letterSpacing: "0.22em", fontWeight: 600 }}>
                  Instruct Hummm Home
                </a>
                <a href="/hummm-home-let" className="inline-flex items-center gap-2 px-7 py-3.5 uppercase"
                  style={{ ...luminaSans, border: `1px solid ${LUMINA_GOLD}66`, color: LUMINA_CREAM, fontSize: 11, letterSpacing: "0.22em" }}>
                  Bundle With Lettings
                </a>
              </div>
            </div>

            <div className="p-10 text-center" style={{ border: `1px solid ${LUMINA_GOLD}44`, background: `${LUMINA_NAVY_DEEP}AA` }}>
              <p className="uppercase mb-3" style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.32em", fontWeight: 600 }}>Management Fee</p>
              <p className="text-7xl mb-2" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 400 }}>
                2.75<span style={{ color: LUMINA_GOLD }}>%</span>
              </p>
              <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}99`, fontSize: 15, fontStyle: "italic" }}>of monthly rent collected</p>
              <div className="mt-8 pt-8 grid grid-cols-2 gap-6" style={{ borderTop: `1px solid ${LUMINA_GOLD}22` }}>
                <div>
                  <p style={{ ...luminaSans, color: `${LUMINA_CREAM}66`, fontSize: 10, letterSpacing: "0.22em" }} className="uppercase mb-2">Traditional</p>
                  <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}66`, fontSize: 28, textDecoration: "line-through" }}>10–15%</p>
                </div>
                <div>
                  <p style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.22em" }} className="uppercase mb-2">Exit Fee</p>
                  <p style={{ ...luminaSerif, color: LUMINA_GOLD, fontSize: 28 }}>£0</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 sm:px-10 lg:px-12 py-20" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <LuminaEyebrow>What's Included</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl">Six pillars of <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>quiet excellence.</span></LuminaHeading>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="p-7" style={{ border: `1px solid ${LUMINA_GOLD}22`, background: `${LUMINA_NAVY_DEEP}99` }}>
                    <Icon size={22} style={{ color: LUMINA_GOLD }} />
                    <h4 className="mt-4 mb-2 text-xl" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500 }}>{f.title}</h4>
                    <p style={{ ...luminaSans, color: `${LUMINA_CREAM}99`, fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
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
              <LuminaHeading className="text-4xl sm:text-5xl">Entrust your portfolio <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>to Hummm Home.</span></LuminaHeading>
            </div>
            <LuminaWizard
              steps={steps}
              serviceName="Hummm Home Management"
              serviceTag="lumina_manage"
              completionMessage="Your director will be in touch within 2 working hours to begin a confidential portfolio review and onboarding plan."
            />
          </div>
        </section>
      </LuminaShell>
    </>
  );
}