import { useState, useEffect } from "react";
import {
  X, Loader2, CheckCircle, Send, Shield, Sparkles,
  ChevronRight, MessageSquare, Clock, ArrowRight,
  FileText, Zap, AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Listing = {
  id: string;
  address: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string;
  date: string | null;
  source: string;
  postcode: string;
  listing?: string;
};

type NegotiationStep = "details" | "drafting" | "review" | "sent";

const STATUS_STEPS = [
  { key: "strategy_drafted", label: "Strategy Drafted", icon: FileText },
  { key: "offer_sent", label: "Offer Sent", icon: Send },
  { key: "agent_replied", label: "Agent Replied", icon: MessageSquare },
  { key: "countering", label: "Countering", icon: Zap },
];

const BUYER_STATUSES = [
  { value: "chain-free", label: "Chain-free", desc: "No property to sell first" },
  { value: "first-time-buyer", label: "First-time Buyer", desc: "No chain, often preferred" },
  { value: "has-chain", label: "Has a Chain", desc: "Need to sell before buying" },
  { value: "cash-buyer", label: "Cash Buyer", desc: "No mortgage needed" },
  { value: "investor", label: "Investor", desc: "Buy-to-let or portfolio" },
];

interface Props {
  listing: Listing;
  listingType: "sale" | "rent";
  onClose: () => void;
  lifeMetrics?: {
    summary?: { education?: string; connectivity?: string; commute?: string | null; area?: string };
    schools?: { name: string; ofsted: string }[];
  } | null;
}

export default function NegotiationWizard({ listing, listingType, onClose, lifeMetrics }: Props) {
  const [step, setStep] = useState<NegotiationStep>("details");
  const [buyerName, setBuyerName] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [buyerStatus, setBuyerStatus] = useState("chain-free");
  const [draft, setDraft] = useState<{
    subject: string;
    body: string;
    strategy: string;
    counterOptions: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerateDraft = async () => {
    if (!buyerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!maxBudget) {
      setError("Please enter your maximum budget.");
      return;
    }

    setError("");
    setStep("drafting");

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-negotiation-email",
        {
          body: {
            property: {
              address: listing.address,
              price: listing.price,
              property_type: listing.property_type,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              source: listing.source,
              date: listing.date,
            },
            buyerName,
            maxBudget: parseInt(maxBudget),
            buyerStatus,
            listingType,
            lifeMetrics: lifeMetrics ? {
              education: lifeMetrics.summary?.education,
              connectivity: lifeMetrics.summary?.connectivity,
              commute: lifeMetrics.summary?.commute,
              area: lifeMetrics.summary?.area,
              topSchool: lifeMetrics.schools?.[0]?.name,
              topSchoolOfsted: lifeMetrics.schools?.[0]?.ofsted,
            } : undefined,
          },
        }
      );

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setDraft(data);
      setStep("review");
    } catch (err: any) {
      console.error("Draft error:", err);
      setError(err.message || "Failed to generate strategy. Please try again.");
      setStep("details");
    }
  };

  const handleSendWithApproval = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      toast({
        title: "Sign in required",
        description: "Create an account to send negotiation emails.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setSending(true);
    try {
      const { data, error: insertError } = await supabase
        .from("negotiation_messages" as any)
        .insert({
          user_id: session.session.user.id,
          property_address: listing.address,
          property_price: listing.price,
          listing_type: listingType,
          max_budget: parseInt(maxBudget),
          buyer_status: buyerStatus,
          status: "offer_sent",
          ai_draft_subject: draft?.subject,
          ai_draft_body: draft?.body,
          counter_options: draft?.counterOptions || [],
          notes: draft?.strategy,
        } as any)
        .select("id")
        .single();

      if (insertError) throw insertError;
      setNegotiationId((data as any)?.id);
      setStep("sent");
      toast({ title: "Strategy Approved! ✨", description: "Your negotiation has been logged." });
    } catch (err: any) {
      console.error("Send error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save negotiation.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const currentStatusIndex = STATUS_STEPS.findIndex(
    (s) => s.key === (step === "sent" ? "offer_sent" : "strategy_drafted")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl shadow-black/20 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X size={16} className="text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold">Hummm Negotiator</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {listing.address} · £{listing.price.toLocaleString()}
          </p>

          {/* Status Timeline */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STATUS_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              return (
                <div key={s.key} className="flex items-center gap-1 shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon size={10} />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <ChevronRight
                      size={10}
                      className={isActive ? "text-primary" : "text-muted-foreground/30"}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── Step 1: Details ── */}
          {step === "details" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  {listingType === "rent" ? "Max Monthly Budget" : "Absolute Maximum Price"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder={listingType === "rent" ? "e.g. 1500" : "e.g. 450000"}
                    className="w-full pl-8 pr-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                {maxBudget && listing.price && (
                  <p className="text-[10px] mt-1.5 text-muted-foreground">
                    {parseInt(maxBudget) < listing.price
                      ? `${Math.round(((listing.price - parseInt(maxBudget)) / listing.price) * 100)}% below asking — we'll craft a strategic lower offer`
                      : "Meets asking price — we'll focus on securing priority"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">How quickly can you move?</label>
                <div className="grid grid-cols-1 gap-2">
                  {BUYER_STATUSES.map((bs) => (
                    <button
                      key={bs.value}
                      onClick={() => setBuyerStatus(bs.value)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        buyerStatus === bs.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          buyerStatus === bs.value ? "border-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {buyerStatus === bs.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{bs.label}</p>
                        <p className="text-[10px] text-muted-foreground">{bs.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertCircle size={14} className="text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerateDraft}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all min-h-[48px] shadow-lg shadow-primary/20"
              >
                <Sparkles size={16} />
                Draft My Strategy
              </button>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Shield size={10} className="text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  AI never sends without your explicit approval
                </span>
              </div>
            </div>
          )}

          {/* ── Step 2: Drafting ── */}
          {step === "drafting" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Sparkles size={20} className="absolute inset-0 m-auto text-primary" />
              </div>
              <p className="text-sm font-semibold mb-1">Crafting your strategy...</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Analysing market data, comparable sales, and days on market to build
                the strongest opening position
              </p>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === "review" && draft && (
            <div className="space-y-5">
              {/* Strategy Insight */}
              <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary mb-0.5">Strategy</p>
                  <p className="text-xs text-muted-foreground">{draft.strategy}</p>
                </div>
              </div>

              {/* Email Preview */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-muted border-b border-border">
                  <p className="text-[10px] text-muted-foreground">Subject</p>
                  <p className="text-sm font-semibold">{draft.subject}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {draft.body}
                  </p>
                </div>
              </div>

              {/* Counter Options Preview */}
              {draft.counterOptions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Prepared Counter-Moves (if agent replies)
                  </p>
                  <div className="space-y-1.5">
                    {draft.counterOptions.map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-xs">{opt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="flex-1 px-4 py-3 text-sm font-semibold border border-border rounded-full hover:bg-muted transition-all"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleSendWithApproval}
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {sending ? (
                    <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={14} /> Send with My Approval</>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Shield size={10} className="text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  Nothing is sent until you click "Send with My Approval"
                </span>
              </div>
            </div>
          )}

          {/* ── Step 4: Sent ── */}
          {step === "sent" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Strategy Approved!</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Your negotiation has been logged. We'll notify you when the agent responds with
                AI-powered counter-move suggestions.
              </p>

              {/* Timeline Summary */}
              <div className="w-full space-y-3 mb-6">
                {STATUS_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isDone = i <= 1;
                  return (
                    <div
                      key={s.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isDone
                          ? "border-primary/20 bg-primary/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDone ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle size={14} className="text-primary" />
                        ) : (
                          <Clock size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isDone ? "Complete" : "Waiting..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
