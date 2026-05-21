import { findForbiddenClaims } from "@luxury/db";
import type { Product, ProofPack } from "@luxury/db";
import type { AgentResult, RiskAlert } from "./types.js";

export interface RiskAgentOutput {
  result: AgentResult;
  alerts: RiskAlert[];
  clearedProducts: string[];
}

export async function runRiskAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<RiskAgentOutput> {
  const start = Date.now();
  const alerts: RiskAlert[] = [];
  const clearedProducts: string[] = [];

  for (const product of products) {
    if (product.status === "sold" || product.status === "returned") continue;

    const proof = proofs.get(product.sku);
    let riskSeverity: "info" | "warning" | "high" | "critical" = "info";

    if (product.brandStream === "luxury_resale" && !proof) {
      alerts.push({
        severity: "high",
        agentId: "risk",
        rule: "luxury_requires_proof",
        message: `[${product.sku}] Luxury item without proof pack`,
        productSku: product.sku,
        actionRequired: "Do not list until full proof pack is uploaded",
      });
      riskSeverity = "high";
    }

    const productText = `${product.title} ${product.conditionNotes} ${product.category}`;
    const forbiddenClaims = findForbiddenClaims(productText);
    if (forbiddenClaims.length > 0) {
      alerts.push({
        severity: "critical",
        agentId: "risk",
        rule: "forbidden_claims",
        message: `[${product.sku}] Forbidden claims: ${forbiddenClaims.join(", ")}`,
        productSku: product.sku,
        actionRequired: "Remove or rephrase all forbidden claims before listing",
      });
      riskSeverity = "critical";
    }

    if (product.riskFlags.length > 0) {
      alerts.push({
        severity: "warning",
        agentId: "risk",
        rule: "product_risk_flags",
        message: `[${product.sku}] Risk flags: ${product.riskFlags.join(", ")}`,
        productSku: product.sku,
      });
    }

    if (proof) {
      const missingPhotos = proof.flawPhotoRefs.length === 0 && proof.detailPhotoRefs.length === 0;
      const missingTracking = !proof.trackingRef && product.status !== "draft";
      const missingSource = !proof.sourceRecord;

      if (missingPhotos || missingTracking || missingSource) {
        const missingFields = [
          missingPhotos ? "flaws/detail photos" : "",
          missingTracking ? "tracking" : "",
          missingSource ? "source record" : "",
        ].filter(Boolean);

        alerts.push({
          severity: "warning",
          agentId: "risk",
          rule: "incomplete_proof",
          message: `[${product.sku}] Proof incomplete: ${missingFields.join(", ")}`,
          productSku: product.sku,
          actionRequired: "Complete proof pack fields before dispatch",
        });
      }
    }

    if (riskSeverity !== "high" && riskSeverity !== "critical") {
      clearedProducts.push(product.sku);
    }
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return {
    result: {
      agentId: "risk",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary: `${alerts.length} risk alerts (${criticalCount} critical) — ${clearedProducts.length} products cleared`,
      itemsProcessed: products.length,
      issuesFound: alerts.length,
      escalations: alerts
        .filter((a) => a.severity === "critical")
        .map((a) => `[CRITICAL] ${a.productSku}: ${a.message}`),
      details: { criticalCount, alerts },
    },
    alerts,
    clearedProducts,
  };
}
