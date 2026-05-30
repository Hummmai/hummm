import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_EVENTS = new Set([
  "valuation_completed",
  "deep_audit_completed",
  "negotiate_viewed",
  "negotiate_started",
  "negotiate_purchased",
  "pro_subscribed",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const eventType: string = body.event_type;
    if (!eventType || !VALID_EVENTS.has(eventType)) {
      return new Response(JSON.stringify({ error: "invalid event_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = (body.email || "").toString().trim().toLowerCase() || null;
    const userId = body.user_id || null;
    if (!email && !userId) {
      return new Response(JSON.stringify({ error: "email or user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("revenue_events")
      .insert({
        user_id: userId,
        email,
        event_type: eventType,
        property_address: body.property_address || null,
        property_price: body.property_price ?? null,
        fair_value: body.fair_value ?? null,
        source: body.source || null,
        metadata: body.metadata || {},
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[revenue-orchestrator] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});