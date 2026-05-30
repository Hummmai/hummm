import { useState, useEffect, useMemo, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight, ArrowLeft, Shield, FileText, TrendingUp, Mail, Upload, Download, Calculator } from "lucide-react";
import BulkPortfolioUpload from "@/components/BulkPortfolioUpload";
import ExecutionGateModal from "@/components/ExecutionGateModal";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AddressLookup from "@/components/AddressLookup";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Countdown Timer ─────────────────────────────────────────── */
const TARGET = new Date("2026-05-01T00:00:00Z").getTime();

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TARGET - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/* ── Quiz data ───────────────────────────────────────────────── */
const DECENT_HOMES_CHECKS = [
  "Heating system inspected within the last 12 months",
  "No Category 1 hazards under HHSRS assessment",
  "Kitchen and bathroom in reasonable repair",
  "Adequate insulation and ventilation throughout",
  "Damp and mould issues fully remediated",
  "Electrical installation condition report (EICR) valid",
];

const PERIODIC_OPTIONS = [
  { label: "Yes — all tenancies are already periodic", value: "ready" },
  { label: "Some are — I have a mix of fixed-term and periodic", value: "partial" },
  { label: "No — most are still on fixed-term ASTs", value: "not_ready" },
  { label: "I'm not sure what the difference is", value: "unsure" },
];

