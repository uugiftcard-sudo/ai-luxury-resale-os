import { generateContentPack } from "@luxury/content-live";
import type { Product } from "@luxury/db";
import type { AgentResult, ContentTask } from "./types.js";

export interface ContentAgentOutput {
  result: AgentResult;
  tasks: ContentTask[];
  captionsByPlatform: Record<string, string[]>;
}

export async function runContentAgent(
  products: Product[],
  market: string
): Promise<ContentAgentOutput> {
  const start = Date.now();
  const tasks: ContentTask[] = [];
  const captionsByPlatform: Record<string, string[]> = {};

  for (const product of products) {
    if (product.status === "sold" || product.status === "returned") continue;

    const content = generateContentPack(product);
    const formats = content.map((c) => c.format);

    // Prioritise items that are proof_ready (ready to promote)
    let priority: "high" | "medium" | "low" = "medium";
    if (product.status === "proof_ready") priority = "high";
    if (product.status === "draft") priority = "low";

    tasks.push({
      product,
      formats,
      priority,
      reason: `${formats.length} content assets generated (${formats.join(", ")})`,
    });

    // Group captions by platform/format
    for (const asset of content) {
      const key = `${asset.format}:${asset.language}`;
      if (!captionsByPlatform[key]) captionsByPlatform[key] = [];
      captionsByPlatform[key].push(
        `[${asset.format}] Hook: ${asset.hook}\nCTA: ${asset.callToAction}`
      );
    }
  }

  const high = tasks.filter((t) => t.priority === "high").length;

  return {
    result: {
      agentId: "content",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary: `${tasks.length} content tasks: ${high} high priority — ${Object.keys(captionsByPlatform).length} format variants`,
      itemsProcessed: products.length,
      tasksGenerated: contentCount(tasks),
      details: { highPriority: high, captionsByPlatform },
    },
    tasks,
    captionsByPlatform,
  };
}

function contentCount(tasks: ContentTask[]): number {
  return tasks.reduce((acc, t) => acc + t.formats.length, 0);
}
