import type { Market } from "@luxury/db";

export interface CommunityTask {
  market: Market;
  channel: string;
  task: string;
  complianceRule: string;
}

export function dailyCommunityPlan(market: Market): CommunityTask[] {
  if (market === "HK") {
    return [
      {
        market,
        channel: "Carousell HK",
        task: "Reply to real buyer questions, update item availability, and invite serious buyers to view proof photos.",
        complianceRule: "No fake buyer comments, fake reviews, or counterfeit wording."
      },
      {
        market,
        channel: "WhatsApp/Telegram VIP",
        task: "Post one VIP drop preview with real stock, price, hold time, and SF/face-to-face options.",
        complianceRule: "No false scarcity or fake sold-out claims."
      },
      {
        market,
        channel: "Instagram HK",
        task: "Publish one Cantonese story poll and one product detail reel.",
        complianceRule: "KOC posts must be genuine trials or styling content."
      }
    ];
  }

  return [
    {
      market,
      channel: "TikTok UK",
      task: "Warm up live session with real Q&A clips and product preview comments.",
      complianceRule: "No fake buyers, fake reviews, or fake live sales."
    },
    {
      market,
      channel: "Instagram UK",
      task: "Reply to DMs, collect SKU requests, and invite buyers to VIP email list.",
      complianceRule: "Do not imply official brand authorisation."
    },
    {
      market,
      channel: "eBay watchers",
      task: "Review watcher count and send platform-compliant offers where available.",
      complianceRule: "All offers must reflect real stock and accurate condition."
    }
  ];
}
