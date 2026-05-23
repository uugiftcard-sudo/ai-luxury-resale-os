import type { AgentResult, DailyReport, SourcingQueueItem, ListingTask, ContentTask, RiskAlert } from "./types.js";
import type { Market } from "@luxury/db";

export interface ReportAgentOutput {
  result: AgentResult;
  report: DailyReport;
}

export async function runReportAgent(
  runId: string,
  markets: Market[],
  agentResults: AgentResult[],
  sourcingItems: SourcingQueueItem[],
  listingTasks: ListingTask[],
  contentTasks: ContentTask[],
  riskAlerts: RiskAlert[]
): Promise<ReportAgentOutput> {
  const start = Date.now();

  const totalTasks =
    listingTasks.length +
    contentTasks.reduce((acc, t) => acc + t.formats.length, 0) +
    sourcingItems.filter((i) => i.decision === "buy").length;

  const escalationCount = agentResults.reduce(
    (acc, r) => acc + (r.escalations?.length ?? 0),
    0
  );

  const nextActions: string[] = [];

  // Derive next actions from agent results
  const highRiskAlerts = riskAlerts.filter((a) => a.severity === "critical");
  if (highRiskAlerts.length > 0) {
    nextActions.push(`🚨 Review ${highRiskAlerts.length} critical risk alerts before any other action`);
  }

  const pendingProofs = listingTasks.filter((t) => t.reason.includes("Proof pack missing"));
  if (pendingProofs.length > 0) {
    nextActions.push(`📋 Complete proof packs for: ${pendingProofs.map((t) => t.product.sku).join(", ")}`);
  }

  const buyDecisions = sourcingItems.filter((i) => i.decision === "buy");
  if (buyDecisions.length > 0) {
    nextActions.push(`🛒 Review ${buyDecisions.length} buy decisions — check ROI and proof before purchasing`);
  }

  const listingHighPriority = listingTasks.filter((t) => t.priority === "high");
  if (listingHighPriority.length > 0) {
    nextActions.push(`📸 List now: ${listingHighPriority.map((t) => t.product.sku).join(", ")}`);
  }

  if (nextActions.length === 0) {
    nextActions.push("✅ No urgent actions — system clean");
  }

  const report: DailyReport = {
    date: new Date().toISOString().split("T")[0],
    runId,
    markets,
    agents: agentResults,
    topSourcingDecisions: sourcingItems.slice(0, 5),
    topListingTasks: listingTasks.slice(0, 10),
    topContentTasks: contentTasks.slice(0, 10),
    riskAlerts: riskAlerts.slice(0, 10),
    escalationCount,
    totalTasks,
    nextActions,
  };

  return {
    result: {
      agentId: "report",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      summary: `${escalationCount} escalations, ${totalTasks} total tasks, ${nextActions.length} next actions`,
      tasksGenerated: nextActions.length,
      escalations: agentResults.flatMap((r) => r.escalations ?? []),
    },
    report,
  };
}
