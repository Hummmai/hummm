import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, 
  Star, BarChart3, Hammer, MapPin, Award, BookmarkPlus, Send, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntelligenceScoreGauge } from "@/components/IntelligenceScoreGauge";
import { useHumm } from "@/contexts/HummContext";
import { useSubscription } from "@/hooks/useSubscription";
import { conversionAnalytics } from "@/lib/analytics";

// Phase 3 extracted sub-components
import ImageGallery from "@/components/audit/ImageGallery";
import RenovationSimulator from "@/components/audit/RenovationSimulator";
import ComparablesTable from "@/components/audit/ComparablesTable";
import RiskOpportunityMatrix from "@/components/audit/RiskOpportunityMatrix";

import type { AuditData } from "@/types/audit";

interface AuditReportProps {
  audit: AuditData | null;
  onSaveToDashboard: () => Promise<boolean>;
  onStartNegotiation: () => void;
  onUpgrade: () => void;
  savedToDashboard: boolean;
  savingToDashboard: boolean;
  className?: string;
}

/**
 * AuditReport (Phase 2 refactor)
 * 
 * The main results view after a successful audit.
 * Contains:
 * - Price comparison + fair value
 * - Intelligence Score Gauge
 * - Comparables
 * - Renovation suggestions
 * - Local insights
 * - Risks / Opportunities
 * 
 * Exact visual design preserved from original.
 */
export default function AuditReport({
  audit,
  onSaveToDashboard,
  onStartNegotiation,
  onUpgrade,
  savedToDashboard,
  savingToDashboard,
  className = "",
}: AuditReportProps) {
  const { isLoggedIn } = useHumm();
  const { isPro } = useSubscription();
  const [showAllComps, setShowAllComps] = useState(false);

  if (!audit) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No audit data available. Please run a new audit.
      </div>
    );
  }

  const priceDiff = audit.priceDiffPercent || 0;
  const isGoodDeal = priceDiff <= 0;

  return (
    <div className={className}>
      {/* Header Summary - Mobile optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-black tracking-tight">{audit.address}</h2>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
            {audit.source || "Rightmove"}
            {audit.priceConfidence && (
              <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-px rounded">
                {audit.priceConfidence}% verified
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-3xl font-black">
          <span>{audit.currency || "£"}{audit.askingPrice?.toLocaleString()}</span>
          <span className="text-base font-normal text-muted-foreground">asking price</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm">
          {isGoodDeal ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <TrendingDown size={16} /> {Math.abs(priceDiff)}% below our fair value
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <TrendingUp size={16} /> {priceDiff}% above our fair value
            </span>
          )}
        </div>
      </div>

      {/* Intelligence Score + Key Metrics - Mobile first */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="rounded-2xl border border-primary/20 bg-card/60 p-6">
          <IntelligenceScoreGauge score={audit.aiScore || 75} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-card/60 p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-primary/70 mb-1">Hummm Fair Value</div>
            <div className="text-3xl font-black">
              {audit.currency}{audit.hummFairValue?.toLocaleString()}
            </div>
          </div>

          {audit.yieldEstimate && (
            <div className="rounded-2xl border border-primary/20 bg-card/60 p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-primary/70 mb-1">Est. Gross Yield</div>
              <div className="text-3xl font-black">{audit.yieldEstimate}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Comparables */}
      {audit.detailedComparables?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 size={18} /> Recent Comparables
            </h3>
            <button 
              onClick={() => setShowAllComps(!showAllComps)} 
              className="text-xs text-primary"
            >
              {showAllComps ? "Show fewer" : "Show all"}
            </button>
          </div>
          <div className="grid gap-3">
            {(showAllComps ? audit.detailedComparables : audit.detailedComparables.slice(0, 3)).map((comp: any, i: number) => (
              <div key={i} className="text-sm flex justify-between border border-border/60 rounded-xl px-4 py-3 bg-muted/30">
                <span>{comp.address}</span>
                <span className="font-mono">{audit.currency}{comp.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 3: Image Gallery */}
      {audit.images?.length > 0 && (
        <div className="mb-8">
          <ImageGallery images={audit.images} />
        </div>
      )}

      {/* Phase 3: Renovation Simulator */}
      {audit.renovationSuggestions?.length > 0 && (
        <div className="mb-8">
          <RenovationSimulator
            suggestions={audit.renovationSuggestions}
            currency={audit.currency || "£"}
            askingPrice={audit.askingPrice}
          />
        </div>
      )}

      {/* Phase 3: Better Comparables Table */}
      {audit.detailedComparables?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 size={18} /> Recent Comparables
            </h3>
          </div>
          <ComparablesTable comps={audit.detailedComparables} currency={audit.currency || "£"} showAll={false} />
        </div>
      )}

      {/* Phase 3: Risk / Opportunity Matrix */}
      <RiskOpportunityMatrix risks={audit.risks || []} opportunities={audit.opportunities || []} className="mb-8" />

      {/* Original Insights (kept for compatibility) */}
      {(audit.valueSummary || audit.risks?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {audit.valueSummary && (
            <div className="rounded-2xl border border-primary/20 p-6 bg-card/60">
              <div className="uppercase text-[10px] tracking-[0.16em] text-primary mb-2">Value Insight</div>
              <p className="text-sm leading-relaxed">{audit.valueSummary}</p>
            </div>
          )}
          {audit.risks?.length > 0 && (
            <div className="rounded-2xl border border-destructive/30 p-6 bg-destructive/5">
              <div className="uppercase text-[10px] tracking-[0.16em] text-destructive mb-2 flex items-center gap-1">
                <AlertTriangle size={14} /> Risks
              </div>
              <ul className="text-sm space-y-1.5">
                {audit.risks.slice(0, 4).map((r: string, i: number) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/60">
        <Button 
          onClick={() => {
            conversionAnalytics.negotiationInitiated("audit_report");
            onStartNegotiation();
          }}
          className="flex-1 bg-primary text-primary-foreground font-bold"
        >
          <Send size={16} className="mr-2" /> Start Negotiation
        </Button>

        {!isPro && (
          <Button 
            onClick={() => {
              conversionAnalytics.upgradeClicked("audit_report");
              onUpgrade();
            }} 
            variant="outline" 
            className="flex-1 border-primary/40"
          >
            Upgrade for Unlimited Audits
          </Button>
        )}

        {isLoggedIn && !savedToDashboard && (
          <Button 
            onClick={onSaveToDashboard} 
            disabled={savingToDashboard}
            variant="outline"
          >
            <BookmarkPlus size={16} className="mr-2" />
            {savingToDashboard ? "Saving..." : "Save to Dashboard"}
          </Button>
        )}
      </div>
    </div>
  );
}
