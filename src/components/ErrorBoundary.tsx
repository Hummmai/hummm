import React, { Component, ErrorInfo, ReactNode } from "react";
import { reportError } from "@/lib/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional name for this boundary (helps with observability) */
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Production-ready Error Boundary with observability.
 * 
 * - Captures errors and sends them via reportError() (Supabase + Sentry-ready)
 * - Can be wrapped around any major flow (audit, negotiation, dashboards, etc.)
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const boundaryName = this.props.name || "UnnamedBoundary";

    console.error(`[${boundaryName}] Error boundary caught:`, error, errorInfo);

    // Send to observability layer (Supabase + ready for Sentry)
    reportError(error, {
      componentStack: errorInfo.componentStack,
      metadata: {
        boundary: boundaryName,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-md mx-auto my-8">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We hit an unexpected error. Our team has been notified. Please refresh or try again shortly.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
