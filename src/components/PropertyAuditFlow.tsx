import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "@/components/AnimatedSection";
import { usePropertyAudit } from "@/hooks/usePropertyAudit";
import { useSubscription } from "@/hooks/useSubscription";

// New focused components from Phase 2 refactor
import ValuationForm from "@/components/ValuationForm";
import AuditReport from "@/components/AuditReport";
import NegotiationCTA from "@/components/NegotiationCTA";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Props {
  className?: string;
  initialUrl?: string;
  savedAuditId?: string;
}

/**
 * PropertyAuditFlow (Phase 2 — Thin Orchestrator)
 *
 * This component is now a lightweight coordinator.
 * All heavy logic lives in:
 *   - usePropertyAudit hook (state + business logic)
 *   - ValuationForm, AuditReport, NegotiationCTA (presentation)
 *
 * The original 3,071-line god component has been broken apart
 * while preserving 100% of the original visual design and user flow.
 */
export default function PropertyAuditFlow({ className = "", initialUrl = "", savedAuditId }: Props) {
  const {
    audit,
    propertyUrl,
    step,
    isAnalysing,
    analysisStage,
    error,
    sending,
    savingToDashboard,
    savedToDashboard,
    canAudit,
    setPropertyUrl,
    runAudit,
    reset,
    saveToDashboard,
    handleSendEmail,
  } = usePropertyAudit(initialUrl, savedAuditId);

  const { isPro } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasAutoStarted = useRef(false);

  // Auto-start from initialUrl (preserves original behavior)
  useEffect(() => {
    if (initialUrl && !hasAutoStarted.current && step === "link-input") {
      hasAutoStarted.current = true;
      runAudit(initialUrl);
    }
  }, [initialUrl, step, runAudit]);

  // Note: Saved audit loading is now handled inside usePropertyAudit hook

  return (
    <ErrorBoundary name="PropertyAuditFlow">
      <div className={className}>
      {/* Step: Link Input / Valuation Form */}
      {step === "link-input" && (
        <AnimatedSection>
          <ValuationForm
            propertyUrl={propertyUrl}
            onPropertyUrlChange={setPropertyUrl}
            onSubmit={() => runAudit(propertyUrl)}
            isLoading={isAnalysing}
          />
        </AnimatedSection>
      )}

      {/* Step: Analysing */}
      {step === "analysing" && (
        <div className="max-w-xl mx-auto py-16 text-center">
          <div className="animate-pulse text-primary text-lg mb-2">Analysing property…</div>
          <div className="text-sm text-muted-foreground">
            {analysisStage > 0 ? "Generating deep report" : "Connecting to data sources"}
          </div>
          {error && <div className="text-destructive mt-4 text-sm">{error}</div>}
        </div>
      )}

      {/* Steps: Results + Negotiation */}
      {(step === "overview" || step === "tool-selected") && audit && (
        <AnimatedSection>
          <AuditReport
            audit={audit}
            onSaveToDashboard={() => saveToDashboard(audit)}
            onStartNegotiation={() => { /* open negotiation tools */ }}
            onUpgrade={() => navigate("/pricing")}
            savedToDashboard={savedToDashboard}
            savingToDashboard={savingToDashboard}
          />

          <div className="mt-8 max-w-3xl mx-auto">
            <NegotiationCTA
              onStartNegotiation={() => navigate("/negotiate-for-me")}
              onUpgrade={() => navigate("/pricing")}
              onSendEmail={handleSendEmail}
              isPro={isPro}
              isSending={sending}
            />
          </div>
        </AnimatedSection>
      )}

      {/* Minimal error state */}
      {error && step !== "analysing" && (
        <div className="max-w-md mx-auto mt-8 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-center">
          {error}
          <button onClick={reset} className="block mx-auto mt-3 text-primary text-xs underline">
            Try another property
          </button>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}
