import { useState } from "react";
import { Zap, Shield, Wrench, ChevronDown, ChevronUp, Target, Clock, Award } from "lucide-react";
import GoldHummm from "@/components/GoldHummm";

const STRATEGIES = [
  {
    id: "speed-demon",
    name: "The Speed Demon",
    tagline: "7-Day Exchange — Maximum Leverage",
    icon: Zap,
    goldIcon: true,
    color: "text-primary border-primary/30 bg-primary/5",
    iconBg: "bg-primary/10 border-primary/20",
    description: "Offer below asking but commit to exchanging contracts within 7 days. Sellers value speed — especially those who've been on the market 60+ days. This tactic converts vendor fatigue into your discount.",
    keyPoints: [
      "Offer 3–8% below asking price",
      "Commit to exchange within 7 working days",
      "Pre-instruct solicitor and have searches on standby",
      "Works best on properties listed 60+ days",
    ],
    riskLevel: "Medium",
    bestFor: "Properties with long days-on-market",
    openingLine: "We're in a position to exchange within 7 working days at £[AMOUNT]. Our solicitor is instructed, mortgage offer is in hand, and we require no chain.",
  },
  {
    id: "chain-free",
    name: "The Chain-Free Hammer",
    tagline: "Zero Risk — Justify Under-Asking",
    icon: Shield,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    description: "Use your chain-free status as a weapon. Statistically, 30% of property chains collapse. Position yourself as the safest buyer at 5% under asking — sellers often prefer certainty over a higher but riskier offer.",
    keyPoints: [
      "Offer 5% below asking price",
      "Emphasise zero chain-collapse risk",
      "Highlight DIP and deposit readiness",
      "Reference recent fall-through statistics",
    ],
    riskLevel: "Low",
    bestFor: "Sellers who've had deals collapse",
    openingLine: "As a chain-free buyer with a confirmed DIP of £[AMOUNT], we'd like to offer £[OFFER]. With 30% of chains collapsing nationally, we represent zero completion risk.",
  },
  {
    id: "survey-buffer",
    name: "The Survey Buffer",
    tagline: "Full Price — With a Safety Net",
    icon: Wrench,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    description: "Offer the full asking price to secure the deal, but include a 'Repair Credit' clause. If the survey reveals issues (damp, electrics, roof), you negotiate a credit at completion rather than renegotiating the price.",
    keyPoints: [
      "Offer at or near asking price",
      "Include 'Repair Credit' clause in memorandum of sale",
      "Survey costs become leverage, not risk",
      "Protects you without lowering the initial offer",
    ],
    riskLevel: "Low",
    bestFor: "Competitive situations where you need to win",
    openingLine: "We're pleased to offer the asking price of £[AMOUNT], subject to survey. We'd like to include a standard Repair Credit clause — should the survey identify material defects, we'll agree a fair credit at completion rather than renegotiating.",
  },
];

const StrategyBuilder = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Target size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Negotiation Strategy</h3>
          <p className="text-[10px] text-muted-foreground">Choose your tactical approach — <span className="text-amber-400 font-bold">Gold exclusive</span></p>
        </div>
      </div>

      <div className="space-y-3">
        {STRATEGIES.map((s) => {
          const Icon = s.icon;
          const isOpen = expandedId === s.id;
          return (
            <div
              key={s.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen ? s.color : "border-border bg-card/40"
              }`}
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : s.id)}
                className="w-full text-left p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${s.iconBg}`}>
                  <Icon size={18} style={s.goldIcon ? { color: "#eab308", filter: "drop-shadow(0 0 3px rgba(234,179,8,0.3))" } : {}} className={s.goldIcon ? "" : s.color.split(" ")[0]} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.tagline}</p>
                </div>
                <GoldHummm size={14} pulse={false} />
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  s.riskLevel === "Low" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {s.riskLevel} Risk
                </span>
                {isOpen ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>

                  <div className="grid grid-cols-2 gap-2">
                    {s.keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span className="text-muted-foreground">{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={10} /> Best for: {s.bestFor}</span>
                  </div>

                  <div className="rounded-xl bg-muted/30 border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Opening Line</p>
                    <p className="text-xs text-foreground leading-relaxed italic">"{s.openingLine}"</p>
                    <button
                      onClick={() => handleCopy(s.openingLine, s.id)}
                      className="mt-2 text-[10px] font-bold text-primary hover:underline"
                    >
                      {copiedId === s.id ? "✓ Copied" : "Copy to clipboard"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyBuilder;
