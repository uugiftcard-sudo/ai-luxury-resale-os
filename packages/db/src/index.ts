export type Market = "UK" | "HK";
export type Currency = "GBP" | "HKD";
export type Language = "en-GB" | "zh-Hant-HK" | "bilingual";

export type Platform =
  | "ebay_uk"
  | "tiktok_shop_uk"
  | "shopify_uk"
  | "instagram"
  | "vinted"
  | "depop"
  | "pinterest"
  | "carousell_hk"
  | "facebook_marketplace_hk"
  | "shopify_hk"
  | "whatsapp_catalogue"
  | "telegram_vip"
  | "discord_vip"
  | "snapchat";

export type BrandStream = "luxury_resale" | "budget_fashion";

export type ConditionGrade = "A" | "B" | "C" | "For parts/repair";

export type VideoFormat =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "pinterest_video"
  | "carousell_video"
  | "whatsapp_vip"
  | "live_preview"
  | "live_highlight"
  | "proof_trust_clip";

export type VideoStatus = "draft" | "filming" | "editing" | "posted" | "reused";

export interface VideoPerformance {
  views: number;
  likes: number;
  comments: number;
  dms: number;
  saves: number;
  clicks: number;
  sales: number;
}

export interface Money {
  amount: number;
  currency: Currency;
}

export type SourcingChannel =
  | "ebay_sold"
  | "vinted"
  | "depop"
  | "facebook_marketplace"
  | "carousell_hk"
  | "local_reseller"
  | "charity_shop"
  | "japanese_auction"
  | "wholesaler"
  | "consignment_lead";

export interface SourcingLead {
  id: string;
  market: Market;
  channel: SourcingChannel;
  title: string;
  askingPrice: Money;
  estimatedResalePrice: Money;
  estimatedShipping: Money;
  estimatedPlatformFeePercent: number;
  brandStream: BrandStream;
  riskFlags: string[];
  evidenceAvailable: string[];
}

export interface SourcingDecision {
  leadId: string;
  decision: "buy" | "watch" | "reject";
  estimatedProfit: Money;
  roiPercent: number;
  reasons: string[];
  requiredChecks: string[];
}

export interface Product {
  sku: string;
  market: Market;
  brandStream: BrandStream;
  currency: Currency;
  language: Language;
  title: string;
  brand?: string;
  category: string;
  size?: string;
  conditionGrade: ConditionGrade;
  conditionNotes: string;
  cost: Money;
  targetPrice: Money;
  status: "draft" | "proof_ready" | "listed" | "reserved" | "sold" | "returned";
  platforms: Platform[];
  proofPackId?: string;
  riskFlags: string[];
}

export interface ProofPack {
  id: string;
  sku: string;
  market: Market;
  sourceRecord: string;
  receiptRef?: string;
  serialOrCode?: string;
  detailPhotoRefs: string[];
  flawPhotoRefs: string[];
  packingVideoRef?: string;
  parcelWeight?: string;
  trackingRef?: string;
  paymentProofRef?: string;
  faceToFaceConfirmationRef?: string;
  notes: string[];
}

export interface ProofScore {
  sku: string;
  market: Market;
  score: number;
  grade: "strong" | "medium" | "weak";
  canPublishLuxury: boolean;
  canUseProofFirstPromotion: boolean;
  missingEvidence: string[];
  warnings: string[];
}

export interface Listing {
  sku: string;
  market: Market;
  platform: Platform;
  language: Language;
  title: string;
  description: string;
  price: Money;
  status: "draft" | "ready" | "published" | "paused" | "sold";
  warnings: string[];
}

export interface ContentAsset {
  sku: string;
  market: Market;
  language: Language;
  format: "short_video" | "live_script" | "caption" | "vip_drop" | "pin";
  hook: string;
  body: string;
  callToAction: string;
  complianceNotes: string[];
}

