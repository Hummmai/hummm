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
    const { property, buyerName, maxBudget, buyerStatus, listingType, lifeMetrics } = await req.json();

    if (!property?.address) {
      return new Response(
        JSON.stringify({ error: "Property address is required" }),
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

    const daysOnMarket = property.date
      ? Math.floor((Date.now() - new Date(property.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // ── Value Friction analysis ──
    let valueFriction: string[] = [];
    if (lifeMetrics) {
      // Commute > 45 mins = friction
      const commuteMatch = lifeMetrics.commute?.match(/^(\d+)\s*min/i);
      if (commuteMatch && parseInt(commuteMatch[1], 10) > 45) {
        valueFriction.push(`COMMUTE FRICTION: The commute to the buyer's workplace is ${commuteMatch[1]} minutes — above the 45-minute comfort threshold. Use this to justify a 3-5% price reduction, noting that longer commutes reduce the effective value proposition of the location.`);
      }

      // Schools — only "Requires Improvement" or worse
      const schoolOfsted = lifeMetrics.topSchoolOfsted?.toLowerCase() || "";
      const educationText = (lifeMetrics.education || "").toLowerCase();
      const hasGoodSchool = ["outstanding", "good"].some(r => schoolOfsted.includes(r) || educationText.includes(r));
      const hasPoorSchool = ["requires improvement", "inadequate", "unavailable"].some(r => schoolOfsted.includes(r) || educationText.includes(r));
      if (hasPoorSchool && !hasGoodSchool) {
        valueFriction.push(`SCHOOL CATCHMENT FRICTION: The nearest schools are rated 'Requires Improvement' or lower. For family buyers this is a significant drawback. Use this to justify a 3-5% price reduction, noting that poor catchment reduces demand and resale potential.`);
      }
    }

    const frictionBlock = valueFriction.length > 0
      ? `\n\nVALUE FRICTION POINTS (MUST use these to justify a 3-5% reduction from asking price):\n${valueFriction.map((f, i) => `${i + 1}. ${f}`).join("\n")}\nWhen Value Friction points are present, your offer MUST be 3-5% below asking price regardless of the buyer's budget. Reference the specific friction points as objective market reasoning.`
      : "";

    const systemPrompt = `You are the Hummm Negotiator — an expert UK property negotiation strategist. Draft a strategic opening email from a prospective ${listingType === "rent" ? "renter" : "buyer"} to the estate agent.

STRATEGY RULES:
- If the property has been on market >60 days, use this as leverage ("We note the property has been available for some time...")
- If the buyer is chain-free or a first-time buyer, emphasise this as a strong advantage
- If the max budget is below asking price, craft a justified lower offer with market reasoning
- If the max budget meets or exceeds asking, express strong interest and request a priority viewing
- Reference specific property details to show genuine interest
- If life metrics show the property is OUTSIDE a premium school catchment or far from transport, subtly use this to justify a lower offer
- If life metrics show GOOD connectivity or schools, use this to express genuine interest but don't let it weaken your negotiation position
- Keep it 150-250 words, professional but confident
- Use British English
- Do NOT include the subject in the body
${frictionBlock}

Return ONLY valid JSON:
{
  "subject": "Email subject line",
  "body": "Full email body text",
  "strategy": "Brief explanation of the negotiation strategy used (1-2 sentences)",
  "counterOptions": ["Option 1 text", "Option 2 text", "Option 3 text"]
}

The counterOptions should be three possible next moves the buyer could take if the agent responds (e.g., "Accept and proceed", "Counter at £X", "Request more time to consider").`;

    const userPrompt = `Property details:
- Address: ${property.address}
- Asking price: £${property.price?.toLocaleString() || "Unknown"}
- Type: ${property.property_type || "Unknown"}
- Bedrooms: ${property.bedrooms || "Unknown"}
- Bathrooms: ${property.bathrooms || "Unknown"}
- Source: ${property.source || "Unknown"}
- Days on market: ${daysOnMarket !== null ? daysOnMarket : "Unknown"}
- Listing type: ${listingType === "rent" ? "To Rent" : "For Sale"}

Buyer details:
- Name: ${buyerName || "the buyer"}
- Maximum budget: £${maxBudget?.toLocaleString() || "Not specified"}
- Buyer status: ${buyerStatus || "Not specified"}
${lifeMetrics ? `
Life Metrics (area context):
- Education: ${lifeMetrics.education || "Unknown"}
- Connectivity: ${lifeMetrics.connectivity || "Unknown"}
- Commute: ${lifeMetrics.commute || "Not specified"}
- Area: ${lifeMetrics.area || "Unknown"}
- Top nearby school: ${lifeMetrics.topSchool || "Unknown"} (Ofsted: ${lifeMetrics.topSchoolOfsted || "Unknown"})` : ""}
${valueFriction.length > 0 ? `\n⚠️ VALUE FRICTION DETECTED — justify a 3-5% reduction using the points above.` : ""}`;
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "draft_negotiation_email",
              description: "Return the strategic negotiation email",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Email subject line" },
                  body: { type: "string", description: "Full email body" },
                  strategy: { type: "string", description: "Brief explanation of strategy used" },
                  counterOptions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Three suggested counter-move options",
                  },
                },
                required: ["subject", "body", "strategy", "counterOptions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "draft_negotiation_email" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Negotiation AI temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI did not return a draft" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-negotiation-email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
