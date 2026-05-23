---
name: agent-video
description: >
  Plans video production — shot lists, format variants, and posting schedules
  for TikTok, Instagram Reels, XiaohongShu, and YouTube Shorts. Triggered by:
  video production, shoot plan, video schedule, content calendar, video shots,
  TikTok, Reels. Uses `video-agent.ts` to output `VideoScheduleItem[]`.
---

# Agent: Video

## Purpose

Converts approved content briefs into a production-ready video schedule. For each
product, it defines shot descriptions, format dimensions, platform priority order,
and estimated production duration. This is the bridge between content strategy and
physical video production.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `Product[]` | Products from content-agent output | Excludes `sold` and `returned` |
| `Map<string, ProofPack>` | Proof docs keyed by SKU | Affects priority and shot availability |
| Market context | `market: "UK" \| "HK"` | Platform priority varies by market |

## Outputs

Each product produces a `VideoScheduleItem`:

```typescript
interface VideoScheduleItem {
  sku: string;
  productTitle: string;
  priority: "high" | "medium" | "low";
  formats: string[];   // e.g. ["9:16_tiktok", "1:1_instagram", "16:9_youtube"]
  reason: string;
}
```

`runVideoAgent` also returns `shotLists: Record<string, string[]>`:

```typescript
// shotLists["BUR-TR-001"]
// [
//   "[9:16_tiktok] Unboxing → Detail close-up → Styling → Fit try-on — no trust note",
//   "[1:1_instagram] Flat-lay → Detail close-up → Brand label — no trust note"
// ]
```

## Platform Priority Order

1. **TikTok** — highest reach, 9:16 format
2. **Instagram Reels** — UK primary, 9:16 or 1:1
3. **XiaohongShu** — HK primary, bilingual captions, 1:1 or 9:16
4. **YouTube Shorts** — lower priority, 9:16

## Shot Types

| Shot Type | Description |
|-----------|-------------|
| Unboxing | Reveal packaging, tissue paper, box |
| Styling | Item worn or styled in context |
| Detail close-up | Stitching, hardware, label, serial |
| Fit try-on | Item on model or mannequin |
| Flat-lay | Item laid flat, bird's-eye view |

## Priority Rules

| Condition | Priority | Reason |
|-----------|----------|--------|
| `status === "proof_ready"` | high | Ready to produce |
| `brandStream === "luxury_resale"` + no proof | low | Hold until proof complete |
| Status is `draft` | low | Not yet approved |

## Integration

- **Receives from**: `content-agent` (approved content briefs)
- **Feeds into**: Execution engine — production-ready briefs for video team
- **Compliance**: Shot lists include `complianceNotes` from `VideoAsset` objects

## Example

```typescript
// agent-tasks/video-agent.ts
export async function runVideoAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<VideoAgentOutput>

// Output:
{
  videoSchedule: [{
    sku: "BUR-TR-001",
    productTitle: "Burberry Vintage Trench",
    priority: "high",
    formats: ["9:16_tiktok", "1:1_instagram"],
    reason: "Proof ready — video production can proceed"
  }],
  shotLists: {
    "BUR-TR-001": [
      "[9:16_tiktok] Unboxing → Detail close-up → Styling → Fit try-on — no trust note",
      "[1:1_instagram] Flat-lay → Detail close-up → Brand label — no trust note"
    ]
  },
  result: { agentId: "video", status: "done", ... }
}
```

Compliance notes from the shot list tell the video team what disclaimers must
appear on screen (e.g. "Authenticity verified" with proof reference).
