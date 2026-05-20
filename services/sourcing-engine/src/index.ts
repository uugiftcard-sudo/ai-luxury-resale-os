import type { Money, SourcingDecision, SourcingLead } from "@luxury/db";

function money(amount: number, currency: Money["currency"]): Money {
  return { amount: Math.round(amount * 100) / 100, currency };
}

export function scoreSourcingLead(lead: SourcingLead): SourcingDecision {
  const fee = lead.estimatedResalePrice.amount * lead.estimatedPlatformFeePercent;
  const estimatedProfit = money(
    lead.estimatedResalePrice.amount - lead.askingPrice.amount - lead.estimatedShipping.amount - fee,
    lead.askingPrice.currency
  );
  const roiPercent = lead.askingPrice.amount === 0 ? 0 : Math.round((estimatedProfit.amount / lead.askingPrice.amount) * 10000) / 100;
  const reasons: string[] = [];
  const requiredChecks: string[] = [];

  if (lead.askingPrice.currency !== lead.estimatedResalePrice.currency || lead.askingPrice.currency !== lead.estimatedShipping.currency) {
    reasons.push("Currency mismatch.");
    return { leadId: lead.id, decision: "reject", estimatedProfit, roiPercent, reasons, requiredChecks: ["Fix currency data."] };
  }

  if (lead.riskFlags.length) {
    reasons.push(`Risk flags: ${lead.riskFlags.join(", ")}`);
    requiredChecks.push("Founder review before purchase.");
  }

  if (lead.brandStream === "luxury_resale" && lead.evidenceAvailable.length < 2) {
    reasons.push("Not enough source/proof evidence for luxury resale.");
    requiredChecks.push("Ask for receipt, serial/code, detail photos, and seller history.");
  }

  if (roiPercent >= 35 && lead.evidenceAvailable.length >= 2 && lead.riskFlags.length === 0) {
    reasons.push("Strong margin and enough initial evidence.");
    return { leadId: lead.id, decision: "buy", estimatedProfit, roiPercent, reasons, requiredChecks };
  }

  if (roiPercent >= 20 && !lead.riskFlags.includes("counterfeit_sensitive")) {
    reasons.push("Potentially viable, but needs more checks or negotiation.");
    requiredChecks.push("Negotiate price or confirm proof before buying.");
    return { leadId: lead.id, decision: "watch", estimatedProfit, roiPercent, reasons, requiredChecks };
  }

  reasons.push("Margin or risk is not good enough.");
  return { leadId: lead.id, decision: "reject", estimatedProfit, roiPercent, reasons, requiredChecks };
}

export function sourcingChecklist(lead: SourcingLead): string[] {
  const base = [
    "Check sold comps and demand.",
    "Confirm condition and flaws.",
    "Calculate platform fee, shipping, and refund reserve.",
    "Save seller conversation and source URL."
  ];
  if (lead.market === "HK") return [...base, "Confirm FPS/PayMe/Carousell payment evidence can be saved.", "Confirm SF or face-to-face handover option."];
  return [...base, "Confirm tracked delivery and parcel evidence can be saved.", "Check eBay/TikTok/Shopify resale suitability."];
}
