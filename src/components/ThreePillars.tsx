import { Search, ScanEye, Handshake, Star, ShieldAlert, CircleDot, ArrowRight, TrendingDown, Zap, FileCheck, Globe, Shield, BadgeCheck } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";

const MINT = "#72F1B8";
const MINT_DARK = "#2FD1B5";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const GREEN = "#22C55E";

const ThreePillars = () => (
  <section className="relative py-16 sm:py-24 lg:py-28 bg-background">
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${MINT}06 0%, transparent 60%)` }}
    />

    <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
      <AnimatedSection>
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: MINT }}>
          The 3-Pillar Savant Engine
        </p>
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-black mb-4 tracking-tight text-balance" style={{ color: "#fff" }}>
          Search. Audit. Negotiate. Anywhere in the World.
        </h2>
        <p className="text-center text-sm sm:text-base max-w-xl mx-auto mb-12 sm:mb-16" style={{ color: "rgba(255,255,255,0.35)" }}>
          Every property deal has three phases. We automate all of them — across jurisdictions. HQ Singapore · UK · USA · SE Asia.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-5">
        {/* PILLAR 1 — SEARCH */}
        <AnimatedSection delay={0}>
          <div
            className="group relative rounded-2xl p-6 sm:p-7 lg:p-8 transition-all duration-300 h-full flex flex-col"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid rgba(114,241,184,0.08)` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${MINT}30`; e.currentTarget.style.boxShadow = `0 0 40px ${MINT}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(114,241,184,0.08)`; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span className="absolute top-4 right-6 text-5xl sm:text-6xl font-black pointer-events-none select-none" style={{ color: `${MINT}06` }}>1</span>

            <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-4 sm:mb-5" style={{ background: `linear-gradient(135deg, ${MINT}15, ${MINT_DARK}10)`, border: `1px solid ${MINT}20` }}>
              <Search size={20} style={{ color: MINT }} />
            </div>

            <h3 className="text-lg sm:text-xl font-black mb-1 tracking-tight" style={{ color: "#fff" }}>Search.</h3>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 sm:mb-4" style={{ color: MINT }}>Smart Curation</p>

            <p className="text-[13px] sm:text-sm leading-relaxed mb-5 sm:mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Aggregates listings from Rightmove, Zillow, PropertyGuru, Idealista and more. Shows you the <span className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Top 3 Picks</span> based on your financial goals — in any market.
            </p>

            <div className="mt-auto space-y-2">
              {[
                { label: "High Yield", icon: TrendingDown, color: GREEN, tag: "UK" },
                { label: "Tax Benefit", icon: Star, color: MINT, tag: "USA" },
                { label: "Freehold", icon: Zap, color: AMBER, tag: "SE Asia" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <item.icon size={13} style={{ color: item.color }} />
                  <span className="text-[11px] sm:text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: MINT, backgroundColor: `${MINT}10` }}>{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* PILLAR 2 — AUDIT */}
        <AnimatedSection delay={120}>
          <div
            className="group relative rounded-2xl p-6 sm:p-7 lg:p-8 transition-all duration-300 h-full flex flex-col"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid rgba(114,241,184,0.08)` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${MINT}30`; e.currentTarget.style.boxShadow = `0 0 40px ${MINT}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(114,241,184,0.08)`; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span className="absolute top-4 right-6 text-5xl sm:text-6xl font-black pointer-events-none select-none" style={{ color: `${MINT}06` }}>2</span>

            <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-4 sm:mb-5" style={{ background: `linear-gradient(135deg, ${MINT}15, ${MINT_DARK}10)`, border: `1px solid ${MINT}20` }}>
              <ScanEye size={20} style={{ color: MINT }} />
            </div>

            <h3 className="text-lg sm:text-xl font-black mb-1 tracking-tight" style={{ color: "#fff" }}>Audit.</h3>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 sm:mb-4" style={{ color: MINT }}>Savant Logic</p>

            <p className="text-[13px] sm:text-sm leading-relaxed mb-5 sm:mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              1.2-second deep-scan with country-specific checks. Compares pricing, scans for deal-breakers, and validates compliance across jurisdictions.
            </p>

            <div className="mt-auto space-y-2">
              {[
                { label: "Notary Readiness", color: GREEN, status: "Clear", icon: BadgeCheck },
                { label: "Foreign Ownership Check", color: AMBER, status: "Review", icon: Globe },
                { label: "Currency Risk", color: RED, status: "Alert", icon: Shield },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2.5">
                    <item.icon size={12} style={{ color: item.color }} />
                    <span className="text-[11px] sm:text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>{item.status}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-3 rounded-lg mt-1" style={{ backgroundColor: `${MINT}08`, border: `1px solid ${MINT}15` }}>
                <span className="text-[11px] sm:text-xs font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Fair Price</span>
                <span className="text-sm sm:text-base font-black tabular-nums" style={{ color: MINT }}>$1,250,000</span>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* PILLAR 3 — HANDLE */}
        <AnimatedSection delay={240}>
          <div
            className="group relative rounded-2xl p-6 sm:p-7 lg:p-8 transition-all duration-300 h-full flex flex-col"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid rgba(114,241,184,0.08)` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${MINT}30`; e.currentTarget.style.boxShadow = `0 0 40px ${MINT}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(114,241,184,0.08)`; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span className="absolute top-4 right-6 text-5xl sm:text-6xl font-black pointer-events-none select-none" style={{ color: `${MINT}06` }}>3</span>

            <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-4 sm:mb-5" style={{ background: `linear-gradient(135deg, ${MINT}15, ${MINT_DARK}10)`, border: `1px solid ${MINT}20` }}>
              <Handshake size={20} style={{ color: MINT }} />
            </div>

            <h3 className="text-lg sm:text-xl font-black mb-1 tracking-tight" style={{ color: "#fff" }}>Handle.</h3>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 sm:mb-4" style={{ color: MINT }}>AI Negotiator</p>

            <p className="text-[13px] sm:text-sm leading-relaxed mb-5 sm:mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Autonomous negotiation across borders. AI drafts the offer, verifies funds, and manages the deal — from London to Singapore to New York.
            </p>

            <div className="mt-auto space-y-2">
              {[
                { label: "Analyzing US Escrow terms..." },
                { label: "Verifying Singapore Title Deeds..." },
                { label: "UK Completion timeline set" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <FileCheck size={13} style={{ color: GREEN }} />
                  <span className="text-[11px] sm:text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                </div>
              ))}

              <Link
                to="/negotiate-for-me"
                className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3.5 rounded-xl text-[13px] sm:text-sm font-bold transition-all min-h-[48px] active:scale-[0.98]"
                style={{ background: `linear-gradient(to right, ${MINT}, ${MINT_DARK})`, color: "#000000", boxShadow: `0 0 24px ${MINT}18` }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 40px ${MINT}30`)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 24px ${MINT}18`)}
              >
                Hummm
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default ThreePillars;
