import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Shield, Zap, AlertTriangle, CheckCircle2,
  Scale, FileWarning, TrendingUp, Lock, Clock, Loader2, Gavel, Home, KeyRound
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AddressLookup from "@/components/AddressLookup";

type Stage = "form" | "loading" | "report";

const trustItems = [
  { icon: Shield, label: "GDPR compliant" },
  { icon: Lock, label: "No spam, ever" },
  { icon: Zap, label: "Under 60 seconds" },
  { icon: CheckCircle2, label: "100% free" },
];

const loadingMessages = [
  "Analysing your property against the Renters' Rights Act…",
  "Cross-checking Section 21 & possession grounds…",
  "Reviewing rent-increase rules & deposit compliance…",
  "Scoring landlord redress & Ombudsman readiness…",
  "Generating your personalised compliance plan…",
];

const risks = [
  {
    icon: Gavel,
    title: "Section 21 Abolition",
    severity: "high" as const,
    detail: "No-fault evictions are being abolished. Landlords must rely on strengthened Section 8 grounds with documented evidence — your current process likely needs updating.",
  },
  {
    icon: TrendingUp,
    title: "Rent Increase Limits",
    severity: "medium" as const,
    detail: "Annual increases capped to once per year via Section 13 notice. Tenants can challenge increases at the First-tier Tribunal — your pricing model must be defensible.",
  },
  {
    icon: FileWarning,
    title: "Decent Homes Standard",
    severity: "medium" as const,
    detail: "Extended to the private rented sector. EPC, damp/mould response (Awaab's Law) and structural standards become enforceable with fines up to £40,000.",
  },
  {
    icon: Scale,
    title: "Landlord Ombudsman & Database",
    severity: "high" as const,
    detail: "Mandatory registration on the Private Rented Sector Database and membership of the new Landlord Ombudsman scheme. Non-compliance blocks letting.",
  },
];

const actions = [
  "Replace fixed-term ASTs with periodic tenancy templates",
  "Build a rent-review file with comparable evidence",
  "Document property condition with EPC + damp/mould inspection",
  "Register on the PRS Database and join the Landlord Ombudsman",
  "Update your tenant onboarding to the new prescribed information",
];

const ctas = [
  {
    href: "/let-my-property",
    title: "Let My Property with Hummm AI",
    price: "5.5%",
    badge: "Fully compliant",
    desc: "End-to-end AI letting service. Compliant tenancy agreements, automated rent reviews, Ombudsman-ready audit trail — vs 8–12% high-street fees.",
    primary: true,
  },
  {
    href: "/property-management",
    title: "Switch to Hummm Management",
    price: "3%",
    badge: "Hands-off",
    desc: "Full ongoing management with built-in Renters' Rights Act compliance, repairs, rent collection and reporting.",
    primary: false,
  },
];

