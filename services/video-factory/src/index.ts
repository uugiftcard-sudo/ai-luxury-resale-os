import type { BrandStream, Language, Market, Platform, Product, ProofPack, VideoAsset, VideoFormat } from "@luxury/db";

const emptyPerformance = {
  views: 0,
  likes: 0,
  comments: 0,
  dms: 0,
  saves: 0,
  clicks: 0,
  sales: 0
};

function languageFor(product: Product): Language {
  return product.market === "HK" ? "zh-Hant-HK" : "en-GB";
}

function platformFor(format: VideoFormat, market: Market): Platform | "youtube_shorts" {
  if (format === "whatsapp_vip") return "whatsapp_catalogue";
  if (format === "carousell_video") return "carousell_hk";
  if (format === "pinterest_video") return "pinterest";
  if (format === "youtube_shorts") return "youtube_shorts";
  if (format === "tiktok") return market === "UK" ? "tiktok_shop_uk" : "instagram";
  return "instagram";
}

function audienceTone(market: Market, brandStream: BrandStream): string {
  if (brandStream === "budget_fashion") {
    return market === "HK" ? "平價時裝、輕鬆、快節奏、講配搭" : "budget fashion, upbeat, styling-led";
  }
  return market === "HK" ? "可信、清楚展示狀態、講細節同證據" : "trust-first, condition-led, detail-focused";
}

function makeAsset(
  product: Product,
  proof: ProofPack | undefined,
  format: VideoFormat,
  hook: string,
  script: string,
  shotList: string[],
  caption: string,
  hashtags: string[],
  callToAction: string
): VideoAsset {
  return {
    videoId: `video-${product.sku}-${format}`,
    sku: product.sku,
    market: product.market,
    brandStream: product.brandStream,
    language: languageFor(product),
    format,
    hook,
    script,
    shotList,
    caption,
    hashtags,
    callToAction,
    platformVersion: platformFor(format, product.market),
    status: "draft",
    performance: { ...emptyPerformance },
    complianceNotes: [
      "No unsupported authenticity guarantee.",
      "No fake buyer, false review, false sold-out, or invented demand.",
      proof?.serialOrCode ? "Reference code exists in proof pack; do not reveal private proof if not intended." : "If no code exists, say proof/photos are available where applicable."
    ]
  };
}

