import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  type CustomerProfile,
  type LiveSession,
  type OrderRecord,
  type Product,
  type ProofPack,
  type SourcingLead,
} from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(filename: string, data: T): void {
  ensureDataDir();
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Collection wrapper
// ---------------------------------------------------------------------------

class Collection<T> {
  private data: T[] = [];
  private filename: string;
  private key: string;
  private getKey: (item: T) => string;

  constructor(filename: string, key: string, getKey: (item: T) => string) {
    this.filename = filename;
    this.key = key;
    this.getKey = getKey;
    this.data = loadJson<T[]>(filename, []);
  }

  private persist(): void {
    saveJson(this.filename, this.data);
  }

  findAll(): T[] {
    return [...this.data];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.data.find(predicate);
  }

  findMany(predicate: (item: T) => boolean): T[] {
    return this.data.filter(predicate);
  }

  upsert(item: T): T {
    const id = this.getKey(item);
    const idx = this.data.findIndex((d) => this.getKey(d) === id);
    if (idx >= 0) {
      this.data[idx] = { ...this.data[idx], ...item };
    } else {
      this.data.push(item);
    }
    this.persist();
    return item;
  }

  remove(predicate: (item: T) => boolean): number {
    const before = this.data.length;
    this.data = this.data.filter((d) => !predicate(d));
    if (this.data.length !== before) this.persist();
    return before - this.data.length;
  }

  count(): number {
    return this.data.length;
  }
}

// ---------------------------------------------------------------------------
// Store singleton
// ---------------------------------------------------------------------------

export interface Store {
  products: Collection<Product>;
  proofPacks: Collection<ProofPack>;
  orders: Collection<OrderRecord>;
  leads: Collection<SourcingLead>;
  customers: Collection<CustomerProfile>;
  liveSessions: Collection<LiveSession>;
  listings: Collection<Record<string, unknown>>;
  videoAssets: Collection<Record<string, unknown>>;
  crmTasks: Collection<Record<string, unknown>>;
}

let _products: Collection<Product>;
let _proofPacks: Collection<ProofPack>;
let _orders: Collection<OrderRecord>;
let _leads: Collection<SourcingLead>;
let _customers: Collection<CustomerProfile>;
let _liveSessions: Collection<LiveSession>;
let _listings: Collection<Record<string, unknown>>;
let _videoAssets: Collection<Record<string, unknown>>;
let _crmTasks: Collection<Record<string, unknown>>;
let _initialized = false;

function initStore(): void {
  if (_initialized) return;
  _products = new Collection<Product>("products.json", "sku", (p) => p.sku);
  _proofPacks = new Collection<ProofPack>("proof-packs.json", "id", (p) => p.id);
  _orders = new Collection<OrderRecord>("orders.json", "orderId", (o) => o.orderId);

  // Leads are used by the sourcing pipeline. Keep a single canonical file to avoid divergence.
  _leads = new Collection<SourcingLead>("sourcing-leads.json", "id", (l) => l.id);

  _customers = new Collection<CustomerProfile>("customers.json", "customerId", (c) => c.customerId);
  _liveSessions = new Collection<LiveSession>("live-sessions.json", "sessionId", (s) => s.sessionId);
  _listings = new Collection<Record<string, unknown>>("listings.json", "id", (l) => String(l["id"] ?? ""));
  _videoAssets = new Collection<Record<string, unknown>>("video-assets.json", "videoId", (v) => String(v["videoId"] ?? ""));
  _crmTasks = new Collection<Record<string, unknown>>("crm-tasks.json", "taskId", (t) => String(t["taskId"] ?? ""));
  _initialized = true;
}

function getStore() {
  initStore();
  return {
    products: _products,
    proofPacks: _proofPacks,
    orders: _orders,
    leads: _leads,
    customers: _customers,
    liveSessions: _liveSessions,
    listings: _listings as Collection<Record<string, unknown>>,
    videoAssets: _videoAssets as Collection<Record<string, unknown>>,
    crmTasks: _crmTasks as Collection<Record<string, unknown>>,
  };
}

// ---------------------------------------------------------------------------
// Named exports mirroring the old in-memory API
// ---------------------------------------------------------------------------

export const products = {
  findAll: (): Product[] => getStore().products.findAll(),
  find: (predicate: (p: Product) => boolean): Product | undefined =>
    getStore().products.find(predicate),
  findBySku: (sku: string): Product | undefined =>
    getStore().products.find((p) => p.sku === sku),
  upsert: (product: Product): Product => getStore().products.upsert(product),
  remove: (predicate: (p: Product) => boolean): number =>
    getStore().products.remove(predicate),
  count: (): number => getStore().products.count(),
};

export const proofPacks = {
  findAll: (): ProofPack[] => getStore().proofPacks.findAll(),
  find: (predicate: (p: ProofPack) => boolean): ProofPack | undefined =>
    getStore().proofPacks.find(predicate),
  findBySku: (sku: string): ProofPack | undefined =>
    getStore().proofPacks.find((p) => p.sku === sku),
  upsert: (proof: ProofPack): ProofPack => getStore().proofPacks.upsert(proof),
  remove: (predicate: (p: ProofPack) => boolean): number =>
    getStore().proofPacks.remove(predicate),
  count: (): number => getStore().proofPacks.count(),
};

export const orders = {
  findAll: (): OrderRecord[] => getStore().orders.findAll(),
  find: (predicate: (o: OrderRecord) => boolean): OrderRecord | undefined =>
    getStore().orders.find(predicate),
  findBySku: (sku: string): OrderRecord | undefined =>
    getStore().orders.find((o) => o.sku === sku),
  upsert: (order: OrderRecord): OrderRecord => getStore().orders.upsert(order),
  remove: (predicate: (o: OrderRecord) => boolean): number =>
    getStore().orders.remove(predicate),
  count: (): number => getStore().orders.count(),
};

export const leads = {
  findAll: (): SourcingLead[] => getStore().leads.findAll(),
  find: (predicate: (l: SourcingLead) => boolean): SourcingLead | undefined =>
    getStore().leads.find(predicate),
  upsert: (lead: SourcingLead): SourcingLead => getStore().leads.upsert(lead),
  remove: (predicate: (l: SourcingLead) => boolean): number =>
    getStore().leads.remove(predicate),
  count: (): number => getStore().leads.count(),
};

export const customers = {
  findAll: (): CustomerProfile[] => getStore().customers.findAll(),
  find: (
    predicate: (c: CustomerProfile) => boolean
  ): CustomerProfile | undefined => getStore().customers.find(predicate),
  upsert: (customer: CustomerProfile): CustomerProfile =>
    getStore().customers.upsert(customer),
  remove: (predicate: (c: CustomerProfile) => boolean): number =>
    getStore().customers.remove(predicate),
  count: (): number => getStore().customers.count(),
};

export const liveSessions = {
  findAll: (): LiveSession[] => getStore().liveSessions.findAll(),
  find: (
    predicate: (s: LiveSession) => boolean
  ): LiveSession | undefined => getStore().liveSessions.find(predicate),
  upsert: (session: LiveSession): LiveSession =>
    getStore().liveSessions.upsert(session),
  remove: (predicate: (s: LiveSession) => boolean): number =>
    getStore().liveSessions.remove(predicate),
  count: (): number => getStore().liveSessions.count(),
};

export const listings = {
  findAll: () => getStore().listings.findAll(),
  find: (predicate: (l: Record<string, unknown>) => boolean) =>
    getStore().listings.find(predicate),
  upsert: (listing: Record<string, unknown>) =>
    getStore().listings.upsert(listing),
  count: (): number => getStore().listings.count(),
};

export const videoAssets = {
  findAll: () => getStore().videoAssets.findAll(),
  find: (predicate: (v: Record<string, unknown>) => boolean) =>
    getStore().videoAssets.find(predicate),
  upsert: (asset: Record<string, unknown>) =>
    getStore().videoAssets.upsert(asset),
  count: (): number => getStore().videoAssets.count(),
};

export const crmTasks = {
  findAll: () => getStore().crmTasks.findAll(),
  find: (predicate: (t: Record<string, unknown>) => boolean) =>
    getStore().crmTasks.find(predicate),
  upsert: (task: Record<string, unknown>) =>
    getStore().crmTasks.upsert(task),
  count: (): number => getStore().crmTasks.count(),
};

// ---------------------------------------------------------------------------
// Clear all data
// ---------------------------------------------------------------------------

export function clearAll(): void {
  const store = getStore();
  store.products.remove(() => true);
  store.proofPacks.remove(() => true);
  store.orders.remove(() => true);
  store.leads.remove(() => true);
  store.customers.remove(() => true);
  store.liveSessions.remove(() => true);
  store.listings.remove(() => true);
  store.videoAssets.remove(() => true);
  store.crmTasks.remove(() => true);
}

// ---------------------------------------------------------------------------
// Seed helper
// ---------------------------------------------------------------------------

export function seedAll(
  productsData: Product[],
  proofsData: ProofPack[],
  leadsData: SourcingLead[],
  ordersData: OrderRecord[]
): void {
  productsData.forEach((p) => getStore().products.upsert(p));
  proofsData.forEach((p) => getStore().proofPacks.upsert(p));
  leadsData.forEach((l) => getStore().leads.upsert(l));
  ordersData.forEach((o) => getStore().orders.upsert(o));
}

// ---------------------------------------------------------------------------
// Data summary
// ---------------------------------------------------------------------------

export interface DataSummary {
  products: { total: number; byMarket: { UK: number; HK: number }; byStream: { luxury: number; budget: number } };
  proofPacks: { total: number; byMarket: { UK: number; HK: number } };
  orders: { total: number; byStatus: Record<string, number> };
  leads: { total: number };
  customers: { total: number };
  liveSessions: { total: number };
}

export function dataSummary(): DataSummary {
  initStore();
  const allProducts = getStore().products.findAll();
  const allProofs = getStore().proofPacks.findAll();
  const allOrders = getStore().orders.findAll();
  const allLeads = getStore().leads.findAll();
  const allCustomers = getStore().customers.findAll();
  const allSessions = getStore().liveSessions.findAll();

  const byStatus: Record<string, number> = {};
  for (const o of allOrders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  }

  return {
    products: {
      total: allProducts.length,
      byMarket: {
        UK: allProducts.filter((p) => p.market === "UK").length,
        HK: allProducts.filter((p) => p.market === "HK").length,
      },
      byStream: {
        luxury: allProducts.filter((p) => p.brandStream === "luxury_resale").length,
        budget: allProducts.filter((p) => p.brandStream === "budget_fashion").length,
      },
    },
    proofPacks: {
      total: allProofs.length,
      byMarket: {
        UK: allProofs.filter((p) => p.market === "UK").length,
        HK: allProofs.filter((p) => p.market === "HK").length,
      },
    },
    orders: { total: allOrders.length, byStatus },
    leads: { total: allLeads.length },
    customers: { total: allCustomers.length },
    liveSessions: { total: allSessions.length },
  };
}
