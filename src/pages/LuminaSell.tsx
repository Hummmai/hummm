import { Check, Building2, Camera, Globe2, Sparkles, Trophy, TrendingUp } from "lucide-react";
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
  { icon: Building2, title: "Property Details", desc: "Your director captures the story, the spec, and the strategy." },
  { icon: TrendingUp, title: "AI Pricing & Strategy", desc: "Hummm AI models every comparable in a 1-mile radius for a defensible asking price." },
  { icon: Camera, title: "Professional Photography", desc: "Magazine-grade stills, twilight shots, drone, and reels — included." },
  { icon: Globe2, title: "Multi-Portal Launch", desc: "Rightmove Premium, Zoopla Featured, OnTheMarket New & Exclusive — same day." },
  { icon: Sparkles, title: "AI Negotiation", desc: "Every offer counter-modelled in real time. Hummm Negotiator secures the strongest terms." },
  { icon: Trophy, title: "Completion", desc: "Concierge legal hand-off, weekly progression updates, keys delivered." },
];

const steps: WizardStep[] = [
  {
    id: "owner",
    title: "Your Details",
    subtitle: "We treat every introduction with discretion.",
    fields: [
      { key: "name", label: "Full Name", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "address", label: "Property Address", placeholder: "Street, City, Postcode", required: true },
    ],
  },
  {
    id: "property",
    title: "About the Property",
    subtitle: "Tell us about the home you're entrusting to us.",
    fields: [
      { key: "propertyType", label: "Property Type", placeholder: "Townhouse, Penthouse, Mews…" },
      { key: "bedrooms", label: "Bedrooms", type: "number" },
      { key: "bathrooms", label: "Bathrooms", type: "number" },
      { key: "tenure", label: "Tenure", placeholder: "Freehold / Leasehold" },
      { key: "guidePrice", label: "Indicative Guide Price (£)", type: "number" },
      { key: "timeline", label: "Desired Timeline", placeholder: "ASAP / 3 mo / Open" },
    ],
  },
  {
    id: "strategy",
    title: "AI Pricing & Strategy",
    subtitle: "Tell our AI what matters most.",
    fields: [
      { key: "priority", label: "Priority", placeholder: "Speed / Premium / Privacy" },
      { key: "marketing", label: "Marketing Preferences", placeholder: "Off-market, soft launch, full portal" },
      { key: "notes", label: "Anything Else We Should Know?", type: "textarea", placeholder: "Recent works, neighbour quirks, story…" },
    ],
    narrative: (
      <>
        Hummm AI will model every comparable sale, current competition, and local demand in a 1-mile radius before your director presents your bespoke pricing strategy. <span style={{ color: LUMINA_GOLD }}>You will see the data behind every number.</span>
      </>
    ),
  },
  {
    id: "confirm",
    title: "Review & Instruct",
    subtitle: "0.75% success fee. No upfront charges. No withdrawal fees.",
    narrative: (
      <ul className="space-y-3">
        {[
          "Magazine-grade photography, twilight shots & video reel included",
          "Premium listings on Rightmove, Zoopla and OnTheMarket",
          "Dedicated client director + AI negotiation on every offer",
          "Concierge legal progression through to completion",
          "0.75% success fee — paid only on completion",
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

export default function LuminaSell() {
  return (
    <>
      <SEOHead
        title="Sell With Hummm Home — 0.75% AI-Powered Luxury Sales"
        description="Sell your home with Hummm Home — magazine-grade photography, multi-portal launch, AI negotiation, and a 0.75% success fee. Significantly lower than traditional agents."
        canonical="https://hummm.pro/hummm-home-sell"
      />
      <LuminaShell>
        {/* HERO */}
        <section className="px-6 sm:px-10 lg:px-12 pt-44 sm:pt-48 pb-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <LuminaEyebrow>Sell With Hummm Home</LuminaEyebrow>
              <h1
                className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight mb-6"
                style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}
              >
                Premium representation. <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>Honest fee.</span>
              </h1>
              <p className="mb-8 max-w-xl" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 18, fontStyle: "italic", lineHeight: 1.7 }}>
                Everything the high-street offers — and an AI engine fighting for every pound on completion. From £750,000 to £15M, the standard is the same.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#instruct" className="inline-flex items-center gap-2 px-7 py-3.5 uppercase transition-all hover:scale-[1.02]"
                  style={{ ...luminaSans, background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`, color: LUMINA_NAVY_DEEP, fontSize: 11, letterSpacing: "0.22em", fontWeight: 600 }}>
                  Instruct Hummm Home
                </a>
                <a href="#journey" className="inline-flex items-center gap-2 px-7 py-3.5 uppercase"
                  style={{ ...luminaSans, border: `1px solid ${LUMINA_GOLD}66`, color: LUMINA_CREAM, fontSize: 11, letterSpacing: "0.22em" }}>
                  See The Journey
                </a>
              </div>
            </div>

            <div
              className="p-10 text-center"
              style={{ border: `1px solid ${LUMINA_GOLD}44`, background: `${LUMINA_NAVY_DEEP}AA` }}
            >
              <p className="uppercase mb-3" style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.32em", fontWeight: 600 }}>Hummm Home Success Fee</p>
              <p className="text-7xl mb-2" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}>
                0.75<span style={{ color: LUMINA_GOLD }}>%</span>
              </p>
              <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}99`, fontSize: 15, fontStyle: "italic" }}>paid only on completion</p>
              <div className="mt-8 pt-8 grid grid-cols-2 gap-6" style={{ borderTop: `1px solid ${LUMINA_GOLD}22` }}>
                <div>
                  <p style={{ ...luminaSans, color: `${LUMINA_CREAM}66`, fontSize: 10, letterSpacing: "0.22em" }} className="uppercase mb-2">Traditional Agent</p>
                  <p style={{ ...luminaSerif, color: `${LUMINA_CREAM}66`, fontSize: 28, textDecoration: "line-through" }}>1.5–2.5%</p>
                </div>
                <div>
                  <p style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.22em" }} className="uppercase mb-2">You Save</p>
                  <p style={{ ...luminaSerif, color: LUMINA_GOLD, fontSize: 28 }}>up to £18,750</p>
                  <p style={{ ...luminaSans, color: `${LUMINA_CREAM}66`, fontSize: 10 }}>on a £1m sale</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section id="journey" className="px-6 sm:px-10 lg:px-12 py-20" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <LuminaEyebrow>The Journey</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl">Six steps to <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>completion.</span></LuminaHeading>
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

        {/* WIZARD */}
        <section id="instruct" className="px-6 sm:px-10 lg:px-12 py-24" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <LuminaEyebrow>Instruct</LuminaEyebrow>
              <LuminaHeading className="text-4xl sm:text-5xl">Instruct Hummm Home <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>to sell your home.</span></LuminaHeading>
            </div>
            <LuminaWizard
              steps={steps}
              serviceName="Sell With Hummm Home"
              serviceTag="lumina_sell"
              completionMessage="Your dedicated Hummm Home director will be in touch within 2 working hours to begin your bespoke strategy."
            />
          </div>
        </section>
      </LuminaShell>
    </>
  );
}