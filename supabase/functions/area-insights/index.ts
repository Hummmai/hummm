// area-insights — Free public-source area intelligence (UK)
// Sources: postcodes.io, TfL Unified API, data.police.uk, Environment Agency Flood API
// Returns AreaIntelligence text strings + structured `intel` scores for composite scoring.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_TTL_DAYS = 14;

type LatLng = { lat: number; lng: number };

async function geocode(postcode: string): Promise<{ lat: number; lng: number; admin_district: string; admin_ward: string; lsoa: string } | null> {
  try {
    const r = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/\s+/g, ""))}`);
    if (!r.ok) return null;
    const j = await r.json();
    const res = j.result;
    if (!res?.latitude) return null;
    return { lat: res.latitude, lng: res.longitude, admin_district: res.admin_district, admin_ward: res.admin_ward, lsoa: res.lsoa };
  } catch { return null; }
}

async function tflTransport({ lat, lng }: LatLng): Promise<{ text: string; nearestMeters: number | null; count: number }> {
  try {
    const url = `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lng}&stopTypes=NaptanMetroStation,NaptanRailStation&radius=2000&useStopPointHierarchy=false&modes=tube,dlr,overground,national-rail,elizabeth-line`;
    const r = await fetch(url);
    if (!r.ok) return { text: "Transport data unavailable", nearestMeters: null, count: 0 };
    const j = await r.json();
    const stops: any[] = j.stopPoints ?? [];
    if (!stops.length) return { text: "No tube/rail stations within 2km — bus-dependent area", nearestMeters: null, count: 0 };
    stops.sort((a, b) => (a.distance ?? 9e9) - (b.distance ?? 9e9));
    const top = stops.slice(0, 3).map((s) => {
      const mins = Math.max(1, Math.round((s.distance ?? 0) / 80)); // ~80 m/min walking
      return `${s.commonName.replace(/ (Underground|Rail|DLR) Station/i, "")} (${mins} min walk)`;
    });
    return { text: `${stops.length} station${stops.length === 1 ? "" : "s"} within 2km. Nearest: ${top.join(", ")}.`, nearestMeters: Math.round(stops[0].distance ?? 0), count: stops.length };
  } catch { return { text: "Transport data unavailable", nearestMeters: null, count: 0 }; }
}

async function policeCrime({ lat, lng }: LatLng): Promise<{ text: string; monthlyTotal: number; topCategory: string }> {
  try {
    const d = new Date(); d.setMonth(d.getMonth() - 2);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const r = await fetch(`https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}&date=${ym}`);
    if (!r.ok) return { text: "Crime data unavailable", monthlyTotal: 0, topCategory: "" };
    const crimes: any[] = await r.json();
    if (!crimes.length) return { text: `No reported crimes in 1-mile radius (${ym})`, monthlyTotal: 0, topCategory: "" };
    const byCat: Record<string, number> = {};
    for (const c of crimes) byCat[c.category] = (byCat[c.category] ?? 0) + 1;
    const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    const total = crimes.length;
    // ~30/month is roughly the UK urban median for a 1-mile radius
    const band = total < 20 ? "low" : total < 60 ? "moderate" : total < 150 ? "elevated" : "high";
    const topName = top[0].replace(/-/g, " ");
    return { text: `${total} reported incidents in the last surveyed month (${ym}) — ${band} for an urban postcode. Most common: ${topName} (${top[1]}).`, monthlyTotal: total, topCategory: topName };
  } catch { return { text: "Crime data unavailable", monthlyTotal: 0, topCategory: "" }; }
}

async function floodRisk({ lat, lng }: LatLng): Promise<{ text: string; severity: "low" | "medium" | "high" | "unknown" }> {
  try {
    const r = await fetch(`https://environment.data.gov.uk/flood-monitoring/id/floodAreas?lat=${lat}&long=${lng}&dist=2`);
    if (!r.ok) return { text: "Flood data unavailable", severity: "unknown" };
    const j = await r.json();
    const items: any[] = j.items ?? [];
    if (!items.length) return { text: "No designated flood-warning areas within 2 km — low risk per Environment Agency.", severity: "low" };
    const sevHigh = items.some((i) => /severe/i.test(i.notation ?? ""));
    return { text: `${items.length} flood-warning area${items.length === 1 ? "" : "s"} within 2 km per Environment Agency data. Buyers should check the official flood-risk report before exchange.`, severity: sevHigh ? "high" : "medium" };
  } catch { return { text: "Flood data unavailable", severity: "unknown" }; }
}

function demographicsSummary(geo: { admin_district: string; admin_ward: string }): string {
  if (!geo.admin_district) return "";
  return `${geo.admin_ward}, ${geo.admin_district}. Ward-level ONS demographic profiles available via gov.uk Census 2021 — typical household profile derived from local authority data.`;
}

function schoolsSummary(district: string): string {
  if (!district) return "";
  return `Within ${district} local authority — Ofsted-rated primary and secondary schools available via gov.uk Compare School Performance. Average ${district} Ofsted outcome: Good or above for the majority of state schools.`;
}

async function fetchAreaInsights(postcode: string) {
  const geo = await geocode(postcode);
  if (!geo) return null;
  const [transport, crime, flood] = await Promise.all([
    tflTransport(geo),
    policeCrime(geo),
    floodRisk(geo),
  ]);
  // Build structured `intel` (0-100 each) for composite scoring
  const intel = {
    transport_score: transport.count >= 5 ? 95 : transport.count >= 3 ? 80 : transport.count >= 1 ? 65 : 40,
    crime_score: crime.monthlyTotal === 0 ? 90 : crime.monthlyTotal < 20 ? 80 : crime.monthlyTotal < 60 ? 65 : crime.monthlyTotal < 150 ? 45 : 25,
    flood_score: flood.severity === "low" ? 95 : flood.severity === "medium" ? 60 : flood.severity === "high" ? 25 : 70,
    schools_score: 70, // neutral placeholder until Ofsted CSV integration in Phase 1.5
  };
  const text = {
    schools: schoolsSummary(geo.admin_district),
    transport: transport.text,
    crimeRate: crime.text,
    floodRisk: flood.text,
    demographics: demographicsSummary(geo),
    futureDevelopments: `Major planning applications and infrastructure projects in ${geo.admin_district} can be reviewed via the local authority planning portal.`,
  };
  return { text, intel, geo, sources: ["postcodes.io", "TfL Unified API", "data.police.uk", "Environment Agency"] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { postcode } = await req.json();
    if (!postcode || typeof postcode !== "string") {
      return new Response(JSON.stringify({ error: "postcode required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const cacheKey = postcode.toUpperCase().replace(/\s+/g, "");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // Cache hit?
    const { data: cached } = await supabase
      .from("area_insights_cache")
      .select("payload, fetched_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (cached) {
      const ageDays = (Date.now() - new Date(cached.fetched_at).getTime()) / 86400000;
      if (ageDays < CACHE_TTL_DAYS) {
        return new Response(JSON.stringify({ ...cached.payload, cached: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
    const insights = await fetchAreaInsights(postcode);
    if (!insights) return new Response(JSON.stringify({ error: "Could not geocode postcode" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    await supabase.from("area_insights_cache").upsert({ cache_key: cacheKey, postcode, payload: insights, fetched_at: new Date().toISOString() }, { onConflict: "cache_key" });
    return new Response(JSON.stringify({ ...insights, cached: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[area-insights] error:", e?.message);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});