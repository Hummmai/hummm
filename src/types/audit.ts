/**
 * Shared TypeScript interfaces for the Property Audit feature.
 * Phase 3: Replacing `any` types across the audit system.
 */

export interface CompSale {
  address: string;
  price: number;
  date: string;
  type: string;
}

export interface DetailedComp {
  address: string;
  price: number;
  date: string;
  type: string;
  distance?: string;
  saleToAskRatio?: string;
  adjustment?: string;
}

export interface RenovationItem {
  item: string;
  estimatedCost: string;
  estimatedUplift: string;
  roiPercent?: string;
}

export interface AreaIntelligence {
  schools: string;
  transport: string;
  crimeRate: string;
  floodRisk: string;
  demographics: string;
  futureDevelopments: string;
}

export interface IntelligenceScore {
  score: number;
  band: string;
  breakdown: { pillar: string; weight: number; score: number; detail: string }[];
  topReasons?: string[];
  redFlags?: string[];
}

export interface AuditData {
  address: string;
  askingPrice: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  receptionRooms: number | null;
  propertyType: string;
  postcode: string;
  source: string;
  images: string[];
  floorplan: string | null;
  hummFairValue: number;
  hummFairValueHigh?: number;
  aiScore: number;
  scoreBreakdown: { value: number; location: number; yield: number; risk: number } | null;
  scoreExplanation: string;
  priceDiffPercent: number;
  streetAverage: number;
  yieldEstimate: number | null;
  monthlyRent: number | null;
  weeklyRent: number | null;
  rentPeriodSource: string | null;
  risks: string[];
  opportunities: string[];
  recentSales: CompSale[];
  detailedComparables: DetailedComp[];
  suggestedOffer: number | null;
  headline: string;
  valueSummary: string;
  yieldSummary: string;
  riskSummary: string;
  marketMomentum: string;
  marketMomentumDetail: string;
  renovationSuggestions: RenovationItem[];
  localAreaInsights: string;
  areaIntelligence: AreaIntelligence | null;
  intelligenceScore: IntelligenceScore | null;
  negotiationStrategy: string;
  growthData: { growth1y: number | null; growth3y: number | null; growth5y: number | null } | null;
  sqft: number | null;
  epcRating: string | null;
  tenure: string | null;
  councilTaxBand: string | null;
  keyFeatures: string[];
  agentName: string | null;
  agentEmail?: string | null;
  description?: string | null;
  listedDate?: string | null;
  // New Phase 3 fields for reliability
  priceConfidence?: number; // 0-100
  priceSource?: string; // e.g. "Rightmove Primary", "AI Estimated", "Firecrawl"
  extractionMethod?: string;
}

export type AuditStep =
  | "link-input"
  | "analysing"
  | "overview"
  | "tool-selected"
  | "draft-review"
  | "sent"
  | "feedback";

export interface DraftEmail {
  to: string;
  subject: string;
  body: string;
}

export interface ScrapeResult {
  success: boolean;
  scrapedProperty?: Partial<AuditData>;
  valueAudit?: any;
  aiAnalysis?: any;
  error?: string;
  priceConfidence?: number;
}
