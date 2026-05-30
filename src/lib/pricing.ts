import { useEffect, useState } from "react";

export type CountryCode = "UK" | "US" | "AE" | "ZA" | "EU";

export interface CountryPricing {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  /** ISO 3166-1 alpha-2 region code(s) used for places APIs etc. */
  regionCodes: string[];
  /** Locale used for currency formatting (toLocaleString) */
  locale: string;
  /** Friendly description for valuation form */
  addressHint: string;
  sell: { fee: string; unit: string };
  let: { fee: string; unit: string };
  manage: { fee: string; unit: string };
  negotiate: { fee: string; unit: string };
  audit: { fee: string; unit: string };
  traditional: {
    sell: string;
    let: string;
    summary: string; // e.g. "20-25% lower than traditional agents in the UK"
  };
  saleExamples: Array<{ label: string; fee: string }>;
}

export const PRICING: Record<CountryCode, CountryPricing> = {
  UK: {
    code: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    regionCodes: ["gb"],
    locale: "en-GB",
    addressHint: "Enter your full UK postcode (e.g. NW6 1PB)",
    sell: { fee: "0.8%", unit: "of sale price" },
    let: { fee: "5.5%", unit: "of annual rent" },
    manage: { fee: "3%", unit: "of monthly rent" },
    negotiate: { fee: "Free", unit: "first negotiation · then £9–£29/mo" },
    audit: { fee: "Free", unit: "included" },
    traditional: {
      sell: "1.0–1.5%",
      let: "8–12%",
      summary: "20–30% cheaper than traditional agents with superior AI technology",
    },
    saleExamples: [
      { label: "£500k sale", fee: "£4,000" },
      { label: "£750k sale", fee: "£6,000" },
      { label: "£1m sale", fee: "£8,000" },
    ],
  },
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    regionCodes: ["us"],
    locale: "en-US",
    addressHint: "Enter your full street address and ZIP code",
    sell: { fee: "2.3%", unit: "of sale price" },
    let: { fee: "7%", unit: "of first-year rent" },
    manage: { fee: "8%", unit: "of monthly rent" },
    negotiate: { fee: "$129", unit: "one-time fee" },
    audit: { fee: "$69", unit: "one-time fee" },
    traditional: {
      sell: "5–6%",
      let: "10–15%",
      summary: "20–30% cheaper than traditional agents with superior AI technology",
    },
    saleExamples: [
      { label: "$500k sale", fee: "$11,500" },
      { label: "$750k sale", fee: "$17,250" },
      { label: "$1m sale", fee: "$23,000" },
    ],
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    symbol: "AED ",
    regionCodes: ["ae"],
    locale: "en-AE",
    addressHint: "Enter building / community / area (e.g. Marina Gate 1, Dubai Marina)",
    sell: { fee: "1.6%", unit: "of sale price" },
    let: { fee: "4%", unit: "of annual rent" },
    manage: { fee: "5%", unit: "of monthly rent" },
    negotiate: { fee: "AED 599", unit: "one-time fee" },
    audit: { fee: "AED 299", unit: "one-time fee" },
    traditional: {
      sell: "2%",
      let: "5%",
      summary: "20–30% cheaper than traditional agents with superior AI technology",
    },
    saleExamples: [
      { label: "AED 2m sale", fee: "AED 32,000" },
      { label: "AED 3m sale", fee: "AED 48,000" },
      { label: "AED 5m sale", fee: "AED 80,000" },
    ],
  },
  ZA: {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    currency: "ZAR",
    symbol: "R",
    regionCodes: ["za"],
    locale: "en-ZA",
    addressHint: "Enter suburb / city (e.g. 14 Loop Street, Cape Town)",
    sell: { fee: "4.0%", unit: "of sale price" },
    let: { fee: "6.5%", unit: "of annual rent" },
    manage: { fee: "7%", unit: "of monthly rent" },
    negotiate: { fee: "R1,499", unit: "one-time fee" },
    audit: { fee: "R849", unit: "one-time fee" },
    traditional: {
      sell: "5–7.5%",
      let: "8–10%",
      summary: "20–30% cheaper than traditional agents with superior AI technology",
    },
    saleExamples: [
      { label: "R2m sale", fee: "R80,000" },
      { label: "R4m sale", fee: "R160,000" },
      { label: "R8m sale", fee: "R320,000" },
    ],
  },
  EU: {
    code: "EU",
    name: "European Union",
    flag: "🇪🇺",
    currency: "EUR",
    symbol: "€",
    regionCodes: ["es", "pt", "it", "de", "fr", "nl", "ie", "be", "at", "fi", "gr"],
    locale: "en-IE",
    addressHint: "Enter your street and city",
    sell: { fee: "1.8%", unit: "of sale price" },
    let: { fee: "6%", unit: "of annual rent" },
    manage: { fee: "6.5%", unit: "of monthly rent" },
    negotiate: { fee: "€99", unit: "one-time fee" },
    audit: { fee: "€55", unit: "one-time fee" },
    traditional: {
      sell: "3–5%",
      let: "8–10%",
      summary: "20–30% cheaper than traditional agents with superior AI technology",
    },
    saleExamples: [
      { label: "€300k sale", fee: "€5,400" },
      { label: "€500k sale", fee: "€9,000" },
      { label: "€1m sale", fee: "€18,000" },
    ],
  },
};

const STORAGE_KEY = "humm_pricing_country";

function detectFromBrowser(): CountryCode | null {
  if (typeof navigator === "undefined") return null;
  const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const l of langs) {
    const upper = l.toUpperCase();
    if (upper.includes("-GB") || upper.endsWith("GB")) return "UK";
    if (upper.includes("-US") || upper.endsWith("US")) return "US";
    if (upper.includes("-AE") || upper.endsWith("AE")) return "AE";
    if (upper.includes("-ZA") || upper.endsWith("ZA")) return "ZA";
    if (/-(ES|PT|IT|DE|FR|NL|IE|BE|AT|FI|GR)$/.test(upper)) return "EU";
  }
  if (typeof Intl !== "undefined") {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.startsWith("Europe/London")) return "UK";
      if (tz.startsWith("America/")) return "US";
      if (tz.startsWith("Asia/Dubai") || tz.startsWith("Asia/Abu_Dhabi")) return "AE";
      if (tz.startsWith("Africa/Johannesburg") || tz.startsWith("Africa/Cape_Town")) return "ZA";
      if (tz.startsWith("Europe/")) return "EU";
    } catch { /* noop */ }
  }
  return null;
}

export function usePricing() {
  const [country, setCountryState] = useState<CountryCode>("UK");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
      if (stored && PRICING[stored]) {
        setCountryState(stored);
        return;
      }
    } catch { /* noop */ }
    const detected = detectFromBrowser();
    if (detected) setCountryState(detected);

    // Best-effort IP geo (non-blocking, only if no preference)
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const cc = (data?.country_code || "").toUpperCase();
        let next: CountryCode | null = null;
        if (cc === "GB") next = "UK";
        else if (cc === "US") next = "US";
        else if (cc === "AE") next = "AE";
        else if (cc === "ZA") next = "ZA";
        else if (["IE","ES","PT","IT","DE","FR","NL","BE","AT","FI","GR","LU","DK","SE"].includes(cc)) next = "EU";
        if (next) {
          // Only auto-apply if user hasn't explicitly chosen
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) setCountryState(next);
        }
      } catch { /* noop */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const setCountry = (c: CountryCode) => {
    setCountryState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* noop */ }
  };

  return { country, setCountry, pricing: PRICING[country] };
}