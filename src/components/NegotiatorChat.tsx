import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiator-chat`;

interface NegotiatorChatProps {
  propertyAddress?: string | null;
  propertyLink?: string;
  goal?: string;
  language?: "en" | "ar";
}

const NegotiatorChat = ({ propertyAddress, propertyLink, goal, language: initialLang }: NegotiatorChatProps) => {
  const [lang, setLang] = useState<"en" | "ar">(initialLang || "en");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: lang === "ar" 
        ? `مرحباً! أنا **المفاوض الذكي** من هَم. أنا هنا لمساعدتك في الحصول على أفضل صفقة ممكنة.${
          propertyAddress ? `\n\nأرى أنك تعمل على **${propertyAddress}**${goal ? ` بهدف **${goal}**` : ""}.` : ""
        }\n\nما هو رابط العقار أو الموقف الذي تريد مناقشته؟`
        : `Hello! I'm your **AI Negotiator**. I'm here to help you get the best possible deal.${
          propertyAddress ? `\n\nI can see you're working on **${propertyAddress}**${goal ? ` with a goal to **${goal}**` : ""}.` : ""
        }\n\nWhat's the property link or situation you'd like to discuss?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token || null);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages.filter(m => m.content), userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...(lang === "ar" ? [{ role: "system" as const, content: "The user prefers Arabic. Respond in Arabic (Modern Standard Arabic / Gulf dialect). Draft all emails, strategies, and communications in professional Arabic. Use Arabic property terminology." }] : []),
            ...allMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error("Negotiator chat error:", e);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${e.message}. Please try again.` },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)", height: 520 }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/20 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <Sparkles size={14} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">AI Negotiator</p>
          <p className="text-[10px] text-muted-foreground">AI-powered negotiation expert</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setLang(l => l === "en" ? "ar" : "en")}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-muted/30 border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-medium text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "assistant" ? "bg-primary/15" : "bg-muted"
            }`}>
              {msg.role === "assistant" ? <Bot size={14} className="text-primary" /> : <User size={14} className="text-muted-foreground" />}
            </div>
            <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
              msg.role === "assistant"
                ? "bg-muted/30 border border-border/50"
                : "bg-primary text-primary-foreground"
            }`}>
              {msg.role === "assistant" ? (
                <div className="text-xs leading-relaxed text-foreground prose prose-sm prose-invert max-w-none [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs [&_code]:text-[10px] [&_pre]:text-[10px] [&_strong]:text-primary">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin text-primary" />
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-4 pt-2 border-t border-border/50 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about strategy, draft a counter-offer..."
            className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            disabled={isLoading}
          />
          <button onClick={send} disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NegotiatorChat;
