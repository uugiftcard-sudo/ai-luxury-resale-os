import { buildControlCenterSnapshot } from "../apps/control-center/src/index.js";
import { generateContentPack } from "@luxury/content-live";
import { generateListings } from "@luxury/listing-crosspost";
import { auditProofPack, calculateProofScore } from "@luxury/product-proof";
import { respondToCustomer } from "@luxury/customer-support-crm";
import { createCRMTask } from "@luxury/customer-support-crm";
import { findForbiddenClaims } from "@luxury/db";
import { dailyVideoCalendar, generateProductVideoPack } from "@luxury/video-factory";
import { scoreSourcingLead } from "@luxury/sourcing-engine";
import { buildFulfilmentPlan } from "@luxury/order-fulfillment";
import { buildLiveRunOfShow } from "@luxury/live-ops";
import { buildAdCampaignBrief, buildAudienceSegments, buildDiscordFunnel, buildSnapchatFunnel } from "@luxury/acquisition-growth";
import { buildMainPlatformAdPlan, buildShopifyProductPayload, buildTikTokEventPlan, buildTikTokProductPayload, mockSendShopifyProduct, mockSendTikTokProduct } from "@luxury/platform-connectors";
import { sampleCustomers, sampleLiveSessions, sampleOrders, sampleProducts, sampleProofPacks, sampleSourcingLeads } from "./sample-data.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const ukLuxury = sampleProducts.find((product) => product.sku === "UK-LUX-001")!;
const hkLuxury = sampleProducts.find((product) => product.sku === "HK-LUX-001")!;
const hkBudget = sampleProducts.find((product) => product.sku === "HK-BUD-001")!;
const ukProof = sampleProofPacks.find((proof) => proof.sku === ukLuxury.sku)!;
const hkProof = sampleProofPacks.find((proof) => proof.sku === hkLuxury.sku)!;

assert(buildControlCenterSnapshot("UK", sampleProducts, sampleProofPacks).market === "UK", "UK dashboard should load.");
assert(buildControlCenterSnapshot("HK", sampleProducts, sampleProofPacks).market === "HK", "HK dashboard should load.");
assert(auditProofPack(ukLuxury, ukProof).complete, "UK luxury proof should be complete.");
assert(auditProofPack(hkLuxury, hkProof).complete, "HK luxury proof should be complete.");
assert(calculateProofScore(ukLuxury, ukProof).grade === "strong", "UK luxury proof score should be strong.");
assert(calculateProofScore(hkLuxury, hkProof).canPublishLuxury, "HK luxury proof score should allow luxury publishing.");

const ukListings = generateListings(ukLuxury, ukProof);
const hkListings = generateListings(hkLuxury, hkProof);
assert(ukListings.some((listing) => listing.platform === "ebay_uk"), "UK eBay listing should exist.");
assert(hkListings.some((listing) => listing.platform === "carousell_hk"), "HK Carousell listing should exist.");

const allListingText = [...ukListings, ...hkListings].map((listing) => `${listing.title}\n${listing.description}`).join("\n");
assert(findForbiddenClaims(allListingText).length === 0, "Listings should not contain forbidden counterfeit-coded wording.");

const hkPaymentReply = respondToCustomer({
  market: "HK",
  language: "zh-Hant-HK",
  channel: "whatsapp_catalogue",
  customerId: "hk-buyer-1",
  message: "可唔可以 FPS 同順豐?",
  intent: "payment"
});
assert(!hkPaymentReply.escalate && hkPaymentReply.reply.includes("FPS"), "HK FPS/PayMe reply should be safe.");

const fakeClaimReply = respondToCustomer({
  market: "UK",
  language: "en-GB",
  channel: "ebay_uk",
  customerId: "uk-buyer-risk",
  message: "This is fake.",
  intent: "fake_claim"
}, ukLuxury, ukProof);
assert(fakeClaimReply.escalate, "Fake claim should escalate.");

const hkFaceToFaceClaim = respondToCustomer({
  market: "HK",
  language: "zh-Hant-HK",
  channel: "carousell_hk",
  customerId: "hk-risk",
  message: "面交之後我覺得假。",
  intent: "fake_claim"
}, hkLuxury, hkProof);
assert(hkFaceToFaceClaim.escalate, "HK face-to-face fake claim should escalate.");

