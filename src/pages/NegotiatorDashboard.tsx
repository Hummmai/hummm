import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles, Loader2, Send, Zap, Target, Shield, Activity,
  ChevronRight, Radio, FileText, Eye, EyeOff, MessageCircle, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HummLogo from "@/components/HummLogo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import hummBird from "@/assets/humm-bird.png";
import { getRoleConfig } from "@/hooks/useUserRole";
import { useHumm } from "@/contexts/HummContext";

/* ── Types ── */
type Negotiation = {
  id: string;
  property_address: string;
  property_price: number | null;
  listing_type: string;
  max_budget: number | null;
  buyer_status: string | null;
  status: string;
  ai_draft_subject: string | null;
  ai_draft_body: string | null;
  ai_summary: string | null;
  counter_options: string[] | null;
  agent_reply: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ChatMsg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

/* Quick actions are now role-based — see getRoleConfig() */

/* ── Echo Waveform Animation ── */
function EchoWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full transition-all duration-300 ${
            active ? "bg-[#72F1B8] animate-pulse" : "bg-muted-foreground/20"
          }`}
          style={{
            height: active ? `${6 + Math.sin(i * 1.5) * 6}px` : "4px",
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Sidebar Echo Card ── */
function EchoCard({
  negotiation,
  isSelected,
  onClick,
}: {
  negotiation: Negotiation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isActive = negotiation.status !== "strategy_drafted";
  const nickname = negotiation.property_address?.split(",")[0] || "Unnamed Session";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
        isSelected
          ? "bg-[#72F1B8]/10 border border-[#72F1B8]/30"
          : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <EchoWaveform active={isActive && isSelected} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${isSelected ? "text-[#72F1B8]" : "text-foreground"}`}>
            {nickname}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
            {isActive ? "Live Signal" : "Hummm Initialized"}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ── Strategy Brief Panel ── */
function StrategyBrief({ negotiation }: { negotiation: Negotiation }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Target size={12} className="text-primary" /> Tactical Brief
      </h4>

      {negotiation.notes && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Strategy Notes</p>
          <p className="text-sm text-foreground leading-relaxed">{negotiation.notes}</p>
        </div>
      )}

      {negotiation.ai_draft_body && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Opening Email Draft</p>
          <div className="rounded-lg border border-border p-3 bg-muted/10">
            {negotiation.ai_draft_subject && (
              <p className="text-xs font-bold mb-2">{negotiation.ai_draft_subject}</p>
            )}
            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {negotiation.ai_draft_body}
            </p>
          </div>
        </div>
      )}

      {negotiation.agent_reply && (
        <div>
          <p className="text-[10px] font-semibold text-emerald-400 mb-1">Agent Reply</p>
          <p className="text-sm text-foreground">{negotiation.agent_reply}</p>
        </div>
      )}

      {negotiation.ai_summary && (
        <div>
          <p className="text-[10px] font-semibold text-primary mb-1">AI Analysis</p>
          <p className="text-xs text-muted-foreground">{negotiation.ai_summary}</p>
        </div>
      )}

      {!negotiation.notes && !negotiation.ai_draft_body && !negotiation.agent_reply && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Initialize Hummm to generate your tactical brief.
        </p>
      )}
    </div>
  );
}

