import type { Market, Product, ProofPack, ProofScore } from "@luxury/db";

const commonRequirements = [
  "sourceRecord",
  "detailPhotoRefs",
  "flawPhotoRefs"
] as const;

const marketRequirements: Record<Market, string[]> = {
  UK: ["receiptRef or sourceRecord", "serialOrCode if available", "packingVideoRef", "parcelWeight", "trackingRef"],
  HK: ["paymentProofRef", "packingVideoRef or faceToFaceConfirmationRef", "trackingRef for SF/local courier orders"]
};

export interface ProofAudit {
  complete: boolean;
  missing: string[];
  warnings: string[];
}

export function createProofPack(product: Product, overrides: Partial<ProofPack> = {}): ProofPack {
  return {
    id: overrides.id ?? `proof-${product.sku}`,
    sku: product.sku,
    market: product.market,
    sourceRecord: overrides.sourceRecord ?? "",
    receiptRef: overrides.receiptRef,
    serialOrCode: overrides.serialOrCode,
    detailPhotoRefs: overrides.detailPhotoRefs ?? [],
    flawPhotoRefs: overrides.flawPhotoRefs ?? [],
    packingVideoRef: overrides.packingVideoRef,
    parcelWeight: overrides.parcelWeight,
    trackingRef: overrides.trackingRef,
    paymentProofRef: overrides.paymentProofRef,
    faceToFaceConfirmationRef: overrides.faceToFaceConfirmationRef,
    notes: overrides.notes ?? []
  };
}

export function auditProofPack(product: Product, proof: ProofPack): ProofAudit {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const field of commonRequirements) {
    const value = proof[field];
    if (Array.isArray(value) ? value.length === 0 : !value) {
      missing.push(field);
    }
  }

  if (product.brandStream === "luxury_resale" && !proof.serialOrCode) {
    warnings.push("No serial/code recorded. Mark as unavailable in listing if the item genuinely has none.");
  }

  if (product.market === "UK") {
    if (!proof.packingVideoRef) missing.push("packingVideoRef");
    if (!proof.parcelWeight) missing.push("parcelWeight");
    if (!proof.trackingRef) missing.push("trackingRef");
  }

  if (product.market === "HK") {
    if (!proof.paymentProofRef) missing.push("paymentProofRef");
    if (!proof.packingVideoRef && !proof.faceToFaceConfirmationRef) {
      missing.push("packingVideoRef or faceToFaceConfirmationRef");
    }
  }

  return {
    complete: missing.length === 0,
    missing,
    warnings
  };
}

export function calculateProofScore(product: Product, proof?: ProofPack): ProofScore {
  if (product.brandStream === "budget_fashion") {
    return {
      sku: product.sku,
      market: product.market,
      score: 100,
      grade: "strong",
      canPublishLuxury: true,
      canUseProofFirstPromotion: false,
      missingEvidence: [],
      warnings: ["Budget fashion does not require luxury proof pack, but must stay separate from designer resale."]
    };
  }

  const missingEvidence: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  if (!proof) {
    return {
      sku: product.sku,
      market: product.market,
      score: 0,
      grade: "weak",
      canPublishLuxury: false,
      canUseProofFirstPromotion: false,
      missingEvidence: ["proofPack"],
      warnings: ["Luxury item has no proof pack. Keep in draft and do not publish to Shopify luxury or TikTok promotion."]
    };
  }

  if (proof.sourceRecord) score += 20;
  else missingEvidence.push("sourceRecord");

  if (proof.receiptRef) score += 10;
  else warnings.push("No receipt reference saved. Use source record and photos carefully.");

  if (proof.serialOrCode) score += 15;
  else warnings.push("No serial/code recorded. Do not overclaim authenticity.");

  if (proof.detailPhotoRefs.length >= 2) score += 15;
  else missingEvidence.push("detailPhotoRefs");

  if (proof.flawPhotoRefs.length >= 1) score += 10;
  else missingEvidence.push("flawPhotoRefs");

  if (proof.packingVideoRef) score += 10;
  else missingEvidence.push("packingVideoRef");

  if (product.market === "UK") {
    if (proof.parcelWeight) score += 10;
    else missingEvidence.push("parcelWeight");
    if (proof.trackingRef) score += 10;
    else missingEvidence.push("trackingRef");
  } else {
    if (proof.paymentProofRef) score += 10;
    else missingEvidence.push("paymentProofRef");
    if (proof.trackingRef || proof.faceToFaceConfirmationRef) score += 10;
    else missingEvidence.push("trackingRef or faceToFaceConfirmationRef");
  }

  const cappedScore = Math.min(100, score);
  const grade: ProofScore["grade"] = cappedScore >= 80 ? "strong" : cappedScore >= 55 ? "medium" : "weak";

  return {
    sku: product.sku,
    market: product.market,
    score: cappedScore,
    grade,
    canPublishLuxury: grade !== "weak",
    canUseProofFirstPromotion: grade === "strong",
    missingEvidence,
    warnings
  };
}

export function proofChecklist(market: Market): string[] {
  return [
    "source record and seller conversation",
    "clear front/back/detail photos",
    "logo, label, serial/code, stitching, hardware close-ups where relevant",
    "flaw photos and condition grade",
    ...marketRequirements[market]
  ];
}
