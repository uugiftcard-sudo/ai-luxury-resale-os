/**
 * engine.ts — Execution Engine core
 *
 * Takes tasks from task-factory and runs them through the appropriate
 * platform executors. Handles:
 *  - Approval gating (critical/high risk tasks pause until approved)
 *  - Dry-run mode (validate, don't execute)
 *  - Execution retry with backoff
 *  - Result accumulation + summary
 *
 * Flow:
 *   buildExecutionQueue() → ExecutionEngine.run() → ExecutionRunResult
 */
import type {
  ExecutionTask,
  ExecutionResult,
  ExecutionRunResult,
  ExecutorPlatform,
} from "./execution-types.js";
import type { AgentOutputs } from "./task-factory.js";

import {
  executeDiscordTask,
  loadDiscordConfig,
  postReportSummary,
} from "./discord-executor.js";
import {
  executeWhatsAppTask,
  loadWhatsAppConfig,
} from "./whatsapp-executor.js";
import {
  executeEbayListing,
  loadEbayConfig,
  executeShopifyListing,
} from "./listing-executor.js";

const DIM = "\x1b[2m";
function c(color: string, text: string): string {
  return `${color}${text}\x1b[0m`;
}

// ── Approval store (in-memory; swap for DB in production) ─────────────────────

interface ApprovalRecord {
  taskId: string;
  approvedAt: string;
  approvedBy: string;
}

const _approved = new Map<string, ApprovalRecord>();

/** Check if a task has been approved. In production, this would query a DB. */
export function isApproved(taskId: string): boolean {
  return _approved.has(taskId);
}

/** Record an approval. In production, this would write to a DB. */
export function recordApproval(taskId: string, approvedBy = "founder"): void {
  _approved.set(taskId, { taskId, approvedAt: new Date().toISOString(), approvedBy });
}

// ── Engine ─────────────────────────────────────────────────────────────────

export interface EngineConfig {
  dryRun: boolean;
  /** If true, skip approval checks and run everything */
  bypassApproval?: boolean;
  /** Discord channel IDs per market */
  discordChannels: Record<string, string>;
  /** Skip specific platforms entirely */
  skipPlatforms?: ExecutorPlatform[];
}

const DEFAULT_CONFIG: EngineConfig = {
  dryRun: false,
  bypassApproval: false,
  discordChannels: {},
};

export class ExecutionEngine {
  private queue: ExecutionTask[];
  private results: ExecutionResult[];
  private config: EngineConfig;
  private discordConfig = loadDiscordConfig();
  private whatsappConfig = loadWhatsAppConfig();
  private ebayConfig = loadEbayConfig();

  constructor(queue: ExecutionTask[], config: Partial<EngineConfig> = {}) {
    this.queue = queue;
    this.results = [];
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Main entry point — run all tasks */
  async run(runId: string): Promise<ExecutionRunResult> {
    const start = Date.now();
    const results: ExecutionResult[] = [];
    let skipped = 0;

    console.log(`\n${"─".repeat(60)}`);
    console.log(`[engine] Execution queue: ${this.queue.length} tasks`);
    if (this.config.dryRun) console.log("[engine] ⚠  DRY RUN — no tasks will be executed");
    console.log(`${"─".repeat(60)}\n`);

    for (const task of this.queue) {
      // Platform filter
      if (this.config.skipPlatforms?.includes(task.platform)) {
        results.push({
          taskId: task.id,
          ok: true,
          mode: "mock",
          executedAt: new Date().toISOString(),
          durationMs: 0,
          platformMessage: `[SKIPPED] Platform ${task.platform} excluded by config`,
        });
        skipped++;
        continue;
      }

      // Approval gate
      if (task.requiresApproval && !this.config.bypassApproval && !isApproved(task.id)) {
        results.push({
          taskId: task.id,
          ok: false,
          mode: this.config.dryRun ? "mock" : "live",
          executedAt: new Date().toISOString(),
          durationMs: 0,
          error: `PENDING_APPROVAL: ${task.approvalReason ?? "founder approval required"}`,
          platformMessage: `⏳ Awaiting founder approval — task queued`,
        });
        skipped++;
        continue;
      }

      // Dry run
      if (this.config.dryRun) {
        const msg = `[DRY RUN] Would execute: ${task.platform} — ${task.summary}`;
        console.log(`  📝 ${c(DIM, msg)}`);
        results.push({
          taskId: task.id,
          ok: true,
          mode: "mock",
          executedAt: new Date().toISOString(),
          durationMs: 0,
          platformMessage: msg,
        });
        skipped++;
        continue;
      }

      // Execute
      const result = await this._execute(task);
      results.push(result);

      // Log
      const icon = result.ok ? "✅" : "❌";
      const platform = result.mode === "mock" ? "📝" : "🚀";
      console.log(
        `${platform} ${icon} [${task.platform}] ${task.summary.slice(0, 80)}`
      );
      if (!result.ok) {
        console.warn(`   ❗ ${result.error}`);
      }

      // Small delay between live executions to avoid rate limits
      if (result.mode === "live") {
        await sleep(500);
      }
    }

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;
    const pending = results.filter((r) => r.error?.startsWith("PENDING_APPROVAL")).length;
    const totalMs = Date.now() - start;

    console.log(`\n${"─".repeat(60)}`);
    console.log(
      `[engine] Done: ${results.length} total | ` +
        `${succeeded} ✅ | ${failed} ❌ | ${pending} ⏳ | ${skipped} 🔇`
    );
    console.log(`[engine] Duration: ${totalMs}ms`);
    console.log(`${"─".repeat(60)}\n`);

    return {
      runId,
      executed: results.length,
      succeeded,
      failed,
      skipped,
      pendingApproval: this.queue.filter(
        (t) =>
          t.requiresApproval &&
          !isApproved(t.id) &&
          !this.config.dryRun &&
          !this.config.bypassApproval
      ),
      results,
      durationMs: totalMs,
    };
  }

  private async _execute(task: ExecutionTask): Promise<ExecutionResult> {
    switch (task.platform) {
      case "discord":
        return executeDiscordTask(task, this.discordConfig);

      case "whatsapp":
        return executeWhatsAppTask(task, this.whatsappConfig);

      case "shopify":
        // Shopify needs a separate config per market
        return executeShopifyListing(task, {} as any);

      case "ebay":
        return executeEbayListing(task, this.ebayConfig);

      default:
        return {
          taskId: task.id,
          ok: false,
          mode: "mock",
          executedAt: new Date().toISOString(),
          durationMs: 0,
          error: `Unknown platform: ${task.platform}`,
        };
    }
  }

  /** Run the engine with the given outputs from all agents */
  static async runFromAgentOutputs(
    outputs: AgentOutputs,
    buildQueueOpts: {
      shopifyPayloads: Map<string, Record<string, unknown>>;
      ebayPayloads: Map<string, Record<string, unknown>>;
      discordChannels: Record<string, string>;
    },
    config: Partial<EngineConfig>
  ): Promise<ExecutionRunResult> {
    const { buildExecutionQueue } = await import("./task-factory.js");
    const runId = `exec-${Date.now()}`;

    const queue = buildExecutionQueue(outputs, buildQueueOpts);
    const engine = new ExecutionEngine(queue, config);
    return engine.run(runId);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Convenience: post daily summary to Discord ────────────────────────────────
export async function postDailySummary(
  summary: {
    runId: string;
    market: string;
    tasksExecuted: number;
    succeeded: number;
    failed: number;
    escalations: number;
    nextActions: string[];
  }
): Promise<void> {
  await postReportSummary(summary, loadDiscordConfig());
}
