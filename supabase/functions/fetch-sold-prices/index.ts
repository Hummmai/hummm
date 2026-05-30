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
    const { postcode } = await req.json();
    if (!postcode) {
      return new Response(
        JSON.stringify({ error: "postcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("PROPERTYDATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "PropertyData API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format postcode with space if missing
    const formatted = postcode.trim().toUpperCase().replace(/^(.+?)(\d\w{2})$/, "$1 $2");

    console.log("Fetching sold prices for:", formatted);

    const url = `https://api.propertydata.co.uk/sold-prices?key=${apiKey}&postcode=${encodeURIComponent(formatted)}&max_age=24`;

    const resp = await fetch(url);
    const data = await resp.json();

    if (data.status !== "success" || !data.raw_data) {
      console.error("PropertyData error:", data);
      return new Response(
        JSON.stringify({ 
          comps: [], 
          source: "Land Registry Price Paid Data",
          error: data.message || "No data found for this postcode" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map raw_data to our comp format — take the most recent 10
    const comps = data.raw_data
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((item: any) => ({
        address: item.address || "Unknown",
        price: item.price || 0,
        date: item.date || "",
        type: item.property_type || "Unknown",
      }));

    const avgPrice = comps.length > 0
      ? Math.round(comps.reduce((s: number, c: any) => s + c.price, 0) / comps.length)
      : 0;

    return new Response(
      JSON.stringify({
        comps,
        average: avgPrice,
        postcode: formatted,
        total_results: data.raw_data.length,
        source: "HM Land Registry Price Paid Data",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch sold prices" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
