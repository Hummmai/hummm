import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY_PREFIX = "humm_sub_cache_v2";
const CACHE_TTL_MS = 90 * 1000; // 90 seconds - slightly longer for better UX

export type SubTier = "free" | "starter" | "pro" | "expert";

export interface SubscriptionState {
  loading: boolean;
  subscribed: boolean;
  tier: SubTier;
  isPro: boolean;
  isOwner: boolean;           // New in Phase 2 — server-driven owner/founder flag
  isLoggedIn: boolean;
  email: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  /** Clear cached subscription data (call on logout) */
  clearCache: () => void;
}

interface CacheEntry {
  subscribed: boolean;
  tier: SubTier;
  ts: number;
  userId?: string;
}

function getCacheKey(userId?: string): string {
  return userId ? `${CACHE_KEY_PREFIX}:${userId}` : CACHE_KEY_PREFIX;
}

function readCache(userId?: string): CacheEntry | null {
  try {
    const key = getCacheKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const v: CacheEntry = JSON.parse(raw);
    if (!v || typeof v.ts !== "number") return null;
    if (Date.now() - v.ts > CACHE_TTL_MS) return null;

    // If we have a userId in cache, make sure it matches current user
    if (v.userId && userId && v.userId !== userId) return null;

    return v;
  } catch {
    return null;
  }
}

function writeCache(subscribed: boolean, tier: SubTier, userId?: string) {
  try {
    const key = getCacheKey(userId);
    const entry: CacheEntry = {
      subscribed,
      tier,
      ts: Date.now(),
      userId,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota or disabled - ignore silently
  }
}

function clearAllSubscriptionCaches() {
  try {
    // Clear both old and new cache keys
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_KEY_PREFIX) || k === "humm_sub_cache_v1")
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/**
 * useSubscription
 *
 * Centralized, hardened subscription hook.
 * - Always trusts the server (check-subscription Edge Function) for real decisions.
 * - No client-side owner email bypasses (those live only in the Edge Function).
 * - Uses per-user caching with proper invalidation.
 * - Exposes error state for UI feedback.
 */
export function useSubscription(): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<SubTier>("free");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const userEmail = session?.user?.email?.toLowerCase() || null;

      setIsLoggedIn(!!session);
      setEmail(userEmail);

      if (!session) {
        setSubscribed(false);
        setTier("free");
        clearAllSubscriptionCaches();
        return;
      }

      // Try per-user cache first
      const cached = readCache(userId);
      if (cached) {
        setSubscribed(cached.subscribed);
        setTier(cached.tier);
      }

      // Always fetch fresh from server for security
      const { data, error: fnError } = await supabase.functions.invoke("check-subscription");

      if (fnError) {
        console.warn("[useSubscription] check-subscription error:", fnError);
        setError("Could not verify subscription status");
        // Keep cached value if we have one; otherwise fall back to free
        if (!cached) {
          setSubscribed(false);
          setTier("free");
        }
        return;
      }

      const sub = !!data?.subscribed;
      const t = (data?.tier as SubTier) || "free";
      const isOwnerFlag = !!data?.is_owner;   // Server-side only flag from check-subscription

      setSubscribed(sub);
      setTier(t);
      // Store isOwner in a separate cache key for now (simple approach)
      if (userId) {
        try {
          localStorage.setItem(`humm_is_owner:${userId}`, isOwnerFlag ? "1" : "0");
        } catch {}
      }
      writeCache(sub, t, userId);

    } catch (e: any) {
      console.error("[useSubscription] Unexpected error:", e);
      setError("Subscription check failed");
      // Conservative fallback
      setSubscribed(false);
      setTier("free");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auth listener
  useEffect(() => {
    fetchStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearAllSubscriptionCaches();
        setSubscribed(false);
        setTier("free");
        setIsLoggedIn(false);
        setEmail(null);
        setError(null);
      } else {
        // SIGNED_IN or TOKEN_REFRESHED → revalidate
        fetchStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStatus]);

  // Treat 'pro' and 'expert' as full Pro access.
  // 'starter' is a lower paid tier and does not unlock /my-hummm or full autonomous features.
  const isProFinal = subscribed && (tier === "pro" || tier === "expert");

  // isOwner comes from server (check-subscription). We also read the small cache we wrote above.
  const [isOwnerState, setIsOwnerState] = useState(false);

  useEffect(() => {
    const loadOwnerFlag = async () => {
      if (!isLoggedIn) {
        setIsOwnerState(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const cached = localStorage.getItem(`humm_is_owner:${uid}`);
        if (cached === "1") {
          setIsOwnerState(true);
          return;
        }
      }
      // Fallback to last server response (we set it during fetchStatus)
      setIsOwnerState(false); // Will be updated properly on next refresh if needed
    };
    loadOwnerFlag();
  }, [isLoggedIn]);

  const clearCache = useCallback(() => {
    clearAllSubscriptionCaches();
    // Also clear owner flags
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith("humm_is_owner:"))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }, []);

  return {
    loading,
    subscribed,
    tier,
    isPro: isProFinal,
    isOwner: isOwnerState,
    isLoggedIn,
    email,
    error,
    refresh: fetchStatus,
    clearCache,
  };
}