/* ── Inline Chat ── */
function EchoChat({ negotiation, userRole }: { negotiation: Negotiation | null; userRole: string | null }) {
  const roleConfig = getRoleConfig(userRole);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: roleConfig.personaGreeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const context = negotiation
      ? `Context: Property at ${negotiation.property_address}, asking £${negotiation.property_price?.toLocaleString()}, budget £${negotiation.max_budget?.toLocaleString()}, buyer status: ${negotiation.buyer_status}. `
      : "";

    const userMsg: ChatMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.role === "user" && m === userMsg ? context + m.content : m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "I couldn't generate a response." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-border">
        {roleConfig.quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => send(a.prompt)}
            disabled={loading}
            className="px-3 py-1.5 text-[10px] font-bold rounded-full border border-[#72F1B8]/30 bg-[#72F1B8]/5 text-[#72F1B8] hover:bg-[#72F1B8]/10 transition-all disabled:opacity-50"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <img src={hummBird} alt="" className="w-6 h-6 rounded-full shrink-0 mt-1 object-contain" />
            )}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                m.role === "user"
                  ? "bg-primary/15 text-foreground"
                  : "bg-white/[0.04] border border-border text-foreground"
              }`}
            >
              <div className="prose prose-xs prose-invert max-w-none [&_p]:mb-1 [&_li]:text-xs">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <img src={hummBird} alt="" className="w-6 h-6 rounded-full shrink-0 object-contain" />
            <Loader2 size={14} className="animate-spin text-primary" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={roleConfig.chatPlaceholder}
            className="flex-1 bg-white/[0.04] border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-[#72F1B8] text-black hover:brightness-110 transition-all disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function NegotiatorDashboard() {
  const { currentRole } = useHumm();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showStrategy, setShowStrategy] = useState(false);
  const [initializingEcho, setInitializingEcho] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const selected = negotiations.find((n) => n.id === selectedId) || null;

  const fetchNegotiations = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) { navigate("/auth"); return; }

    const { data, error } = await supabase
      .from("negotiation_messages" as any)
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load sessions.", variant: "destructive" });
    } else {
      const list = (data || []) as unknown as Negotiation[];
      setNegotiations(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
    }
    setLoading(false);
  }, [navigate, toast, selectedId]);

  useEffect(() => { fetchNegotiations(); }, [fetchNegotiations]);

  /* Realtime */
  useEffect(() => {
    const channel = supabase
      .channel("echo-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "negotiation_messages" }, (payload) => {
        const updated = payload.new as Negotiation;
        if (!updated?.id) return;
        setNegotiations((prev) => {
          const idx = prev.findIndex((n) => n.id === updated.id);
          if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy; }
          return [updated, ...prev];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleInitializeEcho = async () => {
    if (!selected) return;
    setInitializingEcho(true);
    try {
      const { error } = await supabase.functions.invoke("suggest-next-move", {
        body: { negotiation: selected },
      });
      if (error) throw error;
      toast({ title: "Hummm Initialized 📡", description: "Your AI strategy is being generated." });
      fetchNegotiations();
    } catch {
      toast({ title: "Hummm Error", description: "Failed to initialize. Try again.", variant: "destructive" });
    } finally {
      setInitializingEcho(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEOHead
        title="AI Negotiator Dashboard | Hummm"
        description="Manage your active property negotiations with AI-powered strategy and real-time Hummm signals."
        canonical="/negotiator"
      />
      <Navbar />

      <div className="flex-1 flex flex-col pt-20 sm:pt-28">
        {/* Top Bar */}
        <div className="section-padding border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HummLogo logoHeight="h-6 sm:h-7" />
              <div className="h-5 w-px bg-border" />
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">
                My Sessions
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border border-[#72F1B8]/30 bg-[#72F1B8]/5 text-[#72F1B8]">
                <Radio size={8} className="animate-pulse" /> Hummm
              </span>
            </div>
            <button
              onClick={() => navigate("/negotiate-for-me")}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#72F1B8] text-black hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Zap size={12} /> New Session
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={28} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading your sessions...</p>
            </div>
          </div>
        ) : negotiations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-[#72F1B8]/10 border border-[#72F1B8]/20 flex items-center justify-center mx-auto mb-6">
                <Radio size={24} className="text-[#72F1B8]" />
              </div>
              <h3 className="text-xl font-black mb-2">No Active Sessions</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start your first AI negotiation to create an Hummm session.
              </p>
              <button
                onClick={() => navigate("/negotiate-for-me")}
                className="px-6 py-3 text-sm font-bold bg-[#72F1B8] text-black rounded-full hover:brightness-110 transition-all"
              >
                Create First Session
              </button>
            </div>
          </div>
        ) : (
          /* ── Split Panel Layout ── */
          <div className="flex-1 flex min-h-0">
            {/* Left Sidebar — Echo List */}
            <div className="w-64 lg:w-72 border-r border-border bg-white/[0.01] flex flex-col shrink-0 hidden sm:flex">
              <div className="p-4 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Active Sessions · {negotiations.length}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {negotiations.map((n) => (
                  <EchoCard
                    key={n.id}
                    negotiation={n}
                    isSelected={n.id === selectedId}
                    onClick={() => setSelectedId(n.id)}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Selector */}
            <div className="sm:hidden w-full border-b border-border p-3 bg-white/[0.01]">
              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground"
              >
                {negotiations.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.property_address?.split(",")[0] || "Unnamed Session"}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 flex flex-col min-h-0">
              {selected ? (
                <>
                  {/* Property Header */}
                  <div className="p-5 border-b border-border">
                    {/* Initialize Hummm Button */}
                    <button
                      onClick={handleInitializeEcho}
                      disabled={initializingEcho}
                      className="w-full mb-4 py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-[#72F1B8] text-black hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{
                        boxShadow: "0 0 30px rgba(114,241,184,0.15), 0 0 60px rgba(114,241,184,0.05)",
                      }}
                    >
                      {initializingEcho ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Radio size={16} />
                      )}
                      {initializingEcho ? "Initializing Hummm..." : "Initialize Hummm 📡"}
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#72F1B8] volt-pulse shrink-0" />
                      <h2 className="text-lg font-black truncate">
                        {selected.property_address?.split(",")[0]}
                      </h2>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-3">
                      {selected.property_address}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {selected.property_price && (
                        <span>Asking: <span className="font-bold text-foreground tabular-nums">£{selected.property_price.toLocaleString()}</span></span>
                      )}
                      {selected.max_budget && (
                        <span>Budget: <span className="font-bold text-foreground tabular-nums">£{selected.max_budget.toLocaleString()}</span></span>
                      )}
                      {selected.buyer_status && (
                        <span className="capitalize">{selected.buyer_status.replace(/-/g, " ")}</span>
                      )}
                    </div>

                    {/* Strategy Toggle */}
                    <button
                      onClick={() => setShowStrategy(!showStrategy)}
                      className="mt-4 flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {showStrategy ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showStrategy ? "Hide Strategy" : "View Strategy"}
                    </button>
                  </div>

                  {/* Strategy Brief (collapsible) */}
                  {showStrategy && (
                    <div className="p-5 border-b border-border bg-white/[0.01]">
                      <StrategyBrief negotiation={selected} />
                    </div>
                  )}

                  {/* Chat Interface */}
                  <div className="flex-1 min-h-0">
                    <EchoChat negotiation={selected} userRole={currentRole} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Select a session to begin.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
        <Shield size={10} className="text-primary" />
        <span className="text-[9px] text-muted-foreground">AI never sends without your approval · All data encrypted</span>
      </div>

      <Footer />
    </div>
  );
}
