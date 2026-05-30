import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Bot, CheckCircle2, Target, Sparkles,
  Loader2, Send, Home, Building2, Key, Users,
  Zap, FileText, Check, Plus, Trash2, Smile, Briefcase, Flame, Swords, ArrowRightCircle, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useHumm } from "@/contexts/HummContext";
import { Skeleton } from "@/components/ui/skeleton";

const roles = [
  { value: "buyer", label: "Buyer", icon: Home, desc: "I want to buy a property" },
  { value: "seller", label: "Seller", icon: Building2, desc: "I want to sell my property" },
  { value: "renter", label: "Renter", icon: Key, desc: "I want to rent a property" },
  { value: "landlord", label: "Landlord", icon: Users, desc: "I manage rental properties" },
];

const tones = [
  { value: "polite", label: "Polite", icon: Smile, desc: "Warm & courteous" },
  { value: "professional", label: "Professional", icon: Briefcase, desc: "Balanced & business-like" },
  { value: "firm", label: "Firm", icon: Flame, desc: "Direct & decisive" },
  { value: "assertive", label: "Assertive", icon: Swords, desc: "Confident & forceful" },
] as const;
type ToneValue = typeof tones[number]["value"];

const goalPlaceholders: Record<string, string> = {
  buyer: "e.g. I want to offer £1,050,000 — the property has been on market 90+ days and I'm chain-free",
  seller: "e.g. I want to achieve the highest possible sale price — I've had 2 offers under asking",
  renter: "e.g. I want to negotiate 3 months rent-free or a 10% reduction on the asking rent",
  landlord: "e.g. I want to increase rent from £1,200 to £1,400 pcm while retaining a good tenant",
};

const stepLabels = ["Your Brief", "Strategy & Draft", "Sent"];

const PlanSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <Skeleton className="h-24 w-full rounded-2xl" />
    <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}</div>
    <Skeleton className="h-[300px] w-full rounded-2xl" />
    <Skeleton className="h-20 w-full rounded-2xl" />
  </div>
);

const ProgressIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center justify-center gap-2 mb-12">
    {stepLabels.map((label, i) => (
      <div key={label} className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${
          i < step ? "bg-primary/20 text-primary scale-95" :
          i === step ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(0,229,204,0.3)] scale-100" :
          "bg-muted/30 text-muted-foreground scale-95"
        }`}>
          {i < step ? <Check size={12} /> : <span className="tabular-nums">{i + 1}</span>}
          <span className="hidden sm:inline">{label}</span>
        </div>
        {i < stepLabels.length - 1 && (
          <div className={`w-8 h-px transition-all duration-500 ${i < step ? "bg-primary" : "bg-border"}`} />
        )}
      </div>
    ))}
  </div>
);

interface PropertyRow { url: string; address: string; }
interface StrategyOption { label: string; summary: string; rationale: string; }
interface NegotiationPlan {
  situationSummary: string;
  strategyOptions: StrategyOption[];
  recommendedEmail: { subject: string; body: string };
  nextMove: string;
}

const NegotiationWizard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentRole, userEmail, userId } = useHumm();
  const location = useLocation();

  const prefill = (location.state as any) || {};

  const [step, setStep] = useState(0);
  const [role, setRole] = useState(prefill.role || currentRole || "buyer");
  const [goal, setGoal] = useState(prefill.goal || "");
  const [instructions, setInstructions] = useState(prefill.instructions || "");
  const [tone, setTone] = useState<ToneValue>("professional");
  const [properties, setProperties] = useState<PropertyRow[]>([
    { url: prefill.propertyUrl || "", address: prefill.propertyAddress || "" },
  ]);

  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<NegotiationPlan | null>(null);
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [previousEmails, setPreviousEmails] = useState<any[]>([]);

  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [agentEmail, setAgentEmail] = useState(prefill.agentEmail || "");

  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  useEffect(() => {
    if (prefill.monthlyRent && prefill.role === "renter" && !goal) {
      const addr = prefill.propertyAddress || "this property";
      const rent = Number(prefill.monthlyRent).toLocaleString();
      const pct = Math.abs(prefill.priceDiffPercent || 0);
      if (prefill.marketVerdict === "above_market") {
        setGoal(`I'm looking to negotiate the rent on ${addr}. The asking rent is £${rent}/month which our AI analysis shows is approximately ${pct}% above the local market rate.`);
      } else if (prefill.marketVerdict === "at_market" || prefill.marketVerdict === "below_market") {
        setGoal(`I'm looking to negotiate the rent on ${addr} (asking £${rent}/month, broadly in line with market). I'd like to negotiate on terms — break clause, furnishings, or start date.`);
      }
    } else if (prefill.askingPrice && prefill.fairValue && !goal) {
      const diff = prefill.askingPrice - prefill.fairValue;
      if (diff > 0) {
        setGoal(`I want to negotiate below the asking price of £${prefill.askingPrice?.toLocaleString()}. Based on my research, fair value is around £${prefill.fairValue?.toLocaleString()}.`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem("humm_post_login_redirect", "/negotiate-for-me");
      sessionStorage.setItem("humm_negotiate_prefill", JSON.stringify({ role, goal, instructions, properties, tone }));
    }
  }, [isLoggedIn, role, goal, instructions, properties, tone]);

  const validProperties = useMemo(
    () => properties.filter(p => p.url.trim().length > 5 || p.address.trim().length > 3),
    [properties]
  );
  const canProceedStep0 = goal.trim().length > 10 && validProperties.length > 0;

  const addProperty = () => setProperties(prev => [...prev, { url: "", address: "" }]);
  const removeProperty = (i: number) => setProperties(prev => prev.filter((_, idx) => idx !== i));
  const updateProperty = (i: number, patch: Partial<PropertyRow>) =>
    setProperties(prev => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const loadPreviousEmails = async (): Promise<any[]> => {
    if (!userId) return [];
    const addresses = validProperties.map(p => p.address || p.url).filter(Boolean);
    if (!addresses.length) return [];
    try {
      const { data: convs } = await supabase
        .from("negotiation_conversations")
        .select("id, property_address")
        .eq("user_id", userId)
        .in("property_address", addresses);
      const ids = (convs || []).map((c: any) => c.id);
      if (!ids.length) return [];
      const { data: emails } = await supabase
        .from("negotiation_emails")
        .select("direction, subject, body, sent_at")
        .in("conversation_id", ids)
        .order("sent_at", { ascending: true })
        .limit(20);
      return (emails || []).map((e: any) => ({
        direction: e.direction, subject: e.subject, body: e.body, sentAt: e.sent_at,
      }));
    } catch (e) {
      console.warn("loadPreviousEmails failed", e);
      return [];
    }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    setPlan(null);
    setSelectedOption(-1);
    try {
      const { data: profile } = await supabase
        .from("profiles").select("name").eq("user_id", userId!).maybeSingle();
      const userName = (profile as any)?.name || userEmail?.split("@")[0] || "the client";

      const prior = await loadPreviousEmails();
      setPreviousEmails(prior);

      const { data, error } = await supabase.functions.invoke("negotiation-strategy", {
        body: {
          role, goal, instructions, tone, userName,
          properties: validProperties.map(p => ({ url: p.url, address: p.address || p.url })),
          previousEmails: prior,
        },
      });
      if (error) throw error;
      if (!data?.recommendedEmail) throw new Error("Plan missing recommended email");

      setPlan(data as NegotiationPlan);
      setDraftSubject(data.recommendedEmail.subject || "Property Enquiry");
      setDraftBody(data.recommendedEmail.body || "");
    } catch (e: any) {
      console.error("Plan generation error:", e);
      toast.error("Could not generate plan. Please try again.");
    } finally {
      setPlanLoading(false);
    }
  };

  const regenerateForOption = async (optionIdx: number) => {
    if (!plan) return;
    setSelectedOption(optionIdx);
    if (optionIdx < 0) {
      setDraftSubject(plan.recommendedEmail.subject);
      setDraftBody(plan.recommendedEmail.body);
      return;
    }
    const opt = plan.strategyOptions[optionIdx];
    setPlanLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles").select("name").eq("user_id", userId!).maybeSingle();
      const userName = (profile as any)?.name || userEmail?.split("@")[0] || "the client";

      const { data, error } = await supabase.functions.invoke("negotiation-strategy", {
        body: {
          role, tone, userName,
          goal: `${goal}\n\nUser has chosen the "${opt.label}" strategy: ${opt.summary}. Draft the email to execute exactly this strategy.`,
          instructions,
          properties: validProperties.map(p => ({ url: p.url, address: p.address || p.url })),
          previousEmails,
        },
      });
      if (error) throw error;
      setDraftSubject(data.recommendedEmail.subject);
      setDraftBody(data.recommendedEmail.body);
    } catch (e) {
      console.error(e);
      toast.error("Could not regenerate draft.");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setSendProgress(10);
    try {
      const { data: profile } = await supabase
        .from("profiles").select("name").eq("user_id", userId!).maybeSingle();
      const senderName = (profile as any)?.name || userEmail?.split("@")[0] || "User";
      setSendProgress(25);

      const primary = validProperties[0];
      const primaryAddress = primary.address || primary.url;
      const primaryUrl = primary.url;

      const replyToId = crypto.randomUUID();
      const { data: convData, error: convError } = await supabase
        .from("negotiation_conversations")
        .insert({
          user_id: userId!,
          property_address: primaryAddress,
          property_url: primaryUrl,
          agent_name: null,
          agent_email: agentEmail || null,
          reply_to_id: replyToId,
          status: "active",
        } as any)
        .select()
        .single();

      if (convError) throw convError;
      setSendProgress(50);

      await supabase.from("negotiation_emails").insert({
        conversation_id: (convData as any).id,
        direction: "outbound",
        sender_name: `${senderName} via Hummm`,
        sender_email: "hello@hummm.pro",
        subject: draftSubject,
        body: draftBody,
        ai_drafted: true,
        status: agentEmail ? "sent" : "draft",
      } as any);

      setSendProgress(70);

      await supabase.from("negotiation_messages").insert({
        user_id: userId!,
        property_address: validProperties.map(p => p.address || p.url).join(" | "),
        ai_draft_subject: draftSubject,
        ai_draft_body: draftBody,
        listing_type: role === "renter" ? "rent" : "sale",
        status: "strategy_drafted",
        notes: `Tone: ${tone}. Goal: ${goal}. Instructions: ${instructions}. Properties: ${validProperties.length}.`,
      });

      setSendProgress(85);

      if (agentEmail) {
        await supabase.functions.invoke("send-agent-email", {
          body: {
            to: agentEmail, subject: draftSubject, body: draftBody,
            propertyUrl: primaryUrl, propertyAddress: primaryAddress, senderName,
          },
        });
      }

      setSendProgress(100);
      setStep(2);
      toast.success(agentEmail ? "Email sent to agent! 🎉" : "Negotiation started! Draft saved.");

      setTimeout(() => {
        navigate(`/dashboard?tab=negotiations&thread=${(convData as any).id}`);
      }, 3500);
    } catch (e: any) {
      console.error("Send error:", e);
      toast.error("Something went wrong. Your draft has been saved.");
      setStep(2);
    } finally {
      setSending(false);
    }
  };

  const handleStep0Next = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem("humm_post_login_redirect", "/negotiate-for-me");
      navigate("/auth");
      return;
    }
    setStep(1);
    generatePlan();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Hummm | Your AI Property Companion | Hummm"
        description="Hummm – your AI companion that travels with you. Strategy, emails, objections, and data to help you make confident property decisions."
        canonical="/negotiate-for-me"
      />
      <Navbar />

      <div className="pt-24 sm:pt-28 pb-20 px-5 sm:section-padding">
        <div className="max-w-3xl mx-auto">

          <ProgressIndicator step={step} />

          {step === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-4">
                  <Bot size={14} /> AI Negotiation Companion
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">Hummm</h1>
                <p className="text-muted-foreground text-base text-pretty">
                  Add one or several properties, pick your tone, and Hummm returns a situation summary, three strategy options, a ready-to-send email, and the suggested next move.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Properties <span className="text-muted-foreground font-normal">({properties.length})</span>
                  </Label>
                  <button type="button" onClick={addProperty}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition">
                    <Plus size={14} /> Add property
                  </button>
                </div>
                <div className="space-y-3">
                  {properties.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-border/50 bg-card/40 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Property {i + 1}</span>
                        {properties.length > 1 && (
                          <button type="button" onClick={() => removeProperty(i)}
                            className="text-muted-foreground hover:text-destructive transition p-1" aria-label="Remove property">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <Input placeholder="Paste Rightmove, Zoopla, or any listing URL"
                        value={p.url} onChange={e => updateProperty(i, { url: e.target.value })}
                        className="h-11 rounded-lg bg-background border-border/60" />
                      <Input placeholder="Address (optional, e.g. 42 Oak Lane, London SW1A 1AA)"
                        value={p.address} onChange={e => updateProperty(i, { address: e.target.value })}
                        className="h-11 rounded-lg bg-background border-border/60" />
                    </div>
                  ))}
                </div>
                {properties.length > 1 && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={11} className="text-primary" />
                    Hummm will write a single multi-property enquiry covering all listings.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Your Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(r => {
                    const Icon = r.icon;
                    const active = role === r.value;
                    return (
                      <button key={r.value} onClick={() => setRole(r.value)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.97] ${
                          active ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,229,204,0.12)]"
                                 : "border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/60"
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary/20" : "bg-muted/30"}`}>
                          <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${active ? "text-foreground" : "text-foreground/80"}`}>{r.label}</p>
                          <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Negotiation Tone</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {tones.map(t => {
                    const Icon = t.icon;
                    const active = tone === t.value;
                    return (
                      <button key={t.value} onClick={() => setTone(t.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 active:scale-[0.97] ${
                          active ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(0,229,204,0.12)]"
                                 : "border-border/50 bg-card/40 hover:border-primary/30"
                        }`}>
                        <Icon size={16} className={active ? "text-primary" : "text-muted-foreground"} />
                        <span className={`text-xs font-bold ${active ? "text-foreground" : "text-foreground/80"}`}>{t.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Your Goal</Label>
                <Textarea placeholder={goalPlaceholders[role] || "What do you want to achieve?"}
                  value={goal} onChange={e => setGoal(e.target.value)}
                  className="min-h-[100px] rounded-xl bg-card border-border/60" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Special Instructions <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea placeholder="e.g. Must complete by end of month, no chain, cash buyer, etc."
                  value={instructions} onChange={e => setInstructions(e.target.value)}
                  className="min-h-[80px] rounded-xl bg-card border-border/60" />
              </div>

              <Button onClick={handleStep0Next} disabled={!canProceedStep0}
                className="w-full h-14 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 transition-all">
                <Sparkles size={18} className="mr-2" />
                {isLoggedIn ? "Generate Strategy & Draft" : "Sign In to Start"}
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {planLoading && !plan && <PlanSkeleton />}

              {plan && (
                <>
                  {previousEmails.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold">
                      <History size={12} /> Using context from {previousEmails.length} previous email{previousEmails.length === 1 ? "" : "s"}
                    </div>
                  )}

                  {/* PART 1 */}
                  <section className="rounded-2xl border border-border/50 bg-card/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Target size={14} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1 · Situation Summary</h3>
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground/90">{plan.situationSummary}</p>
                  </section>

                  {/* PART 2 */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Sparkles size={14} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2 · Strategy Options · Pick One</h3>
                    </div>
                    <div className="grid gap-3">
                      {plan.strategyOptions.map((opt, i) => {
                        const active = selectedOption === i;
                        return (
                          <button key={i} onClick={() => regenerateForOption(i)} disabled={planLoading}
                            className={`text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.99] disabled:opacity-60 ${
                              active ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,229,204,0.15)]"
                                     : "border-border/50 bg-card/40 hover:border-primary/40 hover:bg-card/60"
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="font-bold text-[15px]">{opt.label}</span>
                              </div>
                              {active && <Check size={16} className="text-primary" />}
                            </div>
                            <p className="text-sm text-foreground/85 leading-relaxed mb-2">{opt.summary}</p>
                            <p className="text-xs text-muted-foreground italic leading-relaxed">{opt.rationale}</p>
                          </button>
                        );
                      })}
                      <button onClick={() => regenerateForOption(-1)} disabled={planLoading}
                        className={`text-left p-3 rounded-xl border text-xs font-medium transition ${
                          selectedOption === -1 ? "border-primary/40 bg-primary/5 text-primary"
                                                : "border-dashed border-border text-muted-foreground hover:border-primary/30"
                        }`}>
                        ↺ Use Hummm's recommended balance (default)
                      </button>
                    </div>
                  </section>

                  {/* PART 3 */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <FileText size={14} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        3 · Ready-to-Send Email · {tones.find(t => t.value === tone)?.label} tone
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card/40 p-5 space-y-4 relative">
                      {planLoading && (
                        <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary">
                            <Loader2 size={14} className="animate-spin" /> Re-drafting…
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-12">To</label>
                        <Input placeholder="Agent email (optional)" value={agentEmail}
                          onChange={e => setAgentEmail(e.target.value)}
                          className="flex-1 h-10 rounded-lg bg-background border-border/60" />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-12">Subj</label>
                        <Input value={draftSubject} onChange={e => setDraftSubject(e.target.value)}
                          className="flex-1 h-10 rounded-lg bg-background border-border/60 font-medium" />
                      </div>
                      <Textarea value={draftBody} onChange={e => setDraftBody(e.target.value)}
                        className="min-h-[260px] rounded-xl bg-background border-border/60 leading-relaxed text-[15px]" />
                    </div>
                  </section>

                  {/* PART 4 */}
                  <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                        <ArrowRightCircle size={14} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-primary">4 · Suggested Next Move</h3>
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground/90">{plan.nextMove}</p>
                  </section>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(0)} disabled={sending}
                      className="flex-1 h-12 rounded-xl">
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                    <Button onClick={handleSend} disabled={planLoading || sending || !draftBody.trim()}
                      className="flex-[2] h-12 rounded-xl font-bold bg-primary hover:bg-primary/90">
                      {sending ? (
                        <><Loader2 size={16} className="mr-2 animate-spin" />Sending… {sendProgress}%</>
                      ) : (
                        <><Send size={16} className="mr-2" />{agentEmail ? "Send Email" : "Save Draft"}</>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">All Set!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {agentEmail
                  ? "Your negotiation email has been sent to the agent. We'll track replies and help you respond."
                  : "Your draft has been saved. You can send it anytime from your dashboard."}
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate("/dashboard?tab=negotiations")}
                  className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90">
                  <Zap size={16} className="mr-2" /> Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => {
                    setStep(0); setGoal(""); setProperties([{ url: "", address: "" }]);
                    setPlan(null); setSelectedOption(-1); setDraftSubject(""); setDraftBody("");
                  }}
                  className="h-12 px-6 rounded-xl">
                  Start New
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default NegotiationWizard;
