import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const {
      agentEmail,
      agentName,
      subject,
      body,
      propertyAddress,
      propertyUrl,
      postcode,
      senderName,
    } = await req.json();

    if (!subject || !body || !propertyAddress) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: subject, body, propertyAddress" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", userId)
      .maybeSingle();

    const userName = senderName || profile?.name || "A Humm User";

    // 1. Create the conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("negotiation_conversations")
      .insert({
        user_id: userId,
        property_address: propertyAddress,
        property_url: propertyUrl || null,
        postcode: postcode || null,
        agent_name: agentName || null,
        agent_email: agentEmail || null,
        status: "active",
      })
      .select()
      .single();

    if (convError) {
      console.error("Failed to create conversation:", convError);
      return new Response(
        JSON.stringify({ error: "Failed to create conversation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Save the outbound email to the conversation
    const emailFooter = `\n\n---\nThis email was sent on your behalf via Hummm.`;
    const fullBody = body + emailFooter;

    await supabaseAdmin.from("negotiation_emails").insert({
      conversation_id: conversation.id,
      direction: "outbound",
      sender_name: userName,
      sender_email: userEmail,
      subject,
      body: fullBody,
      ai_drafted: true,
      status: "sent",
    });

    // 3. Also save negotiate_request for dashboard tracking
    await supabaseAdmin.from("negotiate_requests").insert({
      user_id: userId,
      property_link: propertyUrl || propertyAddress,
      property_address: propertyAddress,
      postcode: postcode || null,
      goal: "buy",
      package: "starter",
      status: "submitted",
      display_name: propertyAddress,
      notes: `Email sent to ${agentName || "agent"}${agentEmail ? ` (${agentEmail})` : ""}. Conversation ID: ${conversation.id}`,
    });

    // 4. Send to agent via transactional email (if email available)
    const results: { to: string; status: string; error?: string }[] = [];

    if (agentEmail && agentEmail.includes("@")) {
      try {
        const replyToAddress = `reply-${conversation.reply_to_id}@notify.hummm.pro`;
        const fromName = `${userName} via Hummm`;
        const { error: agentSendErr } = await supabaseAdmin.functions.invoke(
          "send-transactional-email",
          {
            body: {
              templateName: "notify-contact",
              recipientEmail: agentEmail,
              idempotencyKey: `negotiation-${conversation.id}-initial`,
              templateData: {
                subject,
                name: fromName,
                email: userEmail,
                phone: "",
                message: fullBody,
              },
            },
          }
        );
        results.push({
          to: agentEmail,
          status: agentSendErr ? "failed" : "sent",
          error: agentSendErr?.message,
        });
      } catch (e) {
        results.push({ to: agentEmail, status: "failed", error: String(e) });
      }
    }

    // 5. Send copy to user
    if (userEmail) {
      try {
        const { error: userSendErr } = await supabaseAdmin.functions.invoke(
          "send-transactional-email",
          {
            body: {
              templateName: "notify-contact",
              recipientEmail: userEmail,
              idempotencyKey: `negotiation-copy-${conversation.id}-initial`,
              templateData: {
                subject: `[Copy] ${subject}`,
                name: "Hummm",
                email: "hello@hummm.pro",
                phone: "",
                message: `Here is a copy of the email sent to ${agentName || "the agent"} regarding ${propertyAddress}:\n\n---\n\n${fullBody}`,
              },
            },
          }
        );
        results.push({
          to: userEmail,
          status: userSendErr ? "failed" : "sent",
          error: userSendErr?.message,
        });
      } catch (e) {
        results.push({ to: userEmail, status: "failed", error: String(e) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: conversation.id,
        results,
        agentEmailed: !!agentEmail,
        userCopied: !!userEmail,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-agent-email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
