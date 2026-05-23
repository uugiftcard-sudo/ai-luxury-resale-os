import type { CustomerProfile, LiveSession, OrderRecord, Product, ProofPack, SourcingLead } from "@luxury/db";
import { seedAll } from "@luxury/db";

export { sampleProducts, sampleProofPacks, sampleSourcingLeads, sampleOrders, sampleLiveSessions, sampleCustomers };

const sampleProducts: Product[] = [
  {
    sku: "UK-LUX-001",
    market: "UK",
    brandStream: "luxury_resale",
    currency: "GBP",
    language: "en-GB",
    title: "Gucci GG Canvas Crossbody Bag",
    brand: "Gucci",
    category: "bag",
    conditionGrade: "B",
    conditionNotes: "Visible corner wear, clean interior, hardware has light scratches.",
    cost: { amount: 220, currency: "GBP" },
    targetPrice: { amount: 395, currency: "GBP" },
    status: "proof_ready",
    platforms: ["ebay_uk", "shopify_uk", "tiktok_shop_uk", "instagram"],
    proofPackId: "proof-UK-LUX-001",
    riskFlags: ["designer_brand"]
  },
  {
    sku: "HK-LUX-001",
    market: "HK",
    brandStream: "luxury_resale",
    currency: "HKD",
    language: "zh-Hant-HK",
    title: "Prada Nylon Shoulder Bag",
    brand: "Prada",
    category: "手袋",
    conditionGrade: "B",
    conditionNotes: "袋身有輕微使用痕跡，金屬扣有正常花痕，內籠乾淨。",
    cost: { amount: 2600, currency: "HKD" },
    targetPrice: { amount: 4800, currency: "HKD" },
    status: "proof_ready",
    platforms: ["carousell_hk", "shopify_hk", "instagram", "whatsapp_catalogue"],
    proofPackId: "proof-HK-LUX-001",
    riskFlags: ["designer_brand", "carousell_counterfeit_sensitivity"]
  },
  {
    sku: "HK-BUD-001",
    market: "HK",
    brandStream: "budget_fashion",
    currency: "HKD",
    language: "zh-Hant-HK",
    title: "Korean Style Cropped Blazer",
    category: "平價時裝",
    size: "M",
    conditionGrade: "A",
    conditionNotes: "近新，無明顯瑕疵。",
    cost: { amount: 120, currency: "HKD" },
    targetPrice: { amount: 260, currency: "HKD" },
    status: "listed",
    platforms: ["instagram", "whatsapp_catalogue", "facebook_marketplace_hk"],
    riskFlags: []
  }
];

const sampleProofPacks: ProofPack[] = [
  {
    id: "proof-UK-LUX-001",
    sku: "UK-LUX-001",
    market: "UK",
    sourceRecord: "eBay private seller purchase, invoice saved",
    receiptRef: "receipts/uk-lux-001.pdf",
    serialOrCode: "recorded in private proof folder",
    detailPhotoRefs: ["photos/uk-lux-001-front.jpg", "photos/uk-lux-001-logo.jpg"],
    flawPhotoRefs: ["photos/uk-lux-001-corner-wear.jpg"],
    packingVideoRef: "videos/uk-lux-001-packing.mp4",
    parcelWeight: "0.8kg",
    trackingRef: "Royal Mail tracked reference pending dispatch",
    notes: ["Do not state authorised reseller."]
  },
  {
    id: "proof-HK-LUX-001",
    sku: "HK-LUX-001",
    market: "HK",
    sourceRecord: "Local reseller purchase with chat record saved",
    serialOrCode: "recorded in private proof folder",
    detailPhotoRefs: ["photos/hk-lux-001-front.jpg", "photos/hk-lux-001-label.jpg"],
    flawPhotoRefs: ["photos/hk-lux-001-hardware.jpg"],
    packingVideoRef: "videos/hk-lux-001-packing.mp4",
    trackingRef: "SF Express tracking pending dispatch",
    paymentProofRef: "payments/hk-lux-001-fps.png",
    notes: ["Carousell listing must not use counterfeit-coded wording."]
  }
];

