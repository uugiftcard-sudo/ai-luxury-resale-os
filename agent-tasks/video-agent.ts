import { generateProductVideoPack } from "@luxury/video-factory";
import type { Product, ProofPack, VideoAsset } from "@luxury/db";
import type { AgentResult } from "./types.js";

export interface VideoAgentOutput {
  result: AgentResult;
  videoSchedule: VideoScheduleItem[];
  shotLists: Record<string, string[]>;
}

export interface VideoScheduleItem {
  sku: string;
  productTitle: string;
  priority: "high" | "medium" | "low";
  formats: string[];
  reason: string;
}

export async function runVideoAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<VideoAgentOutput> {
  const start = Date.now();
  const videoSchedule: VideoScheduleItem[] = [];
  const shotLists: Record<string, string[]> = {};

  for (const product of products) {
    if (product.status === "sold" || product.status === "returned") continue;

    const proof = proofs.get(product.sku);
    const videos: VideoAsset[] = generateProductVideoPack(product, proof);

    let priority: "high" | "medium" | "low" = "medium";
    let reason = `${videos.length} video assets`;

    if (product.status === "proof_ready") {
      priority = "high";
      reason = "Proof ready — video production can proceed";
    }
    if (product.brandStream === "luxury_resale" && !proof) {
      priority = "low";
      reason = "Luxury without proof — hold until proof complete";
    }

    const formats = videos.map((v) => v.format);
    videoSchedule.push({
      sku: product.sku,
      productTitle: product.title,
      priority,
      formats,
      reason,
    });

    shotLists[product.sku] = videos.map((v) => {
      const trustNote = v.complianceNotes.length > 0 ? v.complianceNotes[0] : "no trust note";
      return `[${v.format}] ${v.shotList.join(" → ")} — ${trustNote}`;
    });
  }

  const high = videoSchedule.filter((v) => v.priority === "high").length;

  return {
    result: {
      agentId: "video",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary: `${videoSchedule.length} video tasks: ${high} high priority`,
      itemsProcessed: products.length,
      tasksGenerated: videoSchedule.reduce((acc, v) => acc + v.formats.length, 0),
      details: { highPriority: high, shotLists },
    },
    videoSchedule,
    shotLists,
  };
}
