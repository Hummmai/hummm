import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ═══════════════════════════════════════════════
   MODE: SELLER — Analyse buyer offers
   ═══════════════════════════════════════════════ */

function buildSellerPayload(body: any) {
  const { offer, property, sellerAskingPrice } = body;
  const askingPrice = sellerAskingPrice || property?.asking_price || 0;
  const offerGap = askingPrice > 0
    ? ((askingPrice - offer.offer_amount) / askingPrice * 100).toFixed(1)
    : "unknown";

  const systemPrompt = `You are the Humm Deal Doctor — an expert AI advisor for UK property sellers. Analyse incoming offers and provide strategic recommendations.

ANALYSIS RULES:
- Compare the offer amount against the asking price and calculate the percentage gap
- Assess buyer strength: chain-free buyers and first-time buyers are stronger; proof of funds and DIP (Decision in Principle) confirmation add significant credibility
- If the offer is within 3% of asking, recommend serious consideration
- If the offer is 3-10% below, suggest a counter-offer strategy with a specific amount
- If the offer is >10% below, recommend rejection unless the buyer has exceptional credentials
- Consider days on market, local demand, and buyer position
- Always recommend checking proof of funds before accepting any offer
- Use British English, be direct but professional`;

  const userPrompt = `Property: ${property.address}
Asking price: £${askingPrice?.toLocaleString() || "Unknown"}
Offer amount: £${offer.offer_amount?.toLocaleString()}
Offer gap: ${offerGap}% below asking
Buyer name: ${offer.buyer_name || "Unknown"}
Buyer status: ${offer.buyer_status || "Unknown"}
Proof of funds: ${offer.proof_of_funds ? "Yes" : "No"}
DIP confirmed: ${offer.dip_confirmed ? "Yes" : "No"}
Additional notes: ${offer.notes || "None"}`;

  const tool = {
    type: "function" as const,
    function: {
      name: "analyze_offer",
      description: "Return the AI Deal Doctor analysis for a seller",
      parameters: {
        type: "object",
        properties: {
          analysis: { type: "string", description: "2-3 sentence analysis of the offer" },
          recommendation: { type: "string", enum: ["accept", "counter", "reject", "request_info"] },
          recommendationText: { type: "string", description: "1-2 sentence recommendation" },
          suggestedCounterAmount: { type: ["number", "null"] },
          buyerStrengthScore: { type: "number", description: "1-10 score" },
          buyerStrengthLabel: { type: "string", enum: ["Strong", "Moderate", "Weak", "Unverified"] },
          responseDraft: { type: "string", description: "Professional 2-3 sentence response letter" },
          riskFactors: { type: "array", items: { type: "string" } },
        },
        required: ["analysis", "recommendation", "recommendationText", "buyerStrengthScore", "buyerStrengthLabel", "responseDraft", "riskFactors"],
        additionalProperties: false,
      },
    },
  };

  return { systemPrompt, userPrompt, tool, toolName: "analyze_offer" };
}

/* ═══════════════════════════════════════════════
   MODE: LANDLORD — Review renter applications
   ═══════════════════════════════════════════════ */

