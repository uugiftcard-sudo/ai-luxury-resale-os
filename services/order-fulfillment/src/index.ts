import type { FulfilmentPlan, OrderRecord, ProofPack } from "@luxury/db";

export function buildFulfilmentPlan(order: OrderRecord, proof?: ProofPack): FulfilmentPlan {
  const steps: string[] = [];
  const missingEvidence: string[] = [];
  const riskWarnings: string[] = [];

  steps.push("Confirm payment has cleared before dispatch or handover.");
  steps.push("Match SKU, item condition, accessories, and proof pack.");
  steps.push("Record final item detail video before packing or handover.");

  if (!proof) {
    missingEvidence.push("proof pack");
  } else {
    if (!proof.detailPhotoRefs.length) missingEvidence.push("detail photos");
    if (!proof.flawPhotoRefs.length) missingEvidence.push("flaw photos");
    if (order.market === "UK" && !proof.parcelWeight) missingEvidence.push("parcel weight");
    if (order.market === "HK" && ["fps", "payme", "bank_transfer"].includes(order.paymentMethod) && !proof.paymentProofRef) {
      missingEvidence.push("HK payment proof");
    }
  }

  if (order.fulfilmentMethod === "face_to_face") {
    steps.push("Meet in a public/CCTV-friendly location.");
    steps.push("Ask buyer to confirm receipt and condition in message after handover.");
    riskWarnings.push("Face-to-face trades need message confirmation to reduce later item-switch disputes.");
  } else {
    steps.push("Pack item on video with SKU visible.");
    steps.push("Save tracking reference and courier receipt.");
  }

  if (order.market === "HK") {
    steps.push("For SF Express, save waybill and tracking screenshot.");
  } else {
    steps.push("For UK delivery, use tracked service and save parcel weight.");
  }

  return {
    orderId: order.orderId,
    steps,
    missingEvidence,
    riskWarnings,
    customerMessage: order.market === "HK"
      ? "多謝你，訂單已確認。我哋會保存付款/交收/運送紀錄，發貨後會提供 tracking。"
      : "Thanks, your order is confirmed. We will keep packing and tracking evidence and send the tracking details after dispatch."
  };
}
