import type { Market } from "@luxury/db";

type AgentMarket = Market | "GLOBAL";

export interface AgentDefinition {
  id: string;
  title: string;
  department: string;
  markets: AgentMarket[];
  mission: string;
  inputs: string[];
  outputs: string[];
  escalationRules: string[];
}

export const agentTeam: AgentDefinition[] = [
  {
    id: "ceo",
    title: "Founder/CEO Agent",
    department: "Command",
    markets: ["GLOBAL"],
    mission: "Create the daily operating plan across sourcing, listings, content, live, support, and risk.",
    inputs: ["analytics snapshot", "inventory", "cashflow", "risk queue"],
    outputs: ["daily battle plan", "priority products", "live focus"],
    escalationRules: ["Escalate if legal, counterfeit, payment freeze, or public complaint risk appears."]
  },
  {
    id: "market_uk",
    title: "Market Manager UK Agent",
    department: "Market Ops",
    markets: ["UK"],
    mission: "Manage UK platforms, GBP pricing, tracked delivery, and UK buyer workflows.",
    inputs: ["UK inventory", "platform performance", "shipping options"],
    outputs: ["UK channel plan", "UK listing rules", "UK shipping checklist"],
    escalationRules: ["Escalate UK statutory rights, chargeback, or platform case questions."]
  },
  {
    id: "market_hk",
    title: "Market Manager HK Agent",
    department: "Market Ops",
    markets: ["HK"],
    mission: "Manage Carousell HK, IG, FPS/PayMe, SF Express, and Cantonese buyer workflows.",
    inputs: ["HK inventory", "Carousell leads", "payment proof", "SF tracking"],
    outputs: ["HK channel plan", "HK listing rules", "HK delivery checklist"],
    escalationRules: ["Escalate counterfeit allegations, face-to-face disputes, and payment proof mismatch."]
  },
  {
    id: "proof",
    title: "Authentication Evidence Agent",
    department: "Risk",
    markets: ["GLOBAL"],
    mission: "Build proof packs from source, photos, serials, flaws, payment, packing, and tracking evidence.",
    inputs: ["source records", "photos", "receipts", "packing videos", "tracking"],
    outputs: ["proof pack", "missing evidence list", "risk notes"],
    escalationRules: ["Never certify authenticity without evidence; escalate high-risk brands and incomplete proof."]
  },
  {
    id: "buyer",
    title: "Sourcing Buyer Agent",
    department: "Supply",
    markets: ["GLOBAL"],
    mission: "Score sourcing leads, estimate profit, and reject risky or low-margin items before cash is spent.",
    inputs: ["asking price", "sold comps", "shipping", "platform fees", "proof available", "risk flags"],
    outputs: ["buy/watch/reject decision", "required checks", "estimated ROI"],
    escalationRules: ["Escalate high-risk brands, missing proof, cross-border uncertainty, or unusually cheap designer items."]
  },
  {
    id: "listing",
    title: "Listing Agent",
    department: "Sales",
    markets: ["GLOBAL"],
    mission: "Generate platform-specific listings without counterfeit, replica, or official reseller claims.",
    inputs: ["product", "proof pack", "market rules"],
    outputs: ["platform listings", "warnings"],
    escalationRules: ["Escalate if requested wording implies fake, replica, or brand authorisation."]
  },
  {
    id: "translation",
    title: "Translation Agent",
    department: "Localization",
    markets: ["GLOBAL"],
    mission: "Translate listings and support replies between English, Cantonese, and Traditional Chinese.",
    inputs: ["source copy", "target market", "tone"],
    outputs: ["localized copy", "cultural notes"],
    escalationRules: ["Escalate if translation changes legal meaning or authenticity claims."]
  },
  {
    id: "content_live",
    title: "Content + Live Agent",
    department: "Growth",
    markets: ["GLOBAL"],
    mission: "Create short-video hooks, captions, AI presenter scripts, and live rundowns.",
    inputs: ["product", "market", "audience segment"],
    outputs: ["hooks", "captions", "live script", "clip plan"],
    escalationRules: ["Escalate exaggerated scarcity, fake social proof, or unauthorised brand claims."]
  },
  {
    id: "video_factory",
    title: "Video Factory Agent",
    department: "Growth",
    markets: ["GLOBAL"],
    mission: "Turn each product into short videos, live previews, proof/trust clips, AI host scripts, and reusable post-live clips.",
    inputs: ["product", "proof pack", "market", "brand stream", "video calendar"],
    outputs: ["video assets", "shot lists", "AI host scripts", "daily video schedule"],
    escalationRules: ["Escalate unsupported authenticity claims, fake social proof, fake urgency, or risky dispute content."]
  },
  {
    id: "support",
    title: "Customer Support Agent",
    department: "Customer",
    markets: ["GLOBAL"],
    mission: "Answer safe buyer questions and route risky issues to the founder.",
    inputs: ["buyer message", "product", "order", "proof pack"],
    outputs: ["reply", "escalation decision"],
    escalationRules: ["Always escalate fake claims, returns, chargebacks, threats, and large discount requests."]
  },
  {
    id: "fulfilment",
    title: "Order Fulfilment Agent",
    department: "Operations",
    markets: ["GLOBAL"],
    mission: "Turn paid orders into a safe packing, evidence, delivery, and customer-update workflow.",
    inputs: ["order", "proof pack", "payment method", "fulfilment method"],
    outputs: ["fulfilment checklist", "missing evidence", "customer message"],
    escalationRules: ["Escalate missing payment proof, missing packing proof, face-to-face disputes, and high-value delivery risk."]
  },
  {
    id: "community",
    title: "Community Growth Agent",
    department: "Growth",
    markets: ["GLOBAL"],
    mission: "Run real engagement, KOC, VIP groups, and live warm-up without fake reviews or fake buyers.",
    inputs: ["content calendar", "VIP list", "live schedule"],
    outputs: ["engagement tasks", "KOC brief", "VIP drop copy"],
    escalationRules: ["Escalate any request for fake reviews, fake identity, fake sales, or competitor attacks."]
  },
  {
    id: "acquisition",
    title: "Paid Acquisition Agent",
    department: "Growth",
    markets: ["GLOBAL"],
    mission: "Turn old buyers, video engagers, live viewers, and VIP leads into ad audiences and compliant campaigns.",
    inputs: ["customer segments", "video performance", "live viewers", "budget", "market"],
    outputs: ["campaign briefs", "audience segments", "creative angles", "retargeting plan"],
    escalationRules: ["Escalate restricted ad claims, counterfeit wording, personal-data consent gaps, or platform policy uncertainty."]
  },
  {
    id: "discord_snapchat",
    title: "Discord + Snapchat Growth Agent",
    department: "Growth",
    markets: ["GLOBAL"],
    mission: "Build community and youth-fashion discovery funnels through Discord VIP groups and Snapchat content/ads.",
    inputs: ["old buyers", "VIP buyers", "video assets", "live schedule", "market"],
    outputs: ["Discord funnel", "Snapchat funnel", "weekly engagement plan"],
    escalationRules: ["Escalate underage targeting, unsafe DMs, fake social proof, or missing marketing consent."]
  },
  {
    id: "dispute",
    title: "Dispute Agent",
    department: "Risk",
    markets: ["GLOBAL"],
    mission: "Prepare evidence packs for fake claims, returns, item swaps, and chargebacks.",
    inputs: ["customer claim", "proof pack", "messages", "tracking", "payment proof"],
    outputs: ["evidence checklist", "response draft", "case timeline"],
    escalationRules: ["Founder approval required before any admission, refund promise, or legal statement."]
  },
  {
    id: "fx_pricing",
    title: "FX Pricing Agent",
    department: "Finance",
    markets: ["GLOBAL"],
    mission: "Calculate GBP/HKD pricing, FX impact, cross-border logistics costs, and profit.",
    inputs: ["cost", "target price", "fees", "shipping", "fx rate"],
    outputs: ["profit snapshot", "price recommendation"],
    escalationRules: ["Escalate negative margin, unusually high fees, or currency mismatch."]
  }
];

export function agentsForMarket(market: Market): AgentDefinition[] {
  return agentTeam.filter((agent) => agent.markets.includes("GLOBAL") || agent.markets.includes(market));
}