function buildLandlordPayload(body: any) {
  const { applicant, property, monthlyRent } = body;

  const systemPrompt = `You are the Humm Landlord Advisor — an expert AI for UK landlords reviewing tenant applications under the Renters' Reform Act 2026.

ANALYSIS RULES:
- Assess applicant affordability: monthly rent should be ≤35% of gross monthly income
- Evaluate employment stability: permanent roles and long tenure are positive signals
- Credit check status: passed is strong, pending needs follow-up, failed is a red flag
- References: previous landlord references are critical
- Pet requests: under the 2026 Act, landlords cannot unreasonably refuse pets. If a pet is involved, recommend acceptance with appropriate clauses (pet deposit, professional cleaning)
- Guarantor: if affordability is borderline, suggest requiring a guarantor
- Consider the Hummm Renter Score (0-100) as a composite metric
- If recommending acceptance, always suggest appropriate break clause terms
- Use British English, be direct but fair`;

  const userPrompt = `Property: ${property?.address || "Unknown"}
Monthly rent: £${monthlyRent?.toLocaleString() || "Unknown"}

Applicant details:
- Name: ${applicant?.name || "Unknown"}
- Annual income: £${applicant?.annual_income?.toLocaleString() || "Unknown"}
- Employment type: ${applicant?.employment_type || "Unknown"}
- Employer: ${applicant?.employer || "Unknown"}
- Employment length: ${applicant?.employment_length || "Unknown"}
- Credit check: ${applicant?.credit_check || "Pending"}
- Previous landlord reference: ${applicant?.landlord_reference || "Not provided"}
- Has pets: ${applicant?.has_pets ? `Yes — ${applicant.pet_details || "details not provided"}` : "No"}
- Guarantor available: ${applicant?.has_guarantor ? "Yes" : "No"}
- Hummm Renter Score: ${applicant?.renter_score || "Not calculated"}
- Notes: ${applicant?.notes || "None"}`;

  const tool = {
    type: "function" as const,
    function: {
      name: "review_application",
      description: "Return the AI landlord advisor analysis for a renter application",
      parameters: {
        type: "object",
        properties: {
          analysis: { type: "string", description: "2-3 sentence assessment of the applicant" },
          recommendation: { type: "string", enum: ["accept", "accept_with_conditions", "request_info", "reject"] },
          recommendationText: { type: "string", description: "Clear recommendation with reasoning" },
          renterScore: { type: "number", description: "Hummm Renter Score 0-100" },
          renterScoreLabel: { type: "string", enum: ["Excellent", "Good", "Fair", "Poor"] },
          affordabilityRatio: { type: "string", description: "Rent as % of income e.g. '28%'" },
          suggestedConditions: { type: "array", items: { type: "string" }, description: "Conditions to apply if accepting" },
          breakClause: { type: "string", description: "Recommended break clause terms" },
          responseDraft: { type: "string", description: "Professional response to the applicant" },
          riskFactors: { type: "array", items: { type: "string" } },
        },
        required: ["analysis", "recommendation", "recommendationText", "renterScore", "renterScoreLabel", "affordabilityRatio", "responseDraft", "riskFactors"],
        additionalProperties: false,
      },
    },
  };

  return { systemPrompt, userPrompt, tool, toolName: "review_application" };
}

/* ═══════════════════════════════════════════════
   MODE: RENTER — Draft legal requests (pet, repair, etc.)
   ═══════════════════════════════════════════════ */

