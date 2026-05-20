import type { LiveRunOfShow, LiveSession, Product } from "@luxury/db";

export function buildLiveRunOfShow(session: LiveSession, products: Product[]): LiveRunOfShow {
  const sessionProducts = products.filter((product) => session.productSkus.includes(product.sku));
  const productLines = sessionProducts.map((product) => `${product.sku}: ${product.title} - ${product.conditionGrade} - ${product.targetPrice.currency} ${product.targetPrice.amount}`);

  return {
    sessionId: session.sessionId,
    beforeLive: [
      "Confirm proof pack status for every luxury item.",
      "Prepare live trailer, VIP preview, and live reminder video.",
      "Pin the product order and reserve rules.",
      ...productLines.map((line) => `Prepare script for ${line}`)
    ],
    duringLive: [
      "Open with market, delivery, payment, and hold rules.",
      "For each product: show full item, close-ups, flaws, size/condition, price, and CTA.",
      "Moderator records common questions and high-interest timestamps.",
      "Escalate refund, authenticity, threat, or chargeback questions."
    ],
    afterLive: [
      "Cut live highlights and Q&A clips.",
      "Follow up SKU requests and VIP leads.",
      "Update sold/still-available status without false scarcity.",
      "Record views, comments, DMs, clicks, sales, and dispute risk."
    ],
    escalationRules: [
      "No unsupported authenticity promise.",
      "No fake sold-out or fake buyer pressure.",
      "Founder approval needed for refund, dispute, or high-value discount."
    ]
  };
}
