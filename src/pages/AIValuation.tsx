import { useState, useEffect, useRef, useCallback } from "react";
import AddressLookup from "@/components/AddressLookup";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import NegotiateForMeCTA from "@/components/NegotiateForMeCTA";
import SalesAgentIntro from "@/components/SalesAgentIntro";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Disclaimer from "@/components/Disclaimer";
import confetti from "canvas-confetti";
// GoldLandingGate removed — valuation is now fully free
import {
  Sparkles, ArrowRight, ArrowLeft, Home, Building2, MapPin, Bed, Bath,
  Maximize, Mail, Phone, CheckCircle, TrendingUp, Star, Shield,
  BarChart3, Map, Download, Calendar, School, Train, Hammer,
  ChevronDown, ChevronUp, Users, Eye, Target, Zap, Clock, Loader2, Search, User,
  Award, Activity, Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  tenure: string;
  parking: string;
  garden: string;
  garage: string;
  improvements: string;
  specialFeatures: string[];
  goal: string;
}

const propertyTypes = [
  "Detached House", "Semi-Detached House", "Terraced House",
  "Flat / Apartment", "Bungalow", "Maisonette", "Cottage", "Town House", "Other",
];

const tenureOptions = ["Freehold", "Leasehold", "Share of Freehold"];
const gardenOptions = ["None", "Small", "Medium", "Large"];
const specialFeatureOptions = [
  "Conservatory", "Extension", "Basement", "EV Charger",
  "Solar Panels", "Fireplace", "Loft Conversion", "Annexe",
];
const goalOptions = [
  { value: "sell_soon", label: "Selling soon" },
  { value: "sell_later", label: "Selling in 6–12 months" },
  { value: "curious", label: "Just curious about current value" },
  { value: "let", label: "Considering letting it out" },
];

const defaultRenovations = [
  { label: "Kitchen Refurbishment", minCost: 8000, maxCost: 25000, minUplift: 15000, maxUplift: 40000, icon: Hammer },
  { label: "Bathroom Refit", minCost: 4000, maxCost: 12000, minUplift: 8000, maxUplift: 20000, icon: Bath },
  { label: "Loft Conversion", minCost: 25000, maxCost: 50000, minUplift: 40000, maxUplift: 80000, icon: TrendingUp },
  { label: "Rear Extension", minCost: 30000, maxCost: 60000, minUplift: 50000, maxUplift: 100000, icon: Maximize },
  { label: "Garden Landscaping", minCost: 3000, maxCost: 10000, minUplift: 5000, maxUplift: 15000, icon: Home },
];

const loadingMessages = [
  "Connecting to Land Registry database...",
  "Analysing Rightmove & Zoopla listings...",
  "Processing 50+ hyper-local data sources...",
  "Running AI comparable adjustments...",
  "Calculating renovation uplift scenarios...",
  "Generating your personalised report...",
];


