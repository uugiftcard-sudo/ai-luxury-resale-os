/**
 * Auto Work Agent CLI
 * Run with:  npx tsx scripts/agent-cli.ts [options]
 *
 * Invoked by .github/workflows/auto-work.yml via:  npm run agent:run
 */
import { runDispatcher } from "../agent-tasks/dispatcher.js";
import type { Market } from "@luxury/db";
import type { AgentId } from "../agent-tasks/types.js";
import * as fs from "fs";

const args = process.argv.slice(2);

// ── Defaults ────────────────────────────────────────────────────────────────
let markets: Market[] | undefined;
let agents: string[] | undefined;
let dryRun = false;
let jsonOutput = false;
let outputPath: string | undefined;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--market":
      markets = [args[++i] as Market];
      break;
    case "--markets":
      markets = args[++i].split(",") as Market[];
      break;
    case "--agents":
      agents = args[++i].split(",");
      break;
    case "--dry-run":
    case "-n":
      dryRun = true;
      break;
    case "--json":
      jsonOutput = true;
      break;
    case "--output":
    case "-o":
      outputPath = args[++i];
      break;
    case "--help":
    case "-h":
      console.log(`Usage: npx tsx scripts/agent-cli.ts [options]

Options:
  --market  <UK|HK>   Run for a single market
  --markets <UK,HK>   Run for multiple markets (default: both)
  --agents  <list>    Comma-separated agent IDs (default: all)
  --dry-run           Simulate without side effects (no output files written)
  --json              Output machine-readable JSON to stdout
  --output, -o <path> Write JSON report to file (implies --json)
  --help, -h         Show this message

Agent IDs: sourcing, listing, content, video, fulfilment, community, risk, report
`);
      process.exit(0);
  }
}

// ── Colour helpers ─────────────────────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD  = "\x1b[1m";
const DIM   = "\x1b[2m";
const RED   = "\x1b[31m";
const GRN   = "\x1b[32m";
const YEL   = "\x1b[33m";
const BLU   = "\x1b[34m";
const MAG   = "\x1b[35m";
const CYAN  = "\x1b[36m";

const c = (color: string, text: string) => `${color}${text}${RESET}`;
const bold = (text: string) => c(BOLD, text);

function separator(char = "─", len = 52) {
  console.log(c(DIM, char.repeat(len)));
}

function statusIcon(status: string): string {
  if (status === "done")    return c(GRN,  "✅");
  if (status === "error")   return c(RED,  "❌");
  if (status === "skipped") return c(YEL,  "⏭️");
  if (status === "running") return c(BLU,  "🔄");
  return c(DIM, "  ");
}

function severityIcon(sev: string): string {
  if (sev === "critical") return c(RED,  "🚨");
  if (sev === "high")      return c(MAG,  "🔶");
  if (sev === "warning")   return c(YEL,  "⚠️");
  return c(GRN, "ℹ️");
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 1000) return `${diffSec}ms`;
  return `${Math.round(diffSec / 1000)}s`;
}

