import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface PropertyInput {
  url?: string;
  address?: string;
  askingPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  notes?: string;
}

interface PreviousEmail {
  direction: 'outbound' | 'inbound';
  subject?: string;
  body: string;
  sentAt?: string;
}

interface ReqBody {
  role: 'buyer' | 'seller' | 'renter' | 'landlord';
  goal: string;
  instructions?: string;
  tone?: 'polite' | 'professional' | 'firm' | 'assertive';
  userName?: string;
  agentName?: string;
  properties: PropertyInput[];
  previousEmails?: PreviousEmail[];
}

const toneGuidance: Record<string, string> = {
  polite: 'Warm, courteous, and deferential. Soft language ("would it be possible", "kindly", "I appreciate"). Open with thanks, close warmly.',
  professional: 'Balanced, business-like, neutral. Clear, confident, no fluff. Use measured language and concrete reasoning.',
  firm: 'Direct and decisive without being rude. State position clearly, justify with evidence, set a clear next step or deadline.',
  assertive: 'Confident, slightly forceful. Lead with the position, use loss-aversion and scarcity, push for a decision with a tight deadline.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as ReqBody;
    if (!body?.goal || !Array.isArray(body?.properties) || body.properties.length === 0) {
      return new Response(JSON.stringify({ error: 'goal and at least one property are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tone = body.tone ?? 'professional';
    const userName = body.userName?.trim() || 'the client';
    const role = body.role || 'buyer';
    const isMulti = body.properties.length > 1;

    const propertyBlock = body.properties.map((p, i) => {
      const lines = [`Property ${i + 1}:`];
      if (p.address) lines.push(`  Address: ${p.address}`);
      if (p.url) lines.push(`  Link: ${p.url}`);
      if (p.askingPrice) lines.push(`  Asking price: £${p.askingPrice.toLocaleString()}`);
      if (p.bedrooms) lines.push(`  Bedrooms: ${p.bedrooms}`);
      if (p.propertyType) lines.push(`  Type: ${p.propertyType}`);
      if (p.notes) lines.push(`  Notes: ${p.notes}`);
      return lines.join('\n');
    }).join('\n\n');

    const history = (body.previousEmails ?? []).slice(-8).map((e) => {
      const who = e.direction === 'outbound' ? `YOU (${userName})` : `AGENT${body.agentName ? ` (${body.agentName})` : ''}`;
      return `--- ${who}${e.subject ? ` | Subject: ${e.subject}` : ''} ---\n${e.body}`;
    }).join('\n\n');

    const system = `You are Hummingbird AI — the UK's sharpest property negotiation strategist. You represent the ${role}.

RESPONSE TONE: ${tone.toUpperCase()} — ${toneGuidance[tone]}

You MUST return a single structured JSON response with EXACTLY four parts:
1. situationSummary — 2-3 sentence read of where the negotiation stands right now.
2. strategyOptions — exactly 3 distinct options the user could take. Each has { label, summary, rationale }.
3. recommendedEmail — a ready-to-send draft { subject, body }. The body must:
   - Sound like a real human wrote it (not a template).
   - Open by addressing the recipient by role (Dear ${body.agentName || 'Sir/Madam'}).
   - Use the user's first name in the sign-off.
   - Reference specific property details (address, asking price, days on market, bedrooms) — never use generic placeholders.
   ${isMulti ? '- Cover all listed properties in a single email, treating them as a portfolio enquiry / multi-offer.' : ''}
   - Match the requested tone precisely.
   - 150-260 words, British English, no markdown.
4. nextMove — one concrete action the user should take after sending (e.g. "Wait 48 hours, then follow up with a phone call if no reply").

Use any prior conversation history to stay coherent: do not repeat openings, acknowledge prior replies, and progress the negotiation forward.`;

    const user = `Negotiation brief:
- User role: ${role}
- User name: ${userName}
- Goal: ${body.goal}
- Special instructions: ${body.instructions || 'none'}
- Agent: ${body.agentName || 'unknown'}

Properties (${body.properties.length}):
${propertyBlock}

${history ? `Previous emails in this negotiation:\n${history}\n` : 'No prior emails yet — this is the opening message.'}

Return the JSON now.`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'return_negotiation_plan',
            description: 'Return the structured 4-part negotiation plan',
            parameters: {
              type: 'object',
              properties: {
                situationSummary: { type: 'string' },
                strategyOptions: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      summary: { type: 'string' },
                      rationale: { type: 'string' },
                    },
                    required: ['label', 'summary', 'rationale'],
                    additionalProperties: false,
                  },
                },
                recommendedEmail: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    body: { type: 'string' },
                  },
                  required: ['subject', 'body'],
                  additionalProperties: false,
                },
                nextMove: { type: 'string' },
              },
              required: ['situationSummary', 'strategyOptions', 'recommendedEmail', 'nextMove'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'return_negotiation_plan' } },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('[negotiation-strategy] AI error', r.status, txt);
      const status = r.status === 429 ? 429 : r.status === 402 ? 402 : 502;
      return new Response(JSON.stringify({ error: 'AI failed', status: r.status }), {
        status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await r.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: 'AI did not return a plan' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[negotiation-strategy] fatal', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});