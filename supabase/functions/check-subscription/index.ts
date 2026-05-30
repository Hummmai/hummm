import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = (claimsData.claims.email as string || "").toLowerCase();
    const userId = claimsData.claims.sub as string | undefined;

    if (!email && !userId) {
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─────────────────────────────────────────────────────────────
    // SERVER-SIDE ONLY OWNER / FOUNDER BYPASS
    // This must NEVER exist in client-side code.
    //
    // Preferred: Set SUPABASE_OWNER_USER_IDS in Supabase Edge Function secrets
    //            (comma-separated list of auth user IDs).
    //
    // Fallback: SUPABASE_OWNER_EMAILS (comma-separated) - less secure but convenient.
    // ─────────────────────────────────────────────────────────────
    const ownerUserIds = (Deno.env.get("SUPABASE_OWNER_USER_IDS") || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const ownerEmails = (Deno.env.get("SUPABASE_OWNER_EMAILS") || "")
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const isOwner = (userId && ownerUserIds.includes(userId)) ||
                    (email && ownerEmails.includes(email));

    if (isOwner) {
      return new Response(JSON.stringify({
        subscribed: true,
        tier: "pro",
        product_id: "owner_bypass",
        subscription_end: new Date(Date.now() + 365 * 86400000).toISOString(),
        is_owner: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sub = subscriptions.data[0];
    const productId = sub.items.data[0].price.product;
    const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();

    const PRODUCT_TIERS: Record<string, string> = {
      "prod_UHOGLsgz5QXyop": "starter",
      "prod_UHOHbxadBflRct": "pro",
      "prod_UFxKb56eqxGFDZ": "starter",
      "prod_UFxKrZ4qt38PSv": "starter",
      "prod_UFxKLQACTsdFvS": "pro",
      "prod_UFxLbhajvJ31xO": "pro",
    };

    return new Response(JSON.stringify({
      subscribed: true,
      tier: PRODUCT_TIERS[productId as string] || "expert",
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
