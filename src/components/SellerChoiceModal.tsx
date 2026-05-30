import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Users, Camera, CheckCircle, ArrowRight, X, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SellerChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (planType: string) => void;
  valuationId?: string;
  address: string;
  postcode?: string;
  askingPrice?: number;
}

const PLANS = [
  {
    id: "ai_only",
    name: "Sell For Me — Coming Soon",
    subtitle: "Launching shortly",
    price: "0.45%",
    priceNote: "of final sale price · No sale, no fee",
    icon: Zap,
    highlight: false,
    comingSoon: true,
    features: [
      "Listed on all major portals",
      "AI Negotiator handles all offers",
      "Offer progression & tracking",
      "AI Deal Doctor analysis",
      "Viewing calendar management",
      "Digital marketing package",
      "Join the waitlist for early access",
    ],
  },
  {
    id: "hybrid",
    name: "Expert Assist — Coming Soon",
    subtitle: "Hybrid + Agent",
    price: "0.75%",
    priceNote: "+ VAT · No sale, no fee",
    icon: Users,
    highlight: false,
    comingSoon: true,
    features: [
      "Everything in Sell For Me (when launched)",
      "Local agent for viewings",
      "Professional photography",
      "360° virtual tour",
      "Portal listings (Rightmove, Zoopla)",
      "Dedicated sale progression",
    ],
  },
];

const SellerChoiceModal = ({
  open,
  onClose,
  onComplete,
  valuationId,
  address,
  postcode,
  askingPrice,
}: SellerChoiceModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!open) return null;

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in", description: "You need to be logged in to select a plan.", variant: "destructive" });
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("seller_plans" as any).insert({
        user_id: user.id,
        valuation_id: valuationId || null,
        plan_type: selectedPlan,
        address,
        postcode: postcode || null,
        asking_price: askingPrice || null,
      } as any);

      if (error) throw error;

      toast({ title: "Plan selected!", description: `You've chosen the ${selectedPlan === "ai_only" ? "AI-Only" : "Expert Assist"} plan.` });
      onComplete(selectedPlan);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save plan selection.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-10" style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-4">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">Sell with Hummm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Selling plans are launching soon</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            While you wait, our most popular service — <span className="text-primary font-bold">Negotiate For Me</span> — is live today and can fight for every pound on this property right now.
          </p>
        </div>

        {/* Negotiate For Me hero — the live, recommended action */}
        <button
          onClick={() => { onClose(); navigate("/negotiate-for-me"); }}
          className="w-full text-left mb-8 group rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/15 via-primary/5 to-card p-6 hover:shadow-[0_20px_60px_-20px_hsl(168,80%,48%,0.45)] transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center shrink-0">
              <MessageSquare size={22} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-wider">Available Now</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Most Popular</span>
              </div>
              <h3 className="text-lg font-black mb-1">Negotiate For Me <span className="text-primary">— £49</span></h3>
              <p className="text-xs text-muted-foreground mb-3">One-time flat fee. Forensic audit, AI-drafted offers, agent comms handled. We fight for every extra pound.</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                Start Negotiation Now <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">Or join the waitlist for selling plans</p>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() => !plan.comingSoon && setSelectedPlan(plan.id)}
                disabled={plan.comingSoon}
                className={`relative text-left rounded-2xl border-2 p-6 transition-all ${
                  plan.comingSoon
                    ? "border-border/40 bg-card/30 opacity-70 cursor-not-allowed"
                    : isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/30 bg-card/40"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                )}
                {plan.comingSoon && (
                  <span className="absolute -top-3 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full">
                    Coming Soon
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-primary/15" : "bg-muted"}`}>
                    <Icon size={20} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{plan.name}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{plan.subtitle}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-black text-primary tabular-nums">{plan.price}</span>
                  <span className="text-xs text-muted-foreground ml-2">{plan.priceNote}</span>
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle size={13} className="text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle size={14} className="text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Address preview */}
        <div className="rounded-xl bg-muted/30 border border-border p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-1">Property</p>
          <p className="text-sm font-bold">{address}</p>
          {askingPrice && (
            <p className="text-sm text-primary font-bold mt-1">Asking: £{askingPrice.toLocaleString()}</p>
          )}
        </div>

        {/* Waitlist CTA */}
        <button
          onClick={handleConfirm}
          disabled={!selectedPlan || saving}
          className="w-full py-4 text-sm font-bold rounded-2xl bg-foreground/[0.06] text-foreground/80 border border-border hover:bg-foreground/[0.1] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {saving ? "Saving..." : selectedPlan ? "Join the waitlist" : "Select a plan to join the waitlist"}
          {!saving && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default SellerChoiceModal;
