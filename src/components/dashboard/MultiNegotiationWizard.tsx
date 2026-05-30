import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, ArrowRight, Loader2, Mail, Send, Sparkles,
  CheckCircle, Home, Wand2, ChevronDown, ChevronUp,
} from "lucide-react";

interface PropertyAudit {
  id: string;
  property_url: string;
  address: string | null;
  postcode: string | null;
  asking_price: number | null;
  currency: string | null;
  humm_fair_value: number | null;
  ai_score: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  images: string[] | null;
  agent_name: string | null;
  agent_email: string | null;
}

interface DraftEmail {
  propertyId: string;
  address: string;
  subject: string;
  body: string;
  toEmail: string;
  agentName: string;
  generating: boolean;
  expanded: boolean;
}

const GOALS = [
  { id: "best-price", label: "Get the best possible price", emoji: "💰" },
  { id: "lowest-rent", label: "Secure the lowest rent", emoji: "🏠" },
  { id: "viewing", label: "Book viewings for all properties", emoji: "📅" },
  { id: "info", label: "Request more information", emoji: "📋" },
];

interface Props {
  properties: PropertyAudit[];
  onClose: () => void;
  onComplete: () => void;
  userId: string;
}

export default function MultiNegotiationWizard({ properties, onClose, onComplete, userId }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<"goal" | "review" | "sending" | "done">("goal");
  const [goal, setGoal] = useState("best-price");
  const [customGoal, setCustomGoal] = useState("");
  const [drafts, setDrafts] = useState<DraftEmail[]>([]);
  const [generating, setGenerating] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Fetch user info on mount
  useState(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("user_id", data.user.id)
          .single();
        if (profile) {
          setUserName((profile as any).name || data.user.email?.split("@")[0] || "");
        }
      }
    });
  });

  const selectedGoal = goal === "custom" ? customGoal : GOALS.find(g => g.id === goal)?.label || goal;

  const handleGenerateDrafts = async () => {
    setGenerating(true);
    const newDrafts: DraftEmail[] = properties.map(p => ({
      propertyId: p.id,
      address: p.address || "Property",
      subject: "",
      body: "",
      toEmail: p.agent_email || "",
      agentName: p.agent_name || "Estate Agent",
      generating: true,
      expanded: true,
    }));
    setDrafts(newDrafts);
    setStep("review");

    // Generate emails in parallel (max 3 concurrent)
    const batchSize = 3;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (prop, batchIdx) => {
          const idx = i + batchIdx;
          try {
            const { data, error } = await supabase.functions.invoke("generate-negotiation-email", {
              body: {
                property: {
                  address: prop.address,
                  price: prop.asking_price,
                  property_type: prop.property_type,
                  bedrooms: prop.bedrooms,
                  bathrooms: prop.bathrooms,
                  source: "Saved Audit",
                },
                buyerName: userName,
                maxBudget: prop.humm_fair_value || prop.asking_price,
                buyerStatus: "chain-free",
                listingType: prop.property_type?.toLowerCase().includes("rent") ? "rent" : "sale",
              },
            });

            if (error) throw new Error(error.message);

            setDrafts(prev => prev.map((d, di) =>
              di === idx ? {
                ...d,
                subject: data.subject || `Enquiry about ${prop.address}`,
                body: data.body || "",
                generating: false,
              } : d
            ));
          } catch (err) {
            setDrafts(prev => prev.map((d, di) =>
              di === idx ? {
                ...d,
                subject: `Enquiry about ${prop.address}`,
                body: `Dear ${prop.agent_name || "Sir/Madam"},\n\nI am writing to express my interest in the property at ${prop.address}. ${selectedGoal}.\n\nI would appreciate the opportunity to discuss this further.\n\nBest regards,\n${userName}`,
                generating: false,
              } : d
            ));
          }
        })
      );
    }
    setGenerating(false);
  };

  const handleSendAll = async () => {
    setSendingAll(true);
    setStep("sending");
    let sent = 0;

    for (const draft of drafts) {
      try {
        // Create conversation
        const { data: conv } = await supabase.from("negotiation_conversations").insert({
          user_id: userId,
          property_address: draft.address,
          agent_name: draft.agentName,
          agent_email: draft.toEmail || null,
          status: "active",
        } as any).select().single();

        if (conv) {
          // Save outbound email
          await supabase.from("negotiation_emails").insert({
            conversation_id: conv.id,
            direction: "outbound",
            sender_name: userName,
            sender_email: userEmail,
            subject: draft.subject,
            body: draft.body,
            ai_drafted: true,
            status: "sent",
          } as any);

          // Try to send via edge function
          if (draft.toEmail) {
            await supabase.functions.invoke("send-agent-email", {
              body: {
                to: draft.toEmail,
                subject: draft.subject,
                body: draft.body,
                senderName: userName,
                replyToId: (conv as any).reply_to_id,
              },
            }).catch(() => {});
          }
        }

        sent++;
        setSentCount(sent);
      } catch (err) {
        console.error("Error sending for", draft.address, err);
      }
    }

    setSendingAll(false);
    setStep("done");
  };

  const toggleExpand = (idx: number) => {
    setDrafts(prev => prev.map((d, i) => i === idx ? { ...d, expanded: !d.expanded } : d));
  };

  const updateDraft = (idx: number, field: keyof DraftEmail, value: string) => {
    setDrafts(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const allDraftsReady = drafts.length > 0 && drafts.every(d => !d.generating && d.body.trim());

  // ─── STEP: Goal Selection ───
  if (step === "goal") {
    return (
      <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
              <Sparkles size={14} /> Multi-Property Negotiation
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Negotiate {properties.length} Properties
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Hummm will generate tailored opening emails for each property based on your goal.
            </p>
          </div>

          {/* Selected Properties Summary */}
          <div className="rounded-2xl border border-border bg-card/40 p-5 mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Selected Properties</p>
            <div className="space-y-2">
              {properties.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-muted/30 overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Home size={14} className="text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{p.address || "Property"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.asking_price ? `£${p.asking_price.toLocaleString()}` : "Price TBC"}
                      {p.agent_email && <span className="ml-2 text-primary">✓ Agent email found</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Selection */}
          <div className="mb-8">
            <p className="text-sm font-black mb-4">What's your goal?</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`text-left rounded-2xl border p-5 transition-all ${
                    goal === g.id
                      ? "border-primary bg-primary/5 shadow-[0_0_20px_-4px_hsl(168_100%_45%/0.2)]"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-xl mb-2 block">{g.emoji}</span>
                  <p className="text-sm font-bold">{g.label}</p>
                </button>
              ))}
              <button
                onClick={() => setGoal("custom")}
                className={`text-left rounded-2xl border p-5 transition-all sm:col-span-2 ${
                  goal === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-xl mb-2 block">✍️</span>
                <p className="text-sm font-bold mb-2">Custom goal</p>
                {goal === "custom" && (
                  <input
                    value={customGoal}
                    onChange={e => setCustomGoal(e.target.value)}
                    placeholder="e.g. Negotiate 10% below asking on all properties"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateDrafts}
            disabled={goal === "custom" && !customGoal.trim()}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-base flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-[0_4px_30px_-6px_hsl(168_100%_45%/0.4)]"
          >
            <Sparkles size={20} /> Generate All Emails with Hummm
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP: Review Drafts ───
  if (step === "review") {
    return (
      <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => setStep("goal")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Goal
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Review Your Emails</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {generating ? "Generating AI drafts..." : `${drafts.length} emails ready for review`}
              </p>
            </div>
            <button
              onClick={handleSendAll}
              disabled={!allDraftsReady}
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-[0_4px_20px_-4px_hsl(168_100%_45%/0.3)]"
            >
              <Send size={16} /> Approve & Send All ({drafts.filter(d => !d.generating).length})
            </button>
          </div>

          <div className="space-y-4">
            {drafts.map((draft, idx) => (
              <div key={draft.propertyId} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {draft.generating ? (
                      <Loader2 size={18} className="animate-spin text-primary" />
                    ) : (
                      <Mail size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{draft.address}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      To: {draft.toEmail || "No agent email — will save to inbox"}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    draft.generating ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                  }`}>
                    {draft.generating ? "Generating..." : "Ready"}
                  </span>
                  {draft.expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </button>

                {/* Expanded Content */}
                {draft.expanded && !draft.generating && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border/50">
                    <div className="pt-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Subject</label>
                      <input
                        value={draft.subject}
                        onChange={e => updateDraft(idx, "subject", e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">To</label>
                      <input
                        value={draft.toEmail}
                        onChange={e => updateDraft(idx, "toEmail", e.target.value)}
                        placeholder="agent@example.com"
                        className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email Body</label>
                      <Textarea
                        value={draft.body}
                        onChange={e => updateDraft(idx, "body", e.target.value)}
                        className="min-h-[200px] text-sm bg-muted/20 border-border"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP: Sending ───
  if (step === "sending") {
    return (
      <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-black mb-2">Sending Your Emails...</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {sentCount} of {drafts.length} emails sent
          </p>
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(sentCount / drafts.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP: Done ───
  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black mb-2">All Emails Sent! 🎉</h2>
        <p className="text-muted-foreground text-sm mb-2">
          {sentCount} negotiation{sentCount !== 1 ? "s" : ""} started successfully.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Replies will appear in your dashboard inbox.
        </p>
        <button
          onClick={() => { onComplete(); onClose(); }}
          className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_4px_20px_-4px_hsl(168_100%_45%/0.3)]"
        >
          Go to My Negotiations
        </button>
      </div>
    </div>
  );
}
