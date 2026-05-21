import { scoreSourcingLead } from "@luxury/sourcing-engine";
import type { SourcingLead } from "@luxury/db";
import type { AgentResult, SourcingQueueItem } from "./types.js";

export interface SourcingAgentOutput {
  result: AgentResult;
  watchList: SourcingQueueItem[];
  rejectList: SourcingQueueItem[];
}

export async function runSourcingAgent(
  leads: SourcingLead[],
  market: string
): Promise<SourcingAgentOutput> {
  const start = Date.now();
  const escalations: string[] = [];
  const watchList: SourcingQueueItem[] = [];
  const rejectList: SourcingQueueItem[] = [];

  for (const lead of leads) {
    const decision = scoreSourcingLead(lead);

    const item: SourcingQueueItem = {
      leadId: lead.id,
      leadTitle: lead.title,
      decision: decision.decision,
      estimatedProfit: decision.estimatedProfit,
      roiPercent: decision.roiPercent,
      reasons: decision.reasons,
    };

    if (decision.decision === "buy" || decision.decision === "watch") {
      watchList.push(item);
    } else {
      rejectList.push(item);
    }

    // Escalation rules
    if (lead.riskFlags.length > 0) {
      const highRiskFlags = lead.riskFlags.filter((f) =>
        ["high_risk_brand", "unverified_source", "cross_border_dispute", "counterfeit_reported"].includes(f)
      );
      if (highRiskFlags.length > 0) {
        escalations.push(
          `[${lead.id}] Escalate: ${highRiskFlags.join(", ")} — ${lead.title} (${lead.askingPrice.amount} ${lead.askingPrice.currency})`
        );
      }
    }

    if (decision.roiPercent < 0) {
      escalations.push(`[${lead.id}] Negative ROI (${decision.roiPercent.toFixed(1)}%) — reject`);
    }
  }

  const bought = watchList.filter((i) => i.decision === "buy").length;
  const watched = watchList.filter((i) => i.decision === "watch").length;

  return {
    result: {
      agentId: "sourcing",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary: `Scored ${leads.length} leads: ${bought} buy, ${watched} watch, ${rejectList.length} reject`,
      itemsProcessed: leads.length,
      tasksGenerated: bought,
      escalations,
    },
    watchList,
    rejectList,
  };
}
