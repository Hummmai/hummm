import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import LuminaShell, {
  LuminaEyebrow,
  LuminaHeading,
  LuminaButton,
  LUMINA_GOLD,
  LUMINA_GOLD_SOFT,
  LUMINA_CREAM,
  LUMINA_NAVY_DEEP,
  luminaSerif,
  luminaSans,
} from "@/components/lumina/LuminaShell";

const regions: { region: string; areas: { name: string; slug: string }[] }[] = [
  {
    region: "Prime Central London",
    areas: [
      { name: "Mayfair", slug: "mayfair" },
      { name: "Marylebone", slug: "marylebone" },
      { name: "Knightsbridge", slug: "knightsbridge" },
      { name: "Chelsea", slug: "chelsea" },
      { name: "Belgravia", slug: "belgravia" },
      { name: "Kensington", slug: "kensington" },
      { name: "Notting Hill", slug: "notting-hill" },
      { name: "Fitzrovia", slug: "fitzrovia" },
    ],
  },
  {
    region: "North & West London",
    areas: [
      { name: "Hampstead", slug: "hampstead" },
      { name: "Primrose Hill", slug: "primrose-hill" },
      { name: "St John's Wood", slug: "st-johns-wood" },
      { name: "Islington", slug: "islington" },
      { name: "Holland Park", slug: "holland-park" },
      { name: "Maida Vale", slug: "maida-vale" },
    ],
  },
  {
    region: "South & East London",
    areas: [
      { name: "Wandsworth", slug: "wandsworth" },
      { name: "Clapham", slug: "clapham" },
      { name: "Battersea", slug: "battersea" },
      { name: "Dulwich", slug: "dulwich" },
      { name: "Shoreditch", slug: "shoreditch" },
      { name: "Canary Wharf", slug: "canary-wharf" },
    ],
  },
  {
    region: "Home Counties & Beyond",
    areas: [
      { name: "Richmond", slug: "richmond" },
      { name: "Wimbledon", slug: "wimbledon" },
      { name: "Esher", slug: "esher" },
      { name: "Cobham", slug: "cobham" },
      { name: "St Albans", slug: "st-albans" },
      { name: "Sevenoaks", slug: "sevenoaks" },
    ],
  },
];

export default function AreasWeCover() {
  return (
    <>
      <SEOHead
        title="Areas We Cover — Hummm, The Intelligent Property Consultants"
        description="Hummm covers Prime Central London, North, West, South & East London and the Home Counties. AI-powered valuations, sales, lettings and management."
        canonical="https://hummm.pro/areas"
      />
      <LuminaShell>
        <section className="px-6 sm:px-10 lg:px-12 pt-44 sm:pt-48 pb-12">
          <div className="max-w-7xl mx-auto">
            <LuminaEyebrow>Coverage</LuminaEyebrow>
            <h1
              className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight mb-6 max-w-3xl"
              style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}
            >
              Areas we cover.
              <span className="block mt-2" style={{ color: LUMINA_GOLD_SOFT, fontStyle: "italic", fontSize: "0.55em" }}>
                London. The Home Counties. The whole United Kingdom.
              </span>
            </h1>
            <p className="max-w-2xl text-lg" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontStyle: "italic", lineHeight: 1.7 }}>
              Hummm operates as a single national agency with local intelligence on every street. Tap any area below for a market guide, or instruct us to value your property anywhere in the UK.
            </p>
          </div>
        </section>

        <section className="px-6 sm:px-10 lg:px-12 py-16" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            {regions.map((r) => (
              <div
                key={r.region}
                className="p-8"
                style={{ border: `1px solid ${LUMINA_GOLD}22`, background: `${LUMINA_NAVY_DEEP}99` }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={14} style={{ color: LUMINA_GOLD }} />
                  <p className="uppercase" style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 11, letterSpacing: "0.28em", fontWeight: 600 }}>
                    {r.region}
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {r.areas.map((a) => (
                    <li key={a.slug}>
                      <Link
                        to={`/area/${a.slug}`}
                        className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                        style={{ ...luminaSerif, color: LUMINA_CREAM, fontSize: 17 }}
                      >
                        {a.name}
                        <ArrowRight size={12} className="opacity-50 group-hover:translate-x-0.5 transition-transform" style={{ color: LUMINA_GOLD }} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 sm:px-10 lg:px-12 py-24 text-center" style={{ borderTop: `1px solid ${LUMINA_GOLD}1F` }}>
          <div className="max-w-3xl mx-auto">
            <LuminaEyebrow>Don't see your area?</LuminaEyebrow>
            <LuminaHeading className="text-4xl sm:text-5xl mb-8">
              We value <span style={{ fontStyle: "italic", color: LUMINA_GOLD_SOFT }}>anywhere in the UK.</span>
            </LuminaHeading>
            <p className="mb-10 max-w-xl mx-auto" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 17, fontStyle: "italic" }}>
              Hummm's AI engine covers every postcode in the United Kingdom. Get a complimentary valuation in 30 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <LuminaButton to="/free-valuation">Start Free AI Valuation <ArrowRight size={14} /></LuminaButton>
              <LuminaButton to="/sell-with-hummm" variant="outline">Sell With Hummm</LuminaButton>
            </div>
          </div>
        </section>
      </LuminaShell>
    </>
  );
}