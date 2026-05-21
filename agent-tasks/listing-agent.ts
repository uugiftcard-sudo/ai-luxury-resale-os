import { generateListings } from "@luxury/listing-crosspost";
import type { Product, ProofPack } from "@luxury/db";
import type { AgentResult, ListingTask } from "./types.js";

export interface ListingAgentOutput {
  result: AgentResult;
  tasks: ListingTask[];
  complianceWarnings: string[];
}

export async function runListingAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<ListingAgentOutput> {
  const start = Date.now();
  const tasks: ListingTask[] = [];
  const complianceWarnings: string[] = [];

  for (const product of products) {
    if (product.status !== "draft" && product.status !== "proof_ready") continue;

    const proof = proofs.get(product.sku);
    const listings = generateListings(product, proof);

    // Determine priority
    let priority: "high" | "medium" | "low" = "medium";
    let reason = "";

    if (!proof) {
      priority = "high";
      reason = "Proof pack missing — blocking listing";
      complianceWarnings.push(`[${product.sku}] No proof pack — listing withheld until proof complete`);
    } else if (proof.sourceRecord === "" || proof.detailPhotoRefs.length === 0) {
      priority = "high";
      reason = "Proof incomplete — detail photos or source record missing";
      complianceWarnings.push(`[${product.sku}] Proof incomplete — missing detail photos or source record`);
    } else if (product.brandStream === "luxury_resale") {
      priority = "high";
      reason = "Luxury item — requires full proof before listing";
    } else if (product.status === "proof_ready") {
      priority = "medium";
      reason = "Proof ready — listing can proceed";
    } else {
      priority = "low";
      reason = "Draft — still needs review";
    }

    tasks.push({
      product,
      platforms: listings.map((l) => l.platform).filter(Boolean) as string[],
      priority,
      reason,
    });

    // Compliance check: reject any listing with counterfeit/resale-restricted wording
    for (const listing of listings) {
      const warningKeywords = ["replica", "1:1", "super", "AAA", "mirror", "unbranded"];
      const found = warningKeywords.filter((kw) =>
        (listing.title ?? "").toLowerCase().includes(kw) ||
        (listing.description ?? "").toLowerCase().includes(kw)
      );
      if (found.length > 0) {
        complianceWarnings.push(
          `[${product.sku}/${listing.platform}] Potential compliance issue: ${found.join(", ")} — escalate`
        );
      }
    }
  }

  const high = tasks.filter((t) => t.priority === "high").length;
  const medium = tasks.filter((t) => t.priority === "medium").length;

  return {
    result: {
      agentId: "listing",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary: `${tasks.length} listing tasks: ${high} high, ${medium} medium, ${complianceWarnings.length} compliance warnings`,
      itemsProcessed: products.length,
      tasksGenerated: tasks.length,
      issuesFound: complianceWarnings.length,
      escalations: complianceWarnings.filter((w) => w.includes("escalate")),
      details: { highPriority: high, mediumPriority: medium },
    },
    tasks,
    complianceWarnings,
  };
}
