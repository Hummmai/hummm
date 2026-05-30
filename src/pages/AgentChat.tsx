import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link, Navigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Send, ArrowLeft, Loader2, Bot, Megaphone, Scale, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const TONES = ["polite", "firm", "assertive", "aggressive", "walk-away"] as const;
type Tone = typeof TONES[number];

const AGENT_CONFIG = {
  sales: {
    name: "Hummingbird Sales Agent",
    tagline: "Qualifies leads • Drafts follow-ups • Books strategy calls",
    icon: Bot,
    accent: "primary",
    gradient: "from-primary/30 to-primary/10",
    border: "border-primary/30",
    title: "__sales_agent__",
    welcome: "Hello — I'm your **Hummingbird Sales Agent**. I qualify leads, draft personalised follow-up sequences, and book strategy calls. \n\nTo get started, tell me about a lead, paste an email reply you've received, or ask me to draft a 5-touch follow-up for a recent valuation.\n\n**Next best action:** Share the name + situation of a lead you want to close this week.",
    suggestions: [
      "Draft a 5-day follow-up sequence for a £850k valuation lead",
      "Qualify this lead: Sarah, Wandsworth, £850k, replied 'interested but no rush'",
      "Write a script for booking a strategy call",
      "Handle this objection: 'I'll wait until spring'",
    ],
  },
  marketing: {
    name: "Hummingbird Marketing Agent",
    tagline: "LinkedIn • Instagram • Email • SEO blogs • Lead magnets",
    icon: Megaphone,
    accent: "violet-400",
    gradient: "from-violet-500/30 to-violet-500/10",
    border: "border-violet-500/30",
    title: "__marketing_agent__",
    welcome: "Hi — I'm your **Hummingbird Marketing Agent**. I write social posts, email campaigns, SEO blog outlines, and lead magnets that actually convert.\n\nTell me what you want to ship today: a LinkedIn post, a campaign brief, a blog outline, or a lead-magnet idea.\n\n**Next best action:** Tell me your target audience and the outcome you want me to drive this week.",
    suggestions: [
      "Write 2 LinkedIn posts about saving £42k on a London purchase",
      "Draft an SEO blog outline: 'How AI valuations work in 2026'",
      "Design a lead magnet for first-time landlords",
      "Build an email campaign for sellers who got an AI valuation",
    ],
  },
  negotiation: {
    name: "Hummm Negotiation Agent",
    tagline: "Drafts offers • Counter-strategy • Email mastery • Deal intelligence",
    icon: Scale,
    accent: "amber-400",
    gradient: "from-amber-500/30 to-amber-500/10",
    border: "border-amber-500/30",
    title: "__negotiation_agent__",
    welcome: "I'm your **Hummm Negotiation Agent** — an elite property negotiator with perfect data and zero emotional bias.\n\nI can:\n• Analyse your property audit and suggest the smartest next move\n• Draft opening offers, counter-offers, chase emails, and best & final letters\n• Edit and sharpen messages you've already written\n• Build a full negotiation strategy with 2–3 tactical options\n\n**Next best action:** Paste a property link, share your audit details, or tell me what deal you're working on right now.",
    suggestions: [
      "Draft an opening offer £50k below ask for a Wandsworth 3-bed",
      "Analyse my audit and suggest the next 3 moves",
      "Write a chase email to an agent who's gone quiet",
      "Edit my draft: 'We were thinking of offering around asking'",
    ],
  },
} as const;

type AgentId = keyof typeof AGENT_CONFIG;

