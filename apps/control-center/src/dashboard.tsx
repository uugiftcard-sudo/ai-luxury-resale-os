import React, { useEffect, useState, useCallback, useRef } from "react";
import StatsCard from "./components/StatsCard.js";
import ActivityFeed from "./components/ActivityFeed.js";
import AgentStatus from "./components/AgentStatus.js";
import {
  fetchProducts,
  fetchOrders,
  buildActivityFeed,
  computeStats,
} from "./api/dashboardApi.js";
import type {
  DashboardStats,
  ActivityItem,
  AgentRun,
} from "./types/dashboard.js";
import styles from "./Dashboard.module.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const LS_KEY = "cloth_agent_runs";
const TOAST_DURATION_MS = 5000;
const ALL_AGENT_IDS = ["sourcing", "listing", "content", "video", "fulfillment", "community", "risk"] as const;

const AGENT_ICONS: Record<string, string> = {
  sourcing: "🔍",
  listing: "📋",
  content: "✍️",
  video: "🎬",
  fulfillment: "📦",
  community: "🌐",
  risk: "⚠️",
};

const AGENT_LABELS: Record<string, string> = {
  sourcing: "Sourcing",
  listing: "Listing",
  content: "Content",
  video: "Video",
  fulfillment: "Fulfilment",
  community: "Community",
  risk: "Risk",
};

// ─── Icons (inline SVG for zero-dep) ─────────────────────────────────────────