// ── Human-readable CLI output ──────────────────────────────────────────────
async function runCLI() {
  console.log(
    `\n${bold("🏭  Auto Work Agent")}  ${c(DIM, new Date().toISOString())}`
  );
  console.log(
    `   ${c(BLU, "Markets:")}  ${markets?.join(", ") ?? c(DIM, "UK + HK (all)")}`
  );
  console.log(
    `   ${c(BLU, "Agents:")}   ${agents?.join(", ") ?? c(DIM, "all 7 agents")}`
  );
  console.log(
    `   ${c(BLU, "Mode:")}     ${dryRun ? c(YEL, "DRY RUN (no file output)") : c(GRN, "LIVE")}`
  );
  separator();

  const start = Date.now();

  try {
    const result = await runDispatcher({
      markets,
      agents: agents as AgentId[] | undefined,
      dryRun,
    });

    void (result.totalDurationMs ?? Date.now() - start);

    // ── Write JSON output ──────────────────────────────────────────────
    if (jsonOutput || outputPath) {
      const jsonStr = JSON.stringify(result, null, 2);
      if (outputPath) {
        fs.writeFileSync(outputPath, jsonStr);
        console.log(c(GRN, `  📄  Report written → ${outputPath}`));
      } else {
        console.log(jsonStr);
      }
    }

    // ── Agent results table ───────────────────────────────────────────
    console.log(`\n${bold("📊 Agent Results")}`);
    separator();

    const allAgents = result.agents;
    const maxLen = Math.max(...allAgents.map((a) => a.agentId.length));

    for (const agent of allAgents) {
      const pad = " ".repeat(maxLen - agent.agentId.length);
      const market = agent.market ? ` ${c(BLU, `[${agent.market}]`)}` : "";
      console.log(
        `  ${statusIcon(agent.status)}  ${c(CYAN, agent.agentId)}${pad}${market}  ${c(DIM, "—")}  ${agent.summary ?? agent.status}`
      );

      // Escalations
      if (agent.escalations?.length) {
        for (const esc of agent.escalations) {
          console.log(`       ${c(YEL, "⚠️  " + esc)}`);
        }
      }
      // Errors
      if (agent.errors?.length) {
        for (const err of agent.errors) {
          console.log(`       ${c(RED, "❌  " + err)}`);
        }
      }
      // Duration
      if (agent.durationMs !== undefined && agent.durationMs > 0) {
        console.log(`       ${c(DIM, `⏱  ${timeAgo(agent.startedAt)}`)}`);
      }
    }

    // ── Risk alerts summary ──────────────────────────────────────────
    const allAlerts = allAgents
      .flatMap((a) => (a.details as any)?.alerts ?? [])
      .filter((a: any) => a.severity);

    if (allAlerts.length > 0) {
      console.log(`\n${bold("🚨 Risk Alerts")}`);
      separator();
      const bySev = { critical: 0, high: 0, warning: 0, info: 0 };
      for (const alert of allAlerts as any[]) {
        bySev[alert.severity as keyof typeof bySev] =
          (bySev[alert.severity as keyof typeof bySev] ?? 0) + 1;
        console.log(
          `  ${severityIcon(alert.severity)}  [${c(BOLD, alert.rule)}]  ${alert.message}`
        );
        if (alert.actionRequired) {
          console.log(`       ${c(BLU, "→")}  ${alert.actionRequired}`);
        }
      }
      console.log(
        c(
          DIM,
          `\n  Total:  ${Object.entries(bySev)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => `${v} ${k}`)
            .join("  ·  ")}`
        )
      );
    }

    // ── Summary stats ─────────────────────────────────────────────────
    separator();
    console.log(`\n${bold("📈 Run Summary")}`);
    separator();
    console.log(
      `  ${c(BLU, "⏱   Total time:")}   ${c(BOLD, timeAgo(result.triggeredAt))}`
    );
    console.log(
      `  ${c(BLU, "📦 Tasks:")}         ${c(BOLD, String(result.summary.totalTasksGenerated))}`
    );
    console.log(
      `  ${c(BLU, "🚨 Escalations:")}    ${result.summary.totalEscalations > 0 ? c(YEL, String(result.summary.totalEscalations)) : c(GRN, "0")}`
    );
    console.log(
      `  ${c(BLU, "❌ Errors:")}          ${result.summary.totalErrors > 0 ? c(RED, String(result.summary.totalErrors)) : c(GRN, "0")}`
    );
    console.log(
      `  ${c(BLU, "✅ Markets OK:")}     ${result.summary.marketsCompleted.join(", ") || c(RED, "none")}`
    );
    if (result.summary.marketsFailed.length > 0) {
      console.log(
        `  ${c(BLU, "❌ Markets failed:")}  ${c(RED, result.summary.marketsFailed.join(", "))}`
      );
    }
    console.log("");

    // Exit code: 1 only on actual crashes or market failures (not normal rejections)
    const exitCode =
      result.summary.totalErrors > 0 ||
      result.summary.marketsFailed.length > 0
        ? 1
        : 0;
    process.exit(exitCode);
  } catch (err) {
    console.error(`\n${c(RED, "❌ Dispatcher crashed:")}`, err);
    process.exit(1);
  }
}

runCLI();
