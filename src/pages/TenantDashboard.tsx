import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ChatWidget from "@/components/ChatWidget";
import {
  Key, FileText, PawPrint, Wrench, Shield, CheckCircle, Home,
  Loader2, Send, Plus, Eye, CreditCard, ArrowRight, Bot,
  CalendarDays, MessageSquare, Search, Link2, ChevronRight,
} from "lucide-react";

type TenantRequest = {
  id: string;
  request_type: string;
  description: string;
  status: string;
  submitted_at: string;
  deadline_at: string;
  response_notes: string | null;
};

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reqType, setReqType] = useState("repair");
  const [reqDesc, setReqDesc] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [savedAudits, setSavedAudits] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/auth"); return; }
      setUserId(data.user.id);
      fetchData(data.user.id);
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    const { data: profile } = await supabase.from("profiles").select("email").eq("user_id", uid).single();

    const [reqRes, auditRes] = await Promise.all([
      profile?.email
        ? supabase.from("tenant_requests").select("*").eq("tenant_email", profile.email).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase.from("saved_audits").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(6),
    ]);

    setRequests((reqRes.data as any[]) || []);
    setSavedAudits(auditRes.data || []);
    setLoading(false);
  };

  const daysRemaining = (deadline: string) => Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Renter Dashboard | Hummm" description="Your Renter Command Centre — tenancy, rights, and AI assistance." />
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
                  Renter Command Centre
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back — manage your tenancy, rights, and rental negotiations.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/home")} className="bg-primary text-primary-foreground rounded-xl font-bold gap-2 shadow-[0_4px_20px_-4px_hsl(168_100%_45%/0.3)]">
                  <Link2 size={16} /> Drop New Rental Link
                </Button>
                <Button variant="outline" onClick={() => setShowChat(!showChat)} className="rounded-xl font-bold gap-2 border-primary/30 text-primary hover:bg-primary/10">
                  <Bot size={16} /> AI Assistant
                </Button>
              </div>
            </div>
          </AnimatedSection>

          <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Top Stats */}
              <AnimatedSection delay={50}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Applications", value: String(requests.filter(r => r.request_type === "pet").length), icon: FileText, accent: "from-violet-500/15 to-purple-500/15" },
                    { label: "Upcoming Viewings", value: "0", icon: Eye, accent: "from-emerald-500/15 to-teal-500/15" },
                    { label: "Active Requests", value: String(requests.filter(r => r.status !== "resolved").length), icon: Wrench, accent: "from-blue-500/15 to-indigo-500/15" },
                    { label: "Rent Payments", value: "—", icon: CreditCard, accent: "from-amber-500/15 to-orange-500/15" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-3xl border border-border/60 bg-card/40 p-6 hover:border-primary/30 hover:shadow-[0_4px_24px_-6px_hsl(168_100%_45%/0.08)] transition-all duration-300">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-4`}>
                        <s.icon size={20} className="text-primary" />
                      </div>
                      <p className="text-3xl font-black tabular-nums">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Tenancy Status */}
              <AnimatedSection delay={80}>
                <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/[0.02] p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Your Tenancy Status</h2>
                      <p className="text-xs text-muted-foreground">Current rights and protections</p>
                    </div>
                    <Badge className="ml-auto bg-primary/15 text-primary border-primary/30 text-[10px] font-bold rounded-xl px-3">Protected ✓</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Tenancy Type", value: "Assured Periodic" },
                      { label: "End Date", value: "Rolling", highlight: true },
                      { label: "Notice Period", value: "2 Months" },
                      { label: "Section 21", value: "Abolished ✓", highlight: true },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-muted/15 border border-border/30 p-4 text-center">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{item.label}</p>
                        <p className={`text-sm font-black ${item.highlight ? 'text-primary' : ''}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* Your 2026 Rights */}
              <AnimatedSection delay={120}>
                <div className="rounded-3xl border border-border/60 bg-card/40 p-8">
                  <h2 className="text-lg font-black mb-5 flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Your 2026 Rights
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: PawPrint, title: "Pet Rights", text: "Landlord must respond to pet requests within 28 days" },
                      { icon: Wrench, title: "Timely Repairs", text: "Decent Homes Standard now applies to all rentals" },
                      { icon: Shield, title: "No Section 21", text: "Landlord must use Section 8 grounds for eviction" },
                      { icon: Home, title: "Rent Protection", text: "Increases limited to once per year via Section 13" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-4 rounded-2xl bg-muted/10 border border-border/30 p-5 hover:border-primary/20 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <r.icon size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold mb-0.5">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* My Requests */}
              <AnimatedSection delay={160}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black">My Requests</h2>
                  <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="rounded-xl font-bold gap-1.5">
                    <Plus size={14} /> New Request
                  </Button>
                </div>

                {showForm && (
                  <div className="rounded-3xl border border-primary/20 bg-card/60 p-6 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mb-4">
                      <label className="text-xs font-bold mb-1.5 block">Request Type</label>
                      <select value={reqType} onChange={(e) => setReqType(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-muted/20 px-3 text-sm">
                        <option value="repair">Repair Request</option>
                        <option value="pet">Pet Application</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <label className="text-xs font-bold mb-1.5 block">Description</label>
                    <textarea value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} className="w-full min-h-[100px] rounded-xl border border-border bg-muted/20 p-4 text-sm resize-y" placeholder="Describe your request..." />
                    <p className="text-[10px] text-muted-foreground mt-2 mb-4">Your landlord has 28 days to respond to pet requests under the 2026 Act.</p>
                    <Button size="sm" className="bg-primary text-primary-foreground rounded-xl font-bold gap-1.5" disabled={!reqDesc.trim()} onClick={() => { toast({ title: "Request submitted", description: "Your landlord has been notified." }); setShowForm(false); setReqDesc(""); }}>
                      <Send size={14} /> Submit Request
                    </Button>
                  </div>
                )}

                {requests.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/60 bg-card/20 p-12 text-center">
                    <CheckCircle size={28} className="mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">No active requests. Everything is in order.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => {
                      const days = daysRemaining(r.deadline_at);
                      return (
                        <div key={r.id} className="rounded-3xl border border-border/60 bg-card/40 p-6 hover:border-primary/20 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                {r.request_type === "pet" ? <PawPrint size={16} className="text-primary" /> : <Wrench size={16} className="text-primary" />}
                              </div>
                              <span className="text-sm font-black capitalize">{r.request_type} Request</span>
                            </div>
                            <Badge className={`text-[10px] font-bold rounded-xl px-3 py-1 ${r.status === "resolved" ? "bg-primary/15 text-primary border-primary/30" : days <= 7 ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                              {r.status === "resolved" ? "Resolved" : `${days} days left`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                          {r.response_notes && <p className="text-xs text-primary mt-2 font-medium">Landlord: {r.response_notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnimatedSection>

              {/* Saved Rental Searches */}
              <AnimatedSection delay={200}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black">Saved Rental Properties</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/propertyscout")} className="text-primary text-xs font-bold gap-1">
                    Browse More <ChevronRight size={14} />
                  </Button>
                </div>
                {savedAudits.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/60 bg-card/20 p-12 text-center">
                    <Search size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">No saved rentals yet</p>
                    <Button onClick={() => navigate("/home")} className="bg-primary text-primary-foreground rounded-xl font-bold gap-2">
                      <Link2 size={14} /> Drop a Rental Link
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedAudits.map((a) => (
                      <div key={a.id} className="group rounded-3xl border border-border/60 bg-card/40 overflow-hidden hover:border-primary/30 hover:shadow-[0_4px_30px_rgba(0,229,204,0.08)] transition-all duration-300 cursor-pointer" onClick={() => navigate("/home")}>
                        <div className="h-32 bg-muted/20 relative overflow-hidden">
                          {a.images?.[0] ? (
                            <img src={a.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Home size={24} className="text-muted-foreground/20" /></div>
                          )}
                        </div>
                        <div className="p-5">
                          <p className="text-sm font-black line-clamp-2 group-hover:text-primary transition-colors mb-1">{a.address || "Rental Property"}</p>
                          {a.asking_price && <p className="text-xs font-bold text-primary">£{a.asking_price.toLocaleString()}/pcm</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedSection>

              {/* Quick Actions */}
              <AnimatedSection delay={240}>
                <h2 className="text-lg font-black mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Start Rent Negotiation", icon: MessageSquare, path: "/humm-ai-negotiator" },
                    { label: "Know Your Rights", icon: Shield, path: "/renters-rights" },
                    { label: "Property Scout", icon: Search, path: "/propertyscout" },
                  ].map((a) => (
                    <button key={a.path} onClick={() => navigate(a.path)} className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                      <a.icon size={22} className="mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold">{a.label}</p>
                    </button>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* AI Chat Sidebar (desktop) */}
            {showChat && (
              <div className="hidden lg:block w-[380px] shrink-0">
                <div className="sticky top-24 rounded-3xl border border-primary/20 bg-card/60 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot size={18} className="text-primary" />
                      <span className="text-sm font-black">AI Renter Assistant</span>
                    </div>
                    <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                  </div>
                  <div className="h-[calc(100%-60px)]">
                    <ChatWidget />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TenantDashboard;