export interface VideoAsset {
  videoId: string;
  sku: string;
  market: Market;
  brandStream: BrandStream;
  language: Language;
  format: VideoFormat;
  hook: string;
  script: string;
  shotList: string[];
  caption: string;
  hashtags: string[];
  callToAction: string;
  platformVersion: Platform | "youtube_shorts";
  status: VideoStatus;
  performance: VideoPerformance;
  complianceNotes: string[];
}

export interface OrderRecord {
  orderId: string;
  sku: string;
  market: Market;
  platform: Platform;
  customerId: string;
  paidAmount: Money;
  paymentMethod: "stripe" | "shopify_payments" | "paypal" | "platform_checkout" | "fps" | "payme" | "bank_transfer" | "cash_face_to_face";
  fulfilmentMethod: "royal_mail" | "evri" | "dpd" | "sf_express" | "sf_locker" | "local_courier" | "face_to_face";
  status: "paid" | "proof_check" | "packing" | "shipped" | "delivered" | "return_requested" | "disputed" | "closed";
  requiredEvidence: string[];
  trackingRef?: string;
}

export interface FulfilmentPlan {
  orderId: string;
  steps: string[];
  missingEvidence: string[];
  riskWarnings: string[];
  customerMessage: string;
}

export interface LiveSession {
  sessionId: string;
  market: Market;
  language: Language;
  title: string;
  platforms: Platform[];
  productSkus: string[];
  phase: "pre_live" | "live" | "post_live";
}

export interface LiveRunOfShow {
  sessionId: string;
  beforeLive: string[];
  duringLive: string[];
  afterLive: string[];
  escalationRules: string[];
}

export interface CRMTask {
  taskId: string;
  customerId: string;
  market: Market;
  segment: "vip" | "old_buyer" | "warm_lead" | "discount_lead" | "budget_buyer" | "risk_buyer";
  action: string;
  message: string;
  due: "today" | "tomorrow" | "this_week";
  requiresApproval: boolean;
}

export type AcquisitionChannel =
  | "meta_instagram_ads"
  | "tiktok_live_shopping_ads"
  | "snapchat_ads"
  | "google_search"
  | "pinterest_seo"
  | "discord_vip"
  | "whatsapp_vip"
  | "email_reactivation"
  | "creator_koc";

export interface CustomerProfile {
  customerId: string;
  market: Market;
  language: Language;
  segment: "luxury_buyer" | "budget_buyer" | "vip" | "old_buyer" | "warm_lead" | "risk_buyer";
  preferredChannels: AcquisitionChannel[];
  interests: string[];
  lifetimeValue: Money;
  lastPurchaseDaysAgo?: number;
  consentForMarketing: boolean;
  riskFlags: string[];
}

export interface AudienceSegment {
  segmentId: string;
  market: Market;
  name: string;
  source: "old_buyers" | "vip" | "video_engagers" | "live_viewers" | "website_visitors" | "manual";
  channels: AcquisitionChannel[];
  sizeEstimate: number;
  rules: string[];
  exclusions: string[];
}

export interface AdCampaignBrief {
  campaignId: string;
  market: Market;
  channel: AcquisitionChannel;
  objective: "awareness" | "traffic" | "messages" | "live_viewers" | "sales" | "retargeting" | "reactivation";
  audienceSegmentId: string;
  budget: Money;
  creativeSku?: string;
  creativeAngle: string;
  complianceNotes: string[];
}

export interface DiscordFunnelPlan {
  market: Market;
  serverName: string;
  channels: string[];
  onboardingQuestions: string[];
  roles: string[];
  weeklyEvents: string[];
  safetyRules: string[];
}

export interface SnapchatFunnelPlan {
  market: Market;
  publicProfileTheme: string;
  organicStoryIdeas: string[];
  adAudiences: string[];
  retargetingEvents: string[];
  creativeRules: string[];
}

export type MainCommercePlatform = "shopify" | "tiktok";