function buildRenterPayload(body: any) {
  const { requestType, details, tenancy, property } = body;

  const requestTypeLabel = requestType === "pet" ? "Pet Request"
    : requestType === "repair" ? "Repair Request"
    : requestType === "deposit" ? "Deposit Dispute"
    : requestType === "rent_review" ? "Rent Review Challenge"
    : "General Request";

  const systemPrompt = `You are the Hummm Renter Rights Advisor — an expert AI that drafts legally-informed letters for UK tenants under the Renters' Reform Act 2026 and the Housing Act 1988 (as amended).

DRAFTING RULES — ${requestTypeLabel}:
${requestType === "pet" ? `
- Under the Renters' Reform Act 2026, landlords CANNOT unreasonably refuse a pet request
- The tenant has the right to keep a pet unless the landlord provides written reasons for refusal within 42 days
- Draft a formal pet request letter that is polite but references the tenant's legal right
- Include: pet type, breed, size, temperament, any pet insurance or deposit offer
- Reference Section [X] of the Renters' Reform Act 2026
- Offer to pay a reasonable pet deposit or provide pet damage insurance` : ""}
${requestType === "repair" ? `
- Under Section 11 of the Landlord and Tenant Act 1985, landlords must keep the structure, exterior, and installations in repair
- The Decent Homes Standard (2026) sets minimum habitability requirements
- Draft a formal repair request that documents the issue, dates, and impact on habitability
- Set a reasonable deadline (14 days for urgent, 28 days for non-urgent)
- Note the tenant's right to escalate to the Housing Ombudsman or local authority if unresolved
- Reference the Homes (Fitness for Human Habitation) Act 2018` : ""}
${requestType === "deposit" ? `
- Deposits must be protected in a government-approved scheme within 30 days
- Draft a formal letter requesting deposit return or disputing deductions
- Reference the Housing Act 2004 and Tenancy Deposit Schemes` : ""}
${requestType === "rent_review" ? `
- Under the 2026 Act, rent increases must be fair and evidenced by comparable market data
- Tenants can challenge excessive increases via the First-tier Tribunal
- Draft a challenge letter citing comparable rents in the area` : ""}
- Use formal British English, be polite but firm
- Always include the tenant's address, tenancy start date, and landlord details
- End with a clear call to action and timeline`;

  const userPrompt = `Request type: ${requestTypeLabel}
Property: ${property?.address || "Unknown"}
Landlord/Agent: ${tenancy?.landlord_name || "Unknown"}
Tenancy start date: ${tenancy?.start_date || "Unknown"}
Tenancy type: ${tenancy?.type || "Periodic (assumed under 2026 Act)"}

Request details:
${requestType === "pet" ? `
- Pet type: ${details?.pet_type || "Not specified"}
- Breed: ${details?.pet_breed || "Not specified"}
- Pet name: ${details?.pet_name || "Not specified"}
- Has pet insurance: ${details?.has_insurance ? "Yes" : "No"}
- Willing to pay pet deposit: ${details?.willing_to_pay_deposit ? "Yes" : "No"}
- Additional info: ${details?.notes || "None"}` : ""}
${requestType === "repair" ? `
- Issue: ${details?.issue || "Not specified"}
- Location in property: ${details?.location || "Not specified"}
- First reported: ${details?.first_reported || "Not specified"}
- Urgency: ${details?.urgency || "Standard"}
- Impact on habitability: ${details?.impact || "Not specified"}
- Photos attached: ${details?.has_photos ? "Yes" : "No"}
- Additional info: ${details?.notes || "None"}` : ""}
${requestType === "deposit" ? `
- Deposit amount: £${details?.deposit_amount || "Unknown"}
- Deposit scheme: ${details?.deposit_scheme || "Unknown"}
- Dispute details: ${details?.dispute_details || "Not specified"}` : ""}
${requestType === "rent_review" ? `
- Current rent: £${details?.current_rent || "Unknown"}/month
- Proposed increase: £${details?.proposed_rent || "Unknown"}/month
- Increase percentage: ${details?.increase_percentage || "Unknown"}%
- Comparable area rents: ${details?.comparable_rents || "Not provided"}` : ""}`;

  const tool = {
    type: "function" as const,
    function: {
      name: "draft_renter_request",
      description: "Return the AI-drafted formal letter for the tenant",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Letter subject line" },
          body: { type: "string", description: "Full formal letter text" },
          legalBasis: { type: "string", description: "The legal Acts/Sections this request is based on" },
          urgency: { type: "string", enum: ["standard", "urgent", "critical"] },
          deadlineDays: { type: "number", description: "Recommended response deadline in days" },
          nextSteps: { type: "array", items: { type: "string" }, description: "What the tenant should do next" },
          escalationPath: { type: "string", description: "Where to escalate if landlord doesn't respond" },
        },
        required: ["subject", "body", "legalBasis", "urgency", "deadlineDays", "nextSteps", "escalationPath"],
        additionalProperties: false,
      },
    },
  };

  return { systemPrompt, userPrompt, tool, toolName: "draft_renter_request" };
}

/* ═══════════════════════════════════════════════
   MAIN HANDLER
   ═══════════════════════════════════════════════ */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode: string = body.mode || "seller";

    // Validate mode
    if (!["seller", "landlord", "renter"].includes(mode)) {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use 'seller', 'landlord', or 'renter'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields per mode
    if (mode === "seller" && (!body.offer || !body.property)) {
      return new Response(
        JSON.stringify({ error: "Offer and property details are required for seller mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (mode === "landlord" && !body.applicant) {
      return new Response(
        JSON.stringify({ error: "Applicant details are required for landlord mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (mode === "renter" && !body.requestType) {
      return new Response(
        JSON.stringify({ error: "Request type is required for renter mode (pet, repair, deposit, rent_review)" }),
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

    // Build the mode-specific payload
    const { systemPrompt, userPrompt, tool, toolName } = mode === "seller"
      ? buildSellerPayload(body)
      : mode === "landlord"
        ? buildLandlordPayload(body)
        : buildRenterPayload(body);

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
        tools: [tool],
        tool_choice: { type: "function", function: { name: toolName } },
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
      return new Response(
        JSON.stringify({ error: "Hummm temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "AI did not return an analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ mode, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-offer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
