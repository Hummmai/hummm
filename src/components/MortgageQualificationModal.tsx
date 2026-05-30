import { useState } from "react";
import { X, CheckCircle, Loader2, Shield, Banknote, ArrowRight, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MortgageQualificationModalProps {
  propertyAddress: string;
  propertyPrice?: number;
  postcode?: string;
  onClose: () => void;
  onQualified: () => void;
}

const MortgageQualificationModal = ({
  propertyAddress,
  propertyPrice,
  postcode,
  onClose,
  onQualified,
}: MortgageQualificationModalProps) => {
  const [step, setStep] = useState<1 | 2 | "success">(1);
  const [hasDip, setHasDip] = useState<boolean | null>(null);
  const [wantsQuote, setWantsQuote] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleDipAnswer = (answer: boolean) => {
    setHasDip(answer);
    if (answer) {
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleQuoteAnswer = async (answer: boolean) => {
    setWantsQuote(answer);
    if (answer) {
      setSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: "Please sign in first", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email, phone")
          .eq("user_id", user.id)
          .maybeSingle();

        await (supabase.from("mortgage_leads" as any).insert as any)({
          user_id: user.id,
          full_name: profile?.name || "",
          email: profile?.email || user.email,
          phone: profile?.phone || "",
          property_address: propertyAddress,
          postcode: postcode || "",
          has_dip: hasDip || false,
          property_price: propertyPrice || 0,
          status: "new",
        });

        setStep("success");
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    } else {
      onQualified();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mortgage Check</h3>
              <p className="text-[10px] text-muted-foreground">Quick qualification — 2 questions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Banknote size={24} className="text-blue-400" />
                </div>
                <h4 className="font-bold text-lg mb-2">Do you have a Mortgage in Principle?</h4>
                <p className="text-xs text-muted-foreground">
                  A Decision in Principle (DIP) shows sellers you're a serious buyer and speeds up the process.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDipAnswer(true)}
                  className="p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-center"
                >
                  <CheckCircle size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-bold">Yes, I have one</p>
                </button>
                <button
                  onClick={() => handleDipAnswer(false)}
                  className="p-4 rounded-xl border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center"
                >
                  <HelpCircle size={24} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold">No, help me get one</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Banknote size={24} className="text-primary" />
                </div>
                <h4 className="font-bold text-lg mb-2">Free Hummm Comparison Quote?</h4>
                <p className="text-xs text-muted-foreground">
                  Our partners specialise in {postcode || "local"} properties and can often beat high-street rates by 0.5%.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuoteAnswer(true)}
                  disabled={submitting}
                  className="p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-center"
                >
                  {submitting ? (
                    <Loader2 size={24} className="text-primary mx-auto mb-2 animate-spin" />
                  ) : (
                    <CheckCircle size={24} className="text-primary mx-auto mb-2" />
                  )}
                  <p className="text-sm font-bold">{hasDip ? "Yes, compare rates" : "Yes, help me apply"}</p>
                </button>
                <button
                  onClick={() => handleQuoteAnswer(false)}
                  disabled={submitting}
                  className="p-4 rounded-xl border border-border hover:border-muted-foreground/30 transition-all text-center"
                >
                  <ArrowRight size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-bold">No thanks, proceed</p>
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto humm-pulse">
                <CheckCircle size={28} className="text-primary" />
              </div>
              <h4 className="font-bold text-lg">You're All Set!</h4>
              <p className="text-sm text-muted-foreground">
                A Hummm-verified broker will contact you within <span className="font-bold text-foreground">2 hours</span> with a personalised quote for {postcode || "your area"}.
              </p>
              <button
                onClick={onQualified}
                className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all"
              >
                Continue <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="px-6 pb-5 flex items-center justify-center gap-2">
            <div className={`w-8 h-1 rounded-full transition-all ${step === 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-8 h-1 rounded-full transition-all ${step === 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageQualificationModal;
