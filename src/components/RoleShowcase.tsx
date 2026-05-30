import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, TrendingUp, Shield, Key, ArrowRight, CheckCircle2 } from "lucide-react";

const TABS = [
  { key: "buyer", label: "Buyer", icon: Home },
  { key: "seller", label: "Seller", icon: TrendingUp },
  { key: "landlord", label: "Landlord", icon: Shield },
  { key: "renter", label: "Renter", icon: Key },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface PanelData {
  heading: string;
  body: string;
  pills: string[];
  cta: string;
  outputs: string[];
}

const PANELS: Record<TabKey, PanelData> = {
  buyer: {
    heading: "Find and win your next home",
    body: "Drop any Rightmove or Zoopla link and get an instant AI audit — fair value, red flags, negotiation strategy, and mortgage tools.",
    pills: ["AI property score", "Fair value estimate", "Negotiation AI", "Mortgage calculator"],
    cta: "Start as a buyer",
    outputs: [
      "Asking price is 6% above fair value",
      "Suggest opening offer: £367,000",
      "EPC rating D — negotiate energy upgrade allowance",
    ],
  },
  seller: {
    heading: "Sell smarter, get more",
    body: "Get an AI valuation based on real comparable sales, track every offer, and use AI to counter-negotiate the best price.",
    pills: ["AI valuation", "Offer tracker", "Counter-offer AI", "Listing prep checklist"],
    cta: "Start as a seller",
    outputs: [
      "Estimated value: £425,000–£445,000",
      "Recommend listing at £439,950",
      "3 comparable sales within 0.2 miles support this range",
    ],
  },
  landlord: {
    heading: "Your portfolio on autopilot",
    body: "Track compliance across your portfolio, analyse yield gaps, manage tenants, and never miss a cert expiry again.",
    pills: ["Compliance tracker", "Yield analysis", "Tenant tools", "Document storage"],
    cta: "Start as a landlord",
    outputs: [
      "Gas safety cert expires in 18 days — action required",
      "Current rent is £220/mo below market rate",
      "Portfolio compliance score: 3/4 — EPC renewal needed",
    ],
  },
  renter: {
    heading: "Find, negotiate, protect",
    body: "Audit any rental listing for fair pricing, negotiate rent with AI, know your legal rights, and track your viewings.",
    pills: ["Rental audit", "Rent negotiator", "Rights checker", "Budget calculator"],
    cta: "Start as a renter",
    outputs: [
      "Asking rent is 12% above area median",
      "Landlord must provide EPC before tenancy starts",
      "Suggested counter-offer: £1,350/mo based on comparables",
    ],
  },
};

const RoleShowcase = () => {
  const [active, setActive] = useState<TabKey>("buyer");
  const panel = PANELS[active];

  return (
    <section className="py-28 sm:py-36 section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4 text-balance">
            Built for every side of the market
          </h2>
          <p className="text-white/40 text-base">One platform, four complete experiences</p>
        </div>

        {/* Tab row */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-6px_hsl(168_80%_48%/0.3)]"
                    : "border border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/20"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          key={active}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start animate-fade-in"
        >
          {/* Left */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
              {panel.heading}
            </h3>
            <p className="text-white/50 text-[15px] leading-relaxed mb-6 max-w-md">
              {panel.body}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {panel.pills.map((pill) => (
                <span
                  key={pill}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-primary/20 bg-primary/[0.06] text-primary/80"
                >
                  {pill}
                </span>
              ))}
            </div>

            <Link
              to="/auth"
              className="group btn-press inline-flex items-center gap-2 self-start px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-[0_4px_20px_-6px_hsl(168_80%_48%/0.25)] hover:shadow-[0_8px_30px_-6px_hsl(168_80%_48%/0.35)] hover:-translate-y-0.5"
            >
              {panel.cta}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

          {/* Right — mock output card */}
          <div className="rounded-2xl border border-white/[0.08] p-6 sm:p-7" style={{ background: "#111c30" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-[0.15em]">
                AI output preview
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {panel.outputs.map((line, i) => (
                <div
                  key={line}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-white/60 leading-relaxed">{line}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2">
              <span className="text-[10px] text-white/20">Powered by</span>
              <span className="text-[10px] font-semibold text-primary/50">Hummm</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleShowcase;
