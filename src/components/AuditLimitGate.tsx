import { Lock, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  auditsUsed: number;
  maxAudits: number;
  tier: string;
}

export default function AuditLimitGate({ auditsUsed, maxAudits, tier }: Props) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-lg mx-auto text-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <Lock size={28} className="text-destructive" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
        You've Used Your Free Audit
      </h3>
      
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-2">
        You've used <strong>{auditsUsed}</strong> of <strong>{maxAudits}</strong> free audit{maxAudits === 1 ? "" : "s"} this month.
      </p>
      
      <p className="text-muted-foreground text-sm leading-relaxed mb-8">
        Upgrade to <strong>Pro (£19/mo)</strong> for 10 full audits + negotiation tools, or
        <strong> Expert (£29/mo)</strong> for unlimited audits and the full AI suite.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => navigate("/pricing")}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-[0.97]"
        >
          <Zap size={18} />
          Upgrade Now
          <ArrowRight size={16} />
        </button>
        
        <p className="text-xs text-muted-foreground">
          Your free audit resets at the start of each month.
        </p>
      </div>

      {/* Usage bar */}
      <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Audits used</span>
          <span>{auditsUsed} / {maxAudits}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-destructive rounded-full transition-all duration-500"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
