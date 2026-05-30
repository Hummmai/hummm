import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLimit } from "./useAuditLimit";
import { useToast } from "./use-toast";
import type { AuditData, AuditStep, DraftEmail } from "@/types/audit";
import { track, valuationAnalytics, reportError } from "@/lib/analytics";

// Re-export types for convenience
export type { AuditData, AuditStep, DraftEmail } from "@/types/audit";

export interface UsePropertyAuditReturn {
  // Core data
  audit: AuditData | null;
  propertyUrl: string;
  step: AuditStep;
  selectedTool: string | null;
  draft: DraftEmail | null;
  savingToDashboard: boolean;
  savedToDashboard: boolean;

  // Loading / UI state
  isAnalysing: boolean;
  analysisStage: number;
  error: string | null;
  sending: boolean;

  // Derived from limits
  canAudit: boolean;
  auditsUsed: number;
  maxAudits: number;
  tier: string;

  // Actions
  setPropertyUrl: (url: string) => void;
  setStep: (step: AuditStep) => void;
  setSelectedTool: (tool: string | null) => void;
  setDraft: (draft: DraftEmail | null) => void;
  runAudit: (url: string) => Promise<void>;
  reset: () => void;
  recordAuditUsage: () => Promise<void>;
  saveToDashboard: (auditData: AuditData) => Promise<boolean>;
  handleSendEmail: (draft: DraftEmail) => Promise<void>;
}

/**
 * usePropertyAudit (Phase 2)
 *
 * Encapsulates the core property audit flow logic that was previously
 * buried inside the 3,000+ line PropertyAuditFlow component.
 *
 * This is the first major extraction toward a cleaner architecture.
 */
