import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Send, ArrowDown, ArrowUp, MessageSquare, Copy, CheckCheck, Wand2, Trash2 } from "lucide-react";

interface SavedAuditLike {
  id: string;
  address: string | null;
  postcode: string | null;
  asking_price: number | null;
  humm_fair_value: number | null;
  property_url: string;
  currency: string | null;
}

interface Thread {
  id: string;
  property_address: string | null;
  asking_price: number | null;
  fair_value: number | null;
  target_price: number | null;
  current_offer: number | null;
  currency: string | null;
  agent_name: string | null;
  status: string;
  sentiment: string | null;
  last_ai_summary: string | null;
  updated_at: string;
}

interface Turn {
  id: string;
  direction: "in" | "out";
  channel: string;
  body: string;
  sentiment: string | null;
  suggested_replies: Draft[] | null;
  recommended_offer: number | null;
  ai_summary: string | null;
  created_at: string;
}

interface Draft { label: string; tone: string; body: string }

interface AnalyseResult {
  sentiment: string;
  agent_position_summary: string;
  recommended_offer: number | null;
  recommended_target_explanation: string;
  next_move: string;
  drafts: Draft[];
}

const fmt = (n: number | null | undefined, cur = "GBP") =>
  n ? new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n) : "—";

const SENT_COLOUR: Record<string, string> = {
  warm: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  neutral: "text-foreground bg-secondary/60 border-border",
  firm: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  hostile: "text-red-400 bg-red-500/10 border-red-500/20",
  stalling: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export default function FullNegotiationMode({ userId, property }: { userId: string; property: SavedAuditLike | null }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [pasted, setPasted] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [latest, setLatest] = useState<AnalyseResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ idx: number; body: string } | null>(null);

  const cur = property?.currency || thread?.currency || "GBP";

  useEffect(() => {
    if (!property) { setThread(null); setTurns([]); return; }
    loadThread();
  }, [property?.id]);

  const loadThread = async () => {
    if (!property) return;
    setLoading(true);
    const { data: existing } = await supabase
      .from("negotiation_loop_threads")
      .select("*")
      .eq("user_id", userId)
      .eq("audit_id", property.id)
      .maybeSingle();

    let t = existing as unknown as Thread | null;
    if (!t) {
      const { data: created } = await supabase
        .from("negotiation_loop_threads")
        .insert({
          user_id: userId,
          audit_id: property.id,
          property_url: property.property_url,
          property_address: property.address,
          asking_price: property.asking_price,
          fair_value: property.humm_fair_value,
          currency: property.currency || "GBP",
        } as never)
        .select("*")
        .single();
      t = created as unknown as Thread | null;
    }
    setThread(t);
    if (t) {
      const { data: ts } = await supabase
        .from("negotiation_loop_turns")
        .select("*")
        .eq("thread_id", t.id)
        .order("created_at", { ascending: true });
      setTurns((ts || []) as unknown as Turn[]);
    }
    setLoading(false);
  };

  const history = useMemo(() => turns.map(t => ({ direction: t.direction, body: t.body })), [turns]);

  const analyse = async () => {
    if (!thread || !pasted.trim()) return;
    setAnalysing(true);
    setLatest(null);
    try {
      const { data, error } = await supabase.functions.invoke("negotiator-loop", {
        body: {
          property_address: thread.property_address,
          asking_price: thread.asking_price,
          fair_value: thread.fair_value,
          target_price: thread.target_price,
          current_offer: thread.current_offer,
          currency: thread.currency,
          agent_name: thread.agent_name,
          buyer_or_renter: "buyer",
          history,
          latest_agent_reply: pasted.trim(),
        },
      });
      if (error) throw error;
      const result = data as AnalyseResult;
      setLatest(result);

      // Persist agent's pasted reply as an inbound turn
      const { data: inserted } = await supabase
        .from("negotiation_loop_turns")
        .insert({
          thread_id: thread.id,
          user_id: userId,
          direction: "in",
          channel: "paste",
          body: pasted.trim(),
          sentiment: result?.sentiment || null,
          suggested_replies: result?.drafts || null,
          recommended_offer: result?.recommended_offer || null,
          ai_summary: result?.agent_position_summary || null,
        } as never)
        .select("*")
        .single();
      if (inserted) setTurns(prev => [...prev, inserted as unknown as Turn]);

      await supabase
        .from("negotiation_loop_threads")
        .update({
          sentiment: result?.sentiment || null,
          last_ai_summary: result?.agent_position_summary || null,
        } as never)
        .eq("id", thread.id);

      setPasted("");
    } catch (e) {
      console.error(e);
      setLatest({ sentiment: "neutral", agent_position_summary: "Could not analyse — please try again.", recommended_offer: null, recommended_target_explanation: "", next_move: "hold", drafts: [] });
    }
    setAnalysing(false);
  };

  const sendDraft = async (idx: number, finalBody: string) => {
    if (!thread) return;
    const { data: inserted } = await supabase
      .from("negotiation_loop_turns")
      .insert({
        thread_id: thread.id,
        user_id: userId,
        direction: "out",
        channel: "paste",
        body: finalBody,
        sent_at: new Date().toISOString(),
      } as never)
      .select("*")
      .single();
    if (inserted) setTurns(prev => [...prev, inserted as unknown as Turn]);
    try { await navigator.clipboard.writeText(finalBody); } catch { /* ignore */ }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2200);
    setLatest(null);
    setEditing(null);
  };

  const updateTarget = async (field: "target_price" | "current_offer" | "agent_name", value: string) => {
    if (!thread) return;
    const parsed = field === "agent_name" ? value : (value ? Number(value) : null);
    await supabase
      .from("negotiation_loop_threads")
      .update({ [field]: parsed } as never)
      .eq("id", thread.id);
    setThread({ ...thread, [field]: parsed } as Thread);
  };

  const clearThread = async () => {
    if (!thread) return;
    if (!confirm("Clear all messages from this negotiation thread?")) return;
    await supabase.from("negotiation_loop_turns").delete().eq("thread_id", thread.id);
    setTurns([]);
    setLatest(null);
  };

  if (!property) {
    return <p className="text-sm text-muted-foreground p-6">Select a property to start a full negotiation thread.</p>;
  }
  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Thread setup */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Full Negotiation Mode
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Paste each agent reply — Hummingbird drafts the perfect response and tracks the back-and-forth.</p>
          </div>
          {turns.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearThread} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Reset thread
            </Button>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Your target price</label>
            <Input
              type="text"
              inputMode="numeric"
              defaultValue={thread?.target_price ?? ""}
              onBlur={e => updateTarget("target_price", e.target.value)}
              placeholder={fmt(thread?.fair_value, cur)}
              className="bg-secondary/50 border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Your current offer</label>
            <Input
              type="text"
              inputMode="numeric"
              defaultValue={thread?.current_offer ?? ""}
              onBlur={e => updateTarget("current_offer", e.target.value)}
              placeholder="—"
              className="bg-secondary/50 border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Agent name</label>
            <Input
              type="text"
              defaultValue={thread?.agent_name ?? ""}
              onBlur={e => updateTarget("agent_name", e.target.value)}
              placeholder="e.g. Sarah at Savills"
              className="bg-secondary/50 border-border"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {turns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Conversation timeline</h4>
          {turns.map(t => (
            <div key={t.id} className={`flex gap-3 ${t.direction === "out" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${t.direction === "in" ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary"}`}>
                {t.direction === "in" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </div>
              <div className={`flex-1 min-w-0 rounded-2xl border p-4 ${t.direction === "in" ? "bg-secondary/30 border-border" : "bg-primary/[0.06] border-primary/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-foreground">{t.direction === "in" ? (thread?.agent_name || "Agent") : "You"}</span>
                  {t.sentiment && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${SENT_COLOUR[t.sentiment] || SENT_COLOUR.neutral}`}>{t.sentiment}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(t.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{t.body}</p>
                {t.ai_summary && (
                  <p className="text-xs text-muted-foreground mt-2 italic">AI read: {t.ai_summary}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paste new agent reply */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" /> Paste the agent's latest reply
        </h4>
        <Textarea
          rows={6}
          value={pasted}
          onChange={e => setPasted(e.target.value)}
          placeholder="Hi, thanks for your offer of £…&#10;&#10;Paste the full email or message from the agent here."
          className="bg-secondary/50 border-border resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={analyse} disabled={analysing || !pasted.trim()} className="bg-primary text-primary-foreground">
            {analysing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Analyse & draft replies
          </Button>
        </div>
      </div>

      {/* AI result */}
      {latest && (
        <div className="space-y-4">
          <div className="bg-primary/[0.06] border border-primary/20 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${SENT_COLOUR[latest.sentiment] || SENT_COLOUR.neutral}`}>{latest.sentiment}</span>
              <span className="text-xs text-muted-foreground">Next move: <span className="text-foreground font-semibold">{latest.next_move.replace(/_/g, " ")}</span></span>
              {latest.recommended_offer != null && (
                <span className="text-xs text-muted-foreground ml-auto">Recommended counter: <span className="text-primary font-bold">{fmt(latest.recommended_offer, cur)}</span></span>
              )}
            </div>
            <p className="text-sm text-foreground">{latest.agent_position_summary}</p>
            {latest.recommended_target_explanation && (
              <p className="text-xs text-muted-foreground italic">{latest.recommended_target_explanation}</p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">3 ranked response drafts</h4>
            {latest.drafts.map((d, i) => {
              const isEditing = editing?.idx === i;
              const body = isEditing ? editing.body : d.body;
              return (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-foreground">{i + 1}. {d.label}</p>
                      <p className="text-[11px] text-muted-foreground">{d.tone}</p>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing && (
                        <Button size="sm" variant="outline" onClick={() => setEditing({ idx: i, body: d.body })} className="border-border">Edit</Button>
                      )}
                      <Button size="sm" onClick={() => sendDraft(i, body)} className="bg-primary text-primary-foreground">
                        {copiedIdx === i ? <CheckCheck className="w-4 h-4 mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                        {copiedIdx === i ? "Copied & logged" : "Copy & log as sent"}
                      </Button>
                    </div>
                  </div>
                  {isEditing ? (
                    <Textarea
                      rows={8}
                      value={body}
                      onChange={e => setEditing({ idx: i, body: e.target.value })}
                      className="bg-secondary/50 border-border resize-none text-sm"
                    />
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{body}</p>
                  )}
                </div>
              );
            })}
            <p className="text-[11px] text-muted-foreground italic px-1">
              Guidance only — review every reply before sending. Inbound auto-reply via notify.humm.pro coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}