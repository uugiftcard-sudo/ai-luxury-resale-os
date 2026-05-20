import { buildAdCampaignBrief, buildAudienceSegments } from "@luxury/acquisition-growth";
import {
  findForbiddenClaims,
  type AdCampaignBrief,
  type ConnectorResult,
  type CustomerProfile,
  type LiveRunOfShow,
  type Product,
  type ProofPack,
  type ProofScore,
  type ShopifyProductPayload,
  type TikTokEventPlan,
  type TikTokProductPayload,
  type VideoAsset
} from "@luxury/db";
import { generateListings } from "@luxury/listing-crosspost";
import { calculateProofScore } from "@luxury/product-proof";
import { listingDisclaimer } from "@luxury/risk-legal";

export interface ConnectorConfig {
  mode?: "mock" | "real_ready";
  env?: Record<string, string | undefined>;
}

const defaultConfig: ConnectorConfig = {
  mode: "mock",
  env: typeof process === "undefined" ? {} : process.env
};

function envValue(config: ConnectorConfig, key: string): string | undefined {
  return config.env?.[key] ?? defaultConfig.env?.[key];
}

function connectorMode(config: ConnectorConfig, requiredKeys: string[]): "mock" | "real_ready" {
  if (config.mode === "mock") return "mock";
  return requiredKeys.every((key) => envValue(config, key)) ? "real_ready" : "mock";
}

function proofSummary(product: Product, proof: ProofPack | undefined, score: ProofScore): string {
  if (product.brandStream === "budget_fashion") return "Budget fashion item. No luxury proof pack required.";
  if (!proof) return "Proof pack missing. Keep product in draft until evidence is complete.";
  return [
    `Proof score: ${score.score}/100 (${score.grade})`,
    `Source record: ${proof.sourceRecord || "missing"}`,
    `Detail photos: ${proof.detailPhotoRefs.length}`,
    `Flaw photos: ${proof.flawPhotoRefs.length}`,
    `Tracking/payment evidence: ${proof.trackingRef || proof.paymentProofRef || "pending"}`
  ].join("<br/>");
}

function storefrontFor(product: Product): ShopifyProductPayload["storefront"] {
  return product.brandStream === "budget_fashion" ? "budget" : "luxury";
}

function storeDomainEnvFor(product: Product): ShopifyProductPayload["storeDomainEnv"] {
  if (product.market === "UK") return "SHOPIFY_UK_STORE_DOMAIN";
  if (product.market === "HK") return "SHOPIFY_HK_STORE_DOMAIN";
  return "SHOPIFY_STORE_DOMAIN";
}

export function buildShopifyProductPayload(product: Product, proof?: ProofPack): ShopifyProductPayload {
  const score = calculateProofScore(product, proof);
  const [shopifyListing] = generateListings(product, proof, [product.market === "UK" ? "shopify_uk" : "shopify_hk"]);
  const warnings = [
    ...score.warnings,
    ...findForbiddenClaims(`${shopifyListing.title}\n${shopifyListing.description}`)
  ];
  const blockedLuxury = product.brandStream === "luxury_resale" && !score.canPublishLuxury;

  return {
    sku: product.sku,
    market: product.market,
    storeDomainEnv: storeDomainEnvFor(product),
    storefront: storefrontFor(product),
    collectionHandles: [
      product.brandStream === "luxury_resale" ? "luxury-resale" : "budget-fashion",
      product.market === "UK" ? "market-uk" : "market-hk",
      product.category.toLowerCase().replace(/\s+/g, "-")
    ],
    title: shopifyListing.title,
    descriptionHtml: [
      shopifyListing.description.replace(/\n/g, "<br/>"),
      "<br/><br/>",
      listingDisclaimer(product.market, product.brandStream),
      "<br/><br/>",
      proofSummary(product, proof, score)
    ].join(""),
    price: product.targetPrice,
    currency: product.currency,
    status: blockedLuxury || warnings.length ? "draft" : "ready_to_sync",
    tags: [
      `market:${product.market}`,
      `stream:${product.brandStream}`,
      `condition:${product.conditionGrade}`,
      `proof:${score.grade}`,
      product.brand ? `brand:${product.brand}` : "brand:none"
    ],
    proofSummary: proofSummary(product, proof, score),
    warnings: blockedLuxury ? ["Luxury product blocked until proof score is medium or strong.", ...warnings] : warnings
  };
}

export function mockSendShopifyProduct(
  product: Product,
  proof?: ProofPack,
  config: ConnectorConfig = defaultConfig
): ConnectorResult<ShopifyProductPayload> {
  const payload = buildShopifyProductPayload(product, proof);
  const mode = connectorMode(config, ["SHOPIFY_ADMIN_TOKEN", payload.storeDomainEnv]);
  return {
    platform: "shopify",
    mode,
    ok: payload.status === "ready_to_sync",
    payload,
    warnings: payload.warnings,
    nextAction:
      mode === "real_ready"
        ? "Ready for Shopify Admin API product create/update call."
        : "Mock only. Add Shopify Admin token and store domain env vars before real sync."
  };
}

