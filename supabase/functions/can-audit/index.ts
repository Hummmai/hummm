import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "unauthenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "unauthenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Check subscription via the existing (hardened) function
    const { data: subData, error: subError } = await supabase.functions.invoke("check-subscription");

    if (subError) {
      console.error("[can-audit] check-subscription failed", subError);
      return new Response(
        JSON.stringify({ allowed: false, reason: "subscription_check_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isSubscribed = !!subData?.subscribed;
    const tier = (subData?.tier as string) || "free";
    const isPro = isSubscribed && (tier === "pro" || tier === "expert");

    // Owner bypass (from check-subscription response)
    const isOwner = !!subData?.is_owner;

    // 2. Get current month usage
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: usage } = await supabase
      .from("audit_usage")
      .select("audit_count")
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle();

    const used = (usage as any)?.audit_count ?? 0;

    // 3. Determine limit
    let maxAudits = 1; // free
    if (isOwner || tier === "pro" || tier === "expert") {
      maxAudits = Infinity;
    } else if (tier === "starter") {
      maxAudits = 5;
    }

    const allowed = used < maxAudits;

    return new Response(
      JSON.stringify({
        allowed,
        used,
        max: maxAudits === Infinity ? null : maxAudits,
        tier: isOwner ? "owner" : tier,
        remaining: maxAudits === Infinity ? null : Math.max(0, maxAudits - used),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[can-audit] error:", error);
    return new Response(
      JSON.stringify({ allowed: false, reason: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
