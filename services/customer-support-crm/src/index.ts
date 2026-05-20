import type { CRMTask, CustomerInteraction, Product, ProofPack, SupportResponse } from "@luxury/db";

const riskyIntents = new Set<CustomerInteraction["intent"]>(["fake_claim", "return"]);

export function respondToCustomer(interaction: CustomerInteraction, product?: Product, proof?: ProofPack): SupportResponse {
  if (riskyIntents.has(interaction.intent)) {
    return {
      reply: interaction.market === "HK"
        ? "收到，我哋會先暫停自動回覆並由負責人檢查產品證據、付款、交收/運送紀錄。請先提供清晰相片及平台 case 資料。"
        : "Thanks for raising this. We will pause automated replies and have the founder review the product proof, order, shipping, and case details. Please provide clear photos and any platform case details.",
      escalate: true,
      escalationReason: "Risky dispute/return intent requires founder approval.",
      requiredEvidence: ["buyer photos", "platform case", "proof pack", "messages", "tracking/payment proof"]
    };
  }

  if (interaction.intent === "payment" && interaction.market === "HK") {
    return {
      reply: "可以用 FPS / PayMe for Business / 銀行轉帳；付款後請保留交易截圖或 reference，我哋會同訂單一齊保存。",
      escalate: false
    };
  }

  if (interaction.intent === "shipping" && interaction.market === "HK") {
    return {
      reply: "香港訂單可安排順豐、智能櫃、本地 courier 或指定面交。發貨前會保留包裝影片及 tracking。",
      escalate: false
    };
  }

  if (interaction.intent === "shipping") {
    return {
      reply: "UK orders are sent with tracked delivery. We keep packing evidence and tracking details for each order.",
      escalate: false
    };
  }

  if (interaction.intent === "budget_fashion_request") {
    return {
      reply: interaction.market === "HK"
        ? "可以，我哋有 budget fashion / inspired style / Korean style 單品，但唔會售賣 fake、replica 或冒牌 logo。"
        : "Yes, we also offer budget fashion and inspired styling pieces, but we do not sell fake, replica, or logo-copy items.",
      escalate: false
    };
  }

  return {
    reply: product
      ? `${product.title}: ${product.conditionNotes}. ${proof?.serialOrCode ? `Reference/code on file: ${proof.serialOrCode}.` : "Proof details are available where applicable."}`
      : "Thanks for your message. Please send the SKU and we will check condition, proof, price, and delivery options.",
    escalate: false
  };
}

export function followUpTag(interaction: CustomerInteraction): string {
  if (interaction.intent === "discount") return "warm_lead_discount";
  if (interaction.intent === "budget_fashion_request") return "budget_buyer";
  if (interaction.intent === "fake_claim") return "risk_dispute";
  return `${interaction.market.toLowerCase()}_${interaction.intent}`;
}

export function createCRMTask(interaction: CustomerInteraction): CRMTask {
  const tag = followUpTag(interaction);
  const isRisk = tag === "risk_dispute";
  const isBudget = tag === "budget_buyer";
  const segment: CRMTask["segment"] = isRisk
    ? "risk_buyer"
    : isBudget
      ? "budget_buyer"
      : interaction.intent === "discount"
        ? "discount_lead"
        : interaction.customerId.toLowerCase().includes("vip")
          ? "vip"
          : "warm_lead";

  return {
    taskId: `crm-${interaction.customerId}-${Date.now()}`,
    customerId: interaction.customerId,
    market: interaction.market,
    segment,
    action: isRisk ? "Founder review before reply" : "Send follow-up message",
    message: interaction.market === "HK"
      ? "多謝查詢，請提供 SKU，我哋會覆你狀態、相片、付款和交收選項。"
      : "Thanks for your interest. Please send the SKU and we will confirm condition, proof, payment, and delivery options.",
    due: isRisk ? "today" : "tomorrow",
    requiresApproval: isRisk
  };
}
