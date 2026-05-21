/**
 * Dispatcher — orchestrates all agent tasks in parallel per market.
 * Used by the GitHub Actions workflow and the local agent-cli.ts runner.
 */
import type {
  AgentResult,
  DispatcherResult,
  DispatcherOptions,
  SourcingQueueItem,
  ListingTask,
  ContentTask,
  RiskAlert,
} from "./types.js";
import type { Market } from "@luxury/db";

import { runSourcingAgent } from "./sourcing-agent.js";
import { runListingAgent } from "./listing-agent.js";
import { runContentAgent } from "./content-agent.js";
import { runVideoAgent } from "./video-agent.js";
import { runFulfilmentAgent } from "./fulfillment-agent.js";
import { runCommunityAgent } from "./community-agent.js";
import { runRiskAgent } from "./risk-agent.js";
import { runReportAgent } from "./report-agent.js";

import { sampleProducts, sampleProofPacks, sampleSourcingLeads } from "../scripts/sample-data.js";

export async function runDispatcher(options: DispatcherOptions = {}): Promise<DispatcherResult> {
  const runId = `run-${Date.now()}`;
  const triggeredBy = options.dryRun ? "dry-run" : "github-actions";
  const start = Date.now();
  const markets: Market[] = (options.markets?.length ? options.markets : ["UK", "HK"]) as Market[];
  const agentIds = options.agents ?? ["sourcing", "listing", "content", "video", "fulfillment", "community", "risk"];

  // Shared state collected from each agent
  const allAgentResults: AgentResult[] = [];
  const allSourcingItems: SourcingQueueItem[] = [];
  const allListingTasks: ListingTask[] = [];
  const allContentTasks: ContentTask[] = [];
  const allRiskAlerts: RiskAlert[] = [];

  const completedMarkets: Market[] = [];
  const failedMarkets: Market[] = [];

  for (const market of markets) {
    const marketStart = Date.now();
    const agentResults: AgentResult[] = [];

    try {
      // All agents per market run in parallel
      const tasks: Promise<void>[] = [];

      // ── Sourcing Agent ──────────────────────────────────────────────────────
      if (agentIds.includes("sourcing")) {
        tasks.push(
          runSourcingAgent(sampleSourcingLeads.filter((l) => l.market === market), market).then(
            ({ result, watchList, rejectList }) => {
              agentResults.push(result);
              allSourcingItems.push(...watchList, ...rejectList);
            }
          )
        );
      }

      // ── Listing Agent ──────────────────────────────────────────────────────
      if (agentIds.includes("listing")) {
        const proofs = new Map(sampleProofPacks.map((p) => [p.sku, p]));
        tasks.push(
          runListingAgent(sampleProducts.filter((p) => p.market === market), proofs, market).then(
            ({ result, tasks }) => {
              agentResults.push(result);
              allListingTasks.push(...tasks);
            }
          )
        );
      }

      // ── Content Agent ──────────────────────────────────────────────────────
      if (agentIds.includes("content")) {
        tasks.push(
          runContentAgent(sampleProducts.filter((p) => p.market === market), market).then(
            ({ result, tasks }) => {
              agentResults.push(result);
              allContentTasks.push(...tasks);
            }
          )
        );
      }

      // ── Video Agent ───────────────────────────────────────────────────────
      if (agentIds.includes("video")) {
        const proofs = new Map(sampleProofPacks.map((p) => [p.sku, p]));
        tasks.push(
          runVideoAgent(sampleProducts.filter((p) => p.market === market), proofs, market).then(
            ({ result }) => {
              agentResults.push(result);
            }
          )
        );
      }

      // ── Fulfilment Agent ─────────────────────────────────────────────────
      if (agentIds.includes("fulfillment")) {
        const proofs = new Map(sampleProofPacks.map((p) => [p.sku, p]));
        tasks.push(
          runFulfilmentAgent(sampleProducts.filter((p) => p.market === market), proofs, market).then(
            ({ result }) => {
              agentResults.push(result);
            }
          )
        );
      }

      // ── Community Agent ──────────────────────────────────────────────────
      if (agentIds.includes("community")) {
        tasks.push(
          runCommunityAgent(market).then(({ result }) => {
            agentResults.push(result);
          })
        );
      }

      // ── Risk Agent ───────────────────────────────────────────────────────
      if (agentIds.includes("risk")) {
        const proofs = new Map(sampleProofPacks.map((p) => [p.sku, p]));
        tasks.push(
          runRiskAgent(sampleProducts.filter((p) => p.market === market), proofs, market).then(
            ({ result, alerts }) => {
              agentResults.push(result);
              allRiskAlerts.push(...alerts);
            }
          )
        );
      }

      await Promise.all(tasks);

      // Mark any failed agents
      for (const r of agentResults) {
        if (r.status === "error") {
          failedMarkets.push(market);
        }
      }
      completedMarkets.push(market);
      allAgentResults.push(...agentResults);

      console.log(`[dispatcher] ${market} done in ${Date.now() - marketStart}ms — ${agentResults.length} agents`);
    } catch (err) {
      failedMarkets.push(market);
      console.error(`[dispatcher] ${market} failed:`, err);
      allAgentResults.push({
        agentId: "report",
        status: "error",
        startedAt: new Date(marketStart).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - marketStart,
        market,
        errors: [`Market ${market} dispatcher error: ${String(err)}`],
      });
    }
  }

  // ── Report Agent ─────────────────────────────────────────────────────────
  const reportResult = await runReportAgent(
    runId,
    markets,
    allAgentResults,
    allSourcingItems,
    allListingTasks,
    allContentTasks,
    allRiskAlerts
  );

  const totalMs = Date.now() - start;

  const dispatcherResult: DispatcherResult = {
    runId,
    triggeredBy,
    triggeredAt: new Date(start).toISOString(),
    completedAt: new Date().toISOString(),
    totalDurationMs: totalMs,
    markets,
    agents: allAgentResults,
    summary: {
      totalItemsProcessed: allAgentResults.reduce((acc, r) => acc + (r.itemsProcessed ?? 0), 0),
      totalTasksGenerated: allAgentResults.reduce((acc, r) => acc + (r.tasksGenerated ?? 0), 0),
      totalEscalations: allAgentResults.reduce((acc, r) => acc + (r.escalations?.length ?? 0), 0),
      totalErrors: allAgentResults.reduce((acc, r) => acc + (r.errors?.length ?? 0), 0),
      marketsCompleted: completedMarkets,
      marketsFailed: failedMarkets,
    },
  };

  console.log(`[dispatcher] Full run ${runId} complete in ${totalMs}ms`);
  console.log(`  Markets: ${completedMarkets.join(", ")}${failedMarkets.length ? ` | Failed: ${failedMarkets.join(", ")}` : ""}`);
  console.log(`  Total tasks: ${dispatcherResult.summary.totalTasksGenerated}`);
  console.log(`  Escalations: ${dispatcherResult.summary.totalEscalations}`);
  console.log(`  Errors: ${dispatcherResult.summary.totalErrors}`);

  return dispatcherResult;
}
