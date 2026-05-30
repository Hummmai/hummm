/** Role-based configuration for the Hummm Command Center */

export type UserRole = "buyer" | "seller" | "landlord" | "tenant" | "agent";

export interface RoleTool {
  label: string;
  prompt: string;
}

export interface RoleConfig {
  quickActions: RoleTool[];
  persona: string;
  personaGreeting: string;
  chatPlaceholder: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  buyer: {
    quickActions: [
      { label: "Offer Calculator", prompt: "Calculate my optimal offer amount for this property based on comparable sales data and my budget." },
      { label: "Chain Analysis", prompt: "Analyze the property chain for this sale. What risks and delays should I anticipate?" },
      { label: "Survey Audit", prompt: "What survey type should I commission for this property and what red flags should I watch for?" },
      { label: "Draft Offer Letter", prompt: "Draft a professional offer letter for this property, including my budget and buyer status." },
    ],
    persona: "Tactical Negotiator 🎯",
    personaGreeting: "I'm your Tactical Negotiator. I'll help you secure the best deal — from offer strategy to exchange.",
    chatPlaceholder: "Ask your Tactical Negotiator...",
  },
  seller: {
    quickActions: [
      { label: "Agent Comparison", prompt: "Compare the top 3 local agents for selling my property based on recent performance data." },
      { label: "Marketing Heatmap", prompt: "Analyze the best marketing channels and timing for selling this property type in this area." },
      { label: "TA6 Pre-Audit", prompt: "Run a pre-audit of TA6 compliance for this property. What disclosures should I prepare?" },
      { label: "Price Strategy", prompt: "Recommend an asking price strategy for this property based on comparable sold prices." },
    ],
    persona: "Tactical Negotiator 🎯",
    personaGreeting: "I'm your Tactical Negotiator. I'll help you achieve the best exit — from pricing to completion.",
    chatPlaceholder: "Ask your Tactical Negotiator...",
  },
  landlord: {
    quickActions: [
      { label: "Renters' Rights Check", prompt: "Check my compliance with the Renters' Rights Act 2025 for this property. What do I need to update?" },
      { label: "Yield Forecaster", prompt: "Forecast the rental yield for this property over the next 12 months, factoring in market trends." },
      { label: "EPC Optimizer", prompt: "What are the most cost-effective improvements to raise this property's EPC rating?" },
      { label: "Section 21 Status", prompt: "Check the current legal status of Section 21 notices and what alternatives I should prepare." },
    ],
    persona: "Compliance Sentinel 🛡️",
    personaGreeting: "I'm your Compliance Sentinel. I'll keep your portfolio compliant and your yield optimized.",
    chatPlaceholder: "Ask your Compliance Sentinel...",
  },
  tenant: {
    quickActions: [
      { label: "Repair Request", prompt: "Draft a formal repair request letter to my landlord. Include my legal rights and response deadlines." },
      { label: "Pet Application", prompt: "Draft a formal pet consent request under the Renters' Rights Act 2025 framework." },
      { label: "Contract Audit", prompt: "Audit my tenancy agreement for unfair terms or clauses that may not be legally enforceable." },
      { label: "Rent Challenge", prompt: "Help me challenge an above-market rent increase with comparable data and legal framework." },
    ],
    persona: "Compliance Sentinel 🛡️",
    personaGreeting: "I'm your Compliance Sentinel. I'll protect your tenancy rights and audit your contracts.",
    chatPlaceholder: "Ask your Compliance Sentinel...",
  },
  agent: {
    quickActions: [
      { label: "Market Velocity", prompt: "Analyze current market velocity in this postcode — average days to sell, list-to-sale ratio, and stock levels." },
      { label: "Fee Benchmarking", prompt: "Benchmark agent commission fees in this area. What's competitive and what's the floor?" },
      { label: "Portfolio Review", prompt: "Review this portfolio for underperforming assets and recommend action items." },
      { label: "Competitor Analysis", prompt: "Analyze my main competitors in this area — their strengths, weaknesses, and market share." },
    ],
    persona: "Market Scout 📡",
    personaGreeting: "I'm your Market Scout. I'll deliver real-time market intelligence and portfolio insights.",
    chatPlaceholder: "Ask your Market Scout...",
  },
};

export function getRoleConfig(role: string | null | undefined): RoleConfig {
  const key = (role || "buyer") as UserRole;
  return ROLE_CONFIGS[key] || ROLE_CONFIGS.buyer;
}
