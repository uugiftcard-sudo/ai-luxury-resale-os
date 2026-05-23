import React from "react";
import type { ActivityItem, ActivityType } from "../types/dashboard.js";
import styles from "../../Dashboard.module.css";

interface ActivityFeedProps {
  items: ActivityItem[];
  loading?: boolean;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  new_listing: "🆕",
  sale: "💰",
  order_shipped: "📦",
  order_completed: "✅",
  order_created: "📋",
  price_updated: "🏷️",
  product_sold: "🎉",
  agent_run: "🤖",
  risk_alert: "⚠️",
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  new_listing: "#2c5282",
  sale: "#4a7c59",
  order_shipped: "#c9a96e",
  order_completed: "#276749",
  order_created: "#2c5282",
  price_updated: "#6b6560",
  product_sold: "#4a7c59",
  agent_run: "#7c3aed",
  risk_alert: "#c0392b",
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={styles.activityFeed}>
        <div className={styles.feedHeader}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
        </div>
        <div className={styles.feedList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.feedItemSkeleton}>
              <div className={`${styles.skeletonBox} ${styles.skeletonCircle}`} />
              <div className={styles.feedItemTextSkeleton}>
                <div className={`${styles.skeletonBox} ${styles.skeletonLine}`} />
                <div className={`${styles.skeletonBox} ${styles.skeletonLineShort}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.activityFeed}>
        <div className={styles.feedHeader}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
        </div>
        <div className={styles.feedEmpty}>
          <span className={styles.feedEmptyIcon}>📭</span>
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activityFeed}>
      <div className={styles.feedHeader}>
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <span className={styles.feedCount}>{items.length} events</span>
      </div>
      <div className={styles.feedList}>
        {items.map((item) => {
          const color = ACTIVITY_COLORS[item.type] ?? "#6b6560";
          const icon = ACTIVITY_ICONS[item.type] ?? "📌";
          return (
            <div key={item.id} className={styles.feedItem}>
              <div
                className={styles.feedDot}
                style={{ background: color }}
                title={item.type}
              >
                <span className={styles.feedEmoji}>{icon}</span>
              </div>
              <div className={styles.feedContent}>
                <div className={styles.feedTitle}>{item.title}</div>
                <div className={styles.feedMeta}>
                  {item.description && (
                    <span className={styles.feedDescription}>{item.description}</span>
                  )}
                  {item.market && (
                    <span
                      className={styles.marketBadge}
                      data-market={item.market}
                    >
                      {item.market}
                    </span>
                  )}
                  <span className={styles.feedTime}>{timeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
