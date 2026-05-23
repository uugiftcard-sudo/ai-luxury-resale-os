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
import { fetchStoreData } from "./store-data.js";

const ALL_AGENTS = ["sourcing", "listing", "content", "video", "fulfillment", "community", "risk"] as const;

export async function runDispatcher(options: DispatcherOptions = {}): Promise<DispatcherResult> {
  const runId = `run-${Date.now()}`;
  const triggeredBy = options.dryRun ? "dry-run" : "github-actions";
  const start = Date.now();

  const requestedMarkets: Market[] = (options.markets?.length
    ? options.markets
    : ["UK", "HK"]) as Market[];

  const requestedAgentIds: string[] = (options.agents?.length
    ? options.agents
    : [...ALL_AGENTS]) as string[];

  // Collect results across all markets
  const allAgentResults: AgentResult[] = [];
  const allSourcingItems: SourcingQueueItem[] = [];
  const allListingTasks: ListingTask[] = [];
  const allContentTasks: ContentTask[] = [];
  const allRiskAlerts: RiskAlert[] = [];

  const completedMarkets: string[] = [];
  const failedMarkets: string[] = [];

  // ── Fetch real data from in-memory store (or API at localhost:3001) ──────
  const storeData = await fetchStoreData();

  // ── Run per-market in series, agents within each market in parallel ──────
  for (const market of requestedMarkets) {
    const marketStart = Date.now();
    const marketAgentResults: AgentResult[] = [];

    // Filter data for this market
    const marketProducts = storeData.products.filter((p) => p.market === market);
    const marketProofs = new Map(storeData.proofPacks.filter((p) => p.market === market).map((p) => [p.sku, p]));
    const marketLeads = storeData.sourcingLeads.filter((l) => l.market === market);

    console.log(
      `[dispatcher] Starting ${market} — agents: ${requestedAgentIds.join(", ")} | ` +
      `products: ${marketProducts.length}, leads: ${marketLeads.length}`
    );

    try {
      const promises: Promise<void>[] = [];

      // ── Sourcing ───────────────────────────────────────────────────────
      if (requestedAgentIds.includes("sourcing")) {
        promises.push(
          runSourcingAgent(marketLeads, market).then(({ result, buyQueue, watchQueue }) => {
            marketAgentResults.push(result);
            allSourcingItems.push(...buyQueue, ...watchQueue);
          })
        );
      }

      // ── Listing ───────────────────────────────────────────────────────
      if (requestedAgentIds.includes("listing")) {
        promises.push(
          runListingAgent(marketProducts, marketProofs, market).then(({ result, tasks }) => {
            marketAgentResults.push(result);
            allListingTasks.push(...tasks);
          })
        );
      }

      // ── Content ───────────────────────────────────────────────────────
      if (requestedAgentIds.includes("content")) {
        promises.push(
          runContentAgent(marketProducts, market).then(({ result, tasks }) => {
            marketAgentResults.push(result);
            allContentTasks.push(...tasks);
          })
        );
      }

      // ── Video ─────────────────────────────────────────────────────────
      if (requestedAgentIds.includes("video")) {
        promises.push(
          runVideoAgent(marketProducts, marketProofs, market).then(({ result }) => {
            marketAgentResults.push(result);
          })
        );
      }

      // ── Fulfilment ────────────────────────────────────────────────────
      if (requestedAgentIds.includes("fulfillment")) {
        promises.push(
          runFulfilmentAgent(marketProducts, marketProofs, market).then(({ result }) => {
            marketAgentResults.push(result);
          })
        );
      }

      // ── Community ────────────────────────────────────────────────────
      if (requestedAgentIds.includes("community")) {
        promises.push(
          runCommunityAgent(market).then(({ result }) => {
            marketAgentResults.push(result);
          })
        );
      }

      // ── Risk ─────────────────────────────────────────────────────────
      if (requestedAgentIds.includes("risk")) {
        promises.push(
          runRiskAgent(marketProducts, marketProofs, market).then(({ result, alerts }) => {
            marketAgentResults.push(result);
            allRiskAlerts.push(...alerts);
          })
        );
      }

      // Wait for all agents in this market to finish
      await Promise.all(promises);

      // Check for errors
      const errors = marketAgentResults.filter((r) => r.status === "error");
      if (errors.length > 0) {
        failedMarkets.push(market);
        console.error(`[dispatcher] ${market} had ${errors.length} error(s):`, errors.map((e) => e.errors));
      } else {
        completedMarkets.push(market);
      }

      allAgentResults.push(...marketAgentResults);
      console.log(
        `[dispatcher] ${market} done in ${Date.now() - marketStart}ms — ${marketAgentResults.length} agents`
      );
    } catch (err) {
      failedMarkets.push(market);
      const errMsg = String(err);
      console.error(`[dispatcher] ${market} crashed:`, errMsg);
      allAgentResults.push({
        agentId: "report",
        status: "error",
        startedAt: new Date(marketStart).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - marketStart,
        market,
        errors: [`Market ${market} crashed: ${errMsg}`],
      });
    }
  }

  // ── Report Agent ────────────────────────────────────────────────────────────
  await runReportAgent(
    runId,
    requestedMarkets as Market[],
    allAgentResults,
    allSourcingItems,
    allListingTasks,
    allContentTasks,
    allRiskAlerts
  );

  // ── Assemble final result ──────────────────────────────────────────────────
  const dispatcherResult: DispatcherResult = {
    runId,
    triggeredBy,
    triggeredAt: new Date(start).toISOString(),
    completedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - start,
    markets: requestedMarkets,
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

  return dispatcherResult;
}
