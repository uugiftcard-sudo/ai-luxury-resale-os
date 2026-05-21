import { findForbiddenClaims } from "@luxury/db";
import type { Product, ProofPack } from "@luxury/db";
import type { AgentResult, RiskAlert } from "./types.js";

export interface RiskAgentOutput {
  result: AgentResult;
  alerts: RiskAlert[];
  clearedProducts: string[];
}

interface RiskCheck {
  rule: string;
  severity: "info" | "warning" | "high" | "critical";
  condition: boolean;
  message: string;
  actionRequired?: string;
}

const LUXURY_BRANDS = [
  "gucci", "louis vuitton", "chanel", "hermes", "dior", "prada",
  "balenciaga", "celine", "bottega veneta", "givenchy", "valentino",
  "cartier", "rolex", "omega", "tag heuer", "tudor", "burberry",
  "alexander mcqueen", "off-white", "supreme", "stone island",
];

const RESTRICTED_WORDS = [
  "replica", "1:1", "aaa", "mirror quality", "super aaa", "unbranded",
  "unauthorised", "unauthorized", "authenticity guaranteed",
];

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
    const checks: RiskCheck[] = [];

    // ── 1. Luxury without proof ─────────────────────────────────────────
    if (product.brandStream === "luxury_resale" && !proof) {
      checks.push({
        rule: "luxury_requires_proof",
        severity: "high",
        condition: true,
        message: `[${product.sku}] Luxury item listed without a proof pack`,
        actionRequired: "Do not publish until a complete proof pack (source record, photos, tracking) is uploaded",
      });
    }

    // ── 2. Forbidden claims scan ─────────────────────────────────────────
    const productText = `${product.title} ${product.conditionNotes} ${product.category} ${product.brand ?? ""}`;
    const forbidden = findForbiddenClaims(productText);
    if (forbidden.length > 0) {
      checks.push({
        rule: "forbidden_claims",
        severity: "critical",
        condition: true,
        message: `[${product.sku}] Forbidden claim patterns: ${forbidden.join(", ")}`,
        actionRequired: "Remove or rephrase all forbidden wording before listing",
      });
    }

    // ── 3. Restricted word scan ──────────────────────────────────────────
    const lower = productText.toLowerCase();
    const foundRestricted = RESTRICTED_WORDS.filter((w) => lower.includes(w));
    if (foundRestricted.length > 0) {
      checks.push({
        rule: "restricted_words",
        severity: "critical",
        condition: true,
        message: `[${product.sku}] Restricted words detected: ${foundRestricted.join(", ")}`,
        actionRequired: "Remove all restricted terminology immediately",
      });
    }

    // ── 4. Luxury brand with no serial / code ──────────────────────────
    if (proof) {
      const brand = (product.brand ?? "").toLowerCase();
      const isLuxury = LUXURY_BRANDS.some((b) => brand.includes(b));
      if (isLuxury && !proof.serialOrCode && !proof.receiptRef) {
        checks.push({
          rule: "luxury_missing_serial",
          severity: "high",
          condition: true,
          message: `[${product.sku}] ${product.brand} luxury item has no serial/code or receipt reference`,
          actionRequired: "Add serial number, authentication code, or receipt reference to the proof pack",
        });
      }
    }

    // ── 5. Product risk flags ────────────────────────────────────────────
    if (product.riskFlags.length > 0) {
      checks.push({
        rule: "product_risk_flags",
        severity: "warning",
        condition: true,
        message: `[${product.sku}] Risk flags present: ${product.riskFlags.join(", ")}`,
      });
    }

    // ── 6. Proof completeness ───────────────────────────────────────────
    if (proof) {
      const missing: string[] = [];
      if (!proof.sourceRecord) missing.push("source record");
      if (proof.detailPhotoRefs.length === 0) missing.push("detail photos");
      if (proof.flawPhotoRefs.length === 0) missing.push("flaw photos");
      if (!proof.packingVideoRef) missing.push("packing video");
      if (!proof.trackingRef && product.status !== "draft") missing.push("tracking reference");

      if (missing.length > 0) {
        checks.push({
          rule: "incomplete_proof",
          severity: "warning",
          condition: true,
          message: `[${product.sku}] Proof pack incomplete: ${missing.join(", ")}`,
          actionRequired: `Complete: ${missing.join(", ")}`,
        });
      }

      // HK-specific: payment proof required for FPS/PayMe
      if (market === "HK") {
        if (!proof.paymentProofRef) {
          checks.push({
            rule: "hk_missing_payment_proof",
            severity: "high",
            condition: true,
            message: `[${product.sku}/HK] No payment proof — required for FPS/PayMe payment methods`,
            actionRequired: "Add payment proof reference before confirming HK sale",
          });
        }
        // HK face-to-face requires confirmation reference
        if (!proof.faceToFaceConfirmationRef) {
          checks.push({
            rule: "hk_face_to_face_missing_confirm",
            severity: "warning",
            condition: true,
            message: `[${product.sku}/HK] No face-to-face confirmation ref — required if offering F2F collection`,
            actionRequired: "Add buyer confirmation message reference if F2F is listed as an option",
          });
        }
      }
    }

    // ── 7. Cross-border / import risk ───────────────────────────────────
    if (product.riskFlags.some((f) => ["cross_border_risk", "eu_duty"].includes(f))) {
      checks.push({
        rule: "cross_border_risk",
        severity: "high",
        condition: true,
        message: `[${product.sku}] Cross-border import risk flagged — confirm duty liability before listing`,
        actionRequired: "Verify import duty liability for destination country",
      });
    }

    // ── Emit alerts from checks ─────────────────────────────────────────
    for (const check of checks) {
      alerts.push({
        severity: check.severity,
        agentId: "risk",
        rule: check.rule,
        message: check.message,
        productSku: product.sku,
        actionRequired: check.actionRequired,
      });
    }

    // ── Cleared only if no high/critical issues ──────────────────────────
    const hasHighOrCritical = checks.some(
      (c) => c.severity === "high" || c.severity === "critical"
    );
    if (!hasHighOrCritical) {
      clearedProducts.push(product.sku);
    }
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  return {
    result: {
      agentId: "risk",
      status: "done",
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      market: market as "UK" | "HK",
      summary:
        `${alerts.length} alerts ` +
        `(${criticalCount} critical · ${highCount} high · ${warningCount} warning) — ` +
        `${clearedProducts.length} products cleared`,
      itemsProcessed: products.length,
      issuesFound: alerts.length,
      escalations: alerts
        .filter((a) => a.severity === "critical" || a.severity === "high")
        .map((a) => `[${a.severity.toUpperCase()}] ${a.productSku}: ${a.message}`),
      details: {
        criticalCount,
        highCount,
        warningCount,
        alerts,
        clearedProducts,
      },
    },
    alerts,
    clearedProducts,
  };
}
