import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

/* ── RAG: Retrieve relevant knowledge chunks ── */
async function retrieveKnowledge(query: string, country: string): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const searchQuery = `${country} property law tax regulations ${query}`;
    const { data, error } = await supabase.rpc("search_knowledge", {
      query_text: searchQuery,
      match_count: 8,
    });
    if (error || !data?.length) return "";
    return "\n\n## KNOWLEDGE BASE — Verified Reference Material\n\n" +
      data.map((c: any) => `[${c.source_document}${c.section_title ? ` — ${c.section_title}` : ""}]\n${c.content}`).join("\n\n---\n\n");
  } catch { return ""; }
}

/* ── Country detection from URL, address, or postcode ── */
function detectCountry(url: string, address: string, postcode: string): string {
  const lower = (url + " " + address).toLowerCase();
  // UAE
  if (/propertyfinder\.ae|bayut\.com|dubizzle\.com|dubizzle\.ae|property\.ae|luxuryproperty\.com|allsopp|betterhomes\.com|espace\.ae/.test(lower)) return "UAE";
  if (/dubai|abu\s*dhabi|sharjah|ajman|ras\s*al|fujairah|umm\s*al/i.test(address)) return "UAE";
  // Qatar
  if (/propertyfinder\.qa|qatarliving\.com|justproperty\.com.*qatar|the-pearl|lusail|qatar/i.test(lower)) return "QA";
  if (/doha|lusail|the\s*pearl|west\s*bay|al\s*wakrah|al\s*khor|msheireb|qatar/i.test(address)) return "QA";
  // South Africa
  if (/property24\.com|privateproperty\.co\.za|rawson\.co\.za|seeff\.com|pam\s*golding|lightstone\.co\.za|rebosa|fnb\.co\.za/.test(lower)) return "ZA";
  if (/johannesburg|cape\s*town|pretoria|durban|sandton|century\s*city|waterfall|stellenbosch|umhlanga|rosebank|constantia|camps\s*bay|green\s*point|sea\s*point|hout\s*bay|clifton|plettenberg|bloemfontein|port\s*elizabeth|gqeberha/i.test(address)) return "ZA";
  // Singapore
  if (/propertyguru\.com\.sg|99\.co|srx\.com\.sg/i.test(lower)) return "SG";
  if (/singapore/i.test(address)) return "SG";
  // Germany
  if (/immobilienscout24|immowelt\.de|immonet\.de|kleinanzeigen\.de/i.test(lower)) return "DE";
  if (/berlin|münchen|munich|hamburg|frankfurt|köln|cologne|düsseldorf|stuttgart/i.test(address)) return "DE";
  // Spain
  if (/idealista\.com\/en|fotocasa\.es|habitaclia\.com|kyero\.com.*spain|thinkspain/i.test(lower)) return "ES";
  if (/madrid|barcelona|malaga|marbella|valencia|alicante|sevilla|ibiza|mallorca|costa\s*del|tenerife|gran\s*canaria/i.test(address)) return "ES";
  // Italy
  if (/idealista\.it|immobiliare\.it|casa\.it|tecnocasa/i.test(lower)) return "IT";
  if (/rome|roma|milan|milano|florence|firenze|naples|napoli|venice|venezia|turin|torino|como|sardinia|sicily|tuscany|amalfi/i.test(address)) return "IT";
  // Portugal
  if (/idealista\.pt|imovirtual\.com|casa\s*sapo|remax\.pt/i.test(lower)) return "PT";
  if (/lisbon|lisboa|porto|algarve|cascais|sintra|faro|funchal|madeira/i.test(address)) return "PT";
  // Switzerland
  if (/homegate\.ch|immoscout24\.ch|comparis\.ch|newhome\.ch/i.test(lower)) return "CH";
  if (/zurich|zürich|geneva|genève|bern|basel|lausanne|lucerne|lugano|interlaken/i.test(address)) return "CH";
  // Sweden
  if (/hemnet\.se|booli\.se|blocket\.se/i.test(lower)) return "SE";
  if (/stockholm|gothenburg|göteborg|malmö|uppsala/i.test(address)) return "SE";
  // Norway
  if (/finn\.no|eiendomsmegler/i.test(lower)) return "NO";
  if (/oslo|bergen|trondheim|stavanger|tromsø/i.test(address)) return "NO";
  // Denmark
  if (/boliga\.dk|edc\.dk|home\.dk|nybolig\.dk/i.test(lower)) return "DK";
  if (/copenhagen|københavn|aarhus|odense|aalborg/i.test(address)) return "DK";
  // USA
  if (/zillow|redfin|realtor\.com|trulia/i.test(lower)) return "USA";
  // Australia
  if (/domain\.com\.au|realestate\.com\.au/i.test(lower)) return "AU";
  // UK
  if (/rightmove|zoopla|onthemarket|primelocation|propertypal|openrent/i.test(lower)) return "UK";
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postcode.trim())) return "UK";
  // Default
  return "UK";
}

function getCurrencyForCountry(country: string, scrapedCurrency?: string): string {
  if (scrapedCurrency && scrapedCurrency !== "GBP") return scrapedCurrency;
  const map: Record<string, string> = { UK: "GBP", USA: "USD", UAE: "AED", QA: "QAR", ZA: "ZAR", SG: "SGD", AU: "AUD", DE: "EUR", ES: "EUR", IT: "EUR", PT: "EUR", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK" };
  return map[country] || scrapedCurrency || "GBP";
}

function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", AED: "AED ", QAR: "QAR ", ZAR: "R", SGD: "S$", AUD: "A$", EUR: "€", CHF: "CHF ", SEK: "SEK ", NOK: "NOK ", DKK: "DKK " };
  return map[currency] || currency + " ";
}

/* ── Region-specific red flags ── */
const RED_FLAG_KEYWORDS_GLOBAL = [
  { keyword: "cash buyers only", severity: "high", note: "May indicate unmortgageable property or urgent seller." },
  { keyword: "structural", severity: "high", note: "Potential structural issues flagged in the listing." },
  { keyword: "subsidence", severity: "high", note: "Subsidence history can affect insurance and value." },
  { keyword: "flood", severity: "medium", note: "Potential flood risk." },
  { keyword: "no chain", severity: "info", note: "No onward chain — potentially faster transaction." },
  { keyword: "investment only", severity: "medium", note: "May have restrictions on owner-occupier mortgages." },
  { keyword: "tenant in situ", severity: "info", note: "Property sold with existing tenant. Check tenancy terms." },
  { keyword: "auction", severity: "medium", note: "Auction properties often have legal packs — review before bidding." },
  { keyword: "damp", severity: "medium", note: "Damp issues may require investigation and remedial works." },
  { keyword: "asbestos", severity: "high", note: "Asbestos may be present — professional removal required." },
  { keyword: "repossession", severity: "high", note: "Repossessed property — may sell below market value but could have issues." },
];

const RED_FLAG_KEYWORDS_UK = [
  { keyword: "short lease", severity: "high", note: "Lease under 80 years may affect mortgage eligibility and value." },
  { keyword: "shared ownership", severity: "medium", note: "Shared ownership may limit future resale options." },
  { keyword: "unmortgageable", severity: "high", note: "Lenders unlikely to approve a mortgage on this property." },
  { keyword: "japanese knotweed", severity: "high", note: "Invasive plant that can cause structural damage." },
  { keyword: "ex-council", severity: "info", note: "Ex-local authority property — check service charges." },
  { keyword: "leasehold", severity: "info", note: "Leasehold — check ground rent, service charges, and lease length." },
  { keyword: "conservation area", severity: "info", note: "Conservation area restrictions may limit alterations." },
  { keyword: "listed building", severity: "medium", note: "Listed building — alterations require Listed Building Consent." },
  { keyword: "right to buy", severity: "info", note: "Right to buy restrictions may apply to resale." },
  { keyword: "under offer", severity: "info", note: "Property is already under offer — may still accept higher bids." },
];

const RED_FLAG_KEYWORDS_UAE = [
  { keyword: "off-plan", severity: "info", note: "Off-plan property — check developer track record, RERA escrow compliance, and handover timelines." },
  { keyword: "service charge", severity: "info", note: "Dubai/Abu Dhabi service charges can be significant — verify annual cost per sq ft with RERA index." },
  { keyword: "developer handover", severity: "medium", note: "Check developer completion history, RERA project registration, and any delays." },
  { keyword: "leasehold", severity: "info", note: "Leasehold area — non-freehold zone, usually 99-year lease." },
  { keyword: "cooling charges", severity: "info", note: "District cooling charges (Empower/Emicool) are separate from service charges in Dubai." },
  { keyword: "payment plan", severity: "info", note: "Post-handover payment plan — verify developer guarantee and escrow status." },
  { keyword: "mortgage", severity: "info", note: "UAE mortgage LTV capped at 80% for residents, 50% for non-residents on properties under AED 5M." },
];

