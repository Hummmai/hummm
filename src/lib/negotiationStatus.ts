/**
 * Tracks whether the current visitor has used their FREE first negotiation.
 * Credit-based subscription model:
 *   - Free: 50 credits (1 free negotiation)
 *   - Starter: £9/month — 300 credits
 *   - Pro: £29/month — Unlimited negotiations (Most Popular)
 *   - Investor: £79/month — Unlimited + portfolio extras
 * Prices are intentionally HIDDEN until the user has signed up or
 * started their first negotiation.
 */

export const FIRST_NEG_KEY = "humm_first_negotiation_done";

export function hasUsedFirstNegotiation(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(FIRST_NEG_KEY) === "1";
  } catch {
    return false;
  }
}

export function markFirstNegotiationDone() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRST_NEG_KEY, "1");
  } catch { /* noop */ }
}

/** Friendly pricing copy used across the app. */
export const NEG_PRICING = {
  firstFree: "First negotiation free",
  starter: "£9 / month — 300 credits",
  pro: "£29 / month — Unlimited",
  investor: "£79 / month — Unlimited + extras",
  ctaPrimary: "Start Your Free Negotiation",
  ctaSecondary: "See how it works",
} as const;

export type CreditTierId = "free" | "starter" | "pro" | "investor";

export interface CreditTier {
  id: CreditTierId;
  name: string;
  price: string;       // e.g. "£0", "£9", "£29"
  unit: string;        // e.g. "/month", "forever"
  credits: string;     // e.g. "50 credits", "Unlimited"
  tagline: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

/** Single source of truth for the credit-based subscription tiers. */
export const CREDIT_TIERS: CreditTier[] = [
  {
    id: "free",
    name: "Free",
    price: "£0",
    unit: "forever",
    credits: "50 credits",
    tagline: "Your first negotiation is on us",
    features: [
      "1 full AI negotiation (50 credits)",
      "Instant AI property valuation",
      "Forensic property audit report",
      "Email drafts in your tone of voice",
      "No card required",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "£9",
    unit: "/month",
    credits: "300 credits",
    tagline: "For occasional deals",
    features: [
      "~6 negotiations per month (300 credits)",
      "Full AI valuation + audit engine",
      "Email drafts + agent reply handling",
      "Tone selector (Polite / Firm / Aggressive)",
      "Cancel anytime",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "£29",
    unit: "/month",
    credits: "Unlimited",
    tagline: "Unlimited negotiations",
    popular: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI negotiations",
      "Priority AI processing",
      "Multi-property strategy mode",
      "Conversation memory across deals",
      "Live dashboard + reply tracking",
      "Cancel anytime",
    ],
  },
  {
    id: "investor",
    name: "Investor",
    price: "£79",
    unit: "/month",
    credits: "Unlimited + extras",
    tagline: "Built for portfolios",
    features: [
      "Everything in Pro",
      "Portfolio command-centre tools",
      "Yield, ROI & cashflow modelling",
      "Bulk listing analysis",
      "Dedicated account success manager",
      "Early access to new markets",
    ],
  },
];