const budgetReply = respondToCustomer({
  market: "HK",
  language: "zh-Hant-HK",
  channel: "instagram",
  customerId: "old-buyer",
  message: "有無平衫?",
  intent: "budget_fashion_request"
}, hkBudget);
assert(!budgetReply.escalate && budgetReply.reply.includes("budget fashion"), "Budget buyers should be handled separately.");

assert(generateContentPack(hkLuxury).some((asset) => asset.language === "zh-Hant-HK"), "HK content should be Cantonese/Traditional Chinese.");
assert(generateContentPack(ukLuxury).some((asset) => asset.language === "en-GB"), "UK content should be English.");

const ukVideos = generateProductVideoPack(ukLuxury, ukProof);
const hkVideos = generateProductVideoPack(hkLuxury, hkProof);
const budgetVideos = generateProductVideoPack(hkBudget);

assert(ukVideos.filter((video) => video.format === "tiktok" || video.format === "instagram_reels" || video.format === "youtube_shorts").length >= 3, "UK luxury item should generate at least 3 English short video scripts.");
assert(ukVideos.some((video) => video.format === "live_preview"), "UK luxury item should generate a live preview script.");
assert(ukVideos.some((video) => video.format === "proof_trust_clip"), "UK luxury item should generate a proof/trust clip.");
assert(hkVideos.filter((video) => video.language === "zh-Hant-HK").length >= 5, "HK luxury item should generate Cantonese/Traditional Chinese video assets.");
assert(hkVideos.some((video) => video.format === "whatsapp_vip"), "HK luxury item should generate WhatsApp VIP preview.");
assert(hkVideos.some((video) => video.format === "carousell_video"), "HK luxury item should generate Carousell product detail clip.");

const customerFacingBudgetVideoText = budgetVideos
  .map((video) => `${video.hook}\n${video.script}\n${video.caption}\n${video.callToAction}`)
  .join("\n");
assert(findForbiddenClaims(customerFacingBudgetVideoText).length === 0, "Budget fashion video customer-facing text should not contain counterfeit-coded wording.");

const customerFacingLuxuryVideoText = [...ukVideos, ...hkVideos]
  .map((video) => `${video.hook}\n${video.script}\n${video.caption}\n${video.callToAction}`)
  .join("\n");
assert(!/100%\s*authentic/i.test(customerFacingLuxuryVideoText), "Luxury video scripts should not make unsupported 100% authenticity promises.");
assert(dailyVideoCalendar("UK").length >= 8 && dailyVideoCalendar("HK").length >= 8, "Daily video calendars should exist for both markets.");

const goodLeadDecision = scoreSourcingLead(sampleSourcingLeads[0]);
const riskyLeadDecision = scoreSourcingLead(sampleSourcingLeads[1]);
assert(goodLeadDecision.decision === "buy", "Good UK sourcing lead should be buy.");
assert(riskyLeadDecision.decision !== "buy", "Risky HK sourcing lead should not be buy.");

const ukFulfilment = buildFulfilmentPlan(sampleOrders[0], ukProof);
const hkFulfilment = buildFulfilmentPlan(sampleOrders[1], hkProof);
assert(ukFulfilment.steps.some((step) => step.includes("tracked") || step.includes("parcel weight")), "UK fulfilment should mention tracked delivery or parcel weight.");
assert(hkFulfilment.steps.some((step) => step.includes("SF")), "HK fulfilment should mention SF workflow.");
assert(ukFulfilment.missingEvidence.length === 0, "UK sample fulfilment should have no missing evidence.");

const hkLive = buildLiveRunOfShow(sampleLiveSessions[1], sampleProducts);
assert(hkLive.beforeLive.length > 3 && hkLive.afterLive.some((step) => step.includes("Follow up")), "Live run-of-show should include pre and post live work.");

const ukTikTokLive = buildLiveRunOfShow(sampleLiveSessions[0], sampleProducts);
const ukShopifyPayload = buildShopifyProductPayload(ukLuxury, ukProof);
const hkShopifyPayload = buildShopifyProductPayload(hkLuxury, hkProof);
const budgetShopifyPayload = buildShopifyProductPayload(hkBudget);
assert(ukShopifyPayload.storefront === "luxury" && ukShopifyPayload.status === "ready_to_sync", "UK luxury should generate a ready Shopify luxury payload.");
assert(hkShopifyPayload.storeDomainEnv === "SHOPIFY_HK_STORE_DOMAIN" && hkShopifyPayload.currency === "HKD", "HK luxury should generate Shopify HK payload.");
assert(budgetShopifyPayload.storefront === "budget" && !budgetShopifyPayload.collectionHandles.includes("luxury-resale"), "Budget fashion must not enter the luxury collection.");

