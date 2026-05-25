---
name: agent-risk
description: >
  Scans all agent outputs for counterfeit indicators, restricted items, missing
  proof, and compliance violations. Triggered by: risk, counterfeit, compliance,
  restricted items, legal check, authenticity, fake check. Uses `risk-agent.ts`
  to gate all outputs with `RiskAlert[]` and block listings when high/critical
  issues are found.
---

# Agent: Risk

## Purpose

Gates every agent's output through a compliance and authenticity check before
listings can be published. Runs after every agent in the cycle and emits
`RiskAlert[]` with severity levels. Any item flagged `high` or `critical` is
automatically blocked from the listing pipeline until resolved and re-reviewed.

## Risk Checks Performed

| Rule | Severity | Condition |
|------|----------|-----------|
| Luxury without proof pack | high | `brandStream === "luxury_resale"` + no proof |
| Forbidden claim patterns | critical | Any from `findForbiddenClaims()` match |
| Restricted words | critical | `replica`, `1:1`, `aaa`, `mirror quality`, etc. |
| Luxury missing serial/receipt | high | Luxury brand + no `serialOrCode` + no `receiptRef` |
| Incomplete proof pack | warning | Missing source record, photos, or packing video |
| Product risk flags present | warning | Any `riskFlags` array non-empty |
| HK missing payment proof | high | HK market + no `paymentProofRef` |
| Cross-border import risk | high | `riskFlags` includes `cross_border_risk` or `eu_duty` |
| HK F2F no confirmation ref | warning | HK market + F2F option + no `faceToFaceConfirmationRef` |

## Outputs

```typescript
interface RiskAlert {
  severity: "info" | "warning" | "high" | "critical";
  agentId: AgentId;
  rule: string;
  message: string;
  productSku?: string;
  leadId?: string;
  actionRequired?: string;
}
```

`runRiskAgent` returns `{ alerts, clearedProducts, result }`.

Products are only added to `clearedProducts` when no `high` or `critical`
alerts are present.

## Severity Actions

| Severity | Action |
|----------|--------|
| info | Minor disclosure note added to listing |
| warning | Flag for review, listing can proceed with disclosure |
| high | **Block listing** — must resolve before publish |
| critical | **Block + escalate** — founder approval required |

## Block Rules

Any `SourcingQueueItem`, `ListingTask`, or product with `high`/`critical` risk:
- Is excluded from the next agent's input
- Is flagged in the daily report
- Cannot proceed to Shopify or eBay until resolved

## Escalation

`critical` alerts are escalated to Discord `#ESCALATION` with the alert message,
product SKU, and required action. Founder approval is required before the item
can be listed.

## Luxury Brands Under Strict Proof

```typescript
const LUXURY_BRANDS = [
  "gucci", "louis vuitton", "chanel", "hermes", "dior", "prada",
  "balenciaga", "celine", "bottega veneta", "givenchy", "valentino",
  "cartier", "rolex", "omega", "tag heuer", "tudor", "burberry",
  "alexander mcqueen", "off-white", "supreme", "stone island",
];
```

## Example

```typescript
// agent-tasks/risk-agent.ts
export async function runRiskAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<RiskAgentOutput>

// Alert emitted:
{
  severity: "high",
  agentId: "risk",
  rule: "luxury_requires_proof",
  message: "[BUR-TR-001] Luxury item listed without a proof pack",
  productSku: "BUR-TR-001",
  actionRequired: "Do not publish until a complete proof pack is uploaded"
}

// Daily summary:
summary: "12 alerts (2 critical · 3 high · 7 warning) — 8 products cleared"
escalations: [
  "[HIGH] BUR-TR-001: Luxury item listed without a proof pack"
]
```

The risk agent runs **after every agent** in the cycle. If `risk-agent` finds
critical alerts, `listing-agent` is blocked and the dispatcher halts the pipeline
for that SKU.
