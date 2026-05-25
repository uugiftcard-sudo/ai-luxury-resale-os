/**
 * @luxury/video-factory
 * Product video pack generator.
 *
 * Produces: proof trust clips, AI host scripts, short video hooks,
 * live preview rundowns, and post-live highlight clips.
 *
 * Status: STUB — implement video asset generation pipeline.
 */
import type { Product, VideoAsset, ProofPack } from "@luxury/db";

export interface VideoPack {
  sku: string;
  assets: VideoAsset[];
}

/**
 * Generate a full video asset pack for a product.
 */
export function generateProductVideoPack(
  product: Product,
  proof: ProofPack | undefined
): VideoAsset[] {
  const assets: VideoAsset[] = [];

  const proofClip = makeProofClip(product, proof);
  if (proofClip) assets.push(proofClip);

  const aiHost = makeAIHostScript(product, proof);
  if (aiHost) assets.push(aiHost);

  const livePreview = makeLivePreview(product);
  if (livePreview) assets.push(livePreview);

  const shortHook = makeShortHook(product);
  if (shortHook) assets.push(shortHook);

  return assets;
}

function makeProofClip(product: Product, proof: ProofPack | undefined): VideoAsset | null {
  if (!proof) return null;
  return {
    videoId: `vid-proof-${product.sku}`,
    sku: product.sku,
    market: product.market,
    brandStream: product.brandStream,
    language: product.language,
    format: "proof_trust_clip",
    hook: `Real ${product.brand ?? product.category} — here is the proof`,
    script: [
      "[0-3s] Open on the item — hold for 3 seconds",
      "[3-8s] Show tag / serial if available",
      "[8-15s] Show detail shots: interior, hardware, stitching",
      "[15-20s] Show any flaws if present — be honest",
      "[20-25s] Show proof: receipt, tracking, source chat screenshot",
      "[25-30s] Call to action: DM to buy",
    ].join("\n"),
    shotList: [
      "Item flat lay (wide)",
      "Close-up tag / serial",
      "Hardware detail",
      "Interior lining",
      "Any visible wear",
      "Source receipt (blur sensitive info)",
      "Tracking screenshot",
    ],
    caption: `Proof of authenticity for ${product.title}. Ask before sharing.`,
    hashtags: ["#AuthenticLuxury", "#SecondHandLuxury", "#Verified"],
    callToAction: "DM me ✉️",
    platformVersion: "instagram",
    status: "draft",
    performance: { views: 0, likes: 0, comments: 0, dms: 0, saves: 0, clicks: 0, sales: 0 },
    complianceNotes: [
      "Do NOT say '100% real' — say 'proof available'",
      "Do NOT claim authorised reseller",
      "Show receipt in frame — blur personal info",
    ],
  };
}

function makeAIHostScript(product: Product, proof: ProofPack | undefined): VideoAsset | null {
  return {
    videoId: `vid-aihost-${product.sku}`,
    sku: product.sku,
    market: product.market,
    brandStream: product.brandStream,
    language: product.language,
    format: "tiktok",
    hook: `Let me show you why this ${product.brand ?? product.category} is worth your attention`,
    script: [
      `[HOOK - 3s] Look at this. Real ${product.brand ?? product.category}.`,
      `[PROBLEM - 5s] You have been looking for something like this but it is always out of budget.`,
      `[PROOF - 10s] Here is the thing — ${proof ? "I have proof of source. Receipt, tracking, the whole thing." : "I can show you where it came from."}`,
      `[OFFER - 5s] Size ${product.size ?? "N/A"}, condition ${product.conditionGrade}. ${product.conditionNotes || "No visible issues."}`,
      `[CTA - 2s] Drop a comment and I will send you the link.`,
    ].join("\n"),
    shotList: ["Host introduction", "Product reveal", "Proof documentation", "Close-up details", "Price card"],
    caption: `Real ${product.brand ?? product.category} | ${product.conditionGrade} | ${product.market} only`,
    hashtags: ["#LuxuryResale", "#Authentic", `#${product.market}`],
    callToAction: "💬 Comment 'DM' for link",
    platformVersion: "tiktok_shop_uk",
    status: "draft",
    performance: { views: 0, likes: 0, comments: 0, dms: 0, saves: 0, clicks: 0, sales: 0 },
    complianceNotes: [],
  };
}

function makeLivePreview(product: Product): VideoAsset | null {
  return {
    videoId: `vid-live-${product.sku}`,
    sku: product.sku,
    market: product.market,
    brandStream: product.brandStream,
    language: product.language,
    format: "live_preview",
    hook: `${product.title} — going live in 10 minutes with this one`,
    script: "See live rundown plan",
    shotList: ["Product flat lay", "Condition walkthrough", "Serial check", "Price reveal", "Q&A"],
    caption: `LIVE PREVIEW: ${product.title}`,
    hashtags: ["#LuxuryLive", "#ComingSoon"],
    callToAction: "Join the live",
    platformVersion: "instagram",
    status: "draft",
    performance: { views: 0, likes: 0, comments: 0, dms: 0, saves: 0, clicks: 0, sales: 0 },
    complianceNotes: [],
  };
}

function makeShortHook(product: Product): VideoAsset | null {
  return {
    videoId: `vid-hook-${product.sku}`,
    sku: product.sku,
    market: product.market,
    brandStream: product.brandStream,
    language: product.language,
    format: "tiktok",
    hook: `This is not a sponsored post. Just someone selling their ${product.brand ?? product.category} for less than it is worth.`,
    script: "ASL + price reveal + proof summary",
    shotList: ["Item in hand", "Price reveal graphic", "Source proof screenshot"],
    caption: `Real deal. ${product.market} only. ${product.conditionGrade} condition.`,
    hashtags: ["#LuxuryForLess", "#RealSeller"],
    callToAction: "Link in bio",
    platformVersion: "tiktok_shop_uk",
    status: "draft",
    performance: { views: 0, likes: 0, comments: 0, dms: 0, saves: 0, clicks: 0, sales: 0 },
    complianceNotes: [],
  };
}
