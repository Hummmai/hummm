import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import SEOHead from "@/components/SEOHead";
import hummLogo from "@/assets/humm-logo-transparent.png";
import { Send, Loader2, CheckCircle2, Copy, Users, ArrowLeft, XCircle, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const OWNER_EMAIL = "rpe976@gmail.com";

const ROLES = [
  { value: "investor", label: "Investor" },
  { value: "tester", label: "Tester" },
  { value: "partner", label: "Partner" },
];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HUMM-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const OwnerAccess = () => {
  const { userEmail, isLoggedIn } = useHumm();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("tester");
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"requests" | "invites">("requests");

  const isOwner = userEmail?.toLowerCase() === OWNER_EMAIL;

  useEffect(() => {
    if (isOwner) {
      fetchInvites();
      fetchRequests();
    }
  }, [isOwner]);

  const fetchInvites = async () => {
    const { data } = await supabase
      .from("early_access_invites")
      .select("*")
      .order("created_at", { ascending: false });
    setInvites(data || []);
    setLoading(false);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("early_access_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setRequests((data as any[]) || []);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("early_access_invites")
        .insert({ email: email.toLowerCase().trim(), name: name.trim() || null, role, invited_by: user.id } as any)
        .select()
        .single();
      if (error) {
        if (error.code === "23505") toast.info("This email has already been invited.");
        else throw error;
      } else {
        toast.success(`Invite sent to ${email}`);
        setEmail("");
        setName("");
        fetchInvites();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  const approveRequest = async (req: any) => {
    const code = generateCode();
    const { error } = await supabase
      .from("early_access_requests" as any)
      .update({ status: "approved", access_code: code } as any)
      .eq("id", req.id);
    if (error) {
      toast.error("Failed to approve");
    } else {
      toast.success(`Approved! Code: ${code}`);
      fetchRequests();
    }
  };

  const rejectRequest = async (req: any) => {
    const { error } = await supabase
      .from("early_access_requests" as any)
      .update({ status: "rejected" } as any)
      .eq("id", req.id);
    if (error) toast.error("Failed to reject");
    else {
      toast.success("Request rejected");
      fetchRequests();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Access code copied!");
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite?token=${token}`);
    toast.success("Invite link copied!");
  };

  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (!isOwner) return <Navigate to="/dashboard" replace />;

  const pendingRequests = requests.filter((r: any) => r.status === "pending");
  const processedRequests = requests.filter((r: any) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Owner Access | Hummm" description="Manage early access invites and requests" />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <span className="relative inline-flex items-center">
          <img src={hummLogo} alt="Hummm" className="h-9 sm:h-11 w-auto" />
        </span>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Access Management</h1>
            <p className="text-sm text-muted-foreground">Manage requests & invites</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab("requests")} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "requests" ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-muted-foreground hover:text-foreground"}`}>
            Access Requests {pendingRequests.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px]">{pendingRequests.length}</span>}
          </button>
          <button onClick={() => setTab("invites")} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "invites" ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-muted-foreground hover:text-foreground"}`}>
            Direct Invites ({invites.length})
          </button>
        </div>

        {tab === "requests" && (
          <div className="space-y-8">
            {/* Pending */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" /> Pending ({pendingRequests.length})
              </h2>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="p-5 rounded-2xl border border-amber-500/20 bg-card/60 backdrop-blur-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{req.email}</p>
                          {req.name && <p className="text-xs text-muted-foreground mt-0.5">{req.name}</p>}
                          {req.reason && <p className="text-xs text-muted-foreground/70 mt-2 italic">"{req.reason}"</p>}
                          <p className="text-[10px] text-muted-foreground/40 mt-2">{new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => approveRequest(req)} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                            <CheckCircle2 size={14} className="inline mr-1" /> Approve
                          </button>
                          <button onClick={() => rejectRequest(req)} className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-all">
                            <XCircle size={14} className="inline mr-1" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Processed */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Processed ({processedRequests.length})
              </h2>
              {processedRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No processed requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {processedRequests.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-card/40">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{req.email}</p>
                          {req.status === "approved" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">Approved</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Rejected</span>
                          )}
                        </div>
                        {req.access_code && <p className="text-xs text-muted-foreground font-mono mt-1">Code: {req.access_code}</p>}
                      </div>
                      {req.access_code && (
                        <button onClick={() => copyCode(req.access_code)} className="shrink-0 ml-3 p-2.5 rounded-xl border border-border/40 hover:bg-primary/10 transition-colors" title="Copy code">
                          <Copy size={14} className="text-primary" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "invites" && (
          <div className="space-y-8">
            {/* Invite Form */}
            <form onSubmit={handleInvite} className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 sm:p-8 space-y-4 shadow-[0_8px_40px_-12px_hsl(168_100%_45%/0.1)]">
              <h2 className="text-lg font-bold mb-2">Direct Invite</h2>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="investor@example.com" required className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Name (optional)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary transition-all appearance-none">
                  {ROLES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                </select>
              </div>
              <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold rounded-2xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-60 transition-all shadow-[0_4px_24px_-4px_hsl(168_100%_45%/0.35)] active:scale-[0.98]">
                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Invite</>}
              </button>
            </form>

            {/* Invited List */}
            <div>
              <h2 className="text-lg font-bold mb-4">Invited ({invites.length})</h2>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
              ) : invites.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No invites yet.</p>
              ) : (
                <div className="space-y-3">
                  {invites.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-card/40">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{inv.email}</p>
                          {inv.redeemed && <CheckCircle2 size={14} className="text-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{inv.name ? `${inv.name} · ` : ""}{inv.role} · {inv.redeemed ? "Redeemed" : "Pending"}</p>
                      </div>
                      <button onClick={() => copyLink(inv.token)} className="shrink-0 ml-3 p-2.5 rounded-xl border border-border/40 hover:bg-primary/10 transition-colors" title="Copy invite link">
                        <Copy size={14} className="text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerAccess;
