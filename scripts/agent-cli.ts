/**
 * Local development CLI for the auto-work agent system.
 * Run with:  npx tsx scripts/agent-cli.ts [--market UK|HK] [--agents sourcing,listing,...] [--dry-run]
 *
 * Also invoked by .github/workflows/auto-work.yml via:  npm run agent:run
 */
import { runDispatcher } from "../agent-tasks/dispatcher.js";
import type { Market } from "@luxury/db";
import type { AgentId } from "../agent-tasks/types.js";

const args = process.argv.slice(2);

let markets: Market[] | undefined;
let agents: string[] | undefined;
let dryRun = false;
let json = false;

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
      json = true;
      break;
    case "--help":
    case "-h":
      console.log(`Usage: npx tsx scripts/agent-cli.ts [options]
Options:
  --market  <UK|HK>   Run for a single market
  --markets <UK,HK>   Run for multiple markets (default: both)
  --agents  <list>    Comma-separated agent IDs (default: all)
  --dry-run           Simulate without side effects
  --json              Output machine-readable JSON report
  --help, -h          Show this message
Agent IDs: sourcing, listing, content, video, fulfilment, community, risk, report
`);
      process.exit(0);
  }
}

async function main() {
  console.log(`\n🏭 Auto Work Agent CLI — ${new Date().toISOString()}`);
  console.log(`   Markets: ${markets?.join(", ") ?? "UK + HK (all)"}`);
  console.log(`   Agents:  ${agents?.join(", ") ?? "all"}`);
  console.log(`   Mode:    ${dryRun ? "DRY RUN (no side effects)" : "LIVE"}\n`);

  try {
    const result = await runDispatcher({ markets, agents: agents as AgentId[] | undefined, dryRun });

    if (json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log("\n📊 Daily Agent Report");
      console.log("─".repeat(50));
      for (const agent of result.agents) {
        const icon =
          agent.status === "done" ? "✅" :
          agent.status === "error" ? "❌" :
          agent.status === "skipped" ? "⏭️" : "🔄";
        const market = agent.market ? ` [${agent.market}]` : "";
        console.log(`  ${icon} ${agent.agentId}${market} — ${agent.summary ?? agent.status}`);
        if (agent.escalations?.length) {
          for (const esc of agent.escalations) {
            console.log(`     ⚠️  ${esc}`);
          }
        }
        if (agent.errors?.length) {
          for (const err of agent.errors) {
            console.log(`     ❌ ${err}`);
          }
        }
      }

      console.log("─".repeat(50));
      console.log(`  ⏱   Total time:  ${result.totalDurationMs}ms`);
      console.log(`  📦 Tasks:       ${result.summary.totalTasksGenerated}`);
      console.log(`  🚨 Escalations: ${result.summary.totalEscalations}`);
      console.log(`  ❌ Errors:      ${result.summary.totalErrors}`);
      console.log(`  ✅ Markets:     ${result.summary.marketsCompleted.join(", ")}`);
      if (result.summary.marketsFailed.length > 0) {
        console.log(`  ❌ Failed:      ${result.summary.marketsFailed.join(", ")}`);
      }
      console.log("");
    }

    process.exit(result.summary.marketsFailed.length > 0 ? 1 : 0);
  } catch (err) {
    console.error("\n❌ Dispatcher crashed:", err);
    process.exit(1);
  }
}

main();
