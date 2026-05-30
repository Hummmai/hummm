import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import {
  House, TrendingUp, Calendar as CalendarIcon, Sparkles, CheckCircle, XCircle,
  AlertTriangle, ArrowRight, Loader2, Plus, ChevronLeft, ChevronRight,
  Eye, DollarSign, Shield, Users, Zap, FileText, Clock, Headset, Phone, X,
  Bell, UserCheck, CalendarDays, Send, BadgeCheck, CalendarClock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SellerDashboardTabProps {
  userId: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am-6pm

const recLabel: Record<string, { text: string; color: string; icon: any }> = {
  accept: { text: "Accept", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle },
  counter: { text: "Counter", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: TrendingUp },
  reject: { text: "Reject", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  request_info: { text: "Request Info", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: AlertTriangle },
};

const SellerDashboardTab = ({ userId }: SellerDashboardTabProps) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [viewingRequests, setViewingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingOfferId, setAnalyzingOfferId] = useState<string | null>(null);
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);
  const [addingSlot, setAddingSlot] = useState<{ day: number; hour: number } | null>(null);
  const [matchedAgent, setMatchedAgent] = useState<any>(null);
  const [agentPopoverOpen, setAgentPopoverOpen] = useState(false);
  const [reschedulingRequest, setReschedulingRequest] = useState<string | null>(null);
  const [proposedTime, setProposedTime] = useState("");
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const { toast } = useToast();

  const activePlan = plans[0];

  useEffect(() => {
    fetchAll();

    // Realtime subscription for viewing requests
    const channel = supabase
      .channel('viewing-requests-seller')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'viewing_requests' },
        () => fetchViewingRequests()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchViewingRequests = async () => {
    const { data } = await supabase.from("viewing_requests" as any).select("*").order("created_at", { ascending: false });
    setViewingRequests((data as any) || []);
  };

  const fetchAll = async () => {
    setLoading(true);
    const [plansRes, offersRes, slotsRes] = await Promise.all([
      supabase.from("seller_plans" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("seller_offers" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("viewing_slots" as any).select("*").eq("user_id", userId).order("slot_start", { ascending: true }),
    ]);
    setPlans((plansRes.data as any) || []);
    setOffers((offersRes.data as any) || []);
    setSlots((slotsRes.data as any) || []);

    // Fetch matched agent for hybrid plans
    const plan = (plansRes.data as any)?.[0];
    if (plan?.plan_type === "hybrid" && plan?.matched_agent_id) {
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", plan.matched_agent_id)
        .maybeSingle();
      setMatchedAgent(agent);
    } else if (plan?.plan_type === "hybrid" && plan?.postcode) {
      // Auto-match nearest agent if none set
      const { data: geoData } = await supabase.functions.invoke("geocode-postcode", {
        body: { postcode: plan.postcode },
      });
      if (geoData?.lat && geoData?.lng) {
        const { data: agents } = await supabase.rpc("get_agents_by_radius", {
          p_lat: geoData.lat,
          p_lng: geoData.lng,
          p_radius_miles: 15,
        });
        if (agents?.[0]) setMatchedAgent(agents[0]);
      }
    }

    await fetchViewingRequests();
    setLoading(false);
  };

  const analyzeOffer = async (offer: any) => {
    if (!activePlan) return;
    setAnalyzingOfferId(offer.id);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-offer", {
        body: {
          offer,
          property: { address: activePlan.address, asking_price: activePlan.asking_price },
          sellerAskingPrice: activePlan.asking_price,
        },
      });
      if (error) throw error;

      await supabase.from("seller_offers" as any).update({
        ai_analysis: data.analysis,
        ai_recommendation: data.recommendation,
        ai_counter_amount: data.suggestedCounterAmount || null,
        ai_response_draft: data.responseDraft,
      } as any).eq("id", offer.id);

      toast({ title: "AI Analysis Complete", description: data.recommendationText });
      fetchAll();
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzingOfferId(null);
    }
  };

  // Calendar logic
  const weekStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff + calendarWeekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [calendarWeekOffset]);

  const weekDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    }), [weekStart]);

  const addViewingSlot = async (dayIdx: number, hour: number) => {
    if (!activePlan) return;
    setAddingSlot({ day: dayIdx, hour });
    const start = new Date(weekDates[dayIdx]);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);

    try {
      await supabase.from("viewing_slots" as any).insert({
        seller_plan_id: activePlan.id,
        user_id: userId,
        slot_start: start.toISOString(),
        slot_end: end.toISOString(),
        status: "available",
      } as any);
      toast({ title: "Slot added" });
      fetchAll();
    } catch {
      toast({ title: "Failed to add slot", variant: "destructive" });
    } finally {
      setAddingSlot(null);
    }
  };

  const removeSlot = async (slotId: string) => {
    await supabase.from("viewing_slots" as any).delete().eq("id", slotId);
    fetchAll();
  };

  const approveViewingRequest = async (requestId: string, buyerEmail?: string) => {
    setProcessingRequest(requestId);
    try {
      await supabase.from("viewing_requests" as any).update({ status: "confirmed", updated_at: new Date().toISOString() } as any).eq("id", requestId);

      if (buyerEmail) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "viewing-confirmation",
            recipientEmail: buyerEmail,
            idempotencyKey: `viewing-confirm-${requestId}`,
            templateData: { propertyAddress: activePlan?.address },
          },
        });
      }
      toast({ title: "Viewing Approved!", description: "The buyer has been notified." });
      fetchViewingRequests();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setProcessingRequest(null);
    }
  };

  const rescheduleViewingRequest = async (requestId: string) => {
    if (!proposedTime) {
      toast({ title: "Select a time", variant: "destructive" });
      return;
    }
    setProcessingRequest(requestId);
    try {
      await supabase.from("viewing_requests" as any).update({
        status: "rescheduled",
        proposed_time: new Date(proposedTime).toISOString(),
        updated_at: new Date().toISOString(),
      } as any).eq("id", requestId);
      toast({ title: "Reschedule sent", description: "The buyer will see your proposed time." });
      setReschedulingRequest(null);
      setProposedTime("");
      fetchViewingRequests();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setProcessingRequest(null);
    }
  };

  const getSlotForCell = (dayIdx: number, hour: number) => {
    const date = weekDates[dayIdx];
    return slots.find((s: any) => {
      const st = new Date(s.slot_start);
      return st.getDate() === date.getDate() && st.getMonth() === date.getMonth() && st.getHours() === hour;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading seller dashboard…
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <House size={28} className="text-primary" />
        </div>
        <h3 className="font-bold text-xl mb-3">No Selling Plan Yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get a free AI valuation first, then choose your selling plan to activate Hummm.
        </p>
        <a href="/ai-valuation" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
          <Zap size={16} /> Get AI Valuation <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  const totalOffers = offers.length;
  const bestOffer = offers.reduce((best: any, o: any) => (!best || o.offer_amount > best.offer_amount) ? o : best, null);
  const upcomingViewings = slots.filter((s: any) => new Date(s.slot_start) > new Date() && s.status === "booked").length;
  const pendingRequests = viewingRequests.filter((r: any) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Plan header */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                {activePlan.plan_type === "ai_only" ? "AI-Only" : "Expert Assist"}
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-400/10 text-green-400 border border-green-400/20 rounded-full">
                Active
              </span>
            </div>
            <h3 className="font-bold text-lg">{activePlan.address}</h3>
            {activePlan.asking_price && (
              <p className="text-sm text-primary font-bold tabular-nums">Asking: £{activePlan.asking_price.toLocaleString()}</p>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={60}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: DollarSign, label: "Offers", value: totalOffers.toString() },
            { icon: TrendingUp, label: "Best Offer", value: bestOffer ? `£${bestOffer.offer_amount.toLocaleString()}` : "—" },
            { icon: Eye, label: "Upcoming Viewings", value: upcomingViewings.toString() },
          ].map((s) => (
            <div key={s.label} className="glass-surface rounded-2xl p-5">
              <s.icon size={18} className="text-primary mb-3" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl font-black tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Offers */}
      <AnimatedSection delay={100}>
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-primary" /> Offer Tracker
          </h3>
          {offers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/40 p-10 text-center">
              <Clock size={28} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No offers yet. They'll appear here as they come in.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer: any) => {
                const rec = offer.ai_recommendation ? recLabel[offer.ai_recommendation] : null;
                const RecIcon = rec?.icon || AlertTriangle;
                const gap = activePlan.asking_price
                  ? ((activePlan.asking_price - offer.offer_amount) / activePlan.asking_price * 100).toFixed(1)
                  : null;

                return (
                  <div key={offer.id} className="glass-surface rounded-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-lg tabular-nums">£{offer.offer_amount.toLocaleString()}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {offer.buyer_name && <span>{offer.buyer_name}</span>}
                          {offer.buyer_status && <span className="px-2 py-0.5 bg-muted rounded-md">{offer.buyer_status}</span>}
                          {gap && <span className="text-yellow-400">{gap}% below asking</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {offer.proof_of_funds && (
                          <span className="px-2 py-1 text-[10px] font-bold bg-green-400/10 text-green-400 border border-green-400/20 rounded-full flex items-center gap-1">
                            <Shield size={10} /> Funds
                          </span>
                        )}
                        {offer.dip_confirmed && (
                          <span className="px-2 py-1 text-[10px] font-bold bg-blue-400/10 text-blue-400 border border-blue-400/20 rounded-full flex items-center gap-1">
                            <FileText size={10} /> DIP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {offer.ai_analysis ? (
                      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-primary" />
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Deal Doctor</span>
                          {rec && (
                            <span className={`ml-auto px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex items-center gap-1 ${rec.color}`}>
                              <RecIcon size={10} /> {rec.text}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{offer.ai_analysis}</p>
                        {offer.ai_counter_amount && (
                          <p className="text-xs font-semibold text-primary">
                            Suggested counter: £{offer.ai_counter_amount.toLocaleString()}
                          </p>
                        )}
                        {offer.ai_response_draft && (
                          <div className="rounded-lg bg-card/60 border border-border/50 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Draft Response</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{offer.ai_response_draft}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => analyzeOffer(offer)}
                        disabled={analyzingOfferId === offer.id}
                        className="w-full py-3 text-xs font-bold rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {analyzingOfferId === offer.id ? (
                          <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
                        ) : (
                          <><Sparkles size={14} /> Run AI Deal Doctor</>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Viewing Requests */}
      <AnimatedSection delay={120}>
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell size={18} className="text-primary" /> Viewing Requests
            {viewingRequests.filter((r: any) => r.status === "pending").length > 0 && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full animate-humm-pulse tabular-nums">
                {viewingRequests.filter((r: any) => r.status === "pending").length} new
              </span>
            )}
          </h3>
          {viewingRequests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/40 p-10 text-center">
              <CalendarClock size={28} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No viewing requests yet. They'll pulse here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewingRequests.map((req: any) => {
                const isPending = req.status === "pending";
                const isConfirmed = req.status === "confirmed";
                const isRescheduled = req.status === "rescheduled";

                return (
                  <div
                    key={req.id}
                    className={`rounded-2xl border p-5 space-y-3 transition-all ${
                      isPending
                        ? "border-primary/30 bg-primary/5 animate-humm-pulse"
                        : isConfirmed
                        ? "border-green-400/20 bg-green-400/5"
                        : "border-border bg-card/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck size={14} className="text-primary" />
                          <span className="font-bold text-sm">{req.buyer_name || "Buyer"}</span>
                          {req.buyer_position && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-muted rounded-full">{req.buyer_position}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{req.property_address}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        isPending ? "bg-primary/10 text-primary" :
                        isConfirmed ? "bg-green-400/10 text-green-400" :
                        isRescheduled ? "bg-amber-400/10 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Availability chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {(req.availability || []).map((a: string) => (
                        <span key={a} className="px-2.5 py-1 text-[10px] font-semibold bg-muted rounded-full capitalize">{a}</span>
                      ))}
                    </div>

                    {/* Message */}
                    {req.message && (
                      <p className="text-xs text-muted-foreground italic bg-muted/30 rounded-lg p-3">"{req.message}"</p>
                    )}

                    {/* Actions for pending */}
                    {isPending && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => approveViewingRequest(req.id, req.buyer_email)}
                          disabled={processingRequest === req.id}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl disabled:opacity-50 transition-transform hover:scale-105"
                        >
                          {processingRequest === req.id ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
                          Approve
                        </button>
                        <button
                          onClick={() => setReschedulingRequest(reschedulingRequest === req.id ? null : req.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border border-border rounded-xl hover:border-primary/30 hover:text-primary transition-transform hover:scale-105"
                        >
                          <CalendarDays size={14} />
                          Reschedule
                        </button>
                      </div>
                    )}

                    {/* Reschedule form */}
                    {reschedulingRequest === req.id && (
                      <div className="flex gap-2 items-end pt-1">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Propose a time</label>
                          <input
                            type="datetime-local"
                            value={proposedTime}
                            onChange={(e) => setProposedTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg focus:border-primary focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => rescheduleViewingRequest(req.id)}
                          disabled={processingRequest === req.id}
                          className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {processingRequest === req.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Send
                        </button>
                      </div>
                    )}

                    {/* Show proposed time for rescheduled */}
                    {isRescheduled && req.proposed_time && (
                      <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                        <CalendarClock size={12} />
                        Proposed: {new Date(req.proposed_time).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Calendar */}
      <AnimatedSection delay={140}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon size={18} className="text-primary" /> Viewing Calendar
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setCalendarWeekOffset(w => w - 1)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setCalendarWeekOffset(0)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors">
                This Week
              </button>
              <button onClick={() => setCalendarWeekOffset(w => w + 1)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-8 bg-muted/30">
              <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r border-border">Time</div>
              {weekDates.map((d, i) => (
                <div key={i} className="p-3 text-center border-r border-border last:border-r-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{DAYS[i]}</p>
                  <p className="text-sm font-bold tabular-nums">{d.getDate()}</p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-t border-border">
                <div className="p-2 text-xs font-mono text-muted-foreground border-r border-border flex items-center justify-center tabular-nums">
                  {hour}:00
                </div>
                {weekDates.map((_, dayIdx) => {
                  const slot = getSlotForCell(dayIdx, hour);
                  const isPast = weekDates[dayIdx] < new Date() && hour <= new Date().getHours();
                  const isAdding = addingSlot?.day === dayIdx && addingSlot?.hour === hour;

                  return (
                    <div
                      key={dayIdx}
                      className={`relative p-1 border-r border-border last:border-r-0 min-h-[40px] ${isPast ? "bg-muted/10" : "hover:bg-primary/5 cursor-pointer"} transition-colors`}
                      onClick={() => !slot && !isPast && addViewingSlot(dayIdx, hour)}
                    >
                      {isAdding && <Loader2 size={12} className="absolute inset-0 m-auto animate-spin text-primary" />}
                      {slot && (
                        <div
                          className={`w-full h-full rounded-lg text-[10px] font-bold flex flex-col items-center justify-center px-1 relative ${
                            slot.status === "booked"
                              ? "bg-primary/15 text-primary border border-primary/20"
                              : "bg-green-400/10 text-green-400 border border-green-400/20"
                          }`}
                          onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                          title="Click to remove"
                        >
                          <House size={14} className="absolute top-1 left-1 opacity-50" />
                          {slot.status === "booked" ? (
                            <span className="truncate">{slot.buyer_name || "Booked"}</span>
                          ) : (
                            <span>{hour}:00</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Click a cell to add an available viewing slot. Click a slot to remove it.</p>
        </div>
      </AnimatedSection>

      {/* Listing Preview */}
      {activePlan && (
        <AnimatedSection delay={180}>
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Eye size={18} className="text-primary" /> Your Listing Preview
            </h3>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="aspect-video bg-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <House size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Property photos will appear here</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> AI Priced
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-400/10 text-green-400 rounded-full">
                    Live on Hummm Scout
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-1">{activePlan.address}</h4>
                {activePlan.asking_price && (
                  <p className="text-2xl font-black text-primary tabular-nums">£{activePlan.asking_price.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Floating Agent Contact Button — Hybrid only */}
      {activePlan?.plan_type === "hybrid" && matchedAgent && (
        <div className="fixed bottom-24 right-6 z-40">
          {/* Popover */}
          {agentPopoverOpen && (
            <div className="absolute bottom-16 right-0 w-72 rounded-2xl border border-border bg-card p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200" style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.35)" }}>
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Local Agent</h4>
                <button onClick={() => setAgentPopoverOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-xl shrink-0">
                  {matchedAgent.logo || "🏠"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{matchedAgent.name}</p>
                  {matchedAgent.distance_miles && (
                    <p className="text-[10px] text-muted-foreground">{matchedAgent.distance_miles.toFixed(1)} miles away</p>
                  )}
                  {matchedAgent.stars > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: matchedAgent.stars }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-[10px]">★</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <a
                href={`tel:${matchedAgent.phone || "+441onal"}`}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                <Phone size={14} />
                {matchedAgent.phone || "Call via Hummm"}
              </a>
              <p className="text-[9px] text-muted-foreground text-center">Calls routed via Hummm proxy for your privacy</p>
            </div>
          )}

          {/* FAB */}
          <button
            onClick={() => setAgentPopoverOpen(o => !o)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 transition-all animate-humm-pulse"
            aria-label="Contact your local agent"
          >
            <Headset size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardTab;
