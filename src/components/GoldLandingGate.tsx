import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Crown, Sparkles, X, Lock, Check } from "lucide-react";
import GoldHummm from "./GoldHummm";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "./Navbar";
import SEOHead from "./SEOHead";

const TIERS = [
  { feature: "AI Rental Valuation", free: true, volt: true },
  { feature: "Local Comparable Data", free: true, volt: true },
  { feature: "National Yield Data", free: false, volt: true },
  { feature: "Full Legal Compliance Engine", free: false, volt: true },
  { feature: "AI Negotiation Emails (Unlimited)", free: false, volt: true },
  { feature: "Multilingual Agent (40+ Languages)", free: "3 credits", volt: true },
  { feature: "Deep-Market Intelligence Reports", free: false, volt: true },
  { feature: "Exit Strategy & AI Management", free: false, volt: true },
];

interface GoldLandingGateProps {
  title: string;
  subtitle: string;
  previewContent?: React.ReactNode;
  seoTitle?: string;
  seoDescription?: string;
}

export default function GoldLandingGate({
  title,
  subtitle,
  previewContent,
  seoTitle,
  seoDescription,
}: GoldLandingGateProps) {
  const { isGold, isLoggedIn } = useHumm();
  const navigate = useNavigate();
  const [showTiers, setShowTiers] = useState(false);

  if (isGold) return null;

  return (
    <div className="min-h-screen bg-background">
      {seoTitle && (
        <SEOHead title={seoTitle} description={seoDescription || ""} />
      )}
      <Navbar />

      <div className="relative">
        {previewContent && (
          <div className="relative">
            <div className="max-h-[60vh] overflow-hidden">
              {previewContent}
            </div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 15%, hsl(var(--background) / 0.5) 40%, hsl(var(--background)) 75%)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />
          </div>
        )}

        <div
          className={`${previewContent ? "absolute inset-0" : ""} flex items-center justify-center min-h-[70vh] px-4 pt-24`}
        >
          <div className="w-full max-w-lg">
            {/* ── Glassmorphism card with Volt→Teal gradient border ── */}
            <div
              className="relative rounded-2xl bg-white/[0.04] backdrop-blur-md p-10 text-center shadow-2xl"
              style={{
                border: "1px solid transparent",
                backgroundClip: "padding-box",
              }}
            >
              {/* Gradient border ring: Volt → Teal */}
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

              {/* Soft inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#72F1B8]/[0.03] via-transparent to-primary/[0.03] pointer-events-none" />

              <div className="relative z-10">
              <div className="flex justify-center mb-4">
                  <GoldHummm size={40} pulse showLabel />
                </div>

                {/* Badge: outline-only */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#72F1B8]/40 bg-transparent mb-4">
                  <Crown size={12} className="text-[#72F1B8]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#72F1B8]/90">
                    Hummm Exclusive
                  </span>
                </div>

                <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                  {title}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed mb-8 max-w-sm mx-auto">
                  {subtitle}
                </p>

                <div className="space-y-3">
                  {/* Solid Volt CTA with neon glow */}
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate("/auth");
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all group"
                    style={{
                      boxShadow: "0 0 20px rgba(114,241,184,0.3), 0 0 60px rgba(114,241,184,0.1)",
                    }}
                  >
                    <Sparkles size={16} className="text-black animate-pulse" />
                    {isLoggedIn
                      ? "Upgrade to Founder Access — £0 Today"
                      : "Create Free Account & Upgrade — £0"}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>

                  <p className="text-[10px] text-white/50">
                    Founder Access Status: 90-day free access to all premium features.
                    Limited to first 500 users.
                  </p>
                </div>

                <button
                  onClick={() => setShowTiers(true)}
                  className="mt-4 text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
                >
                  Compare Free vs Volt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier comparison modal ── */}
      {showTiers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTiers(false)}
          />
          <div
            className="relative w-full max-w-lg bg-white/[0.04] backdrop-blur-md rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
            style={{
              border: "1px solid transparent",
              backgroundClip: "padding-box",
            }}
          >
            {/* Gradient border */}
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
              onClick={() => setShowTiers(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X size={16} className="text-white/50" />
            </button>

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <GoldHummm size={28} pulse showLabel />
                <h2 className="text-lg font-black text-white">
                  Compare Tiers
                </h2>
              </div>

              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-3 bg-white/5 px-4 py-3 border-b border-white/10">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    Feature
                  </span>
                  <span className="text-xs font-bold text-white/50 uppercase tracking-widest text-center">
                    Free
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-center bg-gradient-to-r from-white to-lime-400 bg-clip-text text-transparent">
                    Volt
                  </span>
                </div>

                {TIERS.map((tier, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-3 px-4 py-3 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${i < TIERS.length - 1 ? "border-b border-white/5" : ""}`}
                  >
                    <span className="text-xs text-white/80 font-medium">
                      {tier.feature}
                    </span>
                    <div className="flex justify-center">
                      {tier.free === true ? (
                        <Check size={14} className="text-primary" />
                      ) : tier.free === false ? (
                        <Lock size={12} className="text-white/20" />
                      ) : (
                        <span className="text-[10px] text-[#72F1B8] font-semibold">
                          {tier.free}
                        </span>
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
                  setShowTiers(false);
                  if (!isLoggedIn) {
                    navigate("/auth");
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all"
                style={{
                  boxShadow: "0 0 20px rgba(114,241,184,0.3), 0 0 60px rgba(114,241,184,0.1)",
                }}
              >
                <GoldHummm size={16} pulse={false} />
                Upgrade to Founder Access — £0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
