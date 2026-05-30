import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft, ChevronDown, ChevronUp, Check, Sparkles,
  MessageSquare, Search, FileText, Shield, Paintbrush, Users, Truck,
} from "lucide-react";

interface Section {
  title: string;
  icon: React.ElementType;
  items: string[];
}

const SECTIONS: Section[] = [
  {
    title: "Legal & Documents",
    icon: FileText,
    items: [
      "Instruct a conveyancing solicitor",
      "Locate your title deeds or Land Registry title number",
      "Obtain a copy of any planning permissions or building regulations certificates",
      "Check your mortgage — get a redemption statement from your lender",
      "If leasehold: check remaining lease length (under 80 years needs extending before sale)",
    ],
  },
  {
    title: "Energy & Compliance",
    icon: Shield,
    items: [
      "Get an EPC (Energy Performance Certificate) — legally required before listing",
      "EPC rating D or below? Consider improvements — buyers factor this into offers",
      "Ensure gas safety and electrical certificates are available if requested",
      "Check any building regulations compliance certificates for extensions or conversions",
    ],
  },
  {
    title: "Presentation",
    icon: Paintbrush,
    items: [
      "Declutter every room — less is more for photography and viewings",
      "Deep clean including windows, carpets, and outdoor spaces",
      "Touch up paint — neutral colours appeal to the widest range of buyers",
      "Fix obvious defects: dripping taps, broken handles, cracked tiles",
      "First impressions: tidy front garden, clean front door, working doorbell",
      "Professional photography — poor photos cost you 10-15% of enquiries",
    ],
  },
  {
    title: "Agent & Pricing",
    icon: Users,
    items: [
      "Get at least 3 valuations from local agents",
      "Check comparable recent sales on Rightmove/Zoopla yourself",
      "Agree marketing strategy with agent (Rightmove, Zoopla, social)",
      "Understand agent fees: 1-1.5% + VAT is typical for sole agency",
      "Set a realistic asking price — overpricing leads to longer time on market",
    ],
  },
  {
    title: "Moving Prep",
    icon: Truck,
    items: [
      "Start decluttering and donating/selling items you won't move",
      "Research removal companies and get quotes early",
      "Notify utility providers, bank, DVLA, HMRC of upcoming move",
      "Consider storage if you need to vacate before completion",
    ],
  },
];

const TOTAL_ITEMS = SECTIONS.reduce((s, sec) => s + sec.items.length, 0);

function ProgressRing({ percent }: { percent: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" opacity={0.2} />
        <circle cx="44" cy="44" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-500" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
        {percent}%
      </span>
    </div>
  );
}

export default function SellerListingPrep() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useHumm();

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth?redirect=/seller/listing-prep");
  }, [isLoggedIn]);

  const storageKey = `listing_prep_${userId}`;

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const toggleSection = (i: number) =>
    setOpenSections((prev) => ({ ...prev, [i]: !prev[i] }));

  const doneCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const percent = Math.round((doneCount / TOTAL_ITEMS) * 100);

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-foreground";

  return (
    <>
      <SEOHead title="Listing Prep Checklist | Hummm" description="Pre-sale preparation checklist for sellers." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          {/* HEADER */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Listing Prep Checklist</h1>
              <p className="text-sm text-muted-foreground/60 mt-1">Everything you need to do before going to market</p>
            </div>
            <ProgressRing percent={percent} />
          </div>

          {/* SECTIONS */}
          <div className="space-y-4 mb-12">
            {SECTIONS.map((sec, si) => {
              const sectionDone = sec.items.filter((item) => checked[`${si}-${item}`]).length;
              const isOpen = openSections[si];
              const Icon = sec.icon;

              return (
                <div key={si} className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                  <button onClick={() => toggleSection(si)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sec.title}</p>
                        <p className="text-[10px] text-muted-foreground/50">{sectionDone}/{sec.items.length} complete</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={14} className="text-muted-foreground/40" /> : <ChevronDown size={14} className="text-muted-foreground/40" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 space-y-1 animate-fade-in">
                      {sec.items.map((item) => {
                        const key = `${si}-${item}`;
                        const done = !!checked[key];
                        return (
                          <button key={key} onClick={() => toggle(key)}
                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/[0.03] transition-colors group">
                            <span className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${done ? "bg-emerald-500/20 border-emerald-500/40" : "border-white/[0.12] group-hover:border-white/[0.2]"}`}>
                              {done && <Check size={12} className="text-emerald-400" />}
                            </span>
                            <span className={`text-sm leading-snug transition-all ${done ? "line-through text-muted-foreground/40" : "text-foreground/80"}`}>
                              {item}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTION CARDS */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Get your valuation", icon: Sparkles, path: "/seller/valuation", desc: "AI price estimate" },
              { label: "Track your offers", icon: MessageSquare, path: "/seller/offers", desc: "Manage offers" },
              { label: "Find an agent", icon: Search, path: "/find-an-agent", desc: "Compare agents" },
            ].map((c) => (
              <button key={c.path} onClick={() => navigate(c.path)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <c.icon size={14} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{c.label}</p>
                <p className="text-[10px] text-muted-foreground/50">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