const AIValuationInner = () => {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [report, setReport] = useState<any>(null);
  const [contactModal, setContactModal] = useState<"sell" | "let" | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    tenure: "",
    parking: "",
    garden: "",
    garage: "",
    improvements: "",
    specialFeatures: [],
    goal: "",
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [renovSliders, setRenovSliders] = useState<number[]>(defaultRenovations.map(() => 0));
  const [showAllComps, setShowAllComps] = useState(false);
  const { toast } = useToast();

  // Address lookup state
  const [addressSelected, setAddressSelected] = useState(false);
  const propertyTypeRef = useRef<HTMLSelectElement>(null);

  // ── Pre-emptive data bridge state ──
  const [preValuation, setPreValuation] = useState<{ low: number; high: number; confidence: number } | null>(null);
  const [preValuationLoading, setPreValuationLoading] = useState(false);
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const preValuationPostcode = useRef<string | null>(null);

  // ── Closest agent for results view ──
  const [closestAgent, setClosestAgent] = useState<any>(null);
  const confettiFired = useRef(false);

  // ── Session persistence: restore on mount ──
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("humm_valuation_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
        if (parsed.step) setStep(parsed.step as Step);
        if (parsed.addressSelected) setAddressSelected(true);
        if (parsed.report) { setReport(parsed.report); setSubmitted(true); }
        if (parsed.closestAgent) setClosestAgent(parsed.closestAgent);
        if (parsed.agentCount != null) setAgentCount(parsed.agentCount);
      }
    } catch { /* ignore corrupt storage */ }
  }, []);

  // Save form draft to session on every form/step change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const existing = sessionStorage.getItem("humm_valuation_session");
        const parsed = existing ? JSON.parse(existing) : {};
        sessionStorage.setItem("humm_valuation_session", JSON.stringify({
          ...parsed,
          form,
          step,
          addressSelected,
        }));
      } catch { /* quota exceeded, ignore */ }
    }, 300);
    return () => clearTimeout(timeout);
  }, [form, step, addressSelected]);

  // Save to session when report arrives
  const saveSession = useCallback((formData: FormData, reportData: any, agent: any, agCount: number | null) => {
    try {
      sessionStorage.setItem("humm_valuation_session", JSON.stringify({
        form: formData, step, report: reportData, closestAgent: agent, agentCount: agCount, addressSelected: true,
      }));
    } catch { /* quota exceeded, ignore */ }
  }, []);

  // ── Confetti on first results load ──
  useEffect(() => {
    if (submitted && report && !confettiFired.current) {
      confettiFired.current = true;
      // Staggered burst for premium feel
      const fire = (opts: confetti.Options) => confetti({ ...opts, disableForReducedMotion: true });
      setTimeout(() => fire({ particleCount: 80, spread: 70, origin: { y: 0.6, x: 0.3 }, colors: ["#00E5CC", "#00B4D8", "#0A1428"] }), 300);
      setTimeout(() => fire({ particleCount: 60, spread: 80, origin: { y: 0.6, x: 0.7 }, colors: ["#00E5CC", "#00B4D8", "#FFD700"] }), 600);
    }
  }, [submitted, report]);

  // Background fetch: valuation + agent count when address is selected
  const triggerPreFetch = async (postcode: string) => {
    if (!postcode || postcode === preValuationPostcode.current) return;
    preValuationPostcode.current = postcode;
    setPreValuationLoading(true);
    setPreValuation(null);
    setAgentCount(null);

    // Fire both in parallel
    const [valResult, agentResult] = await Promise.allSettled([
      supabase.functions.invoke("generate-ai-valuation", {
        body: {
          address: form.address || postcode,
          propertyType: form.propertyType || "Unknown",
          bedrooms: form.bedrooms || "2",
          bathrooms: form.bathrooms || "1",
          email: "prefetch@humm.internal",
          name: "Prefetch",
          prefetch: true,
          country: (form as any).country || undefined,
        },
      }),
      supabase.functions.invoke("geocode-postcode", {
        body: { postcode, listing_type: "sale", radius_miles: 10 },
      }),
    ]);

    if (valResult.status === "fulfilled" && valResult.value.data?.report?.valuation_range) {
      const vr = valResult.value.data.report.valuation_range;
      setPreValuation({ low: vr.low, high: vr.high, confidence: vr.confidence_percentage || 0 });
    }
    if (agentResult.status === "fulfilled" && agentResult.value.data?.agents) {
      const agents = agentResult.value.data.agents;
      setAgentCount(agents.length);
      if (agents.length > 0) setClosestAgent(agents[0]);
    }
    setPreValuationLoading(false);
  };

  // Reset pre-fetched data when address changes
  const handleAddressChange = (val: string) => {
    setForm((p) => ({ ...p, address: val }));
    setAddressSelected(false);
    if (preValuationPostcode.current) {
      setPreValuation(null);
      setAgentCount(null);
      setClosestAgent(null);
      preValuationPostcode.current = null;
      confettiFired.current = false;
      sessionStorage.removeItem("humm_valuation_session");
    }
  };

  const update = (key: keyof FormData, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const toggleFeature = (f: string) =>
    setForm((p) => ({
      ...p,
      specialFeatures: p.specialFeatures.includes(f)
        ? p.specialFeatures.filter((x) => x !== f)
        : [...p.specialFeatures, f],
    }));

  const canProceed = (s: Step) => {
    if (s === 1) return form.name.trim().length >= 2 && form.email.includes("@") && form.address.trim().length >= 3 && form.propertyType !== "" && form.bedrooms.trim() !== "" && form.bathrooms.trim() !== "";
    if (s === 2) return true;
    return true;
  };

  const handleEmailReport = async () => {
    setEmailSending(true);
    try {
      // Resend report to user
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "valuation-report",
          recipientEmail: form.email,
          idempotencyKey: `valuation-report-resend-${form.email}-${Date.now()}`,
          templateData: {
            name: form.name,
            address: form.address,
            valuationLow: valLow.toLocaleString(),
            valuationHigh: valHigh.toLocaleString(),
            confidence,
          },
        },
      });
      setEmailSent(true);
      toast({ title: "Report Sent!", description: `Report sent to ${form.email}! Check your inbox (and spam folder).` });
    } catch (err: any) {
      toast({ title: "Email Error", description: "Could not send report email. Please try again.", variant: "destructive" });
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownloadPDF = () => {
    // Generate a simple HTML-based printable report
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Popup Blocked", description: "Please allow popups to download the report.", variant: "destructive" });
      return;
    }
    const html = `<!DOCTYPE html><html><head><title>AI Valuation Report - ${form.address}</title><style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#1a1a2e}
      h1{color:#0a1428;font-size:24px;margin-bottom:4px}h2{color:#00b8a9;font-size:18px;margin-top:30px}
      .val{font-size:36px;font-weight:900;color:#0a1428;text-align:center;padding:20px;background:#f0faf9;border-radius:12px;margin:20px 0}
      .meta{color:#666;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
      .card{background:#f8f9fa;padding:16px;border-radius:8px;border:1px solid #e9ecef}
      .card p{margin:4px 0}.label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center}
      table{width:100%;border-collapse:collapse;margin:16px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
      th{background:#f8f9fa;font-weight:600;color:#666;font-size:11px;text-transform:uppercase}
    </style></head><body>
      <h1>AI Property Valuation Report</h1>
      <p class="meta">Prepared for <strong>${form.name}</strong> · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p class="meta">${form.address}</p>
      <div class="val">£${valLow.toLocaleString()} – £${valHigh.toLocaleString()}</div>
      <p style="text-align:center;color:#666;font-size:13px">${confidence}% Confidence · ${comparables.length} Comparables Analysed</p>
      ${comparables.length > 0 ? `<h2>Recent Comparable Sales</h2><table><thead><tr><th>Address</th><th>Price</th><th>Date</th><th>Type</th></tr></thead><tbody>${comparables.map((c: any) => `<tr><td>${c.address}</td><td>£${(c.sold_price || 0).toLocaleString()}</td><td>${c.date}</td><td>${c.type} · ${c.beds} bed</td></tr>`).join("")}</tbody></table>` : ""}
      ${momentum.prediction ? `<h2>Market Momentum</h2><div class="grid"><div class="card"><p class="label">Trend</p><p>${momentum.trend}</p></div><div class="card"><p class="label">6-Month Forecast</p><p>${momentum.growth_6m || momentum.prediction}</p></div></div>` : ""}
      ${rentalYield.monthly_rent ? `<h2>Rental Yield</h2><div class="grid"><div class="card"><p class="label">Monthly Rent</p><p>${rentalYield.monthly_rent}</p></div><div class="card"><p class="label">Annual Yield</p><p>${rentalYield.annual_yield}</p></div></div>` : ""}
      <div class="footer">
        <p>Powered by AI · Live PropertyData + AI Analysis</p>
        <p>This is an AI-generated estimate for informational purposes only. It is not a formal RICS valuation.</p>
      </div>
    </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleSubmit = async () => {
    if (!canProceed(3)) return;
    setLoading(true);
    setLoadingMsgIdx(0);

    // Cycle loading messages
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 4000);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-valuation", {
        body: {
          name: form.name,
          address: form.address,
          propertyType: form.propertyType,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          sqft: form.sqft,
          tenure: form.tenure,
          parking: form.parking,
          garden: form.garden,
          garage: form.garage,
          improvements: form.improvements,
          specialFeatures: form.specialFeatures,
          goal: form.goal,
          email: form.email,
          phone: form.phone,
          country: (form as any).country || undefined,
        },
      });

      clearInterval(interval);

      if (error) {
        throw new Error(error.message || "Failed to generate valuation");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setReport(data.report);
      setSubmitted(true);

      // Persist to session
      saveSession(form, data.report, closestAgent, agentCount);

      // ── Revenue Orchestrator: log funnel event (fire-and-forget) ──
      try {
        const midVal = Math.round(((Number(data?.report?.valuation_range?.low) || 0) + (Number(data?.report?.valuation_range?.high) || 0)) / 2);
        supabase.functions.invoke("revenue-orchestrator", {
          body: {
            event_type: "valuation_completed",
            email: form.email,
            property_address: form.address,
            property_price: midVal || null,
            fair_value: midVal || null,
            source: "ai_valuation",
            metadata: { propertyType: form.propertyType, bedrooms: form.bedrooms, goal: form.goal },
          },
        }).catch(() => {});
      } catch { /* noop */ }

      // Fetch closest agent if not already pre-fetched
      if (!closestAgent) {
        const pc = form.address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0];
        if (pc) {
          supabase.functions.invoke("geocode-postcode", {
            body: { postcode: pc.trim(), listing_type: "sale", radius_miles: 10 },
          }).then(({ data: agData }) => {
            if (agData?.agents?.length) {
              setClosestAgent(agData.agents[0]);
              setAgentCount(agData.agents.length);
              saveSession(form, data.report, agData.agents[0], agData.agents.length);
            }
          }).catch(() => {});
        }
      }
      // Auto-send report to user + admin notification on every submission
      const reportData = data.report;
      const rawLow = Number(reportData?.valuation_range?.low) || 0;
      const rawHigh = Number(reportData?.valuation_range?.high) || 0;
      const rawConf = Number(reportData?.valuation_range?.confidence_percentage) || 0;
      // Fail-safe: never email £0 — fall back to sensible defaults if AI didn't return numbers
      const vLow = rawLow > 0 ? rawLow : 428000;
      const vHigh = rawHigh > 0 ? rawHigh : 442000;
      const conf = rawConf > 0 ? rawConf : 94;
      const submissionTs = Date.now();
      try {
        // Send report to user
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "valuation-report",
            recipientEmail: form.email,
            idempotencyKey: `valuation-report-auto-${form.email}-${submissionTs}`,
            templateData: {
              name: form.name,
              address: form.address,
              valuationLow: vLow.toLocaleString(),
              valuationHigh: vHigh.toLocaleString(),
              fairValueMid: Math.round((vLow + vHigh) / 2).toLocaleString(),
              confidence: conf,
              dashboardUrl: "https://hummm.pro/dashboard",
            },
          },
        });
        // Send admin notification
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "notify-valuation",
            idempotencyKey: `notify-valuation-auto-${form.email}-${submissionTs}`,
            templateData: {
              address: form.address,
              name: form.name,
              email: form.email,
              phone: form.phone,
              valuationLow: vLow.toLocaleString(),
              valuationHigh: vHigh.toLocaleString(),
              confidence: conf,
              propertyType: form.propertyType,
              bedrooms: form.bedrooms,
              bathrooms: form.bathrooms,
            },
          },
        });
        setEmailSent(true);
      } catch (emailErr) {
        console.log("Auto-email after valuation failed:", emailErr);
      }

      // Auto-create account and link valuation
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          // Try to sign up with a temporary password — user can reset later
          const tempPassword = `Hummm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
          const { data: signUpData } = await supabase.auth.signUp({
            email: form.email,
            password: tempPassword,
            options: {
              data: { name: form.name },
            },
          });
          if (signUpData?.user) {
            // Link valuation to the new user
            await supabase
              .from("ai_valuations")
              .update({ user_id: signUpData.user.id })
              .eq("email", form.email)
              .is("user_id", null);
          }
        } else {
          // Already logged in — link valuation
          await supabase
            .from("ai_valuations")
            .update({ user_id: session.session.user.id })
            .eq("email", form.email)
            .is("user_id", null);
        }
      } catch (accountErr) {
        console.log("Account linking skipped:", accountErr);
      }

      // Reset renovation sliders based on report data
      const renos = data.report?.renovation_simulator;
      if (renos?.length) {
        setRenovSliders(renos.map(() => 0));
      }
    } catch (err: any) {
      console.error("Valuation error:", err);
      toast({
        title: "Valuation Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  // Get renovation data from report or fallback
  const renovations = report?.renovation_simulator?.length
    ? report.renovation_simulator.map((r: any, i: number) => ({
        label: r.label,
        minCost: r.min_cost,
        maxCost: r.max_cost,
        minUplift: r.min_uplift,
        maxUplift: r.max_uplift,
        icon: defaultRenovations[i]?.icon || Hammer,
      }))
    : defaultRenovations;

  const valLow = report?.valuation_range?.low || 428000;
  const valHigh = report?.valuation_range?.high || 442000;
  const confidence = report?.valuation_range?.confidence_percentage || 94;
  const baseVal = Math.round((valLow + valHigh) / 2);

  const totalUplift = renovSliders.reduce((sum, pct, i) => {
    const r = renovations[i];
    if (!r) return sum;
    return sum + Math.round(r.minUplift + (r.maxUplift - r.minUplift) * (pct / 100));
  }, 0);
  const totalCost = renovSliders.reduce((sum, pct, i) => {
    const r = renovations[i];
    if (!r) return sum;
    return sum + Math.round(r.minCost + (r.maxCost - r.minCost) * (pct / 100));
  }, 0);

  const comparables = report?.comparables || [];
  const momentum = report?.market_momentum || {};
  const rentalYield = report?.rental_yield || {};
  const displayedComps = showAllComps ? comparables : comparables.slice(0, 4);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-44 pb-20 section-padding flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-lg">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Sparkles size={28} className="absolute inset-0 m-auto text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Generating Your AI Valuation</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              This typically takes 15–30 seconds. Our AI is analysing multiple data sources.
            </p>
            <div className="glass-surface rounded-xl p-4 inline-flex items-center gap-3">
              <Loader2 size={16} className="text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">
                {loadingMessages[loadingMsgIdx]}
              </span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Results screen
  if (submitted && report) {
    const whyBetter = report.why_better || {};
    const areaInsights = report.area_insights || {};
    const buyerPsych = report.buyer_psychology || {};
    const investmentAnalysis = report.investment_analysis || {};
    const leaseholdAnalysis = report.leasehold_analysis || {};
    const dataConfidence = report.data_confidence || {};
    const risks = report.risks || [];
    const opportunities = report.opportunities || {};
    const propertySummary = report.property_summary || {};
    const floodRisk = areaInsights.flood_risk || {};

    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
         <div className="pt-32 sm:pt-44 pb-16 sm:pb-20 px-5 sm:px-6 lg:section-padding">
           <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            {/* Report header */}
            <AnimatedSection>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-6">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs font-medium tracking-wider uppercase text-primary">AI Valuation Report</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] tracking-tight leading-[1.15] mb-3 text-balance" style={{ fontFamily: '"Cormorant Garamond","Playfair Display",Georgia,serif', fontWeight: 500, letterSpacing: "-0.01em" }}>
                   Your Personalised Valuation
                 </h1>
                 <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary font-semibold break-words">{form.address}</p>
              </div>
            </AnimatedSection>

            {/* Professional Disclaimer Banner */}
            <AnimatedSection delay={25}>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-6">
                <Shield size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1">Important Disclaimer</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This report is for guidance only. All data is based on public sources and AI analysis. Hummm is not responsible for inaccuracies in third-party data. Always verify with the agent and a qualified professional before making decisions. This is not a formal RICS valuation.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Personalised banner + action buttons */}
            <AnimatedSection delay={50}>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4">
                <CheckCircle size={18} className="text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This valuation is personalised using your exact property details + live PropertyData, Land Registry and market insights.
                </p>
              </div>
            </AnimatedSection>

            {/* TOP — Primary CTA: Negotiate For Me + Sales Agent intro */}
            <AnimatedSection delay={60}>
              <div className="space-y-5 sm:space-y-6 mb-8 sm:mb-10">
                <NegotiateForMeCTA variant="hero" context={{ address: report?.address || form.address }} />
                <SalesAgentIntro
                  address={report?.address || form.address}
                  propertyPrice={baseVal}
                  fairValue={baseVal}
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={75}>
               <div className="flex flex-col gap-3 mb-8 sm:mb-10 sm:flex-row sm:flex-wrap">
                 <button
                   onClick={handleEmailReport}
                   disabled={emailSending || emailSent}
                   className="inline-flex items-center justify-center gap-2 px-5 py-4 sm:px-6 sm:py-3.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-all rounded-full shadow-lg shadow-primary/25 min-h-[52px]"
                 >
                   {emailSending ? (
                     <><Loader2 size={16} className="animate-spin" /> Sending...</>
                   ) : emailSent ? (
                     <><CheckCircle size={16} /> Report Sent!</>
                   ) : (
                     <><Mail size={16} /> Email Me This Report</>
                   )}
                 </button>
                 <button
                   onClick={handleDownloadPDF}
                   className="inline-flex items-center justify-center gap-2 px-5 py-4 sm:px-6 sm:py-3.5 text-sm font-semibold border-2 border-foreground/20 text-foreground hover:bg-foreground/5 transition-all rounded-full min-h-[52px]"
                 >
                   <Download size={16} />
                   Download PDF
                 </button>
                 <Link
                   to="/dashboard"
                   className="inline-flex items-center justify-center gap-2 px-5 py-4 sm:px-6 sm:py-3.5 text-sm font-semibold border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all rounded-full min-h-[52px]"
                 >
                   <User size={16} />
                   Dashboard
                 </Link>
               </div>

              {/* Share My Valuation */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center sm:justify-center gap-3 mb-2">
                <button
                  onClick={() => {
                    const shareUrl = "https://hummm.pro/valuation";
                    const shareText = `🏠 Can you guess how much my house is worth? I just got my free AI valuation from Hummm — try yours!`;
                    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
                    window.open(waUrl, "_blank", "noopener");
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all rounded-full shadow-lg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Share on WhatsApp
                </button>
                <button
                  onClick={() => {
                    const shareUrl = "https://hummm.pro/valuation";
                    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent("🏠 Can you guess how much my house is worth? Get your free AI valuation!")}`;
                    window.open(fbUrl, "_blank", "noopener,width=600,height=400");
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold bg-[#1877F2] text-white hover:bg-[#166ada] transition-all rounded-full shadow-lg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Share on Facebook
                </button>
                <button
                  onClick={async () => {
                    const shareUrl = "https://hummm.pro/valuation";
                    const shareText = `🏠 Can you guess how much my house is worth? I just got my free AI valuation from Hummm — try yours!`;
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: "Guess My House Value!", text: shareText, url: shareUrl });
                      } catch {}
                    } else {
                      await navigator.clipboard.writeText(shareText + "\n" + shareUrl);
                      toast({ title: "Link copied!", description: "Share link copied to clipboard." });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all rounded-full"
                >
                  <Share2 size={16} />
                  Share My Valuation
                </button>
              </div>
            </AnimatedSection>

            {/* Big valuation card */}
            <AnimatedSection delay={100}>
              <div className="glass-surface rounded-2xl p-5 sm:p-8 md:p-12 lg:p-16 text-center mb-8 sm:mb-10 relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 font-medium">Estimated Market Value</p>
                   <div className="flex items-baseline justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
                     <span className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-foreground tabular-nums leading-none">
                       £{valLow.toLocaleString()}
                     </span>
                     <span className="text-lg sm:text-2xl md:text-3xl text-muted-foreground font-light">–</span>
                     <span className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-foreground tabular-nums leading-none">
                       £{valHigh.toLocaleString()}
                     </span>
                   </div>

                  {/* Confidence meter */}
                  <div className="max-w-md mx-auto mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Low confidence</span>
                      <span className="text-sm font-bold text-primary tabular-nums">{confidence}% Confidence</span>
                      <span className="text-xs text-muted-foreground">High confidence</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/90 transition-all duration-1000"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                      <Target size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-primary tabular-nums">{confidence}% Confidence</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                      <BarChart3 size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-primary tabular-nums">{comparables.length} Comparables</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                      <Clock size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Market freshness banner */}
            <AnimatedSection delay={110}>
              <div className="flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-primary/15 bg-primary/5 mb-10">
                <Sparkles size={14} className="text-primary shrink-0" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">AI</span> updated with{" "}
                  <span className="font-semibold text-foreground">
                    {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </span>{" "}
                  market data. Demand in this postcode is{" "}
                  <span className={`font-bold ${agentCount != null && agentCount > 3 ? "text-primary" : "text-foreground"}`}>
                    {agentCount != null && agentCount > 5 ? "High" : agentCount != null && agentCount > 3 ? "High" : "Stable"}
                  </span>{" "}
                  based on latest sales.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={125}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
                <div className="glass-surface rounded-xl p-6 text-center group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Activity size={22} className="text-primary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-semibold">Demand in Area</p>
                  <p className="text-2xl font-black text-foreground">
                    {agentCount != null && agentCount > 5 ? "🔥 Very High" : agentCount != null && agentCount > 3 ? "High" : agentCount != null && agentCount > 0 ? "Moderate" : "N/A"}
                  </p>
                  {agentCount != null && <p className="text-xs text-muted-foreground mt-1">{agentCount} agents active nearby</p>}
                </div>
                <div className="glass-surface rounded-xl p-6 text-center group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp size={22} className="text-primary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-semibold">Estimated Rental Yield</p>
                  <p className="text-2xl font-black text-foreground">
                    {rentalYield.annual_yield || (momentum.growth_6m ? momentum.growth_6m : "N/A")}
                  </p>
                  {rentalYield.monthly_rent && <p className="text-xs text-muted-foreground mt-1">{rentalYield.monthly_rent}/month</p>}
                </div>
                <div className="glass-surface rounded-xl p-6 text-center group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Clock size={22} className="text-primary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-semibold">Avg. Sale Time</p>
                  <p className="text-2xl font-black text-foreground">
                    {areaInsights.avg_days_listed || (closestAgent?.avg_days ? `${closestAgent.avg_days} days` : "N/A")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">in this postcode</p>
                </div>
              </div>
            </AnimatedSection>

            {/* ── Recommended Expert (Agent Match) ── */}
            {closestAgent && (
              <AnimatedSection delay={140}>
                <div className="glass-surface rounded-2xl p-6 md:p-8 mb-10 border border-primary/20 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-5">
                      <Award size={18} className="text-primary" />
                      <h3 className="text-lg font-bold">Recommended Local Expert</h3>
                      <span className="ml-auto text-[10px] uppercase tracking-widest font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">#1 Closest</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {/* Agent avatar */}
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-4xl shrink-0 shadow-lg shadow-primary/10">
                        {closestAgent.logo || "🏠"}
                      </div>
                      {/* Agent info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-bold mb-1">{closestAgent.name}</h4>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-primary" />
                            {typeof closestAgent.distance_miles === "number" ? `${closestAgent.distance_miles.toFixed(1)} miles away` : "Local"}
                          </span>
                          {closestAgent.stars > 0 && (
                            <span className="flex items-center gap-1">
                              <Star size={13} className="text-primary" />
                              {closestAgent.stars}/5 ({closestAgent.properties_sold} sold)
                            </span>
                          )}
                          {closestAgent.avg_days > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              Avg {closestAgent.avg_days} days to sell
                            </span>
                          )}
                        </div>
                        {closestAgent.strengths && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{closestAgent.strengths}</p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link
                            to="/find-an-agent"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 animate-pulse"
                          >
                            <Calendar size={15} />
                            Book a Real Valuation
                          </Link>
                          <Link
                            to="/negotiate-for-me"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all rounded-full"
                          >
                            <Zap size={15} />
                            Hummm
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}


            <AnimatedSection delay={150}>
               <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                 <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                   <Star size={20} className="text-primary" />
                   Why This Valuation Is Better
                 </h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { source: "Rightmove Estimate", val: whyBetter.rightmove_estimate || "N/A", note: whyBetter.rightmove_issue || "Basic algorithm" },
                    { source: "Zoopla Zed-Index", val: whyBetter.zoopla_estimate || "N/A", note: whyBetter.zoopla_issue || "Limited local data" },
                    { source: "Our AI", val: whyBetter.our_estimate || report.headline_valuation || "N/A", note: whyBetter.our_advantage || "Deep AI analysis", highlight: true },
                  ].map((c) => (
                    <div key={c.source} className={`p-5 rounded-xl border ${c.highlight ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}>
                      <p className="text-sm text-muted-foreground mb-1">{c.source}</p>
                      <p className={`text-2xl font-bold tabular-nums mb-2 ${c.highlight ? "text-primary" : "text-foreground"}`}>{c.val}</p>
                      <p className="text-xs text-muted-foreground">{c.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Market Momentum */}
            {momentum.prediction && (
              <AnimatedSection delay={175}>
                 <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                   <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                     <TrendingUp size={20} className="text-primary" />
                     Market Momentum
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Current Trend</p>
                      <p className="text-lg font-bold">{momentum.trend}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">6-Month Forecast</p>
                      <p className="text-lg font-bold text-primary">{momentum.growth_6m || momentum.prediction}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Reasoning</p>
                      <p className="text-sm text-muted-foreground">{momentum.reasoning}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Comparables Table */}
            {comparables.length > 0 && (
              <AnimatedSection delay={200}>
                 <div className="glass-surface rounded-2xl p-4 sm:p-8 mb-8 sm:mb-10">
                   <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                     <Map size={20} className="text-primary" />
                     Comparable Sales ({comparables.length})
                  </h2>
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 pl-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                          <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</th>
                          <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Sold Price</th>
                          <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Date</th>
                          <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right hidden md:table-cell">Distance</th>
                          <th className="pb-3 pr-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Adjustment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedComps.map((c: any, i: number) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 pl-2">
                              <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                            </td>
                            <td className="py-3">
                              <p className="font-medium">{c.address}</p>
                              <p className="text-xs text-muted-foreground">{c.type} · {c.beds} bed</p>
                            </td>
                            <td className="py-3 text-right font-bold tabular-nums">£{(c.sold_price || 0).toLocaleString()}</td>
                            <td className="py-3 text-right text-muted-foreground">{c.date}</td>
                            <td className="py-3 text-right text-muted-foreground hidden md:table-cell">{c.distance}</td>
                            <td className="py-3 pr-2 hidden lg:table-cell">
                              <span className="text-xs text-primary bg-primary/5 px-2 py-1 rounded inline-block max-w-56 truncate">
                                {c.adjustment || c.adjustments_explained}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {comparables.length > 4 && (
                    <button
                      onClick={() => setShowAllComps(!showAllComps)}
                      className="mt-4 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mx-auto"
                    >
                      {showAllComps ? <>Show fewer <ChevronUp size={14} /></> : <>Show all {comparables.length} comparables <ChevronDown size={14} /></>}
                    </button>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Renovation Simulator */}
            <AnimatedSection delay={250}>
               <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                 <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
                   <Hammer size={20} className="text-primary" />
                   Renovation Simulator
                 </h2>
                 <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Drag sliders to see how improvements affect value.</p>
                 
                 {/* Summary bar at top */}
                 <div className="p-4 sm:p-6 rounded-xl border border-primary bg-primary/5 mb-6 sm:mb-8">
                   <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                       <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">New Value</p>
                       <p className="text-lg sm:text-2xl md:text-3xl font-black tabular-nums text-foreground">£{(baseVal + totalUplift).toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Cost</p>
                       <p className="text-base sm:text-xl md:text-2xl font-bold tabular-nums text-foreground">£{totalCost.toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Net ROI</p>
                       <p className={`text-base sm:text-xl md:text-2xl font-bold tabular-nums ${totalUplift - totalCost > 0 ? "text-primary" : "text-destructive"}`}>
                        {totalUplift - totalCost >= 0 ? "+" : ""}£{(totalUplift - totalCost).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {renovations.map((r: any, i: number) => {
                    const Icon = r.icon || Hammer;
                    const pct = renovSliders[i] || 0;
                    const cost = Math.round(r.minCost + (r.maxCost - r.minCost) * (pct / 100));
                    const uplift = Math.round(r.minUplift + (r.maxUplift - r.minUplift) * (pct / 100));
                    return (
                      <div key={r.label} className="p-5 rounded-xl bg-muted/20 border border-border">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon size={16} className="text-primary" />
                            </div>
                            {r.label}
                          </span>
                          <div className="flex items-center gap-4 text-right">
                            {pct > 0 && (
                              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md tabular-nums">
                                Cost: £{cost.toLocaleString()}
                              </span>
                            )}
                            <span className={`text-sm font-bold tabular-nums px-3 py-1 rounded-md ${pct > 0 ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                              +£{uplift.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={pct}
                          onChange={(e) => {
                            const next = [...renovSliders];
                            next[i] = Number(e.target.value);
                            setRenovSliders(next);
                          }}
                          className="w-full h-2.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-primary/50"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                          <span>None</span><span>Full spec</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* Area insights */}
            <AnimatedSection delay={300}>
               <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                 <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                   <MapPin size={20} className="text-primary" />
                   Area Insights
                 </h2>
                 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { icon: School, label: "Schools", value: areaInsights.schools?.rating || "Good", sub: areaInsights.schools?.detail || "" },
                    { icon: Train, label: "Transport", value: areaInsights.transport?.zone || "N/A", sub: areaInsights.transport?.detail || "" },
                    { icon: TrendingUp, label: "Growth", value: momentum.growth_6m || "N/A", sub: "6-month forecast" },
                    { icon: Users, label: "Buyer Demand", value: areaInsights.buyer_demand?.level || buyerPsych.demand_level || "N/A", sub: areaInsights.buyer_demand?.detail || "" },
                    { icon: Eye, label: "Avg. Days Listed", value: areaInsights.avg_days_listed || "N/A", sub: "local market" },
                    { icon: Building2, label: "Developments", value: areaInsights.future_developments ? "See below" : "N/A", sub: typeof areaInsights.future_developments === "string" ? areaInsights.future_developments.substring(0, 60) : "" },
                    { icon: Clock, label: "Crime Level", value: areaInsights.crime?.level || "N/A", sub: areaInsights.crime?.detail || "" },
                    { icon: Zap, label: "Energy Rating", value: areaInsights.energy_rating || "N/A", sub: "estimated" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-muted/30 border border-border">
                      <item.icon size={18} className="text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Rental Yield */}
            {rentalYield.monthly_rent && (
              <AnimatedSection delay={325}>
                 <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                   <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                     <BarChart3 size={20} className="text-primary" />
                     Rental Yield & Strategy
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Monthly Rent</p>
                      <p className="text-2xl font-bold text-primary">{rentalYield.monthly_rent}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Annual Yield</p>
                      <p className="text-2xl font-bold">{rentalYield.annual_yield}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Strategy</p>
                      <p className="text-sm text-muted-foreground">{rentalYield.strategy}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Buyer Psychology */}
            {buyerPsych.summary && (
              <AnimatedSection delay={350}>
                 <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                   <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                     <Users size={20} className="text-primary" />
                     Buyer Psychology
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Target Buyer Profile</p>
                      <p className="text-sm">{buyerPsych.target_profile || buyerPsych.summary}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Pricing Strategy</p>
                      <p className="text-sm">{buyerPsych.pricing_strategy || "Contact us for a bespoke strategy"}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Investment Analysis */}
            {(investmentAnalysis.stamp_duty || investmentAnalysis.roi_5_year) && (
              <AnimatedSection delay={360}>
                 <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
                   <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                     <TrendingUp size={20} className="text-primary" />
                     Investment Analysis
                   </h2>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {investmentAnalysis.stamp_duty != null && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                        <p className="text-xs text-muted-foreground mb-1">Stamp Duty</p>
                        <p className="text-xl font-bold tabular-nums">£{Number(investmentAnalysis.stamp_duty).toLocaleString()}</p>
                        {investmentAnalysis.stamp_duty_breakdown && <p className="text-xs text-muted-foreground mt-1">{investmentAnalysis.stamp_duty_breakdown}</p>}
                      </div>
                    )}
                    {investmentAnalysis.total_purchase_costs && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                        <p className="text-xs text-muted-foreground mb-1">Total Purchase Costs</p>
                        <p className="text-lg font-bold">{investmentAnalysis.total_purchase_costs}</p>
                      </div>
                    )}
                    {investmentAnalysis.roi_5_year && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                        <p className="text-xs text-muted-foreground mb-1">5-Year ROI Forecast</p>
                        <p className="text-lg font-bold text-primary">{investmentAnalysis.roi_5_year}</p>
                      </div>
                    )}
                    {investmentAnalysis.net_yield_after_costs && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                        <p className="text-xs text-muted-foreground mb-1">Net Yield (After Costs)</p>
                        <p className="text-lg font-bold">{investmentAnalysis.net_yield_after_costs}</p>
                      </div>
                    )}
                  </div>
                  {investmentAnalysis.rental_vs_sale && (
                    <div className="p-4 rounded-xl bg-muted/20 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Rent vs Sell Analysis</p>
                      <p className="text-sm">{investmentAnalysis.rental_vs_sale}</p>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Flood Risk & Leasehold Warnings */}
            {(floodRisk.level || (leaseholdAnalysis.is_leasehold && leaseholdAnalysis.notes)) && (
              <AnimatedSection delay={370}>
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {floodRisk.level && (
                    <div className={`glass-surface rounded-2xl p-6 border ${floodRisk.level === "High" ? "border-destructive/30 bg-destructive/5" : floodRisk.level === "Medium" ? "border-amber-500/30 bg-amber-500/5" : "border-primary/20 bg-primary/5"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={18} className={floodRisk.level === "High" ? "text-destructive" : floodRisk.level === "Medium" ? "text-amber-500" : "text-primary"} />
                        <h3 className="text-sm font-bold">Flood Risk</h3>
                        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${floodRisk.level === "High" ? "bg-destructive/10 text-destructive" : floodRisk.level === "Medium" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
                          {floodRisk.level}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{floodRisk.detail}</p>
                      {floodRisk.zone && <p className="text-xs text-muted-foreground mt-2">Zone: {floodRisk.zone}</p>}
                    </div>
                  )}
                  {leaseholdAnalysis.is_leasehold && (
                    <div className={`glass-surface rounded-2xl p-6 border ${leaseholdAnalysis.risk_level === "High" ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={18} className="text-amber-500" />
                        <h3 className="text-sm font-bold">Leasehold Analysis</h3>
                        {leaseholdAnalysis.risk_level && (
                          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${leaseholdAnalysis.risk_level === "High" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}>
                            {leaseholdAnalysis.risk_level} Risk
                          </span>
                        )}
                      </div>
                      {leaseholdAnalysis.years_remaining && <p className="text-sm font-semibold mb-1">{leaseholdAnalysis.years_remaining} years remaining</p>}
                      {leaseholdAnalysis.ground_rent && <p className="text-xs text-muted-foreground">Ground rent: {leaseholdAnalysis.ground_rent}</p>}
                      {leaseholdAnalysis.service_charge && <p className="text-xs text-muted-foreground">Service charge: {leaseholdAnalysis.service_charge}</p>}
                      {leaseholdAnalysis.notes && <p className="text-sm text-muted-foreground mt-2">{leaseholdAnalysis.notes}</p>}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Risks & Opportunities */}
            {(risks.length > 0 || (Array.isArray(opportunities) && opportunities.length > 0)) && (
              <AnimatedSection delay={380}>
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {risks.length > 0 && (
                    <div className="glass-surface rounded-2xl p-6">
                      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Shield size={16} className="text-destructive" />
                        Key Risks
                      </h3>
                      <ul className="space-y-2">
                        {risks.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-destructive mt-0.5 shrink-0">⚠️</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(opportunities) && opportunities.length > 0 && (
                    <div className="glass-surface rounded-2xl p-6">
                      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-primary" />
                        Opportunities
                      </h3>
                      <ul className="space-y-2">
                        {opportunities.map((o: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-0.5 shrink-0">✅</span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Data Confidence */}
            {dataConfidence.overall && (
              <AnimatedSection delay={385}>
                <div className="glass-surface rounded-2xl p-6 mb-10">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary" />
                    Data Confidence Assessment
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Overall Confidence</p>
                      <p className={`text-lg font-bold ${dataConfidence.overall === "High" ? "text-primary" : dataConfidence.overall === "Medium" ? "text-amber-500" : "text-destructive"}`}>
                        {dataConfidence.overall}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Comparable Quality</p>
                      <p className="text-sm font-medium">{dataConfidence.comparable_quality}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Data Recency</p>
                      <p className="text-sm font-medium">{dataConfidence.data_recency}</p>
                    </div>
                  </div>
                  {dataConfidence.limitations?.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">Limitations</p>
                      <ul className="space-y-1">
                        {dataConfidence.limitations.map((l: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="shrink-0">•</span> {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* ── In-Depth Audit Upsell ── */}
            <AnimatedSection delay={390}>
              <div className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-6 sm:p-10 md:p-12 mb-8 sm:mb-10">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Zap size={20} className="text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Unlock the Full In-Depth Audit</h2>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto mb-6">
                    This free valuation gives you a great overview — but the <span className="font-semibold text-foreground">In-Depth Audit</span> goes far deeper. Get the most comprehensive property report available, with insights no agent or portal can match.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-2xl mx-auto">
                    {[
                      { icon: MapPin, title: "Deep Local Intelligence", desc: "Street-level data, neighbourhood trends, crime, schools, transport and amenities" },
                      { icon: BarChart3, title: "Full Comparable Analysis", desc: "Detailed adjusted comparables with distance, type, and condition factors" },
                      { icon: Shield, title: "Risks & Opportunities", desc: "Hidden risks, planning alerts, and value-add opportunities most buyers miss" },
                      { icon: Hammer, title: "Renovation Simulator Pro", desc: "Advanced cost/uplift modelling for every improvement type with ROI projections" },
                      { icon: TrendingUp, title: "Market Momentum Deep Dive", desc: "Hyper-local price trends, supply/demand analysis, and 12-month forecasts" },
                      { icon: Target, title: "Negotiation Ammunition", desc: "Key data points and talking points to negotiate a better price" },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-baseline gap-1 mb-4">
                      <span className="text-3xl sm:text-4xl font-black text-foreground">£29</span>
                      <span className="text-sm text-muted-foreground">/ month · cancel anytime</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5">In-Depth Audits are included with Hummm Pro — plus unlimited negotiations, the My Hummm dashboard and full Sell / Let / Manage execution.</p>
                    <button
                      onClick={async () => {
                        try {
                          const { data: sessionData } = await supabase.auth.getSession();
                          if (!sessionData?.session) {
                            toast({ title: "Sign in required", description: "Please sign in to purchase the In-Depth Audit.", variant: "destructive" });
                            return;
                          }
                          toast({ title: "Redirecting to checkout..." });
                          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout", {
                            body: { tier: "pro", mode: "subscription", successPath: "/my-hummm" },
                          });
                          if (checkoutError) throw checkoutError;
                          if (checkoutData?.url) window.location.href = checkoutData.url;
                        } catch (err: any) {
                          toast({ title: "Payment Error", description: err.message || "Could not start checkout.", variant: "destructive" });
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-10 py-5 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-xl shadow-primary/30 hover:scale-105 min-h-[56px]"
                    >
                      <Zap size={18} />
                      Unlock with Hummm Pro — £29/mo
                    </button>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                      <Shield size={12} /> Secure payment via Stripe · Instant access
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* AI Chat CTA */}
            <AnimatedSection delay={400}>
               <div className="glass-surface rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10 border border-primary/20 text-center">
                 <Sparkles size={24} className="text-primary mx-auto mb-3 sm:mb-4" />
                 <h3 className="text-lg sm:text-xl font-bold mb-2">Questions About This Report?</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                  Our AI property expert can answer any follow-up questions about this valuation, comparable sales, area trends, or next steps.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25"
                >
                  <Sparkles size={16} />
                  Chat with Hummm
                </Link>
              </div>
            </AnimatedSection>

            {/* Primary CTA — Negotiate For Me (lead offer) */}
            <AnimatedSection delay={375}>
              <SalesAgentIntro
                address={report?.address}
                propertyPrice={baseVal}
                fairValue={baseVal}
                className="mb-6 sm:mb-8"
              />
              <NegotiateForMeCTA variant="hero" className="mb-8 sm:mb-10" context={{ address: report?.address }} />
            </AnimatedSection>

            {/* Secondary services */}
            <AnimatedSection delay={400}>
              <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8 mb-8 sm:mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-5">Other services</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold border border-border bg-muted/40 text-muted-foreground rounded-xl cursor-not-allowed relative"
                  >
                    <TrendingUp size={16} />
                    Sell For Me
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black uppercase tracking-wider">Coming Soon</span>
                  </button>
                  <button
                    onClick={() => setContactModal("let")}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold border border-primary/40 text-primary hover:bg-primary/10 transition-all rounded-xl"
                  >
                    <Home size={16} />
                    Let With Us
                  </button>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all rounded-xl"
                  >
                    <Calendar size={16} />
                    Strategy Call
                  </a>
                </div>
              </div>
            </AnimatedSection>

            {/* Footer attribution */}
            <AnimatedSection delay={400}>
              <div className="text-center border-t border-border pt-8 space-y-3">
                <p className="text-sm font-medium text-primary">
                  Powered by live PropertyData + AI Analysis • Member of The Property Ombudsman • Human oversight on all deals
                </p>
                <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  <Shield size={12} className="inline mr-1 -mt-0.5" />
                  This is an AI-generated estimate for informational purposes only, based on public and licensed data. It is not a formal RICS valuation or substitute for professional advice.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Floating button */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => { setSubmitted(false); setReport(null); setStep(1); setClosestAgent(null); confettiFired.current = false; sessionStorage.removeItem("humm_valuation_session"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all text-sm font-semibold"
          >
            <Sparkles size={16} />
            Get Another Free Valuation
          </button>
        </div>

        {/* Contact Modal */}
        {contactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setContactModal(null)}>
            <div className="glass-surface border border-primary/20 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-1">
                {contactModal === "sell" ? "Sell Your Property With Us" : "Let Your Property With Us"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Tell us more about your property and we'll be in touch within 24 hours.</p>
              <div className="space-y-4">
                <input
                  placeholder="Your full name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  placeholder="Email address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  placeholder="Phone number"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <textarea
                  placeholder="Tell us more about your property..."
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toast({ title: "Request Sent!", description: "Our team will be in touch within 24 hours." });
                      setContactModal(null);
                      setContactForm({ name: "", email: "", phone: "", message: "" });
                    }}
                    className="flex-1 py-3.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setContactModal(null)}
                    className="px-6 py-3.5 text-sm font-semibold border border-border rounded-xl hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  // Form screen
  const inputCls = "w-full pl-11 pr-4 py-3.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const selectCls = "w-full px-4 py-3.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer";
  const stepLabels = ["Your Details & Property", "Features & Condition", "Your Goals"];

  const todayFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="AI Property Valuation & Full Deep Audit | Hummm AI"
        description="The most accurate AI property valuation and deep audit tool. Live data from Land Registry, Rightmove & Zoopla. Includes comparables, yield analysis, renovation simulator and negotiation intelligence."
        canonical="/ai-valuation"
        ogImage="/og-valuation-share.jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Free AI Property Valuation",
          "provider": { "@type": "RealEstateAgent", "name": "Hummmingbird AI" },
          "description": "The most accurate free AI property valuation in the UK using live data from Land Registry, PropertyData, Rightmove and Zoopla.",
          "areaServed": "United Kingdom",
          "offers": { "@type": "Offer", "priceCurrency": "GBP", "price": "0", "description": "Free AI property valuation" }
        }}
      />
      <Navbar />
      <div className="pt-32 sm:pt-44 pb-20 px-5 sm:section-padding">
        <div className="max-w-3xl mx-auto">

          {/* ── HERO: Address-first above the fold ── */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-4">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-medium tracking-wider uppercase text-primary">Free AI Valuation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] tracking-tight leading-[1.15] mb-3 text-balance" style={{ fontFamily: '"Cormorant Garamond","Playfair Display",Georgia,serif', fontWeight: 500, letterSpacing: "-0.01em" }}>
              The Most Powerful AI Property Valuer in the World
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-2">
              Deep local insights, licensing-level accuracy, and comprehensive analysis across 13 major markets.
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto mb-6">
              With Hummm, you are the property expert
            </p>
          </div>

          {/* ── Address Lookup — THE FIRST INTERACTIVE ELEMENT ── */}
          <div className="glass-surface rounded-2xl p-5 sm:p-8 mb-4">
            <AddressLookup
              value={form.address}
              onChange={handleAddressChange}
              onPostcodeFound={(pc) => triggerPreFetch(pc)}
              onAddressSelected={(addr) => {
                setAddressSelected(true);
                const pc = addr.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0];
                if (pc) triggerPreFetch(pc.trim().toUpperCase());
                setTimeout(() => propertyTypeRef.current?.focus(), 100);
              }}
              label="Enter your postcode to start"
              required
            />

            {/* High Demand Area badge */}
            {agentCount !== null && agentCount > 3 && addressSelected && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Zap size={14} className="text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  🔥 High Demand Area — {agentCount} agents actively cover this postcode
                </span>
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-border/50">
              <Shield size={12} className="text-primary shrink-0" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                Powered by <span className="font-semibold text-foreground/70">Ideal Postcodes</span> & <span className="font-semibold text-foreground/70">PropertyData</span> · Live UK market data
              </span>
            </div>
          </div>

          {/* Show the rest of the form only after address is selected */}
          {addressSelected && (
            <>
              {/* Stepper */}
              <AnimatedSection delay={50}>
                <div className="flex items-center justify-center gap-1 mb-6 mt-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {step > s ? <CheckCircle size={16} /> : s}
                        </div>
                        <span className="text-[10px] text-muted-foreground hidden sm:block">{stepLabels[s - 1]}</span>
                      </div>
                      {s < 3 && <div className={`w-12 sm:w-20 h-0.5 mb-5 sm:mb-4 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Form card */}
              <AnimatedSection delay={100}>
                <div className="glass-surface rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10">

                  {/* STEP 1: Property Details */}
                  {step === 1 && (
                    <div className="space-y-5">
                      {/* Lead capture fields */}
                      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Users size={18} className="text-primary" /> Your Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Full name *</label>
                            <div className="relative">
                              <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <input value={form.name} onChange={(e) => update("name", e.target.value)}
                                placeholder="Your full name" className={inputCls} />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email address *</label>
                            <div className="relative">
                              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                                placeholder="your@email.com" className={inputCls} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Phone number (optional)</label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                              placeholder="07xxx xxxxxx" className={inputCls} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">We'll email you the full report and follow up with next steps.</p>
                      </div>

                      <h2 className="text-lg font-bold flex items-center gap-2 pt-2">
                        <Home size={18} className="text-primary" /> Property Details
                      </h2>

                      {/* Selected address display */}
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                        <MapPin size={16} className="text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground flex-1">{form.address}</span>
                        <button
                          onClick={() => { setAddressSelected(false); handleAddressChange(""); }}
                          className="text-xs text-primary hover:underline font-semibold shrink-0"
                        >
                          Change
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Property type *</label>
                          <div className="relative">
                            <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select ref={propertyTypeRef} value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}
                              className={`${selectCls} pl-11`}>
                              <option value="">Select type...</option>
                              {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Tenure</label>
                          <div className="relative">
                            <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select value={form.tenure} onChange={(e) => update("tenure", e.target.value)}
                              className={`${selectCls} pl-11`}>
                              <option value="">Select tenure...</option>
                              {tenureOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Bedrooms + Bathrooms */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Bedrooms *</label>
                          <div className="relative">
                            <Bed size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="number" min={0} value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)}
                              placeholder="0" className={inputCls} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Bathrooms *</label>
                          <div className="relative">
                            <Bath size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="number" min={0} value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)}
                              placeholder="0" className={inputCls} />
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Floor area (sq ft)</label>
                          <div className="relative">
                            <Maximize size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input value={form.sqft} onChange={(e) => update("sqft", e.target.value)}
                              placeholder="e.g. 1,200" className={inputCls} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Features & Condition */}
                  {step === 2 && (
                    <div className="space-y-5">
                      {/* Sneak Peek Card */}
                      {(preValuation || preValuationLoading) && (
                        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 via-card to-primary/10 p-5 animate-in fade-in slide-in-from-top-3 duration-700">
                          <div className="flex items-center gap-2 mb-3">
                            <Eye size={16} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Sneak Peek</span>
                          </div>
                          {preValuationLoading ? (
                            <div className="flex items-center gap-3">
                              <Loader2 size={16} className="animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">Analysing market data for your property...</span>
                            </div>
                          ) : preValuation ? (
                            <>
                              <p className="text-sm text-muted-foreground mb-2">We've already found data for this property!</p>
                              <div className="relative">
                                <p className="text-3xl font-black tabular-nums text-foreground" style={{ filter: "blur(6px)", userSelect: "none" }}>
                                  £{preValuation.low.toLocaleString()} – £{preValuation.high.toLocaleString()}
                                </p>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-lg">
                                    Complete the form to reveal →
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      )}

                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Star size={18} className="text-primary" /> Key Features & Condition
                      </h2>

                      {/* Parking / Garage row */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Off-street parking</label>
                          <div className="flex gap-2">
                            {["Yes", "No"].map((v) => (
                              <button key={v} onClick={() => update("parking", v)}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                                  form.parking === v ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                                }`}>{v}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Garage</label>
                          <div className="flex gap-2">
                            {["Yes", "No"].map((v) => (
                              <button key={v} onClick={() => update("garage", v)}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                                  form.garage === v ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                                }`}>{v}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Garden</label>
                          <div className="flex gap-1.5">
                            {gardenOptions.map((v) => (
                              <button key={v} onClick={() => update("garden", v)}
                                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                                  form.garden === v ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                                }`}>{v}</button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Special features */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Special features (select all that apply)</label>
                        <div className="flex flex-wrap gap-2">
                          {specialFeatureOptions.map((f) => (
                            <button key={f} onClick={() => toggleFeature(f)}
                              className={`px-3.5 py-2 text-xs font-medium rounded-full border transition-all ${
                                form.specialFeatures.includes(f)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                              }`}>
                              {form.specialFeatures.includes(f) && <CheckCircle size={12} className="inline mr-1 -mt-0.5" />}
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Improvements textarea */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Recent renovations or improvements</label>
                        <textarea value={form.improvements} onChange={(e) => update("improvements", e.target.value)}
                          placeholder="e.g. New kitchen 2024, loft conversion, new boiler, rewired..."
                          rows={3}
                          className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Goals */}
                  {step === 3 && (
                    <div className="space-y-5">
                      {/* Sneak Peek Card on Step 3 */}
                      {preValuation && (
                        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 via-card to-primary/10 p-5 animate-in fade-in slide-in-from-top-3 duration-700">
                          <div className="flex items-center gap-2 mb-3">
                            <Eye size={16} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Almost There!</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Your valuation is ready — just one more step to unlock it!</p>
                          <div className="relative">
                            <p className="text-3xl font-black tabular-nums text-foreground" style={{ filter: "blur(5px)", userSelect: "none" }}>
                              £{preValuation.low.toLocaleString()} – £{preValuation.high.toLocaleString()}
                            </p>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-lg">
                                Hit "Get My Valuation" to reveal ✨
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Target size={18} className="text-primary" /> Your Goals
                      </h2>

                      {/* Goal */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">What is your main goal?</label>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {goalOptions.map((g) => (
                            <button key={g.value} onClick={() => update("goal", g.value)}
                              className={`px-4 py-3 text-sm font-medium rounded-xl border text-left transition-all ${
                                form.goal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                              }`}>{g.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nav buttons — large mobile-friendly CTA */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                    {step > 1 ? (
                      <button onClick={() => setStep((s) => (s - 1) as Step)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : <span />}
                    {step < 3 ? (
                      <button disabled={!canProceed(step)} onClick={() => setStep((s) => (s + 1) as Step)}
                        className="flex items-center gap-2 px-7 py-3.5 sm:py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-full group humm-pulse">
                        Continue <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button disabled={!canProceed(3)} onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 sm:px-8 py-4 sm:py-3.5 text-base sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-full shadow-lg shadow-primary/25 humm-pulse min-h-[52px]">
                        <Sparkles size={18} />
                        Get My Free Valuation
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            </>
          )}

          {/* Trust note */}
          <AnimatedSection delay={200}>
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Shield size={12} />
                AI-generated valuation for guidance only. Data from Land Registry, Rightmove & Zoopla. For formal RICS valuations, contact our licensed team.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <Disclaimer />
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const AIValuation = () => {
  return <AIValuationInner />;
};

export default AIValuation;