/* ── Component ───────────────────────────────────────────────── */
export default function LandlordReform() {
  const countdown = useCountdown();
  const [step, setStep] = useState(0); // 0 = landing, 1-4 = quiz, 5 = email, 6 = report
  const [decentChecks, setDecentChecks] = useState<boolean[]>(new Array(DECENT_HOMES_CHECKS.length).fill(false));
  const [periodicAnswer, setPeriodicAnswer] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<{ low: number; high: number } | null>(null);
  const [currentFeePercent, setCurrentFeePercent] = useState(12);
  const [propertyValue, setPropertyValue] = useState(350000);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showShieldGate, setShowShieldGate] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Step 3: trigger valuation when address is set
  const fetchValuation = async () => {
    if (!postcode) return;
    try {
      const { data } = await supabase.functions.invoke("generate-ai-valuation", {
        body: { address, postcode, property_type: "rental", mode: "rental" },
      });
      if (data?.valuation_low && data?.valuation_high) {
        setValuation({ low: data.valuation_low, high: data.valuation_high });
      }
    } catch {
      // silent — valuation is optional enrichment
    }
  };

  /* ── Compliance score ──────────────────────────────────────── */
  const complianceScore = useMemo(() => {
    const decentScore = decentChecks.filter(Boolean).length / DECENT_HOMES_CHECKS.length;
    const periodicScore = periodicAnswer === "ready" ? 1 : periodicAnswer === "partial" ? 0.5 : 0;
    const rentScore = valuation ? 0.8 : 0.5; // has data = better
    return Math.round(((decentScore * 0.5 + periodicScore * 0.3 + rentScore * 0.2) * 100));
  }, [decentChecks, periodicAnswer, valuation]);

  const scoreColor = complianceScore >= 80 ? "text-green-400" : complianceScore >= 50 ? "text-yellow-400" : "text-destructive";

  /* ── Risk level ────────────────────────────────────────────── */
  const isSection21Fail = periodicAnswer === "not_ready" || periodicAnswer === "unsure";
  const riskLevel = useMemo(() => {
    if (isSection21Fail) return { label: "High Risk — Legal Action Required", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" };
    if (complianceScore < 60) return { label: "High Risk", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" };
    if (complianceScore < 80) return { label: "Medium Risk", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
    return { label: "Low Risk", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" };
  }, [complianceScore, isSection21Fail]);

  /* ── Yield calculator ──────────────────────────────────────── */
  const annualRent = valuation ? (valuation.low + valuation.high) / 2 * 12 : 0;
  const yieldPercent = propertyValue > 0 && annualRent > 0 ? ((annualRent / propertyValue) * 100) : 0;
  const AREA_AVG_YIELD = postcode?.startsWith("E14") ? 4.2 : postcode?.startsWith("M") ? 5.8 : 4.8;

  /* ── Switch & Save calculator ──────────────────────────────── */
  const currentAnnualFee = annualRent * (currentFeePercent / 100);
  const hummAnnualFee = annualRent * 0.05;
  const annualSavings = currentAnnualFee - hummAnnualFee;

  /* ── PDF download ──────────────────────────────────────────── */
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `humm-reform-report-${postcode || "property"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0a0f1a" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(reportRef.current)
        .save();
      toast.success("Report downloaded!");
    } catch {
      toast.error("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmitEmail = async () => {
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      await supabase.from("waitlist_signups").insert({
        email,
        full_name: name || "Landlord",
        interests: ["landlord-reform", `score-${complianceScore}`],
        phone: null,
      });
      setStep(6);
      toast.success("Your Compliance Report is ready!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const actionItems = useMemo(() => {
    const items: string[] = [];
    const unchecked = DECENT_HOMES_CHECKS.filter((_, i) => !decentChecks[i]);
    if (unchecked.length > 0) items.push(`Address ${unchecked.length} Decent Homes Standard gap${unchecked.length > 1 ? "s" : ""}: ${unchecked[0]}`);
    if (periodicAnswer === "not_ready" || periodicAnswer === "unsure") items.push("Convert fixed-term ASTs to periodic tenancies before May 1st");
    if (periodicAnswer === "partial") items.push("Review remaining fixed-term tenancies for periodic conversion");
    if (!valuation) items.push("Get an AI rental valuation to benchmark your current rent");
    return items;
  }, [decentChecks, periodicAnswer, valuation]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Renters Rights Act 2026 | Landlord Compliance | Hummm"
        description="Is your portfolio ready for the Rental Reform Act? Get a free AI-powered compliance report covering Decent Homes, periodic tenancies and rental valuations."
      />
      <Navbar />

      {/* Countdown ticker */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 py-2.5 px-4">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm font-semibold text-primary tabular-nums">
            <span className="text-foreground font-bold">{countdown.days}</span>d{" "}
            <span className="text-foreground font-bold">{countdown.hours}</span>h{" "}
            <span className="text-foreground font-bold">{countdown.minutes}</span>m{" "}
            <span className="text-foreground font-bold">{countdown.seconds}</span>s{" "}
            until the Rental Reform Act becomes law
          </p>
        </div>
      </div>

      <main className="section-padding">
        {/* ── HERO (step 0) ────────────────────────────────────── */}
        {step === 0 && (
          <section className="max-w-3xl mx-auto text-center py-20 md:py-28 space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
              <Shield className="w-3.5 h-3.5" /> Free Compliance Check
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Is Your Portfolio Ready for{" "}
              <span className="text-gradient">May 1st?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Get your free <strong className="text-foreground">Rental Reform Compliance Report</strong> — powered by AI. Find gaps before the regulator does.
            </p>
            <Button
              size="lg"
              className="humm-pulse text-base px-8 py-6 rounded-xl hover:scale-105 transition-transform"
              onClick={() => setStep(1)}
            >
              Start My Free Check <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              or{" "}
              <button
                onClick={() => document.getElementById("bulk-upload")?.scrollIntoView({ behavior: "smooth" })}
                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                upload your full portfolio
              </button>{" "}
              for a bulk compliance report
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> AI-Powered Analysis</span>
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" /> Instant Report</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Market Benchmarking</span>
            </div>
          </section>
        )}

        {/* ── BULK UPLOAD ─────────────────────────────────────── */}
        {step === 0 && (
          <div id="bulk-upload">
            <BulkPortfolioUpload />
          </div>
        )}

        {/* ── WIZARD (steps 1–5) ──────────────────────────────── */}
        {step >= 1 && step <= 5 && (
          <section className="max-w-2xl mx-auto py-12 md:py-20">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Step {Math.min(step, 4)} of 4</span>
                <span>{Math.min(step, 4) * 25}% complete</span>
              </div>
              <Progress value={Math.min(step, 4) * 25} className="h-1.5" />
            </div>

            <div className="glass-surface rounded-2xl p-6 sm:p-8 space-y-6">
              {/* STEP 1: Decent Homes */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold">Does your property meet the new Decent Homes Standard?</h2>
                  <p className="text-sm text-muted-foreground">Tick each item that currently applies to your property.</p>
                  <div className="space-y-3">
                    {DECENT_HOMES_CHECKS.map((item, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${decentChecks[i] ? "border-primary/40 bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
                      >
                        <input
                          type="checkbox"
                          checked={decentChecks[i]}
                          onChange={() => {
                            const next = [...decentChecks];
                            next[i] = !next[i];
                            setDecentChecks(next);
                          }}
                          className="mt-0.5 accent-primary w-4 h-4"
                        />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 2: Periodic tenancies */}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold">Are your tenancies moving to the new Periodic model?</h2>
                  <p className="text-sm text-muted-foreground">Under the new Act, Section 21 'no-fault' evictions are abolished. All tenancies become periodic by default.</p>
                  <div className="space-y-3">
                    {PERIODIC_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${periodicAnswer === opt.value ? "border-primary/40 bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
                      >
                        <input
                          type="radio"
                          name="periodic"
                          value={opt.value}
                          checked={periodicAnswer === opt.value}
                          onChange={() => setPeriodicAnswer(opt.value)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 3: Rent alignment */}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold">Is your rent aligned with current market rates?</h2>
                  <p className="text-sm text-muted-foreground">Enter your property address and we'll benchmark your rent using our AI Valuation engine.</p>
                  <AddressLookup
                    value={address}
                    onChange={setAddress}
                    onPostcodeFound={setPostcode}
                    onAddressSelected={(addr) => {
                      setAddress(addr);
                    }}
                    variant="dark"
                    placeholder="Start typing your property address…"
                  />
                  {postcode && !valuation && (
                    <Button variant="outline" onClick={fetchValuation} className="mt-2">
                      <TrendingUp className="w-4 h-4 mr-2" /> Get AI Rental Valuation
                    </Button>
                  )}
                  {valuation && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium text-primary">AI Rental Estimate for {postcode}</p>
                      <p className="text-2xl font-bold mt-1">
                        £{valuation.low.toLocaleString()} – £{valuation.high.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground"> /month</span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 4: (placeholder — quiz done, show preview) */}
              {step === 4 && (
                <>
                  <h2 className="text-xl font-bold">Your Compliance Snapshot</h2>
                  <p className="text-sm text-muted-foreground">Here's your preliminary score. Enter your email to unlock the full report with an action plan.</p>
                  <div className="flex flex-col items-center py-6">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          strokeDasharray={`${complianceScore * 3.267} 326.7`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-3xl font-extrabold ${scoreColor}`}>
                        {complianceScore}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Compliance Readiness</p>
                  </div>
                </>
              )}

              {/* STEP 5: Email capture */}
              {step === 5 && (
                <>
                  <h2 className="text-xl font-bold">Unlock Your Full Compliance Report</h2>
                  <p className="text-sm text-muted-foreground">We'll send your personalised action plan and rental benchmark straight to your inbox.</p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                      required
                    />
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                {step > 1 ? (
                  <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                ) : <span />}
                {step < 5 ? (
                  <Button onClick={() => { setStep(step + 1); if (step === 3 && postcode && !valuation) fetchValuation(); }}>
                    {step === 4 ? "Get My Report" : "Continue"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmitEmail} disabled={loading}>
                    {loading ? "Generating…" : "Generate My Report"} <Mail className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── REPORT (step 6) ─────────────────────────────────── */}
        {step === 6 && (
          <section className="max-w-2xl mx-auto py-12 md:py-20 space-y-6">
            {/* Download button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowShieldGate(true)} disabled={pdfLoading}>
                <Download className="w-4 h-4 mr-2" />
                {pdfLoading ? "Generating PDF…" : "Download Official Hummm Report"}
              </Button>
            </div>

            <ExecutionGateModal
              open={showShieldGate}
              onClose={() => setShowShieldGate(false)}
              gateType="shield_report"
              onBypass={() => {
                toast.info("Basic compliance scan shown above. Upgrade for the full PDF report.");
              }}
            />

            <div ref={reportRef} className="glass-surface rounded-2xl p-6 sm:p-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Your Hummm Reform Report</h2>
                <p className="text-sm text-muted-foreground">Generated for {address || "your property"} • {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              {/* Score ring + Risk level */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={`${complianceScore * 3.267} 326.7`} strokeLinecap="round" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-2xl font-extrabold ${scoreColor}`}>{complianceScore}%</span>
                </div>
                <p className="text-sm font-medium">Compliance Readiness</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${riskLevel.bg} ${riskLevel.color}`}>
                  <Shield className="w-3 h-3" /> {riskLevel.label}
                </span>
              </div>

              {/* Action items */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400" /> Action Plan</h3>
                {isSection21Fail && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-3">
                    <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Section 21 non-compliance detected
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Your tenancies must transition to the periodic model before May 1st. Failure to comply may result in legal action from tenants.</p>
                  </div>
                )}
                {actionItems.length === 0 ? (
                  <p className="text-sm text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> You're fully compliant — no action needed!</p>
                ) : (
                  <ul className="space-y-2">
                    {actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Rental valuation + Yield calculator */}
              {valuation && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="text-sm font-semibold text-primary mb-1">AI Rental Benchmark — {postcode}</h3>
                    <p className="text-xl font-bold">
                      £{valuation.low.toLocaleString()} – £{valuation.high.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground"> /month</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Based on comparable rental data in {postcode}.</p>
                  </div>

                  {/* Yield calculator */}
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Yield Calculator</h3>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Property value:</label>
                      <div className="flex-1">
                        <Slider
                          value={[propertyValue]}
                          onValueChange={([v]) => setPropertyValue(v)}
                          min={100000}
                          max={2000000}
                          step={10000}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums w-24 text-right">£{propertyValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold tabular-nums">{yieldPercent.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Your gross yield</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-muted-foreground tabular-nums">{AREA_AVG_YIELD}%</p>
                        <p className="text-xs text-muted-foreground">{postcode?.slice(0, 2) || "Area"} average</p>
                      </div>
                    </div>
                    {yieldPercent > 0 && (
                      <p className={`text-xs font-medium ${yieldPercent >= AREA_AVG_YIELD ? "text-green-400" : "text-yellow-400"}`}>
                        {yieldPercent >= AREA_AVG_YIELD
                          ? `✓ Your yield is ${(yieldPercent - AREA_AVG_YIELD).toFixed(1)}% above the local average`
                          : `⚠ Your yield is ${(AREA_AVG_YIELD - yieldPercent).toFixed(1)}% below the local average — you may be under-renting`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Switch & Save calculator */}
              {annualRent > 0 && (
                <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Switch & Save Calculator</h3>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Current fee:</label>
                    <div className="flex-1">
                      <Slider
                        value={[currentFeePercent]}
                        onValueChange={([v]) => setCurrentFeePercent(v)}
                        min={5}
                        max={20}
                        step={0.5}
                      />
                    </div>
                    <span className="text-sm font-semibold tabular-nums w-12 text-right">{currentFeePercent}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground">Current cost</p>
                      <p className="text-sm font-bold tabular-nums">£{Math.round(currentAnnualFee).toLocaleString()}<span className="text-xs font-normal">/yr</span></p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-primary font-medium">Hummm 5%</p>
                      <p className="text-sm font-bold tabular-nums">£{Math.round(hummAnnualFee).toLocaleString()}<span className="text-xs font-normal">/yr</span></p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                      <p className="text-xs text-green-400 font-medium">You save</p>
                      <p className="text-sm font-bold text-green-400 tabular-nums">£{Math.round(annualSavings).toLocaleString()}<span className="text-xs font-normal">/yr</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center space-y-3">
                <h3 className="text-lg font-bold">Switch to Hummm Management</h3>
                <p className="text-sm text-muted-foreground">We handle the full legal transition for a flat <strong className="text-foreground">5% fee</strong> — compared to the industry standard 12%.</p>
                {annualSavings > 0 && (
                  <p className="text-primary text-sm font-semibold">That's £{Math.round(annualSavings).toLocaleString()} back in your pocket every year.</p>
                )}
                <Button size="lg" className="humm-pulse" onClick={() => window.location.href = "/let-your-property"}>
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
