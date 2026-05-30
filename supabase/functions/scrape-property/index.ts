const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Extract all email addresses from text, filtering out portal/system emails */
function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const blocklist = /(example\.com|test\.com|sentry|google\.com|facebook\.com|twitter\.com|rightmove\.co\.uk|zoopla\.co\.uk|onthemarket\.com|primelocation\.com|propertyfinder\.ae|bayut\.com|property24\.com|privateproperty\.co\.za|noreply|no-reply|donotreply|unsubscribe|mailer-daemon|postmaster)/;
  return [...new Set((text.match(emailRegex) || []))]
    .map(e => e.toLowerCase())
    .filter(e => !blocklist.test(e));
}

/** Score an email — higher = more likely to be an agent enquiry address */
function scoreEmail(email: string): number {
  let score = 0;
  const prefix = email.split("@")[0];
  if (/^(sales|lettings|enquiries|enquiry|info|contact|office|viewings|hello|team|property|ask|newbusiness)$/.test(prefix)) score += 10;
  if (/sales|letting|enquir|contact|info|office|viewing|hello|team|property/.test(prefix)) score += 5;
  if (/^[a-z]+\.[a-z]+$/.test(prefix)) score += 3;
  if (/support|help|feedback|billing|accounts|marketing|newsletter|careers|jobs|recruitment|privacy|legal|compliance|gdpr/.test(prefix)) score -= 5;
  return score;
}

function pickBestEmail(emails: string[]): string | null {
  if (!emails.length) return null;
  return emails.sort((a, b) => scoreEmail(b) - scoreEmail(a))[0];
}

/**
 * Clean a raw price label so noise like "Guide Price", "Offers Over", "POA",
 * "Now", "From", "OIRO", "Reduced", "Asking", currency symbols and commas
 * never leak into the number. Returns a numeric value (0 if not parseable).
 */
