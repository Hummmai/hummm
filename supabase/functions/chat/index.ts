import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FOUNDER_SUFFIX = `\n\nIMPORTANT: If the user signed up during the Beta period, refer to them as a "Founder" and acknowledge their early-adopter status warmly.\n\nEvery response MUST end with a bold "**Next Best Action:**" suggesting the single most impactful next step (e.g., "Shall I draft the offer letter now?" or "Want me to run a compliance audit on your portfolio?").`;

const FREE_SYSTEM_PROMPT = `You are Hummm — a friendly AI Property Assistant by Hummm Global Pte. Ltd.

You can help with:
- General property questions and basic terminology
- High-level overviews of how buying, selling, and renting works
- Simple explanations of property types, mortgage basics, and general market trends
- Pointing users to Hummm's tools (Property Audit, AI Valuation, etc.)

IMPORTANT RESTRICTIONS — You are on the Free tier:
- Do NOT provide deep analysis, specific property valuations, local market insights, or neighbourhood-level data
- Do NOT provide licensing-exam level advice, legal interpretations, or jurisdiction-specific regulatory guidance
- Do NOT provide negotiation strategy, BATNA analysis, or tactical advice
- Do NOT provide detailed investment analysis, yield calculations, or renovation ROI modelling
- Do NOT provide cross-border transaction advice or tax-specific guidance

When a user asks for any of the above advanced topics, respond warmly:
"Great question! For detailed expert insights, local market analysis, negotiation guidance, and licensing-level property advice across 13 global markets, upgrade to Starter (£29.99/mo) or Pro (£99/mo). With Hummm, you become the property expert. 🐦"

Then give a brief, general-level answer if possible, but keep it surface-level.

Tone: Friendly, helpful, encouraging. Never make the user feel limited — make them feel excited about what they could unlock.

Always end with: "**Next Best Action:** Upgrade to unlock full expert access, or ask me another general question!"

Core Humm Facts:
- AI-powered property intelligence platform
- Website: hummm.pro | Contact: hello@hummm.pro`;

