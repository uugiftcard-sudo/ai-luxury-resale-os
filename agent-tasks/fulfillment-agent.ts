import { buildFulfilmentPlan } from "@luxury/order-fulfillment";
import type { Product, ProofPack, OrderRecord } from "@luxury/db";
import type { AgentResult } from "./types.js";

export interface FulfilmentAgentOutput {
  result: AgentResult;
  fulfilmentPlans: FulfilmentPlanItem[];
  missingEvidence: string[];
}

export interface FulfilmentPlanItem {
  sku: string;
  productTitle: string;
  market: string;
  priority: "high" | "medium" | "low";
  checklist: string[];
  evidenceComplete: boolean;
  riskWarnings: string[];
  customerMessage: string;
}

export async function runFulfilmentAgent(
  products: Product[],
  proofs: Map<string, ProofPack>,
  market: string
): Promise<FulfilmentAgentOutput> {
  const start = Date.now();
  const fulfilmentPlans: FulfilmentPlanItem[] = [];
  const missingEvidence: string[] = [];

  const reserved = products.filter((p) => p.status === "reserved");

  for (const product of reserved) {
    const proof = proofs.get(product.sku);

    const order: OrderRecord = {
      orderId: `auto-${product.sku}`,
      sku: product.sku,
      market: product.market,
      platform: product.platforms[0] ?? "shopify_uk",
      customerId: "auto-generated",
      paidAmount: { amount: product.targetPrice.amount, currency: product.currency },
      paymentMethod: "platform_checkout",
      fulfilmentMethod: product.market === "HK" ? "sf_express" : "royal_mail",
      status: "paid",
      requiredEvidence: ["source record", "detail photos", "packing video"],
    };

    const plan = buildFulfilmentPlan(order, proof);
    const evidenceComplete = plan.missingEvidence.length === 0;

    if (!evidenceComplete) {
      missingEvidence.push(`[${product.sku}] Missing: ${plan.missingEvidence.join(", ")}`);
    }

    fulfilmentPlans.push({
      sku: product.sku,
      productTitle: product.title,
      market: product.market,
      priority: evidenceComplete ? "medium" : "high",
      checklist: plan.steps,
      evidenceComplete,
      riskWarnings: plan.riskWarnings,
      customerMessage: plan.customerMessage,
    });
  }

  return {
    result: {
      agentId: "fulfillment",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary: `${fulfilmentPlans.length} fulfilment tasks: ${missingEvidence.length} with missing evidence`,
      itemsProcessed: products.length,
      tasksGenerated: fulfilmentPlans.length,
      issuesFound: missingEvidence.length,
      details: { missingEvidence },
    },
    fulfilmentPlans,
    missingEvidence,
  };
}
