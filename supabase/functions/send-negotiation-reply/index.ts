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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { conversationId, subject, body } = await req.json();

    if (!conversationId || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: conversationId, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("negotiation_conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .maybeSingle();

    const userName = profile?.name || "A Humm User";
    const userEmail = claimsData.claims.email as string;

    const emailFooter = `\n\n---\nSent on behalf of ${userName} via Hummm`;
    const fullBody = body + emailFooter;

    // Save the reply email
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    await supabaseAdmin.from("negotiation_emails").insert({
      conversation_id: conversationId,
      direction: "outbound",
      sender_name: userName,
      sender_email: userEmail,
      subject: subject || `Re: ${conversation.property_address}`,
      body: fullBody,
      ai_drafted: false,
      status: "sent",
    });

    // Send to agent if email available
    if (conversation.agent_email && conversation.agent_email.includes("@")) {
      await supabaseAdmin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "notify-contact",
          recipientEmail: conversation.agent_email,
          idempotencyKey: `negotiation-reply-${conversationId}-${Date.now()}`,
          templateData: {
            subject: subject || `Re: ${conversation.property_address}`,
            name: userName,
            email: userEmail,
            phone: "",
            message: fullBody,
          },
        },
      });
    }

    // Update conversation timestamp
    await supabaseAdmin
      .from("negotiation_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-negotiation-reply error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
