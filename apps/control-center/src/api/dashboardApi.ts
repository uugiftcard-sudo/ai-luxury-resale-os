/**
 * Dashboard API client — fetches from the CLOTH API at http://localhost:3001
 * with graceful fallback to empty data when the server is not running.
 */
import type { DashboardProduct, DashboardOrder, ActivityItem } from "../types/dashboard.js";

const API_BASE = "http://localhost:3001/api";
const FETCH_TIMEOUT_MS = 3000;

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json ?? null;
  } catch {
    return null;
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<DashboardProduct[]> {
  const data = await apiFetch<DashboardProduct[]>("/products?limit=200");
  if (!data) return [];
  return data.map(adaptProduct);
}

function adaptProduct(p: DashboardProduct): DashboardProduct {
  return {
    ...p,
    sku: (p as any).sku || p.id,
    currency: p.currency || "HKD",
    market: (p as any).market || "HK",
    brandStream: (p as any).brandStream || "luxury_resale",
    conditionGrade: (p as any).conditionGrade || "B",
  };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<DashboardOrder[]> {
  const data = await apiFetch<DashboardOrder[]>("/orders?limit=100");
  if (!data) return [];
  return data.map(adaptOrder);
}

function adaptOrder(o: DashboardOrder): DashboardOrder {
  const raw = o as unknown as Record<string, unknown>;
  return {
    ...o,
    orderId: (raw["orderId"] as string) || (o as any).orderId || o.id,
    sku: (raw["sku"] as string) || (o as any).sku || o.productId,
    currency: (raw["currency"] as string) || "HKD",
    market: (raw["market"] as "UK" | "HK") || "HK",
    buyerName:
      o.buyerName ||
      ((raw["buyerInfo"] as Record<string, unknown>)?.name as string) ||
      "—",
  };
}

// ─── Activity feed (synthetic from product + order data) ──────────────────────

export function buildActivityFeed(products: DashboardProduct[], orders: DashboardOrder[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  // New listings (most recent first)
  for (const p of products) {
    items.push({
      id: `listing-${p.id}`,
      type: p.status === "待售" || p.status === "listed" ? "new_listing" : "product_sold",
      title: p.status === "待售" || p.status === "listed"
        ? `New listing — ${p.title}`
        : `Sold — ${p.title}`,
      description: p.brand
        ? `${p.brand} · ${p.condition} · ${p.market}`
        : `${p.condition} · ${p.market}`,
      timestamp: p.createdAt,
      sku: p.sku,
      market: p.market as "UK" | "HK",
    });
  }

  // Orders
  for (const o of orders) {
    const typeMap: Record<string, ActivityItem["type"]> = {
      "待付款": "order_created",
      "待发货": "order_created",
      "已发货": "order_shipped",
      "已完成": "order_completed",
    };
    items.push({
      id: `order-${o.id}`,
      type: typeMap[o.status] ?? "order_created",
      title: `${o.status} — Order ${o.orderId}`,
      description: o.buyerName !== "—" ? `Buyer: ${o.buyerName} · ${o.currency} ${o.totalPrice.toLocaleString()}` : `${o.currency} ${o.totalPrice.toLocaleString()}`,
      timestamp: o.createdAt,
      sku: o.sku,
      market: o.market,
    });
  }

  // Sort by timestamp desc, take most recent 20
  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function computeStats(products: DashboardProduct[], orders: DashboardOrder[]) {
  const currency = products[0]?.currency || orders[0]?.currency || "HKD";

  const listedStatuses = ["待售", "listed", "proof_ready"];
  const soldStatuses = ["已售", "sold"];

  const totalProducts = products.length;
  const activeListings = products.filter((p) => listedStatuses.includes(p.status)).length;
  const soldItems = products.filter((p) => soldStatuses.includes(p.status)).length;
  const draftProducts = products.filter((p) => p.status === "draft" || p.status === "已下架").length;

  const totalGMV = orders
    .filter((o) => o.status === "已完成" || o.status === "delivered")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter((o) => o.status === "待付款" || o.status === "paid").length;
  const shippedOrders = orders.filter((o) => o.status === "已发货" || o.status === "shipped").length;
  const completedOrders = orders.filter((o) => o.status === "已完成" || o.status === "delivered").length;
  const awaitingPayment = orders.filter((o) => o.status === "待付款").length;

  return {
    totalProducts,
    activeListings,
    soldItems,
    totalGMV,
    gmvCurrency: currency,
    pendingOrders,
    shippedOrders,
    completedOrders,
    awaitingPayment,
    proofReady: activeListings,
    draftProducts,
  };
}