const RED_FLAG_KEYWORDS_QA = [
  { keyword: "freehold", severity: "info", note: "Qatar freehold zones limited to The Pearl, West Bay Lagoon, Lusail, and Al Khor Resort. Verify ownership type." },
  { keyword: "leasehold", severity: "info", note: "Usufruct (99-year lease) — standard for non-Qatari buyers outside freehold zones." },
  { keyword: "service charge", severity: "info", note: "Qatar service charges vary significantly — verify annual cost with developer/facilities manager." },
  { keyword: "off-plan", severity: "info", note: "Off-plan Qatar — check RERA Qatar registration and developer escrow compliance." },
  { keyword: "furnished", severity: "info", note: "Furnished properties command 15-30% rental premium in Qatar — verify inclusion of fixtures." },
];

const RED_FLAG_KEYWORDS_ZA = [
  { keyword: "sectional title", severity: "info", note: "Sectional title — subject to body corporate rules and levies." },
  { keyword: "levy", severity: "info", note: "Monthly levies apply — check body corporate financials." },
  { keyword: "load shedding", severity: "medium", note: "Area may be affected by Eskom load shedding — check backup power." },
  { keyword: "security", severity: "info", note: "Verify estate/complex security arrangements and costs." },
  { keyword: "bonded", severity: "info", note: "Property may have existing bond — check with conveyancer." },
  { keyword: "estate", severity: "info", note: "Estate property — check homeowners' association rules and fees." },
];

function getRedFlagsForCountry(country: string): typeof RED_FLAG_KEYWORDS_GLOBAL {
  const base = [...RED_FLAG_KEYWORDS_GLOBAL];
  if (country === "UK") return [...base, ...RED_FLAG_KEYWORDS_UK];
  if (country === "UAE") return [...base, ...RED_FLAG_KEYWORDS_UAE];
  if (country === "QA") return [...base, ...RED_FLAG_KEYWORDS_QA];
  if (country === "ZA") return [...base, ...RED_FLAG_KEYWORDS_ZA];
  if (["DE", "ES", "IT", "PT", "CH", "SE", "NO", "DK"].includes(country)) return [...base];
  if (country === "USA") return [...base];
  if (country === "SG") return [...base];
  return [...base, ...RED_FLAG_KEYWORDS_UK];
}