const sampleSourcingLeads: SourcingLead[] = [
  {
    id: "lead-uk-001",
    market: "UK",
    channel: "ebay_sold",
    title: "Vintage designer shoulder bag with receipt",
    askingPrice: { amount: 180, currency: "GBP" },
    estimatedResalePrice: { amount: 360, currency: "GBP" },
    estimatedShipping: { amount: 8, currency: "GBP" },
    estimatedPlatformFeePercent: 0.13,
    brandStream: "luxury_resale",
    riskFlags: [],
    evidenceAvailable: ["receipt", "serial photo", "seller history"]
  },
  {
    id: "lead-hk-001",
    market: "HK",
    channel: "carousell_hk",
    title: "Too-cheap high-risk logo bag",
    askingPrice: { amount: 300, currency: "HKD" },
    estimatedResalePrice: { amount: 900, currency: "HKD" },
    estimatedShipping: { amount: 35, currency: "HKD" },
    estimatedPlatformFeePercent: 0.05,
    brandStream: "luxury_resale",
    riskFlags: ["counterfeit_sensitive", "price_too_low"],
    evidenceAvailable: ["one blurry photo"]
  }
];

const sampleOrders: OrderRecord[] = [
  {
    orderId: "order-uk-001",
    sku: "UK-LUX-001",
    market: "UK",
    platform: "ebay_uk",
    customerId: "uk-buyer-1",
    paidAmount: { amount: 395, currency: "GBP" },
    paymentMethod: "platform_checkout",
    fulfilmentMethod: "royal_mail",
    status: "paid",
    requiredEvidence: ["packingVideoRef", "parcelWeight", "trackingRef"]
  },
  {
    orderId: "order-hk-001",
    sku: "HK-LUX-001",
    market: "HK",
    platform: "carousell_hk",
    customerId: "hk-vip-1",
    paidAmount: { amount: 4800, currency: "HKD" },
    paymentMethod: "fps",
    fulfilmentMethod: "sf_express",
    status: "paid",
    requiredEvidence: ["paymentProofRef", "packingVideoRef", "trackingRef"]
  }
];

const sampleLiveSessions: LiveSession[] = [
  {
    sessionId: "live-uk-001",
    market: "UK",
    language: "en-GB",
    title: "UK evening resale drop",
    platforms: ["tiktok_shop_uk", "instagram"],
    productSkus: ["UK-LUX-001"],
    phase: "pre_live"
  },
  {
    sessionId: "live-hk-001",
    market: "HK",
    language: "zh-Hant-HK",
    title: "香港 VIP 二手好物 live",
    platforms: ["instagram", "whatsapp_catalogue"],
    productSkus: ["HK-LUX-001", "HK-BUD-001"],
    phase: "pre_live"
  }
];

const sampleCustomers: CustomerProfile[] = [
  {
    customerId: "uk-old-1",
    market: "UK",
    language: "en-GB",
    segment: "old_buyer",
    preferredChannels: ["email_reactivation", "meta_instagram_ads", "snapchat_ads"],
    interests: ["bags", "jackets", "quiet luxury"],
    lifetimeValue: { amount: 620, currency: "GBP" },
    lastPurchaseDaysAgo: 120,
    consentForMarketing: true,
    riskFlags: []
  },
  {
    customerId: "hk-vip-1",
    market: "HK",
    language: "zh-Hant-HK",
    segment: "vip",
    preferredChannels: ["whatsapp_vip", "discord_vip"],
    interests: ["手袋", "平價時裝", "直播drop"],
    lifetimeValue: { amount: 7200, currency: "HKD" },
    lastPurchaseDaysAgo: 21,
    consentForMarketing: true,
    riskFlags: []
  },
  {
    customerId: "hk-budget-1",
    market: "HK",
    language: "zh-Hant-HK",
    segment: "budget_buyer",
    preferredChannels: ["snapchat_ads", "whatsapp_vip"],
    interests: ["Korean style", "budget fashion"],
    lifetimeValue: { amount: 880, currency: "HKD" },
    lastPurchaseDaysAgo: 45,
    consentForMarketing: true,
    riskFlags: []
  },
  {
    customerId: "uk-risk-1",
    market: "UK",
    language: "en-GB",
    segment: "risk_buyer",
    preferredChannels: ["email_reactivation"],
    interests: ["chargeback"],
    lifetimeValue: { amount: 100, currency: "GBP" },
    consentForMarketing: true,
    riskFlags: ["chargeback_history"]
  }
];

export function seedToDb(): void {
  seedAll(sampleProducts, sampleProofPacks, sampleSourcingLeads, sampleOrders);
  console.log(
    "Seeded: products=%d, proofPacks=%d, leads=%d, orders=%d",
    sampleProducts.length, sampleProofPacks.length,
    sampleSourcingLeads.length, sampleOrders.length
  );
}
