/**
 * MarketSyncPanel Component
 * Multi-select control for syncing products across UK/HK/CN markets.
 * Shows in the admin product management page.
 */
import { useState } from 'react';
import { inventorySyncApi } from '../api/inventorySync';
import { useToast } from '../hooks/useToast';
import type { MarketSyncEntry } from '../types';
import styles from './MarketSyncPanel.module.css';

interface MarketSyncPanelProps {
  productId: string;
  currentSync?: MarketSyncEntry[];
  currentMarket?: string;
  onSyncUpdate?: (updated: MarketSyncEntry[]) => void;
  /** Show compact version inline in table row */
  compact?: boolean;
}

const MARKET_LABELS: Record<string, string> = {
  UK: '🇬🇧 UK',
  HK: '🇭🇰 HK',
  CN: '🇨🇳 CN',
};

const MARKET_CURRENCIES: Record<string, string> = {
  UK: '£',
  HK: 'HK$',
  CN: '¥',
};

const COPY: Record<string, Record<string, string>> = {
  UK: {
    title: 'Sync to Markets',
    syncing: 'Syncing...',
    synced: 'Synced',
    pending: 'Pending',
    error: 'Error',
    notSynced: 'Not listed',
    stock: 'Stock',
    price: 'Price',
    lastSync: 'Last sync',
    save: 'Save',
    cancel: 'Cancel',
  },
  HK: {
    title: '同步到市場',
    syncing: '同步中...',
    synced: '已同步',
    pending: '待同步',
    error: '錯誤',
    notSynced: '未上架',
    stock: '庫存',
    price: '價格',
    lastSync: '上次同步',
    save: '儲存',
    cancel: '取消',
  },
  CN: {
    title: '同步到市场',
    syncing: '同步中...',
    synced: '已同步',
    pending: '待同步',
    error: '错误',
    notSynced: '未上架',
    stock: '库存',
    price: '价格',
    lastSync: '上次同步',
    save: '保存',
    cancel: '取消',
  },
};

export default function MarketSyncPanel({
  productId,
  currentSync = [],
  currentMarket,
  onSyncUpdate,
  compact = false,
}: MarketSyncPanelProps) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const m of ['UK', 'HK', 'CN']) {
      const entry = currentSync.find(e => e.market === m);
      initial[m] = Boolean(entry);
    }
    return initial;
  });

  const t = COPY[currentMarket || 'CN'] ?? COPY.CN;

  async function handleSave() {
    setSaving(true);
    try {
      const markets = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k as 'UK' | 'HK' | 'CN');

      if (markets.length === 0) {
        showToast('请至少选择一个市场', 'error');
        setSaving(false);
        return;
      }

      const updated = await inventorySyncApi.updateMarketSync(productId, markets);
      showToast(t.synced, 'success');
      setOpen(false);
      if (onSyncUpdate && updated && typeof updated === 'object' && 'marketSync' in updated) {
        onSyncUpdate((updated as { marketSync: MarketSyncEntry[] }).marketSync);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '同步失败', 'error');
    } finally {
      setSaving(false);
    }
  }

  const markets = ['UK', 'HK', 'CN'] as const;

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <div className={styles.compactMarkets}>
          {markets.map(m => {
            const entry = currentSync.find(e => e.market === m);
            const isActive = Boolean(entry);
            return (
              <span
                key={m}
                className={`${styles.marketChip} ${isActive ? styles.chipActive : styles.chipInactive}`}
                title={`${MARKET_LABELS[m]}: ${isActive ? 'Active' : 'Not listed'}`}
              >
                {m}
              </span>
            );
          })}
        </div>
        <button
          className={styles.editBtn}
          onClick={() => setOpen(true)}
          title={t.title}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        {open && (
          <div className={styles.compactDropdown} onClick={e => e.stopPropagation()}>
            <div className={styles.dropdownTitle}>{t.title}</div>
            {markets.map(m => (
              <label key={m} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selected[m]}
                  onChange={e => setSelected(s => ({ ...s, [m]: e.target.checked }))}
                />
                <span className={styles.marketLabel}>{MARKET_LABELS[m]}</span>
                {currentSync.find(e => e.market === m) && (
                  <span className={styles.syncStatus}>
                    {MARKET_CURRENCIES[m]}{currentSync.find(e => e.market === m)?.syncedPrice ?? '—'}
                  </span>
                )}
              </label>
            ))}
            <div className={styles.dropdownActions}>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>{t.cancel}</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? t.syncing : t.save}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        className={styles.syncButton}
        onClick={() => setOpen(true)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {t.title}
      </button>

      {open && (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t.title}</h3>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.hint}>选择商品要在哪些市场上架。库存将在各市场同步更新。</p>

              <div className={styles.marketList}>
                {markets.map(m => {
                  const entry = currentSync.find(e => e.market === m);
                  const isActive = Boolean(entry);
                  return (
                    <div key={m} className={`${styles.marketRow} ${isActive ? styles.rowActive : ''}`}>
                      <label className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={selected[m]}
                          onChange={e => setSelected(s => ({ ...s, [m]: e.target.checked }))}
                        />
                        <span className={styles.marketLabel}>{MARKET_LABELS[m]}</span>
                      </label>
                      {entry && (
                        <div className={styles.syncInfo}>
                          <span className={`${styles.syncBadge} ${styles[`badge_${entry.status}`]}`}>
                            {t[entry.status as keyof typeof t] || entry.status}
                          </span>
                          <span className={styles.syncPrice}>
                            {MARKET_CURRENCIES[m]}{entry.syncedPrice ?? '—'}
                          </span>
                          {entry.lastSynced && (
                            <span className={styles.syncTime}>
                              {t.lastSync}: {new Date(entry.lastSynced).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      {!entry && (
                        <span className={styles.notSynced}>{t.notSynced}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? t.syncing : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
