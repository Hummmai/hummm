/**
 * Simple Analytics & Error Reporting Utility
 * 
 * Phase 4.5: Basic observability layer.
 * 
 * Current implementation:
 * - Logs events to console (dev)
 * - Sends events to Supabase `analytics_events` table (if available)
 * - Error reporting sends to Supabase `error_reports` table
 * 
 * Recommended next steps for production:
 * 1. Add Sentry (highly recommended for proper error tracking + releases)
 * 2. Add PostHog or Plausible for product analytics
 * 3. Set up Supabase Realtime or a proper logging pipeline
 */

import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEvent =
  | "valuation_started"
  | "valuation_completed"
  | "audit_saved"
  | "negotiation_initiated"
  | "upgrade_clicked"
  | "pro_paywall_viewed";

export interface AnalyticsProperties {
  [key: string]: any;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userId?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Track a product analytics event.
 * Safe to call from anywhere (client-side only).
 */
export async function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  const payload = {
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
    },
  };

  // Always log in development for visibility
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, payload.properties);
  }

  // Send to Supabase (best effort, non-blocking)
  try {
    // This assumes a table `analytics_events` exists (see migration suggestion below)
    await supabase.from("analytics_events").insert({
      event,
      properties: payload.properties,
      user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
    });
  } catch (err) {
    // Fail silently in production — analytics should never break the app
    if (import.meta.env.DEV) {
      console.warn("[Analytics] Failed to send event:", err);
    }
  }
}

/**
 * Report an error for observability.
 * Use this in ErrorBoundaries and critical catch blocks.
 */
export async function reportError(error: Error | unknown, context: Partial<ErrorReport> = {}) {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const report: ErrorReport = {
    message: errorObj.message,
    stack: errorObj.stack,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    ...context,
  };

  if (import.meta.env.DEV) {
    console.error("[Error Report]", report);
  }

  try {
    // Send to Supabase error_reports table (best effort)
    await supabase.from("error_reports").insert({
      message: report.message,
      stack: report.stack,
      component_stack: report.componentStack,
      url: report.url,
      user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      metadata: report.metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[Error Reporting] Failed to send error:", err);
    }
  }

  // === SENTRY INTEGRATION POINT ===
  // When you add Sentry, replace or augment the above with:
  // import * as Sentry from "@sentry/react";
  // Sentry.captureException(errorObj, { extra: context });
}

/**
 * Convenience wrapper for tracking valuation lifecycle.
 */
export const valuationAnalytics = {
  started: (source: string = "unknown") => 
    track("valuation_started", { source }),

  completed: (success: boolean, metadata: AnalyticsProperties = {}) =>
    track("valuation_completed", { success, ...metadata }),

  saved: () => track("audit_saved"),
};

/**
 * Convenience for conversion events.
 */
export const conversionAnalytics = {
  negotiationInitiated: (from: string = "audit_report") =>
    track("negotiation_initiated", { from }),

  upgradeClicked: (location: string) =>
    track("upgrade_clicked", { location }),

  proPaywallViewed: (feature: string) =>
    track("pro_paywall_viewed", { feature }),
};
