// ── Core agent types ───────────────────────────────────────────────────────────

export type AgentId =
  | "sourcing"
  | "listing"
  | "content"
  | "video"
  | "fulfillment"
  | "community"
  | "risk"
  | "report";

export type AgentStatus = "idle" | "running" | "done" | "error" | "skipped";

export interface AgentResult {
  agentId: AgentId;
  status: AgentStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  market?: string;
  summary?: string;
  itemsProcessed?: number;
  tasksGenerated?: number;
  issuesFound?: number;
  escalations?: string[];
  errors?: string[];
  details?: Record<string, unknown>;
}

export interface DispatcherResult {
  runId: string;
  triggeredBy: string;
  triggeredAt: string;
  completedAt?: string;
  totalDurationMs?: number;
  markets: string[];
  agents: AgentResult[];
  // Task outputs consumed by the Execution Engine
  listingTasks?: ListingTask[];
  contentTasks?: ContentTask[];
  captionsByPlatform?: Record<string, string[]>;
  sourcingItems?: SourcingQueueItem[];
  riskAlerts?: RiskAlert[];
  summary: {
    totalItemsProcessed: number;
    totalTasksGenerated: number;
    totalEscalations: number;
    totalErrors: number;
    marketsCompleted: string[];
    marketsFailed: string[];
  };
}

export interface DispatcherOptions {
  markets?: string[];
  agents?: AgentId[];
  dryRun?: boolean;
  includeReport?: boolean;
  issues?: { number: number; title: string; body?: string }[];
}

export interface SourcingQueueItem {
  leadId: string;
  leadTitle: string;
  decision: "buy" | "watch" | "reject";
  estimatedProfit: { amount: number; currency: string };
  roiPercent: number;
  reasons: string[];
}

export interface ListingTask {
  product: { sku: string; title: string; status: string; market: string };
  platforms: string[];
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface ContentTask {
  product: { sku: string; title: string; status: string };
  formats: string[];
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface RiskAlert {
  severity: "info" | "warning" | "high" | "critical";
  agentId: AgentId;
  rule: string;
  message: string;
  productSku?: string;
  leadId?: string;
  actionRequired?: string;
}

export interface DailyReport {
  date: string;
  runId: string;
  markets: string[];
  agents: AgentResult[];
  topSourcingDecisions: SourcingQueueItem[];
  topListingTasks: ListingTask[];
  topContentTasks: ContentTask[];
  riskAlerts: RiskAlert[];
  escalationCount: number;
  totalTasks: number;
  nextActions: string[];
}
