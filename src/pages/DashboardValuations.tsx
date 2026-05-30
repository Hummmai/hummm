import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Sparkles, LogOut, Home, TrendingUp, Calendar, ArrowRight,
  BarChart3, FileText, Loader2, Plus, Zap, MapPin, Bed, Bath, Shield,
  RefreshCw, DollarSign, Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValuationReport {
  id: string;
  address: string;
  postcode: string | null;
  property_type: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  valuation_low: number | null;
  valuation_high: number | null;
  confidence: number | null;
  created_at: string;
  status: string;
}

const DashboardValuations = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<ValuationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [rerunningId, setRerunningId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: valuations } = await supabase
        .from("ai_valuations")
        .select("id, address, postcode, property_type, bedrooms, bathrooms, valuation_low, valuation_high, confidence, created_at, status")
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order("created_at", { ascending: false });
      setReports(valuations || []);

      if (valuations?.length) {
        const unlinked = valuations.filter((v: any) => !v.user_id);
        if (unlinked.length) {
          await supabase
            .from("ai_valuations")
            .update({ user_id: user.id })
            .is("user_id", null)
            .eq("email", user.email);
        }
      }

      const dashboardVisited = localStorage.getItem("dashboard_visited");
      if (!dashboardVisited) {
        setIsFirstVisit(true);
        localStorage.setItem("dashboard_visited", "true");
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "You have been signed out." });
    navigate("/");
  };

  const handleRerun = async (report: ValuationReport) => {
    setRerunningId(report.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-valuation", {
        body: {
          address: report.address,
          propertyType: report.property_type || "",
          bedrooms: report.bedrooms || "",
          bathrooms: report.bathrooms || "",
          sqft: "",
          improvements: "",
          email: user.email,
          phone: "",
        },
      });
      if (error) throw error;
      toast({ title: "Valuation Updated", description: "New valuation generated with latest market data." });
      // Refresh reports
      const { data: valuations } = await supabase
        .from("ai_valuations")
        .select("id, address, postcode, property_type, bedrooms, bathrooms, valuation_low, valuation_high, confidence, created_at, status")
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order("created_at", { ascending: false });
      setReports(valuations || []);
    } catch (e: any) {
      toast({ title: "Re-run failed", description: e.message, variant: "destructive" });
    } finally {
      setRerunningId(null);
    }
  };

  const rawName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
  const firstName = rawName.split(" ")[0];
  const avgConfidence = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + (r.confidence || 0), 0) / reports.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">Loading your valuations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="My Valuations | Hummm" description="View and manage your AI property valuation reports." />
      <Navbar />

      <div className="pt-28 pb-24 section-padding">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-4">
                  <Shield size={12} className="text-primary" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">Research Hub</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Welcome back, <span className="text-primary">{firstName}</span>!
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Your AI valuation reports and property research.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <Link
                  to="/dashboard/deal-room"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/15 transition-all"
                >
                  <Briefcase size={13} />
                  Deal Room
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-xl transition-all"
                >
                  <LogOut size={13} />
                  Log Out
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* First visit welcome */}
          {isFirstVisit && (
            <AnimatedSection delay={50}>
              <div className="relative rounded-2xl p-6 sm:p-8 mb-10 overflow-hidden border border-primary/20"
                style={{ background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary) / 0.06))' }}>
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">Welcome to Your Research Hub!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every AI valuation you run is saved here. Re-run with latest data anytime, or move a property to the Deal Room when you're ready to sell.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Stats row */}
          <AnimatedSection delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: FileText, label: "Total Reports", value: reports.length.toString(), accent: reports.length > 0 },
                { icon: TrendingUp, label: "Latest Valuation", value: reports[0]?.valuation_high ? `£${reports[0].valuation_high.toLocaleString()}` : "—", accent: !!reports[0]?.valuation_high },
                { icon: BarChart3, label: "Avg Confidence", value: avgConfidence > 0 ? `${avgConfidence}%` : "—", accent: avgConfidence > 0 },
              ].map((stat) => (
                <div key={stat.label} className="glass-surface rounded-2xl p-6 hover:border-primary/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                      <stat.icon size={18} className="text-primary" />
                    </div>
                    {stat.accent && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Reports */}
          <AnimatedSection delay={150}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Your Valuation Reports</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {reports.length > 0 ? `${reports.length} report${reports.length !== 1 ? "s" : ""} saved` : "No reports yet"}
                </p>
              </div>
              <Link to="/ai-valuation" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-full shadow-lg shadow-primary/20">
                <Plus size={14} /> New Valuation
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="relative rounded-2xl p-14 sm:p-20 text-center overflow-hidden border border-border"
                style={{ background: 'linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted) / 0.3))' }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                  <Home size={200} strokeWidth={0.5} />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={28} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Your first AI valuation will appear here</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    Get an instant, AI-powered property valuation — completely free.
                  </p>
                  <Link to="/ai-valuation" className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-xl shadow-primary/25">
                    <Zap size={16} /> Get Your First Free AI Valuation
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reports.map((report, idx) => (
                  <AnimatedSection key={report.id} delay={180 + idx * 40}>
                    <div className="glass-surface rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group h-full flex flex-col">
                      {/* Image placeholder */}
                      <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center relative">
                        <Home size={32} className="text-muted-foreground/20" />
                        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
                          <Zap size={11} className="text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">AI Priced</span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        {/* Address */}
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={13} className="text-primary shrink-0" />
                          <h3 className="font-bold text-sm truncate">{report.address}</h3>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-4">
                          {report.property_type && <span className="px-2 py-0.5 bg-muted rounded-md">{report.property_type}</span>}
                          {report.bedrooms && <span className="inline-flex items-center gap-1"><Bed size={10} /> {report.bedrooms} bed</span>}
                          {report.bathrooms && <span className="inline-flex items-center gap-1"><Bath size={10} /> {report.bathrooms} bath</span>}
                          <span className="inline-flex items-center gap-1"><Calendar size={10} /> {new Date(report.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>

                        {/* Valuation */}
                        {report.valuation_low && report.valuation_high ? (
                          <div className="mb-4">
                            <p className="text-xl font-black tabular-nums tracking-tight">
                              £{report.valuation_low.toLocaleString()}
                              <span className="text-muted-foreground font-light mx-1.5">–</span>
                              £{report.valuation_high.toLocaleString()}
                            </p>
                            {report.confidence && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${report.confidence}%` }} />
                                </div>
                                <span className="text-[11px] font-semibold text-primary tabular-nums">{report.confidence}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-4">
                            <Loader2 size={14} className="text-primary animate-spin" />
                            <span className="text-sm text-muted-foreground">{report.status === "pending" ? "Processing..." : report.status}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Link
                              to={`/valuation?report=${report.id}`}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-transform hover:scale-105"
                            >
                              View Report <ArrowRight size={12} />
                            </Link>
                            <button
                              onClick={() => handleRerun(report)}
                              disabled={rerunningId === report.id}
                              className="px-3 py-2.5 text-xs font-semibold border border-border rounded-xl hover:border-primary/30 hover:text-primary transition-all disabled:opacity-50 flex items-center gap-1.5"
                              title="Re-run with March 2026 data"
                            >
                              {rerunningId === report.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            </button>
                          </div>
                          <Link
                            to={`/valuation?report=${report.id}&sell=true`}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold border border-primary/30 text-primary rounded-xl hover:bg-primary/10 transition-all"
                          >
                            <DollarSign size={12} />
                            Ready to Sell? Move to Deal Room
                          </Link>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>

      {/* Floating New Valuation button */}
      <Link
        to="/ai-valuation"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 transition-all"
        aria-label="New AI Valuation"
      >
        <Plus size={24} />
      </Link>

      <Footer />
    </div>
  );
};

export default DashboardValuations;
