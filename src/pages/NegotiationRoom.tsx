import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ReactMarkdown from "react-markdown";
import FullNegotiationMode from "@/components/FullNegotiationMode";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Send, Home, DollarSign, FileText, Mail,
  Calculator, Shield, Sparkles, ChevronRight, Loader2,
  Bed, Bath, MapPin, TrendingUp, Star, PanelRightOpen, PanelRightClose,
  Wand2, Copy, CheckCheck, ClipboardList, FileCheck, ArrowRight,
} from "lucide-react";

/* ─── types ─── */
interface SavedAudit {
  id: string;
  address: string | null;
  postcode: string | null;
  asking_price: number | null;
  humm_fair_value: number | null;
  ai_score: number | null;
  images: string[] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  risks: string[] | null;
  opportunities: string[] | null;
  description: string | null;
  currency: string | null;
  property_url: string;
}

type Msg = { role: "user" | "assistant"; content: string };

const fmt = (n: number | null | undefined, cur = "GBP") =>
  n ? new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n) : "—";

/* ─── Mortgage Calculator ─── */
function MortgageCalc() {
  const [loan, setLoan] = useState(300000);
  const [rate, setRate] = useState(5.2);
  const [term, setTerm] = useState(25);
  const monthly = (() => {
    const r = rate / 100 / 12;
    const n = term * 12;
    if (r === 0) return loan / n;
    return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();
  const total = monthly * term * 12;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" /> Mortgage Calculator</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Loan Amount</label>
          <Input type="number" value={loan} onChange={e => setLoan(+e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Interest Rate (%)</label>
          <Input type="number" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Term (years)</label>
          <Input type="number" value={term} onChange={e => setTerm(+e.target.value)} className="bg-secondary/50 border-border" />
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex-1 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
          <p className="text-2xl font-black text-primary">{fmt(monthly)}</p>
        </div>
        <div className="flex-1 bg-secondary/50 border border-border rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-foreground">{fmt(total)}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Email Composer ─── */
function EmailComposer({ property }: { property: SavedAudit | null }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDraft = async () => {
    if (!property) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("draft-opening-email", {
        body: { address: property.address, askingPrice: property.asking_price, fairValue: property.humm_fair_value },
      });
      if (data?.subject) setSubject(data.subject);
      if (data?.body) setBody(data.body);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> Email Preparation</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generateDraft} disabled={aiLoading || !property} className="border-primary/30 text-primary hover:bg-primary/10">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            AI Draft
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} className="border-border">
            {copied ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <Input placeholder="Subject line…" value={subject} onChange={e => setSubject(e.target.value)} className="bg-secondary/50 border-border" />
      <Textarea placeholder="Write your email here…" value={body} onChange={e => setBody(e.target.value)} rows={8} className="bg-secondary/50 border-border" />
    </div>
  );
}

/* ─── Quick Tool buttons ─── */
const TOOLS = [
  { label: "Generate Offer Letter", icon: FileText, prompt: "Please generate a professional offer letter for this property." },
  { label: "Contract Review", icon: FileCheck, prompt: "Help me review the key contract terms I should look for with this property." },
  { label: "Screening Checklist", icon: ClipboardList, prompt: "Generate a tenant/buyer screening checklist for this property." },
  { label: "Next Steps", icon: ArrowRight, prompt: "What are the recommended next steps for this property negotiation?" },
];

/* ─── Main Page ─── */
export default function NegotiationRoom() {
  const { isLoggedIn, userId, userEmail } = useHumm();
  const navigate = useNavigate();
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [selected, setSelected] = useState<SavedAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "fullneg" | "email" | "mortgage">("overview");

  /* AI Chat state */
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/auth?redirect=/negotiation-room"); return; }
    fetchAudits();
  }, [isLoggedIn]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchAudits = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("saved_audits")
      .select("id, address, postcode, asking_price, humm_fair_value, ai_score, images, bedrooms, bathrooms, property_type, risks, opportunities, description, currency, property_url")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false });
    const list = (data || []) as SavedAudit[];
    setAudits(list);
    if (list.length > 0) setSelected(list[0]);
    setLoading(false);
  };

  /* AI Chat */
  const sendChat = async (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg) return;
    const userMsg: Msg = { role: "user", content: msg };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setChatInput("");
    setChatLoading(true);

    try {
      const propertyContext = selected
        ? `Current property: ${selected.address}, Asking ${fmt(selected.asking_price, selected.currency || "GBP")}, Hummm Fair Value ${fmt(selected.humm_fair_value, selected.currency || "GBP")}, AI Score ${selected.ai_score}/100. Risks: ${(selected.risks || []).join(", ")}. Opportunities: ${(selected.opportunities || []).join(", ")}.`
        : "No property selected.";

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are Hummm — the world's most powerful AI Property Negotiation Assistant. You have context about the user's selected property:\n${propertyContext}\n\nHelp with negotiations, offer letters, objection handling, mortgage advice, contract reviews and more. Always be professional and actionable. Add disclaimer: "This is general guidance only."` },
            ...allMsgs,
          ],
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantSoFar = "";

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
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) {
              assistantSoFar += c;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    }
    setChatLoading(false);
  };

  const userName = userEmail?.split("@")[0] || "there";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Negotiation Room | Hummm" description="Your personal AI-powered property negotiation command centre." />
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-16 z-30">
          <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Your Negotiation Room</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {userName} 👋</p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={() => setChatOpen(!chatOpen)} className="border-primary/30 text-primary">
                {chatOpen ? <PanelRightClose className="w-4 h-4 mr-1" /> : <PanelRightOpen className="w-4 h-4 mr-1" />}
                AI Assistant
              </Button>
              <Button size="sm" onClick={() => navigate("/dashboard")} className="bg-primary text-primary-foreground">
                <Home className="w-4 h-4 mr-1" /> Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto flex" style={{ minHeight: "calc(100vh - 10rem)" }}>
          {/* ─── Left Sidebar: Properties ─── */}
          <aside className="w-72 xl:w-80 border-r border-border bg-card/30 overflow-y-auto flex-shrink-0 hidden lg:block" style={{ maxHeight: "calc(100vh - 10rem)" }}>
            <div className="p-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">Saved Properties ({audits.length})</h2>
              <div className="space-y-2">
                {audits.map(a => {
                  const isActive = selected?.id === a.id;
                  const thumb = a.images?.[0] ? `https://image.thum.io/get/width/120/crop/80/${a.images[0]}` : null;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all group ${isActive ? "bg-primary/[0.08] border-primary/40 shadow-[0_0_20px_rgba(0,229,204,0.1)]" : "bg-card/50 border-border hover:border-primary/20 hover:bg-card"}`}
                    >
                      <div className="flex gap-3">
                        {thumb && <img src={thumb} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground truncate">{a.address || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{a.postcode}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-primary">{fmt(a.humm_fair_value, a.currency || "GBP")}</span>
                            {a.ai_score && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">{a.ai_score}/100</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {audits.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No saved properties yet. Audit a property first.</p>
                )}
              </div>
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <main className={`flex-1 overflow-y-auto transition-all ${chatOpen ? "mr-0" : ""}`} style={{ maxHeight: "calc(100vh - 10rem)" }}>
            {selected ? (
              <div className="p-6 xl:p-8 space-y-6">
                {/* Property Header */}
                <div className="flex flex-col md:flex-row gap-6">
                  {selected.images?.[0] && (
                    <img src={selected.images[0]} alt="" className="w-full md:w-64 h-44 object-cover rounded-2xl border border-border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-foreground">{selected.address}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selected.postcode} • {selected.property_type}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {selected.bedrooms && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Bed className="w-4 h-4" />{selected.bedrooms} bed</span>}
                      {selected.bathrooms && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Bath className="w-4 h-4" />{selected.bathrooms} bath</span>}
                    </div>
                    <div className="flex gap-4 mt-4">
                      <div className="bg-secondary/50 border border-border rounded-2xl px-4 py-3 text-center">
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Asking</p>
                        <p className="text-lg font-black text-foreground">{fmt(selected.asking_price, selected.currency || "GBP")}</p>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 text-center">
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Hummm Fair Value</p>
                        <p className="text-lg font-black text-primary">{fmt(selected.humm_fair_value, selected.currency || "GBP")}</p>
                      </div>
                      <div className="bg-secondary/50 border border-border rounded-2xl px-4 py-3 text-center">
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">AI Score</p>
                        <p className="text-lg font-black text-foreground">{selected.ai_score ?? "—"}<span className="text-sm text-muted-foreground">/100</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
                  {([["overview", "Overview"], ["fullneg", "Full Negotiation"], ["email", "Email Prep"], ["mortgage", "Mortgage"]] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Quick Tools */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">Quick Tools</h3>
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        {TOOLS.map(t => (
                          <button
                            key={t.label}
                            onClick={() => { setChatOpen(true); sendChat(t.prompt); }}
                            className="group bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(0,229,204,0.08)] transition-all"
                          >
                            <t.icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-bold text-foreground">{t.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Risks & Opportunities */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-destructive mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Risks</h4>
                        <ul className="space-y-2">
                          {(selected.risks || []).map((r, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-destructive mt-1">•</span>{r}</li>)}
                          {(!selected.risks || selected.risks.length === 0) && <p className="text-sm text-muted-foreground">No risks identified.</p>}
                        </ul>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Opportunities</h4>
                        <ul className="space-y-2">
                          {(selected.opportunities || []).map((o, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-1">•</span>{o}</li>)}
                          {(!selected.opportunities || selected.opportunities.length === 0) && <p className="text-sm text-muted-foreground">No opportunities identified.</p>}
                        </ul>
                      </div>
                    </div>

                    {/* Description */}
                    {selected.description && (
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-foreground mb-2">Property Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "email" && <EmailComposer property={selected} />}
                {activeTab === "fullneg" && userId && <FullNegotiationMode userId={userId} property={selected} />}
                {activeTab === "mortgage" && (
                  <div className="space-y-4">
                    <MortgageCalc />
                    <Button onClick={() => { setChatOpen(true); sendChat("I need help with mortgage options for this property. What rates and terms should I be looking for?"); }} className="bg-primary text-primary-foreground">
                      <Sparkles className="w-4 h-4 mr-2" /> Assist with Mortgage
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground">No properties yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Audit a property to get started.</p>
                  <Button onClick={() => navigate("/home")} className="mt-4 bg-primary text-primary-foreground">Drop a Link</Button>
                </div>
              </div>
            )}
          </main>

          {/* ─── Right: AI Chat ─── */}
          {chatOpen && (
            <aside className="w-80 xl:w-96 border-l border-border bg-card/30 flex flex-col flex-shrink-0 hidden lg:flex" style={{ maxHeight: "calc(100vh - 10rem)" }}>
              <div className="p-4 border-b border-border flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-primary" /></div>
                <div>
                  <p className="text-sm font-bold text-foreground">Hummm</p>
                  <p className="text-[10px] text-primary">Property Negotiation Expert</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Hi, I'm Hummm — your AI Negotiation Expert. Ask me anything about your properties.</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground border border-border"}`}>
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                      ) : m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 border border-border rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>
              <div className="p-3 border-t border-border">
                <form onSubmit={e => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about this property…"
                    className="bg-secondary/50 border-border flex-1"
                  />
                  <Button type="submit" size="icon" disabled={chatLoading || !chatInput.trim()} className="bg-primary text-primary-foreground">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </aside>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
