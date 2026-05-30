import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, reason } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check if request already exists
    const { data: existing } = await supabaseAdmin
      .from('early_access_requests')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: existing.status === 'approved' 
          ? 'You already have access! Check your email for your access code.' 
          : 'Your request is already being reviewed.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Insert new request
    const { data: request, error: insertError } = await supabaseAdmin
      .from('early_access_requests')
      .insert({
        name: name?.trim() || null,
        email: email.toLowerCase().trim(),
        reason: reason?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // Build signed, time-limited grant access URL (HMAC)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const signingKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    const payload = `${request.id}.${exp}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
    const sig = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
    const grantUrl = `${supabaseUrl}/functions/v1/grant-access?request_id=${request.id}&exp=${exp}&sig=${sig}`

    // Send admin notification email via transactional email
    const { error: emailError } = await supabaseAdmin.functions.invoke('send-transactional-email', {
      body: {
        template_name: 'notify-access-request',
        to: 'hello@hummm.pro',
        subject: `🔔 New Early Access Request from ${name || email}`,
        params: {
          name: name || 'Not provided',
          email: email.toLowerCase().trim(),
          reason: reason || 'Not provided',
          grant_url: grantUrl,
        },
        idempotency_key: `access-request-${request.id}`,
        purpose: 'transactional',
      },
    })

    if (emailError) {
      console.error('Email notification error:', emailError)
    }

    return new Response(JSON.stringify({ success: true, message: 'Your request has been submitted! We\'ll review it shortly.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Request access error:', error)
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
