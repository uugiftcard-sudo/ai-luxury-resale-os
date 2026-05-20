import { findForbiddenClaims, type Listing, type Platform, type Product, type ProofPack } from "@luxury/db";

const ukPlatforms: Platform[] = ["ebay_uk", "shopify_uk", "tiktok_shop_uk", "instagram", "vinted", "depop", "pinterest"];
const hkPlatforms: Platform[] = ["carousell_hk", "shopify_hk", "instagram", "facebook_marketplace_hk", "whatsapp_catalogue"];

function baseDisclaimer(product: Product): string {
  if (product.brandStream === "budget_fashion") {
    return "Budget fashion/style item. This is not presented as a designer-branded product.";
  }
  return "Pre-owned genuine second-hand item. Please review all photos, condition notes, included accessories, and available proof before purchase. We are not an authorised brand reseller unless explicitly stated.";
}

function hkDescription(product: Product, proof?: ProofPack): string {
  return [
    `${product.title}`,
    `狀態: ${product.conditionGrade} - ${product.conditionNotes}`,
    proof?.serialOrCode ? `編號/Code: ${proof.serialOrCode}` : "編號/Code: 如相片所示或不適用",
    "交收: 可順豐/智能櫃/指定面交，付款及交收紀錄會保存。",
    "所有相片及瑕疵已盡量清楚展示，購買前請先確認相片及描述。",
    baseDisclaimer(product)
  ].join("\n");
}

function ukDescription(product: Product, proof?: ProofPack): string {
  return [
    product.title,
    `Condition: ${product.conditionGrade} - ${product.conditionNotes}`,
    proof?.serialOrCode ? `Serial/code: ${proof.serialOrCode}` : "Serial/code: shown where available or not applicable.",
    "Delivery: tracked delivery with packing evidence retained.",
    "Returns and disputes are handled according to platform rules and statutory rights.",
    baseDisclaimer(product)
  ].join("\n");
}

export function defaultPlatforms(product: Product): Platform[] {
  return product.market === "UK" ? ukPlatforms : hkPlatforms;
}

export function generateListings(product: Product, proof?: ProofPack, platforms = defaultPlatforms(product)): Listing[] {
  return platforms.map((platform) => {
    const isHK = product.market === "HK";
    const titlePrefix = isHK ? "二手正貨" : "Pre-owned";
    const title = `${titlePrefix} ${product.title}`.slice(0, 120);
    const description = isHK ? hkDescription(product, proof) : ukDescription(product, proof);
    const warnings = findForbiddenClaims(`${title}\n${description}`);

    return {
      sku: product.sku,
      market: product.market,
      platform,
      language: isHK ? "zh-Hant-HK" : "en-GB",
      title,
      description,
      price: product.targetPrice,
      status: warnings.length ? "draft" : "ready",
      warnings
    };
  });
}
