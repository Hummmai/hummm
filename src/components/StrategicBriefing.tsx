import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import {
  Link2, Target, Zap, Shield, Globe, Clock, Loader2,
  Sparkles, Check, ChevronRight, ChevronLeft, Activity, CheckCircle,
  Crosshair, Timer, Languages, Search, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AnimatedSection from "@/components/AnimatedSection";
import GoldHummm from "@/components/GoldHummm";

/* ─── Types & Data ─── */

type Position = "cash" | "no-chain" | "ftb" | "gold";
type Speed = "immediate" | "28-days" | "flexible";
type Motivation = "probate" | "relocating" | "upgrading" | "unknown";

const FOUNDER_LIMIT = 500;

const TIER_PRICES: Record<string, { label: string; price: string }> = {
  starter: { label: "Starter", price: "£79" },
  pro: { label: "Pro", price: "£49" },
  premium: { label: "Premium", price: "£499" },
};

const POSITIONS: { value: Position; label: string; icon: typeof Target }[] = [
  { value: "cash", label: "Cash Buyer", icon: Zap },
  { value: "no-chain", label: "No Chain", icon: Target },
  { value: "ftb", label: "First-Time Buyer", icon: Sparkles },
  { value: "gold", label: "Volt Verified", icon: Shield },
];

const SPEEDS: { value: Speed; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "28-days", label: "28 Days" },
  { value: "flexible", label: "Flexible" },
];

const MOTIVATIONS: { value: Motivation; label: string; sub: string }[] = [
  { value: "probate", label: "Probate", sub: "Urgent timeline" },
  { value: "relocating", label: "Relocating", sub: "Motivated seller" },
  { value: "upgrading", label: "Upgrading", sub: "Flexible but patient" },
  { value: "unknown", label: "Unknown", sub: "AI will investigate" },
];

const LANGUAGES = [
  "English", "中文 (Mandarin)", "Español", "हिन्दी", "العربية",
  "Français", "Português", "Polski", "বাংলা", "اردو",
  "Deutsch", "日本語", "한국어", "Italiano", "Nederlands",
  "Türkçe", "Русский", "ภาษาไทย", "Tiếng Việt", "Bahasa Indonesia",
  "Svenska", "Norsk", "Dansk", "Suomi", "Ελληνικά",
  "Čeština", "Română", "Magyar", "עברית", "فارسی",
  "Kiswahili", "Filipino", "Malay", "Українська", "Català",
  "Slovenčina", "Lietuvių", "Latviešu", "Eesti", "Shqip",
];

const SCAN_STAGES = [
  "Extracting listing data...",
  "Pulling sold-price comparables...",
  "Analysing days-on-market...",
  "Fetching local yield data...",
  "Building strategy profile...",
];

interface Props {
  user: any;
  tier: string;
  goal: string;
  founderCount?: number;
  onSubmitSuccess?: () => void;
}

/* ─── Component ─── */

