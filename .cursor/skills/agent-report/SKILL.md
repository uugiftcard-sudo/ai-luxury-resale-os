---
name: agent-report
description: >
  Assembles the final daily report aggregating all agent results, metrics, and
  recommended next actions in Discord-friendly markdown. Triggered by: daily
  report, report, summary, end of day report, market summary, daily digest.
  Uses `report-agent.ts` to output a structured `DailyReport`.
---

# Agent: Report

## Purpose

Aggregates the outputs of all 7 preceding agents into a structured daily report.
The report is the final output of the full agent cycle and is posted to Discord
via `discord-executor`. It provides an executive summary, per-market breakdown,
key metrics, all escalations, and prioritised next actions.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `AgentResult[]` | All 7 agents in the cycle | `status`, `durationMs`, `escalations`, etc. |
| `SourcingQueueItem[]` | From sourcing-agent | Buy/watch/reject decisions |
| `ListingTask[]` | From listing-agent | Listing priorities and reasons |
| `ContentTask[]` | From content-agent | Content formats per product |
| `RiskAlert[]` | From risk-agent | All alerts by severity |
| `runId` | Dispatcher | Identifies this cycle run |
| `Market[]` | Dispatcher | Markets covered (UK, HK) |

## Outputs

```typescript
interface DailyReport {
  date: string;              // ISO date, e.g. "2025-05-23"
  runId: string;
  markets: string[];
  agents: AgentResult[];
  topSourcingDecisions: SourcingQueueItem[];   // Top 5 by score
  topListingTasks: ListingTask[];               // Top 10 by priority
  topContentTasks: ContentTask[];                // Top 10 by priority
  riskAlerts: RiskAlert[];                      // Top 10 by severity
  escalationCount: number;
  totalTasks: number;
  nextActions: string[];
}
```

`runReportAgent` returns `{ report, result }`.

## Report Sections

1. **Executive Summary** — one-paragraph overview of the day's cycle
2. **By-Market Breakdown** — UK and HK metrics side by side
3. **Key Metrics** — leads processed, buy decisions, listings, content items,
   risk alerts, fulfillment items
4. **Escalations** — all high/critical items requiring founder action
5. **Next Actions** — prioritised task list for the next day

## Next Actions Logic

The report agent derives next actions automatically from agent results:

```
🚨 Review {N} critical risk alerts before any other action
📋 Complete proof packs for: {sku1, sku2, ...}
🛒 Review {N} buy decisions — check ROI and proof before purchasing
📸 List now: {sku1, sku2, ...}  (high-priority listing tasks)
✅ No urgent actions — system clean
```

## Integration

- **Receives from**: All 7 agents in the cycle
- **Feeds into**: `discord-executor` — report posted as Discord embeds
- **Final output**: Marks the end of the daily agent cycle

## Discord Format

The report is formatted as Discord-friendly embeds:

```
📊 CLOTH Daily Report — 2025-05-23
Run ID: run_abc123
Markets: UK, HK

━━━ METRICS ━━━
Leads processed: 47
Buy decisions: 3
Watch decisions: 8
Listings generated: 11 (3 high priority)
Content items: 22
Risk alerts: 12 (2 critical, 3 high, 7 warning)
Fulfillment tasks: 4

━━━ ESCALATIONS ━━━
🚨 [critical] BUR-TR-001: Forbidden claim detected
🔴 [high] HER-B-KELLY: Luxury without proof pack

━━━ NEXT ACTIONS ━━━
🛒 Review 3 buy decisions — check ROI and proof before purchasing
📋 Complete proof packs for: HER-B-KELLY, BUR-TR-001
📸 List now: BUR-TR-001, LOU-V-NEVERFULL
```

## Example

```typescript
// agent-tasks/report-agent.ts
export async function runReportAgent(
  runId: string,
  markets: Market[],
  agentResults: AgentResult[],
  sourcingItems: SourcingQueueItem[],
  listingTasks: ListingTask[],
  contentTasks: ContentTask[],
  riskAlerts: RiskAlert[]
): Promise<ReportAgentOutput>

// result.summary:
"3 escalations, 38 total tasks, 4 next actions"
```

The `runReportAgent` function is the last function called by `dispatcher.ts`
after all other agents complete. Its output is the canonical record of the day's
operations.
