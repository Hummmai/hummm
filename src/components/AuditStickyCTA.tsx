import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Crown, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hasUsedFirstNegotiation, markFirstNegotiationDone } from "@/lib/negotiationStatus";

/**
 * Sticky bottom CTA bar shown on audit report pages.
 * Headline: "Ready to get a better deal? Let Hummm Negotiator fight for you."
 * Two one-click checkout buttons: £49 one-time + £39/mo Pro.
 * Reads optional property context from sessionStorage("humm_last_audit").
 */
export default function AuditStickyCTA({
  address: addressProp,
  propertyPrice: priceProp,
  fairValue: fairProp,
}: {
  address?: string | null;
  propertyPrice?: number | null;
  fairValue?: number | null;
}) {
  const [loading, setLoading] = useState<null | "onetime" | "pro">(null);
  const [ctx, setCtx] = useState<{ address?: string; price?: number; fairValue?: number }>({});
  const [usedFree, setUsedFree] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setUsedFree(hasUsedFirstNegotiation());
    if (addressProp || priceProp || fairProp) {
      setCtx({ address: addressProp || undefined, price: priceProp || undefined, fairValue: fairProp || undefined });
      return;
    }
    try {
      const raw = sessionStorage.getItem("humm_last_audit");
      if (!raw) return;
      const p = JSON.parse(raw);
      setCtx({ address: p?.address, price: p?.askingPrice, fairValue: p?.fairValue });
    } catch { /* noop */ }
  }, [addressProp, priceProp, fairProp]);

  const negotiateParams = new URLSearchParams();
  if (ctx.address) negotiateParams.set("address", ctx.address);
  if (ctx.price) negotiateParams.set("price", String(ctx.price));
  if (ctx.fairValue) negotiateParams.set("fairValue", String(ctx.fairValue));
  const negotiateHref = `/negotiate-for-me-ai${negotiateParams.toString() ? `?${negotiateParams}` : ""}`;

  async function checkout(kind: "onetime" | "pro") {
    setLoading(kind);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/auth?next=${encodeURIComponent(negotiateHref)}`);
        return;
      }
      // First negotiation is FREE — skip Stripe and route straight in
      if (!usedFree && kind === "onetime") {
        supabase.functions.invoke("revenue-orchestrator", {
          body: {
            event_type: "negotiate_started",
            email: session.user.email,
            user_id: session.user.id,
            property_address: ctx.address,
            property_price: ctx.price,
            fair_value: ctx.fairValue,
            source: "audit_sticky_cta",
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
        body: { tier, mode, successPath: `/negotiate-for-me-ai?${negotiateParams.toString()}&payment=success` },
      });
      if (error) throw error;
      if (data?.url) {
        supabase.functions.invoke("revenue-orchestrator", {
          body: {
            event_type: "negotiate_started",
            email: session.user.email,
            user_id: session.user.id,
            property_address: ctx.address,
            property_price: ctx.price,
            fair_value: ctx.fairValue,
            source: "audit_sticky_cta",
            metadata: { kind },
          },
        }).catch(() => {});
        window.location.href = data.url;
      } else throw new Error("Checkout URL missing");
    } catch (err) {
      toast({
        title: "Checkout unavailable",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
      navigate(negotiateHref);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-6xl mx-auto px-3 pb-3 sm:pb-4 pointer-events-auto" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_-20px_hsl(168,80%,48%,0.45)] p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-0.5">
                  {usedFree ? "Run another negotiation" : "Your first negotiation is free"}
                </p>
                <p className="text-sm sm:text-[15px] font-bold text-foreground leading-snug">
                  {usedFree
                    ? "Unlock unlimited — go Pro for £29/mo"
                    : "Start Your First Negotiation For Free"}
                  {ctx.address ? <span className="hidden sm:inline text-muted-foreground font-medium"> · {ctx.address}</span> : null}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
              <button
                onClick={() => checkout("onetime")}
                disabled={loading !== null}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-black hover:bg-primary/90 transition-all btn-press disabled:opacity-70 whitespace-nowrap"
              >
                {loading === "onetime" ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {usedFree ? "Starter – £9/mo" : "Start Free Negotiation"}
              </button>
              <button
                onClick={() => checkout("pro")}
                disabled={loading !== null}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-primary/50 bg-primary/10 text-foreground text-xs sm:text-sm font-black hover:bg-primary/15 transition-all btn-press disabled:opacity-70 whitespace-nowrap"
              >
                {loading === "pro" ? <Loader2 size={14} className="animate-spin text-primary" /> : <Crown size={14} className="text-primary" />}
                Pro – £29/mo Unlimited
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}