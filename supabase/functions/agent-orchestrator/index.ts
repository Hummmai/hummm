import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROUTER_PROMPT = `You are the **Hummingbird Agent Orchestrator** — an intent router for hummm.pro.

You read ONE user message and decide which specialist agent should handle it. Pick exactly one:

- **sales** — lead qualification, follow-up sequences, booking strategy calls, pricing/service questions, valuation upsells, objection handling, anything about converting a user into Sell For Me / Let For Me / Negotiate For Me / In-Depth Audit / Strategy Call.
- **negotiation** — drafting offers, counter-offers, chase emails, best-and-final, viewing requests, analysing a specific property audit, editing the user's own draft, tactical advice on a live deal (buying / selling / renting / letting a specific property).
- **marketing** — LinkedIn posts, Instagram captions, Twitter/X threads, email campaigns, SEO blogs, lead magnets, ad copy, headlines, content calendars, performance analysis.

Tie-breakers:
- A specific property + price/offer → negotiation
- "Write a post / blog / email campaign / lead magnet" → marketing
- Anything about *their* leads, *their* customers, booking calls → sales

Respond with ONLY a single JSON object — no prose, no markdown fences:
{"agent":"sales"|"negotiation"|"marketing","confidence":0.0-1.0,"reason":"<8 words why>","refined_prompt":"<the user's message, rewritten as a crisp instruction for the chosen agent>"}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: ROUTER_PROMPT },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!upstream.ok) {
      // Fallback: keyword router
      return new Response(JSON.stringify(keywordFallback(message)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await upstream.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = keywordFallback(message); }
    if (!["sales", "negotiation", "marketing"].includes(parsed.agent)) {
      parsed = keywordFallback(message);
    }
    if (!parsed.refined_prompt) parsed.refined_prompt = message;
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("orchestrator error", e);
    return new Response(JSON.stringify({ error: "orchestrator failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function keywordFallback(message: string) {
  const q = message.toLowerCase();
  const score = { sales: 0, negotiation: 0, marketing: 0 };
  const bump = (k: keyof typeof score, kws: string[]) => kws.forEach(w => { if (q.includes(w)) score[k] += 1; });
  bump("negotiation", ["offer", "counter", "negotiat", "asking", "best and final", "viewing", "vendor", "chase", "audit", "fair value", "below ask"]);
  bump("marketing", ["post", "linkedin", "instagram", "blog", "seo", "campaign", "newsletter", "lead magnet", "content", "caption", "headline", "ad copy", "carousel", "email sequence"]);
  bump("sales", ["lead", "follow up", "follow-up", "qualify", "valuation", "book call", "strategy call", "convert", "sell for me", "let for me", "objection", "pricing"]);
  const best = (Object.entries(score) as [keyof typeof score, number][]).sort((a, b) => b[1] - a[1])[0];
  const agent = best[1] === 0 ? "sales" : best[0];
  return { agent, confidence: best[1] === 0 ? 0.4 : 0.75, reason: "keyword match", refined_prompt: message };
}