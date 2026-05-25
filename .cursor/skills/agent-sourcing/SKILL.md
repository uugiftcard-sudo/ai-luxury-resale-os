---
name: agent-sourcing
description: >
  Scores scraped product leads and decides buy/watch/reject for the CLOTH luxury
  second-hand marketplace. Triggered by: source leads, score leads, ROI analysis,
  sourcing queue, find products to buy, lead scoring. Uses `sourcing-agent.ts`
  to evaluate leads and output `SourcingQueueItem[]` decisions.
---

# Agent: Sourcing

## Purpose

Scores each scraped product lead from the database, calculates ROI and estimated
profit, flags risk, and categorises each lead as **buy**, **watch**, or **reject**.
All buy decisions are escalated to Discord `#ESCALATION` before execution.

This agent is the entry point of the daily agent cycle — it runs before listing,
content, and video agents.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `SourcingLead[]` | DB scraped leads table | Includes title, asking price, condition, brand, risk flags |
| Brand blacklist | `@luxury/sourcing-engine` | Blacklisted brands auto-reject |
| Market context | `market: "UK" \| "HK"` | Filters pricing data and carriers |

## Outputs

Each scored lead is emitted as a `SourcingQueueItem`:

```typescript
interface SourcingQueueItem {
  leadId: string;
  leadTitle: string;
  decision: "buy" | "watch" | "reject";
  estimatedProfit: { amount: number; currency: string };
  roiPercent: number;
  reasons: string[];
}
```

`runSourcingAgent` returns `{ buyQueue, watchQueue, rejected, result }`.

## Integration

- **Called by**: `dispatcher.ts` — runs first in the agent cycle
- **Feeds into**: `listing-agent.ts` — accepted (buy) leads enter the listing pipeline
- **Escalates to**: Discord `#ESCALATION` channel — every buy decision must be approved

## Risk Rules

| Rule | Action |
|------|--------|
| Brand on blacklist | Auto-reject, no score needed |
| Score below threshold | Auto-reject |
| ROI < 0 | Escalate with negative-ROI flag |
| `high_risk_brand` flag | Escalate to `#ESCALATION` |
| `unverified_source` flag | Escalate to `#ESCALATION` |
| `counterfeit_reported` flag | Escalate to `#ESCALATION` |
| `cross_border_dispute` flag | Escalate to `#ESCALATION` |

Any lead with a buy decision must wait for founder approval via Discord before
proceeding to listing.

## Example

A lead scraped for a Burberry trench coat:

```
Lead: "Burberry Vintage Trench — Size 38, Good Condition"
Asking Price: £180
Score: 82 / 100
Decision: buy
Estimated Profit: £85
ROI: 47%
Reasons: ["classic silhouette", "Burberry demand strong in UK", "ask below market"]
```

The agent pushes this to `buyQueue` and creates a Discord escalation message.
If the lead were a Zara item at £12 asking with £5 estimated profit, it would
be auto-rejected by the score threshold.

The `runSourcingAgent` function signature:

```typescript
// agent-tasks/sourcing-agent.ts
export async function runSourcingAgent(
  leads: SourcingLead[],
  market: string
): Promise<SourcingAgentOutput>
```

Usage in dispatcher:

```typescript
const sourcingOutput = await runSourcingAgent(scrapedLeads, "UK");
// sourcingOutput.buyQueue → listing-agent
// sourcingOutput.result.escalations → Discord #ESCALATION
```