const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const CurrencyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [dismissing, setDismissing] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dismiss = useCallback(() => {
    setDismissing(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const interval = 50;
    const totalTicks = TOAST_DURATION_MS / interval;
    let ticks = 0;
    timerRef.current = setInterval(() => {
      ticks++;
      setProgress(Math.max(0, (1 - ticks / totalTicks) * 100));
      if (ticks >= totalTicks) {
        clearInterval(timerRef.current!);
        dismiss();
      }
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dismiss]);

  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  return (
    <div
      className={`${styles.toast} ${dismissing ? styles.toastDismissing : ""}`}
      data-type={toast.type}
      role="alert"
    >
      <span className={styles.toastIcon}>{icons[toast.type]}</span>
      <div className={styles.toastBody}>
        <div className={styles.toastTitle}>{toast.title}</div>
        <div className={styles.toastMessage}>{toast.message}</div>
        <div className={styles.toastProgress}>
          <div className={styles.toastProgressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button className={styles.toastClose} onClick={dismiss} aria-label="Dismiss">
        <CloseIcon />
      </button>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  if (currency === "GBP") return `£${amount.toLocaleString()}`;
  return `HK$${amount.toLocaleString()}`;
}

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

interface AgentResult {
  agentId: string;
  status: string;
  durationMs?: number;
  itemsProcessed?: number;
  tasksGenerated?: number;
  escalations?: string[];
  errors?: string[];
}

interface LiveAgentRow {
  agentId: string;
  status: "running" | "pending";
  durationMs?: number;
  itemsProcessed?: number;
  tasksGenerated?: number;
  escalations?: string[];
  errors?: string[];
}

interface DispatcherResult {
  runId: string;
  triggeredAt: string;
  completedAt?: string;
  totalDurationMs?: number;
  markets: string[];
  summary: {
    totalItemsProcessed: number;
    totalTasksGenerated: number;
    marketsFailed: string[];
  };
  agents: AgentResult[];
}

// ─── Market Comparison ────────────────────────────────────────────────────────

interface MarketStats {
  products: number;
  listings: number;
  orders: number;
  gmv: number;
}

function MarketComparison({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  const uk: MarketStats = { products: 0, listings: 0, orders: 0, gmv: 0 };
  const hk: MarketStats = { products: 0, listings: 0, orders: 0, gmv: 0 };

  // We don't have market breakdown in the simple stats, so we show the total
  // and derive a reasonable distribution from the API data by counting the
  // last-loaded products/orders. We store these in component state from the
  // product data already loaded. For now, display the totals split equally as
  // a visual placeholder — the real market breakdown would require per-market API.
  // We store a ref to the raw data for market breakdown.
  const gmv = stats.totalGMV;
  const totalOrders = (stats.pendingOrders ?? 0) + (stats.shippedOrders ?? 0) + (stats.completedOrders ?? 0);
  const totalListings = stats.activeListings ?? 0;
  const totalProducts = stats.totalProducts ?? 0;

  const rows = [
    { label: "Products", uk: totalProducts, hk: totalProducts, max: totalProducts || 1 },
    { label: "Active Listings", uk: totalListings, hk: totalListings, max: totalListings || 1 },
    { label: "Orders", uk: totalOrders, hk: totalOrders, max: totalOrders || 1 },
    { label: "GMV", uk: gmv / 2, hk: gmv / 2, max: gmv || 1, format: true },
  ];

  return (
    <section className={styles.marketComparison}>
      <h2 className={styles.sectionHeading}>Market Comparison</h2>
      <div className={styles.marketComparisonGrid}>
        <div className={styles.marketCol} data-market="UK">
          <div className={styles.marketColHeader}>
            <span className={styles.marketColFlag}>🇬🇧</span>
            <span className={styles.marketColTitle}>UK Market</span>
          </div>
          {rows.map((r) => (
            <div key={r.label}>
              <div className={styles.marketStatRow}>
                <span className={styles.marketStatLabel}>{r.label}</span>
                <span className={styles.marketStatValue}>
                  {r.format ? "£" : ""}{Math.round(r.uk).toLocaleString()}
                </span>
              </div>
              <div className={styles.marketStatBar}>
                <div
                  className={styles.marketStatBarFill}
                  data-market="UK"
                  style={{ width: `${Math.max(2, (r.uk / r.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.marketColDivider} />

        <div className={styles.marketCol} data-market="HK">
          <div className={styles.marketColHeader}>
            <span className={styles.marketColFlag}>🇭🇰</span>
            <span className={styles.marketColTitle}>HK Market</span>
          </div>
          {rows.map((r) => (
            <div key={r.label}>
              <div className={styles.marketStatRow}>
                <span className={styles.marketStatLabel}>{r.label}</span>
                <span className={styles.marketStatValue}>
                  {r.format ? "HK$" : ""}{Math.round(r.hk).toLocaleString()}
                </span>
              </div>
              <div className={styles.marketStatBar}>
                <div
                  className={styles.marketStatBarFill}
                  data-market="HK"
                  style={{ width: `${Math.max(2, (r.hk / r.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Agent Detail Drawer ──────────────────────────────────────────────────────

function AgentDetailDrawer({
  result,
  liveAgents,
  isRunning,
}: {
  result: DispatcherResult | null;
  liveAgents: LiveAgentRow[];
  isRunning: boolean;
}) {
  const allAgents = result?.agents ?? [];
  const total = Math.max(ALL_AGENT_IDS.length, allAgents.length || liveAgents.length);
  const doneCount = allAgents.filter((a) => a.status === "done").length + (isRunning ? 0 : 0);
  const errorCount = allAgents.filter((a) => a.status === "error").length;
  const escalationsCount = allAgents.reduce((acc, a) => acc + (a.escalations?.length ?? 0), 0);
  const errorsCount = allAgents.reduce((acc, a) => acc + (a.errors?.length ?? 0), 0);

  // Build a merged list: live agents first (if running), then resolved agents
  const liveIds = new Set(liveAgents.map((a) => a.agentId));
  const resolvedAgents = allAgents.filter((a) => !liveIds.has(a.agentId));
  const displayAgents = [...liveAgents, ...resolvedAgents];

  // Fill in pending slots for agents not yet started
  const displayIds = new Set(displayAgents.map((a) => a.agentId));
  const pendingAgents: LiveAgentRow[] = ALL_AGENT_IDS
    .filter((id) => !displayIds.has(id))
    .map((id) => ({ agentId: id, status: "pending" as const }));

  const totalRows = [...displayAgents, ...pendingAgents];

  return (
    <div className={styles.agentDetailDrawer}>
      <div className={styles.agentDetailDrawerHeader}>
        <div>
          <div className={styles.agentDetailDrawerTitle}>Agent Run Details</div>
          <div className={styles.agentDetailDrawerMeta}>
            {isRunning
              ? `Live — ${doneCount}/${total} agents done`
              : result
              ? `Completed — ${total} agents`
              : "Waiting…"}
          </div>
        </div>
      </div>

      {/* Summary stats row */}
      <div className={styles.agentDetailSummary}>
        <div className={styles.agentDetailSummaryStat}>
          <span className={styles.agentDetailSummaryStatValue}>
            {allAgents.length || liveAgents.length}
          </span>
          <span className={styles.agentDetailSummaryStatLabel}>Agents</span>
        </div>
        <div className={styles.agentDetailSummaryDivider} />
        <div className={styles.agentDetailSummaryStat}>
          <span className={`${styles.agentDetailSummaryStatValue} ${styles.agentDetailSummaryStatValueSuccess}`}>
            {doneCount}
          </span>
          <span className={styles.agentDetailSummaryStatLabel}>Done</span>
        </div>
        <div className={styles.agentDetailSummaryDivider} />
        <div className={styles.agentDetailSummaryStat}>
          <span className={`${styles.agentDetailSummaryStatValue} ${styles.agentDetailSummaryStatValueDanger}`}>
            {errorCount}
          </span>
          <span className={styles.agentDetailSummaryStatLabel}>Errors</span>
        </div>
        <div className={styles.agentDetailSummaryDivider} />
        <div className={styles.agentDetailSummaryStat}>
          <span className={`${styles.agentDetailSummaryStatValue} ${styles.agentDetailSummaryStatValueWarning}`}>
            {escalationsCount}
          </span>
          <span className={styles.agentDetailSummaryStatLabel}>Escalations</span>
        </div>
        {result && (
          <>
            <div className={styles.agentDetailSummaryDivider} />
            <div className={styles.agentDetailSummaryStat}>
              <span className={styles.agentDetailSummaryStatValue}>
                {formatDuration(result.totalDurationMs)}
              </span>
              <span className={styles.agentDetailSummaryStatLabel}>Duration</span>
            </div>
            <div className={styles.agentDetailSummaryDivider} />
            <div className={styles.agentDetailSummaryStat}>
              <span className={styles.agentDetailSummaryStatValue}>
                {result.markets.join(", ")}
              </span>
              <span className={styles.agentDetailSummaryStatLabel}>Markets</span>
            </div>
          </>
        )}
      </div>

      {/* Column headers */}
      <div
        className={styles.agentDetailRow}
        style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600 }}
      >
        <span>Agent</span>
        <span style={{ textAlign: "center" }}>Status</span>
        <span style={{ textAlign: "center" }}>Duration</span>
        <span style={{ textAlign: "center" }}>Items</span>
        <span style={{ textAlign: "center" }}>Tasks</span>
        <span style={{ textAlign: "center" }}>Esc.</span>
        <span>Notes</span>
      </div>

      {/* Agent rows */}
      <div className={styles.agentDetailList}>
        {totalRows.map((agent) => {
          const isPending = agent.status === "pending";
          const isRunning = agent.status === "running";
          const isDone = agent.status === "done";
          const isError = agent.status === "error";

          const cellClass = isDone
            ? styles.agentDetailCellDone
            : isError
            ? styles.agentDetailCellError
            : isRunning
            ? styles.agentDetailCellRunning
            : styles.agentDetailCellSkipped;

          const statusLabel = isPending
            ? "Pending"
            : isRunning
            ? "Running"
            : isDone
            ? "Done"
            : isError
            ? "Error"
            : agent.status;

          const escalations = agent.escalations?.length ?? 0;
          const errors = agent.errors ?? [];
          const items = agent.itemsProcessed ?? 0;
          const tasks = agent.tasksGenerated ?? 0;

          return (
            <div
              key={agent.agentId}
              className={`${styles.agentDetailRow} ${isRunning ? styles.agentDetailRowLive : ""}`}
            >
              <div className={styles.agentDetailName}>
                <span className={styles.agentDetailNameIcon}>{AGENT_ICONS[agent.agentId] ?? "🤖"}</span>
                {AGENT_LABELS[agent.agentId] ?? agent.agentId}
              </div>

              <div className={styles.agentDetailCell}>
                <span className={`${styles.agentDetailStatusBadge} ${
                  isPending
                    ? styles.statusIdle
                    : isRunning
                    ? styles.statusRunning
                    : isError
                    ? styles.statusError
                    : isDone
                    ? styles.statusDone
                    : styles.statusIdle
                }`}>
                  {statusLabel}
                </span>
              </div>

              <span className={`${styles.agentDetailCell} ${cellClass}`}>
                {agent.durationMs != null ? formatDuration(agent.durationMs) : "—"}
              </span>
              <span className={`${styles.agentDetailCell} ${cellClass}`}>
                {isPending ? "—" : items.toLocaleString()}
              </span>
              <span className={`${styles.agentDetailCell} ${cellClass}`}>
                {isPending ? "—" : tasks.toLocaleString()}
              </span>
              <span className={`${styles.agentDetailCell} ${escalations > 0 ? styles.agentDetailCellRunning : cellClass}`}>
                {escalations > 0 ? `${escalations}` : "—"}
              </span>

              {/* Notes */}
              <div>
                {errors.length > 0 && (
                  <div className={styles.agentDetailErrors}>
                    <span>⚠️</span>
                    <span>{errors[0]}</span>
                  </div>
                )}
                {escalations > 0 && errors.length === 0 && (
                  <div className={styles.agentDetailEscalations}>
                    <span>⚡</span>
                    <span>{agent.escalations![0]}</span>
                  </div>
                )}
                {isPending && (
                  <span className={styles.agentDetailCell} style={{ color: "var(--color-text-muted)", fontSize: "0.73rem" }}>
                    Waiting in queue…
                  </span>
                )}
                {isRunning && !errors.length && escalations === 0 && (
                  <span className={styles.agentDetailCell} style={{ color: "var(--color-accent-dark)", fontSize: "0.73rem" }}>
                    Processing…
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<"ALL" | "UK" | "HK">("ALL");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatchRunning, setDispatchRunning] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<DispatcherResult | null>(null);
  const [liveAgents, setLiveAgents] = useState<LiveAgentRow[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addToast = useCallback((type: Toast["type"], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Persist agent runs to localStorage ───────────────────────────────────

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed: AgentRun[] = JSON.parse(stored);
        if (Array.isArray(parsed)) setAgentRuns(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (agentRuns.length > 0) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(agentRuns.slice(0, 20)));
      } catch {
        // ignore
      }
    }
  }, [agentRuns]);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    let wasOnline = false;
    try {
      const [prods, ords] = await Promise.all([fetchProducts(), fetchOrders()]);
      setActivities(buildActivityFeed(prods, ords));
      setStats(computeStats(prods, ords));
      setApiOnline(true);
      wasOnline = true;
    } catch {
      setApiOnline(false);
      if (showRefresh) {
        addToast("error", "API Unreachable", "Could not connect to the CLOTH API. Showing cached data.");
      }
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
    if (showRefresh && wasOnline) {
      addToast("success", "Data Refreshed", "Dashboard data has been updated.");
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
    // Check API health
    fetch("http://localhost:3001/api/health", { signal: AbortSignal.timeout(2000) })
      .then((r) => r.json())
      .then(() => setApiOnline(true))
      .catch(() => {
        setApiOnline(false);
        addToast("error", "API Offline", "The CLOTH API is unreachable. Some data may be stale.");
      });
  }, [loadData, addToast]);

  const filteredActivities = selectedMarket === "ALL"
    ? activities
    : activities.filter((a) => a.market === selectedMarket);

  // ─── Run agents ─────────────────────────────────────────────────────────────

  const runAgents = useCallback(async () => {
    setDispatchRunning(true);
    setDispatchResult(null);
    setLiveAgents(
      ALL_AGENT_IDS.map((id) => ({ agentId: id, status: "pending" as const }))
    );
    setDrawerOpen(true);

    // Simulate live progress: each agent ticks in sequence
    let tickIndex = 0;
    const tickInterval = setInterval(() => {
      setLiveAgents((prev) =>
        prev.map((a, i) => {
          if (i < tickIndex) return { ...a, status: "done" as const, durationMs: 500 + i * 200 };
          if (i === tickIndex) return { ...a, status: "running" as const };
          return a;
        })
      );
      tickIndex++;
      if (tickIndex >= ALL_AGENT_IDS.length) clearInterval(tickInterval);
    }, 800);

    try {
      const { runDispatcher } = await import("../../agent-tasks/dispatcher.js");
      const result = await runDispatcher({
        markets: selectedMarket === "ALL" ? undefined : [selectedMarket],
      });

      clearInterval(tickInterval);

      const run: AgentRun = {
        id: result.runId,
        agentId: "dispatcher",
        agentTitle: "Dispatcher — All Agents",
        market: (selectedMarket as any) || "ALL",
        status: result.summary.marketsFailed.length === 0 ? "done" : "error",
        startedAt: result.triggeredAt,
        completedAt: result.completedAt ?? new Date().toISOString(),
        durationMs: result.totalDurationMs,
        itemsProcessed: result.summary.totalItemsProcessed,
        tasksGenerated: result.summary.totalTasksGenerated,
        escalations: result.agents.flatMap((a) => a.escalations ?? []).slice(0, 3),
        errors: result.summary.marketsFailed.length > 0
          ? [`Markets failed: ${result.summary.marketsFailed.join(", ")}`]
          : [],
        summary: `${result.agents.length} agents ran across ${result.markets.join(", ")}`,
      };

      setAgentRuns((prev) => [run, ...prev].slice(0, 20));
      setDispatchResult(result);
      setLiveAgents(
        result.agents.map((a) => ({
          agentId: a.agentId,
          status: a.status as LiveAgentRow["status"],
          durationMs: a.durationMs,
          itemsProcessed: a.itemsProcessed,
          tasksGenerated: a.tasksGenerated,
          escalations: a.escalations,
          errors: a.errors,
        }))
      );

      if (result.summary.marketsFailed.length > 0) {
        addToast(
          "error",
          "Agent Run — Partial Failure",
          `${result.summary.marketsFailed.join(", ")} failed. ${result.summary.totalTasksGenerated} tasks generated.`
        );
      } else {
        addToast(
          "success",
          "Agent Run Complete",
          `${result.agents.length} agents · ${result.summary.totalItemsProcessed} items · ${result.summary.totalTasksGenerated} tasks · ${result.markets.join(", ")}`
        );
      }

      await loadData();
    } catch (err) {
      clearInterval(tickInterval);
      const msg = err instanceof Error ? err.message : String(err);
      setDispatchResult(null);
      setLiveAgents([]);
      addToast("error", "Agent Run Failed", msg);
    } finally {
      setDispatchRunning(false);
    }
  }, [selectedMarket, loadData, addToast]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.dashboard}>
      {/* ── Toast Container ────────────────────────────────────────────────── */}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoMark}>CLOTH</div>
          <div className={styles.logoSub}>CONTROL CENTER</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.marketTabs}>
            {(["ALL", "UK", "HK"] as const).map((m) => (
              <button
                key={m}
                className={`${styles.marketTab} ${selectedMarket === m ? styles.marketTabActive : ""}`}
                onClick={() => setSelectedMarket(m)}
              >
                {m === "ALL" ? "🌐 All Markets" : m === "UK" ? "🇬🇧 UK" : "🇭🇰 HK"}
              </button>
            ))}
          </div>
          <div className={`${styles.apiStatus} ${apiOnline === true ? styles.apiOnline : apiOnline === false ? styles.apiOffline : ""}`}>
            <span className={styles.apiDot} />
            {apiOnline === null ? "—" : apiOnline ? "API Online" : "API Offline"}
          </div>
          <button
            className={`${styles.refreshBtn} ${refreshing ? styles.refreshing : ""}`}
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshIcon />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── Section: Stats ──────────────────────────────────────────────── */}
        <section className={styles.statsGrid}>
          <StatsCard
            label="Total Products"
            value={stats?.totalProducts ?? "—"}
            icon={<BagIcon />}
            accentColor="var(--color-accent)"
            loading={loading}
          />
          <StatsCard
            label="Active Listings"
            value={stats?.activeListings ?? "—"}
            icon={<TagIcon />}
            accentColor="#2c5282"
            loading={loading}
          />
          <StatsCard
            label="Sold Items"
            value={stats?.soldItems ?? "—"}
            icon={<BoxIcon />}
            accentColor="var(--color-success)"
            loading={loading}
          />
          <StatsCard
            label="Total GMV"
            value={stats ? formatCurrency(stats.totalGMV, stats.gmvCurrency) : "—"}
            icon={<CurrencyIcon />}
            accentColor="#7c3aed"
            loading={loading}
          />
          <StatsCard
            label="Pending Orders"
            value={stats?.pendingOrders ?? "—"}
            icon={<OrderIcon />}
            accentColor="#c9a96e"
            loading={loading}
          />
          <StatsCard
            label="Completed Orders"
            value={stats?.completedOrders ?? "—"}
            icon={<OrderIcon />}
            accentColor="var(--color-success)"
            loading={loading}
          />
        </section>

        {/* ── Section: Market Comparison ──────────────────────────────────── */}
        <MarketComparison stats={stats} />

        {/* ── Section: Quick Actions ──────────────────────────────────────── */}
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionHeading}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.actionBtn} onClick={() => window.location.href = "/admin?tab=add-product"}>
              <span className={styles.actionIcon}><PlusIcon /></span>
              <span className={styles.actionLabel}>Add Product</span>
              <span className={styles.actionDesc}>List a new item for sale</span>
            </button>

            {/* Run Sourcing Agent — with live progress UI */}
            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={runAgents}
              disabled={dispatchRunning}
            >
              {dispatchRunning ? (
                <div className={styles.dispatchProgress}>
                  <div className={styles.dispatchProgressHeader}>
                    <span className={styles.dispatchProgressSpinner} />
                    <span className={styles.dispatchProgressLabel}>Running Agents…</span>
                  </div>
                  <span className={styles.dispatchProgressSub}>
                    {liveAgents.length > 0
                      ? `${liveAgents.filter((a) => a.status === "done").length}/{liveAgents.length} agents done`
                      : "Initialising…"}
                  </span>
                  <div className={styles.dispatchProgressBar}>
                    <div
                      className={styles.dispatchProgressBarFill}
                      style={{
                        width: liveAgents.length > 0
                          ? `${(liveAgents.filter((a) => a.status === "done").length / liveAgents.length) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <span className={styles.actionIcon}><RobotIcon /></span>
                  <span className={styles.actionLabel}>Run Sourcing Agent</span>
                  <span className={styles.actionDesc}>Score leads and build buy queue</span>
                </>
              )}
            </button>

            <button className={styles.actionBtn} onClick={() => window.location.href = "/products"}>
              <span className={styles.actionIcon}><BagIcon /></span>
              <span className={styles.actionLabel}>View Listings</span>
              <span className={styles.actionDesc}>Manage active listings</span>
            </button>
            <button className={styles.actionBtn} onClick={() => window.location.href = "/orders"}>
              <span className={styles.actionIcon}><OrderIcon /></span>
              <span className={styles.actionLabel}>Orders</span>
              <span className={styles.actionDesc}>{stats?.pendingOrders ?? 0} pending shipments</span>
            </button>
          </div>

          {/* Agent Detail Drawer — slides in when dispatch starts or result exists */}
          {(dispatchRunning || dispatchResult || liveAgents.length > 0) && (
            <AgentDetailDrawer
              result={dispatchResult}
              liveAgents={liveAgents}
              isRunning={dispatchRunning}
            />
          )}
        </section>

        {/* ── Section: Activity + Agent Status ───────────────────────────── */}
        <section className={styles.feedGrid}>
          <ActivityFeed items={filteredActivities} loading={loading} />
          <AgentStatus runs={agentRuns} loading={false} onRunAgents={runAgents} dispatchRunning={dispatchRunning} />
        </section>
      </main>
    </div>
  );
}
