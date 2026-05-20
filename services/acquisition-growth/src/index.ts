import type {
  AcquisitionChannel,
  AdCampaignBrief,
  AudienceSegment,
  CustomerProfile,
  DiscordFunnelPlan,
  Market,
  Money,
  Product,
  SnapchatFunnelPlan
} from "@luxury/db";

function marketCurrency(market: Market): Money["currency"] {
  return market === "UK" ? "GBP" : "HKD";
}

export function buildAudienceSegments(customers: CustomerProfile[]): AudienceSegment[] {
  const usable = customers.filter((customer) => customer.consentForMarketing && !customer.riskFlags.length);
  const byMarket = (market: Market) => usable.filter((customer) => customer.market === market);

  return (["UK", "HK"] as const).flatMap((market) => {
    const marketCustomers = byMarket(market);
    const oldBuyers = marketCustomers.filter((customer) => customer.segment === "old_buyer" || customer.lastPurchaseDaysAgo !== undefined);
    const vip = marketCustomers.filter((customer) => customer.segment === "vip");
    const budget = marketCustomers.filter((customer) => customer.segment === "budget_buyer");

    return [
      {
        segmentId: `${market.toLowerCase()}-old-buyers`,
        market,
        name: `${market} Old Buyer Reactivation`,
        source: "old_buyers",
        channels: market === "UK" ? ["email_reactivation", "meta_instagram_ads", "snapchat_ads"] : ["whatsapp_vip", "discord_vip", "snapchat_ads"],
        sizeEstimate: oldBuyers.length,
        rules: ["Has marketing consent", "Exclude risk buyers", "Message with new drop or budget-fashion bundle"],
        exclusions: ["risk_buyer", "no marketing consent"]
      },
      {
        segmentId: `${market.toLowerCase()}-vip`,
        market,
        name: `${market} VIP Drop Audience`,
        source: "vip",
        channels: market === "UK" ? ["email_reactivation", "discord_vip", "tiktok_live_shopping_ads"] : ["whatsapp_vip", "discord_vip", "creator_koc"],
        sizeEstimate: vip.length,
        rules: ["Early preview", "Real stock only", "No fake scarcity"],
        exclusions: ["risk_buyer"]
      },
      {
        segmentId: `${market.toLowerCase()}-budget`,
        market,
        name: `${market} Budget Fashion Buyers`,
        source: "old_buyers",
        channels: ["snapchat_ads", "creator_koc", "meta_instagram_ads"],
        sizeEstimate: budget.length,
        rules: ["Use budget fashion / inspired style wording", "No designer imitation claims"],
        exclusions: ["luxury-only buyers", "risk_buyer"]
      }
    ];
  });
}

export function buildAdCampaignBrief(input: {
  market: Market;
  channel: AcquisitionChannel;
  objective: AdCampaignBrief["objective"];
  audienceSegment: AudienceSegment;
  product?: Product;
  dailyBudgetAmount: number;
}): AdCampaignBrief {
  const currency = marketCurrency(input.market);
  const isLuxury = input.product?.brandStream === "luxury_resale";
  const creativeAngle = isLuxury
    ? "Proof-first second-hand luxury drop: condition, details, tracked/SF delivery, and available evidence."
    : "Budget fashion drop: styling, value, bundles, and fast local delivery without designer imitation claims.";

  return {
    campaignId: `${input.market.toLowerCase()}-${input.channel}-${input.objective}`,
    market: input.market,
    channel: input.channel,
    objective: input.objective,
    audienceSegmentId: input.audienceSegment.segmentId,
    budget: { amount: input.dailyBudgetAmount, currency },
    creativeSku: input.product?.sku,
    creativeAngle,
    complianceNotes: [
      "Use real stock and real prices only.",
      "No fake reviews, fake buyers, fake scarcity, replica wording, or unsupported authenticity promises.",
      "Use only audiences with marketing consent where customer-list uploads or direct reactivation are involved."
    ]
  };
}

export function buildDiscordFunnel(market: Market): DiscordFunnelPlan {
  const hk = market === "HK";
  return {
    market,
    serverName: hk ? "HK AI Fashion VIP Club" : "UK AI Luxury Resale Club",
    channels: hk
      ? ["welcome", "vip-drops", "carousell-finds", "budget-fashion", "proof-and-trust", "live-schedule", "support"]
      : ["welcome", "vip-drops", "ebay-finds", "budget-fashion", "proof-and-trust", "live-schedule", "support"],
    onboardingQuestions: hk
      ? ["你想睇二手名牌、平價時裝，定兩樣都睇?", "你想要 WhatsApp 通知定 Discord 通知?", "你主要想順豐定面交?"]
      : ["Are you here for luxury resale, budget fashion, or both?", "Do you want live drop reminders?", "What categories do you want: bags, sneakers, jackets, streetwear?"],
    roles: hk ? ["Luxury Buyer", "Budget Buyer", "VIP Early Drop", "SF Delivery"] : ["Luxury Buyer", "Budget Buyer", "VIP Early Drop", "UK Tracked Delivery"],
    weeklyEvents: ["Monday new-stock preview", "Wednesday styling poll", "Friday live drop", "Sunday clearance bundle"],
    safetyRules: [
      "No counterfeit trading.",
      "No fake reviews or fake buyer pressure.",
      "Disputes go through support, not public arguments.",
      "High-risk issues are handled by the founder."
    ]
  };
}

export function buildSnapchatFunnel(market: Market): SnapchatFunnelPlan {
  const hk = market === "HK";
  return {
    market,
    publicProfileTheme: hk ? "HK quick fashion drops, Cantonese styling, VIP previews" : "UK resale finds, outfit clips, live drop previews",
    organicStoryIdeas: hk
      ? ["今日 HK$500-HK$8000 drop", "順豐出貨 behind the scenes", "3個廣東話穿搭 quick tips", "VIP preview before Carousell post"]
      : ["Today's under-£800 finds", "Packing proof behind the scenes", "3 ways to style one item", "Live drop reminder"],
    adAudiences: [
      "Old buyers with marketing consent",
      "Video/story engagers",
      "Website or product page visitors via pixel where installed",
      "Lookalike audience from best buyers where platform allows"
    ],
    retargetingEvents: ["product_view", "video_view", "add_to_cart", "message_click", "purchase"],
    creativeRules: [
      "Vertical video first.",
      "Hook in first two seconds.",
      "Show product, price band, condition, and CTA.",
      "No counterfeit-coded wording or fake social proof."
    ]
  };
}
