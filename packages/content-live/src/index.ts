/**
 * @luxury/content-live
 * Short-video hooks, captions, and live rundown generator.
 *
 * Produces: TikTok/Reels hooks, captions, live preview scripts,
 * VIP drop announcements, and Pinterest pins.
 *
 * Status: STUB — implement AI-powered content generation.
 */
import type { Product, ContentAsset } from "@luxury/db";

export interface ContentPack {
  hooks: string[];
  captions: string[];
  liveScript: string | null;
  vipDrop: string | null;
  pin: string | null;
}

/**
 * Generate a full content pack for a product.
 */
export function generateContentPack(product: Product): ContentAsset[] {
  const assets: ContentAsset[] = [];

  const hooks = generateHooks(product);
  for (const hook of hooks.slice(0, 3)) {
    assets.push({
      sku: product.sku,
      market: product.market,
      language: product.language,
      format: "short_video",
      hook,
      body: generateCaption(product, hook),
      callToAction: "DM to buy ✉️",
      complianceNotes: [
        "Do NOT claim brand is authorised reseller",
        "Do NOT use '1:1' or 'AAA grade'",
      ],
    });
  }

  if (hooks[0]) {
    assets.push({
      sku: product.sku,
      market: product.market,
      language: product.language,
      format: "caption",
      hook: hooks[0],
      body: generateCaption(product, hooks[0]),
      callToAction: "💬 Comment 'INFO' for details",
      complianceNotes: [],
    });
  }

  return assets;
}

function generateHooks(product: Product): string[] {
  const brand = product.brand ?? "";
  const condition = product.conditionGrade;
  const market = product.market;

  return [
    `Someone in ${market === "HK" ? "HK" : "the UK"} just scored this ${brand} for under asking 💸`,
    `${brand} ${product.title} — ${condition} condition. Price dropped.`,
    `Not a reseller. A real person clearing their collection. ${brand} included.`,
    `This ${brand} item is sitting in someone else's wardrobe, not yours. Here is why that matters.`,
  ];
}

function generateCaption(product: Product, hook: string): string {
  return [
    hook,
    "",
    `${product.title}`,
    `Condition: ${product.conditionGrade}`,
    `Market: ${product.market}`,
    "",
    product.conditionNotes || "Pristine — no visible wear.",
    "",
    "✅ Authentic — proof available on request",
    "",
    "#" + (product.brand ?? product.category).replace(/\s+/g, "") + " #LuxuryFashion #SecondHand #Authentic",
  ].join("\n");
}
