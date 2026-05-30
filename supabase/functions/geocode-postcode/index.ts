import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postcode, listing_type = "sale", radius_miles = 10 } = await req.json();

    if (!postcode || typeof postcode !== "string") {
      return new Response(
        JSON.stringify({ error: "postcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Geocode via postcodes.io (free, no API key needed)
    const cleanPostcode = postcode.trim().replace(/\s+/g, "+");
    const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`);
    const geoData = await geoRes.json();

    if (geoData.status !== 200 || !geoData.result) {
      return new Response(
        JSON.stringify({ error: "Invalid postcode", agents: [], lat: null, lng: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lat = geoData.result.latitude;
    const lng = geoData.result.longitude;

    // Call the RPC
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: agents, error } = await supabase.rpc("get_agents_by_radius", {
      p_lat: lat,
      p_lng: lng,
      p_radius_miles: radius_miles,
      p_listing_type: listing_type,
    });

    if (error) {
      console.error("RPC error:", error);
      return new Response(
        JSON.stringify({ error: error.message, agents: [], lat, lng }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ agents: agents || [], lat, lng, postcode: geoData.result.postcode }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("geocode-postcode error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", agents: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
