import { dataSummary, products, proofPacks, seedAll } from "@luxury/db";
import { buildControlCenterSnapshot } from "../apps/control-center/src/index.js";
import { calculateProfit } from "@luxury/finance-analytics";
import { generateListings } from "@luxury/listing-crosspost";
import {
  sampleProducts,
  sampleProofPacks,
  sampleSourcingLeads,
  sampleOrders,
  sampleCustomers,
  sampleLiveSessions,
} from "./sample-data.js";

// Seed on first run so storage has data
seedAll(
  sampleProducts,
  sampleProofPacks,
  sampleSourcingLeads,
  sampleOrders,
  sampleCustomers,
  sampleLiveSessions
);

console.log("\n=== CLOTH Control Center — UK ===");
const ukSnapshot = buildControlCenterSnapshot("UK", products.findAll(), proofPacks.findAll());
console.log(JSON.stringify(ukSnapshot, null, 2));

console.log("\n=== CLOTH Control Center — HK ===");
const hkSnapshot = buildControlCenterSnapshot("HK", products.findAll(), proofPacks.findAll());
console.log(JSON.stringify(hkSnapshot, null, 2));

// Pick a sample UK luxury product to show full workflow
const ukProduct = sampleProducts.find((p) => p.sku === "UK-LUX-001")!;
const ukProof = sampleProofPacks.find((p) => p.sku === ukProduct.sku);

console.log("\n=== UK Luxury Shopify Listings ===");
const ukListings = generateListings(ukProduct, ukProof);
ukListings.slice(0, 2).forEach((l) => {
  console.log(`[${l.platform}] ${l.title}`);
  console.log(`  status: ${l.status}  warnings: ${l.warnings.join(", ") || "none"}`);
  console.log();
});

console.log("=== UK Luxury Profit Snapshot ===");
console.log(JSON.stringify(calculateProfit({
  sku: ukProduct.sku,
  market: "UK",
  revenue: ukProduct.targetPrice,
  cost: ukProduct.cost,
  platformFeePercent: 0.13,
  shippingCost: { amount: 8, currency: "GBP" }
}), null, 2));

console.log("\n=== Data Summary ===");
console.log(JSON.stringify(dataSummary(), null, 2));
