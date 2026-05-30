import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import TenantReferencingPanel from "@/components/dashboard/TenantReferencingPanel";
import RentCollectionPanel from "@/components/dashboard/RentCollectionPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, AlertTriangle, CheckCircle, Circle, Clock, Plus, Loader2,
  FileText, PawPrint, Wrench, Upload, Trash2, Home, Zap, TrendingUp,
  CalendarDays, Sparkles, LogOut, BarChart3, ChevronDown, ChevronUp,
  X, Building, Flame, Plug, Leaf, Eye, PenTool, ShieldCheck,
} from "lucide-react";

/* ─── Types ─── */
type LandlordProperty = {
  id: string;
  address: string;
  postcode: string | null;
  property_type: string | null;
  bedrooms: number | null;
  current_rent: number | null;
  ai_market_rent: number | null;
  epc_rating: string | null;
  epc_expiry: string | null;
  gas_cert_valid: boolean;
  gas_cert_expiry: string | null;
  electrical_cert_valid: boolean;
  electrical_cert_expiry: string | null;
  tenancy_type: string;
  tenancy_end_date: string | null;
  decent_homes_compliant: boolean;
  written_statement_served: boolean;
  compliance_status: string;
  last_rent_increase: string | null;
  notes: string | null;
};

type TenantRequest = {
  id: string;
  property_id: string;
  request_type: string;
  tenant_name: string | null;
  description: string;
  status: string;
  submitted_at: string;
  deadline_at: string;
  responded_at: string | null;
  response_notes: string | null;
};

type LandlordDoc = {
  id: string;
  property_id: string | null;
  document_type: string;
  file_name: string;
  file_url: string;
  expires_at: string | null;
};

