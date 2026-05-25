---
name: agent-listing
description: >
  Generates cross-platform Shopify (UK) and eBay (HK) listings from approved
  sourcing leads. Triggered by: create listings, list products, cross-platform
  listing, shopify listing, ebay listing, product descriptions. Uses
  `listing-agent.ts` to output `ListingTask[]` with full compliance checks.
---

# Agent: Listing

## Purpose

Takes approved sourcing leads (buy queue) and generates complete, platform-specific
listings for Shopify (UK market) and eBay (HK market). Every listing includes
condition grading, authentication proof reference, HK import notes, and compliance
keyword screening before publication.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `Product[]` | Approved buy queue from sourcing-agent | Only `draft` or `proof_ready` status |
| `Map<string, ProofPack>` | Proof documents keyed by SKU | Source records, detail photos, flaw photos |
| Market context | `market: "UK" \| "HK"` | UK → Shopify, HK → eBay |

## Outputs

Each listing is emitted as a `ListingTask`:

```typescript
interface ListingTask {
  product: { sku: string; title: string; status: string; market: string };
  platforms: string[];            // e.g. ["shopify_uk", "ebay_hk"]
  priority: "high" | "medium" | "low";
  reason: string;
}
```

`runListingAgent` returns `{ tasks, complianceWarnings, result }`.

Listing priority rules:

| Condition | Priority |
|-----------|----------|
| No proof pack | high |
| Proof missing detail photos or source record | high |
| `brandStream === "luxury_resale"` | high |
| Status is `proof_ready` | medium |
| Status is `draft` | low |

## Compliance Requirements

Every published listing **must** include:

- Condition grade (e.g. Excellent / Good / Fair)
- Authentication proof reference (receipt, serial, code)
- HK import compliance note where applicable
- No restricted keywords: `replica`, `1:1`, `super`, `AAA`, `mirror`, `unbranded`

High-price items (>$500) must reference an attached proof document.

## Integration

- **Receives from**: `sourcing-agent` (buy queue)
- **Feeds into**: `content-agent` (for captions and social copy)
- **Blocked by**: `risk-agent` — any `high` or `critical` alert on a SKU blocks that listing

## Risk Rules

| Rule | Severity | Action |
|------|----------|--------|
| Luxury item without proof | high | Withhold listing |
| Proof incomplete (no detail photos/source record) | high | Withhold listing |
| Restricted keyword detected | critical | Escalate immediately |
| Luxury without serial/receipt | high | Flag, require proof pack completion |

## Example

```typescript
// agent-tasks/listing-agent.ts
export async function runListingAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<ListingAgentOutput>

// Output shape:
{
  tasks: [
    {
      product: { sku: "BUR-TR-001", title: "Burberry Trench", status: "proof_ready", market: "UK" },
      platforms: ["shopify_uk"],
      priority: "high",
      reason: "Proof ready, listings generated"
    }
  ],
  complianceWarnings: [],
  result: { agentId: "listing", status: "done", ... }
}
```

A compliance warning is issued for each product missing proof:

```
[BUR-TR-001] No proof pack — listing withheld until proof complete
[BUR-TR-001/ebay_hk] Potential compliance issue: replica, 1:1 — escalate
```
