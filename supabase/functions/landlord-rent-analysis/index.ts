const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address, postcode, currentRent, propertyType, bedrooms } = await req.json();

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: "postcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a UK property rental valuation expert. Analyze the following property and provide a market rent assessment.

Property: ${address || "Unknown address"}
Postcode: ${postcode}
Type: ${propertyType || "house"}
Bedrooms: ${bedrooms || 2}
Current Rent: £${currentRent || "unknown"}/month

Based on current March 2026 UK rental market conditions for the ${postcode} area, provide:
1. An estimated market monthly rent (be specific with a number)
2. Whether the current rent is above, below, or at market rate
3. The percentage difference

Also draft a Section 13 rent increase notice if the current rent is below market rate. The notice must comply with the Housing Act 1988 (as amended by the Renters' Reform Act 2026). Key requirements:
- Minimum 2 months' notice
- Can only be served once per 12-month period
- Must use prescribed form
- Tenant can challenge at First-tier Tribunal`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a UK rental market analyst. Return JSON only." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "rent_analysis",
              description: "Return structured rent analysis and Section 13 notice draft",
              parameters: {
                type: "object",
                properties: {
                  market_rent: { type: "number", description: "Estimated monthly market rent in GBP" },
                  rent_difference_pct: { type: "number", description: "Percentage difference (positive = under-rented)" },
                  assessment: { type: "string", enum: ["under-rented", "at-market", "over-rented"] },
                  rationale: { type: "string", description: "Brief explanation of the assessment" },
                  section_13_notice: { type: "string", description: "Draft Section 13 notice text if applicable" },
                  recommended_new_rent: { type: "number", description: "Recommended new rent amount" },
                  comparable_rents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        address: { type: "string" },
                        rent: { type: "number" },
                        bedrooms: { type: "number" },
                      },
                      required: ["address", "rent", "bedrooms"],
                    },
                  },
                },
                required: ["market_rent", "rent_difference_pct", "assessment", "rationale"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "rent_analysis" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to analyze rent" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