/* ─── Helpers ─── */
function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function complianceColor(status: string) {
  if (status === "green") return "bg-green-500/15 text-green-400 border-green-500/30";
  if (status === "red") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

function complianceLabel(status: string) {
  if (status === "green") return "Ready";
  if (status === "red") return "Critical";
  return "Warning";
}

function computeCompliance(p: LandlordProperty): string {
  if (!p.decent_homes_compliant || !p.written_statement_served) return "red";
  if (!p.gas_cert_valid || !p.electrical_cert_valid) return "red";
  if (p.tenancy_type === "fixed") return "amber";
  if (p.epc_rating && ["D", "E", "F", "G"].includes(p.epc_rating.toUpperCase())) return "amber";
  return "green";
}

const MAY_1_2026 = new Date("2026-05-01T00:00:00Z");
const DAYS_UNTIL_REFORM = Math.max(0, Math.ceil((MAY_1_2026.getTime() - Date.now()) / 86400000));

/* ─── Page ─── */
const LandlordDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [documents, setDocuments] = useState<LandlordDoc[]>([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [rentAnalysis, setRentAnalysis] = useState<Record<string, any>>({});
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [propsRes, reqsRes, docsRes] = await Promise.all([
        supabase.from("landlord_properties").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("tenant_requests").select("*").eq("landlord_user_id", user.id).order("submitted_at", { ascending: false }),
        supabase.from("landlord_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProperties((propsRes.data as any[]) || []);
      setRequests((reqsRes.data as any[]) || []);
      setDocuments((docsRes.data as any[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  /* ─── Add Property ─── */
  const [newProp, setNewProp] = useState({ address: "", postcode: "", bedrooms: 2, current_rent: 0, property_type: "house" });

  const addProperty = async () => {
    if (!newProp.address.trim() || !user) return;
    const { error } = await supabase.from("landlord_properties").insert({
      user_id: user.id,
      address: newProp.address,
      postcode: newProp.postcode || null,
      bedrooms: newProp.bedrooms,
      current_rent: newProp.current_rent || null,
      property_type: newProp.property_type,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property added" });
      setShowAddProperty(false);
      setNewProp({ address: "", postcode: "", bedrooms: 2, current_rent: 0, property_type: "house" });
      // Refresh
      const { data } = await supabase.from("landlord_properties").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setProperties((data as any[]) || []);
    }
  };

  /* ─── Convert to Periodic ─── */
  const convertToPeriodic = async (propId: string) => {
    await supabase.from("landlord_properties").update({ tenancy_type: "periodic", tenancy_end_date: null } as any).eq("id", propId);
    setProperties(prev => prev.map(p => p.id === propId ? { ...p, tenancy_type: "periodic", tenancy_end_date: null, compliance_status: computeCompliance({ ...p, tenancy_type: "periodic" }) } : p));
    toast({ title: "Tenancy converted to periodic" });
  };

  const convertAllToPeriodic = async () => {
    const fixed = properties.filter(p => p.tenancy_type === "fixed");
    if (fixed.length === 0) { toast({ title: "All tenancies are already periodic" }); return; }
    for (const p of fixed) {
      await supabase.from("landlord_properties").update({ tenancy_type: "periodic", tenancy_end_date: null } as any).eq("id", p.id);
    }
    setProperties(prev => prev.map(p => p.tenancy_type === "fixed" ? { ...p, tenancy_type: "periodic", tenancy_end_date: null } : p));
    toast({ title: `${fixed.length} tenancies converted to periodic` });
  };

  /* ─── AI Rent Analysis ─── */
  const analyzeRent = async (prop: LandlordProperty) => {
    setAnalyzing(prop.id);
    try {
      const { data, error } = await supabase.functions.invoke("landlord-rent-analysis", {
        body: {
          address: prop.address,
          postcode: prop.postcode,
          currentRent: prop.current_rent,
          propertyType: prop.property_type,
          bedrooms: prop.bedrooms,
        },
      });
      if (error) throw error;
      setRentAnalysis(prev => ({ ...prev, [prop.id]: data }));
      if (data.market_rent) {
        await supabase.from("landlord_properties").update({ ai_market_rent: data.market_rent } as any).eq("id", prop.id);
        setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, ai_market_rent: data.market_rent } : p));
      }
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(null);
    }
  };

  /* ─── Document Upload ─── */
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, propertyId?: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("landlord-documents").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("landlord_documents").insert({
        user_id: user.id,
        property_id: propertyId || null,
        document_type: "general",
        file_name: file.name,
        file_url: path,
      } as any);
      if (insertErr) throw insertErr;

      toast({ title: "Document uploaded" });
      const { data } = await supabase.from("landlord_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDocuments((data as any[]) || []);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  /* ─── Respond to Request ─── */
  const respondToRequest = async (reqId: string, approved: boolean) => {
    await supabase.from("tenant_requests").update({
      status: approved ? "approved" : "rejected",
      responded_at: new Date().toISOString(),
    } as any).eq("id", reqId);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: approved ? "approved" : "rejected", responded_at: new Date().toISOString() } : r));
    toast({ title: approved ? "Request approved" : "Request rejected" });
  };

  // Compliance stats
  const greenCount = properties.filter(p => computeCompliance(p) === "green").length;
  const amberCount = properties.filter(p => computeCompliance(p) === "amber").length;
  const redCount = properties.filter(p => computeCompliance(p) === "red").length;
  const fixedCount = properties.filter(p => p.tenancy_type === "fixed").length;
  const pendingRequests = requests.filter(r => r.status === "pending");

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading Landlord Shield...</p>
          </div>
        </div>
        <Footer />
        <ChatWidget persona="compliance" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Landlord Shield | Hummm" description="Compliance command center for UK landlords — manage the 2026 Rental Reform transition." />
      <Navbar />

      <div className="pt-28 pb-24 section-padding">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-amber-500/30 bg-amber-500/5 rounded-full mb-4">
                  <Shield size={12} className="text-amber-400" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400">Landlord Shield</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Landlord Hummm</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Manage compliance, rent, and tenant requests — all in one place.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <Link to="/renters-rights-act" className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/15 transition-all">
                  <FileText size={13} /> Reform Guide
                </Link>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-xl transition-all">
                  <LogOut size={13} /> Log Out
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* ═══ MAY 1ST TRANSITION ALERT ═══ */}
          <AnimatedSection delay={50}>
            <div className="mb-8 p-5 rounded-2xl border-2 border-destructive/40 bg-destructive/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center shrink-0">
                    <AlertTriangle size={28} className="text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black mb-1 flex items-center gap-3">
                      Action Required: {DAYS_UNTIL_REFORM} Days Until Tenancy Reform
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Section 21 'no-fault' evictions will be abolished on May 1st, 2026. All tenancies must be periodic.
                      {fixedCount > 0 && (
                        <span className="text-destructive font-bold"> You have {fixedCount} fixed tenancies that need converting.</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={convertAllToPeriodic}
                        disabled={fixedCount === 0}
                        className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                      >
                        <Zap size={14} className="mr-2" />
                        Convert {fixedCount > 0 ? `${fixedCount} Tenancies` : "All"} to Periodic (Automated)
                      </Button>
                      <div className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-border rounded-xl">
                        <CalendarDays size={14} className="text-muted-foreground" />
                        <span className="text-xs font-bold tabular-nums">{DAYS_UNTIL_REFORM}</span>
                        <span className="text-xs text-muted-foreground">days remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Compliance Summary Badges */}
          <AnimatedSection delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="p-4 rounded-xl border border-border bg-card/40 text-center">
                <p className="text-2xl font-black tabular-nums">{properties.length}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Properties</p>
              </div>
              <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
                <p className="text-2xl font-black tabular-nums text-green-400">{greenCount}</p>
                <p className="text-[10px] text-green-400 font-bold uppercase">Compliant</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
                <p className="text-2xl font-black tabular-nums text-amber-400">{amberCount}</p>
                <p className="text-[10px] text-amber-400 font-bold uppercase">Warning</p>
              </div>
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
                <p className="text-2xl font-black tabular-nums text-destructive">{redCount}</p>
                <p className="text-[10px] text-destructive font-bold uppercase">Critical</p>
              </div>
            </div>
          </AnimatedSection>

          {/* ═══ PORTFOLIO COMPLIANCE GRID ═══ */}
          <AnimatedSection delay={150}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Building size={18} className="text-primary" />
                  Portfolio Compliance Grid
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAddProperty(true)} className="text-xs">
                    <Plus size={14} className="mr-1" /> Add Property
                  </Button>
                  <a
                    href="https://sentinel-pm.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Tired of the 2026 Reform paperwork? Let our partners at Sentinel handle your full portfolio management and legal compliance."
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[hsl(220,30%,15%)] text-foreground border border-border hover:bg-[hsl(220,30%,20%)] transition-all hover:scale-105"
                  >
                    <ShieldCheck size={14} /> Delegate to Sentinel PM
                  </a>
                </div>
              </div>

              {/* Add Property Modal */}
              {showAddProperty && (
                <div className="mb-4 p-5 rounded-2xl border border-primary/20 bg-card/60 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold">Add New Property</h3>
                    <button onClick={() => setShowAddProperty(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <Label className="text-xs">Address *</Label>
                      <Input value={newProp.address} onChange={e => setNewProp(p => ({ ...p, address: e.target.value }))} placeholder="42 Oak Lane" className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Postcode</Label>
                      <Input value={newProp.postcode} onChange={e => setNewProp(p => ({ ...p, postcode: e.target.value }))} placeholder="E14 5AB" className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Bedrooms</Label>
                      <Input type="text" inputMode="numeric" pattern="[0-9]*" value={newProp.bedrooms} onChange={e => setNewProp(p => ({ ...p, bedrooms: parseInt(e.target.value.replace(/\D/g, '')) || 1 }))} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Current Monthly Rent (£)</Label>
                      <Input type="text" inputMode="numeric" pattern="[0-9]*" value={newProp.current_rent} onChange={e => setNewProp(p => ({ ...p, current_rent: parseInt(e.target.value.replace(/\D/g, '')) || 0 }))} className="text-sm" />
                    </div>
                  </div>
                  <Button onClick={addProperty} disabled={!newProp.address.trim()} className="w-full">
                    <Plus size={14} className="mr-2" /> Add to Portfolio
                  </Button>
                </div>
              )}

              {properties.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-2xl bg-card/40">
                  <Home size={32} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-bold mb-2">No Properties Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add your first property to start tracking compliance.</p>
                  <Button onClick={() => setShowAddProperty(true)}>
                    <Plus size={14} className="mr-2" /> Add Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.map((prop) => {
                    const status = computeCompliance(prop);
                    const isExpanded = expandedProperty === prop.id;
                    const analysis = rentAnalysis[prop.id];
                    return (
                      <div key={prop.id} className={`rounded-2xl border transition-all ${
                        status === "red" ? "border-destructive/30" : status === "green" ? "border-green-500/20" : "border-amber-500/20"
                      } bg-card/40`}>
                        <button onClick={() => setExpandedProperty(isExpanded ? null : prop.id)} className="w-full text-left p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-muted/40 border border-border flex items-center justify-center shrink-0">
                            <Home size={18} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{prop.address}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {prop.postcode} · {prop.bedrooms} bed · {prop.property_type} · £{prop.current_rent?.toLocaleString() || "—"}/mo
                            </p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${complianceColor(status)}`}>
                            {complianceLabel(status)}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                            prop.tenancy_type === "periodic" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {prop.tenancy_type}
                          </span>
                          {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-5 space-y-4 animate-fade-in">
                            {/* Compliance Checklist */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <ComplianceItem label="Gas Safety" valid={prop.gas_cert_valid} icon={<Flame size={12} />} expiry={prop.gas_cert_expiry} />
                              <ComplianceItem label="Electrical" valid={prop.electrical_cert_valid} icon={<Plug size={12} />} expiry={prop.electrical_cert_expiry} />
                              <ComplianceItem label="EPC ≥ C" valid={!!prop.epc_rating && ["A", "B", "C"].includes(prop.epc_rating.toUpperCase())} icon={<Leaf size={12} />} extra={prop.epc_rating || "?"} />
                              <ComplianceItem label="Decent Homes" valid={prop.decent_homes_compliant} icon={<Home size={12} />} />
                              <ComplianceItem label="Written Statement" valid={prop.written_statement_served} icon={<FileText size={12} />} />
                              <ComplianceItem label="Periodic Tenancy" valid={prop.tenancy_type === "periodic"} icon={<CalendarDays size={12} />} />
                            </div>

                            {/* Convert to Periodic */}
                            {prop.tenancy_type === "fixed" && (
                              <Button size="sm" variant="destructive" onClick={() => convertToPeriodic(prop.id)} className="text-xs">
                                <Zap size={12} className="mr-1" /> Convert to Periodic
                              </Button>
                            )}

                            {/* Rent Maximizer */}
                            <div className="rounded-xl border border-border bg-muted/20 p-4">
                              <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                                <TrendingUp size={14} className="text-primary" />
                                Rent Maximizer (AI)
                              </h4>
                              <div className="flex items-center gap-4 mb-3">
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Current Rent</p>
                                  <p className="text-lg font-black tabular-nums">£{prop.current_rent?.toLocaleString() || "—"}</p>
                                </div>
                                <div className="text-muted-foreground">→</div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">AI Market Rate</p>
                                  <p className="text-lg font-black tabular-nums text-primary">
                                    {prop.ai_market_rent ? `£${prop.ai_market_rent.toLocaleString()}` : "—"}
                                  </p>
                                </div>
                                {prop.ai_market_rent && prop.current_rent && (
                                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    prop.ai_market_rent > prop.current_rent ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                                  }`}>
                                    {prop.ai_market_rent > prop.current_rent
                                      ? `+£${(prop.ai_market_rent - prop.current_rent).toLocaleString()}/mo`
                                      : "At market"
                                    }
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => analyzeRent(prop)} disabled={analyzing === prop.id} className="text-xs">
                                  {analyzing === prop.id ? <><Loader2 size={12} className="animate-spin mr-1" /> Analyzing...</> : <><Sparkles size={12} className="mr-1" /> Get AI Market Rate</>}
                                </Button>
                                {analysis && prop.current_rent && prop.ai_market_rent && prop.ai_market_rent > prop.current_rent && (
                                  <Button size="sm" className="text-xs bg-primary text-primary-foreground" onClick={() => {
                                    if (analysis.section_13_notice) {
                                      navigator.clipboard.writeText(analysis.section_13_notice);
                                      toast({ title: "Section 13 notice copied to clipboard" });
                                    }
                                  }}>
                                    <FileText size={12} className="mr-1" /> Draft Section 13 Notice
                                  </Button>
                                )}
                              </div>
                              {analysis && (
                                <div className="mt-3 p-3 rounded-lg bg-card/60 border border-border text-xs text-muted-foreground">
                                  <p className="font-bold text-foreground mb-1 capitalize">{analysis.assessment}</p>
                                  <p>{analysis.rationale}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* ═══ PET & MAINTENANCE INBOX ═══ */}
          <AnimatedSection delay={200}>
            <div className="mb-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <PawPrint size={18} className="text-amber-400" />
                Pet & Maintenance Inbox
                {pendingRequests.length > 0 && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                    {pendingRequests.length} Pending
                  </span>
                )}
              </h2>

              {requests.length === 0 ? (
                <div className="text-center py-10 border border-border rounded-2xl bg-card/40">
                  <PawPrint size={28} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">No tenant requests yet.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Under the new Act, you must respond to pet requests within 28 days.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => {
                    const daysLeft = daysUntil(req.deadline_at);
                    const isPending = req.status === "pending";
                    const isUrgent = isPending && daysLeft <= 7;
                    return (
                      <div key={req.id} className={`p-4 rounded-xl border ${isUrgent ? "border-destructive/30 bg-destructive/5" : "border-border bg-card/40"}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            req.request_type === "pet" ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"
                          }`}>
                            {req.request_type === "pet" ? <PawPrint size={16} className="text-amber-400" /> : <Wrench size={16} className="text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold capitalize">{req.request_type} Request</p>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                req.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : req.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            {req.tenant_name && <p className="text-xs text-muted-foreground">From: {req.tenant_name}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                          </div>
                          {isPending && (
                            <div className="text-right shrink-0">
                              <div className={`flex items-center gap-1 text-xs font-bold ${isUrgent ? "text-destructive" : "text-amber-400"}`}>
                                <Clock size={12} />
                                {daysLeft}d left
                              </div>
                              <div className="flex gap-1.5 mt-2">
                                <Button size="sm" variant="outline" className="text-[10px] px-2 h-7" onClick={() => respondToRequest(req.id, true)}>
                                  <CheckCircle size={10} className="mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="ghost" className="text-[10px] px-2 h-7 text-destructive" onClick={() => respondToRequest(req.id, false)}>
                                  <X size={10} className="mr-1" /> Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* ═══ CONTRACT EDITOR CTA ═══ */}
          <AnimatedSection delay={220}>
            <Link
              to="/dashboard/landlord/contracts"
              className="block rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-8 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PenTool size={20} className="text-primary" />
                  <div>
                    <h2 className="text-base font-bold group-hover:text-primary transition-colors">Contract Editor & Signer</h2>
                    <p className="text-xs text-muted-foreground">Draft, customise, and sign the 3 mandatory 2026 tenancy documents with a full audit trail.</p>
                  </div>
                </div>
                <ChevronDown size={16} className="text-muted-foreground -rotate-90" />
              </div>
            </Link>
          </AnimatedSection>

          {/* ═══ DIGITAL DOCUMENT VAULT ═══ */}
          <AnimatedSection delay={250}>
            <div className="mb-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <FileText size={18} className="text-primary" />
                Digital Document Vault
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Store your mandatory 'Information Sheets' and 'Written Statements' — must be served to tenants by May 31, 2026.
              </p>

              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/30 transition-all mb-4">
                  {uploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Upload size={18} className="text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Document"}</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleDocUpload(e)} disabled={uploading} className="hidden" />
                </label>

                {documents.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/10">
                        <FileText size={16} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{doc.file_name}</p>
                          <p className="text-[10px] text-muted-foreground">{doc.document_type}</p>
                        </div>
                        {doc.expires_at && (
                          <span className="text-[9px] text-muted-foreground">Exp: {new Date(doc.expires_at).toLocaleDateString("en-GB")}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <TenantReferencingPanel />
              <RentCollectionPanel />
            </div>
          </AnimatedSection>

        </div>
      </div>

      <Footer />
      <ChatWidget persona="compliance" />
    </div>
  );
};

/* ─── Compliance Item Badge ─── */
function ComplianceItem({ label, valid, icon, expiry, extra }: { label: string; valid: boolean; icon: React.ReactNode; expiry?: string | null; extra?: string }) {
  return (
    <div className={`p-2.5 rounded-lg border text-center ${valid ? "border-green-500/20 bg-green-500/5" : "border-destructive/20 bg-destructive/5"}`}>
      <div className={`flex items-center justify-center gap-1 mb-1 ${valid ? "text-green-400" : "text-destructive"}`}>
        {icon}
        {valid ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
      </div>
      <p className="text-[10px] font-bold">{label}</p>
      {extra && <p className="text-[9px] text-muted-foreground">{extra}</p>}
      {expiry && <p className="text-[9px] text-muted-foreground">Exp: {new Date(expiry).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}</p>}
    </div>
  );
}

export default LandlordDashboard;
