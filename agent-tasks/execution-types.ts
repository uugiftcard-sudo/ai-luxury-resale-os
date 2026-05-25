// ── Execution types ────────────────────────────────────────────────────────────

/** Platform identifier */
export type ExecutorPlatform =
  | "discord"
  | "whatsapp"
  | "shopify"
  | "ebay"
  | "email"
  | "telegram";

/** Risk level gates execution */
export type ExecutionRisk = "low" | "medium" | "high" | "critical";

/** One executable task produced by an agent */
export interface ExecutionTask {
  id: string;
  /** Agent that generated this task */
  sourceAgent: AgentId;
  market: string;
  risk: ExecutionRisk;
  /** Human-readable summary shown in approval queue */
  summary: string;
  /** The platform this task targets */
  platform: ExecutorPlatform;
  /** Task-specific payload passed to the executor */
  payload: Record<string, unknown>;
  /** If true, execution is blocked until approved */
  requiresApproval: boolean;
  approvalReason?: string;
  /** If true, skip even if requiresApproval=false in dry-run */
  dryRunSkippable?: boolean;
  createdAt: string;
}

/** Result of running one task */
export interface ExecutionResult {
  taskId: string;
  ok: boolean;
  mode: "mock" | "live";
  executedAt: string;
  durationMs: number;
  platformMessage?: string;
  platformRef?: string;
  error?: string;
}

/** Summary of a full execution queue run */
export interface ExecutionRunResult {
  runId: string;
  executed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  pendingApproval: ExecutionTask[];
  results: ExecutionResult[];
  durationMs: number;
}

export { type AgentId } from "./types.js";