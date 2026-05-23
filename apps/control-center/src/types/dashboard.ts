/**
 * Dashboard types — shared across all control-center components.
 */
import type { AgentResult, RiskAlert } from "../types.js";

// ─── Data shapes ──────────────────────────────────────────────────────────────

export interface DashboardProduct {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  originalPrice: number;
  condition: string;
  conditionGrade: string;
  size: string;
  images: string[];
  platform?: string;
  status: string;
  createdAt: string;
  market: "UK" | "HK";
  brandStream: string;
}

export interface DashboardOrder {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  status: string;
  totalPrice: number;
  currency: string;
  buyerName: string;
  createdAt: string;
  market: "UK" | "HK";
  platform?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number;
  activeListings: number;
  soldItems: number;
  totalGMV: number;
  gmvCurrency: string;
  pendingOrders: number;
  shippedOrders: number;
  completedOrders: number;
  awaitingPayment: number;
  proofReady: number;
  draftProducts: number;
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export type ActivityType =
  | "new_listing"
  | "sale"
  | "order_shipped"
  | "order_completed"
  | "order_created"
  | "price_updated"
  | "product_sold"
  | "agent_run"
  | "risk_alert";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  agentId?: string;
  severity?: RiskAlert["severity"];
  sku?: string;
  market?: "UK" | "HK";
}

// ─── Agent Run History ────────────────────────────────────────────────────────

export interface AgentRun {
  id: string;
  agentId: string;
  agentTitle: string;
  market: "UK" | "HK";
  status: AgentResult["status"];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  itemsProcessed?: number;
  tasksGenerated?: number;
  escalations?: string[];
  errors?: string[];
  summary?: string;
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void | Promise<void>;
  variant: "primary" | "secondary" | "danger";
  disabled?: boolean;
}
