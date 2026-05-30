import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { negotiation } = await req.json();

    if (!negotiation) {
      return new Response(
        JSON.stringify({ error: "Negotiation data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hoursSinceUpdate = Math.floor(
      (Date.now() - new Date(negotiation.updated_at).getTime()) / (1000 * 60 * 60)
    );

    const systemPrompt = `You are the Hummm Negotiator AI — a strategic advisor for UK property negotiations. Based on the current state of a negotiation, suggest the single best next move.

RULES:
- Be specific and actionable
- Consider timing (hours since last update)
- Consider budget gap between max budget and asking price
- Consider buyer status advantages
- Keep the suggestion to 1-2 sentences
- Add a confidence percentage (0-100) for deal success
- Provide a short tactical reason

Return ONLY valid JSON via the tool call.`;

    const userPrompt = `Negotiation state:
- Property: ${negotiation.property_address}
- Asking price: £${negotiation.property_price?.toLocaleString() || "Unknown"}
- Max budget: £${negotiation.max_budget?.toLocaleString() || "Unknown"}
- Buyer status: ${negotiation.buyer_status || "Unknown"}
- Current status: ${negotiation.status}
- Hours since last update: ${hoursSinceUpdate}
- Agent reply: ${negotiation.agent_reply || "None yet"}
- Strategy notes: ${negotiation.notes || "None"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_move",
              description: "Return the suggested next negotiation move",
              parameters: {
                type: "object",
                properties: {
                  suggestion: { type: "string", description: "The recommended next move" },
                  confidence: { type: "number", description: "Deal success likelihood 0-100" },
                  reason: { type: "string", description: "Short tactical reason" },
                  urgency: { type: "string", enum: ["low", "medium", "high"], description: "How urgent is action" },
                },
                required: ["suggestion", "confidence", "reason", "urgency"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_move" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return a suggestion" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-next-move error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
