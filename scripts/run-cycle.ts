/**
 * run-cycle.ts — CLOTH Auto Work orchestrator
 *
 * Responsibilities:
 *  1. Scrape live leads from configured platforms (UK: Depop/Vestiaire, HK: Xiaohongshu)
 *  2. Deduplicate + score leads using the real sourcing engine
 *  3. Run the dispatcher with real store data
 *  4. Post a structured report to Discord webhook (if configured)
 *  5. Exit 0 on clean run, 1 if escalations or errors occurred
 *
 * Called by:  npm run agent:run
 * Also called by:  .github/workflows/auto-work.yml
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

// ── Args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let market: string | null = null;
let agents: string[] | null = null;
let dryRun = false;
let jsonOutput = false;
let outputPath: string | null = null;
let skipScrape = false;
let execute = false; // NEW: run the execution engine after agents

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--market": market = args[++i]; break;
    case "--agents": agents = args[++i].split(","); break;
    case "--dry-run": case "-n": dryRun = true; break;
    case "--json": jsonOutput = true; break;
    case "--output": case "-o": outputPath = args[++i]; jsonOutput = true; break;
    case "--no-scrape": skipScrape = true; break;
    case "--execute": case "-x": execute = true; break;
    case "--help": case "-h":
      console.log(`Usage: npm run agent:run -- [options]

Options:
  --market  <UK|HK>   Run for a single market (default: both)
  --agents  <list>     Comma-separated agent IDs (default: all)
  --dry-run            Simulate without writing to store or posting to Discord
  --json               Output machine-readable JSON to stdout
  --output, -o <path> Write JSON report to file (implies --json)
  --no-scrape          Skip scraping phase (use with caution)
  --execute, -x        Run the Execution Engine after agents (post to Discord, WhatsApp, etc.)
  --help, -h           Show this message

Agent IDs: sourcing, listing, content, video, fulfilment, community, risk, report
`);
      process.exit(0);
  }
}

// ── ANSI colours ──────────────────────────────────────────────────────────────
const R = "\x1b[0m";
const B = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const YEL = "\x1b[33m";
const BLU = "\x1b[34m";
const MAG = "\x1b[35m";
const CYAN = "\x1b[36m";
const c = (col: string, t: string) => `${col}${t}${R}`;
const sep = (char = "─", len = 60) => console.log(c(DIM, char.repeat(len)));
const bold = (t: string) => c(B, t);

// ── Env ───────────────────────────────────────────────────────────────────────
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
const DISCORD_REPORT_CHANNEL = process.env.DISCORD_REPORT_CHANNEL ?? DISCORD_WEBHOOK;

// ── Store path ────────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../packages/db/data");

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ScrapedLead {
  id: string;
  title: string;
  askingPrice: { amount: number; currency: string };
  estimatedResalePrice: { amount: number; currency: string };
  estimatedShipping: { amount: number; currency: string };
  estimatedPlatformFeePercent: number;
  market: "UK" | "HK";
  channel: string;
  brandStream: "luxury_resale" | "budget_fashion";
  riskFlags: string[];
  evidenceAvailable: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRAPER — runs live web scraping with error isolation
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeLeads(marketFilter: string | null): Promise<{
  scrapedCount: number;
  errors: string[];
}> {
  if (skipScrape) {
    console.log(c(DIM, "  [scrape] skipped (--no-scrape)"));
    return { scrapedCount: 0, errors: [] };
  }

  const errors: string[] = [];
  let totalScraped = 0;
  const scrapers: Array<{ name: string; fn: () => Promise<number> }> = [];

  if (!marketFilter || marketFilter === "UK") {
    scrapers.push(
      {
        name: "Depop (UK)",
        fn: async () => {
          try {
            const { searchDepop, scrapeProductDetail } = await import("./scrapers/depopScraper.js");
            const queries = ["gucci bag sold", "chanel bag sold", "prada bag sold", "louis vuitton bag sold"];
            const leads: ScrapedLead[] = [];
            for (const query of queries) {
              const urls = await searchDepop(query);
              for (const url of urls.slice(0, 5)) {
                try {
                  const p = await scrapeProductDetail(url);
                  if (!p || p.price <= 0) continue;
                  const estResale = p.price * 1.4;
                  leads.push({
                    id: `depop-${p.id}`,
                    title: p.title,
                    askingPrice: { amount: p.price, currency: "GBP" },
                    estimatedResalePrice: { amount: Math.round(estResale * 100) / 100, currency: "GBP" },
                    estimatedShipping: { amount: 8, currency: "GBP" },
                    estimatedPlatformFeePercent: 0.13,
                    market: "UK",
                    channel: "depop",
                    brandStream: "luxury_resale",
                    riskFlags: [],
                    evidenceAvailable: ["one photo"],
                  });
                } catch { /* skip individual product */ }
              }
            }
            if (leads.length > 0) appendLeadsToStore(leads);
            return leads.length;
          } catch (e) {
            const msg = `Depop: ${e instanceof Error ? e.message : String(e)}`;
            errors.push(msg);
            console.warn(c(YEL, `  ⚠  ${msg}`));
            return 0;
          }
        },
      },
      {
        name: "Vestiaire (UK)",
        fn: async () => {
          try {
            const { searchVestiaire, scrapeProductDetail } = await import("./scrapers/vestiaireScraper.js");
            const queries = ["gucci", "chanel", "prada", "louis vuitton"];
            const leads: ScrapedLead[] = [];
            for (const query of queries) {
              const urls = await searchVestiaire(query);
              for (const url of urls.slice(0, 5)) {
                try {
                  const p = await scrapeProductDetail(url);
                  if (!p || p.price <= 0) continue;
                  const estResale = p.price * 1.3;
                  leads.push({
                    id: `vestiaire-${p.id}`,
                    title: p.title,
                    askingPrice: { amount: p.price, currency: "GBP" },
                    estimatedResalePrice: { amount: Math.round(estResale * 100) / 100, currency: "GBP" },
                    estimatedShipping: { amount: 12, currency: "GBP" },
                    estimatedPlatformFeePercent: 0.09,
                    market: "UK",
                    channel: "vestiaire",
                    brandStream: "luxury_resale",
                    riskFlags: [],
                    evidenceAvailable: [],
                  });
                } catch { /* skip */ }
              }
            }
            if (leads.length > 0) appendLeadsToStore(leads);
            return leads.length;
          } catch (e) {
            const msg = `Vestiaire: ${e instanceof Error ? e.message : String(e)}`;
            errors.push(msg);
            console.warn(c(YEL, `  ⚠  ${msg}`));
            return 0;
          }
        },
      }
    );
  }

  if (!marketFilter || marketFilter === "HK") {
    scrapers.push({
      name: "Xiaohongshu (HK)",
      fn: async () => {
        try {
          const { searchXHSNotes } = await import("./scrapers/xiaohongshuScraper.js");
          const queries = ["Gucci 二手 出售", "Chanel 二手 出售", "Prada 二手 出售", "LV 二手 出售"];
          const leads: ScrapedLead[] = [];
          for (const query of queries) {
            try {
              const notes = await searchXHSNotes(query);
              for (const note of notes.slice(0, 8)) {
                const text = note.title + " " + note.desc;
                const priceMatch = text.match(/¥\s*(\d+)/) || text.match(/(\d+)\s*元/);
                if (!priceMatch) continue;
                const askingPrice = parseInt(priceMatch[1], 10);
                if (askingPrice < 100) continue;
                const estResale = askingPrice * 1.3;
                leads.push({
                  id: `xhs-${note.noteId}`,
                  title: note.title,
                  askingPrice: { amount: askingPrice, currency: "HKD" },
                  estimatedResalePrice: { amount: Math.round(estResale * 100) / 100, currency: "HKD" },
                  estimatedShipping: { amount: 35, currency: "HKD" },
                  estimatedPlatformFeePercent: 0.05,
                  market: "HK",
                  channel: "xiaohongshu",
                  brandStream: "luxury_resale",
                  riskFlags: [],
                  evidenceAvailable: note.images.length > 0 ? ["photos"] : [],
                });
              }
            } catch { /* API may be blocked */ }
          }
          if (leads.length > 0) appendLeadsToStore(leads);
          return leads.length;
        } catch (e) {
          const msg = `Xiaohongshu: ${e instanceof Error ? e.message : String(e)}`;
          errors.push(msg);
          console.warn(c(YEL, `  ⚠  ${msg}`));
          return 0;
        }
      },
    });
  }

  console.log(c(BLU, `\n  [scrape] Running ${scrapers.length} scraper(s)…`));
  for (const { name, fn } of scrapers) {
    const count = await fn();
    totalScraped += count;
    console.log(c(GRN, `  ✅ ${name}: +${count} leads`));
  }

  console.log(
    c(DIM, `  [scrape] Total new leads scraped: ${totalScraped}`)
  );
  return { scrapedCount: totalScraped, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE — append scraped leads to the real db store
// ─────────────────────────────────────────────────────────────────────────────
function appendLeadsToStore(newLeads: ScrapedLead[]): void {
  ensureDataDir();
  const file = path.join(DATA_DIR, "sourcing-leads.json");
  let existing: ScrapedLead[] = [];
  if (fs.existsSync(file)) {
    try { existing = JSON.parse(fs.readFileSync(file, "utf-8")); } catch { existing = []; }
  }

  // Deduplicate by id
  const existingIds = new Set(existing.map((l) => l.id));
  const unique = newLeads.filter((l) => !existingIds.has(l.id));
  if (unique.length === 0) return;

  fs.writeFileSync(file, JSON.stringify([...existing, ...unique], null, 2), "utf-8");
  console.log(c(GRN, `  [store] Appended ${unique.length} leads → ${file}`));
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHER — run agent pipeline using real store data
// ─────────────────────────────────────────────────────────────────────────────
async function runDispatcherWithStore(market: string | null) {
  const { runDispatcher } = await import("../agent-tasks/dispatcher.js");

  // Override markets for this run
  const markets = market ? [market] : ["UK", "HK"];
  const result = await runDispatcher({
    markets: markets as ("UK" | "HK")[],
    agents: (agents as any) ?? undefined,
    dryRun,
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCORD REPORTER
// ─────────────────────────────────────────────────────────────────────────────
interface AgentResult { agentId: string; status: string; market?: string; escalations?: string[]; errors?: string[]; summary?: string; }
interface CycleResult { runId: string; markets: string[]; agents: AgentResult[]; summary: { totalTasksGenerated: number; totalEscalations: number; totalErrors: number; marketsCompleted: string[]; marketsFailed: string[] }; scrapedCount: number; scrapeErrors: string[]; startedAt: string; }

async function postToDiscord(result: CycleResult): Promise<void> {
  if (!DISCORD_WEBHOOK) return;

  const { runId, markets, agents, summary, scrapedCount, startedAt } = result;
  const durationMs = Date.now() - new Date(startedAt).getTime();
  const durationSec = Math.round(durationMs / 1000);

  const statusEmoji = summary.totalErrors > 0 || summary.marketsFailed.length > 0 ? "🔴"
    : summary.totalEscalations > 0 ? "🟡" : "🟢";

  const escalations = agents.flatMap((a) =>
    (a.escalations ?? []).map((e) => ({ agent: a.agentId, market: a.market ?? "", text: e }))
  );

  const embedFields: Array<{ name: string; value: string; inline?: boolean }> = [];

  for (const m of markets) {
    const marketAgents = agents.filter((a) => a.market === m);
    const items = marketAgents.map((a) => {
      const icon = a.status === "done" ? "✅" : a.status === "error" ? "❌" : "⏭";
      return `${icon} **${a.agentId}** — ${a.summary ?? a.status}`;
    }).join("\n");
    embedFields.push({ name: `${m} Market`, value: items || "_no agents_", inline: true });
  }

  if (escalations.length > 0) {
    embedFields.push({
      name: `⚠️  Escalations (${escalations.length})`,
      value: escalations.slice(0, 5).map((e) => `• **${e.agent}**${e.market ? `[${e.market}]` : ""}: ${e.text}`).join("\n"),
      inline: false,
    });
  }

  const payload = {
    username: "CLOTH Auto Work",
    avatar_url: "https://i.imgur.com/AFb4J0S.png",
    embeds: [
      {
        title: `${statusEmoji} Auto Work Cycle ${runId}`,
        color: summary.totalErrors > 0 ? 0xff4444 : summary.totalEscalations > 0 ? 0xffaa00 : 0x44bb44,
        fields: [
          { name: "Markets", value: markets.join(", "), inline: true },
          { name: "Tasks Generated", value: String(summary.totalTasksGenerated), inline: true },
          { name: "Leads Scraped", value: String(scrapedCount), inline: true },
          { name: "Escalations", value: String(summary.totalEscalations), inline: true },
          { name: "Errors", value: String(summary.totalErrors), inline: true },
          { name: "Duration", value: `${durationSec}s`, inline: true },
          ...embedFields,
        ],
        footer: { text: "CLOTH Auto Work Agent" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(c(GRN, `  [discord] Posted report to Discord webhook`));
  } catch (e) {
    console.warn(c(YEL, `  ⚠  Discord webhook failed: ${e instanceof Error ? e.message : String(e)}`));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const startedAt = new Date().toISOString();
  const runId = `cycle-${Date.now()}`;

  console.log(`\n${bold("🏭  CLOTH Auto Work Agent")}  ${c(DIM, startedAt)}`);
  console.log(`   ${c(BLU, "Market(s):")}  ${market ?? c(DIM, "UK + HK (all)")}`);
  console.log(`   ${c(BLU, "Agents:")}   ${agents?.join(", ") ?? c(DIM, "all 7 agents")}`);
  console.log(`   ${c(BLU, "Mode:")}     ${dryRun ? c(YEL, "DRY RUN") : c(GRN, "LIVE")}`);
  sep();

  let dispatcherResult: any = null;
  let scrapeResult = { scrapedCount: 0, errors: [] as string[] };

  try {
    // Phase 1: Scrape (if not skipped)
    const { scrapedCount, errors } = await scrapeLeads(market);
    scrapeResult = { scrapedCount, errors };
    sep();

    // Phase 2: Dispatcher
    console.log(c(BLU, `\n  [agents] Running dispatcher…`));
    dispatcherResult = await runDispatcherWithStore(market);
    sep();
  } catch (err) {
    console.error(`\n${c(RED, "❌ Cycle crashed:")}`, err);
    if (jsonOutput) {
      const errResult: CycleResult = {
        runId, markets: market ? [market] : ["UK", "HK"],
        agents: [], summary: { totalTasksGenerated: 0, totalEscalations: 0, totalErrors: 1, marketsCompleted: [], marketsFailed: [] },
        scrapedCount: 0, scrapeErrors: [], startedAt,
      };
      outputJson(errResult);
    }
    process.exit(1);
  }

  // Phase 3: Assemble result
  const result: CycleResult = {
    runId,
    markets: dispatcherResult?.markets ?? (market ? [market] : ["UK", "HK"]),
    agents: dispatcherResult?.agents ?? [],
    summary: dispatcherResult?.summary ?? { totalTasksGenerated: 0, totalEscalations: 0, totalErrors: 0, marketsCompleted: [], marketsFailed: [] },
    scrapedCount: scrapeResult.scrapedCount,
    scrapeErrors: scrapeResult.errors,
    startedAt,
  };

  // Phase 3: Execution Engine (only with --execute flag)
  let execResult: any = null;
  if (execute) {
    console.log(c(BLU, `\n  [execute] Running execution engine…`));
    try {
      const { ExecutionEngine } = await import("../agent-tasks/engine.js");

      // Build the Discord channels map from env vars
      const discordChannels: Record<string, string> = {
        UK: process.env["DISCORD_VIP_CHANNEL_UK"] ?? "",
        HK: process.env["DISCORD_VIP_CHANNEL_HK"] ?? "",
      };

      // Collect outputs from dispatcher results
      const { runDispatcher } = await import("../agent-tasks/dispatcher.js");
      const fullResult = await runDispatcher({
        markets: (market ? [market] : ["UK", "HK"]) as ("UK" | "HK")[],
        agents: (agents as any) ?? undefined,
        dryRun,
        includeReport: true,
      });

      const execOutputs = {
        listingTasks: (fullResult as any).listingTasks ?? [],
        contentTasks: (fullResult as any).contentTasks ?? [],
        captionsByPlatform: (fullResult as any).captionsByPlatform ?? {},
        sourcingItems: (fullResult as any).sourcingItems ?? [],
        riskAlerts: (fullResult as any).riskAlerts ?? [],
      };

      execResult = await ExecutionEngine.runFromAgentOutputs(
        execOutputs,
        {
          shopifyPayloads: new Map(),
          ebayPayloads: new Map(),
          discordChannels,
        },
        { dryRun, bypassApproval: dryRun }
      );
      sep();
    } catch (err) {
      console.error(`  ${c(RED, "⚠  Execution engine error:")}`, err);
    }
  }

  // Phase 4: Post to Discord (non-blocking, fire-and-forget)
  postToDiscord(result).catch(() => {});

  // Phase 5: Console output
  printResults(result, execResult);

  // Phase 6: JSON output
  if (jsonOutput) outputJson(result);

  // Phase 7: Exit code
  const hasEscalations = result.summary.totalEscalations > 0;
  const hasErrors = result.summary.totalErrors > 0 || result.summary.marketsFailed.length > 0;
  const execHadFailures = execResult && (execResult.failed > 0 || execResult.pendingApproval?.length > 0);

  if (hasErrors) process.exit(1);
  if (hasEscalations) process.exit(1);
  if (execHadFailures && !dryRun) process.exit(1); // execution failed non-dry-run
  process.exit(0);
}

function printResults(result: CycleResult, execResult?: any): void {
  const { agents, summary, scrapedCount } = result;

  console.log(`\n${bold("📊 Agent Results")}`);
  sep();
  for (const agent of agents) {
    const icon = agent.status === "done" ? c(GRN, "✅") : agent.status === "error" ? c(RED, "❌") : c(YEL, "⏭");
    const market = agent.market ? ` ${c(BLU, `[${agent.market}]`)}` : "";
    console.log(`  ${icon}  ${c(CYAN, agent.agentId)}${market}  ${c(DIM, "—")}  ${agent.summary ?? agent.status}`);
    for (const esc of agent.escalations ?? []) {
      console.log(`       ${c(YEL, "⚠  " + esc)}`);
    }
    for (const err of agent.errors ?? []) {
      console.log(`       ${c(RED, "❌  " + err)}`);
    }
  }

  sep();
  console.log(`\n${bold("📈 Cycle Summary")}`);
  sep();
  console.log(`  ${c(BLU, "⏱   Duration:")}   ${c(B, timeAgo(result.startedAt))}`);
  console.log(`  ${c(BLU, "📦 Tasks:")}         ${c(B, String(summary.totalTasksGenerated))}`);
  console.log(`  ${c(BLU, "🕷  Scraped:")}       ${scrapedCount > 0 ? c(GRN, String(scrapedCount) + " new leads") : c(DIM, "0 (no new leads)")}`);
  console.log(
    `  ${c(BLU, "🚨 Escalations:")}    ${
      summary.totalEscalations > 0 ? c(YEL, String(summary.totalEscalations)) : c(GRN, "0")
    }`
  );
  console.log(
    `  ${c(BLU, "❌ Errors:")}          ${
      summary.totalErrors > 0 ? c(RED, String(summary.totalErrors)) : c(GRN, "0")
    }`
  );
  if (result.scrapeErrors.length > 0) {
    console.log(c(YEL, `  ⚠  Scrape errors: ${result.scrapeErrors.join("; ")}`));
  }
  console.log(
    `  ${c(BLU, "✅ Markets OK:")}     ${
      summary.marketsCompleted.length > 0 ? summary.marketsCompleted.join(", ") : c(RED, "none")
    }`
  );
  if (summary.marketsFailed.length > 0) {
    console.log(c(RED, `  ❌ Markets failed:  ${summary.marketsFailed.join(", ")}`));
  }

  // Execution engine results
  if (execResult) {
    sep();
    console.log(`\n${bold("⚡ Execution Results")}`);
    sep();
    const e = execResult;
    console.log(`  ${c(BLU, "Executed:")}     ${c(B, String(e.executed))}`);
    console.log(`  ${c(BLU, "Succeeded:")}    ${e.succeeded > 0 ? c(GRN, String(e.succeeded)) : "0"}`);
    console.log(`  ${c(BLU, "Failed:")}        ${e.failed > 0 ? c(RED, String(e.failed)) : "0"}`);
    console.log(`  ${c(BLU, "Pending:")}      ${e.pendingApproval?.length > 0 ? c(YEL, String(e.pendingApproval.length)) : "0"}`);
    if (e.pendingApproval?.length > 0) {
      for (const t of e.pendingApproval) {
        console.log(`       ${c(YEL, "⏳ " + t.summary.slice(0, 80))}`);
      }
    }
  }

  console.log("");
}

function outputJson(result: CycleResult): void {
  const jsonStr = JSON.stringify(result, null, 2);
  if (outputPath) {
    fs.writeFileSync(outputPath, jsonStr);
    console.log(c(GRN, `  📄  Report written → ${outputPath}`));
  } else {
    console.log(jsonStr);
  }
}

function timeAgo(iso: string): string {
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 1000) return `${diffSec}s`;
  return `${Math.round(diffSec / 60)}m ${diffSec % 60}s`;
}

main().catch((err) => {
  console.error(`\n${c(RED, "❌ Fatal:")}`, err);
  process.exit(1);
});
