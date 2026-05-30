import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Nurture cron — runs hourly. For each user who completed a valuation or
 * deep audit but has NOT purchased Negotiate-For-Me or subscribed to Pro:
 *   - 24h after the trigger event → send "nurture-negotiate-24h"
 *   - 72h after the trigger event → send "nurture-negotiate-72h"
 *
 * Dedup is enforced via `revenue_followup_log` unique constraint.
 */

const TRIGGER_EVENTS = ["valuation_completed", "deep_audit_completed"];
const CONVERT_EVENTS = ["negotiate_purchased", "pro_subscribed"];

type Stage = "nurture_24h" | "nurture_72h";

interface CandidateRow {
  id: string;
  email: string;
  property_address: string | null;
  event_type: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const summary: Record<string, number> = { nurture_24h: 0, nurture_72h: 0, skipped: 0, errors: 0 };

  for (const stage of ["nurture_24h", "nurture_72h"] as Stage[]) {
    const hoursMin = stage === "nurture_24h" ? 24 : 72;
    const hoursMax = stage === "nurture_24h" ? 48 : 96; // 24h window

    const since = new Date(Date.now() - hoursMax * 3600 * 1000).toISOString();
    const before = new Date(Date.now() - hoursMin * 3600 * 1000).toISOString();

    const { data: candidates, error } = await supabase
      .from("revenue_events")
      .select("id,email,property_address,event_type,created_at")
      .in("event_type", TRIGGER_EVENTS)
      .not("email", "is", null)
      .gte("created_at", since)
      .lte("created_at", before)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[followup-cron] query error", error.message);
      summary.errors++;
      continue;
    }

    // De-dupe to most-recent trigger per email
    const byEmail = new Map<string, CandidateRow>();
    for (const c of (candidates ?? []) as CandidateRow[]) {
      if (!byEmail.has(c.email)) byEmail.set(c.email, c);
    }

    for (const c of byEmail.values()) {
      try {
        // Skip if user already converted (any time)
        const { data: converted } = await supabase
          .from("revenue_events")
          .select("id")
          .eq("email", c.email)
          .in("event_type", CONVERT_EVENTS)
          .limit(1)
          .maybeSingle();
        if (converted) { summary.skipped++; continue; }

        // Skip if already sent this stage for this event
        const { data: already } = await supabase
          .from("revenue_followup_log")
          .select("id")
          .eq("email", c.email)
          .eq("stage", stage)
          .eq("related_event_id", c.id)
          .maybeSingle();
        if (already) { summary.skipped++; continue; }

        // Trigger email via existing transactional pipeline
        const templateName = stage === "nurture_24h"
          ? "nurture-negotiate-24h"
          : "nurture-negotiate-72h";

        const sendRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              templateName,
              recipientEmail: c.email,
              idempotencyKey: `${stage}-${c.id}`,
              templateData: {
                propertyAddress: c.property_address || "your property",
                triggerEvent: c.event_type,
              },
            }),
          },
        );
        if (!sendRes.ok) {
          const txt = await sendRes.text();
          console.error("[followup-cron] send failed", c.email, sendRes.status, txt);
          summary.errors++;
          continue;
        }

        await supabase.from("revenue_followup_log").insert({
          email: c.email,
          stage,
          related_event_id: c.id,
        });

        summary[stage]++;
      } catch (err) {
        console.error("[followup-cron] row error", err);
        summary.errors++;
      }
    }
  }

  console.log("[followup-cron] done", summary);
  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});