import { scoreSourcingLead } from "@luxury/sourcing-engine";
import type { SourcingLead } from "@luxury/db";
import type { AgentResult, SourcingQueueItem } from "./types.js";

export interface SourcingAgentOutput {
  result: AgentResult;
  /** Leads scored as buy — added to the sourcing queue */
  buyQueue: SourcingQueueItem[];
  /** Leads scored as watch — pending, no cash committed yet */
  watchQueue: SourcingQueueItem[];
  /** Leads scored as reject — not suitable */
  rejected: SourcingQueueItem[];
}

export async function runSourcingAgent(
  leads: SourcingLead[],
  market: string
): Promise<SourcingAgentOutput> {
  const start = Date.now();
  const escalations: string[] = [];
  const buyQueue: SourcingQueueItem[] = [];
  const watchQueue: SourcingQueueItem[] = [];
  const rejected: SourcingQueueItem[] = [];

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

    switch (decision.decision) {
      case "buy":
        buyQueue.push(item);
        break;
      case "watch":
        watchQueue.push(item);
        break;
      case "reject":
        rejected.push(item);
        break;
    }

    // Escalation rules
    const highRiskFlags = lead.riskFlags.filter((f) =>
      ["high_risk_brand", "unverified_source", "cross_border_dispute", "counterfeit_reported"].includes(f)
    );
    if (highRiskFlags.length > 0) {
      escalations.push(
        `[${lead.id}] Escalate: ${highRiskFlags.join(", ")} — ${lead.title} ` +
        `(${lead.askingPrice.amount} ${lead.askingPrice.currency})`
      );
    }

    if (decision.roiPercent < 0) {
      escalations.push(
        `[${lead.id}] Negative ROI ${decision.roiPercent.toFixed(1)}% — reject`
      );
    }
  }

  return {
    result: {
      agentId: "sourcing",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary:
        `Scored ${leads.length} leads: ` +
        `${buyQueue.length} buy · ${watchQueue.length} watch · ${rejected.length} reject`,
      itemsProcessed: leads.length,
      tasksGenerated: buyQueue.length,
      issuesFound: rejected.length,
      escalations,
    },
    buyQueue,
    watchQueue,
    rejected,
  };
}