function cleanPriceString(raw: string | null | undefined): number {
  if (!raw) return 0;
  let s = String(raw)
    .replace(/(guide price|offers over|offers in excess of|offers in the region of|oiro|oieo|in excess of|from|now|asking|reduced|sale by tender|poa|price on application|price on request|fixed price|starting at|priced at)/gi, "")
    .replace(/[£$€₹د.إAED|SGD|USD|GBP|EUR|HKD|AUD|MYR|THB|JPY|CNY]/gi, "")
    .replace(/,/g, "")
    .trim();
  // Handle "1.85M" / "850K" suffixes
  const suffixMatch = s.match(/([\d.]+)\s*([kKmMbB])\b/);
  if (suffixMatch) {
    const base = parseFloat(suffixMatch[1]);
    const mult = suffixMatch[2].toLowerCase() === "k" ? 1_000 : suffixMatch[2].toLowerCase() === "m" ? 1_000_000 : 1_000_000_000;
    if (Number.isFinite(base)) return Math.round(base * mult);
  }
  const num = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

/**
 * Phase 3: Enhanced price extraction with confidence scoring.
 * Returns { amount, currency, qualifier, confidence }
 */
function extractRightmovePriceEnhanced(rawHtml: string, sourceUrl: string = ""): { 
  amount: number; 
  currency?: string; 
  qualifier?: string; 
  confidence: number; // 0-100
  method: string;
} | null {
  if (!rawHtml) return null;

  const host = (() => { try { return new URL(sourceUrl).hostname.toLowerCase(); } catch { return ""; } })();
  const isRightmove = /rightmove\.co\.uk/i.test(host);

  // 1. Highest confidence: data-testid="primaryPrice" (what the buyer literally sees)
  const domMatch = rawHtml.match(/data-testid=["']primaryPrice["'][^>]*>\s*<span[^>]*>\s*([^<]+)</i);
  if (domMatch) {
    const qualMatch = rawHtml.match(/data-testid=["']priceQualifier["'][^>]*>\s*([^<]+)</i);
    const amount = cleanPriceString(domMatch[1]);
    if (amount > 0) {
      return { 
        amount, 
        currency: "GBP", 
        qualifier: qualMatch?.[1]?.trim(), 
        confidence: isRightmove ? 95 : 85,
        method: "data-testid-primaryPrice"
      };
    }
  }

  // 2. High confidence: RESALEPRICE in PAGE_MODEL
  const resaleMatch = rawHtml.match(/"RESALEPRICE"[^\]]*\["?(\d{4,})"?\]/);
  if (resaleMatch) {
    const amount = cleanPriceString(resaleMatch[1]);
    if (amount > 0) {
      return { amount, currency: "GBP", confidence: 88, method: "PAGE_MODEL_RESALEPRICE" };
    }
  }

  // 3. Medium: window.PAGE_MODEL full parse
  const pageModelMatch = rawHtml.match(/window\.PAGE_MODEL\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
  if (pageModelMatch) {
    try {
      const model = JSON.parse(pageModelMatch[1]);
      const prices = model?.propertyData?.prices;
      const primary = prices?.primaryPrice ?? prices?.displayPrices?.[0]?.displayPrice;
      const amount = cleanPriceString(primary);
      if (amount > 0) {
        return { amount, currency: "GBP", confidence: 75, method: "PAGE_MODEL_JSON" };
      }
    } catch {}
  }

  // 4. Fallbacks with lower confidence
  const jsonLdMatch = rawHtml.match(/"price"\s*:\s*"?([\d,]+)"?/i);
  if (jsonLdMatch) {
    const amount = cleanPriceString(jsonLdMatch[1]);
    if (amount > 0) return { amount, currency: "GBP", confidence: 55, method: "JSON-LD" };
  }

  return null;
}
function extractRightmovePrice(rawHtml: string, sourceUrl: string = ""): { amount: number; currency?: string; qualifier?: string } | null {
  if (!rawHtml) return null;
  const host = (() => { try { return new URL(sourceUrl).hostname.toLowerCase(); } catch { return ""; } })();

  // Helper: guess currency from host
  const hostCurrency = (): string | undefined => {
    if (/rightmove|zoopla|onthemarket|primelocation/.test(host)) return "GBP";
    if (/zillow|redfin|realtor|trulia/.test(host)) return "USD";
    if (/propertyfinder|bayut|dubizzle/.test(host)) return "AED";
    if (/property24|privateproperty\.co\.za/.test(host)) return "ZAR";
    if (/idealista|fotocasa|immoscout|seloger|immobiliare/.test(host)) return "EUR";
    return undefined;
  };

  // 1) DOM: data-testid="primaryPrice" span — the exact price shown to buyers.
  //    This is the most reliable source and avoids AI rounding (e.g. £5.95M → £6M).
  const domMatch = rawHtml.match(/data-testid=["']primaryPrice["'][^>]*>\s*<span[^>]*>\s*([^<]+)</i);
  if (domMatch) {
    const qualMatch = rawHtml.match(/data-testid=["']priceQualifier["'][^>]*>\s*([^<]+)</i);
    const amount = cleanPriceString(domMatch[1]);
    if (amount > 0) {
      return { amount, currency: "GBP", qualifier: qualMatch?.[1]?.trim() };
    }
  }

  // 2) RESALEPRICE key inside PAGE_MODEL (normalized JSON refs make full parse hard,
  //    but the canonical numeric value is always present under this key).
  const resaleMatch = rawHtml.match(/"RESALEPRICE"[^\]]*\["?(\d{4,})"?\]/);
  if (resaleMatch) {
    const amount = cleanPriceString(resaleMatch[1]);
    if (amount > 0) return { amount, currency: "GBP" };
  }

  // 3) window.PAGE_MODEL JSON object (legacy / non-normalized pages)
  const pageModelMatch = rawHtml.match(/window\.PAGE_MODEL\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
  if (pageModelMatch) {
    try {
      const model = JSON.parse(pageModelMatch[1]);
      const prices = model?.propertyData?.prices;
      const primary = prices?.primaryPrice ?? prices?.displayPrices?.[0]?.displayPrice;
      const amount = prices?.primaryPrice?.amount
        ?? (typeof primary === "string" ? cleanPriceString(primary) : 0)
        ?? cleanPriceString(prices?.displayPrices?.[0]?.displayPrice);
      if (amount && Number(amount) > 0) {
        return {
          amount: Math.round(Number(amount)),
          currency: prices?.currencyCode || "GBP",
          qualifier: prices?.primaryPrice?.priceQualifier || prices?.displayPrices?.[0]?.displayPriceQualifier,
        };
      }
    } catch (e) {
      console.warn("[scrape-property] PAGE_MODEL parse failed:", (e as Error).message);
    }
  }

  // 4) Regex fallback inside any inline script
  const primaryRegex = /"primaryPrice"\s*:\s*\{[^}]*?"amount"\s*:\s*"?(\d[\d,]*)"?/;
  const m = rawHtml.match(primaryRegex);
  if (m) {
    const amount = cleanPriceString(m[1]);
    if (amount > 0) return { amount, currency: "GBP" };
  }

  // 5) JSON-LD <script type="application/ld+json">
  const ldRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch: RegExpExecArray | null;
  while ((ldMatch = ldRegex.exec(rawHtml)) !== null) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      const items = Array.isArray(ld) ? ld : [ld];
      for (const it of items) {
        const priceRaw = it?.offers?.price ?? it?.offers?.[0]?.price ?? it?.price;
        const cur = it?.offers?.priceCurrency ?? it?.offers?.[0]?.priceCurrency ?? "GBP";
        const amount = cleanPriceString(priceRaw);
        if (amount > 0) return { amount, currency: cur };
      }
    } catch { /* ignore */ }
  }

  // 4) Zoopla __NEXT_DATA__ blob (Next.js apps embed full listing JSON)
  const nextDataMatch = rawHtml.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const nd = JSON.parse(nextDataMatch[1]);
      // Zoopla / Zillow / Realtor / generic Next.js portals
      const pageProps = nd?.props?.pageProps ?? {};
      const listing = pageProps?.data?.listing
        ?? nd?.props?.pageProps?.listingDetails
        ?? pageProps?.listing
        ?? pageProps?.componentProps?.gdpClientCache
        ?? pageProps?.property
        ?? pageProps?.home;
      // Zillow stores price under property.price as a clean integer
      const priceRaw = listing?.price
        ?? listing?.pricing?.price
        ?? listing?.pricing?.label
        ?? listing?.priceActual
        ?? listing?.hdpData?.homeInfo?.price
        ?? listing?.unformattedPrice;
      const amount = cleanPriceString(priceRaw);
      if (amount > 0) {
        return { amount, currency: listing?.pricing?.currencyCode || listing?.priceCurrency || hostCurrency() || "GBP" };
      }
    } catch (e) {
      console.warn("[scrape-property] __NEXT_DATA__ parse failed:", (e as Error).message);
    }
  }

  // 5) Meta tags (og:price:amount, product:price:amount, itemprop=price)
  const metaRegex = /<meta[^>]+(?:property|name|itemprop)=["'](?:og:price:amount|product:price:amount|price|priceAmount)["'][^>]+content=["']([^"']+)["']/i;
  const metaMatch = rawHtml.match(metaRegex);
  if (metaMatch) {
    const amount = cleanPriceString(metaMatch[1]);
    if (amount > 0) {
      const curMatch = rawHtml.match(/<meta[^>]+(?:property|name|itemprop)=["'](?:og:price:currency|product:price:currency|priceCurrency)["'][^>]+content=["']([^"']+)["']/i);
      return { amount, currency: curMatch?.[1] || hostCurrency() };
    }
  }

  // 6) Portal-specific patterns
  //  - Bayut / PropertyFinder embed price in dataLayer-style JSON
  const bayutMatch = rawHtml.match(/"price"\s*:\s*\{[^}]*?"value"\s*:\s*"?(\d[\d,.]*)"?/);
  if (bayutMatch) {
    const amount = cleanPriceString(bayutMatch[1]);
    if (amount > 0) return { amount, currency: hostCurrency() || "AED" };
  }
  //  - Property24 / generic itemprop spans
  const itemPropMatch = rawHtml.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);
  if (itemPropMatch) {
    const amount = cleanPriceString(itemPropMatch[1]);
    if (amount > 0) return { amount, currency: hostCurrency() };
  }
  //  - Generic class-based price labels (Property24/Idealista variants)
  const classMatch = rawHtml.match(/class=["'][^"']*?(?:p24_price|listing-price|price-tag|propertyHeaderPrice|price__main)[^"']*?["'][^>]*>\s*([^<]{1,40})\s*</i);
  if (classMatch) {
    const amount = cleanPriceString(classMatch[1]);
    if (amount > 0) return { amount, currency: hostCurrency() };
  }

  return null;
}

/**
 * Phase 4: Robust retry helper with exponential backoff
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  timeoutMs = 25000,
  baseDelayMs = 800
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, { 
        ...options, 
        signal: controller.signal 
      });
      
      clearTimeout(timeout);

      if (res.ok) return res;

      // Retry on 5xx or rate limits
      if (res.status >= 500 || res.status === 429) {
        lastError = new Error(`HTTP ${res.status}`);
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      return res; // Non-retryable error
    } catch (e) {
      lastError = e as Error;
      if (attempt < retries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error("All fetch attempts failed");
}
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok || res.status < 500) return res;
      console.warn(`[scrape-property] Attempt ${attempt}/${retries} got status ${res.status} for ${url}`);
    } catch (err: any) {
      console.warn(`[scrape-property] Attempt ${attempt}/${retries} failed: ${err?.message || err}`);
      if (attempt === retries) throw err;
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * attempt));
  }
  throw new Error("All retry attempts exhausted");
}

async function scrapeUrl(apiKey: string, url: string): Promise<{ markdown: string; links: string[] }> {
  try {
    const res = await fetchWithRetry("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown", "links"], onlyMainContent: true, waitFor: 3000 }),
    });
    if (!res.ok) return { markdown: "", links: [] };
    const data = await res.json();
    return { markdown: data.data?.markdown || "", links: data.data?.links || [] };
  } catch { return { markdown: "", links: [] }; }
}

function findAgentWebsite(links: string[], agentName: string | null): string | null {
  const portalDomains = /rightmove|zoopla|onthemarket|primelocation|propertypal|openrent|spareroom|ideal|zillow|redfin|realtor\.com|propertyguru|domain\.com\.au|idealista|immobilienscout|propertyfinder\.ae|bayut\.com|dubizzle|property24\.com|privateproperty\.co\.za|seeff\.com|rawson/i;
  const socialDomains = /facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest|google/i;
  const candidateLinks = links.filter(l => {
    try { const u = new URL(l); return !portalDomains.test(u.hostname) && !socialDomains.test(u.hostname) && u.protocol === "https:"; }
    catch { return false; }
  });
  for (const link of candidateLinks) {
    try { const path = new URL(link).pathname.toLowerCase();
      if (path === "/" || /contact|about|team|staff|our-people|meet-the-team/.test(path)) return link;
    } catch { continue; }
  }
  if (agentName) {
    const words = agentName.toLowerCase().split(/[\s&,]+/).filter(w => w.length > 3);
    for (const link of candidateLinks) { if (words.some(w => link.toLowerCase().includes(w))) return link; }
  }
  return candidateLinks[0] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) return new Response(JSON.stringify({ success: false, error: "URL is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ success: false, error: "Firecrawl not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) formattedUrl = `https://${formattedUrl}`;

    console.log("Scraping property URL:", formattedUrl);

    // Step 1: Scrape the listing page — request markdown + links + html for images (with retries)
    console.log("[scrape-property] Step 1: Scraping listing page");
    let scrapeRes: Response;
    try {
      scrapeRes = await fetchWithRetry("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        // rawHtml preserves <script> tags so we can parse window.PAGE_MODEL on Rightmove
        body: JSON.stringify({ url: formattedUrl, formats: ["markdown", "links", "html", "rawHtml"], onlyMainContent: false, waitFor: 4000 }),
      });
    } catch (e: any) {
      console.error("[scrape-property] All scrape retries failed:", e?.message);
      return new Response(JSON.stringify({ success: false, error: "Unable to fetch this listing. The property portal may be blocking requests. Please try another property or contact support." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const scrapeData = await scrapeRes.json();
    if (!scrapeRes.ok || !scrapeData.success) {
      console.error("[scrape-property] Firecrawl error:", JSON.stringify(scrapeData).slice(0, 500));
      return new Response(JSON.stringify({ success: false, error: "Unable to fetch this listing. Please try another property or contact support." }), { status: scrapeRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const markdown = scrapeData.data?.markdown || "";
    const html = scrapeData.data?.html || "";
    let rawHtml: string = scrapeData.data?.rawHtml || scrapeData.data?.html || "";

    // Belt-and-braces: for Rightmove, always do a direct fetch to guarantee we
    // have the full server-rendered HTML (Firecrawl sometimes strips scripts or
    // returns a sanitized snapshot that omits the price DOM/PAGE_MODEL).
    if (/rightmove\.co\.uk/i.test(formattedUrl)) {
      try {
        const directRes = await fetch(formattedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.9",
          },
          signal: AbortSignal.timeout(15000),
        });
        console.error(`[scrape-property] Direct Rightmove fetch status=${directRes.status}`);
        if (directRes.ok) {
          const directHtml = await directRes.text();
          console.error(`[scrape-property] Direct Rightmove fetch length=${directHtml.length} hasPrice=${/data-testid=["']primaryPrice["']/.test(directHtml)}`);
          if (directHtml && directHtml.length > 10000) {
            rawHtml = directHtml;
          }
        } else {
          await directRes.text().catch(() => "");
        }
      } catch (e) {
        console.error("[scrape-property] Direct Rightmove fetch failed:", (e as Error).message);
      }
    }

    const metadata = scrapeData.data?.metadata || {};
    const links: string[] = scrapeData.data?.links || [];

    // Extract high-res images from HTML (src/srcset of <img> tags)
    const htmlImageRegex = /<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)/gi;
    const htmlImages: string[] = [];
    let imgMatch;
    while ((imgMatch = htmlImageRegex.exec(html)) !== null) {
      const imgUrl = imgMatch[1];
      if (!/logo|icon|favicon|sprite|avatar|badge|button|arrow|share|social|pixel|tracking/i.test(imgUrl) && imgUrl.length < 500) {
        htmlImages.push(imgUrl.startsWith("//") ? `https:${imgUrl}` : imgUrl);
      }
    }

    // Also extract from srcset for higher res
    const srcsetRegex = /srcset=["']([^"']+)/gi;
    while ((imgMatch = srcsetRegex.exec(html)) !== null) {
      const parts = imgMatch[1].split(",").map(s => s.trim().split(/\s+/)[0]).filter(Boolean);
      for (const p of parts) {
        if (/\.(jpg|jpeg|png|webp)/i.test(p) && !/logo|icon|favicon/i.test(p)) {
          htmlImages.push(p.startsWith("//") ? `https:${p}` : p);
        }
      }
    }

    // Step 2: AI extraction — comprehensive prompt
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let extractedData: any = null;

    if (LOVABLE_API_KEY && markdown) {
      try {
        const extractionPrompt = `You are an expert property data extractor. Extract EVERY possible piece of structured data from this scraped property listing. Be extremely thorough — this data powers an investment-grade audit report.

SOURCE URL: ${formattedUrl}
PAGE TITLE: ${metadata.title || "Unknown"}
PAGE DESCRIPTION: ${metadata.description || ""}

SCRAPED CONTENT (first 10000 chars):
${markdown.slice(0, 10000)}

Extract ALL of the following. Return ONLY valid JSON (no markdown blocks):
{
  "address": "<full property address exactly as shown>",
  "askingPrice": <number — asking price in listing currency. CRITICAL: Extract from ANY source: visible price text, JSON-LD structured data, meta tags (og:price, product:price), hidden spans, data attributes, breadcrumb text, page title. For UAE/Dubai listings check for AED amounts anywhere. Convert text like "1.85M" to 1850000. NEVER return 0 unless truly impossible to find. If price shows as "POA" or "Price on Application" try harder — check agent notes, similar units in same development, or any price hint>,
  "currency": "<GBP/USD/SGD/EUR/AUD/AED etc>",
  "bedrooms": <number or null>,
  "bathrooms": <number or null>,
  "receptionRooms": <number or null>,
  "propertyType": "<Detached/Semi-Detached/Terraced/End-Terrace/Flat/Apartment/Maisonette/Bungalow/Penthouse/Studio/Condo/HDB/Villa/Townhouse/etc>",
  "sqft": <number or null — floor area in sq ft. Convert from sq m if needed (multiply by 10.764)>,
  "sqm": <number or null — floor area in sq m if stated>,
  "postcode": "<postcode/zip if found, or null>",
  "description": "<FULL property description — include everything, up to 2000 chars>",
  "keyFeatures": ["<feature1>", "<feature2>", ...up to 15],
  "epcRating": "<A/B/C/D/E/F/G or null>",
  "epcUrl": "<link to full EPC certificate if available, or null>",
  "tenure": "<Freehold/Leasehold/Share of Freehold/Commonhold or null>",
  "leaseLength": "<e.g. '125 years remaining' or null>",
  "councilTaxBand": "<A-H or null>",
  "groundRent": "<annual amount or null>",
  "serviceCharge": "<annual amount or null>",
  "listedDate": "<date listed or null>",
  "agentName": "<estate agent/agency name>",
  "agentEmail": "<agent email if visible>",
  "agentPhone": "<agent phone if visible>",
  "agentAddress": "<agent office address if visible>",
  "agentWebsite": "<agent website URL — NOT the portal URL>",
  "images": [<up to 15 image URLs found in content — prioritise property photos, not icons/logos>],
  "floorplan": "<floorplan image URL or null>",
  "source": "<Rightmove/Zillow/Zoopla/PropertyGuru/Redfin/OnTheMarket/Domain/Idealista etc>",
  "country": "<UK/USA/Singapore/Australia/Spain/etc>",
  "parking": "<e.g. Driveway/Garage/Allocated/Street/None or null>",
  "garden": "<e.g. Rear Garden/Balcony/Communal/None or null>",
  "heating": "<e.g. Gas Central Heating/Electric/Underfloor or null>",
  "broadband": "<speed or provider info if mentioned, or null>",
  "floodRisk": "<low/medium/high or null if not mentioned>",
  "listedBuildingGrade": "<Grade I/II/II* or null>",
  "newBuild": <true/false or null>,
  "chainFree": <true/false or null>,
  "sharedOwnership": <true/false>,
  "retirementProperty": <true/false>,
  "auctionProperty": <true/false>,
  "priceHistory": [{"date": "<date>", "price": <number>, "event": "<listed/reduced/increased>"}],
  "nearestStation": "<name and distance if mentioned>",
  "nearbyAmenities": ["<shop>", "<school>", ...if mentioned],
  "propertyAge": "<e.g. Victorian/Edwardian/1930s/Modern/New Build or null>"
}

RULES:
- Only include data you can clearly extract. Use null for anything genuinely not found.
- For "images": prefer large property photos (not thumbnails). Include full URLs.
- For prices: extract the raw number without currency symbols.
- Be accurate — do NOT guess or fabricate data.`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Extract structured property data. Return ONLY valid JSON, no markdown." },
              { role: "user", content: extractionPrompt },
            ],
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          try { extractedData = JSON.parse(jsonStr); } catch (e) { console.error("Failed to parse extracted data:", jsonStr.slice(0, 300)); }
        }
      } catch (e) { console.error("AI extraction error:", e); }
    }

    // Step 3: Extract emails from listing page
    const listingEmails = extractEmails(markdown + "\n" + links.join("\n"));

    // Step 4: If no agent email yet, try scraping the agent's own website
    let agentSiteEmails: string[] = [];
    const hasEmail = extractedData?.agentEmail || listingEmails.length > 0;

    if (!hasEmail) {
      const agentWebsite = extractedData?.agentWebsite || findAgentWebsite(links, extractedData?.agentName);
      if (agentWebsite) {
        console.log("No email on listing — scraping agent website:", agentWebsite);
        const agentScrape = await scrapeUrl(apiKey, agentWebsite);
        agentSiteEmails = extractEmails(agentScrape.markdown + "\n" + agentScrape.links.join("\n"));
        if (agentSiteEmails.length === 0) {
          try {
            const contactUrl = `${new URL(agentWebsite).origin}/contact`;
            const contactScrape = await scrapeUrl(apiKey, contactUrl);
            agentSiteEmails = extractEmails(contactScrape.markdown + "\n" + contactScrape.links.join("\n"));
          } catch { /* ignore */ }
        }
      }
    }

    // Step 5: Web search fallback
    if (listingEmails.length === 0 && agentSiteEmails.length === 0 && extractedData?.agentName) {
      try {
        const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query: `${extractedData.agentName} estate agent email contact`, limit: 3, scrapeOptions: { formats: ["markdown"] } }),
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          for (const result of (searchData.data || [])) {
            agentSiteEmails.push(...extractEmails((result.markdown || "") + " " + (result.url || "")));
          }
        }
      } catch { /* ignore */ }
    }

    // Step 6: Pick best email
    const allFoundEmails = [...new Set([...listingEmails, ...agentSiteEmails])];
    let bestEmail = pickBestEmail(allFoundEmails);

    if (!bestEmail && !extractedData?.agentEmail) {
      const portalFallbacks: Record<string, string> = {
        rightmove: "enquiries@rightmove.co.uk",
        zoopla: "enquiries@zoopla.co.uk",
        onthemarket: "info@onthemarket.com",
      };
      const urlLower = formattedUrl.toLowerCase();
      for (const [portal, fallbackEmail] of Object.entries(portalFallbacks)) {
        if (urlLower.includes(portal)) { bestEmail = fallbackEmail; break; }
      }
    }

    // Merge images from links + HTML extraction + AI extraction
    const linkImages = links.filter(l => /\.(jpg|jpeg|png|webp)/i.test(l) && !/logo|icon|favicon|sprite|avatar/i.test(l)).slice(0, 15);

    if (extractedData) {
      const aiImages = extractedData.images || [];
      // Deduplicate and prioritise: AI-extracted > HTML-extracted > link-extracted
      const allImages = [...new Set([...aiImages, ...htmlImages, ...linkImages])].slice(0, 20);
      extractedData.images = allImages;
      if (!extractedData.agentEmail && bestEmail) extractedData.agentEmail = bestEmail;
    }

    // Diagnostic info surfaced in response so we can debug without log access.
    const _debug: Record<string, unknown> = {
      rawHtmlLen: rawHtml.length,
      hasPrimaryPriceTestId: /data-testid=["']primaryPrice["']/.test(rawHtml),
      hasResalePrice: /RESALEPRICE/.test(rawHtml),
      domPriceMatch: (rawHtml.match(/data-testid=["']primaryPrice["'][^>]*>\s*<span[^>]*>\s*([^<]+)</i) || [])[1] || null,
    };

    // ------------------------------------------------------------------
    // Authoritative price override (Rightmove + JSON-LD)
    // Run AFTER the AI extraction so we always prefer the structured price
    // from window.PAGE_MODEL over any inferred or noisy AI value.
    // ------------------------------------------------------------------
    try {
      // Always run structured extraction — handles Rightmove, Zoopla, Zillow,
      // Property24, PropertyFinder, Bayut, Idealista, and any OG/JSON-LD page.
      const structuredPrice = rawHtml ? extractRightmovePriceEnhanced(rawHtml, formattedUrl) : null;
      _debug.structuredPrice = structuredPrice;
      if (structuredPrice && structuredPrice.amount > 0) {
        if (!extractedData) extractedData = {};
        const aiPrice = Number(extractedData.askingPrice) || 0;
        _debug.raw_price = structuredPrice.amount;
        _debug.ai_price = aiPrice || null;
        // The DOM/PAGE_MODEL price is authoritative — always override AI if it differs
        // at all (AI tends to round £5,950,000 → £6,000,000 or interpret "Guide Price").
        if (!aiPrice || aiPrice !== structuredPrice.amount) {
          console.log(`[scrape-property] Overriding asking price: AI=${aiPrice} → PAGE_MODEL=${structuredPrice.amount}`);
          extractedData.askingPrice = structuredPrice.amount;
          extractedData._priceSource = "structured_dom";
          extractedData.raw_price = structuredPrice.amount;
          extractedData._priceQualifier = structuredPrice.qualifier || null;
        }
        if (!extractedData.currency && structuredPrice.currency) extractedData.currency = structuredPrice.currency;
      } else if (extractedData) {
        // Defensive clean: if AI returned a string like "Guide Price £550,000", coerce it.
        const aiPriceRaw = extractedData.askingPrice;
        if (typeof aiPriceRaw === "string") {
          const cleaned = cleanPriceString(aiPriceRaw);
          if (cleaned > 0) extractedData.askingPrice = cleaned;
        }
        // Additional fallback: scan markdown for the largest comma-formatted
        // price near currency symbols to override AI-rounded values.
        try {
          const currencyRe = /([£$€]|AED|R)\s?([\d]{1,3}(?:[, ]\d{3}){1,4})(?!\s*(?:sqft|sq|pcm|pw|per|month|week))/gi;
          const matches: number[] = [];
          let mm: RegExpExecArray | null;
          while ((mm = currencyRe.exec(markdown)) !== null) {
            const n = cleanPriceString(mm[2]);
            if (n >= 10_000 && n <= 500_000_000) matches.push(n);
          }
          if (matches.length) {
            const top = matches.sort((a, b) => b - a)[0];
            const aiP = Number(extractedData.askingPrice) || 0;
            // Only override if AI value looks rounded (ends in many zeros) or missing
            const isRounded = aiP > 0 && aiP % 100_000 === 0 && top % 100_000 !== 0 && Math.abs(aiP - top) / top < 0.1;
            if (!aiP || isRounded) {
              extractedData.askingPrice = top;
              extractedData._priceSource = "markdown_scan";
              _debug.markdown_price = top;
            }
          }
        } catch { /* ignore */ }
      }
    } catch (e) {
      console.warn("[scrape-property] Price override skipped:", (e as Error).message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedData,
        rawMarkdown: markdown.slice(0, 3000),
        metadata: { title: metadata.title, description: metadata.description, sourceUrl: metadata.sourceURL || formattedUrl, ogImage: metadata.ogImage || null },
        _debug,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[scrape-property] error:", error);
    const msg = error instanceof Error ? error.message : "Failed to scrape listing";
    return new Response(JSON.stringify({ 
      success: false, 
      error: msg,
      userMessage: "We couldn't retrieve the listing details. This can happen with new listings or when portals block automated access. Try a different property or paste the address manually.",
      retryable: true
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
