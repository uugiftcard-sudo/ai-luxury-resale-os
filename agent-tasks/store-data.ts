/**
 * Store data fetcher — reads from the in-memory store (api/src/models/store.ts)
 * when the API is running, and falls back to sample data otherwise.
 *
 * The API types (store.ts) are different from @luxury/db types (dispatcher uses):
 *   store.ts  → id, title, brand, category, price, originalPrice, condition, status: '待售'|'已售'|'已下架'
 *   @luxury/db → sku, market, brandStream, currency, conditionGrade, status: 'draft'|'listed'|'sold'...
 *
 * This module adapts store.ts data into @luxury/db shapes so the dispatcher agents
 * and all downstream services can consume them without changes.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type {
  Product as LuxProduct,
  ProofPack,
  SourcingLead,
  Market,
} from "@luxury/db";
import {
  products as storeProducts,
  orders as storeOrders,
} from "../api/src/models/store.js";
import {
  sampleProducts,
  sampleProofPacks,
  sampleSourcingLeads,
} from "../scripts/sample-data.js";

// Resolve packages/db/data relative to this file (agent-tasks/store-data.ts)
const SCRIPTS_DIR = path.resolve(fileURLToPath(import.meta.url), "../../scripts");
const SCRAPED_LEADS_FILE = path.join(SCRIPTS_DIR, "../packages/db/data/sourcing-leads.json");

// ─── Scraper leads loader ──────────────────────────────────────────────────────

function loadScrapedLeads(): SourcingLead[] {
  if (!fs.existsSync(SCRAPED_LEADS_FILE)) return [];
  try {
    const raw: SourcingLead[] = JSON.parse(fs.readFileSync(SCRAPED_LEADS_FILE, "utf-8"));
    return raw.filter(
      (l): l is SourcingLead =>
        !!l.id && !!l.market && !!l.title && !!l.askingPrice && !!l.estimatedResalePrice
    );
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:3001/api";
const FETCH_TIMEOUT_MS = 2000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function tryFetch<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { data?: T };
    return json.data ?? fallback();
  } catch {
    return fallback();
  }
}

// ─── Store → @luxury/db adapters ────────────────────────────────────────────

/**
 * Adapt store.ts Product (id/title/price/status: 待售) into @luxury/db Product (sku/market/cost/targetPrice).
 * We look up the matching sample product by title as a best-effort — for real inventory
 * management this should be replaced with a proper unified data model.
 */
function adaptStoreProduct(storeProduct: {
  id: string;
  title: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: string;
  size?: string;
  status: string;
  platform?: string;
}): LuxProduct {
  // Try to find a matching sample product by title similarity
  const match = sampleProducts.find(
    (sp) =>
      sp.title.toLowerCase() === storeProduct.title.toLowerCase() ||
      sp.title.includes(storeProduct.title.slice(0, 20))
  );

  if (match) {
    return {
      ...match,
      status: adaptStatus(storeProduct.status),
    };
  }

  // No match — synthesise a minimal @luxury/db product from store data
  const currency: "GBP" | "HKD" = storeProduct.id.startsWith("p00")
    ? "HKD"
    : "GBP";

  return {
    sku: `STORE-${storeProduct.id}`,
    market: currency === "GBP" ? "UK" : "HK",
    brandStream: "luxury_resale",
    currency,
    language: currency === "GBP" ? "en-GB" : "zh-Hant-HK",
    title: storeProduct.title,
    brand: storeProduct.brand,
    category: storeProduct.category,
    size: storeProduct.size,
    conditionGrade: adaptCondition(storeProduct.condition),
    conditionNotes: "",
    cost: { amount: Math.round(storeProduct.originalPrice * 0.4), currency },
    targetPrice: { amount: storeProduct.price, currency },
    status: adaptStatus(storeProduct.status),
    platforms: storeProduct.platform
      ? [storeProduct.platform as LuxProduct["platforms"][0]]
      : [],
    riskFlags: [],
  };
}

function adaptStatus(
  status: string
): LuxProduct["status"] {
  switch (status) {
    case "已售":
    case "sold":
      return "sold";
    case "已下架":
    case "unlisted":
      return "draft";
    default:
      return "listed";
  }
}

function adaptCondition(
  condition: string
): LuxProduct["conditionGrade"] {
  switch (condition) {
    case "全新":
    case "A":
      return "A";
    case "几乎全新":
    case "B":
      return "B";
    case "轻微使用痕迹":
      return "B";
    case "有明显使用痕迹":
    case "C":
      return "C";
    default:
      return "B";
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface StoreData {
  products: LuxProduct[];
  proofPacks: ProofPack[];
  sourcingLeads: SourcingLead[];
  orders: Array<{ orderId: string; sku: string; status: string; market: Market }>;
  source: "api" | "sample";
}

export async function fetchStoreData(market?: Market): Promise<StoreData> {
  // Load scraped leads (written by run-cycle.ts after scraping phase)
  const scrapedLeads = loadScrapedLeads();
  const scrapedLeadsForMarket = market
    ? scrapedLeads.filter((l) => l.market === market)
    : scrapedLeads;

  // Try fetching from the running API
  const [apiProducts, apiOrders] = await Promise.all([
    tryFetch<typeof storeProducts>("/products?limit=100", () => []),
    tryFetch<typeof storeOrders>("/orders?limit=100", () => []),
  ]);

  if (apiProducts.length > 0) {
    // API is running — adapt store products to @luxury/db shape
    const products = apiProducts.map(adaptStoreProduct);
    const filtered = market ? products.filter((p) => p.market === market) : products;

    return {
      products: filtered,
      proofPacks: market
        ? sampleProofPacks.filter((p) => p.market === market)
        : sampleProofPacks,
      // Merge: scraped leads (from run-cycle.ts) + sample leads as seed
      sourcingLeads: [...scrapedLeadsForMarket, ...sampleSourcingLeads.filter((l) => l.market === (market ?? l.market))],
      orders: apiOrders.map((o) => ({
        orderId: o.id,
        sku: o.productId,
        status: o.status,
        market: "HK" as Market,
      })),
      source: "api",
    };
  }

  // API not running — use sample + scraped leads
  const baseLeads = market
    ? sampleSourcingLeads.filter((l) => l.market === market)
    : sampleSourcingLeads;
  const allLeads = [...scrapedLeadsForMarket, ...baseLeads];

  console.warn(
    "[store-data] API not reachable at http://localhost:3001 — " +
    `using sample data + ${scrapedLeadsForMarket.length} scraped leads`
  );
  return {
    products: market
      ? sampleProducts.filter((p) => p.market === market)
      : sampleProducts,
    proofPacks: market
      ? sampleProofPacks.filter((p) => p.market === market)
      : sampleProofPacks,
    sourcingLeads: allLeads,
    orders: [],
    source: scrapedLeads.length > 0 ? "sample+scraped" : "sample",
  };
}

export { sampleProducts, sampleProofPacks, sampleSourcingLeads };
