import { useState, useEffect } from "react";
import { Zap, X, ArrowRight, Check, Lock } from "lucide-react";
import GoldHummm from "./GoldHummm";
import { useHumm } from "@/contexts/HummContext";

const STORAGE_KEY = "humm_negotiator_credits";
const MAX_FREE_CREDITS = 3;

const TIERS = [
  { feature: "AI Rental Valuation", free: true, gold: true },
  { feature: "Local Comparable Data", free: true, gold: true },
  { feature: "National Yield Data", free: false, gold: true },
  { feature: "AI Negotiation (Unlimited)", free: false, gold: true },
  { feature: "Multilingual Agent (40+ Languages)", free: "3 credits", gold: true },
  { feature: "Deep-Market Intelligence", free: false, gold: true },
  { feature: "Priority Mortgage Rates", free: false, gold: true },
];

export function useCreditTeaser() {
  const { isGold } = useHumm();
  const [credits, setCredits] = useState(() => {
    if (isGold) return Infinity;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? parseInt(stored) : MAX_FREE_CREDITS;
  });

  useEffect(() => {
    if (isGold) {
      setCredits(Infinity);
    }
  }, [isGold]);

  const consumeCredit = (): boolean => {
    if (isGold) return true;
    if (credits <= 0) return false;
    const next = credits - 1;
    setCredits(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    return true;
  };

  return { credits: isGold ? Infinity : credits, consumeCredit, isGold };
}

interface CreditBadgeProps {
  credits: number;
  isGold: boolean;
}

export function CreditBadge({ credits, isGold }: CreditBadgeProps) {
  if (isGold) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/10 to-amber-600/10 border border-amber-400/30">
        <GoldHummm size={14} pulse={false} />
        <span className="text-xs font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
          Unlimited Credits
        </span>
      </div>
    );
  }

  const isLow = credits <= 1;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
      isLow
        ? "bg-destructive/10 border-destructive/30"
        : "bg-primary/10 border-primary/30"
    }`}>
      <Zap size={12} className={isLow ? "text-destructive" : "text-primary"} />
      <span className={`text-xs font-bold ${isLow ? "text-destructive" : "text-primary"}`}>
        {credits} Credit{credits !== 1 ? "s" : ""} Remaining
      </span>
    </div>
  );
}

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0A1428] via-[#0d1a30] to-[#0A1428] border border-amber-400/20 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X size={16} className="text-white/50" />
        </button>

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <GoldHummm size={48} pulse showLabel />
          </div>

          <h3 className="text-xl font-black text-white mb-2">
            You've Used All Free Credits
          </h3>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Upgrade to Hummm Gold for unlimited AI negotiations, deep-market data, and full compliance tools.
          </p>

          {/* Mini tier table */}
          <div className="rounded-xl border border-white/10 overflow-hidden mb-6 text-left">
            {TIERS.map((tier, i) => (
              <div key={i} className={`grid grid-cols-3 px-3 py-2.5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${i < TIERS.length - 1 ? "border-b border-white/5" : ""}`}>
                <span className="text-[11px] text-white/80 font-medium col-span-1">{tier.feature}</span>
                <div className="flex justify-center">
                  {tier.free === true ? (
                    <Check size={12} className="text-primary" />
                  ) : tier.free === false ? (
                    <Lock size={10} className="text-white/20" />
                  ) : (
                    <span className="text-[9px] text-amber-400 font-semibold">{tier.free}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  <Check size={12} className="text-amber-400" />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              onClose();
              window.location.href = "/dashboard/buyer";
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 group"
          >
            <GoldHummm size={16} pulse={false} />
            Upgrade to Hummm Gold
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
