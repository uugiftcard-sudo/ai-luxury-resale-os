---
name: agent-fulfillment
description: >
  Builds packing and shipping checklists for paid orders, covering carriers,
  packaging requirements, photo evidence, and tracking. Triggered by: fulfillment,
  shipping, packing list, order dispatch, delivery checklist, dispatch orders.
  Uses `fulfillment-agent.ts` to output `FulfilmentPlanItem[]`.
---

# Agent: Fulfillment

## Purpose

Generates packing and shipping checklists for every paid order. Each
`FulfilmentPlanItem` includes the full item checklist, required photo evidence,
shipping carrier selection (market-specific), and a customer notification message.
Orders with missing evidence are flagged immediately to prevent dispatch delays.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `Product[]` | Reserved/paid products from order system | Only `reserved` status |
| `Map<string, ProofPack>` | Proof docs keyed by SKU | Required for evidence |
| Market context | `market: "UK" \| "HK"` | Different carriers per market |

## Outputs

Each paid order produces a `FulfilmentPlanItem`:

```typescript
interface FulfilmentPlanItem {
  sku: string;
  productTitle: string;
  market: string;
  priority: "high" | "medium" | "low";
  checklist: string[];
  evidenceComplete: boolean;
  riskWarnings: string[];
  customerMessage: string;
}
```

`runFulfilmentAgent` returns `{ fulfilmentPlans, missingEvidence, result }`.

## Carrier Selection

| Market | Carrier | Notes |
|--------|---------|-------|
| UK | Royal Mail | Standard and tracked options |
| HK | SF Express | Standard for HK domestic |
| Cross-border | DHL / FedEx | If duty-paid option selected |

## Evidence Requirements

All fulfilled orders must have:

- Source record (proof of purchase / acquisition)
- Detail photos (at least 3 angles)
- Packing video (showing item placed in packaging)
- Tracking reference (before shipping)

HK orders additionally require:
- Payment proof (FPS / PayMe screenshot)
- Face-to-face confirmation ref (if F2F collection)

## Priority Rules

| Condition | Priority |
|-----------|----------|
| Evidence incomplete | high |
| Evidence complete | medium |

## Integration

- **Receives from**: Order payment confirmation event
- **Feeds into**: `discord-executor` — dispatch notifications posted to Discord
- **Blocks**: Cannot dispatch until `evidenceComplete === true`

## Example

```typescript
// agent-tasks/fulfillment-agent.ts
export async function runFulfilmentAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<FulfilmentAgentOutput>

// Output:
{
  fulfilmentPlans: [{
    sku: "BUR-TR-001",
    productTitle: "Burberry Vintage Trench",
    market: "UK",
    priority: "medium",
    checklist: [
      "Verify item condition against listing photos",
      "Photograph item in natural light (front, back, label, flaws)",
      "Wrap in acid-free tissue",
      "Pack in branded CLOTH box",
      "Apply shipping label with tracking",
      "Photograph packed box before handover"
    ],
    evidenceComplete: true,
    riskWarnings: [],
    customerMessage: "Your order has been dispatched! Track here: [link]"
  }],
  missingEvidence: [],
  result: { agentId: "fulfillment", status: "done", ... }
}
```

Missing evidence triggers a warning like:

```
[BUR-TR-001] Missing: packing video, tracking reference
```

This prevents the item from being shipped until all evidence is captured.
