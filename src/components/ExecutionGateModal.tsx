import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Zap, FileCheck, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import HummLogo from "./HummLogo";

export type GateType = "execution_credit" | "shield_report";

interface ExecutionGateModalProps {
  open: boolean;
  onClose: () => void;
  gateType: GateType;
  onBypass?: () => void; // for free first scan
}

const GATE_CONFIG: Record<GateType, {
  title: string;
  description: string;
  originalPrice: string;
  founderPrice: string;
  saving: string;
  icon: typeof Zap;
  tier: string;
  perks: string[];
}> = {
  execution_credit: {
    title: "Execution Credit – Power of Attorney",
    description: "Authorize Hummm to dispatch tactical communications to estate agents and generate your legal Letter of Authority.",
    originalPrice: "£29",
    founderPrice: "£19",
    saving: "50%",
    icon: Zap,
    tier: "execution_credit",
    perks: [
      "AI drafts & dispatches agent emails on your behalf",
      "Digital Letter of Authority with legal standing",
      "Full audit trail of all communications",
      "Priority response from the Tactical Negotiator",
    ],
  },
  shield_report: {
    title: "Shield Report – 2026 Reform Compliance",
    description: "Generate your full property-specific 2026 Rental Reform compliance report PDF with actionable steps to protect your portfolio.",
    originalPrice: "£59",
    founderPrice: "£29",
    saving: "50%",
    icon: Shield,
    tier: "shield_report",
    perks: [
      "Property-specific compliance action plan",
      "Section 21 abolition impact assessment",
      "Decent Homes Standard gap analysis",
      "Branded PDF report for your records",
    ],
  },
};

const ExecutionGateModal = ({ open, onClose, gateType, onBypass }: ExecutionGateModalProps) => {
  const [loading, setLoading] = useState(false);
  const config = GATE_CONFIG[gateType];
  const Icon = config.icon;

  if (!open) return null;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: config.tier },
      });
      if (error) throw error;
      if (data?.url) {
        // Redirect in same tab for seamless flow
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error("Payment initialization failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#72F1B8]/30 bg-[#030712]/95 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(114,241,184,0.1)]">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#72F1B8] to-[#2FD1B5] flex items-center justify-center">
            <Icon size={20} className="text-[#030712]" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#72F1B8]">Founder Perk</p>
            <h3 className="text-lg font-bold text-white">{config.title}</h3>
          </div>
        </div>

        <p className="text-sm text-white/60 mb-5 leading-relaxed">{config.description}</p>

        {/* Perks */}
        <div className="space-y-2 mb-6">
          {config.perks.map((perk, i) => (
            <div key={i} className="flex items-start gap-2">
              <FileCheck size={14} className="text-[#72F1B8] mt-0.5 shrink-0" />
              <span className="text-xs text-white/70">{perk}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-[#72F1B8]/20 bg-[#72F1B8]/5 p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 line-through">{config.originalPrice}</p>
              <p className="text-2xl font-bold text-white">{config.founderPrice}
                <span className="text-xs font-normal text-[#72F1B8] ml-2">Founder {config.saving} off</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/40">One-time</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">No subscription</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#72F1B8] to-[#2FD1B5] text-[#030712] font-bold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(114,241,184,0.3)] transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Icon size={16} className="mr-2" />}
          {loading ? "Redirecting to Checkout..." : `Unlock for ${config.founderPrice}`}
        </Button>

        {onBypass && (
          <button
            onClick={() => { onBypass(); onClose(); }}
            className="w-full mt-3 text-xs text-white/30 hover:text-white/50 transition-colors text-center"
          >
            Use free compliance scan instead (basic)
          </button>
        )}

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
          <HummLogo className="h-4" />
          <span className="text-[10px] text-white/50">Secured by Stripe • No subscription</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutionGateModal;