const weakProofShopifyPayload = buildShopifyProductPayload(ukLuxury);
assert(weakProofShopifyPayload.status === "draft" && weakProofShopifyPayload.warnings.some((warning) => warning.includes("blocked")), "Weak proof luxury should be blocked from Shopify luxury publishing.");

const ukTikTokPayload = buildTikTokProductPayload(ukLuxury, ukVideos, ukTikTokLive, ukProof);
assert(ukTikTokPayload.destination === "tiktok_shop_uk" && ukTikTokPayload.videoHooks.length >= 2, "UK luxury should generate TikTok Shop/video payload.");
assert(ukTikTokPayload.status === "ready_to_sync", "Proof-ready UK luxury TikTok payload should be ready.");

const weakTikTokPayload = buildTikTokProductPayload(ukLuxury, ukVideos, ukTikTokLive);
assert(weakTikTokPayload.status === "manual_review_required", "Weak proof TikTok luxury promotion should require manual review.");

const tiktokText = `${ukTikTokPayload.title}\n${ukTikTokPayload.shortDescription}\n${ukTikTokPayload.videoHooks.join("\n")}\n${ukTikTokPayload.liveTalkingPoints.join("\n")}`;
assert(findForbiddenClaims(tiktokText).length === 0 && !/fake sold out|fake review/i.test(tiktokText), "TikTok payload should avoid fake/replica and fake-social-proof wording.");

const shopifyMock = mockSendShopifyProduct(ukLuxury, ukProof);
const tiktokMock = mockSendTikTokProduct(ukLuxury, ukVideos, ukTikTokLive, ukProof);
assert(shopifyMock.platform === "shopify" && shopifyMock.mode === "mock", "Shopify connector should run in mock mode without tokens.");
assert(tiktokMock.platform === "tiktok" && tiktokMock.mode === "mock", "TikTok connector should run in mock mode without tokens.");

const eventPlan = buildTikTokEventPlan("UK");
assert(eventPlan.events.includes("product_view") && eventPlan.events.includes("purchase"), "TikTok event plan should include Shopify funnel events.");

const riskCrmTask = createCRMTask({
  market: "UK",
  language: "en-GB",
  channel: "ebay_uk",
  customerId: "risk-customer",
  message: "I will open a case, this item is fake.",
  intent: "fake_claim"
});
assert(riskCrmTask.requiresApproval && riskCrmTask.segment === "risk_buyer", "Risk CRM task should require approval.");

const segments = buildAudienceSegments(sampleCustomers);
const ukOldBuyers = segments.find((segment) => segment.segmentId === "uk-old-buyers")!;
const hkVip = segments.find((segment) => segment.segmentId === "hk-vip")!;
assert(ukOldBuyers.sizeEstimate === 1, "UK old buyer audience should include consented old buyers and exclude risk buyers.");
assert(hkVip.channels.includes("discord_vip"), "HK VIP audience should include Discord VIP channel.");

const snapCampaign = buildAdCampaignBrief({
  market: "HK",
  channel: "snapchat_ads",
  objective: "reactivation",
  audienceSegment: segments.find((segment) => segment.segmentId === "hk-budget")!,
  product: hkBudget,
  dailyBudgetAmount: 200
});
assert(snapCampaign.complianceNotes.some((note) => note.includes("marketing consent")), "Ad campaign should include marketing consent note.");

const mainAds = buildMainPlatformAdPlan({ product: ukLuxury, customers: sampleCustomers, dailyBudgetAmount: 25 });
assert(mainAds.some((campaign) => campaign.channel === "tiktok_live_shopping_ads"), "Main ad plan should prioritize TikTok live shopping ads.");

const discord = buildDiscordFunnel("HK");
const snapchat = buildSnapchatFunnel("UK");
assert(discord.channels.includes("vip-drops") && discord.safetyRules.some((rule) => rule.includes("counterfeit")), "Discord funnel should include VIP drops and counterfeit safety.");
assert(snapchat.adAudiences.some((audience) => audience.includes("Old buyers")), "Snapchat funnel should include old buyer audience.");

console.log("All UK/HK AI Luxury Resale OS scenarios passed.");
