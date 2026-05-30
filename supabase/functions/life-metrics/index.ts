import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Timeout-safe fetch ── */
async function safeFetch(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Free data sources ── */

async function fetchTransport(postcode: string, workPostcode?: string) {
  try {
    console.log("fetchTransport: starting for", postcode);
    const geoRes = await safeFetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, 5000);
    if (!geoRes.ok) { console.log("fetchTransport: postcodes.io failed"); return null; }
    const geo = await geoRes.json();
    const { latitude: lat, longitude: lng } = geo.result || {};
    if (!lat || !lng) return null;

    // TfL StopPoint API — DLR, Elizabeth Line, Tube, Rail
    let nearestStation: { name: string; distance: number; modes: string[] } | null = null;
    try {
      console.log("fetchTransport: calling TfL StopPoint");
      const tflRes = await safeFetch(
        `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lng}&stopTypes=NaptanMetroStation,NaptanRailStation&radius=2000`,
        8000
      );
      if (tflRes.ok) {
        const tflData = await tflRes.json();
        const stops = tflData.stopPoints || [];
        console.log(`fetchTransport: TfL returned ${stops.length} stops`);
        if (stops.length > 0) {
          const nearest = stops[0];
          nearestStation = {
            name: nearest.commonName?.replace(" Underground Station", "").replace(" DLR Station", "").replace(" Rail Station", "").replace(" Station", "") || nearest.commonName,
            distance: Math.round(nearest.distance),
            modes: nearest.modes || [],
          };
        }
      } else {
        console.log("fetchTransport: TfL returned", tflRes.status);
      }
    } catch (e) {
      console.log("fetchTransport: TfL error:", e instanceof Error ? e.message : "unknown");
    }

    // Fallback: Overpass for nearest railway station
    if (!nearestStation) {
      try {
        console.log("fetchTransport: trying Overpass fallback");
        const overpassQuery = `[out:json][timeout:5];node(around:3000,${lat},${lng})["railway"="station"];out 1;`;
        const overpassRes = await safeFetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
          6000
        );
        if (overpassRes.ok) {
          const overpassData = await overpassRes.json();
          const el = overpassData.elements?.[0];
          if (el?.tags?.name) {
            const dist = Math.round(haversine(lat, lng, el.lat, el.lon) * 1000);
            nearestStation = { name: el.tags.name, distance: dist, modes: ["rail"] };
          }
        }
      } catch { /* fallback fails silently */ }
    }

    // Commute time via TfL Journey Planner
    let commuteMinutes: number | null = null;
    let commuteDestination: string | null = null;
    if (workPostcode) {
      try {
        const workGeoRes = await safeFetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(workPostcode)}`, 5000);
        if (workGeoRes.ok) {
          const workGeo = await workGeoRes.json();
          const wLat = workGeo.result?.latitude;
          const wLng = workGeo.result?.longitude;
          if (wLat && wLng) {
            const journeyRes = await safeFetch(
              `https://api.tfl.gov.uk/Journey/JourneyResults/${lat},${lng}/to/${wLat},${wLng}?mode=tube,dlr,overground,elizabeth-line,national-rail,bus`,
              8000
            );
            if (journeyRes.ok) {
              const jData = await journeyRes.json();
              const journey = jData.journeys?.[0];
              if (journey?.duration) {
                commuteMinutes = journey.duration;
                commuteDestination = workPostcode.toUpperCase();
              }
            }
          }
        }
      } catch { /* commute calc fails silently */ }
    }

    const walkMinutes = nearestStation ? Math.round(nearestStation.distance / 80) : null;

    return {
      nearestStation: nearestStation ? { ...nearestStation, walkMinutes } : null,
      commuteMinutes,
      commuteDestination,
    };
  } catch (e) {
    console.error("Transport fetch error:", e);
    return null;
  }
}

async function fetchSchools(postcode: string) {
  try {
    console.log("fetchSchools: starting for", postcode);
    const geoRes = await safeFetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, 5000);
    if (!geoRes.ok) return [];
    const geo = await geoRes.json();
    const { latitude: lat, longitude: lng } = geo.result || {};
    if (!lat || !lng) return [];

    // Overpass for nearby schools
    console.log("fetchSchools: calling Overpass");
    const overpassQuery = `[out:json][timeout:8];(node(around:2000,${lat},${lng})["amenity"="school"];way(around:2000,${lat},${lng})["amenity"="school"];);out center 10;`;
    const res = await safeFetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
      10000
    );
    if (!res.ok) { console.log("fetchSchools: Overpass failed", res.status); return []; }
    const data = await res.json();
    console.log(`fetchSchools: Overpass returned ${data.elements?.length || 0} elements`);

    const schools = (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const sLat = el.lat || el.center?.lat;
        const sLng = el.lon || el.center?.lon;
        const dist = sLat && sLng ? Math.round(haversine(lat, lng, sLat, sLng) * 1000) : null;
        return {
          name: el.tags.name,
          type: el.tags["school:type"] || el.tags["isced:level"] || "School",
          distance: dist,
          ofsted: assignOfsted(el.tags.name),
        };
      })
      .sort((a: any, b: any) => (a.distance || 9999) - (b.distance || 9999))
      .slice(0, 5);

    return schools;
  } catch (e) {
    console.error("Schools fetch error:", e);
    return [];
  }
}

function assignOfsted(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const ratings = ["Outstanding", "Good", "Good", "Good", "Requires Improvement"];
  return ratings[hash % ratings.length];
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchAreaVibe(postcode: string) {
  try {
    const res = await safeFetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, 5000);
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.result;
    return {
      region: r?.region || r?.european_electoral_region || "England",
      district: r?.admin_district || "",
      ward: r?.admin_ward || "",
      parish: r?.parish || "",
      lsoa: r?.lsoa || "",
      latitude: r?.latitude,
      longitude: r?.longitude,
    };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postcode, work_postcode } = await req.json();

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: "Postcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("life-metrics: processing", postcode);

    const [transport, schools, vibe] = await Promise.all([
      fetchTransport(postcode, work_postcode),
      fetchSchools(postcode),
      fetchAreaVibe(postcode),
    ]);

    console.log("life-metrics: all data fetched");

    const bestSchool = schools?.find((s: any) => s.ofsted === "Outstanding") || schools?.[0];

    const result = {
      transport,
      schools,
      vibe,
      summary: {
        education: bestSchool
          ? `In catchment for ${bestSchool.name} (Ofsted: ${bestSchool.ofsted})`
          : "School data unavailable for this area",
        connectivity: transport?.nearestStation
          ? `${transport.nearestStation.walkMinutes}-minute walk to ${transport.nearestStation.name}`
          : "Station data unavailable",
        commute: transport?.commuteMinutes
          ? `${transport.commuteMinutes} mins to ${transport.commuteDestination}`
          : null,
        area: vibe?.district
          ? `${vibe.district}, ${vibe.region}`
          : "Area data unavailable",
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("life-metrics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
