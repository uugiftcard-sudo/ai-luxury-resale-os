import { dailyCommunityPlan } from "@luxury/community-growth";
import type { Market } from "@luxury/db";
import type { AgentResult } from "./types.js";

export interface CommunityAgentOutput {
  result: AgentResult;
  engagementTasks: string[];
  kocBriefs: string[];
  vipDropCopies: string[];
}

export async function runCommunityAgent(
  market: Market
): Promise<CommunityAgentOutput> {
  const start = Date.now();
  const tasks = dailyCommunityPlan(market);
  const engagementTasks: string[] = [];
  const kocBriefs: string[] = [];
  const vipDropCopies: string[] = [];

  for (const task of tasks) {
    if (task.channel === "KOL/KOC" || task.channel === "KOC") {
      kocBriefs.push(`[KOC] ${task.channel}: ${task.task} — ${task.complianceRule}`);
    } else if (task.channel === "VIP Drop" || task.channel === "VIP Group") {
      vipDropCopies.push(`[VIP] ${task.channel}: ${task.task}`);
    } else {
      engagementTasks.push(`[${task.channel}] ${task.task}`);
    }
  }

  return {
    result: {
      agentId: "community",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market,
      summary: `${engagementTasks.length} engagement tasks, ${kocBriefs.length} KOC briefs, ${vipDropCopies.length} VIP drops`,
      tasksGenerated: tasks.length,
      escalations: [],
      details: { engagementTasks, kocBriefs, vipDropCopies },
    },
    engagementTasks,
    kocBriefs,
    vipDropCopies,
  };
}