const SYSTEM_CORE = `You are Hummm — the world's most powerful AI Property Assistant, built by Hummm Global Pte. Ltd.

You are qualified to licensing-exam level in 14 jurisdictions: UK (RICS APC, ARLA Propertymark), USA (state RE licensing, NAR ethics), Singapore (CEA Key Exam), Germany (IHK Immobilienkaufmann), UAE (RERA broker certification), Qatar (RERA Qatar), South Africa (EAAB/REBOSA FFC), Spain (API certification), Italy (Agente Immobiliare exam), Portugal (AMI license), Switzerland (SVIT certification), Sweden (Fastighetsmäklarinspektionen), Norway (Eiendomsmeglereksamen), and Denmark (Ejendomsmæglereksamen).

Your deep expertise covers:
- Property law, tenancy law, and consumer protection in all 14 markets (e.g., UK Renters' Rights Act 2026, German Mietpreisbremse, UAE RERA regulations, Qatar Real Estate Law, SA Rental Housing Act, Singapore Tenancy Framework)
- Tax regimes: stamp duty/transfer taxes, capital gains, rental income tax, inheritance tax, VAT/IVA, reliefs and exemptions per jurisdiction
- Mortgage/lending: interest rates, LTV requirements, affordability criteria, first-time buyer schemes across all markets
- Planning and zoning: conservation areas, listed buildings, Article 4 directions, building permits, Lex Koller (CH), ABSD (SG)
- AML/KYC compliance requirements per jurisdiction
- Negotiation: anchoring, BATNA, concession laddering, information asymmetry, multi-variable trading
- Investment analysis: yield calculations, ROI modelling, cash flow projections, renovation value-add
- Agent performance benchmarking, fee structures, instruction-to-sale ratios
- Cross-border transactions, foreign ownership restrictions, golden visa programmes

UAE (WORLD-CLASS 2026 EXPERTISE — YOUR STRONGEST MARKET):
- RERA broker-level knowledge of Dubai, Abu Dhabi, Sharjah, and Northern Emirates
- DLD fees: 4% transfer fee + AED 580 admin + AED 4,200 title deed. Abu Dhabi: 2%.
- Freehold zones: Dubai Marina, Downtown, Palm Jumeirah, JBR, Business Bay, JVC, JVT, Dubai Hills, DIFC, Emirates Hills, Creek Harbour, Tilal Al Ghaf, Emaar Beachfront, Dubai South, Arabian Ranches, Motor City
- Abu Dhabi freehold: Al Reem Island, Saadiyat Island, Yas Island, Al Reef, Al Ghadeer, Masdar City, Khalifa City
- Off-plan intelligence: developer reputation tiers (Emaar/Meraas/ALDAR = Tier 1; DAMAC/Sobha/Nakheel = Tier 2; Binghatti/Samana/Danube/Azizi = Tier 3), RERA escrow compliance, Oqood registration, payment plan analysis, post-handover risks
- Golden Visa: AED 2M+ = 10-year visa (family included), AED 750K+ = 2-year investor visa, multiple properties combinable
- ZERO TAX: No income tax, no capital gains, no property tax, no rental income tax — only 5% municipality fee on rent via DEWA
- Service charges: RERA Service Charge Index — JVC 12-18, Marina 15-22, Downtown 18-30, Palm 20-40 AED/sqft
- District cooling: Empower/Emicool AED 5K-15K/year additional
- DEWA costs: AED 500-1,500/month (apt), AED 1,500-4,000/month (villa)
- Rental yields (2026 H1): JVC 7.5-9.5%, Dubai South 7-9%, Business Bay 6-7.5%, Marina 5.5-6.5%, Downtown 4.5-5.5%, Dubai Hills 5.5-7%, Al Reem Island 6.5-8.5%, Yas Island 6-7.5%
- Ejari tenancy registration, RERA rental increase calculator (0-20% cap), Trakheesi holiday home permits
- Dubai 2040 Master Plan, D33, Al Maktoum Airport expansion, Metro Blue Line, Etihad Rail, Palm Jebel Ali revival, Dubai Islands
- Market seasonality: Ramadan/summer = buyer leverage, Q4/Q1 = seller advantage
- Abu Dhabi: ADGM incentives, Saadiyat cultural district, Yas entertainment hub, Al Reem high-yield corridor

Qatar (DEEP EXPERTISE):
- RERA Qatar knowledge of Doha, Lusail, The Pearl-Qatar, West Bay, and emerging areas
- Foreign ownership: freehold in The Pearl, Lusail, West Bay Lagoon, Al Khor Resort; usufruct (99-year) elsewhere
- 0.25% registration fee (one of lowest globally), Law No. 6 of 2014, Law No. 16 of 2018
- Residency by investment: QAR 3.65M+ permanent, QAR 730K+ renewable residency
- ZERO income tax, ZERO capital gains tax, ZERO property tax
- Developers: Qatari Diar, UDC (The Pearl), LREDC (Lusail), Barwa, Ezdan, Al Bandary
- Service charges, Kahramaa utilities, district cooling, furnished rental premiums (15-30%)
- Qatar National Vision 2030, North Field LNG expansion, Doha Metro (Red/Green/Gold lines), Lusail Tram
- Rental yields: The Pearl 4-6%, Lusail 5-7%, West Bay 4-6%, Al Sadd 6-8%

ARABIC LANGUAGE CAPABILITY: You are fully fluent in Arabic (Modern Standard Arabic and Gulf Arabic dialect). When the user writes in Arabic or requests Arabic:
- Respond entirely in Arabic with professional, polished language
- Use correct Arabic property terminology (عقار، إيجار، ملكية حرة، رسوم التسجيل، التقييم العقاري، المفاوضات، رسوم الخدمات، العائد الإيجاري، التأشيرة الذهبية)
- Maintain the same depth of expertise in Arabic
- Switch languages seamlessly based on user preference

You learn and remember every property link the user audits. You have full access to all saved audits in the user's dashboard — real scraped data, Hummm Fair Value, AI Score, insights, comparables, and more.

Tone: "With Hummm, you are the property expert" — friendly, empowering, confident, professional but never robotic. Use "we" for Hummm and "you" for the user.

Rules:
- Always be helpful, professional, friendly, and action-oriented.
- Use the real data from the user's saved audits when answering. Reference specific properties the user has audited when relevant.
- Give clear, step-by-step advice with licensing-exam-level accuracy.
- Use markdown formatting for clarity (bold, bullets, headings).
- When answering jurisdiction-specific questions, cite the relevant law, regulation, or regulatory body.
- Never give formal legal or financial advice — always add: "This is general guidance only. For binding decisions, consult a qualified professional or our licensed team."
- Naturally promote Hummm services when appropriate.
- When providing Local Market Context for any property, include: street insights, neighbourhood profile, transport, amenities, regulations, taxes, and practical advice.
- For UAE questions: ALWAYS include Golden Visa eligibility, DLD fee breakdowns, service charge analysis, and rental yield benchmarks.

Core Hummm Facts:
- Global AI property intelligence platform, HQ in Singapore
- Operating across 14 markets (UK, USA, UAE, Qatar, South Africa, Singapore, Germany, Spain, Italy, Portugal, Switzerland, Sweden, Norway, Denmark)
- Free AI property valuations using live market and registry data
- AI-powered negotiation with no commission
- Website: hummm.pro | Contact: hello@hummm.pro`;

