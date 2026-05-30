import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// This webhook receives inbound emails routed via the email provider
// Agent replies to reply-{id}@notify.hummm.pro are captured here
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Parse inbound email webhook payload
    // Format depends on email provider (Mailgun, etc.)
    const contentType = req.headers.get("content-type") || "";
    let payload: any;

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      payload = await req.json().catch(() => ({}));
    }

    // ----------------------------------------------------------------
    // SECURITY: Verify Mailgun webhook signature (fail-closed).
    // Requires MAILGUN_WEBHOOK_SIGNING_KEY secret. Without it, all
    // inbound requests are rejected to prevent forged "agent replies".
    // ----------------------------------------------------------------
    const signingKey = Deno.env.get("MAILGUN_WEBHOOK_SIGNING_KEY");
    if (!signingKey) {
      console.error("MAILGUN_WEBHOOK_SIGNING_KEY not configured; rejecting inbound email.");
      return new Response(JSON.stringify({ error: "Webhook signing key not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timestamp = (payload["timestamp"] || payload["X-Mailgun-Timestamp"] || "").toString();
    const token = (payload["token"] || payload["X-Mailgun-Token"] || "").toString();
    const signature = (payload["signature"] || payload["X-Mailgun-Signature"] || "").toString();

    if (!timestamp || !token || !signature) {
      return new Response(JSON.stringify({ error: "Missing signature fields" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reject stale requests (>5 min) to mitigate replay
    const tsNum = parseInt(timestamp, 10);
    if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
      return new Response(JSON.stringify({ error: "Stale timestamp" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(signingKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(timestamp + token),
    );
    const expected = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    let diff = expected.length ^ signature.length;
    for (let i = 0; i < expected.length && i < signature.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (diff !== 0) {
      console.error("Invalid Mailgun signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract reply-to ID from recipient address
    const recipient = payload.recipient || payload.To || payload.to || "";
    const replyMatch = recipient.match(/reply-([a-f0-9]+)@/i);

    if (!replyMatch) {
      console.log("No reply ID found in recipient:", recipient);
      return new Response(JSON.stringify({ status: "ignored", reason: "no reply ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const replyToId = replyMatch[1];

    // Find conversation by reply_to_id
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("negotiation_conversations")
      .select("*")
      .eq("reply_to_id", replyToId)
      .single();

    if (convError || !conversation) {
      console.log("Conversation not found for reply_to_id:", replyToId);
      return new Response(JSON.stringify({ status: "ignored", reason: "conversation not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract email content
    const senderName = payload["sender"] || payload["from"] || payload["From"] || "Agent";
    const senderEmail = payload["sender"] || payload["from"] || payload["From"] || "";
    const subject = payload["subject"] || payload["Subject"] || `Re: ${conversation.property_address}`;
    const body = payload["stripped-text"] || payload["body-plain"] || payload["text"] || payload["body"] || payload["Body"] || "";

    if (!body.trim()) {
      return new Response(JSON.stringify({ status: "ignored", reason: "empty body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save the inbound email
    await supabaseAdmin.from("negotiation_emails").insert({
      conversation_id: conversation.id,
      direction: "inbound",
      sender_name: senderName,
      sender_email: senderEmail,
      subject,
      body: body.trim(),
      ai_drafted: false,
      status: "received",
    });

    // Update conversation timestamp
    await supabaseAdmin
      .from("negotiation_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    console.log(`Inbound email saved for conversation ${conversation.id}`);

    return new Response(JSON.stringify({ status: "ok", conversationId: conversation.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("inbound-email-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
