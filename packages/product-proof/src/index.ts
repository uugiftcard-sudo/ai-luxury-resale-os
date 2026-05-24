/**
 * @luxury/product-proof
 * Authentication evidence pack builder and auditor.
 *
 * Builds proof packs from: source record, photos, serial numbers,
 * flaw photos, packing video, tracking, and payment proof.
 *
 * Status: STUB — implement actual evidence gathering + scoring logic.
 */
import type { Product, ProofPack } from "@luxury/db";

export interface ProofAuditResult {
  complete: boolean;
  score: number;           // 0-100
  grade: "strong" | "medium" | "weak";
  canPublishLuxury: boolean;
  canUseProofFirstPromotion: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Build a proof pack skeleton for a product.
 * Real implementation: poll Photos/API, receipt scanner, tracking service.
 */
export function buildProofPack(product: Product): ProofPack {
  return {
    id: `pp-${product.sku}-${Date.now()}`,
    sku: product.sku,
    market: product.market,
    sourceRecord: "",
    detailPhotoRefs: [],
    flawPhotoRefs: [],
    notes: [],
  };
}

/**
 * Audit a product + proof pack for readiness.
 */
export function auditProofPack(product: Product, proof: ProofPack): ProofAuditResult {
  const missing: string[] = [];
  if (!proof.sourceRecord) missing.push("source record");
  if (proof.detailPhotoRefs.length < 3) missing.push("detail photos (min 3)");
  if (proof.flawPhotoRefs.length === 0) missing.push("flaw photos");
  if (!proof.trackingRef) missing.push("tracking reference");
  if (!proof.paymentProofRef) missing.push("payment proof");
  if (!proof.serialOrCode) missing.push("serial / auth code");

  const score = Math.max(0, 100 - missing.length * 15);
  const grade = score >= 80 ? "strong" : score >= 50 ? "medium" : "weak";
  const complete = missing.length === 0;

  const warnings: string[] = [];
  if (proof.flawPhotoRefs.length > 0 && proof.notes.some(n => /scratch|damage|wear/i.test(n))) {
    warnings.push("flaws documented — ensure condition grade reflects this");
  }

  return {
    complete,
    score,
    grade,
    canPublishLuxury: complete && product.brandStream === "luxury_resale",
    canUseProofFirstPromotion: complete,
    missing,
    warnings,
  };
}
