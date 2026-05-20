import type { ContentAsset, Product } from "@luxury/db";
import { generateProductVideoPack } from "@luxury/video-factory";

export function generateContentPack(product: Product): ContentAsset[] {
  const isHK = product.market === "HK";
  const safeProofLine = product.brandStream === "luxury_resale"
    ? "Proof and condition details available before purchase."
    : "Budget fashion styling piece with no designer-brand claim.";

  if (isHK) {
    return [
      {
        sku: product.sku,
        market: "HK",
        language: "zh-Hant-HK",
        format: "short_video",
        hook: `HK$${product.targetPrice.amount} 內搵到呢件 ${product.category}`,
        body: `展示細節、瑕疵、上身效果，同埋點樣配 quiet luxury / streetwear look。${safeProofLine}`,
        callToAction: "留言 HOLD 或 DM 睇更多相。",
        complianceNotes: ["不使用假貨、replica、1:1 字眼", "不製造假成交或假評論"]
      },
      {
        sku: product.sku,
        market: "HK",
        language: "zh-Hant-HK",
        format: "live_script",
        hook: "今晚 live drop：二手 designer / 潮流單品",
        body: `先講狀態，再講尺寸，再展示瑕疵和細節。提醒觀眾購買前睇清相片及交收方式。`,
        callToAction: "想要就打 SKU，我哋會按留言次序 follow-up。",
        complianceNotes: ["面交及順豐都要保存付款/交收證據"]
      }
    ];
  }

  return [
    {
      sku: product.sku,
      market: "UK",
      language: "en-GB",
      format: "short_video",
      hook: `A ${product.category} find under £${product.targetPrice.amount}`,
      body: `Show condition, styling, flaws, and close-up details. ${safeProofLine}`,
      callToAction: "Comment the SKU or DM for the proof pack and delivery options.",
      complianceNotes: ["No fake review, fake buyer, or authorised reseller claim"]
    },
    {
      sku: product.sku,
      market: "UK",
      language: "en-GB",
      format: "live_script",
      hook: "Tonight's AI live drop: second-hand designer and streetwear finds",
      body: "Introduce condition, sizing, flaws, styling ideas, tracked delivery, and proof availability.",
      callToAction: "Ask for the SKU in chat and the team will follow up.",
      complianceNotes: ["Do not override statutory rights or platform returns rules"]
    }
  ];
}

export function generateVideoReadyContent(product: Product): ContentAsset[] {
  return generateProductVideoPack(product).map((video) => ({
    sku: video.sku,
    market: video.market,
    language: video.language,
    format: video.format === "live_preview" ? "live_script" : "short_video",
    hook: video.hook,
    body: `${video.script}\nShots: ${video.shotList.join(" -> ")}`,
    callToAction: video.callToAction,
    complianceNotes: video.complianceNotes
  }));
}
