import { buildControlCenterSnapshot } from "../apps/control-center/src/index.js";
import { calculateProfit } from "@luxury/finance-analytics";
import { generateListings } from "@luxury/listing-crosspost";
import { sampleProducts, sampleProofPacks } from "./sample-data.js";

for (const market of ["UK", "HK"] as const) {
  console.log(JSON.stringify(buildControlCenterSnapshot(market, sampleProducts, sampleProofPacks), null, 2));
}

const ukProduct = sampleProducts[0];
console.log(JSON.stringify(generateListings(ukProduct, sampleProofPacks[0]).slice(0, 2), null, 2));
console.log(JSON.stringify(calculateProfit({
  sku: ukProduct.sku,
  market: "UK",
  revenue: ukProduct.targetPrice,
  cost: ukProduct.cost,
  platformFeePercent: 0.13,
  shippingCost: { amount: 8, currency: "GBP" }
}), null, 2));
