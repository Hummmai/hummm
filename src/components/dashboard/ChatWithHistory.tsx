import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatWidget from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Conversation = {
  id: string;
  conversation_title: string;
  messages: { role: "user" | "assistant"; content: string; timestamp?: string }[];
  updated_at: string;
  created_at: string;
};

const ChatWithHistory = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: convs } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", data.user.id)
        .order("updated_at", { ascending: false });
      const parsed = (convs || []).map((c: any) => ({
        ...c,
        messages: Array.isArray(c.messages) ? c.messages : JSON.parse(c.messages || "[]"),
      }));
      setConversations(parsed);
      // Load the most recent conversation by default
      if (parsed.length > 0) {
        setActiveConvId(parsed[0].id);
      }
      setLoading(false);
    });
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const createNewConversation = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: userId, conversation_title: "New Conversation", messages: [] })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Could not create conversation.", variant: "destructive" });
      return;
    }
    const newConv: Conversation = { ...data, messages: [] };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setShowHistory(false);
  }, [userId, toast]);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
    }
    toast({ title: "Conversation deleted" });
  }, [activeConvId, toast]);

  // Save messages whenever they change in the active conversation
  const handleMessagesChange = useCallback(
    async (messages: { role: "user" | "assistant"; content: string }[]) => {
      if (!activeConvId || !userId) return;

      // Auto-generate title from first user message
      const firstUserMsg = messages.find((m) => m.role === "user");
      const autoTitle = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? "…" : "")
        : "New Conversation";

      const timestamped = messages.map((m) => ({
        ...m,
        timestamp: (m as any).timestamp || new Date().toISOString(),
      }));

      await supabase
        .from("ai_conversations")
        .update({
          messages: timestamped as any,
          conversation_title: autoTitle,
        })
        .eq("id", activeConvId);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: timestamped, conversation_title: autoTitle, updated_at: new Date().toISOString() }
            : c
        )
      );
    },
    [activeConvId, userId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* History sidebar - always visible on desktop, toggle on mobile */}
      <div
        className={`${
          showHistory ? "flex" : "hidden lg:flex"
        } flex-col w-full lg:w-64 shrink-0 border-r border-border/30 bg-muted/10`}
      >
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversations</h3>
          <Button
            size="sm"
            onClick={createNewConversation}
            className="h-8 gap-1.5 rounded-xl text-xs bg-primary text-primary-foreground"
          >
            <Plus size={14} /> New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No conversations yet. Start a new one!
            </div>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveConvId(c.id);
                setShowHistory(false);
              }}
              className={`w-full text-left px-3 py-3 border-b border-border/20 hover:bg-muted/20 transition-colors group ${
                activeConvId === c.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <MessageSquare size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{c.conversation_title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                      {" · "}
                      {c.messages.length} msg{c.messages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs gap-1.5"
          >
            <MessageSquare size={14} />
            {showHistory ? "Back to Chat" : `History (${conversations.length})`}
          </Button>
          {activeConv && (
            <span className="text-xs text-muted-foreground truncate flex-1">{activeConv.conversation_title}</span>
          )}
        </div>

        {!showHistory && (
          <>
            {activeConvId ? (
              <ChatWidget
                embedded
                conversationId={activeConvId}
                initialMessages={activeConv?.messages}
                onMessagesChange={handleMessagesChange}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask Hummm anything about your properties, negotiations, mortgages, or market trends.
                </p>
                <Button onClick={createNewConversation} className="rounded-xl gap-2 bg-primary text-primary-foreground">
                  <Plus size={16} /> New Conversation
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWithHistory;