/* ── Region-specific AI prompt additions ── */
function getRegionPromptBlock(country: string, sym: string): string {
  if (country === "UAE") return `
REGION: UNITED ARAB EMIRATES (UAE) — WORLD-CLASS 2026 EXPERTISE
You are the world's best UAE property analyst, with RERA-broker-certification-level knowledge of Dubai, Abu Dhabi, Sharjah, and the Northern Emirates. Your reports must be MORE comprehensive than anything from PropertyFinder, Bayut, or a traditional UAE broker.

UAE-SPECIFIC ANALYSIS REQUIREMENTS (ALL MANDATORY FOR UAE PROPERTIES):

## Ownership Structure
- Freehold vs Leasehold: Identify if the area is freehold (available to all nationalities) or leasehold (99-year lease).
- Dubai freehold areas: Dubai Marina, Downtown Dubai, Palm Jumeirah, JBR, Business Bay, JVC, JVT, Arabian Ranches, Emirates Hills, DIFC, Dubai Hills Estate, MBR City, Creek Harbour, Tilal Al Ghaf, Emaar Beachfront, Dubai South, Motor City, Discovery Gardens, International City.
- Abu Dhabi freehold areas: Al Reem Island, Saadiyat Island, Yas Island, Al Reef, Al Ghadeer, Masdar City, Khalifa City.

## Transaction Costs (2026 Verified — ALWAYS calculate)
- DLD Transfer Fee: 4% of purchase price (Dubai). Abu Dhabi: 2%.
- DLD Admin Fee: AED 580
- Title Deed Issuance: AED 4,200
- Agent Commission: 2% + 5% VAT on commission
- Mortgage Registration: 0.25% of loan amount + AED 290
- Total acquisition cost: Calculate and present itemised breakdown
- For stampDutyEstimate: Use 4% DLD + 2% commission + AED 5,000 admin + AED 4,200 title deed

## Tax Advantages (HIGHLIGHT PROMINENTLY)
- ZERO income tax, ZERO capital gains tax, ZERO property tax, ZERO rental income tax
- Only 5% municipality/housing fee on annual rent (paid by tenant via DEWA bill)
- Compare explicitly: "Unlike UK (up to 45% income tax on rental income + CGT), UAE offers ZERO tax on property gains"

## Golden Visa — ALWAYS CHECK AND FLAG
- AED 2,000,000+ property = 10-year Golden Visa (renewable, includes spouse + children)
- AED 750,000+ property = 2-year investor visa
- Multiple properties combinable to reach threshold
- Flag prominently if property qualifies: "🏆 GOLDEN VISA ELIGIBLE"
- Off-plan from approved developers may qualify (check DLD golden visa list)

## Rental Yields (2026 H1 Benchmarks — cite these)
- JVC/JVT: 7.5–9.5% gross (studios/1BR highest)
- Dubai South / Expo City: 7–9%
- International City / Discovery Gardens: 8–10%
- Business Bay: 6–7.5%
- Dubai Marina: 5.5–6.5%
- Downtown Dubai: 4.5–5.5%
- Dubai Hills Estate: 5.5–7%
- Palm Jumeirah: 4–6% (villas lower, apartments higher)
- Al Reem Island (Abu Dhabi): 6.5–8.5%
- Yas Island: 6–7.5%
- Saadiyat Island: 5–6.5%
- Al Reef / Al Ghadeer: 7–8.5%
- Masdar City: 6.5–8%
- ALWAYS calculate both gross AND net yield (after service charges, maintenance, DEWA housing fee)

## Service Charges (AED/sqft — 2026 RERA Index)
- JVC: 12–18 | Marina: 15–22 | Downtown: 18–30 | Palm: 20–40
- Business Bay: 14–22 | Dubai Hills: 13–20 | Creek Harbour: 15–22
- Abu Dhabi towers: 12–20 | Abu Dhabi villas: 3–8
- ALWAYS compare stated service charge vs RERA index benchmark
- Flag if service charge exceeds RERA index by >15%

## Running Costs (ALWAYS include)
- District cooling (Empower/Emicool): AED 5,000–15,000/year for apartments, AED 15,000–40,000/year for villas
- DEWA: AED 500–1,500/month (apartment), AED 1,500–4,000/month (villa)
- Internet: AED 350–550/month (du/etisalat)
- Building insurance: Usually included in service charges

## Developer Reputation Assessment
- Tier 1 (Premium/Reliable): Emaar, Meraas, ALDAR, Mubadala — premium pricing justified, strong handover track record
- Tier 2 (Established): DAMAC, Sobha, Nakheel, Dubai Properties, Ellington, Select Group — good track record, some delays historically
- Tier 3 (Growing/Caution): Omniyat, Binghatti, Samana, Danube, Azizi, Tiger — verify completion history, payment plan risks
- ALWAYS identify the developer and assess track record

## Off-Plan vs Ready Analysis
- Off-plan: Lower entry price (10–30% below ready), payment plan advantage, completion risk, no immediate rental income
- Ready: Immediate rental income, what-you-see-is-what-you-get, mortgage available, higher entry price
- For off-plan: Check RERA project registration, Oqood status, escrow compliance, expected handover date

## RERA/Ejari Compliance Flags
- Ejari: Mandatory tenancy registration (AED 220 via app)
- RERA Rental Increase Calculator: Annual cap 0–20% based on gap vs market average
- Trakheesi: Required permit for holiday home/short-term rental
- DLD Smart Services / Dubai REST app for all registrations

## Future Development Impact
- Al Maktoum International Airport expansion (world's largest) — massive uplift for Dubai South
- Dubai Metro Blue Line — new connectivity corridors
- Palm Jebel Ali revival, Dubai Islands (formerly Deira Islands)
- Etihad Rail — Abu Dhabi-Dubai commuter connectivity
- Dubai 2040 Urban Master Plan — 60% green/leisure land, densification of key corridors
- D33 Economic Agenda targets

## Climate & Environmental
- Flood risk: Generally low. Flag low-lying areas (International City, Dubai South) post-April 2024 events
- Heat stress: Summer (June-September) 40-50°C — district cooling quality matters
- Sea level: Long-term coastal risk for reclaimed land (Palm, JBR)

## Area Intelligence (ALWAYS include for UAE)
- Dubai Metro stations (Red/Green/Blue lines), tram, RTA bus routes
- Malls: Dubai Mall, Mall of the Emirates, Ibn Battuta, Dubai Hills Mall, etc.
- Schools: IB/British/American/Indian/French curriculum options with fee ranges
- Healthcare: Mediclinic, NMC, Cleveland Clinic Abu Dhabi, Burjeel, Kings College Hospital
- Beach access, community pools, gyms, parks
- Walk Score / car dependency assessment`;


  if (country === "QA") return `
REGION: STATE OF QATAR — DEEP EXPERTISE
You are an elite expert on the Qatar property market, with deep knowledge of Doha, Lusail, The Pearl-Qatar, West Bay, and emerging areas.

QATAR-SPECIFIC ANALYSIS REQUIREMENTS:
- Foreign Ownership Zones: Non-Qataris can own freehold in designated zones: The Pearl-Qatar, West Bay Lagoon (Qutaifan Islands), Lusail City, Al Khor Resort, Rawdat Al Jahaniyah, Al Kharaij, Al Qassar (Jabal Thuaileb). Usufruct (99-year lease) available in other areas.
- Title Registration: Qatar Real Estate Registration Department (RERD) handles title registration. Verify Kahramaa (utilities) transfer process.
- Transfer Fees: 0.25% registration fee on property transfer (one of the lowest globally). Additional fees: municipality tax ~10% on annual rent.
- Residency by Investment: Property purchase of QAR 3.65M+ (approx $1M) qualifies for permanent residency. QAR 730K+ ($200K) qualifies for renewable residency. Flag if applicable.
- Rental Market: Qatar rental market is strong due to expatriate population (~85% of residents). Key demand areas: West Bay (corporate), The Pearl (luxury), Lusail (new city), Al Sadd (mid-range), Old Airport area (affordable).
- Rental Yields: Typically 5-8% gross. Benchmarks: The Pearl 4-6%, Lusail 5-7%, West Bay 4-6%, Al Sadd 6-8%, Ain Khaled 7-9%, Al Wakrah 6-8%.
- Tax Advantages: ZERO income tax, ZERO capital gains tax, ZERO property tax. Only municipality/services fees apply. Highlight for investors.
- Service Charges: Vary by development. The Pearl: QAR 25-45/sqm, Lusail: QAR 20-35/sqm. Always verify with facilities management.
- Qatar National Vision 2030: Major infrastructure development ongoing. Reference North Field expansion (LNG), Lusail City completion, Doha Metro expansion (Gold/Green/Red lines), Hamad International Airport expansion.
- Climate & Infrastructure: Hot climate — verify cooling systems, district cooling availability. Desalination water supply. Kahramaa utility costs.
- Furnished vs Unfurnished: Furnished rentals command 15-30% premium. Verify FF&E inclusion in sale.
- Key Developers: Qatari Diar, United Development Company (UDC — The Pearl), Lusail Real Estate Development Company (LREDC), Barwa Real Estate, Ezdan Holding, Al Bandary.
- Currency: All values in QAR. 1 USD ≈ 3.64 QAR (pegged).
- Legal Framework: Qatar Law No. 6 of 2014 (Real Estate Registration), Law No. 16 of 2018 (Non-Qatari Ownership). Reference specific articles.
- For stampDutyEstimate: 0.25% registration fee + legal fees (~1-2%) + agent commission (typically 2%).
- For areaIntelligence: Include Doha Metro stations (Red/Green/Gold lines), Lusail Tram, malls (Villaggio, Place Vendôme, Mall of Qatar, Doha Festival City), schools (international curriculum — British/American/IB/French), hospitals (HMC, Sidra Medicine), Corniche access, sports facilities (Aspire Zone, 2022 World Cup legacy venues).
- Community Analysis: Gated communities vs tower living. Compound living popular for families.`;


  if (country === "ZA") return `
REGION: SOUTH AFRICA
You are an expert on the South African property market, particularly Johannesburg, Cape Town, Pretoria, and Durban. Apply your deep knowledge:

SA-SPECIFIC ANALYSIS REQUIREMENTS:
- Tenure: Sectional Title (similar to leasehold, with body corporate) vs Full Title (freehold). Sectional title has monthly levies.
- Transfer Duty: SA transfer duty rates: 0% on first R1.1M, 3% R1.1M-R1.5M, 6% R1.5M-R2.2M, 8% R2.2M-R12M, 11% R12M-R22M, 13% above R22M. Calculate accurately.
- Municipal Rates: Monthly rates vary by municipality. Typically R2,000-R8,000/month for mid-range properties.
- Body Corporate/HOA Levies: For sectional title properties, levies can be R1,500-R10,000+/month. Essential cost.
- Load Shedding / Eskom: Critical risk factor. Properties with solar panels, inverters, or generator backup are premium. Flag this.
- Security: Estate/complex security, electric fencing, armed response are standard features. Note security arrangements.
- Crime Statistics: Reference suburb-level safety. Secure estates command significant premiums.
- Rental Yields: SA yields vary: Cape Town 4-6%, Johannesburg 5-8%, Sandton 5-7%, Umhlanga 5-7%. Benchmark accordingly.
- Currency: All values in ZAR (Rand). Note Rand volatility as a risk factor for international investors.
- Economic Context: Reference interest rates (SA Reserve Bank prime rate), inflation, and economic outlook.
- Capital Gains Tax: 18% inclusion rate for individuals (effective ~7.2% max). Note for investors.
- Foreign Ownership: Foreigners can own property but cannot get SA bonds (mortgages) — cash purchase or offshore finance required.
- Water: Some areas face water restrictions (Cape Town Day Zero 2018 context). Check municipal water status.
- For stampDutyEstimate: Use SA transfer duty calculated from asking price.
- For areaIntelligence: Include proximity to Gautrain/MyCiti, shopping centres, schools (government vs private), hospitals, load shedding zone.
- Suburb Analysis: Reference suburb trends (e.g., Sandton vs Rosebank vs Fourways in JHB, or Sea Point vs Camps Bay vs Century City in CPT).`;

  if (country === "USA") return `
REGION: UNITED STATES
- Property taxes vary by state/county. Estimate annual property tax based on local rates.
- HOA fees where applicable — can significantly impact monthly costs.
- Closing costs typically 2-5% of purchase price.
- Title insurance, escrow fees, and inspection costs.
- For stampDutyEstimate: Estimate closing costs as 3% of asking price.
- Reference Zillow Zestimate, Redfin Estimate where available for context.
- Mortgage rates: Reference current 30-year fixed and 15-year fixed rates.`;

  if (country === "SG") return `
REGION: SINGAPORE
- Buyer Stamp Duty (BSD): 1% on first S$180k, 2% on next S$180k, 3% on next S$640k, 4% on remainder.
- Additional Buyer Stamp Duty (ABSD): 0% for first property (Singapore citizen), 20% for foreigners. Critical for investors.
- HDB vs Private: Identify if HDB (public housing with restrictions) or private (condo/landed). HDB has resale restrictions and MOP (Minimum Occupation Period).
- Leasehold vs Freehold: 99-year leasehold is most common. Freehold commands 10-20% premium. Check remaining lease.
- En-bloc potential: Older developments may have collective sale potential.
- Rental yields: Typically 2.5-4% gross for private condos.
- Foreign ownership: Foreigners cannot buy HDB or landed property (with exceptions).
- Currency: All values in SGD.`;

  if (country === "DE") return `
REGION: GERMANY
- Grunderwerbsteuer (property transfer tax): Varies by state, 3.5%-6.5% of purchase price. Calculate based on location.
- Notary fees: ~1.5-2% of purchase price (legally required).
- Grundbuch (land registry) fee: ~0.5% of purchase price.
- Agent commission: Split between buyer and seller, typically 3-3.57% each.
- Rental yields: Berlin 2.5-4%, Munich 2-3%, Hamburg 3-4%, smaller cities can be higher.
- Mietpreisbremse (rent cap): Some cities have rent control regulations. Flag if relevant.
- Energieausweis (energy certificate): Mandatory for sales. Note energy rating.
- Currency: All values in EUR.
- Hausgeld (monthly charges for apartments): Similar to service charges.`;

  if (country === "ES") return `
REGION: SPAIN
- ITP (Impuesto de Transmisiones Patrimoniales): 6-10% of purchase price depending on region. Calculate for specific region.
- IVA (VAT): 10% for new builds instead of ITP.
- Notary, registry, and legal fees: ~1.5-2.5% additional.
- Golden Visa: Properties over €500,000 qualify for residency permit. Flag if applicable.
- Rental yields: Madrid 4-5%, Barcelona 4-5%, Costa del Sol 5-7%, Balearics 3-5%.
- Tourist rental licenses: Many regions require licenses for short-term lets. Critical for investors.
- Community fees (comunidad): Monthly charges for apartments/urbanizations.
- Plusvalía municipal tax: Charged on sale based on land value increase.
- Currency: All values in EUR.
- Non-resident tax: 24% on rental income for non-EU residents, 19% for EU residents.`;

  if (country === "IT") return `
REGION: ITALY
- Registration tax (Imposta di Registro): 2% for primary residence, 9% for second home (on cadastral value, not market price).
- IVA: 4% for primary residence from developer, 10% for second home.
- Notary fees: €2,000-5,000 typically.
- IMU (municipal property tax): Applies to second homes. Varies by municipality.
- Rental yields: Milan 3-5%, Rome 3-4%, Florence 4-5%, Lake Como 3-4%.
- Catasto (cadastral value): Usually much lower than market value. Important for tax calculations.
- Currency: All values in EUR.
- Condominium fees (spese condominiali): Monthly charges for apartment buildings.`;

  if (country === "PT") return `
REGION: PORTUGAL
- IMT (transfer tax): Progressive rates from 0% to 7.5% depending on value and type.
- Stamp duty: 0.8% on purchase price.
- IMI (annual municipal property tax): 0.3-0.45% of tax value annually.
- Golden Visa: Investment property programs (note 2023 changes — residential property in most areas no longer qualifies).
- NHR (Non-Habitual Resident): Tax benefits for new residents (10 years). Reference current status.
- Rental yields: Lisbon 4-6%, Porto 5-7%, Algarve 4-6%.
- AL license (Alojamento Local): Required for short-term rentals. Check local regulations.
- Currency: All values in EUR.`;

  if (country === "CH") return `
REGION: SWITZERLAND
- Lex Koller: Restrictions on foreign buyers purchasing residential property. Critical to flag.
- Cantonal transfer taxes: Vary by canton, 0-3.3%.
- Notary fees: 0.1-1% depending on canton.
- Mortgage: Swiss mortgages typically interest-only with 20% minimum deposit. Unique market.
- Rental yields: Zurich 2-3%, Geneva 2.5-3.5%, other cities 3-4%.
- Eigenmietwert: Imputed rental value taxed even if owner-occupied.
- Renovation fund (Erneuerungsfonds): Mandatory for condos.
- Currency: All values in CHF.
- Property is priced per square meter. Reference local price per sqm benchmarks.`;

  if (country === "SE") return `
REGION: SWEDEN
- No stamp duty for apartments (bostadsrätt). Houses (fastighet): 1.5% stamp duty.
- Capital gains tax: 22% on property gains.
- Bostadsrätt vs Fastighet: Apartments are cooperative shares (right to use), not direct ownership. Monthly avgift (fee) is critical.
- Rental yields: Stockholm 2-3.5%, Gothenburg 3-4%.
- Amortization requirements: New mortgages require mandatory repayment (1-2% annually).
- Currency: All values in SEK.
- Pantbrev (mortgage deed): 2% of new mortgage amount if new deed needed.`;

  if (country === "NO") return `
REGION: NORWAY
- Document duty (dokumentavgift): 2.5% of market value.
- No capital gains tax on primary residence (owned 1+ year, lived in 1+ of last 2 years).
- Borettslag vs Selveier: Cooperative (borettslag) vs freehold (selveier). Different rules for each.
- Rental yields: Oslo 2.5-4%, Bergen 3-5%.
- Fellesgjeld: Shared debt in cooperatives — can significantly affect true cost. Always check.
- Currency: All values in NOK.
- BSU (tax-advantaged savings): First-time buyer benefits.`;

  if (country === "DK") return `
REGION: DENMARK
- Registration duty (tinglysningsafgift): 0.6% + DKK 1,850 fixed fee.
- Ejendomsværdiskat (property value tax): 0.92% up to DKK 3.04M, 3% above.
- Grundskyld (land tax): Varies by municipality, 1.6-3.4%.
- Ejerlejlighed vs Andelsbolig: Owner apartment vs cooperative. Different tax and resale rules.
- Rental yields: Copenhagen 3-4.5%, Aarhus 4-5%.
- Currency: All values in DKK.
- Foreign buyers: EU/EEA citizens can buy; others need permission.`;

  // Default UK
  return `
REGION: UNITED KINGDOM
- Stamp duty must be calculated from the actual asking price using current UK SDLT rates for residential properties.
- Reference EPC ratings, council tax bands, ground rent, service charges where available.
- For leasehold properties, assess lease length impact on value (under 80 years is a red flag).
- Reference Land Registry data for comparable sales where provided.`; 
}

