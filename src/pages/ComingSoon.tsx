import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import hummLogo from "@/assets/humm-logo-transparent.png";
import { Mail, ArrowRight, Search, Sparkles, LayoutDashboard, Shield, Loader2, CheckCircle, KeyRound } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BENEFITS = [
  {
    icon: Search,
    title: "Instant Property Audits & Valuations",
    desc: "Drop any listing link and get a comprehensive AI-powered audit with fair value estimates, risk analysis, and investment metrics in seconds.",
  },
  {
    icon: Sparkles,
    title: "Hummm – Your AI Co-Pilot",
    desc: "Draft emails, handle objections, and negotiate smarter with an AI companion that travels with you through every deal. You stay in control.",
  },
  {
    icon: LayoutDashboard,
    title: "Personal Command Centre",
    desc: "Manage all your audits, negotiations, and property portfolio from one powerful dashboard built for buyers, sellers, investors, and landlords.",
  },
];

const ComingSoon = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-access", {
        body: { name: name.trim(), email: email.trim(), reason: reason.trim() },
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success(data?.message || "Request submitted!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setCheckingCode(true);
    try {
      const { data, error } = await supabase
        .from("early_access_requests")
        .select("*")
        .eq("access_code", trimmed)
        .eq("status", "approved")
        .maybeSingle();

      if (error || !data) {
        toast.error("Invalid access code. Please check and try again.");
        setCheckingCode(false);
        return;
      }

      localStorage.setItem("humm_access_code", trimmed);
      localStorage.setItem("humm_early_access_email", (data as any).email);
      toast.success("Access granted! Welcome to Hummm 🎉");
      navigate("/auth?access=granted", { replace: true });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setCheckingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEOHead
        title="Hummm | The World's Most Powerful Property Expert — Coming Soon"
        description="The smartest way to audit, value, and negotiate property — all in one powerful platform. Request early access today."
      />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-background/70 backdrop-blur-2xl border-b border-border/20">
        <span className="relative inline-flex items-center">
          <img src={hummLogo} alt="Hummm" className="h-8 sm:h-10 w-auto" />
        </span>
        <button
          onClick={() => navigate("/auth")}
          className="px-5 py-2 text-xs font-bold rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all"
        >
          Log in
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-16 min-h-[85vh]">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[700px] h-[700px] -top-40 left-1/2 -translate-x-1/2 rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
          />
          <div
            className="absolute w-[500px] h-[500px] bottom-0 left-1/4 rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
          />
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center">
          {/* Logo + Beta */}
          <div className="relative inline-block mb-8">
            <img
              src={hummLogo}
              alt="Hummm"
              className="h-24 sm:h-36 lg:h-44 w-auto mx-auto drop-shadow-[0_0_60px_hsl(168_100%_45%/0.12)]"
            />
          </div>

          <p className="text-lg sm:text-xl font-semibold text-primary mb-5 tracking-wide">
            Your Friendly AI Property Expert
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto mb-10 text-pretty">
            The smartest way to audit, value, and negotiate property — all in one powerful platform.
          </p>

          {/* ── Tab Switcher ── */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setShowCodeInput(false)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${!showCodeInput ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'}`}
            >
              Request Access
            </button>
            <button
              onClick={() => setShowCodeInput(true)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${showCodeInput ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'}`}
            >
              <KeyRound size={13} /> Enter Code
            </button>
          </div>

          {showCodeInput ? (
            <div className="mx-auto max-w-sm">
              <div className="rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={22} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Enter Your Access Code</h3>
                <p className="text-xs text-muted-foreground mb-5">Enter the unique code you received from the Hummm team.</p>
                <form onSubmit={handleCodeSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="HUMM-XXXX"
                    maxLength={12}
                    className="w-full px-5 py-4 rounded-2xl bg-background border border-border/60 text-center text-lg font-mono font-bold tracking-[0.3em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:shadow-[0_0_24px_-6px_hsl(168_100%_45%/0.25)] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={checkingCode || !code.trim()}
                    className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold rounded-2xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_24px_-4px_hsl(168_100%_45%/0.35)] active:scale-[0.98]"
                  >
                    {checkingCode ? (
                      <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                    ) : (
                      <><ArrowRight size={16} /> Unlock Access</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : submitted ? (
            <div className="mx-auto max-w-sm rounded-3xl border border-primary/30 bg-card/50 backdrop-blur-sm p-8 text-center">
              <CheckCircle size={40} className="text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Request Submitted!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                We'll review your request and send you an access code if approved. Check your email!
              </p>
              <button
                onClick={() => setShowCodeInput(true)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Already have a code? Enter it here →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address *"
                className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
              />
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why you'd like access (e.g. investor, tester, partner)"
                rows={2}
                className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full flex items-center justify-center gap-2.5 px-10 py-4 text-sm font-bold rounded-2xl bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-[0_4px_30px_-4px_hsl(168_100%_45%/0.4)] hover:shadow-[0_8px_40px_-4px_hsl(168_100%_45%/0.55)] active:scale-[0.97] disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                ) : (
                  <><Mail size={18} /> Request Early Access<ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground/50 mt-4">
            Early access is by approval only · We'll send you an access code if approved
          </p>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="relative z-10 px-6 sm:px-10 pb-20">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5 sm:gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 sm:p-7 text-center transition-all hover:border-primary/30 hover:shadow-[0_0_30px_-8px_hsl(168_100%_45%/0.12)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <b.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="relative z-10 px-6 pb-16 text-center">
        <p className="text-sm sm:text-base text-muted-foreground/70 max-w-md mx-auto leading-relaxed italic">
          "We're building the future of property.<br className="hidden sm:block" /> Be one of the first to experience it."
        </p>
      </section>

      {/* ── Trust ── */}
      <section className="relative z-10 px-6 pb-6 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[11px] text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-primary/60" />
            Built by Hummm Technologies
          </span>
          <span className="hidden sm:inline text-primary/20">|</span>
          <span>Beta · Early Access by Approval Only</span>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <Disclaimer />
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border/20 py-6 px-6 text-center mt-4">
        <p className="text-xs text-muted-foreground/60">
          © 2026 Hummm – All rights reserved
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="/privacy-policy" className="text-xs text-muted-foreground/40 hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <span className="text-muted-foreground/20">·</span>
          <span className="text-xs text-muted-foreground/40">Terms</span>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
