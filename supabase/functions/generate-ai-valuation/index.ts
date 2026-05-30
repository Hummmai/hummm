import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ValuationRequest {
  address: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  improvements: string;
  email: string;
  phone: string;
  tenure: string;
  parking: string;
  garden: string;
  garage: string;
  specialFeatures: string[];
  goal: string;
  name: string;
  country?: "UK" | "US" | "AE" | "ZA" | "EU";
}

function extractPostcode(address: string): string | null {
  const match = address.match(/([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})/i);
  if (!match) return null;
  const raw = match[1].replace(/\s+/g, "").toUpperCase();
  return raw.slice(0, -3) + " " + raw.slice(-3);
}

function detectUAE(address: string): boolean {
  return /dubai|abu\s*dhabi|sharjah|ajman|ras\s*al|fujairah|umm\s*al|jvc|jvt|palm\s*jumeirah|business\s*bay|dubai\s*marina|downtown\s*dubai|dubai\s*hills|creek\s*harbour|emaar|damac|sobha|meraas|jumeirah|deira|karama|al\s*barsha|al\s*nahda|discovery\s*gardens|dubai\s*south|arabian\s*ranches|motor\s*city|al\s*reem|saadiyat|yas\s*island|al\s*reef|al\s*ghadeer|masdar\s*city|khalifa\s*city/i.test(address);
}

function detectCurrency(address: string): { currency: string; symbol: string } {
  if (detectUAE(address)) return { currency: "AED", symbol: "AED " };
  if (/doha|lusail|the\s*pearl|west\s*bay|qatar/i.test(address)) return { currency: "QAR", symbol: "QAR " };
  return { currency: "GBP", symbol: "£" };
}

function currencyForCountry(country?: string): { currency: string; symbol: string } | null {
  switch (country) {
    case "UK": return { currency: "GBP", symbol: "£" };
    case "US": return { currency: "USD", symbol: "$" };
    case "AE": return { currency: "AED", symbol: "AED " };
    case "ZA": return { currency: "ZAR", symbol: "R" };
    case "EU": return { currency: "EUR", symbol: "€" };
    default: return null;
  }
}

function countryContextBlock(country?: string): string {
  if (country === "US") return `
## USA CONTEXT (apply for this report)
- Currency: USD ($). Closing costs (buyer): ~2–5%; (seller): ~6–10% incl. realtor commissions 5–6%.
- Property tax: state/county-specific (TX ~1.6–2.5%, CA ~0.7–1.1%, FL ~0.8–1.2%). Cite the metro.
- Capital gains: federal + state; §121 primary-residence exclusion ($250k/$500k).
- Mortgage norms: 30-yr fixed dominant; 20% down standard; PMI under 20%.
- HOA fees common in condos/townhomes — quote realistic monthly figure if applicable.
- Comparables: real US neighbourhoods/ZIP codes; reference Zillow/Redfin price norms.
`;
  if (country === "ZA") return `
## SOUTH AFRICA CONTEXT (apply for this report)
- Currency: ZAR (R). Transfer duty progressive — 0% to R1.1m, sliding to 13% over R12m.
- Bond registration + conveyancing + FICA always required.
- Capital gains: 40% inclusion rate for individuals; primary-residence R2m exclusion.
- Sectional title vs freehold — flag levies, special levies, body corporate financials.
- Suburb intelligence: cite real SA suburbs (Sea Point, Bryanston, Umhlanga, Stellenbosch, etc.).
- Yields: Cape Town 5–7%, Joburg 7–10%, Durban 7–9%. Reference Property24/Private Property norms.
- Mention load shedding/solar/borehole infra where relevant.
`;
  if (country === "EU") return `
## EU CONTEXT (apply for this report)
- Currency: EUR (€). Detect specific country (ES/PT/IT/DE/FR/NL/IE) from address and apply local rules.
  · Spain: ITP 6–10% resale + ~2% notary/registry. New build: 10% VAT + 1.5% AJD.
  · Portugal: IMT progressive to 7.5% + ~1% notary. AIMI on >€600k.
  · Italy: registration 2% (primary) / 9% (second). Notary 1–2%.
  · Germany: Grunderwerbsteuer 3.5–6.5% + ~1.5% notary + ~3.57% agent.
  · France: notary ~7–8% resale, 2–3% new build.
  · Netherlands: 2% transfer tax; first-time buyer relief <€525k.
  · Ireland: Stamp Duty 1% to €1m, 2% above.
- Yields: Lisbon/Madrid/Berlin 4–6%, Athens/Naples/Porto 6–8%, Amsterdam 3–5%.
- EPC mandatory across EU; flag rating impact on resale/lettability.
- Comparables: cite real local neighbourhoods for the city identified.
`;
  if (country === "UK") return `
## UK CONTEXT (apply for this report)
- Currency: GBP (£). Use Land Registry + Rightmove/Zoopla norms.
- SDLT 2026: 0% to £125k, 2% to £250k, 5% to £925k, 10% to £1.5m, 12% above; +3% for second homes/BTL. FTB relief to £300k (up to £500k purchase).
- Section 24 mortgage interest relief restriction for landlords.
- EPC C minimum for new rentals (2028 target).
- Renters' Rights Act: Section 21 abolition, periodic tenancies.
- Comparables: real UK street names typical for the postcode area.
`;
  return "";
}

