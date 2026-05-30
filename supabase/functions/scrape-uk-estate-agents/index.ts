import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AgentRecord {
  agent_name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  source_url: string;
}

function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const found = text.match(emailRegex) || [];
  // Filter out image/file extensions and common false positives
  return found.filter(
    (e) =>
      !e.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i) &&
      !e.includes("example.com") &&
      !e.includes("sentry.io")
  );
}

function extractPhones(text: string): string[] {
  const phoneRegex =
    /(?:(?:\+44|0)\s*(?:\d[\s\-]?){9,10})|(?:(?:\+44|0)\d{10,11})/g;
  return text.match(phoneRegex) || [];
}

function scoreEmail(email: string): number {
  const lower = email.toLowerCase();
  if (lower.startsWith("sales@")) return 10;
  if (lower.startsWith("enquiries@")) return 9;
  if (lower.startsWith("lettings@")) return 8;
  if (lower.startsWith("info@")) return 7;
  if (lower.startsWith("contact@")) return 6;
  if (lower.startsWith("hello@")) return 5;
  if (lower.startsWith("office@")) return 4;
  return 1;
}

function pickBestEmail(emails: string[]): string | null {
  if (!emails.length) return null;
  return emails.sort((a, b) => scoreEmail(b) - scoreEmail(a))[0];
}

// Pre-defined list of top UK estate agent websites to scrape contact pages
const DEFAULT_TARGETS = [
  { url: "https://www.knightfrank.co.uk/contact", name: "Knight Frank" },
  { url: "https://www.savills.co.uk/contact-us.aspx", name: "Savills" },
  { url: "https://www.foxtons.co.uk/contact/", name: "Foxtons" },
  { url: "https://www.hamptons.co.uk/contact-us/", name: "Hamptons" },
  { url: "https://www.dexters.co.uk/contact", name: "Dexters" },
  { url: "https://www.winkworth.co.uk/contact-us", name: "Winkworth" },
  { url: "https://www.marsh-parsons.co.uk/contact/", name: "Marsh & Parsons" },
  { url: "https://www.chestertons.com/contact/", name: "Chestertons" },
  {
    url: "https://www.kinleighfolkardandhayward.co.uk/contact-us/",
    name: "KFH",
  },
  { url: "https://www.struttandparker.com/contact", name: "Strutt & Parker" },
  {
    url: "https://www.jacksonhalleys.com/contact",
    name: "Jackson Halleys",
  },
  { url: "https://www.barnardmarcus.co.uk/contact/", name: "Barnard Marcus" },
  {
    url: "https://www.countrywide.co.uk/contact-us/",
    name: "Countrywide",
  },
  { url: "https://www.purplebricks.co.uk/contact-us", name: "Purplebricks" },
  { url: "https://www.yopa.co.uk/contact-us/", name: "Yopa" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Firecrawl connector not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const customUrls: { url: string; name: string }[] =
      body.targets || DEFAULT_TARGETS;
    const delayMs = body.delayMs || 2000; // Rate limiting: 2s between requests

    const results: AgentRecord[] = [];
    const errors: string[] = [];

    for (const target of customUrls) {
      try {
        console.log(`Scraping: ${target.url}`);

        // Rate limiting
        await new Promise((r) => setTimeout(r, delayMs));

        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: target.url,
            formats: ["markdown", "html"],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        const scrapeData = await scrapeRes.json();

        if (!scrapeRes.ok) {
          errors.push(`${target.name}: HTTP ${scrapeRes.status}`);
          continue;
        }

        const markdown =
          scrapeData.data?.markdown || scrapeData.markdown || "";
        const html = scrapeData.data?.html || scrapeData.html || "";
        const combined = markdown + " " + html;

        const emails = extractEmails(combined);
        const phones = extractPhones(combined);

        // Try to extract address from content
        const addressMatch = combined.match(
          /(?:head\s*office|address|located\s*at)[:\s]*([^<\n]{10,100})/i
        );

        const agent: AgentRecord = {
          agent_name: target.name,
          email: pickBestEmail(emails),
          phone: phones[0]?.replace(/\s+/g, " ").trim() || null,
          address: addressMatch?.[1]?.trim() || null,
          website: target.url.replace(/\/contact.*$/i, "/"),
          notes: `Found ${emails.length} email(s), ${phones.length} phone(s)`,
          source_url: target.url,
        };

        results.push(agent);
        console.log(
          `✓ ${target.name}: email=${agent.email}, phone=${agent.phone}`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${target.name}: ${msg}`);
        console.error(`✗ ${target.name}: ${msg}`);
      }
    }

    // Upsert into database (avoid duplicates by agent_name)
    let inserted = 0;
    for (const agent of results) {
      const { error } = await supabase.from("uk_estate_agents").upsert(
        {
          agent_name: agent.agent_name,
          address: agent.address,
          email: agent.email,
          phone: agent.phone,
          website: agent.website,
          notes: agent.notes,
          source_url: agent.source_url,
          scraped_at: new Date().toISOString(),
        },
        { onConflict: "agent_name", ignoreDuplicates: false }
      );

      if (!error) inserted++;
      else console.error(`DB error for ${agent.agent_name}:`, error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_targets: customUrls.length,
        scraped: results.length,
        saved: inserted,
        errors: errors.length,
        error_details: errors,
        agents: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
