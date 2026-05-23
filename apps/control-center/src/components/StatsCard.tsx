import React from "react";
import styles from "../../Dashboard.module.css";

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accentColor?: string;
  loading?: boolean;
}

export default function StatsCard({
  label,
  value,
  subValue,
  icon,
  trend,
  trendValue,
  accentColor,
  loading = false,
}: StatsCardProps) {
  return (
    <div className={styles.statsCard}>
      {loading ? (
        <div className={styles.statsCardSkeleton}>
          <div className={`${styles.skeletonBox} ${styles.skeletonIcon}`} />
          <div className={styles.skeletonLines}>
            <div className={`${styles.skeletonBox} ${styles.skeletonLine}`} />
            <div className={`${styles.skeletonBox} ${styles.skeletonLineShort}`} />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.statsCardTop}>
            <div
              className={styles.statsIcon}
              style={accentColor ? { color: accentColor } : undefined}
            >
              {icon}
            </div>
            {trend && trendValue && (
              <span
                className={`${styles.trend} ${
                  trend === "up"
                    ? styles.trendUp
                    : trend === "down"
                    ? styles.trendDown
                    : styles.trendNeutral
                }`}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"} {trendValue}
              </span>
            )}
          </div>
          <div className={styles.statsValue}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className={styles.statsLabel}>{label}</div>
          {subValue && <div className={styles.statsSub}>{subValue}</div>}
        </>
      )}
    </div>
  );
}
