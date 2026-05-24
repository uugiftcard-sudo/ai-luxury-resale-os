---
name: agent-community
description: >
  Plans KOC (Key Opinion Consumer) briefs, VIP engagement tasks, and community
  growth activities across Depop, Vestiaire Collective, and XiaohongShu. Triggered
  by: community, KOC, VIP, engagement, growth, influencer brief, VIP drop,
  community growth. Uses `community-agent.ts` to output engagement tasks and KOC briefs.
---

# Agent: Community

## Purpose

Plans daily community engagement and influencer outreach. Generates VIP
identification signals, KOC brief templates, community DM tasks, and VIP drop
campaign copies. This agent ensures consistent community growth across all
platforms.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| Market context | `market: "UK" \| "HK"` | Platform mix differs |
| Customer data | `@luxury/community-growth` | Purchase history, spend |

## Outputs

`runCommunityAgent` returns three arrays:

```typescript
interface CommunityAgentOutput {
  result: AgentResult;
  engagementTasks: string[];   // General community tasks
  kocBriefs: string[];         // Influencer brief strings
  vipDropCopies: string[];     // VIP preview broadcast copies
}
```

## VIP Identification

A customer is flagged as VIP when:

| Criterion | Threshold |
|-----------|-----------|
| Purchase count | > 3 orders |
| Total spend | > $1,000 |

VIP customers receive:
- Early access to new drops (VIP preview broadcast)
- Personalised DM outreach
- Priority in community posts

## Platform Strategy

| Platform | Market | Focus |
|----------|--------|-------|
| Depop | UK | Community comments, follow-backs, styling tips |
| Vestiaire Collective | UK, HK | Ambassador programme, review requests |
| XiaohongShu | HK | KOC partnerships, authentic review content |

## KOC Brief Structure

Each brief includes:
- Product to feature (SKU + title)
- Talking points (3–5 bullet points)
- Required format (short video, flat-lay, try-on)
- Compliance rule
- Platform-specific hashtag set

## Integration

- **Feeds into**: `discord-executor` — VIP alerts and community updates posted to Discord
- **Feeds into**: `whatsapp-executor` — VIP preview broadcasts via WhatsApp

## Compliance

All community content must:
- Reference the proof document for authenticity claims
- Avoid guaranteed-authentic language without evidence
- Comply with platform community guidelines

## Example

```typescript
// agent-tasks/community-agent.ts
export async function runCommunityAgent(
  market: Market
): Promise<CommunityAgentOutput>

// Output:
{
  engagementTasks: [
    "[Depop Community] Reply to 5 new comments with styling suggestions",
    "[Vestiaire Ambassador] Send review-request DM to recent buyer"
  ],
  kocBriefs: [
    "[KOC] XiaohongShu: Feature Burberry Trench — talk about vintage sourcing, " +
    "condition grade, how to spot authentic Burberry check lining — short video format — " +
    "compliance: always mention proof reference — #二手Burberry #英國代購"
  ],
  vipDropCopies: [
    "[VIP] VIP Drop: Hermès Kelly 28 dropping tonight 8PM HK — " +
    "you get 1-hour early access. First reply gets priority."
  ],
  result: { agentId: "community", status: "done", tasksGenerated: 5, ... }
}
```

The `dailyCommunityPlan(market)` function from `@luxury/community-growth`
generates the base task list, which this agent then categorises into the three
output arrays based on `task.channel`.
