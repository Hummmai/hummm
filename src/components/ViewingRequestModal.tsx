import { useState } from "react";
import confetti from "canvas-confetti";
import { X, CalendarDays, Loader2, CheckCircle, User, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ViewingRequestModalProps {
  listing: { address: string; price?: number; sellerPlanId?: string };
  onClose: () => void;
}

const AVAILABILITY = [
  { value: "morning", label: "Morning", sub: "8am – 12pm" },
  { value: "afternoon", label: "Afternoon", sub: "12pm – 5pm" },
  { value: "evening", label: "Evening", sub: "5pm – 8pm" },
];

const POSITIONS = [
  "First-time buyer",
  "Chain-free",
  "Selling to buy",
  "Cash buyer",
  "Investor",
];

const ViewingRequestModal = ({ listing, onClose }: ViewingRequestModalProps) => {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const toggleTime = (val: string) =>
    setSelectedTimes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  const handleSubmit = async () => {
    if (selectedTimes.length === 0) {
      toast({ title: "Select at least one time slot", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in first", description: "You need an account to request viewings.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      // Find seller plan for this address
      let sellerPlanId = listing.sellerPlanId;
      if (!sellerPlanId) {
        const { data: plans } = await supabase
          .from("seller_plans" as any)
          .select("id")
          .ilike("address", `%${listing.address.split(",")[0]}%`)
          .eq("status", "active")
          .limit(1);
        sellerPlanId = (plans as any)?.[0]?.id;
      }

      if (!sellerPlanId) {
        toast({ title: "Seller not found", description: "This property isn't listed on Hummm yet.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase.from("viewing_requests" as any).insert({
        seller_plan_id: sellerPlanId,
        buyer_user_id: user.id,
        property_address: listing.address,
        availability: selectedTimes,
        buyer_position: position,
        message: message || null,
        buyer_email: profile?.email || user.email,
        buyer_name: profile?.name || user.email?.split("@")[0],
        status: "pending",
      } as any);

      setSubmitted(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#0D9488", "#14B8A6", "#5EEAD4", "#CCFBF1"] });
      toast({ title: "Viewing requested!", description: "The seller will be notified instantly." });
    } catch (e: any) {
      toast({ title: "Failed to submit", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-md rounded-2xl border border-primary/20 bg-card p-8 text-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-5 animate-humm-pulse">
            <CheckCircle size={28} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Viewing Requested!</h3>
          <p className="text-sm text-muted-foreground mb-6">
            The seller has been notified in real-time. You'll receive a confirmation once they approve or propose a time.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CalendarDays size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">Request Viewing</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{listing.address}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Availability */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Clock size={12} className="text-primary" /> When are you free?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABILITY.map((slot) => {
                const selected = selectedTimes.includes(slot.value);
                return (
                  <button
                    key={slot.value}
                    onClick={() => toggleTime(slot.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-bold">{slot.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{slot.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <User size={12} className="text-primary" /> Your Buying Position
            </label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-full border transition-all ${
                    position === pos
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <MessageSquare size={12} className="text-primary" /> Message to Seller (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'd love to see the garden and check natural light in the living room..."
              rows={3}
              className="w-full px-4 py-3 text-sm bg-muted/30 border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedTimes.length === 0}
            className="w-full py-3.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 animate-humm-pulse transition-transform hover:scale-105"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Sending Request...</>
            ) : (
              <><CalendarDays size={16} /> Request Viewing</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewingRequestModal;
