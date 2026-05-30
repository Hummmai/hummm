import { memo } from "react";
import { AlertTriangle, Lightbulb } from "lucide-react";

interface RiskOpportunityMatrixProps {
  risks: string[];
  opportunities: string[];
  className?: string;
}

/**
 * RiskOpportunityMatrix (Phase 3)
 * 
 * Clean two-column presentation of risks vs opportunities.
 */
function RiskOpportunityMatrix({ risks = [], opportunities = [], className = "" }: RiskOpportunityMatrixProps) {
  if (risks.length === 0 && opportunities.length === 0) return null;

  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      {risks.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 text-destructive mb-3 text-sm font-semibold uppercase tracking-widest">
            <AlertTriangle size={16} /> Key Risks
          </div>
          <ul className="space-y-2 text-sm">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2">• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-2 text-emerald-400 mb-3 text-sm font-semibold uppercase tracking-widest">
            <Lightbulb size={16} /> Opportunities
          </div>
          <ul className="space-y-2 text-sm">
            {opportunities.map((o, i) => (
              <li key={i} className="flex gap-2">• {o}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default memo(RiskOpportunityMatrix);
