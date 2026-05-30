import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useHumm } from "@/contexts/HummContext";
import ProPaywall from "@/components/ProPaywall";

export type AccessLevel = "public" | "auth" | "pro" | "owner";

interface RouteGuardProps {
  children: ReactNode;
  /**
   * Access level required for this route.
   * - "public": Anyone (including logged out)
   * - "auth": Must be logged in
   * - "pro": Must be logged in + have active Pro/Expert subscription
   * - "owner": Must be logged in + owner/founder access (future: via user metadata)
   */
  level?: AccessLevel;
  /**
   * Optional custom title/description shown on the Pro paywall screen.
   */
  proTitle?: string;
  proDescription?: string;
}

/**
 * RouteGuard
 *
 * Centralized access control component.
 * Replaces the old no-op DemoGate.
 *
 * Usage:
 *   <Route path="/my-hummm" element={
 *     <RouteGuard level="pro">
 *       <MyHumm />
 *     </RouteGuard>
 *   } />
 *
 * Security model:
 * - All critical decisions are driven by useSubscription, which always
 *   calls the server-side check-subscription Edge Function.
 * - No client-side email hardcoding for owners.
 */
export default function RouteGuard({
  children,
  level = "auth",
  proTitle,
  proDescription,
}: RouteGuardProps) {
  const { loading, isPro, isLoggedIn, error } = useSubscription();
  const { userEmail } = useHumm();
  const location = useLocation();

  // Public routes - always allow
  if (level === "public") {
    return <>{children}</>;
  }

  // Still determining auth/subscription status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  // Not logged in → send to auth with return path
  if (!isLoggedIn) {
    const next = location.pathname + location.search;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }

  // Logged in but subscription check failed hard
  if (error && (level === "pro" || level === "owner")) {
    // Allow through with warning in console; real enforcement still happens server-side
    console.warn("[RouteGuard] Subscription check error, allowing passage but showing warning");
  }

  // Pro or higher required
  if (level === "pro" || level === "owner") {
    // For "owner" level we currently treat it the same as pro.
    // In the future we can expose `isOwner` from useSubscription or HummContext.
    if (!isPro) {
      return (
        <ProPaywall
          title={proTitle || "This is a Hummm Pro feature"}
          description={
            proDescription ||
            "Upgrade to Pro for full access to autonomous agents, unlimited negotiations, and premium intelligence tools."
          }
        >
          {/* Never rendered when !isPro — ProPaywall handles the UI */}
          <></>
        </ProPaywall>
      );
    }
  }

  // Owner-only routes (future enhancement)
  // For now, any Pro user who also has owner email in user metadata can be handled server-side.
  // If you need strict owner-only pages, we can add an `isOwner` flag from the Edge Function.
  if (level === "owner") {
    // Placeholder: currently same as pro. You can tighten this later by checking user metadata.
    // Example future check:
    // if (!userMetadata.is_owner) return <Navigate to="/access-code" />;
  }

  // Access granted
  return <>{children}</>;
}
