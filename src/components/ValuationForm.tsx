import { Search, Shield, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddressLookupWrapper from "@/components/AddressLookupWrapper";
import { useAuditLimit } from "@/hooks/useAuditLimit";
import AuditLimitGate from "@/components/AuditLimitGate";
import { valuationAnalytics } from "@/lib/analytics";

interface ValuationFormProps {
  propertyUrl: string;
  onPropertyUrlChange: (url: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * ValuationForm (Phase 2 refactor)
 * 
 * The initial address / listing URL input form.
 * Extracted from the massive PropertyAuditFlow for maintainability.
 * Preserves exact original styling and UX.
 */
export default function ValuationForm({
  propertyUrl,
  onPropertyUrlChange,
  onSubmit,
  isLoading = false,
  className = "",
}: ValuationFormProps) {
  const navigate = useNavigate();
  const auditLimit = useAuditLimit();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && propertyUrl.trim()) {
      onSubmit();
    }
  };

  const handleSubmit = () => {
    valuationAnalytics.started("valuation_form");
    onSubmit();
  };

  if (!auditLimit.loading && !auditLimit.canAudit) {
    return (
      <div className={className}>
        <AuditLimitGate 
          auditsUsed={auditLimit.auditsUsed} 
          maxAudits={auditLimit.maxAudits} 
          tier={auditLimit.tier} 
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_80px_-20px_hsl(168_100%_45%/0.12)]">
          {/* Free usage indicator */}
          {!auditLimit.loading && auditLimit.tier === "free" && auditLimit.auditsUsed === 0 && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-muted/50 border border-border">
              <Info size={12} className="text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground">
                Free plan: 1 audit per month ·{" "}
                <button 
                  onClick={() => navigate("/pricing")} 
                  className="text-primary hover:underline font-medium"
                >
                  Upgrade for more
                </button>
              </span>
            </div>
          )}

          <div className="relative mb-5">
            <AddressLookupWrapper
              value={propertyUrl}
              onChange={onPropertyUrlChange}
              placeholder="Paste a listing URL or postcode..."
              className="w-full"
            />
            
            {/* Fallback direct input for power users */}
            <input 
              type="url" 
              value={propertyUrl}
              onChange={(e) => onPropertyUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or paste full Rightmove/Zoopla URL..."
              className="mt-3 w-full px-5 py-3 text-sm bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
            />
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={!propertyUrl.trim() || isLoading}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all rounded-2xl shadow-lg shadow-primary/25 min-h-[56px] active:scale-[0.97]"
          >
            <Search size={18} /> 
            {isLoading ? "Starting analysis..." : "Run an Audit"}
          </button>

          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield size={12} className="text-primary" />
            <span className="text-[11px] text-muted-foreground">
              Free instant analysis · No sign-up required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
