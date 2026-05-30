import { useState } from "react";
import { Lock, Check, X, ArrowRight, Crown, Sparkles } from "lucide-react";
import GoldHummm from "./GoldHummm";

const TIERS = [
  { feature: "AI Rental Valuation", free: true, volt: true },
  { feature: "Local Comparable Data", free: true, volt: true },
  { feature: "National Yield Data", free: false, volt: true },
  { feature: "Full Legal Compliance Engine", free: false, volt: true },
  { feature: "AI Negotiation Emails (Unlimited)", free: false, volt: true },
  { feature: "Multilingual Agent (40+ Languages)", free: "3 credits", volt: true },
  { feature: "Deep-Market Intelligence Reports", free: false, volt: true },
  { feature: "Priority Mortgage Rates", free: false, volt: true },
  { feature: "Renter Resume & Verification", free: false, volt: true },
];

interface GoldPaywallProps {
  children: React.ReactNode;
  revealFraction?: number;
}

export default function GoldPaywall({ children, revealFraction = 0.3 }: GoldPaywallProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        {children}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent ${revealFraction * 100}%, hsl(var(--background) / 0.4) ${revealFraction * 100 + 10}%, hsl(var(--background) / 0.85) ${revealFraction * 100 + 30}%)`,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: `linear-gradient(to bottom, transparent ${revealFraction * 100 - 5}%, black ${revealFraction * 100 + 5}%)`,
            WebkitMaskImage: `linear-gradient(to bottom, transparent ${revealFraction * 100 - 5}%, black ${revealFraction * 100 + 5}%)`,
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: `${revealFraction * 100}%` }}>
          <div className="pointer-events-auto w-full max-w-md mx-4">
            {/* Glassmorphism card */}
            <div
              className="relative rounded-2xl bg-white/[0.04] backdrop-blur-md p-8 text-center shadow-2xl"
              style={{ border: "1px solid transparent", backgroundClip: "padding-box" }}
            >
              {/* Volt→Teal gradient border */}
              <div
                className="absolute -inset-px rounded-2xl pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, #72F1B8 0%, hsl(168 100% 45%) 100%)",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                  borderRadius: "1rem",
                }}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#72F1B8]/[0.03] via-transparent to-primary/[0.03] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <GoldHummm size={40} pulse showLabel />
                </div>

                {/* Outline-only badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#72F1B8]/40 bg-transparent mb-3">
                  <Crown size={11} className="text-[#72F1B8]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#72F1B8]/90">
                    AI Exclusive
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2 tracking-tight">
                  Unlock Elite Intelligence
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Join 5,000+ UK users using Volt to secure their 2026 property strategy. Get full legal compliance and deep-market data.
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all group"
                  style={{ boxShadow: "0 0 20px rgba(114,241,184,0.3), 0 0 60px rgba(114,241,184,0.1)" }}
                >
                  <Sparkles size={16} className="text-black animate-pulse" />
                  Upgrade to Volt
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
                >
                  Compare Tiers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Tiers Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full max-w-lg bg-white/[0.04] backdrop-blur-md rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
            style={{ border: "1px solid transparent", backgroundClip: "padding-box" }}
          >
            <div
              className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, #72F1B8 0%, hsl(168 100% 45%) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
                borderRadius: "1rem",
              }}
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X size={16} className="text-white/50" />
            </button>

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <GoldHummm size={28} pulse showLabel />
                <h2 className="text-lg font-black text-white">Compare Tiers</h2>
              </div>

              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-3 bg-white/5 px-4 py-3 border-b border-white/10">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Feature</span>
                  <span className="text-xs font-bold text-white/50 uppercase tracking-widest text-center">Free</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-center bg-gradient-to-r from-white to-lime-400 bg-clip-text text-transparent">Volt</span>
                </div>

                {TIERS.map((tier, i) => (
                  <div key={i} className={`grid grid-cols-3 px-4 py-3 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${i < TIERS.length - 1 ? "border-b border-white/5" : ""}`}>
                    <span className="text-xs text-white/80 font-medium">{tier.feature}</span>
                    <div className="flex justify-center">
                      {tier.free === true ? (
                        <Check size={14} className="text-primary" />
                      ) : tier.free === false ? (
                        <Lock size={12} className="text-white/20" />
                      ) : (
                        <span className="text-[10px] text-[#72F1B8] font-semibold">{tier.free}</span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Check size={14} className="text-[#72F1B8]" />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  window.location.href = "/dashboard/buyer";
                }}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all"
                style={{ boxShadow: "0 0 20px rgba(114,241,184,0.3), 0 0 60px rgba(114,241,184,0.1)" }}
              >
                <GoldHummm size={16} pulse={false} />
                Unlock Volt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
