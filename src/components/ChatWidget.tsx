import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import hummBird from "@/assets/humm-bird.png";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Msg = { role: "user" | "assistant"; content: string };

const PERSONA_TINTS: Record<string, string> = {
  default: "hue-rotate(0deg)",
  compliance: "hue-rotate(200deg) saturate(1.3)",
  scout: "hue-rotate(90deg) saturate(1.2)",
};

const WELCOME_MSG: Msg = {
  role: "assistant",
  content:
    "Hi, I'm Hummm — your personal AI Property Expert. How can I help you with your properties today?",
};

interface ChatWidgetProps {
  persona?: "default" | "compliance" | "scout";
  embedded?: boolean; // When true, renders inline without floating bubble
  conversationId?: string; // When set, persists to this conversation
  initialMessages?: Msg[]; // Pre-load messages from a saved conversation
  onMessagesChange?: (messages: Msg[]) => void; // Callback when messages change
}

const ChatWidget = ({ persona = "default", embedded = false, conversationId, initialMessages, onMessagesChange }: ChatWidgetProps) => {
  const { currentRole } = useHumm();
  const [open, setOpen] = useState(embedded);
  const [messages, setMessages] = useState<Msg[]>(
    initialMessages && initialMessages.length > 0 ? initialMessages : [WELCOME_MSG]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevConvIdRef = useRef<string | undefined>(conversationId);

  // Get auth token on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token || null);
    });
  }, []);

  // Reset messages when conversationId changes
  useEffect(() => {
    if (conversationId !== prevConvIdRef.current) {
      prevConvIdRef.current = conversationId;
      setMessages(initialMessages && initialMessages.length > 0 ? initialMessages : [WELCOME_MSG]);
    }
  }, [conversationId, initialMessages]);

  // Notify parent when messages change (for persistence)
  const lastSavedRef = useRef<string>("");
  useEffect(() => {
    if (!onMessagesChange || isLoading) return;
    // Only save non-welcome messages, skip if unchanged
    const saveable = messages.filter((m) => m !== WELCOME_MSG);
    const key = JSON.stringify(saveable);
    if (key === lastSavedRef.current || saveable.length === 0) return;
    lastSavedRef.current = key;
    onMessagesChange(saveable);
  }, [messages, isLoading, onMessagesChange]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === history.length + 1) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      // Use user's real auth token if available for context-aware responses
      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      } else {
        headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: history.filter((m) => m !== WELCOME_MSG).map(({ role, content }) => ({ role, content })),
          persona,
          userRole: currentRole || "buyer",
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to connect");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      upsert("\n\n*Sorry, I couldn't process that right now. Please try again.*");
      console.error("Chat error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Embedded mode: render chat inline without floating bubble
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="flex gap-2.5">
                    <img src={hummBird} alt="" className="w-5 h-5 object-contain shrink-0 mt-0.5" style={{ filter: PERSONA_TINTS[persona] || "none" }} />
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="max-w-[85%] rounded-2xl p-3.5 bg-muted/50 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border/30">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your properties, negotiations, mortgages..."
              className="flex-1 px-4 py-3 text-sm bg-muted/30 border border-border/40 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-105 transition-transform"
          style={{ bottom: "max(4.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))" }}
          aria-label="Open AI assistant"
        >
          <MessageCircle size={20} className="sm:hidden" />
          <MessageCircle size={22} className="hidden sm:block" />
        </button>
      )}

      {/* Tooltip */}
      {!open && (
        <div className="hidden sm:block fixed bottom-[88px] right-6 z-50 bg-card border border-border rounded-lg px-4 py-2 text-xs text-foreground shadow-lg max-w-[220px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={10} className="text-primary" />
            <span className="font-semibold">AI Property Assistant</span>
          </div>
          <p className="text-muted-foreground">Ask our AI anything about your property</p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-card border-b border-r border-border rotate-45" />
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] max-h-[85svh] sm:max-h-[520px] border border-border rounded-t-2xl sm:rounded-xl bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2.5">
              <img
                src={hummBird}
                alt="Hummm"
                className="w-6 h-6 object-contain drop-shadow-sm"
                style={{ filter: PERSONA_TINTS[persona] || "none" }}
              />
              <span className="text-sm font-semibold">Hummm Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="flex gap-2.5">
                      <img
                        src={hummBird}
                        alt=""
                        className="w-5 h-5 object-contain shrink-0 mt-0.5"
                        style={{ filter: PERSONA_TINTS[persona] || "none" }}
                      />
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="max-w-[85%] rounded-lg p-3 bg-muted flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border pb-safe">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your property..."
                className="flex-1 px-3 py-2.5 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
