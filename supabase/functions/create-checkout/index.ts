import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_PRICES: Record<string, string> = {
  starter: "price_1TH5BQ7DqKPhNjZ76xnJyPgV",
  pro: "price_1TH5By7DqKPhNjZ7o041IwOk",
  premium: "price_1TH5J57DqKPhNjZ7x4YANFQ7",
  execution_credit: "price_1TH8EF7DqKPhNjZ74TrDLGo7",
  shield_report: "price_1TH8F77DqKPhNjZ75ug3eLQu",
  in_depth_audit: "price_1TIRcd7DqKPhNjZ7uHJib0s5",
};

// Allow env override for the £49 one-time Negotiate-For-Me offer
// without redeploying — set STRIPE_NEGOTIATE_ONETIME_PRICE_ID in secrets.
const NEGOTIATE_ONETIME_PRICE =
  Deno.env.get("STRIPE_NEGOTIATE_ONETIME_PRICE_ID") || "";
if (NEGOTIATE_ONETIME_PRICE) {
  TIER_PRICES["negotiate_onetime"] = NEGOTIATE_ONETIME_PRICE;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const body = await req.json();
    const { tier, priceId: directPriceId, mode, successPath } = body;
    
    let priceId = directPriceId;
    if (!priceId && tier) {
      priceId = TIER_PRICES[tier?.toLowerCase()];
    }
    if (!priceId) throw new Error(`Invalid tier or priceId`);

    const checkoutMode = mode === "subscription" ? "subscription" : "payment";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://aether-ai-estate.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: checkoutMode,
      success_url: `${origin}${successPath || "/dashboard"}?payment=success`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: {
        user_id: user.id,
        tier: tier || "subscription",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
