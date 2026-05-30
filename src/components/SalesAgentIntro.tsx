import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, PenLine, Target, ArrowRight, Zap, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hasUsedFirstNegotiation, markFirstNegotiationDone } from "@/lib/negotiationStatus";

/**
 * Post-valuation / post-audit Sales Agent intro card.
 * Renders an assistant-style chat bubble with three next-step options.
 * Feels like a helpful concierge, not a hard sell.
 */
export default function SalesAgentIntro({
  address,
  userName,
  className = "",
  propertyPrice,
  fairValue,
}: {
  address?: string | null;
  userName?: string | null;
  className?: string;
  propertyPrice?: number | null;
  fairValue?: number | null;
}) {
  const [resolvedName, setResolvedName] = useState<string | null>(userName ?? null);
  const [loadingCheckout, setLoadingCheckout] = useState<null | "onetime" | "pro">(null);
  const [usedFree, setUsedFree] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setUsedFree(hasUsedFirstNegotiation());
    if (userName) {
      setResolvedName(userName);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) return;
        const metaName =
          (user.user_metadata as Record<string, unknown> | null)?.name ||
          (user.user_metadata as Record<string, unknown> | null)?.full_name;
        if (metaName && typeof metaName === "string") {
          setResolvedName(metaName.split(" ")[0]);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!cancelled && profile?.name) {
          setResolvedName(profile.name.split(" ")[0]);
        } else if (!cancelled && user.email) {
          setResolvedName(user.email.split("@")[0]);
        }
      } catch {
        /* silent */
      }
    })();
    return () => { cancelled = true; };
  }, [userName]);

  const greetingName = resolvedName ? `, ${resolvedName}` : "";
  const propertyRef = address ? ` at ${address}` : "";

  const prefillA = `I've just reviewed my property report${propertyRef}. Please draft a strong opening enquiry to the listing agent on my behalf — confident, professional, and designed to open the negotiation cleanly.`;
  const prefillB = `Based on my property report${propertyRef}, please prepare a competitive offer strategy — recommended opening number, justification from comparables, and how to position it with the agent.`;

  const link = (prefill: string) =>
    `/agents/sales?prefill=${encodeURIComponent(prefill)}&auto=1`;

  // Build prefill query for negotiation agent
  const negotiateParams = new URLSearchParams();
  if (address) negotiateParams.set("address", address);
  if (propertyPrice) negotiateParams.set("price", String(propertyPrice));
  if (fairValue) negotiateParams.set("fairValue", String(fairValue));
  const negotiateHref = `/negotiate-for-me-ai${negotiateParams.toString() ? `?${negotiateParams}` : ""}`;

  async function handleCheckout(kind: "onetime" | "pro") {
    setLoadingCheckout(kind);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in to continue", description: "Quick account so we can run the negotiation for you." });
        navigate(`/auth?next=${encodeURIComponent(negotiateHref)}`);
        return;
      }
      // First negotiation is FREE — bypass Stripe
      if (!usedFree && kind === "onetime") {
        supabase.functions.invoke("revenue-orchestrator", {
          body: {
            event_type: "negotiate_started",
            email: session.user.email,
            user_id: session.user.id,
            property_address: address,
            property_price: propertyPrice,
            fair_value: fairValue,
            source: "sales_agent_intro",
            metadata: { kind: "free_first" },
          },
        }).catch(() => {});
        markFirstNegotiationDone();
        navigate(negotiateHref);
        return;
      }
      const tier = kind === "onetime" ? "negotiate_onetime" : "pro";
      const mode = kind === "onetime" ? "payment" : "subscription";
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          tier,
          mode,
          successPath: `/negotiate-for-me-ai?${negotiateParams.toString()}&payment=success`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        // Fire-and-forget funnel event
        supabase.functions.invoke("revenue-orchestrator", {
          body: {
            event_type: "negotiate_started",
            email: session.user.email,
            user_id: session.user.id,
            property_address: address,
            property_price: propertyPrice,
            fair_value: fairValue,
            source: "sales_agent_intro",
            metadata: { kind },
          },
        }).catch(() => {});
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL missing");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Checkout unavailable",
        description: msg.includes("Invalid tier")
          ? "Stripe price not configured yet — taking you to pricing."
          : msg,
        variant: "destructive",
      });
      navigate(negotiateHref);
    } finally {
      setLoadingCheckout(null);
    }
  }

  return (
    <section
      aria-label="Hummm Sales Agent — next steps"
      className={`relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/[0.04] p-5 sm:p-8 ${className}`}
    >
      {/* Agent header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
            <Sparkles size={18} className="text-primary" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-card" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">Hummm Sales Agent</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online · ready to help
          </p>
        </div>
      </div>

      {/* Chat bubble */}
      <div className="rounded-2xl rounded-tl-md bg-muted/40 border border-border/60 p-4 sm:p-5 text-[14px] sm:text-[15px] leading-relaxed text-foreground/90 space-y-3 mb-5">
        <p>
          Hi{greetingName} — I've gone through your property report{propertyRef}.
        </p>
        <p>
          There's clear room to push for a better deal here. The fastest path to extra savings is to let me negotiate it for you — I'll draft the opening offer, handle every reply, and stay strictly to your limits.
        </p>
        <p className="text-xs text-muted-foreground">
          {usedFree
            ? "Starter £9/mo (300 credits) or Pro £29/mo for unlimited negotiations. Cancel anytime."
            : "Your first negotiation with me is on the house — no card needed."}
        </p>
      </div>

      {/* Primary dual CTA — one-click checkout */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        <button
          onClick={() => handleCheckout("onetime")}
          disabled={loadingCheckout !== null}
          className="group relative flex items-center gap-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-4 py-3.5 text-sm font-bold shadow-[0_10px_30px_-12px_hsl(168,80%,48%,0.55)] btn-press disabled:opacity-70"
        >
          {loadingCheckout === "onetime" ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
          <span className="flex-1 text-left">
            {usedFree ? "Starter – £9/mo (300 credits)" : "Start Your Free Negotiation"}
          </span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={() => handleCheckout("pro")}
          disabled={loadingCheckout !== null}
          className="group relative flex items-center gap-2.5 rounded-xl border border-primary/50 bg-primary/10 hover:bg-primary/15 hover:border-primary/70 transition-all px-4 py-3.5 text-sm font-bold text-foreground btn-press disabled:opacity-70"
        >
          {loadingCheckout === "pro" ? <Loader2 size={15} className="animate-spin text-primary" /> : <Crown size={15} className="text-primary" />}
          <span className="flex-1 text-left">Go Pro – £29/mo Unlimited</span>
          <ArrowRight size={14} className="text-primary group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Secondary lighter actions */}
      <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
        <Link
          to={link(prefillA)}
          className="group flex items-center gap-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground btn-press"
        >
          <PenLine size={13} className="text-primary/70 shrink-0" />
          <span className="flex-1 text-left">Just draft an enquiry</span>
        </Link>
        <Link
          to={link(prefillB)}
          className="group flex items-center gap-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground btn-press"
        >
          <Target size={13} className="text-primary/70 shrink-0" />
          <span className="flex-1 text-left">Coach me on an offer</span>
        </Link>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground text-center">
        You approve every email before it sends · Cancel Pro anytime · You only pay if we save you money
      </p>
    </section>
  );
}