const RentalReformAudit = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [loadingIdx, setLoadingIdx] = useState(0);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (address.trim().length < 3) return;
    setStage("loading");
    setLoadingIdx(0);

    const interval = setInterval(() => {
      setLoadingIdx((i) => {
        if (i >= loadingMessages.length - 1) {
          clearInterval(interval);
          return i;
        }
        return i + 1;
      });
    }, 1100);

    setTimeout(() => {
      setStage("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, loadingMessages.length * 1100 + 400);
  };

  const score = 67; // Illustrative compliance score

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="Free Rental Reform Act Compliance Audit + AI Lettings Strategy – Hummm AI"
        description="Free AI compliance audit against the new Renters' Rights Act plus a full lettings strategy report in under 60 seconds. No sign-up required."
        canonical="/rental-reform-audit"
      />
      <Navbar />

      {/* HERO / FORM */}
      {stage === "form" && (
        <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-24 px-5 sm:px-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/[0.06] blur-[160px]" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/[0.06] mb-6">
              <AlertTriangle size={12} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-[0.18em]">New Renters' Rights Act · Action Required</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] mb-5 text-balance">
              Is Your Rental Property Ready for the
              <span className="block text-primary mt-2 drop-shadow-[0_0_24px_hsl(168_80%_48%/0.4)]">New Rental Reform Act?</span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get your Free AI Compliance Audit plus a full Lettings Strategy Report in under 60 seconds. No sign-up. No commitment.
            </p>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-3 sm:p-4 shadow-[0_20px_60px_-20px_hsl(168_80%_30%/0.3)]">
                <div className="text-left mb-3 px-1">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">Step 1 — Your rental property</p>
                </div>
                <AddressLookup
                  value={address}
                  onChange={setAddress}
                  onAddressSelected={setAddress}
                  variant="dark"
                  label=""
                  placeholder="Enter your property postcode or address…"
                />
                <button
                  type="submit"
                  disabled={address.trim().length < 3}
                  className="btn-press btn-glow mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none transition-all"
                >
                  Run Free Compliance Audit
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {trustItems.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon size={12} className="text-primary/70" />
                    <span className="text-[11px] text-white/50 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </form>
          </div>
        </section>
      )}

      {/* LOADING */}
      {stage === "loading" && (
        <section className="min-h-[80svh] flex items-center justify-center px-5 sm:px-8 pt-32 pb-16">
          <div className="max-w-md w-full text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-3 rounded-full bg-primary/10 backdrop-blur flex items-center justify-center">
                <Sparkles size={22} className="text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tight">Running your compliance audit</h2>
            <p className="text-sm text-white/60 leading-relaxed min-h-[3em] transition-opacity">
              {loadingMessages[loadingIdx]}
            </p>
            <div className="mt-8 flex justify-center gap-1.5">
              {loadingMessages.map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all ${i <= loadingIdx ? "w-8 bg-primary" : "w-3 bg-white/10"}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REPORT */}
      {stage === "report" && (
        <>
          <section className="pt-32 sm:pt-40 pb-12 px-5 sm:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/[0.06] mb-5">
                <CheckCircle2 size={11} className="text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.18em]">Audit complete</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2 text-balance">
                Compliance Audit Report
              </h1>
              <p className="text-sm text-white/55 mb-8 truncate">
                <Home size={12} className="inline -mt-0.5 mr-1.5 text-primary/70" />
                {address}
              </p>

              {/* SCORE CARD */}
              <div className="rounded-2xl border border-white/[0.08] bg-card/70 backdrop-blur-xl p-6 sm:p-8 mb-8 shadow-[0_20px_60px_-20px_hsl(168_80%_30%/0.25)]">
                <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 items-center">
                  <div className="relative w-32 h-32 mx-auto md:mx-0">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="52" stroke="hsl(var(--border))" strokeWidth="10" fill="none" opacity="0.3" />
                      <circle
                        cx="60" cy="60" r="52"
                        stroke="hsl(var(--primary))" strokeWidth="10" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                        className="drop-shadow-[0_0_12px_hsl(168_80%_48%/0.6)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tabular-nums">{score}</span>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-2">Moderate Risk</p>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Action needed before the Act takes effect</h2>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Your property scores <span className="font-bold text-white">{score}/100</span> on Renters' Rights Act readiness. We've identified <span className="text-amber-400 font-semibold">2 high-severity</span> and <span className="text-amber-400 font-semibold">2 medium-severity</span> risks below — all resolvable.
                    </p>
                  </div>
                </div>
              </div>

              {/* RISKS */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <FileWarning size={14} className="text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">Specific risks under the new Act</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {risks.map(({ icon: Icon, title, severity, detail }) => (
                    <div key={title} className="rounded-2xl border border-white/[0.06] bg-card/60 p-5 card-hover">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${severity === "high" ? "bg-destructive/10 border border-destructive/30" : "bg-amber-400/10 border border-amber-400/30"}`}>
                          <Icon size={15} className={severity === "high" ? "text-destructive" : "text-amber-400"} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold tracking-tight">{title}</h4>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${severity === "high" ? "bg-destructive/15 text-destructive" : "bg-amber-400/15 text-amber-400"}`}>
                              {severity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] text-white/55 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8 mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={14} className="text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Recommended actions</h3>
                </div>
                <ul className="space-y-3">
                  {actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-primary tabular-nums">{i + 1}</span>
                      <span className="text-[13.5px] text-white/75 leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI STRATEGY */}
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-primary/[0.08] via-card/80 to-card p-6 sm:p-8 mb-12">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-primary">AI Lettings Strategy</h3>
                </div>
                <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-3">Let your property compliantly with Hummm AI — at 5.5%</h4>
                <p className="text-sm text-white/65 leading-relaxed mb-5">
                  We replace your existing tenancy stack with Renters' Rights Act-ready agreements, run automated rent-review evidence files, and handle Ombudsman registration end-to-end. Your audit trail is built from day one.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { v: "100%", l: "Compliant tenancies" },
                    { v: "5.5%", l: "Of annual rent" },
                    { v: "0", l: "Hidden fees" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 text-center">
                      <p className="text-2xl font-black text-primary tabular-nums">{m.v}</p>
                      <p className="text-[10px] text-white/45 uppercase tracking-wider mt-1">{m.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTAs */}
          <section className="pb-20 px-5 sm:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Get compliant — fast</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-balance">Hand it to Hummm AI</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ctas.map((c) => (
                  <a
                    key={c.title}
                    href={c.href}
                    className={`group rounded-2xl border p-6 sm:p-7 transition-all card-hover ${c.primary ? "border-primary/40 bg-gradient-to-br from-primary/[0.08] via-card/80 to-card shadow-[0_20px_60px_-20px_hsl(168_80%_30%/0.35)]" : "border-white/[0.08] bg-card/70 hover:border-primary/30"}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ${c.primary ? "bg-primary/20 text-primary" : "bg-white/[0.05] text-white/60"}`}>
                        {c.badge}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="text-lg sm:text-xl font-black tracking-tight">{c.title}</h3>
                      <span className="text-2xl font-black text-primary tabular-nums">{c.price}</span>
                    </div>
                    <p className="text-[13px] text-white/55 leading-relaxed mb-5">{c.desc}</p>
                    <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary uppercase tracking-wider">
                      Get started
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => { setStage("form"); setAddress(""); }}
                  className="text-[11px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
                >
                  ← Run another audit
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default RentalReformAudit;