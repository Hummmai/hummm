import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Inbox, Mail, Send, Loader2, Wand2, MessageSquare,
  ArrowLeft, Clock, User, Bot, ChevronRight, Plus,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Conversation {
  id: string;
  property_address: string;
  property_url: string | null;
  agent_name: string | null;
  agent_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EmailMessage {
  id: string;
  conversation_id: string;
  direction: string;
  sender_name: string | null;
  sender_email: string | null;
  subject: string | null;
  body: string;
  ai_drafted: boolean;
  status: string;
  created_at: string;
}

const AI_REPLY_ACTIONS = [
  { label: "Draft counter-offer", prompt: "Draft a professional counter-offer reply that negotiates a better price while maintaining a positive relationship" },
  { label: "Handle objection", prompt: "Draft a reply that professionally handles the agent's objection and keeps the negotiation moving forward" },
  { label: "Accept & close", prompt: "Draft a reply accepting the terms and confirming next steps to close the deal" },
  { label: "Request more info", prompt: "Draft a polite reply requesting more information or clarification about the property or terms" },
];

interface NegotiationInboxProps {
  initialThreadId?: string | null;
}

export default function NegotiationInbox({ initialThreadId }: NegotiationInboxProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteBody, setPasteBody] = useState("");
  const [pasteSender, setPasteSender] = useState("");
  const [savingPaste, setSavingPaste] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("negotiation_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) {
      setConversations(data as Conversation[]);
      // Auto-open thread if initialThreadId is provided
      if (initialThreadId && !selectedConv) {
        const match = (data as Conversation[]).find(c => c.id === initialThreadId);
        if (match) setSelectedConv(match);
      }
    }
    setLoading(false);
  };

  // Load emails when conversation selected
  useEffect(() => {
    if (!selectedConv) return;
    loadEmails(selectedConv.id);

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`emails-${selectedConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "negotiation_emails",
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        setEmails((prev) => [...prev, payload.new as EmailMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [emails]);

  const loadEmails = async (conversationId: string) => {
    const { data } = await supabase
      .from("negotiation_emails")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) setEmails(data as EmailMessage[]);
  };

  const handleSendReply = async () => {
    if (!selectedConv || !replyBody.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-negotiation-reply", {
        body: {
          conversationId: selectedConv.id,
          subject: replySubject || `Re: ${selectedConv.property_address}`,
          body: replyBody,
        },
      });
      if (error) throw new Error(error.message);
      setReplyBody("");
      setReplySubject("");
      toast({ title: "Reply sent! ✉️", description: "The agent will receive your message shortly." });
      loadEmails(selectedConv.id);
    } catch (err: any) {
      toast({ title: "Could not send", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handlePasteReply = async () => {
    if (!selectedConv || !pasteBody.trim()) return;
    setSavingPaste(true);
    try {
      await supabase.from("negotiation_emails").insert({
        conversation_id: selectedConv.id,
        direction: "inbound",
        sender_name: pasteSender || selectedConv.agent_name || "Agent",
        sender_email: selectedConv.agent_email || null,
        subject: `Re: ${selectedConv.property_address}`,
        body: pasteBody.trim(),
        ai_drafted: false,
        status: "received",
      } as any);
      setPasteBody("");
      setPasteSender("");
      setPasteMode(false);
      toast({ title: "Reply added ✓", description: "The agent's reply has been saved to the thread." });
      loadEmails(selectedConv.id);
    } catch (err: any) {
      toast({ title: "Could not save", description: err.message, variant: "destructive" });
    } finally {
      setSavingPaste(false);
    }
  };

  const handleAiDraft = async (prompt: string) => {
    if (!selectedConv) return;
    setAiLoading(true);
    try {
      const threadContext = emails.map((e) =>
        `[${e.direction === "outbound" ? "You" : "Agent"}]: ${e.body}`
      ).join("\n\n");

      const res = await supabase.functions.invoke("chat", {
        body: {
          messages: [{
            role: "user",
            content: `You are an expert property negotiator assisting a buyer. Based on this email thread, ${prompt}.\n\nProperty: ${selectedConv.property_address}\nAgent: ${selectedConv.agent_name || "Unknown"}\n\nThread:\n${threadContext}\n\nReturn ONLY the reply email body. Be professional, concise, and strategic. Use British English.`,
          }],
          persona: "default",
        },
      });

      if (res.data) {
        const reader = res.data.getReader?.();
        if (reader) {
          let text = "";
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                const c = parsed.choices?.[0]?.delta?.content;
                if (c) text += c;
              } catch {}
            }
          }
          if (text.trim()) setReplyBody(text.trim());
        }
      }
    } catch {
      toast({ title: "AI unavailable", description: "Please try again shortly.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAiSuggestions = useCallback(async () => {
    if (!selectedConv || emails.length === 0) return;
    try {
      const threadContext = emails.slice(-3).map((e) =>
        `[${e.direction === "outbound" ? "You" : "Agent"}]: ${e.body.slice(0, 200)}`
      ).join("\n\n");

      const res = await supabase.functions.invoke("chat", {
        body: {
          messages: [{
            role: "user",
            content: `You are analysing a property negotiation thread. Give 2-3 short strategic tips (each under 20 words) for the buyer's next move. Use bullet points (•).\n\nProperty: ${selectedConv.property_address}\nThread:\n${threadContext}`,
          }],
          persona: "default",
        },
      });

      if (res.data) {
        const reader = res.data.getReader?.();
        if (reader) {
          let text = "";
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                const c = parsed.choices?.[0]?.delta?.content;
                if (c) text += c;
              } catch {}
            }
          }
          setAiSuggestions(text.split("\n").filter((l: string) => l.trim().length > 3).slice(0, 4));
        }
      }
    } catch {
      setAiSuggestions(["• Review the agent's position carefully before responding"]);
    }
  }, [selectedConv, emails]);

  useEffect(() => {
    if (selectedConv && emails.length > 0) fetchAiSuggestions();
  }, [selectedConv?.id, emails.length]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // Conversation List View
  if (!selectedConv) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Inbox size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black">Negotiation Inbox</h2>
              <p className="text-xs text-muted-foreground">Your active property conversations</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <Mail size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start by auditing a property and sending an enquiry</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className="w-full text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-[0_4px_24px_-6px_hsl(168_100%_45%/0.1)] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{conv.property_address}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {conv.agent_name && (
                        <span className="text-xs text-muted-foreground">
                          <User size={10} className="inline mr-1" />{conv.agent_name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        <Clock size={10} className="inline mr-1" />{formatDate(conv.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      conv.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>{conv.status}</span>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Conversation Detail View
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedConv(null)}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black truncate">{selectedConv.property_address}</h2>
          <p className="text-xs text-muted-foreground">
            {selectedConv.agent_name && `${selectedConv.agent_name} · `}
            {selectedConv.agent_email || "No agent email"}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
          {selectedConv.status}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Thread + Reply */}
        <div className="space-y-4">
          {/* Email Thread */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conversation Thread</p>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
              {emails.map((email) => (
                <div key={email.id}
                  className={`rounded-xl p-4 ${
                    email.direction === "outbound"
                      ? "bg-primary/5 border border-primary/10 ml-4"
                      : "bg-muted/50 border border-border mr-4"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      email.direction === "outbound" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      {email.direction === "outbound"
                        ? <User size={12} className="text-primary" />
                        : <Mail size={12} className="text-muted-foreground" />
                      }
                    </div>
                    <span className="text-xs font-bold">
                      {email.direction === "outbound" ? "You" : email.sender_name || "Agent"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(email.created_at)}</span>
                  </div>
                  {email.subject && (
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{email.subject}</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{email.body}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Paste Agent Reply */}
          {pasteMode ? (
            <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paste Agent Reply</p>
              <Input
                placeholder="Agent's name"
                value={pasteSender}
                onChange={(e) => setPasteSender(e.target.value)}
                className="text-sm"
              />
              <Textarea
                placeholder="Paste the agent's reply here..."
                value={pasteBody}
                onChange={(e) => setPasteBody(e.target.value)}
                className="min-h-[120px] text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => setPasteMode(false)}
                  className="px-4 py-2.5 text-xs font-semibold border border-border rounded-full hover:bg-muted transition-all">
                  Cancel
                </button>
                <button onClick={handlePasteReply} disabled={savingPaste || !pasteBody.trim()}
                  className="px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-50">
                  {savingPaste ? <Loader2 size={12} className="animate-spin" /> : "Save Reply"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setPasteMode(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium border border-dashed border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all">
              <Plus size={14} /> Paste an agent reply
            </button>
          )}

          {/* Reply Composer */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Reply</p>
            </div>
            <div className="p-4 space-y-3">
              <Input
                placeholder="Subject (optional)"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="text-sm border-0 bg-muted/30 focus-visible:ring-1"
              />
              <Textarea
                placeholder="Write your reply or use AI to draft one..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="min-h-[140px] text-sm border-0 bg-muted/30 focus-visible:ring-1"
              />
              <div className="flex gap-3">
                <button onClick={handleSendReply} disabled={sending || !replyBody.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center gap-2">
              <Bot size={14} className="text-primary" />
              <h4 className="text-sm font-bold">AI Negotiation Assistant</h4>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">AI Draft Actions</p>
              <div className="space-y-2">
                {AI_REPLY_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAiDraft(action.prompt)}
                    disabled={aiLoading}
                    className="w-full text-left px-3 py-2.5 text-xs font-medium border border-primary/15 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                  >
                    <Wand2 size={10} className="inline mr-2" />{action.label}
                  </button>
                ))}
              </div>
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-3 mt-2">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  Drafting your reply...
                </div>
              )}
            </div>

            {/* Strategy Suggestions */}
            <div className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Strategy Tips</p>
              {aiSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {aiSuggestions.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">{s}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-3">Send or receive messages to get AI strategy tips.</p>
              )}
            </div>

            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <p className="text-[10px] text-muted-foreground text-center">
                ✨ AI reads the full thread for context-aware advice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
