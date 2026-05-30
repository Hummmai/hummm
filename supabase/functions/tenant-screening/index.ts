import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      reference_id,
      applicant_name, applicant_email, applicant_phone, applicant_dob,
      employment_status, annual_income, proposed_rent, address_history,
      property_address, listing_id,
    } = body;

    if (!applicant_name || !applicant_email) {
      return new Response(JSON.stringify({ error: "Missing applicant details" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `You are an expert UK lettings tenant referencing analyst. Generate a realistic comprehensive tenant screening report.

Applicant:
- Name: ${applicant_name}
- Email: ${applicant_email}
- Phone: ${applicant_phone || "N/A"}
- DOB: ${applicant_dob || "N/A"}
- Employment: ${employment_status || "N/A"}
- Annual Income: £${annual_income || "N/A"}
- Proposed Rent: £${proposed_rent || "N/A"}/month
- Address History: ${JSON.stringify(address_history || [])}
- Property: ${property_address || "N/A"}

Run these checks and return ONLY valid JSON (no markdown):
{
  "credit_score": <300-850>,
  "affordability_ratio": <annual_income / (rent*12), 2 decimals>,
  "fraud_flag": <bool>,
  "aml_flag": <bool>,
  "sanctions_flag": <bool>,
  "right_to_rent_status": "verified" | "pending" | "failed",
  "income_verified": <bool>,
  "risk_score": <0-100, lower=safer>,
  "recommendation": "Accept" | "Conditional" | "Reject",
  "summary": "<2-sentence executive summary>",
  "red_flags": ["..."],
  "positives": ["..."],
  "credit_summary": "<brief>",
  "affordability_summary": "<brief>",
  "employment_summary": "<brief>",
  "compliance_summary": "<brief>"
}

Affordability rule: ratio >= 2.5 is good, 2.0-2.5 conditional, <2.0 reject. Adjust recommendation accordingly.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Return only valid JSON. No markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI gateway: ${aiRes.status} ${errText}`);
    }

    const aiJson = await aiRes.json();
    let content = aiJson.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\n?|```/g, "").trim();
    const report = JSON.parse(content);

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const updateData = {
      landlord_user_id: user.id,
      listing_id,
      property_address,
      applicant_name, applicant_email, applicant_phone, applicant_dob,
      employment_status, annual_income, proposed_rent,
      address_history: address_history || [],
      status: "completed",
      risk_score: report.risk_score,
      recommendation: report.recommendation,
      credit_score: report.credit_score,
      affordability_ratio: report.affordability_ratio,
      fraud_flag: report.fraud_flag,
      aml_flag: report.aml_flag,
      sanctions_flag: report.sanctions_flag,
      right_to_rent_status: report.right_to_rent_status,
      income_verified: report.income_verified,
      red_flags: report.red_flags,
      positives: report.positives,
      summary: report.summary,
      report_json: report,
    };

    let result;
    if (reference_id) {
      const { data, error } = await service.from("tenant_references")
        .update(updateData).eq("id", reference_id).eq("landlord_user_id", user.id)
        .select().single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await service.from("tenant_references")
        .insert(updateData).select().single();
      if (error) throw error;
      result = data;
    }

    return new Response(JSON.stringify({ reference: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});