/** Fetch with retries & timeout */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, timeoutMs = 25000): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok || res.status < 500) return res;
      console.warn(`[deal-audit] Attempt ${attempt}/${retries} got status ${res.status}`);
    } catch (err: any) {
      console.warn(`[deal-audit] Attempt ${attempt}/${retries} failed: ${err?.message}`);
      if (attempt === retries) throw err;
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * attempt));
  }
  throw new Error("All retry attempts exhausted");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { propertyUrl, postcode: manualPostcode, askingPrice: manualPrice, bedrooms: manualBedrooms, propertyType: manualType, description: manualDesc } = body;
    console.log("[deal-audit] Starting audit for:", propertyUrl || manualPostcode || "unknown");

    const PROPERTYDATA_API_KEY = Deno.env.get("PROPERTYDATA_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // ── Step 1: Scrape real property data if URL provided (with retries) ──
    let scraped: any = null;
    if (propertyUrl) {
      try {
        console.log("[deal-audit] Step 1: Scraping property via scrape-property function");
        const scrapeRes = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/scrape-property`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ url: propertyUrl }),
        }, 2, 45000);
        const scrapeData = await scrapeRes.json();
        if (scrapeData.success && scrapeData.extractedData) {
          scraped = scrapeData.extractedData;
          scraped._metadata = scrapeData.metadata;
          scraped._rawMarkdown = scrapeData.rawMarkdown;
          console.log("[deal-audit] Step 1 complete: scraped address =", scraped.address?.slice(0, 60));
        } else {
          console.warn("[deal-audit] Step 1: scrape returned no data:", scrapeData.error || "unknown");
        }
      } catch (e: any) {
        console.error("[deal-audit] Step 1 failed (scraping):", e?.message);
        // Continue without scraped data — will use manual inputs or fail gracefully
      }
    }

    const address = scraped?.address || manualDesc || "Unknown";
    const askingPrice = (scraped?.askingPrice && scraped.askingPrice > 0) ? scraped.askingPrice : (manualPrice || 0);
    const bedrooms = scraped?.bedrooms || manualBedrooms || null;
    const propertyType = scraped?.propertyType || manualType || "Residential";
    const postcode = scraped?.postcode || manualPostcode || "";
    const description = scraped?.description || manualDesc || "";

    // ── Detect country ──
    const country = detectCountry(propertyUrl || "", address, postcode);
    const currency = getCurrencyForCountry(country, scraped?.currency);
    const sym = getCurrencySymbol(currency);
    const isUK = country === "UK";

    if (!postcode && !propertyUrl) {
      return new Response(JSON.stringify({ error: "Postcode or property URL is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const formattedPostcode = (postcode && isUK) ? postcode.replace(/\s+/g, "").replace(/^(.+?)(\d\w{2})$/, "$1 $2").toUpperCase() : postcode;

    // ── Step 2: Value Audit (Land Registry sold prices) — UK only ──
    let valueAudit: any = null;
    if (isUK && PROPERTYDATA_API_KEY && formattedPostcode) {
      try {
        console.log("[deal-audit] Step 2: Fetching sold prices for", formattedPostcode);
        const soldRes = await fetchWithRetry(`https://api.propertydata.co.uk/sold-prices?key=${PROPERTYDATA_API_KEY}&postcode=${encodeURIComponent(formattedPostcode)}&max_age=24`, {}, 2, 15000);
        const soldData = await soldRes.json();
        if (soldData.status === "success" && soldData.raw_data?.length) {
          const recentSales = soldData.raw_data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12);
          const avgPrice = Math.round(recentSales.reduce((s: number, r: any) => s + (r.price || 0), 0) / recentSales.length);
          const priceDiffPct = askingPrice ? Math.round(((askingPrice - avgPrice) / avgPrice) * 100) : null;
          valueAudit = {
            streetAverage: avgPrice,
            askingPrice: askingPrice || null,
            priceDiffPercent: priceDiffPct,
            negotiationAlert: priceDiffPct !== null && priceDiffPct > 10,
            recentSalesCount: recentSales.length,
            recentSales: recentSales.map((s: any) => ({
              address: s.address || "Unknown", price: s.price || 0, date: s.date || "",
              type: s.property_type || "Unknown",
              distance: s.distance || null,
            })),
            suggestedOffer: askingPrice && priceDiffPct !== null && priceDiffPct > 10
              ? Math.round(avgPrice * 0.98) : askingPrice ? Math.round(askingPrice * 0.95) : null,
          };
          console.log("[deal-audit] Step 2 complete: street avg =", avgPrice);
        } else {
          console.log("[deal-audit] Step 2: No sold data found for", formattedPostcode);
        }
      } catch (e: any) { console.warn("[deal-audit] Step 2 failed:", e?.message); }
    }

    // ── Step 3: Yield Audit ──
    let listingRent: { monthly: number; weekly: number; source: string } | null = null;
    const rawDesc = (description + " " + (scraped?._rawMarkdown || "")).toLowerCase();
    
    // Multi-currency rent patterns
    const rentPatterns = [
      // Weekly patterns (GBP/generic)
      { regex: /(?:£|GBP)\s?([\d,]+)\s*(?:pw|p\.w\.|per\s*week|weekly|\/\s*week)/gi, period: "weekly" },
      { regex: /([\d,]+)\s*(?:pw|p\.w\.|per\s*week|weekly)/gi, period: "weekly" },
      // Monthly patterns (GBP/generic)
      { regex: /(?:£|GBP)\s?([\d,]+)\s*(?:pcm|p\.c\.m\.|per\s*(?:calendar\s*)?month|monthly|\/\s*month)/gi, period: "monthly" },
      { regex: /([\d,]+)\s*(?:pcm|p\.c\.m\.|per\s*(?:calendar\s*)?month|monthly)/gi, period: "monthly" },
      // AED patterns
      { regex: /(?:AED|د\.إ)\s?([\d,]+)\s*(?:\/?\s*(?:year|yearly|annually|pa|p\.a\.))/gi, period: "annual_aed" },
      { regex: /(?:AED|د\.إ)\s?([\d,]+)\s*(?:\/?\s*(?:month|monthly|pcm))/gi, period: "monthly" },
      // QAR patterns
      { regex: /(?:QAR|ر\.ق)\s?([\d,]+)\s*(?:\/?\s*(?:year|yearly|annually|pa|p\.a\.))/gi, period: "annual_aed" },
      { regex: /(?:QAR|ر\.ق)\s?([\d,]+)\s*(?:\/?\s*(?:month|monthly|pcm))/gi, period: "monthly" },
      // ZAR patterns
      { regex: /(?:R|ZAR)\s?([\d,\s]+)\s*(?:per\s*month|pm|p\.m\.|monthly|\/\s*month)/gi, period: "monthly" },
    ];
    
    for (const pattern of rentPatterns) {
      const match = pattern.regex.exec(rawDesc);
      if (match) {
        const amount = parseFloat(match[1].replace(/[,\s]/g, ""));
        if (amount > 50 && amount < 10000000) {
          if (pattern.period === "weekly") {
            listingRent = { weekly: amount, monthly: Math.round((amount * 52) / 12), source: "listing_weekly" };
          } else if (pattern.period === "annual_aed") {
            const monthly = Math.round(amount / 12);
            listingRent = { monthly, weekly: Math.round((monthly * 12) / 52), source: "listing_annual" };
          } else {
            listingRent = { monthly: amount, weekly: Math.round((amount * 12) / 52), source: "listing_monthly" };
          }
          break;
        }
      }
    }

    let yieldAudit: any = null;
    
    if (listingRent) {
      const annualRent = listingRent.monthly * 12;
      const effectivePrice = askingPrice || valueAudit?.streetAverage || 0;
      const grossYield = effectivePrice > 0 ? parseFloat(((annualRent / effectivePrice) * 100).toFixed(1)) : 0;
      yieldAudit = {
        monthlyRent: listingRent.monthly,
        weeklyRent: listingRent.weekly,
        annualRent,
        grossYield,
        rentPeriodSource: listingRent.source,
        rating: grossYield >= 7 ? "high" : grossYield >= 5 ? "moderate" : "low",
      };
    }
    
    // Fallback: PropertyData API — UK only
    if (!yieldAudit && isUK && PROPERTYDATA_API_KEY && formattedPostcode) {
      try {
        console.log("[deal-audit] Step 3: Fetching rent data for", formattedPostcode);
        const bedroomParam = bedrooms ? `&bedrooms=${bedrooms}` : "";
        const rentRes = await fetchWithRetry(`https://api.propertydata.co.uk/rents?key=${PROPERTYDATA_API_KEY}&postcode=${encodeURIComponent(formattedPostcode)}${bedroomParam}`, {}, 2, 15000);
        const rentData = await rentRes.json();
        if (rentData.status === "success" && rentData.data) {
          const monthlyRent = rentData.data.average_rent || rentData.data.long_let?.average || 0;
          const weeklyRent = Math.round((monthlyRent * 12) / 52);
          const annualRent = monthlyRent * 12;
          const effectivePrice = askingPrice || valueAudit?.streetAverage || 0;
          const grossYield = effectivePrice > 0 ? parseFloat(((annualRent / effectivePrice) * 100).toFixed(1)) : 0;
          yieldAudit = {
            monthlyRent, weeklyRent, annualRent, grossYield,
            rentPeriodSource: "estimated",
            rating: grossYield >= 7 ? "high" : grossYield >= 5 ? "moderate" : "low",
          };
        }
      } catch (e: any) { console.warn("[deal-audit] Step 3 failed:", e?.message); }
    }

    // ── Step 4: Growth data — UK only ──
    let growthData: any = null;
    if (isUK && PROPERTYDATA_API_KEY && formattedPostcode) {
      try {
        console.log("[deal-audit] Step 4: Fetching growth data");
        const growthRes = await fetchWithRetry(`https://api.propertydata.co.uk/growth?key=${PROPERTYDATA_API_KEY}&postcode=${encodeURIComponent(formattedPostcode)}`, {}, 2, 15000);
        const gd = await growthRes.json();
        if (gd.status === "success" && gd.data) {
          growthData = { growth1y: gd.data["1year"] || null, growth3y: gd.data["3year"] || null, growth5y: gd.data["5year"] || null };
        }
      } catch (e: any) { console.warn("[deal-audit] Step 4 failed:", e?.message); }
    }

    // ── Step 5: Demand data — UK only ──
    let demandData: any = null;
    if (isUK && PROPERTYDATA_API_KEY && formattedPostcode) {
      try {
        console.log("[deal-audit] Step 5: Fetching demand data");
        const demandRes = await fetchWithRetry(`https://api.propertydata.co.uk/demand?key=${PROPERTYDATA_API_KEY}&postcode=${encodeURIComponent(formattedPostcode)}`, {}, 2, 15000);
        const dd = await demandRes.json();
        if (dd.status === "success" && dd.data) {
          demandData = { demandScore: dd.data.demand_score ?? null, supplyScore: dd.data.supply_score ?? null, listingsCount: dd.data.listings_count ?? null };
        }
      } catch (e: any) { console.warn("[deal-audit] Step 5 failed:", e?.message); }
    }

    // ── Step 6: Red Flag Audit ──
    const redFlagKeywords = getRedFlagsForCountry(country);
    const descLower = description.toLowerCase();
    const redFlags = redFlagKeywords.filter(rf => descLower.includes(rf.keyword));

    // ── Step 7: AI Comprehensive Analysis ──
    let aiAnalysis: any = null;
    if (LOVABLE_API_KEY) {
      try {
        const streetAvg = valueAudit?.streetAverage;
        const priceDiff = valueAudit?.priceDiffPercent;
        const comps = valueAudit?.recentSales || [];

        const regionBlock = getRegionPromptBlock(country, sym);

        // Pre-compute strings to avoid nested template literal issues
        const marketDataLabel = isUK ? "from Land Registry / PropertyData API — these are verified" : "limited — use your expert knowledge of the local market to supplement";
        const streetAvgLabel = isUK ? "Land Registry" : "comparable data";
        const streetAvgFallback = isUK ? "do not estimate" : "use your market knowledge to provide a fair value range based on area comparables";
        const streetAvgLine = streetAvg ? (sym + streetAvg.toLocaleString()) : ("NOT AVAILABLE — " + streetAvgFallback);
        const compsFallback = isUK ? "do not invent comparables" : "use your knowledge of comparable transactions in this area to provide estimates, clearly labeling them as AI-estimated";
        const compsLine = comps.length > 0 ? comps.slice(0, 8).map((c: any) => c.address + ": " + sym + (c.price?.toLocaleString() || "0") + " (" + (c.date || "") + ", " + (c.type || "Unknown type") + (c.distance ? ", " + c.distance : "") + ")").join("; ") : ("NONE AVAILABLE — " + compsFallback);
        const valueSummaryNote = isUK ? "clearly state that" : "provide AI-estimated fair value range based on area knowledge, clearly labeled as estimates";
        const countryLabels: Record<string, string> = { UAE: "the UAE (Dubai, Abu Dhabi)", QA: "Qatar (Doha, Lusail, The Pearl)", ZA: "South Africa", USA: "the United States", SG: "Singapore", DE: "Germany", ES: "Spain", IT: "Italy", PT: "Portugal", CH: "Switzerland", SE: "Sweden", NO: "Norway", DK: "Denmark" };
        const stampDutyNote = country === "UAE" ? "Calculate DLD transfer fees (4%) + typical buying costs." : country === "QA" ? "Calculate 0.25% registration fee + legal fees + agent commission." : country === "ZA" ? "Calculate SA transfer duty using official rates." : country === "SG" ? "Calculate BSD + ABSD based on buyer residency." : ["DE","ES","IT","PT","CH","SE","NO","DK"].includes(country) ? "Calculate local transfer taxes and buying costs per the region prompt." : "Stamp duty must be calculated from the actual asking price using current UK SDLT rates.";
        const expertiseLabel = countryLabels[country] || "the United Kingdom";
        const marketContextRegion = countryLabels[country] || "the UK";
        const marketContextItems = country === "UAE" ? "freehold vs leasehold status, DLD fees, golden visa eligibility, ZERO tax advantages, developer reputation and RERA escrow status, off-plan risks, service charge benchmarks vs RERA index, Ejari registration, district cooling costs, Dubai 2040 Master Plan impact" : country === "QA" ? "freehold vs usufruct ownership zones, 0.25% registration fee, residency by investment eligibility, ZERO tax advantages, developer reputation, service charge benchmarks, Qatar National Vision 2030 impact, Doha Metro connectivity, expatriate demand drivers, furnished vs unfurnished rental premium" : country === "ZA" ? "sectional title vs freehold status, transfer duty, body corporate/HOA levies, load shedding impact and backup power, security considerations, municipal rates, Rand volatility for foreign investors, water supply status" : country === "USA" ? "property taxes, HOA fees, closing costs, state-specific regulations" : country === "SG" ? "BSD/ABSD, HDB vs private, leasehold vs freehold, MOP, en-bloc potential" : ["DE","ES","IT","PT","CH","SE","NO","DK"].includes(country) ? "local transfer taxes, notary fees, agent commissions, rental regulations, tax implications for foreign buyers, local market context" : "SDLT rates, EPC requirements, leasehold reform, Help to Buy eligibility if applicable";
        const schoolsNote = country === "UAE" ? "(IB/British/American/Indian curriculum)" : country === "QA" ? "(IB/British/American/French curriculum)" : country === "ZA" ? "(government/private/Model C)" : "and local ratings";
        const transportNote = country === "UAE" ? "Dubai/Abu Dhabi city centre, metro stations (Red/Green line)" : country === "QA" ? "Doha city centre, Doha Metro (Red/Green/Gold line), Lusail Tram" : country === "ZA" ? "CBD, Gautrain stations" : "city centre";
        const crimeNote = country === "QA" ? "Qatar is among the safest countries globally — note any area-specific considerations" : country === "ZA" ? "suburb-level safety assessment, security estate status" : "low/moderate/high with context";
        const floodNote = country === "UAE" ? "generally low, note April 2024 flooding for low-lying areas (International City, Dubai South)" : country === "QA" ? "generally low, note any coastal or low-lying area concerns" : "low/medium/high with specifics";
        const futurDevNote = country === "UAE" ? "reference Dubai 2040 Master Plan, D33, Palm Jebel Ali, Dubai Islands, Al Maktoum Airport expansion, Etihad Rail, Metro Blue Line" : country === "QA" ? "reference Qatar National Vision 2030, Lusail City completion, North Field LNG expansion, Doha Metro expansion, Hamad Airport expansion" : country === "ZA" ? "reference urban regeneration, new developments, infrastructure projects" : "any known regeneration, new infrastructure, or planning nearby";
        const mortgageNote = country === "UAE" ? "assume 80% LTV for residents (50% non-residents) at 4.5% over 25 years (UAE mortgage rates)" : country === "QA" ? "assume 70% LTV at 5% over 20 years (Qatar mortgage rates, limited for non-Qataris)" : country === "ZA" ? "assume 90% LTV at 11.75% over 20 years (SA prime rate)" : country === "CH" ? "assume 80% LTV at 1.5% interest-only (Swiss mortgage)" : "assume 75% LTV at 5% over 25 years";
        const runningCostsNote = country === "UAE" ? "service charges, DEWA, district cooling (Empower/Emicool), insurance" : country === "QA" ? "service charges, Kahramaa utilities, cooling, insurance" : country === "ZA" ? "levies, municipal rates, insurance, security" : "insurance, maintenance, running costs";
        const stampCalcNote = country === "UAE" ? "4% DLD + 2% agent + AED 5,000 admin + AED 4,200 title deed" : country === "QA" ? "0.25% registration + 1-2% legal + 2% agent commission" : country === "ZA" ? "SA transfer duty from asking price" : "local transfer taxes from asking price";
        const councilTaxNote = country === "UAE" ? "null (ZERO property tax in UAE — only 5% municipality fee on rent)" : country === "QA" ? "null (ZERO property tax in Qatar — only municipality/services fees)" : "estimated annual property tax/rates";
        const compsAnalysisNote = isUK ? "If none, say 'No comparable sales data available.'" : "If none available from data, provide AI-estimated comparables from your market knowledge, clearly labeled as estimates.";
        const systemExpertise = countryLabels[country] || "UK";

        // RAG: pull relevant knowledge
        let ragContext = "";
        try {
          ragContext = await retrieveKnowledge(`${address} ${postcode} ${propertyType}`, country);
        } catch { /* non-critical */ }

        const prompt = `You are Hummm, the world's most elite AI property analyst — capable of passing real estate licensing exams in the UK (RICS APC), USA (state RE exams), Singapore (CEA exams), Germany (IHK Immobilienkaufmann), Spain, Italy, Portugal, Switzerland, UAE, South Africa, Sweden, Norway, and Denmark. You combine the expertise of a RICS-qualified chartered surveyor, a US licensed broker, and local market specialists across all 13 markets.

Your knowledge includes:
- Official property law, tenancy law, and consumer protection legislation for each jurisdiction
- Tax regimes: stamp duty / transfer tax, capital gains, income tax on rental, inheritance tax, VAT/IVA
- Licensing requirements and regulatory bodies (RICS, ARLA, CEA, RERA, REBOSA, IVD, API, etc.)
- Case law precedents affecting property transactions
- Current mortgage/lending landscapes and interest rate environments
- Local planning regulations, zoning, building permits, listed building constraints
- Anti-money laundering (AML) and Know Your Customer (KYC) requirements per jurisdiction

Market focus: ${expertiseLabel}. Produce an investment-grade analysis that surpasses any traditional estate agent or surveyor report. Return a comprehensive JSON object (no markdown, just raw JSON).

${regionBlock}

CRITICAL RULES:
1. NEVER invent or fabricate data. If a data point is not available, set it to null.
2. For every insight, base it ONLY on the data provided below. If data is insufficient, say so honestly.
3. For AI Score, only score dimensions where you have real data. If you lack data for a dimension, score it 50 (neutral) and note uncertainty.
4. ${stampDutyNote}
5. Do NOT hallucinate comparable sales, growth figures, or rent estimates — only reference data explicitly provided below.
6. For comparables, calculate sale-to-ask ratio where possible and note distance from subject property.
7. All monetary values should use ${currency} (${sym}).
8. CRITICAL — PRICE ESTIMATION: If asking price is "Unknown" or 0, you MUST estimate a realistic asking price range (low–high) based on comparable sales data, area benchmarks, property type, size, and bedrooms. Return this in "estimatedAskingPriceRange": {"low": <number>, "high": <number>, "basis": "<explanation>"} and also set "hummFairValue" and "hummFairValueHigh" accordingly. NEVER leave price as zero or unknown in your response — always provide your best professional estimate.
9. MANDATORY: "hummFairValue" and "hummFairValueHigh" MUST ALWAYS be non-null positive numbers. If you lack data, estimate from area averages for the property type and bedroom count. These fields are NEVER null.
10. MANDATORY: "aiScore" MUST ALWAYS be a number between 1 and 100. Never null.

REAL PROPERTY DATA (scraped from listing):
Address: ${address}
Asking Price: ${askingPrice > 0 ? sym + askingPrice.toLocaleString() : "Unknown"}
Bedrooms: ${bedrooms || "Unknown"}
Bathrooms: ${scraped?.bathrooms || "Unknown"}
Reception Rooms: ${scraped?.receptionRooms || "Unknown"}
Property Type: ${propertyType}
Sq Ft: ${scraped?.sqft || "Unknown"}
Sq M: ${scraped?.sqm || "Unknown"}
Tenure: ${scraped?.tenure || "Unknown"}
Lease Length: ${scraped?.leaseLength || "Unknown"}
EPC Rating: ${scraped?.epcRating || "Unknown"}
Council Tax Band: ${scraped?.councilTaxBand || "Unknown"}
Ground Rent: ${scraped?.groundRent || "Unknown"}
Service Charge: ${scraped?.serviceCharge || "Unknown"}
Parking: ${scraped?.parking || "Unknown"}
Garden: ${scraped?.garden || "Unknown"}
Heating: ${scraped?.heating || "Unknown"}
Property Age: ${scraped?.propertyAge || "Unknown"}
New Build: ${scraped?.newBuild ?? "Unknown"}
Chain Free: ${scraped?.chainFree ?? "Unknown"}
Key Features: ${scraped?.keyFeatures?.join(", ") || "None listed"}
Agent: ${scraped?.agentName || "Unknown"}
Listed Date: ${scraped?.listedDate || "Unknown"}
Postcode/Area: ${formattedPostcode || "Unknown"}
Nearest Station: ${scraped?.nearestStation || "Unknown"}
Flood Risk: ${scraped?.floodRisk || "Unknown"}
Listed Building Grade: ${scraped?.listedBuildingGrade || "None"}
Country: ${country}

MARKET DATA (${marketDataLabel}):
Street Average (${streetAvgLabel}): ${streetAvgLine}
Price vs Average: ${priceDiff !== null && priceDiff !== undefined ? priceDiff + "%" : "N/A"}
Gross Yield: ${yieldAudit?.grossYield ? yieldAudit.grossYield + "%" : "N/A"}
Monthly Rent Estimate: ${yieldAudit?.monthlyRent ? sym + yieldAudit.monthlyRent : "N/A"}
Rent Source: ${yieldAudit?.rentPeriodSource || "N/A"}
Growth 1yr: ${growthData?.growth1y ?? "NOT AVAILABLE"}
Growth 3yr: ${growthData?.growth3y ?? "NOT AVAILABLE"}
Growth 5yr: ${growthData?.growth5y ?? "NOT AVAILABLE"}
Demand Score: ${demandData?.demandScore ?? "NOT AVAILABLE"}
Supply Score: ${demandData?.supplyScore ?? "NOT AVAILABLE"}
Active Listings: ${demandData?.listingsCount ?? "N/A"}
Red Flags Found: ${redFlags.length > 0 ? redFlags.map((rf: any) => rf.keyword).join(", ") : "None"}
Comparable Sales: ${compsLine}

Description (first 2000 chars): ${description.slice(0, 2000)}
${ragContext}

Return this exact JSON structure:
{
  "aiScore": <number 0-100>,
  "scoreBreakdown": { "value": <0-100>, "location": <0-100>, "yield": <0-100>, "risk": <0-100> },
  "scoreExplanation": "<2-3 sentences explaining why you gave this score — reference specific data points>",
  "headline": "<one-line verdict — be specific and data-driven. If data is limited, say so.>",
  "valueSummary": "<4-5 sentences comparing asking price to fair value. ${valueSummaryNote}>",
  "yieldSummary": "<4-5 sentences on rental/investment potential.>",
  "riskSummary": "<4-5 sentences on risks with specific references to data found>",
  "marketMomentum": "<rising/stable/falling>",
  "marketMomentumDetail": "<3-4 sentences about market trends in this specific area.>",
  "marketContext": "<5-7 sentences providing essential market context for ${marketContextRegion} property market. Include: ${marketContextItems}. This section helps international buyers understand the local market.>",
  "localMarketContext": {
    "streetInsights": "<2-3 sentences about this specific street/road — character, typical properties, price trends>",
    "neighbourhoodProfile": "<3-4 sentences about the wider neighbourhood — demographics, lifestyle, reputation, gentrification status>",
    "transportAccessibility": "<3-4 sentences — nearest stations with walk times, bus routes, cycle infrastructure, commute times to major employment centres>",
    "amenities": "<3-4 sentences — supermarkets, restaurants, parks, gyms, healthcare, cultural venues within walking distance>",
    "regulatoryContext": "<3-4 sentences — relevant planning permissions, conservation areas, Article 4 directions, rent controls, tenant protections, upcoming regulatory changes affecting this property>",
    "taxImplications": "<3-4 sentences — stamp duty/transfer tax calculation, annual property tax, capital gains exposure, rental income tax treatment, any reliefs or exemptions available>",
    "practicalAdvice": "<3-4 sentences — what a local expert would tell a buyer: parking, noise levels, seasonal considerations, insurance quirks, utility costs, broadband quality>"
  },
  "renovationSuggestions": [
    {"item": "<specific improvement>", "estimatedCost": "<cost range>", "estimatedUplift": "<uplift range>", "roiPercent": "<number>"}
  ],
  "localAreaInsights": "<5-6 sentences about this specific area>",
  "areaIntelligence": {
    "schools": "<summary of nearby schools ${schoolsNote} if known, or 'Data not available from listing'>",
    "transport": "<nearest stations, commute times to ${transportNote} if known>",
    "crimeRate": "<${crimeNote}, or 'Data not available'>",
    "floodRisk": "<${floodNote}, or 'Data not available'>",
    "demographics": "<brief profile of the area's residents>",
    "futureDevelopments": "<${futurDevNote}, or 'No major developments known'>"
  },
  "negotiationStrategy": "<4-5 sentences of tactical advice>",
  "investmentSummary": "<3-4 sentences — overall verdict for investors>",
  "cashFlowProjection": {
    "monthlyRentalIncome": null,
    "monthlyMortgage": null,
    "monthlyRunningCosts": null,
    "monthlyCashFlow": null,
    "annualReturn": null
  },
  "stampDutyEstimate": null,
  "pricePerSqft": null,
  "areaAvgPricePerSqft": null,
  "estimatedAnnualCosts": {
    "mortgage": null,
    "insurance": null,
    "maintenance": null,
    "councilTax": null
  },
  "comparableAnalysis": "<3-4 sentences. ${compsAnalysisNote}>",
  "detailedComparables": [],
  "futurePotential": "<3-4 sentences on 5-year outlook>",
  "licensingExpertise": "<1-2 sentences demonstrating jurisdiction-specific licensing-level knowledge relevant to this transaction>",
  "estimatedAskingPriceRange": {"low": <number ALWAYS non-null — your best estimate>, "high": <number ALWAYS non-null>, "basis": "<explanation>"},
  "hummFairValue": <number ALWAYS non-null — your best fair value estimate>,
  "hummFairValueHigh": <number ALWAYS non-null — upper bound of fair value range>
}

NOTES FOR CALCULATIONS:
- Mortgage: ${mortgageNote}
- Running costs: ${runningCostsNote}
- Stamp duty/transfer fees: ${stampCalcNote}
- Council tax/rates: ${councilTaxNote}
- Use ${sym} for all monetary values.

Be honest about data limitations. If a field cannot be accurately determined, return null rather than guessing.`;

        console.log("[deal-audit] Step 7: Running AI analysis with gpt-5.2");
        const aiRes = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-5.2",
            messages: [
              { role: "system", content: "You are Hummm, the world's most knowledgeable AI property analyst — qualified to licensing-exam level across UK, USA, UAE, Singapore, South Africa, Germany, Spain, Italy, Portugal, Switzerland, Sweden, Norway, and Denmark. You have deep expertise in " + systemExpertise + " property markets. Return only valid JSON, no markdown code blocks. Be thorough, precise, data-driven, and provide the 'Local Market Context' section with street-level insights." },
              { role: "user", content: prompt },
            ],
            reasoning: { effort: "high" },
          }),
        }, 2, 90000);

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          try {
            aiAnalysis = JSON.parse(jsonStr);
            // Ensure hummFairValue is NEVER null — apply fallback chain
            if (!aiAnalysis.hummFairValue || aiAnalysis.hummFairValue <= 0) {
              const estRange = aiAnalysis.estimatedAskingPriceRange;
              if (estRange?.low && estRange?.high) {
                aiAnalysis.hummFairValue = Math.round((estRange.low + estRange.high) / 2 * 0.97);
                aiAnalysis.hummFairValueHigh = Math.round(estRange.high * 0.98);
              } else if (askingPrice > 0) {
                aiAnalysis.hummFairValue = Math.round(askingPrice * 0.95);
                aiAnalysis.hummFairValueHigh = Math.round(askingPrice * 1.02);
              } else if (valueAudit?.streetAverage > 0) {
                aiAnalysis.hummFairValue = Math.round(valueAudit.streetAverage * 1.0);
                aiAnalysis.hummFairValueHigh = Math.round(valueAudit.streetAverage * 1.08);
              }
            }
            // Ensure aiScore is never null
            if (!aiAnalysis.aiScore || aiAnalysis.aiScore <= 0) {
              aiAnalysis.aiScore = 65;
            }
            console.log("[deal-audit] Step 7 complete: AI score =", aiAnalysis?.aiScore, "fairValue =", aiAnalysis?.hummFairValue);
          } catch {
            console.error("[deal-audit] Step 7: Failed to parse AI JSON:", jsonStr.slice(0, 300));
          }
        } else {
          console.error("[deal-audit] Step 7: AI returned status", aiRes.status);
        }
      } catch (e: any) { console.error("[deal-audit] Step 7 failed:", e?.message); }
    }

    // ── Phase 1: Real public-source Area Intelligence + Hummingbird Intelligence Score ──
    let areaInsights: any = null;
    let intelligenceScore: any = null;
    if (isUK && formattedPostcode) {
      try {
        const aiUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/area-insights`;
        const aiResp = await fetch(aiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
          body: JSON.stringify({ postcode: formattedPostcode }),
        });
        if (aiResp.ok) {
          areaInsights = await aiResp.json();
          // Merge real data into aiAnalysis.areaIntelligence (overrides AI guesses with real public-source data)
          if (areaInsights?.text) {
            aiAnalysis = aiAnalysis || {};
            aiAnalysis.areaIntelligence = { ...(aiAnalysis.areaIntelligence || {}), ...areaInsights.text };
          }
        }
      } catch (e: any) { console.error("[deal-audit] area-insights failed:", e?.message); }
    }

    // Composite Hummingbird Intelligence Score (0-100)
    try {
      const askPrice = Number(scraped?.price ?? 0);
      const fairValue = Number(aiAnalysis?.hummFairValue ?? 0);
      const yieldPct = Number(yieldAudit?.grossYield ?? 0);
      const epcRaw = String(scraped?.epcRating ?? "").toUpperCase().match(/[A-G]/)?.[0] ?? "";
      const epcMap: Record<string, number> = { A: 95, B: 85, C: 75, D: 60, E: 45, F: 30, G: 20 };
      const intel = areaInsights?.intel ?? {};

      const valueScore = askPrice > 0 && fairValue > 0
        ? Math.max(20, Math.min(100, Math.round(100 - ((askPrice - fairValue) / askPrice) * 250)))
        : 60;
      const yieldScore = yieldPct > 0
        ? Math.max(30, Math.min(100, Math.round(40 + yieldPct * 8)))
        : 60;
      const locationScore = Math.round(((intel.transport_score ?? 65) + (intel.crime_score ?? 65) + (intel.schools_score ?? 70)) / 3);
      const conditionScore = epcMap[epcRaw] ?? 60;
      const demandScore = demandData?.demandScore != null ? Math.max(20, Math.min(100, Math.round(demandData.demandScore))) : 60;
      const riskScore = intel.flood_score ?? 70;

      const composite = Math.round(
        valueScore * 0.30 +
        yieldScore * 0.20 +
        locationScore * 0.20 +
        conditionScore * 0.15 +
        demandScore * 0.10 +
        riskScore * 0.05
      );

      const band = composite >= 85 ? "Exceptional" : composite >= 70 ? "Strong" : composite >= 55 ? "Fair" : composite >= 40 ? "Caution" : "Avoid";
      const breakdown = [
        { pillar: "Value", weight: 30, score: valueScore, detail: askPrice > 0 && fairValue > 0 ? `Asking ${Math.round(((askPrice - fairValue) / fairValue) * 100)}% vs fair value` : "Insufficient comparable data" },
        { pillar: "Yield", weight: 20, score: yieldScore, detail: yieldPct ? `${yieldPct.toFixed(1)}% gross rental yield` : "No rental data" },
        { pillar: "Location", weight: 20, score: locationScore, detail: "Transport · crime · schools composite" },
        { pillar: "Condition / EPC", weight: 15, score: conditionScore, detail: epcRaw ? `EPC band ${epcRaw}` : "EPC unknown" },
        { pillar: "Demand", weight: 10, score: demandScore, detail: demandData?.demandScore != null ? `Local demand index ${demandData.demandScore}` : "Demand data unavailable" },
        { pillar: "Risk", weight: 5, score: riskScore, detail: areaInsights?.text?.floodRisk ? "Flood risk per Environment Agency" : "Risk data limited" },
      ];
      const topReasons = breakdown.filter((b) => b.score >= 75).slice(0, 3).map((b) => `${b.pillar}: ${b.detail}`);
      const redFlagsList = breakdown.filter((b) => b.score < 50).map((b) => `${b.pillar} below threshold (${b.score}/100)`);
      intelligenceScore = { score: composite, band, breakdown, topReasons, redFlags: redFlagsList, computedAt: new Date().toISOString() };
    } catch (e: any) { console.error("[deal-audit] intel score failed:", e?.message); }

    console.log("[deal-audit] Audit complete for:", address?.slice(0, 60), "| aiScore:", aiAnalysis?.aiScore || "N/A", "| intel:", intelligenceScore?.score);

    // Phase 4.5: Align response with shared AuditData shape from src/types/audit.ts where possible
    // This helps the frontend (usePropertyAudit + AuditReport) consume consistent data.
    const alignedResponse = {
      success: true,
      country,
      currency,
      postcode: formattedPostcode,
      scrapedProperty: scraped,
      valueAudit,
      yieldAudit,
      growthData,
      demandData,
      redFlags,
      aiAnalysis: {
        ...aiAnalysis,
        // Ensure key fields expected by AuditData interface are present
        hummFairValue: aiAnalysis?.hummFairValue,
        hummFairValueHigh: aiAnalysis?.hummFairValueHigh,
        aiScore: aiAnalysis?.aiScore,
        scoreBreakdown: aiAnalysis?.scoreBreakdown,
        detailedComparables: aiAnalysis?.detailedComparables || [],
      },
      areaInsights,
      intelligenceScore,
      // Convenience top-level fields for the frontend
      address,
      askingPrice,
    };

    return new Response(
      JSON.stringify(alignedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[deal-audit] Fatal error:", e?.message, e?.stack?.slice(0, 300));
    return new Response(JSON.stringify({ error: "Unable to complete the audit. Please try again or use a different property link.", success: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