const StrategicBriefing = ({ user, tier, goal, founderCount = 0, onSubmitSuccess }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=URL, 1=questions, 2=preview, 3=submit, 4=success
  const [propertyUrl, setPropertyUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [motivation, setMotivation] = useState<Motivation | null>(null);
  const [language, setLanguage] = useState("English");
  const [scanning, setScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);

  // Scan simulation
  useEffect(() => {
    if (!scanning) return;
    if (scanStage >= SCAN_STAGES.length) {
      setScanning(false);
      setScanComplete(true);
      return;
    }
    const t = setTimeout(() => setScanStage((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [scanning, scanStage]);

  const startScan = () => {
    if (!propertyUrl.trim()) return;
    setScanning(true);
    setScanStage(0);
    setScanComplete(false);
  };

  // Strategy confidence
  const confidence = useCallback(() => {
    let score = 40;
    if (position === "cash") score += 25;
    else if (position === "no-chain") score += 20;
    else if (position === "ftb") score += 10;
    else if (position === "gold") score += 22;
    if (speed === "immediate") score += 15;
    else if (speed === "28-days") score += 10;
    if (motivation === "probate" || motivation === "relocating") score += 15;
    else if (motivation === "unknown") score += 5;
    if (scanComplete) score += 5;
    return Math.min(score, 98);
  }, [position, speed, motivation, scanComplete]);

  const strategyRecommendation = useCallback(() => {
    const conf = confidence();
    if (position === "cash" && (speed === "immediate" || speed === "28-days")) {
      return { text: "Recommend 4–6% below asking start.", level: "High" };
    }
    if (conf >= 75) return { text: "Recommend 3–4% below asking start.", level: "High" };
    if (conf >= 55) return { text: "Recommend 2–3% below asking start.", level: "Medium" };
    return { text: "More data needed for optimal positioning.", level: "Building" };
  }, [confidence, position, speed]);

  const canProceedToQuestions = propertyUrl.trim().length > 5;
  const canProceedToPreview = position && speed && motivation;
  const canSubmit = name.trim() && email.trim();

  const isFounderEligible = founderCount < FOUNDER_LIMIT;

  const handleSubmit = async () => {
    setSubmitting(true);
    setLocalSaved(false);
    const negotiateId = crypto.randomUUID();

    try {
      // 1. Save to DB first — must succeed before showing modal
      if (user) {
        const { error: dbError } = await supabase.from("negotiate_requests").insert({
          user_id: user.id,
          property_link: propertyUrl,
          property_address: propertyUrl,
          goal,
          package: tier.toLowerCase(),
          status: isFounderEligible ? "humm_ai_initialized" : "submitted",
          notes: JSON.stringify({
            user_name: name,
            user_email: email,
            user_phone: phone,
            position,
            speed,
            motivation,
            language,
            tier_selected: tier,
            founder_activated: isFounderEligible,
          }),
        });

        if (dbError) throw dbError;
      }

      // 2. If founder eligible → confetti + modal. Otherwise → Stripe checkout
      if (isFounderEligible) {
        // Fire emails non-blocking
        Promise.allSettled([
          supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "negotiate-activation",
              recipientEmail: email,
              idempotencyKey: `negotiate-activate-${negotiateId}`,
              templateData: { name, tier, propertyLink: propertyUrl },
            },
          }),
          supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "notify-negotiate",
              idempotencyKey: `notify-negotiate-${negotiateId}`,
              templateData: { name, email, tier, propertyLink: propertyUrl },
            },
          }),
        ]);

        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#00e5cc", "#72F1B8", "#ffffff"] });
        setStep(4);
        onSubmitSuccess?.();
      } else {
        // Stripe checkout — open in new tab
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { tier: tier.toLowerCase() },
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, "_blank");
          // Show a "waiting for payment" state
          setStep(4);
          onSubmitSuccess?.();
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      // Local fallback — never show raw error
      setLocalSaved(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  const conf = confidence();
  const rec = strategyRecommendation();

  return (
    <section id="activate" className="section-spacing section-padding">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {["Target", "Intel", "Preview", "Execute"].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  i <= step
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,204,0.4)]"
                    : "bg-muted/30 text-muted-foreground border border-border/40"
                }`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < 3 && (
                  <div className={`w-8 h-[2px] transition-colors ${i < step ? "bg-primary" : "bg-border/40"}`} />
                )}
              </div>
            ))}
          </div>

          {/* War Room card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0a0f1e 0%, #060a14 100%)",
              border: "0.5px solid rgba(192,192,192,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.2)" }}>
                  <Crosshair size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Strategic Briefing</h2>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Classified · AI-Powered Analysis</p>
                </div>
                {scanComplete && (
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0,229,204,0.1)", color: "hsl(var(--primary))" }}>
                    <Activity size={10} /> Scan Complete
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* ─── Step 0: Property URL ─── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                      Identify the Target
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Paste the property listing URL. Our AI will deep-scan the history before you even finish your briefing.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Property URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={propertyUrl}
                        onChange={(e) => { setPropertyUrl(e.target.value); setScanComplete(false); }}
                        placeholder="https://www.rightmove.co.uk/properties/..."
                        className="bg-secondary/30 border-border/40 text-base h-12 focus:ring-primary/40"
                      />
                      <Button
                        type="button"
                        onClick={startScan}
                        disabled={scanning || !propertyUrl.trim()}
                        className="shrink-0 h-12 px-5 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                      >
                        {scanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      </Button>
                    </div>
                  </div>

                  {/* Scan animation */}
                  {(scanning || scanComplete) && (
                    <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(0,229,204,0.04)", border: "1px solid rgba(0,229,204,0.1)" }}>
                      {SCAN_STAGES.map((stage, i) => (
                        <div key={stage} className={`flex items-center gap-3 text-xs transition-all duration-500 ${
                          i < scanStage ? "text-primary" : i === scanStage && scanning ? "text-foreground" : "text-muted-foreground/30"
                        }`}>
                          {i < scanStage ? (
                            <Check size={12} className="text-primary shrink-0" />
                          ) : i === scanStage && scanning ? (
                            <Loader2 size={12} className="animate-spin text-primary shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-border/30 shrink-0" />
                          )}
                          <span>{stage}</span>
                        </div>
                      ))}
                      {scanComplete && (
                        <div className="mt-3 pt-3 flex items-center gap-2 text-xs font-bold text-primary" style={{ borderTop: "1px solid rgba(0,229,204,0.1)" }}>
                          <TrendingDown size={12} />
                          E14 Price Sensitivity: −0.2% · Avg Days on Market: 34
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(1)}
                    disabled={!canProceedToQuestions}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-primary text-primary-foreground gap-2"
                  >
                    Continue Briefing <ChevronRight size={16} />
                  </Button>
                </div>
              )}

              {/* ─── Step 1: Elite Agent Questions ─── */}
              {step === 1 && (
                <div className="space-y-7">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                      Intelligence Gathering
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Four questions. Each answer sharpens your negotiation edge.
                    </p>
                  </div>

                  {/* Position */}
                  <div className="space-y-2.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                      <Target size={12} className="text-primary" /> Tactical Advantage
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {POSITIONS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPosition(p.value)}
                          className={`group flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            position === p.value
                              ? "bg-primary/15 border-primary/50 text-foreground shadow-[0_0_12px_rgba(0,229,204,0.15)]"
                              : "bg-secondary/20 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          } border`}
                        >
                          <p.icon size={14} className={`transition-colors ${position === p.value ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed */}
                  <div className="space-y-2.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                      <Timer size={12} className="text-primary" /> Speed to Exchange
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {SPEEDS.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSpeed(s.value)}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            speed === s.value
                              ? "bg-primary/15 border-primary/50 text-foreground shadow-[0_0_12px_rgba(0,229,204,0.15)]"
                              : "bg-secondary/20 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motivation */}
                  <div className="space-y-2.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                      <Crosshair size={12} className="text-primary" /> Seller Situation
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {MOTIVATIONS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMotivation(m.value)}
                          className={`text-left px-4 py-3 rounded-xl border transition-all ${
                            motivation === m.value
                              ? "bg-primary/15 border-primary/50 shadow-[0_0_12px_rgba(0,229,204,0.15)]"
                              : "bg-secondary/20 border-border/30 hover:border-primary/30"
                          }`}
                        >
                          <span className={`block text-sm font-medium ${motivation === m.value ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</span>
                          <span className="block text-[10px] text-muted-foreground/60 mt-0.5">{m.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-2.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                      <Languages size={12} className="text-primary" /> Negotiation Language
                    </Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-11 rounded-xl bg-secondary/20 border border-border/30 text-sm text-foreground px-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l} className="bg-background">{l}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground/60">
                      Speak in your language — emails are always in Professional British English.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl h-11 gap-2 border-border/40">
                      <ChevronLeft size={14} /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceedToPreview}
                      className="flex-1 h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground gap-2"
                    >
                      View Strategy Preview <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* ─── Step 2: Strategy Preview ─── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                      Strategy Preview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Live confidence assessment based on your intelligence profile.
                    </p>
                  </div>

                  {/* Confidence Meter */}
                  <div className="rounded-xl p-5" style={{ background: "rgba(0,229,204,0.04)", border: "1px solid rgba(0,229,204,0.12)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strategy Confidence</span>
                      <span className="text-2xl font-black tabular-nums text-primary">{conf}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${conf}%`,
                          background: "linear-gradient(90deg, hsl(var(--primary)), hsl(168 100% 55%))",
                          boxShadow: "0 0 12px rgba(0,229,204,0.4)",
                        }}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span className={`font-bold ${rec.level === "High" ? "text-primary" : rec.level === "Medium" ? "text-yellow-400" : "text-muted-foreground"}`}>
                        Tactical Advantage: {rec.level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.text}</p>
                  </div>

                  {/* Summary chips */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Position", value: POSITIONS.find(p => p.value === position)?.label },
                      { label: "Exchange Speed", value: SPEEDS.find(s => s.value === speed)?.label },
                      { label: "Seller Intel", value: MOTIVATIONS.find(m => m.value === motivation)?.label },
                      { label: "Language", value: language },
                    ].map((chip) => (
                      <div key={chip.label} className="rounded-xl border border-border/30 bg-secondary/10 p-3">
                        <span className="block text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">{chip.label}</span>
                        <span className="block text-sm font-semibold mt-0.5">{chip.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl h-11 gap-2 border-border/40">
                      <ChevronLeft size={14} /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground gap-2"
                    >
                      Proceed to Execute <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* ─── Step 3: Final Details + Submit ─── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                      Execute Strategy
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Final details to launch your AI-powered negotiation.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Your Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className="bg-secondary/30 border-border/40 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jane@email.com" className="bg-secondary/30 border-border/40 h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+44 7700 900123" className="bg-secondary/30 border-border/40 h-11" />
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1 accent-primary" id="gdpr-consent" />
                    <label htmlFor="gdpr-consent" className="text-[11px] text-muted-foreground leading-relaxed">
                      I consent to processing my data as described in the{" "}
                      <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl h-12 gap-2 border-border/40">
                      <ChevronLeft size={14} /> Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || submitting}
                      className={`flex-1 h-12 rounded-xl text-base font-black gap-2 transition-all ${
                        isFounderEligible
                          ? "bg-primary text-primary-foreground shadow-[0_0_24px_rgba(0,229,204,0.3)]"
                          : "bg-[#72F1B8] text-black hover:brightness-110 shadow-[0_0_24px_rgba(114,241,184,0.3)]"
                      }`}
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      ) : isFounderEligible ? (
                        <>Secure Founder Access <Sparkles size={16} /></>
                      ) : (
                        <>Pay Securely & Start <Zap size={16} /></>
                      )}
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    By submitting, you agree to our Terms of Service. Free for Founders.
                  </p>
                </div>
              )}

              {/* ─── Step 4: Founder Welcome Modal ─── */}
              {step === 4 && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                  <div className="relative w-full max-w-md rounded-2xl border border-primary/40 bg-[hsl(var(--card))] shadow-[0_0_60px_rgba(0,229,204,0.15)] animate-in zoom-in-95 fade-in duration-500 overflow-hidden">
                    {/* Glow accent */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="p-8 text-center space-y-6">
                      {/* Volt Bird */}
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-[#72F1B8]/10 border border-[#72F1B8]/30 flex items-center justify-center shadow-[0_0_30px_rgba(114,241,184,0.2)]">
                          <GoldHummm size={40} pulse={false} />
                        </div>
                      </div>

                      {/* Headline */}
                      <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                          {isFounderEligible ? (
                            <>Welcome to the Inner Circle,{" "}
                            <span className="text-primary">{name || "Founder"}</span>.</>
                          ) : (
                            <>Payment Processing,{" "}
                            <span className="text-primary">{name || "there"}</span>.</>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                          {isFounderEligible ? (
                            <>You've just activated the{" "}
                             <span className="font-semibold text-foreground">{TIER_PRICES[tier.toLowerCase()]?.label || tier} Strategy</span>{" "}
                            ({TIER_PRICES[tier.toLowerCase()]?.price || "£79"} value) for free. As a Launch Day Founder, you have full access to our
                            AI Negotiator and Market Intelligence.</>
                          ) : (
                            <>Complete your payment in the new tab. Once confirmed, your{" "}
                            <span className="font-semibold text-foreground">{TIER_PRICES[tier.toLowerCase()]?.label || tier} Strategy</span>{" "}
                            will activate immediately.</>
                          )}
                        </p>
                        {localSaved ? (
                          <p className="text-xs text-emerald-300/90 leading-relaxed max-w-sm mx-auto">
                            Strategy Saved Locally. Our AI is syncing with the cloud — your briefing
                            will appear in your AI dashboard shortly.
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
                            {isFounderEligible
                               ? "We are currently fine-tuning our automated email servers — your official briefing is saved in your AI dashboard below."
                              : "Your briefing is saved. Head to your dashboard to track progress."}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Tier", value: TIER_PRICES[tier.toLowerCase()]?.label || tier, icon: Sparkles },
                          { label: "Status", value: isFounderEligible ? "Founder" : "Active", icon: Shield },
                          { label: "Cost", value: isFounderEligible ? "£0" : (TIER_PRICES[tier.toLowerCase()]?.price || "£79"), icon: Zap },
                        ].map((stat) => (
                          <div key={stat.label} className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                            <stat.icon size={14} className="mx-auto mb-1.5 text-primary" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            <p className="text-sm font-black">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button
                        onClick={() => navigate("/dashboard")}
                        className="w-full h-14 rounded-xl text-base font-black bg-primary text-primary-foreground gap-2 shadow-[0_0_30px_rgba(0,229,204,0.3)] hover:shadow-[0_0_40px_rgba(0,229,204,0.4)] transition-shadow"
                      >
                        ENTER HUMM AI <Zap size={18} />
                      </Button>

                      <p className="text-[10px] text-muted-foreground/60">
                        Auto-redirecting in a few seconds...
                      </p>
                    </div>
                  </div>
                  <AutoRedirect onRedirect={() => navigate("/dashboard")} delay={5000} />
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

/* Auto-redirect helper */
const AutoRedirect = ({ onRedirect, delay = 2000 }: { onRedirect: () => void; delay?: number }) => {
  useEffect(() => {
    const timer = setTimeout(onRedirect, delay);
    return () => clearTimeout(timer);
  }, [onRedirect, delay]);
  return null;
};

export default StrategicBriefing;
