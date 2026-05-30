import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Lock, Sparkles, Check, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";

interface Props {
  children: ReactNode;
  /** Headline shown on the paywall screen. */
  title?: string;
  /** Sub-headline / pitch line. */
  description?: string;
  /** Bullet list of what unlocks with Pro. */
  features?: string[];
}

const DEFAULT_FEATURES = [
  "Central /my-hummm autonomous agent dashboard",
  "Unlimited AI property negotiations",
  "Full Sell, Let & Manage with Hummm execution",
  "In-Depth Audit reports included (normally £4.99 each)",
  "Priority AI processing & conversation memory",
  "Cancel anytime",
];

export default function ProPaywall({
  children,
  title = "This is a Hummm Pro feature",
  description = "Upgrade to Pro for full access to your autonomous property agent.",
  features = DEFAULT_FEATURES,
}: Props) {
  const { loading, isPro, isLoggedIn } = useSubscription();
  const location = useLocation();
  const { toast } = useToast();
  const [checkout, setCheckout] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    const next = location.pathname + location.search;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }

  if (isPro) return <>{children}</>;

  const startCheckout = async () => {
    setCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: "pro", mode: "subscription", successPath: location.pathname },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL missing");
      }
    } catch (err) {
      toast({
        title: "Checkout unavailable",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
      setCheckout(false);
    }
  };

  return (
    <>
      <SEOHead title={`${title} — Hummm AI`} description={description} noindex />
      <Navbar />
      <main className="min-h-screen pt-32 sm:pt-40 pb-20 section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-primary/30 bg-card/60 backdrop-blur-xl shadow-[0_30px_80px_-30px_hsl(168,80%,48%,0.45)] p-6 sm:p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center mx-auto mb-5">
              <Lock size={22} className="text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary mb-2 inline-flex items-center gap-1.5 justify-center">
              <Sparkles size={11} /> Hummm Pro
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground text-balance mb-3">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty mb-6 max-w-lg mx-auto">
              {description}
            </p>

            <div className="text-left rounded-2xl bg-muted/30 border border-border/60 p-5 mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-3 inline-flex items-center gap-1.5">
                <Crown size={12} /> Unlock with Pro — £29/month
              </p>
              <ul className="space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <Check size={15} className="text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startCheckout}
              disabled={checkout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-sm sm:text-base font-black hover:bg-primary/90 transition-all btn-press disabled:opacity-70 shadow-lg shadow-primary/30"
            >
              {checkout ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Upgrade to Pro — £29/month
              <ArrowRight size={15} />
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              Secure checkout via Stripe · Cancel anytime
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}