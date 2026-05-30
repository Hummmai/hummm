import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export type AuditTier = "free" | "starter" | "pro";

interface AuditLimitState {
  loading: boolean;
  auditsUsed: number;
  maxAudits: number;
  /** Safe to perform a new audit right now */
  canAudit: boolean;
  tier: AuditTier;
  error: string | null;
  /** Call after a successful audit (increments server-side via RPC) */
  recordAudit: () => Promise<void>;
  /** Force re-check of subscription + usage */
  refresh: () => Promise<void>;
}

/**
 * useAuditLimit (Hardened)
 *
 * Determines how many deep property audits a user is allowed this month.
 * - No client-side demo/owner bypasses (those are handled server-side in check-subscription).
 * - Always fetches fresh subscription status from Edge Function.
 * - `canAudit` is only true after loading completes and usage is below limit.
 * - For true atomic "can I audit?" checks, prefer calling a dedicated Edge Function
 *   (see supabase/functions/can-audit for future implementation).
 */
export function useAuditLimit(): AuditLimitState {
  const [loading, setLoading] = useState(true);
  const [auditsUsed, setAuditsUsed] = useState(0);
  const [tier, setTier] = useState<AuditTier>("free");
  const [error, setError] = useState<string | null>(null);

  const maxAudits = tier === "pro" ? Infinity : tier === "starter" ? 5 : 1;

  const fetchState = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setTier("free");
        setAuditsUsed(0);
        return;
      }

      // Preferred: Call the new atomic can-audit Edge Function (Phase 2)
      try {
        const { data: canAuditData, error: canAuditError } = await supabase.functions.invoke("can-audit");

        if (!canAuditError && canAuditData) {
          const t = (canAuditData.tier as string) || "free";
          setTier(t === "owner" || t === "pro" ? "pro" : t === "starter" ? "starter" : "free");
          setAuditsUsed(canAuditData.used ?? 0);
          return; // Success — use the atomic result
        }
      } catch (e) {
        console.warn("[useAuditLimit] can-audit Edge Function not available or failed, falling back", e);
      }

      // Fallback: Original two-call logic (still secure after Phase 1 hardening)
      let effectiveTier: AuditTier = "free";
      try {
        const { data: subData, error: subError } = await supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (subError) throw subError;

        if (subData?.subscribed) {
          const t = (subData.tier as string) || "";
          const productId = subData.product_id as string | undefined;

          const PRODUCT_TIERS: Record<string, AuditTier> = {
            "prod_UFxKLQACTsdFvS": "pro",
            "prod_UFxLbhajvJ31xO": "pro",
            "prod_UFxKb56eqxGFDZ": "starter",
            "prod_UFxKrZ4qt38PSv": "starter",
          };

          if (t === "expert" || t === "pro") {
            effectiveTier = "pro";
          } else if (productId && PRODUCT_TIERS[productId]) {
            effectiveTier = PRODUCT_TIERS[productId];
          } else if (t === "starter") {
            effectiveTier = "starter";
          } else {
            effectiveTier = "starter";
          }
        }
      } catch (e) {
        console.warn("[useAuditLimit] Subscription check failed, defaulting to free", e);
        setError("Could not verify subscription tier");
        effectiveTier = "free";
      }

      setTier(effectiveTier);

      const month = getCurrentMonth();
      const { data: usage, error: usageError } = await supabase
        .from("audit_usage")
        .select("audit_count")
        .eq("user_id", session.user.id)
        .eq("month", month)
        .maybeSingle();

      if (usageError) {
        console.warn("[useAuditLimit] Usage query error:", usageError);
      }

      setAuditsUsed((usage as any)?.audit_count ?? 0);

    } catch (e: any) {
      console.error("[useAuditLimit] Unexpected error:", e);
      setError("Failed to load audit limits");
      setTier("free");
      setAuditsUsed(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const recordAudit = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      // This RPC must be SECURITY DEFINER and increments atomically on the server
      const { data, error } = await supabase.rpc("increment_audit_count");

      if (error) {
        console.error("[useAuditLimit] recordAudit RPC failed:", error);
        return;
      }

      if (typeof data === "number") {
        setAuditsUsed(data);
      } else {
        // Fallback: refetch
        await fetchState();
      }
    } catch (e) {
      console.error("[useAuditLimit] recordAudit error:", e);
      await fetchState();
    }
  }, [fetchState]);

  // IMPORTANT: canAudit is false while loading to prevent race conditions / UI flashes
  const canAudit = !loading && auditsUsed < maxAudits;

  return {
    loading,
    auditsUsed,
    maxAudits,
    canAudit,
    tier,
    error,
    recordAudit,
    refresh: fetchState,
  };
}