export function usePropertyAudit(initialUrl = "", savedAuditId?: string): UsePropertyAuditReturn {
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [propertyUrl, setPropertyUrlState] = useState(initialUrl);
  const [step, setStep] = useState<AuditStep>(savedAuditId ? "analysing" : "link-input");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftEmail | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [savingToDashboard, setSavingToDashboard] = useState(false);
  const [savedToDashboard, setSavedToDashboard] = useState(!!savedAuditId);

  const auditLimit = useAuditLimit();
  const { toast } = useToast();

  const ANALYSIS_STAGES = [
    "Connecting to listing...",
    "Extracting listing details...",
    "Analysing neighbourhood and local market...",
    "Running comparable sales analysis...",
    "Generating AI insights and valuation...",
    "Building your report...",
  ];

  const setPropertyUrl = useCallback((url: string) => {
    setPropertyUrlState(url);
  }, []);

  // Memoized derived values for performance
  const isProUser = useMemo(() => tier === "pro" || tier === "expert", [tier]);
  const hasReachedLimit = useMemo(() => !canAudit && !isAnalysing, [canAudit, isAnalysing]);

  const reset = useCallback(() => {
    setAudit(null);
    setPropertyUrlState("");
    setStep("link-input");
    setSelectedTool(null);
    setDraft(null);
    setIsAnalysing(false);
    setAnalysisStage(0);
    setError(null);
    setSavedToDashboard(false);
  }, []);

  const runAudit = useCallback(async (url: string) => {
    if (!url?.trim()) {
      setError("Please provide a valid property URL or postcode");
      return;
    }

    // Server-side atomic check via can-audit (preferred)
    if (!auditLimit.canAudit && !auditLimit.loading) {
      toast({
        title: "Audit limit reached",
        description: "Upgrade your plan for more audits.",
        variant: "destructive",
      });
      return;
    }

    setPropertyUrlState(url);
    setStep("analysing");
    setIsAnalysing(true);
    setError(null);
    setAnalysisStage(0);

    // Analytics: Valuation started
    valuationAnalytics.started("property_audit_flow");

    const stageTimer = setInterval(() => {
      setAnalysisStage((s) => {
        if (s < ANALYSIS_STAGES.length - 1) return s + 1;
        clearInterval(stageTimer);
        return s;
      });
    }, 2400);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("deal-audit", {
        body: { propertyUrl: url },
      });

      clearInterval(stageTimer);
      setAnalysisStage(ANALYSIS_STAGES.length);

      if (fnError || (data?.error && !data?.success)) {
        throw new Error(data?.error || fnError?.message || "Audit failed");
      }

      const transformed: AuditData = {
        address: data?.scrapedProperty?.address || "Property",
        askingPrice: data?.scrapedProperty?.askingPrice || 0,
        currency: data?.currency || "GBP",
        bedrooms: data?.scrapedProperty?.bedrooms ?? null,
        bathrooms: data?.scrapedProperty?.bathrooms ?? null,
        hummFairValue: data?.aiAnalysis?.hummFairValue || 0,
        aiScore: data?.aiAnalysis?.aiScore || 75,
        priceDiffPercent: 0,
        priceConfidence: data?.priceConfidence,
        priceSource: data?.priceExtractionMethod || data?.scrapedProperty?._priceSource,
        ...data,
      };

      setAudit(transformed);
      setStep("overview");

      // Analytics: Valuation completed successfully
      valuationAnalytics.completed(true, {
        aiScore: transformed.aiScore,
        priceConfidence: transformed.priceConfidence,
        source: "deal_audit",
      });

      await auditLimit.recordAudit();

    } catch (e: any) {
      clearInterval(stageTimer);
      const msg = e?.message || data?.userMessage || "Unable to complete the audit. Please try again with a different listing.";
      setError(msg);
      setStep("link-input");

      // Analytics: Valuation failed
      valuationAnalytics.completed(false, { error: msg.substring(0, 200) });

      // Report to observability
      reportError(new Error(msg), {
        metadata: { source: "usePropertyAudit.runAudit", url: propertyUrl },
      });

      toast({ 
        title: "Audit failed", 
        description: msg.length > 80 ? "Please try a different property URL." : msg, 
        variant: "destructive" 
      });
    } finally {
      setIsAnalysing(false);
    }
  }, [auditLimit, toast]);

  const recordAuditUsage = useCallback(async () => {
    await auditLimit.recordAudit();
  }, [auditLimit]);

  // Save full audit to user's dashboard
  const saveToDashboard = useCallback(async (auditData: AuditData): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in to save", description: "Create a free account to save audits." });
      return false;
    }

    setSavingToDashboard(true);
    try {
      await supabase.from("saved_audits").insert({
        user_id: user.id,
        property_url: propertyUrl,
        address: auditData.address,
        asking_price: auditData.askingPrice,
        currency: auditData.currency,
        humm_fair_value: auditData.hummFairValue,
        ai_score: auditData.aiScore,
        report_json: auditData,
        status: "audited",
      } as any);

      setSavedToDashboard(true);

      // Analytics: Audit saved to dashboard
      track("audit_saved", { address: auditData.address });

      toast({ title: "Saved to dashboard ✨", description: "View it in My Dashboard anytime." });
      return true;
    } catch (err: any) {
      toast({ title: "Could not save", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setSavingToDashboard(false);
    }
  }, [propertyUrl, toast]);

  const handleSendEmail = useCallback(async (draftToSend: DraftEmail) => {
    setSending(true);
    try {
      // In real implementation this would call an Edge Function to send the email
      // For now we simulate success (preserving original behavior)
      await new Promise(r => setTimeout(r, 800));
      setStep("sent");
      toast({ title: "Email sent (simulated)", description: "In production this would send via the backend." });
    } catch (e) {
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }, [toast]);

  return {
    audit,
    propertyUrl,
    step,
    selectedTool,
    draft,
    savingToDashboard,
    savedToDashboard,
    isAnalysing,
    analysisStage,
    error,
    sending,
    canAudit: auditLimit.canAudit,
    auditsUsed: auditLimit.auditsUsed,
    maxAudits: auditLimit.maxAudits,
    tier: auditLimit.tier,
    isProUser,
    hasReachedLimit,
    setPropertyUrl,
    setStep,
    setSelectedTool,
    setDraft,
    runAudit,
    reset,
    recordAuditUsage,
    saveToDashboard,
    handleSendEmail,
  };
}