function tiktokDestination(product: Product): TikTokProductPayload["destination"] {
  return product.market === "UK" ? "tiktok_shop_uk" : "tiktok_content_pipeline";
}

export function buildTikTokProductPayload(
  product: Product,
  videos: VideoAsset[],
  liveRunOfShow?: LiveRunOfShow,
  proof?: ProofPack
): TikTokProductPayload {
  const score = calculateProofScore(product, proof);
  const hooks = videos.filter((video) => video.format === "tiktok" || video.format === "live_preview").map((video) => video.hook);
  const liveTalkingPoints = [
    ...(liveRunOfShow?.duringLive ?? []),
    `${product.sku}: show full item, condition, price, delivery, and CTA.`
  ];
  const customerFacingText = [
    product.title,
    product.conditionNotes,
    ...hooks,
    ...liveTalkingPoints
  ].join("\n");
  const forbidden = findForbiddenClaims(customerFacingText);
  const unsupportedLuxury = product.brandStream === "luxury_resale" && score.grade === "weak";
  const warnings = [
    ...forbidden,
    ...score.warnings,
    ...(unsupportedLuxury ? ["Weak proof score: TikTok luxury promotion requires manual review."] : [])
  ];

  return {
    sku: product.sku,
    market: product.market,
    destination: tiktokDestination(product),
    title: product.market === "HK" ? `${product.title}｜短片/直播草稿` : `${product.title} | video/live draft`,
    shortDescription:
      product.brandStream === "luxury_resale"
        ? "Proof-first pre-owned item. Show condition, flaws, delivery, and available evidence without unsupported guarantees."
        : "Budget fashion styling item. Focus on outfit ideas, price, fit, and value without designer imitation claims.",
    price: product.targetPrice,
    videoHooks: hooks,
    liveTalkingPoints,
    proofFirstNotes: [
      `Proof score: ${score.score}/100 (${score.grade})`,
      "Do not use fake reviews, fake buyer pressure, fake sold-out claims, or unsupported authenticity promises.",
      product.market === "UK" ? "TikTok Shop API access depends on seller/partner approval." : "HK TikTok content routes to content/live funnel first."
    ],
    status: warnings.length ? "manual_review_required" : "ready_to_sync",
    warnings
  };
}

export function mockSendTikTokProduct(
  product: Product,
  videos: VideoAsset[],
  liveRunOfShow?: LiveRunOfShow,
  proof?: ProofPack,
  config: ConnectorConfig = defaultConfig
): ConnectorResult<TikTokProductPayload> {
  const payload = buildTikTokProductPayload(product, videos, liveRunOfShow, proof);
  const mode = connectorMode(config, ["TIKTOK_SHOP_APP_KEY", "TIKTOK_SHOP_APP_SECRET", "TIKTOK_SHOP_ACCESS_TOKEN"]);
  return {
    platform: "tiktok",
    mode,
    ok: payload.status === "ready_to_sync",
    payload,
    warnings: payload.warnings,
    nextAction:
      mode === "real_ready"
        ? "Ready for TikTok Shop/Marketing API adapter once seller API access is approved."
        : "Mock only. Use this payload for TikTok Shop manual listing, live scripts, ads briefs, and API approval prep."
  };
}

export function buildTikTokEventPlan(market: Product["market"]): TikTokEventPlan {
  return {
    market,
    events: ["product_view", "add_to_cart", "purchase", "message_click", "video_view", "live_view"],
    implementationNotes: [
      "Install TikTok Pixel on Shopify first, then plan Events API server-side backup.",
      "Use product SKU, market, brand stream, and proof grade as analytics metadata where policy allows.",
      "Do not upload customer lists unless marketing consent and platform policy allow it."
    ]
  };
}

export function buildMainPlatformAdPlan(input: {
  product: Product;
  customers: CustomerProfile[];
  dailyBudgetAmount: number;
}): AdCampaignBrief[] {
  const segments = buildAudienceSegments(input.customers).filter((segment) => segment.market === input.product.market);
  const retargeting = segments.find((segment) => segment.segmentId.endsWith("old-buyers")) ?? segments[0];
  const budget = segments.find((segment) => segment.segmentId.endsWith("budget")) ?? retargeting;

  return [
    buildAdCampaignBrief({
      market: input.product.market,
      channel: "tiktok_live_shopping_ads",
      objective: "live_viewers",
      audienceSegment: retargeting,
      product: input.product,
      dailyBudgetAmount: input.dailyBudgetAmount
    }),
    buildAdCampaignBrief({
      market: input.product.market,
      channel: "snapchat_ads",
      objective: input.product.brandStream === "budget_fashion" ? "reactivation" : "retargeting",
      audienceSegment: input.product.brandStream === "budget_fashion" ? budget : retargeting,
      product: input.product,
      dailyBudgetAmount: Math.max(10, Math.round(input.dailyBudgetAmount * 0.4))
    })
  ];
}

