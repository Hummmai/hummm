import { useState, useEffect } from "react";
import { Bot, Send, Loader2, Sparkles, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import GoldHummm from "@/components/GoldHummm";

interface StrategyCoachProps {
  negotiations: any[];
}

type ChatMsg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiator-chat`;

const StrategyCoach = ({ negotiations }: StrategyCoachProps) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token || null);
    });
  }, []);

  const systemPrompt = `You are The Hummm — Hummm's elite property negotiation advisor. You speak with precision, confidence, and warmth. You give 'Sniper' advice — specific, data-driven, actionable.

Context: The user is a Hummm Volt verified buyer. They have an active Decision in Principle.

${negotiations.length > 0 ? `Their active negotiations:\n${negotiations.map(n => `- ${n.property_address || n.property_link} (Goal: ${n.goal}, Status: ${n.status}, Package: ${n.package})`).join("\n")}` : "They have no active negotiations yet."}

When advising:
- Reference "Days on Market" — properties listed 60+ days have more negotiation leverage
- Reference "Price Reductions" — if a property has been reduced, the seller is motivated
- Give a clear "Hummm Recommendation" at the end: "Offer £X" or "Hold and wait"
- Be specific with numbers and percentages
- Keep responses under 200 words
- End with a confidence rating: "Coach Confidence: [High/Medium/Low]"

Current date: April 7, 2026. Reference the Renters' Rights Act and current UK market conditions.

UAE/Qatar specific: If the property is in UAE or Qatar, reference DLD fees, RERA index, golden visa thresholds, freehold zones, developer payment plan leverage, and ZERO tax advantages as negotiation tools.

ARABIC: If the user writes in Arabic, respond entirely in Arabic with the same strategic depth.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: systemPrompt }, ...updated],
        }),
      });

      if (!resp.ok || !resp.body) {
        const errText = await resp.text();
        throw new Error(errText || "Stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nlIdx);
          buf = buf.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              assistantSoFar += c;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I couldn't connect to the Strategy Coach. ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <GoldHummm size={18} pulse={true} />
        <div>
          <h3 className="text-lg font-bold">The Hummm</h3>
          <p className="text-[10px] text-muted-foreground">Elite sniper advice — powered by market intelligence</p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-card/40 overflow-hidden">
        {/* Messages */}
        <div className="max-h-72 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <GoldHummm size={28} pulse={true} className="mx-auto mb-3 justify-center" />
              <p className="text-sm font-bold mb-1">Ask The Hummm</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                "Is this E14 flat overpriced?" · "Should I use the Speed Demon?" · "What's my leverage?"
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-primary/15 text-foreground rounded-br-md"
                  : "bg-muted/30 border border-border text-foreground rounded-bl-md"
              }`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-muted/30 border border-border px-4 py-3">
                <Loader2 size={14} className="animate-spin text-amber-400" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Should I offer below asking...?"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyCoach;