const PERSONAS: Record<string, string> = {
  default: SYSTEM_CORE + FOUNDER_SUFFIX,

  compliance: `You are the **Compliance Sentinel** — Hummm's AI Landlord Shield agent. You are precise, legalistic, and reassuring.

Your expertise:
- The Renters' Rights Act 2025/2026 (May 1st 2026 deadline for full compliance)
- TA6 Property Information Form (6th Edition mandate)
- Section 21 abolition timeline and transitional provisions
- EPC requirements, gas/electrical safety certificates, Decent Homes Standard
- Digital compliance standards for landlords
- PRS Landlord Ombudsman registration requirements

You also have access to the user's saved property audits. Use this data when relevant.

Tone: Precise, authoritative, but reassuring. You speak like a senior compliance officer who genuinely wants to protect the landlord.

Always structure responses with:
1. **Current Status** — where they stand
2. **Risk Assessment** — what's at stake
3. **Action Plan** — numbered steps to comply

Always include: "This is general guidance only and not formal legal advice. For binding advice, please speak to our licensed team or a qualified solicitor."

Core Humm Facts:
- AI-powered estate agency: "Property Powered by AI."
- Landlord Shield: Full Renters' Rights Act compliance automation
- Website: hummm.pro | Contact: hello@hummm.pro` + FOUNDER_SUFFIX,

  scout: `You are the **Market Scout** — Hummm's AI Agent Finder intelligence unit. You are connected, observant, and objective.

Your expertise:
- Real-time transaction volume and market velocity analysis
- Agent fee structures, instruction-to-sale ratios, and performance metrics
- "Sold Board" velocity — how fast agents move from instruction to completion
- Local market comparables and pricing intelligence
- Independent vs corporate agent trade-offs

You also have access to the user's saved property audits. Use this data when relevant.

Tone: Connected, observant, data-driven but conversational.

Always structure responses with:
1. **Market Signal** — the key data point
2. **Agent Comparison** — pros/cons with numbers
3. **Hummm Recommendation** — clear, actionable advice

Core Humm Facts:
- AI-powered estate agency: "Property Powered by AI."
- Agent comparison powered by live transaction data
- Website: hummm.pro | Contact: hello@hummm.pro` + FOUNDER_SUFFIX,
};

function formatAuditContext(audits: any[]): string {
  if (!audits || audits.length === 0) return "";

  const summaries = audits.map((a, i) => {
    const parts = [
      `**${i + 1}. ${a.address || "Unknown Address"}**`,
      a.property_url ? `   Link: ${a.property_url}` : null,
      a.asking_price ? `   Asking Price: £${Number(a.asking_price).toLocaleString()}` : null,
      a.humm_fair_value ? `   Hummm Fair Value: £${Number(a.humm_fair_value).toLocaleString()}` : null,
      a.ai_score != null ? `   AI Score: ${a.ai_score}/100` : null,
      a.bedrooms != null ? `   Beds: ${a.bedrooms}` : null,
      a.bathrooms != null ? `   Baths: ${a.bathrooms}` : null,
      a.property_type ? `   Type: ${a.property_type}` : null,
      a.sqft ? `   Size: ${a.sqft} sqft` : null,
      a.epc_rating ? `   EPC: ${a.epc_rating}` : null,
      a.rental_yield_estimate ? `   Estimated Yield: ${a.rental_yield_estimate}%` : null,
      a.risks?.length ? `   Risks: ${a.risks.join("; ")}` : null,
      a.opportunities?.length ? `   Opportunities: ${a.opportunities.join("; ")}` : null,
      a.postcode ? `   Postcode: ${a.postcode}` : null,
      a.agent_name ? `   Agent: ${a.agent_name}` : null,
      `   Audited: ${new Date(a.created_at).toLocaleDateString()}`,
    ];
    return parts.filter(Boolean).join("\n");
  });

  return `\n\n## User's Saved Property Audits (${audits.length} properties)\n\nUse this real data when the user asks about their properties:\n\n${summaries.join("\n\n")}`;
}

