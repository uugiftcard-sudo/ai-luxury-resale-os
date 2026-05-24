---
name: agent-content
description: >
  Generates platform-specific content — captions, hooks, and short-video scripts
  for Instagram, XiaohongShu, Depop, and Vestiaire Collective. Triggered by:
  content, captions, short video, hooks, social copy, instagram caption,
  xiaohongshu content, video hooks. Uses `content-agent.ts` to output
  `ContentTask[]` and bilingual content packs.
---

# Agent: Content

## Purpose

Generates platform-specific marketing copy for every listed product. Each product
receives multiple content variants: short-video hooks (3 per product), full
captions for each platform, and story-style posts. HK market content is generated
in both English and Traditional Chinese.

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `Product[]` | Approved listing tasks from listing-agent | Excludes `sold` and `returned` |
| Market context | `market: "UK" \| "HK"` | HK = bilingual output |

## Outputs

Each product generates a `ContentTask`:

```typescript
interface ContentTask {
  product: { sku: string; title: string; status: string };
  formats: string[];   // e.g. ["short_video_hook", "instagram_caption", "story"]
  priority: "high" | "medium" | "low";
  reason: string;
}
```

`runContentAgent` returns `{ tasks, captionsByPlatform, result }`.

Captions are grouped by `format:language` key:

```typescript
captionsByPlatform: {
  "short_video_hook:en": [...],
  "instagram_caption:zh-Hant": [...],
  "depop_caption:en": [...],
}
```

## Content Variants

| Variant | Description |
|---------|-------------|
| Short-video hook (×3) | 15–30s opener scripts, platform-matched |
| Full caption | Product story + details + CTA |
| Story-style | Ephemeral content format, swipe-up hook |

## Platform Priorities

| Platform | Market | Notes |
|----------|--------|-------|
| Instagram | UK, HK | Feed + Reels hooks |
| XiaohongShu | HK | Bilingual (EN + zh-Hant) |
| Depop | UK | Authentic, conversational tone |
| Vestiaire Collective | UK, HK | Luxury resale format |

## Tone Rules

- **Luxury, authentic voice** — never use superlatives like "best ever"
- No unverified claims ("guaranteed authentic" without proof)
- Avoid overused AI patterns; write naturally
- HK bilingual: English first, then Traditional Chinese section

## Integration

- **Receives from**: `listing-agent` (approved products)
- **Feeds into**: `video-agent` (for production schedules based on approved content)
- **Output**: `captionsByPlatform` → execution engine for publishing

## Example

For a proof-ready Hermès bag in HK:

```typescript
// agent-tasks/content-agent.ts
export async function runContentAgent(
  products: Product[],
  market: string
): Promise<ContentAgentOutput>

// Captions generated per product:
{
  tasks: [{
    product: { sku: "HER-B-KELLY", title: "Hermès Kelly 28", status: "proof_ready" },
    formats: ["short_video_hook", "instagram_caption", "xiaohongshu_caption"],
    priority: "high",
    reason: "3 content assets generated (short_video_hook, instagram_caption, xiaohongshu_caption)"
  }],
  captionsByPlatform: {
    "short_video_hook:en": [
      "[short_video_hook] Hook: 'What nobody tells you about buying a Kelly...' | CTA: 'Link in bio'"
    ],
    "xiaohongshu_caption:zh-Hant": [
      "[instagram_caption] Hook: 入手Kelly的隱藏攻略... | CTA: 點擊主頁連結"
    ]
  }
}
```

Priority is set to `high` when `product.status === "proof_ready"`.
