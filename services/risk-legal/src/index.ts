import type { Market, Product, ProofPack } from "@luxury/db";

export function listingDisclaimer(market: Market, brandStream: Product["brandStream"]): string {
  if (brandStream === "budget_fashion") {
    return market === "HK"
      ? "此為平價時裝/風格單品，並非任何名牌產品，亦不會以名牌身份出售。"
      : "This is a budget fashion/style item and is not presented as a designer product.";
  }

  return market === "HK"
    ? "此為二手貨品。請購買前查看所有相片、瑕疵、配件及可提供之證據。本店並非品牌官方授權經銷商。"
    : "This is a pre-owned item. Please review all photos, flaws, accessories, and available evidence before purchase. We are not an official authorised reseller of the brand.";
}

export function disputeChecklist(market: Market, proof: ProofPack): string[] {
  const base = [
    `SKU: ${proof.sku}`,
    `Source record: ${proof.sourceRecord || "missing"}`,
    `Serial/code: ${proof.serialOrCode || "not recorded/not applicable"}`,
    `Detail photos: ${proof.detailPhotoRefs.length}`,
    `Flaw photos: ${proof.flawPhotoRefs.length}`
  ];

  if (market === "HK") {
    return [
      ...base,
      `Payment proof: ${proof.paymentProofRef || "missing"}`,
      `SF/tracking: ${proof.trackingRef || "not applicable if face-to-face"}`,
      `Face-to-face confirmation: ${proof.faceToFaceConfirmationRef || "not applicable"}`,
      "Ask buyer for clear photos and platform case details before making any admission."
    ];
  }

  return [
    ...base,
    `Packing video: ${proof.packingVideoRef || "missing"}`,
    `Parcel weight: ${proof.parcelWeight || "missing"}`,
    `Tracking: ${proof.trackingRef || "missing"}`,
    "Ask buyer for clear photos, platform case details, and any third-party report before making any admission."
  ];
}

export const prohibitedBusinessRules = [
  "Do not sell fake, replica, counterfeit, or logo-copy items.",
  "Do not use 1:1, mirror quality, AAA grade, or similar counterfeit-coded wording.",
  "Do not claim official authorisation unless documented.",
  "Do not remove UK statutory consumer rights through policy wording.",
  "Keep UK and HK terms separate because returns, payment, delivery, and dispute handling differ."
];