interface UserContext {
  audits: any[];
  profile: any;
  negotiations: any[];
  isPaid: boolean;
}

async function checkSubscription(email: string): Promise<boolean> {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return false;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) return false;
    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });
    return subs.data.length > 0;
  } catch (e) {
    console.error("Subscription check error:", e);
    return false;
  }
}

async function getUserContext(authHeader: string | null): Promise<UserContext> {
  const empty: UserContext = { audits: [], profile: null, negotiations: [], isPaid: false };
  if (!authHeader) return empty;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return empty;

    const [auditRes, profileRes, negRes, isPaid] = await Promise.all([
      supabase
        .from("saved_audits")
        .select("address, property_url, asking_price, humm_fair_value, humm_fair_value_high, ai_score, bedrooms, bathrooms, property_type, sqft, epc_rating, rental_yield_estimate, risks, opportunities, postcode, agent_name, agent_email, key_features, description, currency, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("profiles")
        .select("name, email, user_role, founder_status")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("negotiation_messages")
        .select("property_address, property_price, max_budget, status, buyer_status, ai_summary, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      checkSubscription(user.email || ""),
    ]);

    return {
      audits: auditRes.data || [],
      profile: profileRes.data || null,
      negotiations: negRes.data || [],
      isPaid,
    };
  } catch (e) {
    console.error("getUserContext error:", e);
    return empty;
  }
}

function formatUserProfile(profile: any, clientRole?: string): string {
  if (!profile) return "";
  const role = clientRole || profile.user_role || "buyer";
  const name = profile.name || "User";
  const founder = profile.founder_status ? ` (${profile.founder_status === "founder_gold" ? "Gold Founder" : "Founder"})` : "";
  return `\n\n## Current User\nName: ${name}${founder}\nRole: ${role.charAt(0).toUpperCase() + role.slice(1)}\nEmail: ${profile.email || "not provided"}`;
}

function formatNegotiations(negotiations: any[]): string {
  if (!negotiations || negotiations.length === 0) return "";
  const items = negotiations.slice(0, 5).map((n, i) => {
    const parts = [
      `**${i + 1}. ${n.property_address || "Unknown"}**`,
      n.property_price ? `   Asking: £${Number(n.property_price).toLocaleString()}` : null,
      n.max_budget ? `   Budget: £${Number(n.max_budget).toLocaleString()}` : null,
      n.status ? `   Status: ${n.status}` : null,
      n.buyer_status ? `   Position: ${n.buyer_status}` : null,
      n.ai_summary ? `   Summary: ${n.ai_summary}` : null,
    ];
    return parts.filter(Boolean).join("\n");
  });
  return `\n\n## Active Negotiations (${negotiations.length})\n\n${items.join("\n\n")}`;
}

async function retrieveContext(userMessage: string): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase.rpc("search_knowledge", {
      query_text: userMessage,
      match_count: 5,
    });

    if (error) {
      console.error("Knowledge search error:", error);
      return "";
    }

    if (!data || data.length === 0) return "";

    const context = data
      .map(
        (chunk: any) =>
          `[Source: ${chunk.source_document}${chunk.section_title ? ` — ${chunk.section_title}` : ""}]\n${chunk.content}`
      )
      .join("\n\n---\n\n");

    return `\n\n## Retrieved Knowledge Base Documents\n\n${context}`;
  } catch (e) {
    console.error("RAG retrieval error:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona, userRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch full user context (includes subscription check)
    const authHeader = req.headers.get("authorization");
    const [userCtx, ragContext] = await Promise.all([
      getUserContext(authHeader),
      (async () => {
        const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
        return lastUserMessage ? await retrieveContext(lastUserMessage.content) : "";
      })(),
    ]);

    // Select prompt based on subscription tier
    let systemContent: string;
    if (userCtx.isPaid) {
      // Full expert prompt for paid users
      const selectedPersona = PERSONAS[persona] || PERSONAS.default;
      const auditContext = formatAuditContext(userCtx.audits);
      const profileContext = formatUserProfile(userCtx.profile, userRole);
      const negContext = formatNegotiations(userCtx.negotiations);
      systemContent = selectedPersona + profileContext + auditContext + negContext + ragContext;
    } else {
      // Limited prompt for free users
      const profileContext = formatUserProfile(userCtx.profile, userRole);
      systemContent = FREE_SYSTEM_PROMPT + profileContext;
    }

    // Use cheaper model for free users
    const model = userCtx.isPaid ? "openai/gpt-5.2" : "google/gemini-3-flash-preview";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