export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, userId } = useHumm();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [tone, setTone] = useState<Tone>("firm");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const agent = agentId && agentId in AGENT_CONFIG ? AGENT_CONFIG[agentId as AgentId] : null;

  // Apply orchestrator prefill (?prefill=…&auto=1) once chat is hydrated and empty.
  // Stored as ref-style flag so we can autosend after state lands.
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    const pf = searchParams.get("prefill");
    const auto = searchParams.get("auto") === "1";
    if (pf && !input && messages.length <= 1) {
      setInput(pf);
      const next = new URLSearchParams(searchParams);
      next.delete("prefill");
      next.delete("auto");
      setSearchParams(next, { replace: true });
      if (auto) setPendingAutoSend(pf);
      else setTimeout(() => inputRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Load or create conversation
  useEffect(() => {
    if (!isLoggedIn || !userId || !agent) return;
    let cancelled = false;
    (async () => {
      const { data: existing } = await supabase
        .from("ai_conversations")
        .select("id, messages")
        .eq("user_id", userId)
        .eq("conversation_title", agent.title)
        .maybeSingle();
      if (cancelled) return;
      if (existing) {
        setConvId(existing.id);
        const msgs = Array.isArray(existing.messages) ? (existing.messages as any as Msg[]) : [];
        setMessages(msgs.length ? msgs : [{ role: "assistant", content: agent.welcome }]);
      } else {
        const { data: created } = await supabase
          .from("ai_conversations")
          .insert({ user_id: userId, conversation_title: agent.title, messages: [] })
          .select("id")
          .single();
        if (cancelled) return;
        if (created) setConvId(created.id);
        setMessages([{ role: "assistant", content: agent.welcome }]);
      }
      setHydrated(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, userId, agent?.title]);

  // Persist messages (skip the initial welcome-only state)
  useEffect(() => {
    if (!convId || !hydrated || messages.length <= 1) return;
    supabase.from("ai_conversations")
      .update({ messages: messages as any, updated_at: new Date().toISOString() })
      .eq("id", convId)
      .then(({ error }) => { if (error) console.error("persist error", error); });
  }, [messages, convId, hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || !agent) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          agent: agentId,
        ...(agentId === "negotiation" ? { tone } : {}),
          messages: next.filter(m => m.content !== agent.welcome).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `Status ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantContent };
                return copy;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e: any) {
      toast({ title: "Agent error", description: e.message || "Something went wrong.", variant: "destructive" });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages, agent, agentId, tone, toast]);

  // Fire the orchestrator-provided prompt automatically once it's in the input.
  useEffect(() => {
    if (pendingAutoSend && input === pendingAutoSend && !isLoading) {
      setPendingAutoSend(null);
      // small delay so the user can see the bubble appear before stream
      setTimeout(() => send(), 80);
    }
  }, [pendingAutoSend, input, isLoading, send]);

  const clearChat = useCallback(async () => {
    if (!convId || !agent) return;
    if (!confirm("Clear this entire conversation? This cannot be undone.")) return;
    await supabase.from("ai_conversations").update({ messages: [] as any }).eq("id", convId);
    setMessages([{ role: "assistant", content: agent.welcome }]);
    toast({ title: "Conversation cleared" });
  }, [convId, agent, toast]);

  if (!agent) return <Navigate to="/agents" replace />;
  if (!isLoggedIn) return <Navigate to={`/auth?redirect=/agents/${agentId}`} replace />;

  const Icon = agent.icon;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <SEOHead title={`${agent.name} | Hummingbird AI`} description={agent.tagline} canonical={`/agents/${agentId}`} />
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full ${agentId === "marketing" ? "bg-violet-500/10" : agentId === "negotiation" ? "bg-amber-500/10" : "bg-primary/10"} blur-[120px]`} />
      </div>

      <div className="flex-1 flex flex-col pt-24 pb-4 max-w-4xl mx-auto w-full px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-border">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/agents" className="p-2 rounded-xl hover:bg-muted transition-colors shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.gradient} border ${agent.border} flex items-center justify-center shrink-0`}>
              <Icon size={22} className={agentId === "sales" ? "text-primary" : agentId === "negotiation" ? "text-amber-400" : "text-violet-300"} />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${agentId === "sales" ? "bg-emerald-400" : agentId === "negotiation" ? "bg-amber-400" : "bg-violet-400"} border-2 border-background animate-pulse`} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight truncate">{agent.name}</h1>
              <p className="text-[11px] text-muted-foreground truncate">{agent.tagline}</p>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-red-400 transition-colors shrink-0" title="Clear conversation">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Tone selector — Negotiation only */}
        {agentId === "negotiation" && (
          <div className="mb-5 -mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mr-1">Tone</span>
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all border ${
                  tone === t
                    ? "bg-amber-500 text-black border-amber-500 shadow-[0_4px_16px_-4px_hsl(40_90%_50%/0.5)]"
                    : "bg-card text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-6">
          {!hydrated && (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)]">
                  {m.content}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${agent.gradient} border ${agent.border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={14} className={agentId === "sales" ? "text-primary" : agentId === "negotiation" ? "text-amber-400" : "text-violet-300"} />
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none flex-1 prose-headings:font-black prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-strong:font-bold prose-li:text-foreground/90 prose-a:text-primary prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                    {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Sparkles size={12} className="animate-pulse" /> Thinking…</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {agent.suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="sticky bottom-0 bg-background pt-2">
          <div className="relative rounded-2xl border border-border bg-card focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Message your ${agentId === "sales" ? "sales" : agentId === "negotiation" ? "negotiation" : "marketing"} agent…`}
              rows={1}
              className="w-full bg-transparent px-4 py-3.5 pr-14 text-sm placeholder:text-muted-foreground resize-none focus:outline-none max-h-40"
              style={{ minHeight: "52px" }}
              disabled={isLoading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Conversation saved to your account. Guidance only — verify before sending to clients.
          </p>
        </div>
      </div>
    </div>
  );
}