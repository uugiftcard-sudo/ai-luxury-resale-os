/**
 * @luxury/listing-crosspost
 * Platform-specific listing generator and crossposting utility.
 *
 * Generates listings for: Carousell, eBay UK, Vinted, Depop,
 * Instagram, Shopify, WhatsApp Catalogue, Telegram VIP, etc.
 *
 * Status: STUB — implement actual listing generation + platform APIs.
 */
import type { Product, Listing, ProofPack, Platform, Language, Money } from "@luxury/db";

export interface ListingGenOptions {
  platform: Platform;
  language: Language;
  proofSummary: string;
  includePriceInTitle: boolean;
  maxTitleChars: number;
}

/**
 * Generate a single platform listing from a product.
 */
export function generateListings(
  product: Product,
  proof: ProofPack | undefined,
  options?: Partial<ListingGenOptions>
): Listing[] {
  const opts: ListingGenOptions = {
    platform: "carousell_hk",
    language: product.language,
    proofSummary: proof ? "✓ 鑒定資料齊備" : "需补充证明",
    includePriceInTitle: true,
    maxTitleChars: 80,
    ...options,
  };

  const baseListing: Listing = {
    sku: product.sku,
    market: product.market,
    platform: opts.platform,
    language: opts.language,
    title: truncate(product.title, opts.maxTitleChars),
    description: buildDescription(product, proof, opts),
    price: product.targetPrice,
    status: "draft",
    warnings: [],
  };

  return [baseListing];
}

function buildDescription(
  product: Product,
  proof: ProofPack | undefined,
  opts: ListingGenOptions
): string {
  const lines = [
    product.title,
    "",
    `Condition: ${product.conditionGrade}${product.conditionNotes ? ` — ${product.conditionNotes}` : ""}`,
    "",
    opts.proofSummary ? `Authenticity: ${opts.proofSummary}` : "",
    "",
    "Price is firm. Serious buyers only.",
    "DM for more photos or questions.",
  ];
  return lines.filter(Boolean).join("\n");
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}
