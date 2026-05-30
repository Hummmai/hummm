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
    const { criteria, properties } = await req.json();

    if (!criteria || !properties) {
      return new Response(
        JSON.stringify({ error: "Missing criteria or properties" }),
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

    const propertyList = properties.map((p: any) => ({
      id: p.id,
      price: p.price,
      priceNum: p.priceNum,
      address: p.address,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft,
      type: p.type,
      listing: p.listing,
      garden: p.garden,
      parking: p.parking,
      newBuild: p.newBuild,
      epc: p.epc,
    }));

    const systemPrompt = `You are an expert UK property advisor AI. Given a user's search criteria and a list of available properties, you must:

1. Analyse the user's needs deeply — budget, location preferences, bedroom requirements, must-have features, timeline urgency, and lifestyle priorities.
2. Score each property from 0 to 100 based on how well it matches.
3. Return the property IDs ranked from best match to worst.
4. Mark the top 5-8 properties as "AI Matched" (score >= 70).
5. Write a brief, friendly summary (2-3 sentences) explaining why these properties were selected.

Respond ONLY with valid JSON in this exact format:
{
  "summary": "string — friendly explanation of the matches",
  "ranked": [
    { "id": "string", "score": number, "reason": "short reason why this is a good/bad match" }
  ]
}

Be practical and realistic. Consider:
- Budget fit (most important)
- Location match
- Bedroom/bathroom requirements
- Feature alignment (garden, parking, schools, etc.)
- Property type preferences
- Timeline urgency vs availability`;

    const userPrompt = `User's search criteria:
- Location: ${criteria.location}
- Looking for: ${criteria.listingType} (Buy/Rent/Both)
- Budget: ${criteria.minBudget || "No minimum"} to ${criteria.maxBudget || "No maximum"}
- Bedrooms needed: ${criteria.beds || "Any"}
- Must-have features: ${criteria.features?.length ? criteria.features.join(", ") : "None specified"}
- Timeline: ${criteria.timeline || "Not specified"}

Available properties:
${JSON.stringify(propertyList, null, 2)}

Analyse these properties against the user's criteria and return your ranked results.`;

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
              name: "rank_properties",
              description: "Return ranked property matches with scores and summary",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "2-3 sentence friendly explanation of the property matches",
                  },
                  ranked: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        score: { type: "number" },
                        reason: { type: "string" },
                      },
                      required: ["id", "score", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "ranked"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "rank_properties" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI matching temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "AI did not return structured results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("property-scout-match error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
