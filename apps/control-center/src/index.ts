/**
 * CLOTH Control Center — entry point
 *
 * Re-exports:
 *  • buildControlCenterSnapshot — Node.js TUI dashboard logic
 *  • Dashboard / components    — React web dashboard (import from dashboard.tsx directly)
 */
import { agentsForMarket } from "@luxury/agents";
import type { Market, Product, ProofPack } from "@luxury/db";
import { auditProofPack } from "@luxury/product-proof";
import { generateListings } from "@luxury/listing-crosspost";
import { generateContentPack } from "@luxury/content-live";
import { dailyCommunityPlan } from "@luxury/community-growth";
import { generateProductVideoPack } from "@luxury/video-factory";

export interface ControlCenterSnapshot {
  market: Market;
  activeAgents: string[];
  productCount: number;
  proofReadyCount: number;
  listingReadyCount: number;
  contentAssetCount: number;
  videoAssetCount: number;
  communityTasks: number;
  actionQueue: string[];
}

export function buildControlCenterSnapshot(market: Market, products: Product[], proofs: ProofPack[]): ControlCenterSnapshot {
  const marketProducts = products.filter((product) => product.market === market);
  const proofBySku = new Map(proofs.map((proof) => [proof.sku, proof]));
  const proofReadyCount = marketProducts.filter((product) => {
    const proof = proofBySku.get(product.sku);
    return proof ? auditProofPack(product, proof).complete : false;
  }).length;

  const listings = marketProducts.flatMap((product) => generateListings(product, proofBySku.get(product.sku)));
  const content = marketProducts.flatMap((product) => generateContentPack(product));
  const videos = marketProducts.flatMap((product) => generateProductVideoPack(product, proofBySku.get(product.sku)));
  const actionQueue: string[] = [];

  for (const product of marketProducts) {
    const proof = proofBySku.get(product.sku);
    if (!proof) actionQueue.push(`${product.sku}: create proof pack`);
    else {
      const audit = auditProofPack(product, proof);
      if (!audit.complete) actionQueue.push(`${product.sku}: finish proof pack (${audit.missing.join(", ")})`);
    }
  }

  return {
    market,
    activeAgents: agentsForMarket(market).map((agent) => agent.title),
    productCount: marketProducts.length,
    proofReadyCount,
    listingReadyCount: listings.filter((listing) => listing.status === "ready").length,
    contentAssetCount: content.length,
    videoAssetCount: videos.length,
    communityTasks: dailyCommunityPlan(market).length,
    actionQueue
  };
}
