/**
 * @luxury/community-growth
 * Community engagement, KOC brief, and VIP group task planner.
 *
 * Runs real engagement, KOC outreach, VIP group management,
 * and live warm-up — without fake reviews or fake buyers.
 *
 * Status: STUB — implement CRM + engagement automation.
 */
import type { Market } from "@luxury/db";

export interface CommunityTask {
  id: string;
  market: Market;
  type: "engagement" | "koc_outreach" | "vip_drop" | "live_warmup";
  title: string;
  description: string;
  targetCount: number;
  status: "pending" | "in_progress" | "done";
  due: "today" | "tomorrow" | "this_week";
  requiresApproval: boolean;
}

/**
 * Daily community engagement plan for a market.
 */
export function dailyCommunityPlan(market: Market): CommunityTask[] {
  const today = new Date().toISOString().slice(0, 10);
  const tasks: CommunityTask[] = [
    {
      id: `engagement-${today}`,
      market,
      type: "engagement",
      title: "Reply to unanswered DMs",
      description: "Go through all unanswered DM inbox messages and respond within 2 hours.",
      targetCount: 0,
      status: "pending",
      due: "today",
      requiresApproval: false,
    },
    {
      id: `koc-${today}`,
      market,
      type: "koc_outreach",
      title: "KOC DM (1-2 potential micro-influencers)",
      description: "Find 1-2 real buyers who have posted about luxury fashion. DM a non-generic intro.",
      targetCount: 2,
      status: "pending",
      due: "tomorrow",
      requiresApproval: true,
    },
    {
      id: `vip-${today}`,
      market,
      type: "vip_drop",
      title: "VIP group drop announcement",
      description: "Post exclusive item to VIP Telegram/WhatsApp group before public listing.",
      targetCount: 1,
      status: "pending",
      due: "today",
      requiresApproval: false,
    },
  ];
  return tasks;
}
