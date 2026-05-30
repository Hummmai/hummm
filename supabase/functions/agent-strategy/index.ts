import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { intent, address, postcode, property_type, bedrooms, bathrooms, sqft, asking_price, description } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isLet = intent === "let";
    const sys = `You are Hummm AI — a professional AI ${isLet ? "letting" : "estate"} agent. Produce a concise, premium ${isLet ? "letting" : "sale"} strategy and a polished listing copy. Output STRICT JSON.`;
    const user = `Property:
- Intent: ${isLet ? "Let / Rent" : "Sell"}
- Address: ${address}
- Postcode: ${postcode || "n/a"}
- Type: ${property_type || "n/a"}
- Beds: ${bedrooms || "n/a"} · Baths: ${bathrooms || "n/a"} · Size: ${sqft || "n/a"} sq ft
- ${isLet ? "Asking rent" : "Asking price"}: ${asking_price || "to be advised"}
- Notes: ${description || "n/a"}

Return JSON of shape:
{
  "headline": string,
  "recommended_${isLet ? "rent" : "price"}": string,
  "pricing_rationale": string,
  "marketing_plan": string[],
  "target_audience": string,
  "portals": string[],
  "timeline": string,
  "listing_title": string,
  "listing_copy": string
}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI ${r.status}`);
    }
    const data = await r.json();
    let parsed: any = {};
    try { parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}"); } catch { parsed = {}; }

    return new Response(JSON.stringify({ strategy: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-strategy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});