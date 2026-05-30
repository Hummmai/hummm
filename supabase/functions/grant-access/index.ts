import { createClient } from 'npm:@supabase/supabase-js@2'

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'HUMM-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const requestId = url.searchParams.get('request_id')
  const exp = url.searchParams.get('exp')
  const sig = url.searchParams.get('sig')

  if (!requestId || !exp || !sig) {
    return new Response(htmlPage('Error', 'Invalid or missing link parameters.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Verify HMAC signature and expiry
  const expNum = parseInt(exp, 10)
  if (!Number.isFinite(expNum) || Date.now() / 1000 > expNum) {
    return new Response(htmlPage('Link Expired', 'This approval link has expired. Please generate a new one.'), {
      status: 401,
      headers: { 'Content-Type': 'text/html' },
    })
  }
  const signingKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${requestId}.${exp}`))
  const expected = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
  // Constant-time-ish compare
  if (expected.length !== sig.length) {
    return new Response(htmlPage('Unauthorized', 'Invalid signature.'), { status: 401, headers: { 'Content-Type': 'text/html' } })
  }
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  if (diff !== 0) {
    return new Response(htmlPage('Unauthorized', 'Invalid signature.'), { status: 401, headers: { 'Content-Type': 'text/html' } })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the request
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('early_access_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !request) {
      return new Response(htmlPage('Not Found', 'This access request was not found.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    if (request.status === 'approved') {
      return new Response(htmlPage('Already Approved', `This request from <strong>${request.email}</strong> has already been approved with code: <strong>${request.access_code}</strong>`), {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Generate access code and approve
    const accessCode = generateAccessCode()
    const { error: updateError } = await supabaseAdmin
      .from('early_access_requests')
      .update({ status: 'approved', access_code: accessCode })
      .eq('id', requestId)

    if (updateError) throw updateError

    // Send approval email to the user
    const { error: emailError } = await supabaseAdmin.functions.invoke('send-transactional-email', {
      body: {
        template_name: 'access-granted',
        to: request.email,
        subject: '🎉 You\'ve been granted access to Hummm!',
        params: {
          name: request.name || 'there',
          access_code: accessCode,
          site_url: 'https://hummm.pro/access-code',
        },
        idempotency_key: `access-granted-${requestId}`,
        purpose: 'transactional',
      },
    })

    if (emailError) {
      console.error('Email send error:', emailError)
    }

    return new Response(htmlPage(
      '✅ Access Granted!',
      `<strong>${request.name || request.email}</strong> has been approved.<br/><br/>
       Access Code: <strong style="font-size:24px;letter-spacing:4px;color:#2dd4a8">${accessCode}</strong><br/><br/>
       An email with the access code has been sent to <strong>${request.email}</strong>.`
    ), {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('Grant access error:', error)
    return new Response(htmlPage('Error', 'Something went wrong. Please try again.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
})

function htmlPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} | Hummm</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #0a1628; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #131d33; border: 1px solid rgba(45,212,168,0.2); border-radius: 24px; padding: 48px; max-width: 480px; text-align: center; }
    h1 { color: #2dd4a8; margin: 0 0 16px; font-size: 28px; }
    p { line-height: 1.7; color: #94a3b8; font-size: 15px; }
    strong { color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${body}</p>
  </div>
</body>
</html>`
}
