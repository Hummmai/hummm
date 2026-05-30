import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Home, Loader2, Zap, Shield, Eye, CalendarDays, TrendingUp,
  FileText, ChevronRight, CheckCircle, Users, ShieldCheck,
} from "lucide-react";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [viewings, setViewings] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/auth"); return; }
      setUserId(data.user.id);
      fetchData(data.user.id);
    });
  }, [navigate]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    const [planRes, offerRes, viewRes] = await Promise.all([
      supabase.from("seller_plans").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("seller_offers").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("viewing_slots").select("*").eq("user_id", uid).order("slot_start", { ascending: true }),
    ]);
    setPlans(planRes.data || []);
    setOffers(offerRes.data || []);
    setViewings(viewRes.data || []);
    setLoading(false);
  };

  const buyerScore = (o: any) => {
    let score = 40;
    if (o.dip_confirmed) score += 25;
    if (o.proof_of_funds) score += 20;
    if (o.buyer_status === "chain-free") score += 15;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Seller Dashboard | Hummm" description="Manage your property sale, offers, and viewings." />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16 section-padding">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              <Home size={28} className="inline text-primary mr-2" />
              Seller Mission Control
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Incoming offers, buyer strength scores, viewing calendar, and legal compliance.
            </p>
          </AnimatedSection>

          {/* Active Listings */}
          <AnimatedSection delay={100} className="mb-8">
            <h2 className="text-base font-bold flex items-center gap-2 mb-4">
              <FileText size={16} className="text-primary" /> Your Listings
            </h2>
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
                <Home size={28} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No active sales. Start by getting a valuation.</p>
                <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => navigate("/ai-valuation")}>
                  Get AI Valuation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">{p.address}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.plan_type === "ai_only" ? "AI-Only Plan" : "AI + Agent"} · Asking: £{(p.asking_price || 0).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] capitalize">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>

          {/* Incoming Offers */}
          <AnimatedSection delay={150} className="mb-8">
            <h2 className="text-base font-bold flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" /> Incoming Offers
              {offers.length > 0 && (
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] ml-2">{offers.length}</Badge>
              )}
            </h2>
            {offers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">No offers yet. Share your listing to attract buyers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((o) => {
                  const score = buyerScore(o);
                  return (
                    <div key={o.id} className="rounded-xl border border-border bg-card/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold">{o.buyer_name || "Anonymous Buyer"}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{o.buyer_status || "Unknown"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              score >= 90
                                ? "bg-primary/15 text-primary border-primary/30 humm-pulse"
                                : score >= 70
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted/20 text-muted-foreground border-border"
                            }`}
                          >
                            <Zap size={10} /> {score}
                          </span>
                          <p className="text-sm font-black tabular-nums">£{o.offer_amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>{o.dip_confirmed ? "✓ DIP Confirmed" : "✗ No DIP"}</span>
                        <span>{o.proof_of_funds ? "✓ Proof of Funds" : "✗ No Proof"}</span>
                      </div>
                      {o.ai_recommendation && (
                        <p className="text-[10px] text-primary mt-2">{o.ai_recommendation}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-7 text-[10px] bg-primary text-primary-foreground">Accept</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]">Counter</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] text-destructive border-destructive/30">Decline</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatedSection>

          {/* Upcoming Viewings */}
          <AnimatedSection delay={200} className="mb-8">
            <h2 className="text-base font-bold flex items-center gap-2 mb-4">
              <CalendarDays size={16} className="text-primary" /> Viewing Calendar
            </h2>
            {viewings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center">
                <Eye size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No viewings scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {viewings.slice(0, 6).map((v) => (
                  <div key={v.id} className="rounded-xl border border-border bg-card/60 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={14} className="text-primary" />
                      <div>
                        <p className="text-xs font-bold">{new Date(v.slot_start).toLocaleDateString()} · {new Date(v.slot_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="text-[10px] text-muted-foreground">{v.buyer_name || "Open slot"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] capitalize">{v.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>

          {/* Legal Tracker */}
          <AnimatedSection delay={250}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" /> TA6 (6th Edition) Checklist
            </h2>
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="space-y-2">
                {[
                  "Property Information Form (TA6) completed",
                  "Fittings & Contents Form (TA10) completed",
                  "Title deeds / Land Registry copy obtained",
                  "EPC certificate valid and rating disclosed",
                  "Leasehold Information Pack (if applicable)",
                  "Replies to pre-contract enquiries prepared",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 rounded-lg hover:bg-muted/10 p-2 cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-border accent-[hsl(168,100%,45%)]" />
                    <span className="text-xs">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Post-Sale Services */}
          <AnimatedSection delay={300} className="mt-8">
            <h2 className="text-base font-bold flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" /> Post-Sale Services
            </h2>
            <a
              href="https://sentinel-pm.uk"
              target="_blank"
              rel="noopener noreferrer"
              title="Tired of the 2026 Reform paperwork? Let our partners at Sentinel handle your full portfolio management and legal compliance."
              className="flex items-center gap-3 rounded-2xl border border-border bg-[hsl(220,30%,15%)] p-5 hover:bg-[hsl(220,30%,20%)] transition-all hover:scale-[1.01] group"
            >
              <ShieldCheck size={22} className="text-foreground shrink-0" />
              <div>
                <p className="text-sm font-bold group-hover:text-foreground transition-colors">Delegate to Sentinel PM</p>
                <p className="text-[10px] text-muted-foreground">Full portfolio management and legal compliance — handled by our trusted partners.</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
            </a>
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={350} className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Hummm Hub", icon: Zap, path: "/dashboard/deal-room" },
                { label: "Valuations", icon: TrendingUp, path: "/dashboard/valuations" },
                { label: "Find Agent", icon: Users, path: "/find-agent" },
              ].map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="rounded-xl border border-border bg-card/60 p-4 text-center hover:border-primary/30 transition-all"
                >
                  <a.icon size={18} className="mx-auto text-primary mb-1.5" />
                  <p className="text-xs font-bold">{a.label}</p>
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SellerDashboard;
