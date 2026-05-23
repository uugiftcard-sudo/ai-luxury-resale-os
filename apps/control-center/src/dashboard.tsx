import React, { useEffect, useState, useCallback } from "react";
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  if (currency === "GBP") return `£${amount.toLocaleString()}`;
  return `HK$${amount.toLocaleString()}`;
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
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [prods, ords] = await Promise.all([fetchProducts(), fetchOrders()]);
      setActivities(buildActivityFeed(prods, ords));
      setStats(computeStats(prods, ords));
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Check API health
    fetch("http://localhost:3001/api/health", { signal: AbortSignal.timeout(2000) })
      .then((r) => r.json())
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, [loadData]);

  const filteredActivities = selectedMarket === "ALL"
    ? activities
    : activities.filter((a) => a.market === selectedMarket);

  const runAgents = useCallback(async () => {
    setDispatchRunning(true);
    setDispatchResult(null);
    try {
      // Call the dispatcher via the agent-tasks module (runs in-process for now)
      const { runDispatcher } = await import("../../agent-tasks/dispatcher.js");
      const result = await runDispatcher({ markets: selectedMarket === "ALL" ? undefined : [selectedMarket] as any });
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
      setAgentRuns((prev) => [run, ...prev].slice(0, 10));
      setDispatchResult(`✓ ${result.agents.length} agents completed in ${result.markets.join(", ")}`);
      await loadData();
    } catch (err) {
      setDispatchResult(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDispatchRunning(false);
    }
  }, [selectedMarket, loadData]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.dashboard}>
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

        {/* ── Section: Quick Actions ──────────────────────────────────────── */}
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionHeading}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.actionBtn} onClick={() => window.location.href = "/admin?tab=add-product"}>
              <span className={styles.actionIcon}><PlusIcon /></span>
              <span className={styles.actionLabel}>Add Product</span>
              <span className={styles.actionDesc}>List a new item for sale</span>
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={runAgents}
              disabled={dispatchRunning}
            >
              <span className={styles.actionIcon}><RobotIcon /></span>
              <span className={styles.actionLabel}>
                {dispatchRunning ? "Running Agents..." : "Run Sourcing Agent"}
              </span>
              <span className={styles.actionDesc}>Score leads and build buy queue</span>
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
          {dispatchResult && (
            <div className={styles.dispatchResult}>
              {dispatchResult}
            </div>
          )}
        </section>

        {/* ── Section: Activity + Agent Status ───────────────────────────── */}
        <section className={styles.feedGrid}>
          <ActivityFeed items={filteredActivities} loading={loading} />
          <AgentStatus runs={agentRuns} loading={false} />
        </section>
      </main>
    </div>
  );
}
