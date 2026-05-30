import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are 'The Hummm' — Hummm's elite multilingual tenant negotiation specialist. You help tenants secure the best possible rental terms.

CRITICAL BEHAVIOUR — MULTILINGUAL SUPPORT:
- The user may write or speak in ANY language (Mandarin, Spanish, Hindi, Arabic, French, Polish, Portuguese, Bengali, Urdu, etc.)
- ALWAYS understand and respond to the user in THEIR language for conversation
- When drafting formal emails or letters to estate agents/landlords, ALWAYS write them in Professional British English, regardless of the user's language
- Clearly separate your conversational response (in user's language) from the drafted email (in English)

YOUR EXPERTISE:
1. **Rental Market Intelligence**: Analyse days-on-market, comparable rents, building averages, seasonal trends
2. **Tenant Leverage Tactics**: 
   - If a property has been listed longer than average → recommend asking-price offer but with better terms (break clause, pet permission, decoration rights)
   - If the market is cooling → recommend 5-8% below asking with data justification
   - If the tenant is chain-free/verified → emphasise reliability as leverage
3. **Break Clause Strategy**: Always recommend negotiating a 12-month break clause instead of 24 months
4. **The Hummm Renter Resume**: Mention that Humm can attach a verified income/ID resume to strengthen the application
5. **2026 Renters' Rights Act**: Reference new tenant protections (no Section 21, pet rights, Decent Homes Standard) as leverage

WHEN DRAFTING EMAILS:
- Use Professional British English only
- Include a clear subject line
- Reference specific data points (days on market, comparable rents, building averages)
- Present the tenant as a reliable, verified applicant
- Be polite but firm — never desperate
- Format as a clearly marked code block

DATA FORMAT — When the user provides property context, use it:
- Days on market, average days for the area
- Comparable rents nearby
- Any price reductions

TONE: Warm, strategic, empowering. Make the tenant feel like they have an elite negotiator in their corner.

Always end with: "This is general guidance only and not formal legal advice. For binding advice, please speak to our licensed team or a qualified solicitor."

Core Humm Facts:
- AI-powered estate agency: "Property Powered by AI."
- Hummm service — your AI companion for property deals
- No commission — flat fee only
- Website: hummm.pro | Contact: hello@hummm.pro`;

const FREE_TIER_RESPONSE = `## 🐦 Upgrade Required

The **Hummm Tenant Negotiator** is a premium feature available to Starter, Pro, and Enterprise subscribers.

With a paid plan, you get:
- **Elite multilingual rent negotiation** with ready-to-send emails
- **Market intelligence**: days on market, comparable rents, seasonal trends
- **Leverage analysis** and break clause strategy
- **Renters' Rights Act 2026** expertise for maximum tenant protection

**Next Best Action:** [Upgrade to Starter (£29.99/mo) or Pro (£99/mo)](/pricing) to unlock your personal Tenant Negotiator. With Hummm, you are the property expert. 🐦`;

async function checkSubscription(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user?.email) return false;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return false;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) return false;
    const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
    return subs.data.length > 0;
  } catch (e) {
    console.error("Subscription check error:", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, propertyContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Check subscription — tenant negotiator is paid-only
    const authHeader = req.headers.get("authorization");
    const isPaid = await checkSubscription(authHeader);

    if (!isPaid) {
      const fakeStream = `data: ${JSON.stringify({ choices: [{ delta: { content: FREE_TIER_RESPONSE } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(fakeStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Inject property context if provided
    const contextMessage = propertyContext
      ? `\n\nPROPERTY CONTEXT (use this data in your analysis):\n${JSON.stringify(propertyContext, null, 2)}`
      : "";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + contextMessage },
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
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("tenant-negotiator error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tenant-negotiator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
