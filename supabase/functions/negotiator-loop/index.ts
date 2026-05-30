import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface Turn { direction: 'in' | 'out'; body: string; sent_at?: string }
interface ReqBody {
  property_address?: string;
  asking_price?: number;
  fair_value?: number;
  target_price?: number;
  current_offer?: number;
  currency?: string;
  agent_name?: string;
  buyer_or_renter?: 'buyer' | 'renter' | 'seller' | 'landlord';
  history: Turn[];
  latest_agent_reply: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const b = await req.json() as ReqBody;
    if (!b?.latest_agent_reply || typeof b.latest_agent_reply !== 'string') {
      return new Response(JSON.stringify({ error: 'latest_agent_reply required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cur = b.currency || 'GBP';
    const fmt = (n?: number) => n ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n) : '—';
    const role = b.buyer_or_renter || 'buyer';

    const transcript = (b.history || []).map(t =>
      `${t.direction === 'in' ? 'AGENT' : 'YOU'}: ${t.body}`
    ).join('\n\n');

    const system = `You are Hummingbird AI — the world's sharpest property negotiation strategist. You represent the ${role}.

Context:
- Property: ${b.property_address || 'unspecified'}
- Asking price: ${fmt(b.asking_price)}
- Hummingbird fair value: ${fmt(b.fair_value)}
- User's target price: ${fmt(b.target_price)}
- User's current offer: ${fmt(b.current_offer)}
- Agent: ${b.agent_name || 'unknown'}

Use world-class sales/negotiation tactics: anchoring, mirroring, calibrated questions, loss-aversion, BATNA, deferred concessions. Always polite, never rude. Always include a clear next step and a soft deadline.

Return STRICT JSON only with this exact shape:
{
  "sentiment": "warm" | "neutral" | "firm" | "hostile" | "stalling",
  "agent_position_summary": string (1-2 sentences),
  "recommended_offer": number | null,
  "recommended_target_explanation": string (1 sentence),
  "next_move": "hold" | "small_increase" | "concede" | "walk_away" | "request_info",
  "drafts": [
    { "label": "Hold firm", "tone": "calm and confident", "body": string },
    { "label": "Balanced counter", "tone": "collaborative", "body": string },
    { "label": "Final push", "tone": "decisive with deadline", "body": string }
  ]
}

Each draft body should be a complete email-style reply (3-6 short paragraphs), signed as the user, addressed to the agent. Do not include subject lines. No markdown.`;

    const user = `Conversation so far:\n${transcript || '(no prior turns)'}\n\nLATEST AGENT REPLY TO ANALYSE AND RESPOND TO:\n"""${b.latest_agent_reply}"""\n\nReturn the JSON now.`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('[negotiator-loop] AI error', r.status, txt);
      return new Response(JSON.stringify({ error: 'AI failed', status: r.status }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content || '{}';
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { error: 'parse_failed', raw }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[negotiator-loop] fatal', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});