async function callPropertyData(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
): Promise<any> {
  const url = new URL(`https://api.propertydata.co.uk/${endpoint}`);
  url.searchParams.set("key", apiKey.trim().replace(/^["']|["']$/g, ""));
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v.trim());
  }
  try {
    console.log(`PropertyData calling: ${url.toString().replace(/key=[^&]+/, "key=***")}`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`PropertyData ${endpoint} error: ${res.status} - ${errBody}`);
      return null;
    }
    const data = await res.json();
    console.log(`PropertyData ${endpoint} success: ${JSON.stringify(data).substring(0, 200)}`);
    return data;
  } catch (e) {
    console.error(`PropertyData ${endpoint} fetch error:`, e);
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callPropertyDataBatched(
  endpoints: { name: string; params: Record<string, string> }[],
  apiKey: string,
  batchSize = 3,
  delayMs = 3000
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  for (let i = 0; i < endpoints.length; i += batchSize) {
    const batch = endpoints.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((ep) => callPropertyData(ep.name, ep.params, apiKey))
    );
    batch.forEach((ep, j) => {
      results[ep.name] = batchResults[j].status === "fulfilled" ? batchResults[j].value : null;
    });
    if (i + batchSize < endpoints.length) {
      await delay(delayMs);
    }
  }
  return results;
}

// Firecrawl web search for additional comparable data
async function searchComparables(address: string, postcode: string, apiKey: string): Promise<string> {
  if (!apiKey) return "";
  try {
    const query = `${postcode} property sold prices recent 2024 2025 site:rightmove.co.uk OR site:zoopla.co.uk`;
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });
    if (!res.ok) {
      console.error("Firecrawl search error:", res.status);
      return "";
    }
    const data = await res.json();
    const snippets = (data.data || [])
      .map((r: any) => `${r.title || ""}: ${(r.markdown || r.description || "").substring(0, 500)}`)
      .join("\n\n");
    console.log(`Firecrawl found ${(data.data || []).length} results for comps`);
    return snippets ? `\n\nAdditional web research on comparable properties:\n${snippets}` : "";
  } catch (e) {
    console.error("Firecrawl search error:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ValuationRequest = await req.json();

    if (!body.address || !body.email) {
      return new Response(
        JSON.stringify({ error: "Address and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PROPERTYDATA_API_KEY = Deno.env.get("PROPERTYDATA_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: record, error: insertError } = await supabase
      .from("ai_valuations")
      .insert({
        address: body.address,
        postcode: extractPostcode(body.address),
        property_type: body.propertyType,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        sqft: body.sqft,
        unique_features: body.improvements,
        email: body.email,
        phone: body.phone,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save valuation request");
    }

    const postcode = extractPostcode(body.address);

    // Fetch property data + web comparables in parallel
    let propertyDataResults: Record<string, any> = {};
    let webComps = "";

    const fetchPromises: Promise<void>[] = [];

    if (PROPERTYDATA_API_KEY && postcode) {
      const endpoints = [
        { name: "sold-prices", params: { postcode } },
        { name: "valuation-sale", params: { postcode, bedrooms: body.bedrooms || "3", type: body.propertyType?.toLowerCase().includes("flat") ? "flat" : "house" } },
        { name: "rents", params: { postcode } },
        { name: "growth", params: { postcode } },
        { name: "demand", params: { postcode } },
        { name: "yields", params: { postcode } },
      ];
      fetchPromises.push(
        callPropertyDataBatched(endpoints, PROPERTYDATA_API_KEY, 3, 3000).then(r => { propertyDataResults = r; })
      );
    }

    if (FIRECRAWL_API_KEY && postcode) {
      fetchPromises.push(
        searchComparables(body.address, postcode, FIRECRAWL_API_KEY).then(r => { webComps = r; })
      );
    }

    await Promise.allSettled(fetchPromises);

    // Build comprehensive AI prompt
    const isUAE = detectUAE(body.address);
    const explicit = currencyForCountry(body.country);
    const detected = detectCurrency(body.address);
    const { currency, symbol } = explicit || detected;
    const COUNTRY_CONTEXT = countryContextBlock(body.country);

    const UAE_DEEP_BLOCK = isUAE ? `
YOU ARE NOW OPERATING AS THE WORLD'S BEST UAE PROPERTY VALUATION EXPERT (2026 DATA).

UAE-SPECIFIC CRITICAL REQUIREMENTS — APPLY ALL OF THESE:

## Transaction Costs (2026 Verified)
- DLD Transfer Fee: 4% of purchase price (split 50/50 buyer/seller by convention, but negotiable)
- DLD Admin Fee: AED 580
- Title Deed Issuance: AED 4,200
- Abu Dhabi Transfer Fee: 2% of purchase price
- Agent Commission: Typically 2% + 5% VAT on commission
- Mortgage Registration: 0.25% of loan amount + AED 290
- NO annual property tax — only 5% housing/municipality fee on annual rent (paid by tenant via DEWA bill)
- NO capital gains tax, NO income tax, NO rental income tax
- Oqood Registration (off-plan): 4% of purchase price to DLD

## Golden Visa Eligibility — ALWAYS CHECK AND FLAG
- AED 2,000,000+ property = 10-year Golden Visa (renewable, includes family)
- AED 750,000+ property = 2-year investor visa
- Off-plan from approved developers may qualify (check DLD golden visa list)
- Multiple properties can be combined to reach AED 2M threshold
- Property must be retained (not sold) during visa validity

## Rental Yield Benchmarks (2026 H1 — cite these)
- JVC/JVT: 7.5–9.5% gross (studios/1BR highest)
- Dubai South / Expo City: 7–9%
- International City / Discovery Gardens: 8–10%
- Business Bay: 6–7.5%
- Dubai Marina: 5.5–6.5%
- Downtown Dubai: 4.5–5.5%
- Dubai Hills Estate: 5.5–7%
- Palm Jumeirah: 4–6% (villas lower, apartments higher)
- Al Reem Island (Abu Dhabi): 6.5–8.5%
- Yas Island (Abu Dhabi): 6–7.5%
- Saadiyat Island (Abu Dhabi): 5–6.5%
- Al Reef / Al Ghadeer: 7–8.5%
- Masdar City: 6.5–8%

## Service Charges (AED/sq ft — 2026 RERA Index)
- JVC: 12–18 | Dubai Marina: 15–22 | Downtown: 18–30 | Palm Jumeirah: 20–40
- Business Bay: 14–22 | Dubai Hills: 13–20 | Creek Harbour: 15–22
- Abu Dhabi towers: 12–20 | Abu Dhabi villas: 3–8
- District cooling (Empower/Emicool): Additional AED 5,000–15,000/year for apartments
- DEWA typical: AED 500–1,500/month (apartment), AED 1,500–4,000/month (villa)

## Developer Reputation Tiers (reference in analysis)
- Tier 1 (Premium): Emaar, Meraas, ALDAR (Abu Dhabi), Mubadala
- Tier 2 (Established): DAMAC, Sobha, Nakheel, Dubai Properties, Ellington, Select Group
- Tier 3 (Growing): Omniyat, Binghatti, Samana, Danube, Azizi, Tiger
- Red flags: Repeated delays, quality complaints, financial instability — flag any concerns

## Off-Plan vs Ready Analysis
- Off-plan: Lower entry price (10–30% below ready), payment plan advantage, but completion risk, no immediate rental income, potential spec changes
- Ready: Immediate rental income, what-you-see-is-what-you-get, mortgage available, but higher entry price
- For off-plan: ALWAYS check RERA project registration, Oqood status, escrow account compliance, developer track record

## Neighbourhood Intelligence — Abu Dhabi Specific
- Al Reem Island: High-rise living, excellent connectivity, Boutik Mall, schools nearby, 6.5–8.5% yields
- Saadiyat Island: Cultural district (Louvre, Guggenheim coming), beach access, premium positioning
- Yas Island: Entertainment hub (Ferrari World, Yas Mall, F1 circuit), strong rental demand
- Al Reef/Al Ghadeer: Affordable community living, villa clusters, family-friendly
- Masdar City: Sustainable city, growing tech hub, university proximity
- Khalifa City: Established community, good schools, reasonable pricing

## Neighbourhood Intelligence — Dubai Specific  
- Dubai Marina/JBR: Waterfront lifestyle, Walk, Beach, tram connected, tourist rental potential
- Downtown: Burj Khalifa, Dubai Mall, premium address, highest per-sqft prices
- JVC/JVT: Affordable, high yields, family-friendly, growing infrastructure
- Dubai Hills: Golf course community, Dubai Hills Mall, Emaar quality, strong capital appreciation
- Business Bay: CBD adjacent, canal views, high occupancy rates
- Creek Harbour: Emerging waterfront, Dubai Creek Tower (under construction), Emaar development
- Palm Jumeirah: Iconic, ultra-premium, lower yields but strong capital preservation
- Dubai South / Expo City: Near Al Maktoum Airport expansion, future growth corridor, affordable entry
- Tilal Al Ghaf: Premium villa community by Majid Al Futtaim, lagoon lifestyle

## Future Development Impact (2026+)
- Al Maktoum International Airport expansion (world's largest) — massive uplift for Dubai South
- Dubai Metro Blue Line — new connectivity for underserved areas
- Palm Jebel Ali revival — potential long-term play
- Dubai Islands (formerly Deira Islands) — new waterfront district
- Etihad Rail — Abu Dhabi-Dubai connectivity, impacts suburban areas
- Dubai 2040 Urban Master Plan — 60% of land for green/leisure, densification of key corridors

## RERA/Ejari Compliance
- Ejari: Mandatory tenancy registration (AED 220 fee via app)
- RERA Rental Index: Annual increase cap based on RERA calculator (0–20% based on gap vs market)
- Trakheesi: Holiday home permit required for short-term rentals
- DLD Smart Services / Dubai REST app for all registrations

## Report Currency
All values MUST be in AED. Use "AED" prefix for all monetary values.

## Report Quality Standard
This report must be MORE comprehensive and actionable than anything from PropertyFinder, Bayut, or a traditional UAE estate agent. Include practical buying advice specific to the community.
` : "";

    const systemPrompt = `You are Hummm — the world's most advanced residential property valuation expert, capable of passing real estate licensing exams in 14 jurisdictions: UK (RICS APC), USA (state licensing), Singapore (CEA), Germany (IHK), UAE (RERA), Qatar (RERA Qatar), South Africa (EAAB), Spain, Italy, Portugal, Switzerland, Sweden, Norway, and Denmark.

You combine the analytical rigour of a RICS-qualified chartered surveyor with deep knowledge of:
- Property law, tenancy legislation, and consumer protection across all 14 markets
- Tax regimes: SDLT, capital gains, rental income tax, inheritance tax, transfer duties, VAT
- Mortgage/lending landscapes, interest rate sensitivity, and affordability modelling
- Planning regulations, conservation areas, listed buildings, zoning laws per jurisdiction
- AML/KYC requirements, regulatory bodies (RICS, ARLA, CEA, RERA, RERA Qatar, REBOSA, API, IVD)
- Case law precedents affecting valuations and transactions
${UAE_DEEP_BLOCK}
${COUNTRY_CONTEXT}
ARABIC CAPABILITY: If the address or context suggests an Arabic-speaking market (UAE, Qatar), you may include key terms in Arabic where helpful, but reports should be in English unless specifically requested in Arabic.

Your tone: "With Hummm, you are the property expert" — friendly, empowering, and data-driven.

Your goal: produce the most comprehensive, accurate and insightful property valuation report ever seen by a consumer. Your output must be MORE useful than anything from Rightmove, Zoopla, PropertyFinder, Bayut, or a traditional estate agent.

CRITICAL RULES:
1. NEVER fabricate data. If you don't have a data point, set it to null and explain why.
2. Use ONLY the PropertyData API results + web research provided. Supplement with your knowledge of property markets for context and analysis.
3. All prices in ${currency}. Use realistic figures consistent with the area.
4. Comparables must be realistic addresses for the area — use real street names typical for this location.
5. Show your reasoning. For every number, explain what data sources informed it.
6. Be specific about risks and opportunities — generic advice is worthless.
${isUAE ? '7. For UAE properties: ALWAYS include Golden Visa eligibility, DLD fee breakdown, service charge analysis, developer reputation assessment, and off-plan vs ready comparison where relevant.\n8. For UAE: Include RERA compliance flags, Ejari requirements, and practical buying advice.' : ''}

Output ONLY valid JSON (no markdown, no code fences) with ALL these sections:

{
  "valuation_range": {"low": number, "high": number, "confidence_percentage": number, "methodology": "string explaining how you arrived at this range"},
  "headline_valuation": "string e.g. ${symbol}428,000 – ${symbol}442,000",
  "property_summary": {"address": "string", "type": "string", "beds": number, "baths": number, "sqft": number|null, "tenure": "string|null", "epc_rating": "string|null", "council_tax_band": "string|null", "year_built_estimate": "string|null"},
  "comparables": [{"address": "string", "sold_price": number, "date": "string", "distance": "string", "beds": number, "type": "string", "adjustment": "string explaining why price differs", "sale_to_ask_ratio": "string e.g. 97%", "data_source": "Land Registry|DLD|estimated"}],
  "why_better": {"rightmove_estimate": "string", "rightmove_issue": "string", "zoopla_estimate": "string", "zoopla_issue": "string", "our_estimate": "string", "our_advantage": "string"},
  "renovation_simulator": [{"label": "string", "min_cost": number, "max_cost": number, "min_uplift": number, "max_uplift": number}],
  "market_momentum": {"trend": "string", "prediction": "string", "reasoning": "string", "growth_6m": "string", "growth_12m": "string", "supply_demand": "string describing current supply vs demand balance"},
  "area_insights": {
    "schools": {"rating": "string", "detail": "string", "ofsted_summary": "string"},
    "transport": {"zone": "string", "detail": "string", "nearest_station": "string", "commute_to_city_centre": "string"},
    "crime": {"level": "string", "detail": "string"},
    "flood_risk": {"level": "Low|Medium|High", "detail": "string", "zone": "string"},
    "demographics": {"summary": "string"},
    "future_developments": "string describing any known local developments or planning",
    "buyer_demand": {"level": "string", "detail": "string"},
    "avg_days_listed": "string",
    "energy_rating": "string",
    "council_tax_band": "string",
    "broadband": "string average speed estimate"
  },
  "rental_yield": {"monthly_rent": "string", "weekly_rent": "string", "annual_rent": "string", "gross_yield": "string percentage", "net_yield": "string percentage after service charges and maintenance", "annual_yield": "string percentage", "strategy": "string", "rent_period_source": "estimated"},
  "buyer_psychology": {"demand_level": "string", "ideal_buyer_profile": "string", "pricing_strategy": "string", "summary": "string"},
  "investment_analysis": {
    "roi_5_year": "string estimated 5-year return",
    "capital_growth_forecast": "string",
    "rental_vs_sale": "string which is better and why",
    "stamp_duty": number,
    "stamp_duty_breakdown": "string",
    "total_purchase_costs": "string estimated total including transfer fees, legal, agent commission",
    "net_yield_after_costs": "string"${isUAE ? `,
    "golden_visa_eligible": "boolean — true if property value meets AED 2M threshold",
    "golden_visa_details": "string — visa type, duration, family inclusion, requirements",
    "dld_fee_breakdown": "string — itemised DLD fees",
    "service_charge_annual": "string — estimated annual service charge",
    "dewa_monthly_estimate": "string — estimated monthly DEWA costs",
    "district_cooling_annual": "string — if applicable"` : ''}
  },
  "risks": ["string - specific risk with explanation"],
  "opportunities": ["string - specific opportunity with explanation"],
  "leasehold_analysis": {"is_leasehold": boolean, "years_remaining": number|null, "ground_rent": "string|null", "service_charge": "string|null", "risk_level": "string|null", "notes": "string|null"},
  "local_market_context": {
    "street_insights": "string — character and price trends of this specific street/community",
    "neighbourhood_profile": "string — demographics, lifestyle, reputation",
    "transport_accessibility": "string — stations, bus routes, commute times${isUAE ? ', Metro stations, tram, RTA bus' : ''}",
    "amenities": "string — shops, parks, restaurants, healthcare nearby",
    "regulatory_context": "string — planning, conservation, rent controls, upcoming law changes${isUAE ? ', RERA compliance, Ejari, community rules' : ''}",
    "tax_implications": "string — ${isUAE ? 'DLD fees, zero tax advantages, 5% housing fee, mortgage registration' : 'stamp duty calc, CGT, rental tax, reliefs available'}",
    "practical_advice": "string — parking, noise, broadband, insurance, seasonal factors${isUAE ? ', district cooling, DEWA, building management quality, community rules' : ''}"
  },
  "data_confidence": {
    "overall": "High|Medium|Low",
    "comparable_quality": "string",
    "data_recency": "string",
    "limitations": ["string"]
  }
}

Aim for 8-12 comparables. For area insights, be specific to the location, not generic. Always include the local_market_context section with street-level granularity.${isUAE ? ' For UAE: Make this the most detailed, actionable property report the user has ever received. Include Golden Visa analysis, developer assessment, service charge benchmarking, and practical community advice.' : ''}`;

    const userPrompt = `Generate the most comprehensive property valuation report possible for:

Address: ${body.address}
Property Type: ${body.propertyType || "Not specified"}
Bedrooms: ${body.bedrooms || "Not specified"}
Bathrooms: ${body.bathrooms || "Not specified"}
Size: ${body.sqft || "Not specified"} sq ft
Tenure: ${body.tenure || "Not specified"}
Parking: ${body.parking || "Not specified"}
Garden: ${body.garden || "Not specified"}
Garage: ${body.garage || "Not specified"}
Special Features: ${body.specialFeatures?.join(", ") || "None specified"}
Improvements: ${body.improvements || "None specified"}
Owner's Goal: ${body.goal || "Not specified"}

${Object.keys(propertyDataResults).length > 0 ? `\n=== PROPERTYDATA API RESULTS (REAL DATA — USE THIS AS PRIMARY SOURCE) ===\n${JSON.stringify(propertyDataResults, null, 2)}` : "No PropertyData API results available — use your expert knowledge for this postcode area."}
${webComps ? `\n=== WEB RESEARCH ON COMPARABLE PROPERTIES ===\n${webComps}` : ""}

IMPORTANT: Base your valuation primarily on the PropertyData API sold prices and valuation data above. Cross-reference with the web research. If data conflicts, favour PropertyData API as it sources from Land Registry.`;

    // Use the most powerful model for accuracy
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.2",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    let reportJson: any;
    try {
      const cleaned = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      reportJson = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", aiContent.substring(0, 500));
      throw new Error("Failed to generate valuation report");
    }

    // Ensure valuation range is always populated
    const valLow = reportJson.valuation_range?.low || 0;
    const valHigh = reportJson.valuation_range?.high || 0;
    const confidence = reportJson.valuation_range?.confidence_percentage || reportJson.data_confidence?.overall === "High" ? 85 : 70;

    await supabase
      .from("ai_valuations")
      .update({
        valuation_low: valLow,
        valuation_high: valHigh,
        confidence: confidence,
        report_json: reportJson,
        status: "complete",
      })
      .eq("id", record.id);

    return new Response(
      JSON.stringify({
        id: record.id,
        report: reportJson,
        address: body.address,
        // Phase 4.5: Aligning with shared AuditData shape (see src/types/audit.ts)
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Valuation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
