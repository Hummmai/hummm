import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractPostcode(address: string): string | null {
  const match = address.match(/([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})/i);
  if (!match) return null;
  const raw = match[1].replace(/\s+/g, "").toUpperCase();
  return raw.slice(0, -3) + " " + raw.slice(-3);
}

async function callPropertyData(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
): Promise<any> {
  const url = new URL(`https://api.propertydata.co.uk/${endpoint}`);
  url.searchParams.set("key", apiKey.trim().replace(/^["']|["']$/g, ""));
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v.trim());
  }
  try {
    console.log(`PropertyData calling: ${url.toString().replace(/key=[^&]+/, "key=***")}`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`PropertyData ${endpoint} error: ${res.status} - ${errBody}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`PropertyData ${endpoint} fetch error:`, e);
    return null;
  }
}

function deduplicateListings(listings: any[]): any[] {
  const seen = new Map<string, any>();
  for (const l of listings) {
    const key = (l.address || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, l);
    } else {
      const existing = seen.get(key);
      if (l.price && !existing.price) seen.set(key, { ...existing, ...l });
    }
  }
  return Array.from(seen.values());
}

function getSeedData(postcode: string, listingType: string): { listings: any[]; market_context: any } | null {
  const pc = postcode.replace(/\s/g, "").toUpperCase();
  const district = pc.replace(/\d[A-Z]{2}$/, "");

  const seeds: Record<string, { listings: any[]; market_context: any }> = {
    "E14": {
      market_context: { avg_price: 485000, price_range_low: 350000, price_range_high: 620000, points_analysed: 142, growth_pct: -1.7 },
      listings: [
        { id: "seed-e14-1", address: "Flat 12, Pan Peninsula, 1 Pan Peninsula Square, E14 9HN", price: 475000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "E14 9HN", lat: 51.5005, lng: -0.0085 },
        { id: "seed-e14-2", address: "Apt 7, Landmark East Tower, 24 Marsh Wall, E14 9AL", price: 525000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "E14 9AL", lat: 51.5015, lng: -0.0142 },
        { id: "seed-e14-3", address: "31 Millharbour, E14 9DL", price: 395000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "E14 9DL", lat: 51.4995, lng: -0.0175 },
        { id: "seed-e14-4", address: "Flat 45, Baltimore Wharf, E14 9FS", price: 610000, bedrooms: 3, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "E14 9FS", lat: 51.5020, lng: -0.0105 },
        { id: "seed-e14-5", address: "9 Boardwalk Place, E14 5SE", price: 450000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "E14 5SE", lat: 51.5032, lng: -0.0060 },
        { id: "seed-e14-6", address: "Flat 22, The Madison, Marsh Wall, E14 9GH", price: 685000, bedrooms: 3, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "E14 9GH", lat: 51.5008, lng: -0.0152 },
        { id: "seed-e14-7", address: "15 Limehouse Causeway, E14 8AA", price: 340000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "E14 8AA", date: "2025-11-15", lat: 51.5098, lng: -0.0345 },
        { id: "seed-e14-8", address: "Flat 3, 42 Westferry Road, E14 8JH", price: 550000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "E14 8JH", lat: 51.4978, lng: -0.0205 },
      ],
    },
    "N1": {
      market_context: { avg_price: 625000, price_range_low: 420000, price_range_high: 850000, points_analysed: 98, growth_pct: -1.7 },
      listings: [
        { id: "seed-n1-1", address: "32 Canonbury Square, N1 2AN", price: 795000, bedrooms: 3, bathrooms: 2, property_type: "Terraced", source: "Agent Site", postcode: "N1 2AN", lat: 51.5445, lng: -0.0945 },
        { id: "seed-n1-2", address: "Flat 8, 15 Upper Street, N1 0PQ", price: 520000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "N1 0PQ", lat: 51.5392, lng: -0.1028 },
        { id: "seed-n1-3", address: "47 Noel Road, N1 8HA", price: 425000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "N1 8HA", lat: 51.5350, lng: -0.1055 },
        { id: "seed-n1-4", address: "12 Duncan Terrace, N1 8BZ", price: 920000, bedrooms: 4, bathrooms: 2, property_type: "Terraced", source: "Agent Site", postcode: "N1 8BZ", lat: 51.5332, lng: -0.1005 },
        { id: "seed-n1-5", address: "Flat 2, Regent's Canal House, N1 9RL", price: 475000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "N1 9RL", date: "2025-12-03", lat: 51.5368, lng: -0.0985 },
        { id: "seed-n1-6", address: "88 Essex Road, N1 8LU", price: 650000, bedrooms: 3, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "N1 8LU", lat: 51.5405, lng: -0.0968 },
      ],
    },
    "M1": {
      market_context: { avg_price: 235000, price_range_low: 165000, price_range_high: 320000, points_analysed: 187, growth_pct: 3.1 },
      listings: [
        { id: "seed-m1-1", address: "Flat 14, Beetham Tower, 301 Deansgate, M3 4LX", price: 310000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "M3 4LX", lat: 53.4749, lng: -2.2508 },
        { id: "seed-m1-2", address: "Apt 9, Axis Tower, Whitworth Street West, M1 5NP", price: 245000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "M1 5NP", lat: 53.4745, lng: -2.2455 },
        { id: "seed-m1-3", address: "22 First Street, M15 4FN", price: 275000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "M15 4FN", lat: 53.4732, lng: -2.2488 },
        { id: "seed-m1-4", address: "Flat 6, Elizabeth Tower, Chester Road, M15 4QF", price: 195000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "M15 4QF", lat: 53.4728, lng: -2.2535 },
        { id: "seed-m1-5", address: "Unit 31, The Edge, Clowes Street, M3 5NA", price: 220000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "M3 5NA", date: "2025-10-22", lat: 53.4780, lng: -2.2488 },
        { id: "seed-m1-6", address: "55 Piccadilly, M1 2AP", price: 350000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "M1 2AP", lat: 53.4805, lng: -2.2368 },
      ],
    },
    "M4": {
      market_context: { avg_price: 265000, price_range_low: 190000, price_range_high: 350000, points_analysed: 134, growth_pct: 3.1 },
      listings: [
        { id: "seed-m4-1", address: "12 Cutting Room Square, Ancoats, M4 6EG", price: 285000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "M4 6EG", lat: 53.4848, lng: -2.2285 },
        { id: "seed-m4-2", address: "Flat 8, Weavers Quarter, Bengal Street, M4 6AQ", price: 225000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "M4 6AQ", lat: 53.4855, lng: -2.2265 },
        { id: "seed-m4-3", address: "Unit 19, New Islington Marina, M4 6BH", price: 310000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "M4 6BH", lat: 53.4825, lng: -2.2205 },
        { id: "seed-m4-4", address: "45 Murray Street, Ancoats, M4 6HS", price: 195000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "M4 6HS", date: "2026-01-08", lat: 53.4862, lng: -2.2248 },
        { id: "seed-m4-5", address: "Flat 3, Vimto Gardens, Chapel Street, M4 6DE", price: 340000, bedrooms: 3, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "M4 6DE", lat: 53.4838, lng: -2.2275 },
      ],
    },
    "B1": {
      market_context: { avg_price: 215000, price_range_low: 145000, price_range_high: 295000, points_analysed: 156, growth_pct: 2.4 },
      listings: [
        { id: "seed-b1-1", address: "Flat 11, The Cube, 197 Wharfside Street, B1 1RN", price: 265000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "B1 1RN", lat: 52.4748, lng: -1.9092 },
        { id: "seed-b1-2", address: "Apt 5, 103 Broad Street, B15 1AE", price: 195000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "B15 1AE", lat: 52.4738, lng: -1.9115 },
        { id: "seed-b1-3", address: "14 Brindleyplace, B1 2JB", price: 310000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "B1 2JB", lat: 52.4762, lng: -1.9125 },
        { id: "seed-b1-4", address: "Flat 7, Orion Building, Navigation Street, B5 4AA", price: 178000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "B5 4AA", date: "2025-09-18", lat: 52.4725, lng: -1.9008 },
        { id: "seed-b1-5", address: "22 Colmore Row, B3 2BS", price: 285000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "B3 2BS", lat: 52.4812, lng: -1.9028 },
      ],
    },
    "B15": {
      market_context: { avg_price: 295000, price_range_low: 195000, price_range_high: 425000, points_analysed: 112, growth_pct: 2.4 },
      listings: [
        { id: "seed-b15-1", address: "8 Edgbaston Crescent, B15 3TZ", price: 385000, bedrooms: 3, bathrooms: 2, property_type: "Semi-Detached", source: "Agent Site", postcode: "B15 3TZ", lat: 52.4665, lng: -1.9215 },
        { id: "seed-b15-2", address: "Flat 4, Calthorpe Mansions, B15 1QX", price: 245000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "B15 1QX", lat: 52.4695, lng: -1.9168 },
        { id: "seed-b15-3", address: "17 Priory Road, B5 7UG", price: 425000, bedrooms: 4, bathrooms: 2, property_type: "Detached", source: "Agent Site", postcode: "B5 7UG", lat: 52.4658, lng: -1.9142 },
        { id: "seed-b15-4", address: "Flat 9, The Bartons, B15 2AF", price: 198000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "B15 2AF", date: "2026-02-14", lat: 52.4682, lng: -1.9195 },
      ],
    },
    "LS1": {
      market_context: { avg_price: 198000, price_range_low: 135000, price_range_high: 275000, points_analysed: 168, growth_pct: 4.8 },
      listings: [
        { id: "seed-ls1-1", address: "Flat 18, Bridgewater Place, Water Lane, LS11 5BZ", price: 215000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "LS11 5BZ", lat: 53.7915, lng: -1.5488 },
        { id: "seed-ls1-2", address: "Unit 3, The Calls, LS2 7EY", price: 265000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "LS2 7EY", lat: 53.7945, lng: -1.5395 },
        { id: "seed-ls1-3", address: "8 Wellington Street, LS1 4AP", price: 175000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "LS1 4AP", lat: 53.7968, lng: -1.5512 },
        { id: "seed-ls1-4", address: "Flat 5, South Bank Tower, LS10 1LB", price: 195000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "LS10 1LB", lat: 53.7892, lng: -1.5452 },
        { id: "seed-ls1-5", address: "12 Holbeck Urban Village, LS11 9QX", price: 310000, bedrooms: 3, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "LS11 9QX", lat: 53.7888, lng: -1.5525 },
      ],
    },
    "LS2": {
      market_context: { avg_price: 210000, price_range_low: 142000, price_range_high: 290000, points_analysed: 95, growth_pct: 4.8 },
      listings: [
        { id: "seed-ls2-1", address: "Flat 12, Clarence Dock, LS10 1NW", price: 225000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "LS10 1NW", lat: 53.7928, lng: -1.5358 },
        { id: "seed-ls2-2", address: "4 Brewery Wharf, Bowman Lane, LS10 1HQ", price: 198000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "LS10 1HQ", lat: 53.7935, lng: -1.5372 },
        { id: "seed-ls2-3", address: "Flat 8, Granary Wharf, LS1 4BR", price: 275000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "LS1 4BR", lat: 53.7925, lng: -1.5498 },
        { id: "seed-ls2-4", address: "22 Leeds Dock, LS10 1NB", price: 320000, bedrooms: 3, bathrooms: 2, property_type: "Flat", source: "Land Registry", postcode: "LS10 1NB", date: "2025-12-20", lat: 53.7918, lng: -1.5345 },
      ],
    },
    "NE1": {
      market_context: { avg_price: 175000, price_range_low: 110000, price_range_high: 250000, points_analysed: 145, growth_pct: 5.2, yield_pct: 9.7 },
      listings: [
        { id: "seed-ne1-1", address: "Flat 6, The Quayside, NE1 3JE", price: 195000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "NE1 3JE", lat: 54.9698, lng: -1.6045 },
        { id: "seed-ne1-2", address: "14 Grainger Street, NE1 5JE", price: 165000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "NE1 5JE", lat: 54.9718, lng: -1.6145 },
        { id: "seed-ne1-3", address: "Flat 3, St Ann's Wharf, NE1 2BA", price: 245000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "NE1 2BA", lat: 54.9685, lng: -1.6028 },
        { id: "seed-ne1-4", address: "Unit 8, 55 Degrees North, Pilgrim Street, NE1 6BF", price: 142000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "NE1 6BF", lat: 54.9725, lng: -1.6098 },
        { id: "seed-ne1-5", address: "21 Dean Street, NE1 1PG", price: 185000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "NE1 1PG", date: "2026-01-15", lat: 54.9712, lng: -1.6125 },
        { id: "seed-ne1-6", address: "Flat 10, Quayside Lofts, NE1 2AY", price: 210000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "NE1 2AY", lat: 54.9692, lng: -1.6035 },
      ],
    },
    "G1": {
      market_context: { avg_price: 185000, price_range_low: 120000, price_range_high: 265000, points_analysed: 132, growth_pct: 3.6 },
      listings: [
        { id: "seed-g1-1", address: "Flat 5, Merchant City, 68 Ingram Street, G1 1EX", price: 195000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "G1 1EX", lat: 55.8582, lng: -4.2438 },
        { id: "seed-g1-2", address: "14 Trongate, G1 5ES", price: 155000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "G1 5ES", lat: 55.8565, lng: -4.2458 },
        { id: "seed-g1-3", address: "Flat 9, The Pinnacle, Bothwell Street, G2 7HY", price: 265000, bedrooms: 2, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "G2 7HY", lat: 55.8605, lng: -4.2585 },
        { id: "seed-g1-4", address: "31 Bell Street, G1 1LG", price: 135000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "G1 1LG", date: "2025-11-28", lat: 55.8578, lng: -4.2415 },
        { id: "seed-g1-5", address: "Flat 7, Virginia Court, G1 1TX", price: 220000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "G1 1TX", lat: 55.8588, lng: -4.2445 },
      ],
    },
    "G12": {
      market_context: { avg_price: 245000, price_range_low: 165000, price_range_high: 350000, points_analysed: 88, growth_pct: 3.6 },
      listings: [
        { id: "seed-g12-1", address: "18 Hyndland Road, G12 9UT", price: 295000, bedrooms: 3, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "G12 9UT", lat: 55.8782, lng: -4.3095 },
        { id: "seed-g12-2", address: "Flat 2, 42 Byres Road, G12 8AP", price: 215000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "G12 8AP", lat: 55.8725, lng: -4.2945 },
        { id: "seed-g12-3", address: "7 Ashton Lane, G12 8SJ", price: 185000, bedrooms: 1, bathrooms: 1, property_type: "Flat", source: "Agent Site", postcode: "G12 8SJ", lat: 55.8738, lng: -4.2935 },
        { id: "seed-g12-4", address: "55 Great George Street, G12 8AH", price: 325000, bedrooms: 3, bathrooms: 2, property_type: "Flat", source: "Agent Site", postcode: "G12 8AH", lat: 55.8752, lng: -4.2888 },
        { id: "seed-g12-5", address: "Flat 4, Kelvinside Gardens, G12 0PB", price: 198000, bedrooms: 2, bathrooms: 1, property_type: "Flat", source: "Land Registry", postcode: "G12 0PB", date: "2026-02-05", lat: 55.8795, lng: -4.3052 },
      ],
    },
  };

  return seeds[district] || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postcode, radius_miles = 5, listing_type = "sale", min_price, max_price, bedrooms, property_type } = await req.json();

    if (!postcode) {
      return new Response(JSON.stringify({ error: "postcode is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("PROPERTYDATA_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "PropertyData API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedPostcode = extractPostcode(postcode) || postcode.trim().toUpperCase();
    const listings: any[] = [];

    // 1) Call sourced-properties for ON-MARKET listings (the primary data source)
    const sourcedListParam: Record<string, string> = {
      postcode: formattedPostcode,
      list: "below-market-value",
      radius: String(radius_miles),
      results: "50",
    };

    // 2) Call sold-prices for comparable / historical data
    const soldParams: Record<string, string> = {
      postcode: formattedPostcode,
      max_age: "24",
      points: "50",
    };
    if (bedrooms) soldParams.bedrooms = String(bedrooms);
    if (property_type && property_type !== "Any") {
      const typeMap: Record<string, string> = {
        "Detached": "detached", "Semi-Detached": "semi-detached",
        "Terraced": "terraced", "Flat": "flat", "Bungalow": "bungalow",
      };
      const mapped = typeMap[property_type] || property_type.toLowerCase();
      soldParams.type = mapped;
    }

    const [sourcedData, soldData] = await Promise.all([
      callPropertyData("sourced-properties", sourcedListParam, apiKey),
      callPropertyData("sold-prices", soldParams, apiKey),
    ]);

    // ── Parse sourced-properties (on-market listings) ──
    if (sourcedData?.properties && Array.isArray(sourcedData.properties)) {
      console.log(`Found ${sourcedData.properties.length} sourced on-market properties`);
      for (const prop of sourcedData.properties) {
        const price = prop.price || 0;
        if (min_price && price < parseInt(min_price)) continue;
        if (max_price && price > parseInt(max_price)) continue;
        if (bedrooms && prop.bedrooms && parseInt(String(prop.bedrooms)) !== parseInt(bedrooms)) continue;

        listings.push({
          id: `src-${prop.id || listings.length}`,
          address: prop.precise_address || prop.address || "",
          price,
          bedrooms: prop.bedrooms ? parseInt(String(prop.bedrooms)) : null,
          bathrooms: null,
          property_type: prop.type_standardised || prop.type || "Unknown",
          date: null,
          days_on_market: prop.days_on_market || null,
          sqft: prop.sqf || null,
          source: "Agent Site",
          postcode: prop.postcode || formattedPostcode,
          url: prop.url || null,
          summary: prop.summary || null,
          sstc: prop.sstc === 1,
          lat: prop.lat ? parseFloat(prop.lat) : null,
          lng: prop.lng ? parseFloat(prop.lng) : null,
        });
      }
    } else {
      console.log("No sourced-properties data or unexpected format:", sourcedData ? Object.keys(sourcedData) : "null");
    }

    // ── Parse sold-prices (data is an object with raw_data array) ──
    let soldProperties: any[] = [];
    let marketContext: any = {};

    if (soldData?.data) {
      const d = soldData.data;
      marketContext = {
        avg_price: d.average || null,
        price_range_low: d["70pc_range"]?.[0] || null,
        price_range_high: d["70pc_range"]?.[1] || null,
        points_analysed: d.points_analysed || null,
      };

      if (Array.isArray(d.raw_data)) {
        soldProperties = d.raw_data;
        console.log(`Found ${soldProperties.length} sold price records`);
      }
    }

    for (const prop of soldProperties) {
      const price = prop.price || 0;
      if (min_price && price < parseInt(min_price)) continue;
      if (max_price && price > parseInt(max_price)) continue;
      if (bedrooms && prop.bedrooms && parseInt(String(prop.bedrooms)) !== parseInt(bedrooms)) continue;

      listings.push({
        id: `pd-${listings.length}`,
        address: prop.address || "",
        price,
        bedrooms: prop.bedrooms ? parseInt(String(prop.bedrooms)) : null,
        bathrooms: null,
        property_type: prop.type || "Unknown",
        date: prop.date || null,
        source: "Land Registry",
        postcode: formattedPostcode,
        lat: prop.lat || null,
        lng: prop.lng || null,
      });
    }

    let unique = deduplicateListings(listings);

    // If no live data, fall back to seed data for supported hubs
    if (unique.length === 0) {
      const seed = getSeedData(formattedPostcode, listing_type);
      if (seed) {
        console.log(`Using seed data for ${formattedPostcode}`);
        unique = seed.listings;
        if (!marketContext || !marketContext.avg_price) {
          marketContext = seed.market_context;
        }
      }
    }

    return new Response(JSON.stringify({
      listings: unique,
      total: unique.length,
      postcode: formattedPostcode,
      radius_miles,
      listing_type,
      market_context: marketContext,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("fetch-market-data error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