export interface ShopifyProductPayload {
  sku: string;
  market: Market;
  storeDomainEnv: "SHOPIFY_UK_STORE_DOMAIN" | "SHOPIFY_HK_STORE_DOMAIN" | "SHOPIFY_STORE_DOMAIN";
  storefront: "luxury" | "budget";
  collectionHandles: string[];
  title: string;
  descriptionHtml: string;
  price: Money;
  currency: Currency;
  status: "draft" | "active_blocked" | "ready_to_sync";
  tags: string[];
  proofSummary: string;
  warnings: string[];
}

export interface TikTokProductPayload {
  sku: string;
  market: Market;
  destination: "tiktok_shop_uk" | "tiktok_content_pipeline";
  title: string;
  shortDescription: string;
  price: Money;
  videoHooks: string[];
  liveTalkingPoints: string[];
  proofFirstNotes: string[];
  status: "draft" | "ready_to_sync" | "manual_review_required";
  warnings: string[];
}

export interface TikTokEventPlan {
  market: Market;
  events: Array<"product_view" | "add_to_cart" | "purchase" | "message_click" | "video_view" | "live_view">;
  implementationNotes: string[];
}

export interface ConnectorResult<TPayload> {
  platform: MainCommercePlatform;
  mode: "mock" | "real_ready";
  ok: boolean;
  payload: TPayload;
  warnings: string[];
  nextAction: string;
}

export interface CustomerInteraction {
  market: Market;
  language: Language;
  channel: Platform | "email" | "website_chat";
  customerId: string;
  message: string;
  intent:
    | "product_question"
    | "shipping"
    | "payment"
    | "discount"
    | "fake_claim"
    | "return"
    | "budget_fashion_request";
}

export interface SupportResponse {
  reply: string;
  escalate: boolean;
  escalationReason?: string;
  requiredEvidence?: string[];
}

export interface FinanceSnapshot {
  sku: string;
  market: Market;
  revenue: Money;
  cost: Money;
  platformFee: Money;
  shippingCost: Money;
  refundReserve: Money;
  fxRateToGbp?: number;
  estimatedProfit: Money;
  roiPercent: number;
}

export const marketDefaults: Record<Market, { currency: Currency; language: Language; priceBand: string }> = {
  UK: { currency: "GBP", language: "en-GB", priceBand: "GBP 50-800" },
  HK: { currency: "HKD", language: "zh-Hant-HK", priceBand: "HKD 500-8,000" }
};

export const forbiddenClaimPatterns = [
  /fake/i,
  /replica/i,
  /1:1/i,
  /aaa\s*grade/i,
  /mirror\s*quality/i,
  /authori[sz]ed reseller/i
];

export function assertMarketCurrency(product: Product): void {
  const expected = marketDefaults[product.market].currency;
  if (product.currency !== expected || product.cost.currency !== expected || product.targetPrice.currency !== expected) {
    throw new Error(`Currency mismatch for ${product.sku}: ${product.market} requires ${expected}`);
  }
}

export function findForbiddenClaims(text: string): string[] {
  return forbiddenClaimPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source);
}

// Re-export storage helpers
export type { Store } from "./storage.js";
export {
  products,
  proofPacks,
  orders,
  leads,
  customers,
  liveSessions,
  listings,
  videoAssets,
  crmTasks,
  seedAll,
  clearAll,
  dataSummary
} from "./storage.js";

// Re-export typed env config + validation
export {
  shopifyConfig,
  shopifyConfigFor,
  tiktokConfig,
  whatsappConfig,
  discordConfig,
  ebayConfig,
  openaiConfig,
  envSummary,
  validateEnv,
} from "./env.js";
export type {
  ShopifyConfig,
  ShopifyStoreConfig,
  TikTokConfig,
  WhatsAppConfig,
  DiscordConfig,
  EbayConfig,
  EnvSummary,
} from "./env.js";
