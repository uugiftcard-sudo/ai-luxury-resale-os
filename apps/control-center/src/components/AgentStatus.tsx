import React from "react";
import type { AgentRun } from "../types/dashboard.js";
import styles from "../Dashboard.module.css";

interface AgentStatusProps {
  runs: AgentRun[];
  loading?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  done: "Completed",
  running: "Running",
  error: "Error",
  idle: "Idle",
  skipped: "Skipped",
};

const STATUS_CLASSES: Record<string, string> = {
  done: styles.statusDone,
  running: styles.statusRunning,
  error: styles.statusError,
  idle: styles.statusIdle,
  skipped: styles.statusSkipped,
};

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export default function AgentStatus({ runs, loading = false }: AgentStatusProps) {
  if (loading) {
    return (
      <div className={styles.agentStatus}>
        <div className={styles.agentHeader}>
          <h3 className={styles.sectionTitle}>Agent Runs</h3>
        </div>
        <div className={styles.agentList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.agentItemSkeleton}>
              <div className={`${styles.skeletonBox} ${styles.skeletonLine}`} />
              <div className={`${styles.skeletonBox} ${styles.skeletonLineShort}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!runs.length) {
    return (
      <div className={styles.agentStatus}>
        <div className={styles.agentHeader}>
          <h3 className={styles.sectionTitle}>Agent Runs</h3>
        </div>
        <div className={styles.agentEmpty}>
          <span className={styles.agentEmptyIcon}>🤖</span>
          <p>No agent runs yet</p>
          <p className={styles.agentEmptyHint}>Run the dispatcher to see agent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.agentStatus}>
      <div className={styles.agentHeader}>
        <h3 className={styles.sectionTitle}>Agent Runs</h3>
        <span className={styles.agentCount}>{runs.length} runs</span>
      </div>
      <div className={styles.agentList}>
        {runs.map((run) => {
          const statusClass = STATUS_CLASSES[run.status] ?? styles.statusIdle;
          const statusLabel = STATUS_LABELS[run.status] ?? run.status;

          return (
            <div key={run.id} className={styles.agentItem}>
              <div className={styles.agentItemTop}>
                <div className={styles.agentInfo}>
                  <span className={styles.agentTitle}>{run.agentTitle}</span>
                  {run.market && (
                    <span className={styles.marketBadge} data-market={run.market}>
                      {run.market}
                    </span>
                  )}
                </div>
                <div className={`${styles.agentStatusBadge} ${statusClass}`}>
                  {statusLabel}
                </div>
              </div>

              {run.summary && (
                <div className={styles.agentSummary}>{run.summary}</div>
              )}

              <div className={styles.agentMeta}>
                <span className={styles.agentTime}>
                  {new Date(run.startedAt).toLocaleTimeString()}
                </span>
                {run.durationMs != null && (
                  <span className={styles.agentDuration}>
                    {formatDuration(run.durationMs)}
                  </span>
                )}
                {run.itemsProcessed != null && run.itemsProcessed > 0 && (
                  <span className={styles.agentMetric}>
                    {run.itemsProcessed} items
                  </span>
                )}
                {run.tasksGenerated != null && run.tasksGenerated > 0 && (
                  <span className={styles.agentMetric}>
                    {run.tasksGenerated} tasks
                  </span>
                )}
              </div>

              {(run.escalations?.length ?? 0) > 0 && (
                <div className={styles.escalationBanner}>
                  <span className={styles.escalationIcon}>⚠️</span>
                  {run.escalations!.length} escalation{run.escalations!.length !== 1 ? "s" : ""}
                </div>
              )}

              {(run.errors?.length ?? 0) > 0 && (
                <div className={styles.errorBanner}>
                  <span className={styles.errorIcon}>❌</span>
                  {run.errors![0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