export function generateProductVideoPack(product: Product, proof?: ProofPack): VideoAsset[] {
  const isHK = product.market === "HK";
  const isBudget = product.brandStream === "budget_fashion";
  const tone = audienceTone(product.market, product.brandStream);

  if (isHK) {
    const trustLine = isBudget
      ? "呢件係平價時裝配搭款，重點係剪裁、顏色同日常穿搭。"
      : "呢件會清楚展示狀態、細節、瑕疵同可提供嘅證據。";
    return [
      makeAsset(
        product,
        proof,
        "tiktok",
        `HK$${product.targetPrice.amount} 內今日主推：${product.title}`,
        `開場先影全件貨，再講尺寸/狀態，用 3 秒 close-up 展示最重要細節。${trustLine} 語氣：${tone}。`,
        ["全件貨正面", "logo/label 或設計細節 close-up", "瑕疵或質料 close-up", "上身/配搭鏡頭", "價格和SKU畫面"],
        `${product.title}｜${product.conditionNotes}｜想睇更多相可以DM SKU。`,
        ["#香港二手", "#CarousellHK", "#穿搭", "#二手時裝"],
        "DM SKU / 留言 HOLD"
      ),
      makeAsset(
        product,
        proof,
        "instagram_reels",
        `一件貨，3個配搭方法`,
        `用快剪展示日常、週末、約會/出街三個造型。${trustLine}`,
        ["造型1", "造型2", "造型3", "產品細節", "CTA畫面"],
        `3個配搭靈感：${product.title}。`,
        ["#香港穿搭", "#ootdhk", "#quietluxury", "#二手好物"],
        "Save低呢條，DM問詳情"
      ),
      makeAsset(
        product,
        proof,
        "carousell_video",
        `Carousell 快速睇貨：${product.title}`,
        `用 15 秒由外到內展示，最後講交收方法：順豐、智能櫃或指定面交。`,
        ["正面", "背面", "內籠/細節", "瑕疵", "交收方法文字"],
        `狀態已拍清楚，購買前可睇更多相。`,
        ["#Carousell香港", "#二手買賣"],
        "Carousell PM / WhatsApp VIP"
      ),
      makeAsset(
        product,
        proof,
        "whatsapp_vip",
        `VIP 先睇：${product.title}`,
        `用短片講今日 VIP hold 時間、價格、付款方式和交收選項，只講真實庫存狀態。`,
        ["產品全景", "價格", "狀態", "付款/交收方式"],
        `VIP preview：有興趣請回覆 SKU。`,
        ["#VIPDrop"],
        "回覆 SKU HOLD"
      ),
      makeAsset(
        product,
        proof,
        "proof_trust_clip",
        "點解我哋每件貨都要留證據？",
        `展示相片、來源紀錄、付款/交收紀錄和發貨前影片概念。只講「有證據保存」，不作超出資料嘅保證。`,
        ["證據資料夾畫面", "detail photo", "packing video示意", "tracking示意"],
        "買二手最重要係清楚、透明、有紀錄。",
        ["#二手買賣", "#安心交易"],
        "想睇證據相可以DM"
      )
    ];
  }

  const trustLine = isBudget
    ? "This is a budget styling piece; focus on fit, outfit ideas, and value."
    : "Show condition, flaws, accessories, and available proof without overclaiming.";

  return [
    makeAsset(
      product,
      proof,
      "tiktok",
      `A ${product.category} find under £${product.targetPrice.amount}`,
      `Open with the price and category, then show the front, details, flaws, and styling. ${trustLine} Tone: ${tone}.`,
      ["front view", "detail close-up", "condition/flaw close-up", "styling shot", "SKU and CTA"],
      `${product.title}. Condition shown clearly. DM the SKU for details.`,
      ["#ukfashion", "#secondhandstyle", "#resalefinds", "#tiktokshopuk"],
      "Comment the SKU or DM for more details"
    ),
    makeAsset(
      product,
      proof,
      "instagram_reels",
      `3 ways to style this ${product.category}`,
      `Show workday, casual, and evening styling options. ${trustLine}`,
      ["outfit 1", "outfit 2", "outfit 3", "close-up detail", "CTA screen"],
      `Three styling ideas for ${product.title}.`,
      ["#ukstyle", "#quietluxury", "#preownedfashion", "#outfitideas"],
      "Save this and DM the SKU"
    ),
    makeAsset(
      product,
      proof,
      "youtube_shorts",
      `Is this ${product.category} worth it?`,
      `Use a quick value breakdown: condition, styling, price, and who it suits. ${trustLine}`,
      ["hook text", "product spin", "condition close-up", "price card", "buyer fit summary"],
      `${product.title}: quick buyer guide.`,
      ["#shorts", "#fashionfinds", "#resale"],
      "Check the listing or ask for the SKU"
    ),
    makeAsset(
      product,
      proof,
      "live_preview",
      "Tonight's live drop preview",
      `Introduce the product as part of tonight's live lineup. Mention tracked delivery and proof availability where applicable.`,
      ["live lineup table", "product close-up", "condition note", "time reminder"],
      "Live preview: second-hand fashion finds with clear condition notes.",
      ["#livecommerce", "#tiktoklive", "#ukresale"],
      "Join live and ask for this SKU"
    ),
    makeAsset(
      product,
      proof,
      "proof_trust_clip",
      "Why every item gets a proof pack",
      "Explain that source records, detail photos, flaw photos, packing video, parcel weight, and tracking are kept to protect both buyer and seller.",
      ["proof folder", "detail photo", "packing video frame", "tracking screen"],
      "Trust in resale comes from clear records.",
      ["#resaletrust", "#secondhandfashion"],
      "Ask for available proof before buying"
    )
  ];
}

export interface DailyVideoTask {
  slot: "morning" | "afternoon" | "evening" | "night";
  task: string;
  targetCount: number;
}

export function dailyVideoCalendar(market: Market): DailyVideoTask[] {
  const liveChannel = market === "HK" ? "IG/WhatsApp/Carousell" : "TikTok/IG/Shopify";
  return [
    { slot: "morning", task: "Product detail clips", targetCount: 3 },
    { slot: "morning", task: "Styling clips", targetCount: 2 },
    { slot: "morning", task: "Proof/trust clip", targetCount: 1 },
    { slot: "afternoon", task: "Platform-specific clips", targetCount: 5 },
    { slot: "afternoon", task: "VIP preview video", targetCount: 1 },
    { slot: "afternoon", task: "Live reminder", targetCount: 1 },
    { slot: "evening", task: `${liveChannel} live session or live-style product demo`, targetCount: 1 },
    { slot: "evening", task: "Live highlight and Q&A clip", targetCount: 2 },
    { slot: "night", task: "Reuse best clips and review views/DMs/saves/clicks", targetCount: 3 }
  ];
}
