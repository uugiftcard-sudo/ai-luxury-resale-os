/**
 * Inventory — 倉儲記錄頁面
 * Shows inventory list, stats, stock alerts, inbound/outbound records.
 * Routes: /inventory, /hk/inventory, /cn/inventory
 */
import { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useInventory } from '../contexts/InventoryContext';
import type { InventoryTransactionType } from '../types/warehouse';
import styles from './Inventory.module.css';

const COPY: Record<string, {
  pageTitle: string;
  tabs: { list: string; inbound: string; outbound: string; alerts: string };
  table: { sku: string; name: string; brand: string; stock: string; location: string; status: string; actions: string; };
  stats: { totalSKUs: string; totalStock: string; lowStock: string; outOfStock: string; totalValue: string; };
  inbound: { title: string; productName: string; quantity: string; referenceNo: string; notes: string; operator: string; submit: string; success: string; };
  outbound: { title: string; selectItem: string; quantity: string; referenceNo: string; notes: string; operator: string; submit: string; success: string; };
  txType: Record<InventoryTransactionType, string>;
  stockStatus: { inStock: string; lowStock: string; outOfStock: string; };
  addItem: { title: string; submit: string; success: string; };
  empty: string;
  loading: string;
}> = {
  UK: {
    pageTitle: 'Warehouse Records',
    tabs: { list: 'Inventory List', inbound: 'Stock In', outbound: 'Stock Out', alerts: 'Stock Alerts' },
    table: { sku: 'SKU', name: 'Product Name', brand: 'Brand', stock: 'Stock', location: 'Location', status: 'Status', actions: 'Actions' },
    stats: { totalSKUs: 'Total SKUs', totalStock: 'Total Units', lowStock: 'Low Stock', outOfStock: 'Out of Stock', totalValue: 'Total Value' },
    inbound: { title: 'Record Stock In', productName: 'Product Name', quantity: 'Quantity', referenceNo: 'Reference No. (optional)', notes: 'Notes', operator: 'Operator', submit: 'Record In', success: 'Stock in recorded successfully!' },
    outbound: { title: 'Record Stock Out', selectItem: 'Select Item', quantity: 'Quantity', referenceNo: 'Reference No. (optional)', notes: 'Notes', operator: 'Operator', submit: 'Record Out', success: 'Stock out recorded successfully!' },
    txType: { inbound: 'Stock In', outbound: 'Stock Out', adjustment: 'Adjustment', return: 'Return' },
    stockStatus: { inStock: 'In Stock', lowStock: 'Low Stock', outOfStock: 'Out of Stock' },
    addItem: { title: 'Add Inventory Item', submit: 'Add Item', success: 'Item added successfully!' },
    empty: 'No records found.',
    loading: 'Loading...',
  },
  HK: {
    pageTitle: '倉庫記錄',
    tabs: { list: '庫存列表', inbound: '入庫記錄', outbound: '出庫記錄', alerts: '庫存預警' },
    table: { sku: 'SKU', name: '商品名稱', brand: '品牌', stock: '庫存', location: '存放位置', status: '狀態', actions: '操作' },
    stats: { totalSKUs: '總 SKU', totalStock: '總數量', lowStock: '低庫存預警', outOfStock: '缺貨', totalValue: '總價值' },
    inbound: { title: '記錄入庫', productName: '商品名稱', quantity: '數量', referenceNo: '關聯單號（選填）', notes: '備註', operator: '操作人', submit: '確認入庫', success: '入庫記錄成功！' },
    outbound: { title: '記錄出庫', selectItem: '選擇商品', quantity: '數量', referenceNo: '關聯單號（選填）', notes: '備註', operator: '操作人', submit: '確認出庫', success: '出庫記錄成功！' },
    txType: { inbound: '入庫', outbound: '出庫', adjustment: '調整', return: '退貨入庫' },
    stockStatus: { inStock: '有庫存', lowStock: '低庫存', outOfStock: '缺貨' },
    addItem: { title: '新增庫存商品', submit: '新增商品', success: '商品已新增！' },
    empty: '暫無記錄。',
    loading: '加載中...',
  },
  CN: {
    pageTitle: '仓储记录',
    tabs: { list: '库存列表', inbound: '入库记录', outbound: '出库记录', alerts: '库存预警' },
    table: { sku: 'SKU', name: '商品名称', brand: '品牌', stock: '库存', location: '存放位置', status: '状态', actions: '操作' },
    stats: { totalSKUs: '总 SKU', totalStock: '总数量', lowStock: '低库存预警', outOfStock: '缺货', totalValue: '总价值' },
    inbound: { title: '记录入库', productName: '商品名称', quantity: '数量', referenceNo: '关联单号（选填）', notes: '备注', operator: '操作人', submit: '确认入库', success: '入库记录成功！' },
    outbound: { title: '记录出库', selectItem: '选择商品', quantity: '数量', referenceNo: '关联单号（选填）', notes: '备注', operator: '操作人', submit: '确认出库', success: '出库记录成功！' },
    txType: { inbound: '入库', outbound: '出库', adjustment: '调整', return: '退货入库' },
    stockStatus: { inStock: '有库存', lowStock: '低库存', outOfStock: '缺货' },
    addItem: { title: '新增库存商品', submit: '新增商品', success: '商品已新增！' },
    empty: '暂无记录。',
    loading: '加载中...',
  },
};

type Tab = 'list' | 'inbound' | 'outbound' | 'alerts';

function StockStatusBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return <span className={`${styles.stockBadge} ${styles.out}`}>缺货</span>;
  if (stock <= threshold) return <span className={`${styles.stockBadge} ${styles.low}`}>低库存</span>;
  return <span className={`${styles.stockBadge} ${styles.ok}`}>有货</span>;
}

function formatCurrency(val: number, market: string) {
  if (market === 'UK') return `£${(val * 0.11).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`;
  if (market === 'HK') return `HK$${(val * 1.32).toLocaleString('en-HK', { minimumFractionDigits: 0 })}`;
  return `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}`;
}

// ── Inbound Form ───────────────────────────────────────────────────────────────
function InboundForm({ t, onSuccess }: { t: typeof COPY.CN; onSuccess: () => void }) {
  const { inbound } = useInventory();
  const [form, setForm] = useState({ productName: '', quantity: 1, referenceNo: '', notes: '', operator: '', unitCost: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inbound({ productName: form.productName, quantity: form.quantity, referenceNo: form.referenceNo, notes: form.notes, operator: form.operator, unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined });
      setSuccess(true);
      setForm({ productName: '', quantity: 1, referenceNo: '', notes: '', operator: '', unitCost: '' });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>{t.inbound.title}</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.inbound.productName} *</label>
          <input className={styles.input} value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.inbound.quantity} *</label>
          <input type="number" className={styles.input} min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.inbound.referenceNo}</label>
          <input className={styles.input} value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.inbound.operator}</label>
          <input className={styles.input} value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>{t.inbound.notes}</label>
          <input className={styles.input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      {success && <div className={styles.successBanner}>{t.inbound.success}</div>}
      <button type="submit" className={styles.btnPrimary} disabled={submitting}>{submitting ? '...' : t.inbound.submit}</button>
    </form>
  );
}

// ── Outbound Form ──────────────────────────────────────────────────────────────
function OutboundForm({ t, onSuccess }: { t: typeof COPY.CN; onSuccess: () => void }) {
  const { items, outbound } = useInventory();
  const [form, setForm] = useState({ inventoryId: '', quantity: 1, referenceNo: '', notes: '', operator: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.inventoryId) { setError('请选择商品'); return; }
    const item = items.find(i => i.id === form.inventoryId);
    if (item && form.quantity > item.currentStock) { setError('出库数量不能超过当前库存'); return; }
    setSubmitting(true);
    setError('');
    try {
      await outbound({ inventoryId: form.inventoryId, quantity: form.quantity, referenceNo: form.referenceNo, notes: form.notes, operator: form.operator });
      setSuccess(true);
      setForm({ inventoryId: '', quantity: 1, referenceNo: '', notes: '', operator: '' });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>{t.outbound.title}</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.outbound.selectItem} *</label>
          <select className={styles.select} value={form.inventoryId} onChange={e => setForm(f => ({ ...f, inventoryId: e.target.value }))} required>
            <option value="">-- {t.outbound.selectItem} --</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.productName} (库存: {i.currentStock})</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.outbound.quantity} *</label>
          <input type="number" className={styles.input} min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.outbound.referenceNo}</label>
          <input className={styles.input} value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t.outbound.operator}</label>
          <input className={styles.input} value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>{t.outbound.notes}</label>
          <input className={styles.input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>{t.outbound.success}</div>}
      <button type="submit" className={styles.btnPrimary} disabled={submitting}>{submitting ? '...' : t.outbound.submit}</button>
    </form>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────
/** Local demo banner */
function DemoBanner() {
  return (
    <div className={styles.demoBanner}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>此頁面為瀏覽器本地演示（localStorage），數據不會同步至服務器。如需正式功能，請聯絡管理員。</span>
    </div>
  );
}

export default function Inventory() {
  const { market } = useMarket();
  const t = COPY[market] ?? COPY.CN;
  const { items, transactions, stats, loading } = useInventory();
  const [tab, setTab] = useState<Tab>('list');
  const [search, setSearch] = useState('');

  const lowStockItems = items.filter(i => i.currentStock > 0 && i.currentStock <= i.minStockThreshold);
  const outOfStockItems = items.filter(i => i.currentStock === 0);

  const filteredItems = items.filter(i =>
    !search || i.productName.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    (i.brand ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{t.pageTitle}</h1>
      </div>

      <div className={styles.container}>
        <DemoBanner />

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalSKUs}</div>
            <div className={styles.statLabel}>{t.stats.totalSKUs}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalStock}</div>
            <div className={styles.statLabel}>{t.stats.totalStock}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statWarn}`}>
            <div className={styles.statValue}>{stats.lowStockCount}</div>
            <div className={styles.statLabel}>{t.stats.lowStock}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statDanger}`}>
            <div className={styles.statValue}>{stats.outOfStockCount}</div>
            <div className={styles.statLabel}>{t.stats.outOfStock}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatCurrency(stats.totalValue, market)}</div>
            <div className={styles.statLabel}>{t.stats.totalValue}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['list', 'inbound', 'outbound', 'alerts'] as Tab[]).map(key => (
            <button key={key} className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`} onClick={() => setTab(key)}>
              {t.tabs[key]}
            </button>
          ))}
        </div>

        {/* Tab: List */}
        {tab === 'list' && (
          <div>
            <div className={styles.toolbar}>
              <input type="search" className={styles.searchInput} placeholder="搜索商品名称、SKU、品牌..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <div className={styles.loading}>{t.loading}</div> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t.table.sku}</th>
                      <th>{t.table.name}</th>
                      <th>{t.table.brand}</th>
                      <th>{t.table.stock}</th>
                      <th>{t.table.location}</th>
                      <th>{t.table.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyCell}>{t.empty}</td></tr>
                    ) : filteredItems.map(item => (
                      <tr key={item.id} className={item.currentStock === 0 ? styles.rowDanger : item.currentStock <= item.minStockThreshold ? styles.rowWarn : ''}>
                        <td className={styles.mono}>{item.sku}</td>
                        <td>{item.productName}</td>
                        <td>{item.brand ?? '—'}</td>
                        <td className={styles.num}>{item.currentStock}</td>
                        <td>{item.location ?? '—'}</td>
                        <td><StockStatusBadge stock={item.currentStock} threshold={item.minStockThreshold} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Inbound */}
        {tab === 'inbound' && (
          <InboundForm t={t} onSuccess={() => setTab('list')} />
        )}

        {/* Tab: Outbound */}
        {tab === 'outbound' && (
          <OutboundForm t={t} onSuccess={() => setTab('list')} />
        )}

        {/* Tab: Alerts */}
        {tab === 'alerts' && (
          <div className={styles.alertsSection}>
            {stats.outOfStockCount > 0 && (
              <div className={styles.alertBlock}>
                <h3 className={styles.alertTitle}>⚠️ {t.stats.outOfStock}</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>{t.table.sku}</th><th>{t.table.name}</th><th>{t.table.stock}</th></tr></thead>
                    <tbody>
                      {outOfStockItems.map(i => <tr key={i.id} className={styles.rowDanger}><td className={styles.mono}>{i.sku}</td><td>{i.productName}</td><td className={styles.num}>0</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {stats.lowStockCount > 0 && (
              <div className={styles.alertBlock}>
                <h3 className={styles.alertTitle}>📦 {t.stats.lowStock}</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>{t.table.sku}</th><th>{t.table.name}</th><th>{t.table.stock}</th><th>阈值</th></tr></thead>
                    <tbody>
                      {lowStockItems.map(i => <tr key={i.id} className={styles.rowWarn}><td className={styles.mono}>{i.sku}</td><td>{i.productName}</td><td className={styles.num}>{i.currentStock}</td><td className={styles.num}>{i.minStockThreshold}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {stats.outOfStockCount === 0 && stats.lowStockCount === 0 && (
              <div className={styles.noAlerts}>🎉 所有商品库存状态正常，无需预警。</div>
            )}

            {/* Transaction history */}
            {transactions.length > 0 && (
              <div className={styles.alertBlock}>
                <h3 className={styles.alertTitle}>📋 最近操作记录</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>时间</th><th>类型</th><th>商品</th><th>数量</th><th>操作人</th><th>备注</th></tr></thead>
                    <tbody>
                      {transactions.slice(0, 20).map(tx => (
                        <tr key={tx.id}>
                          <td className={styles.mono}>{new Date(tx.createdAt).toLocaleString()}</td>
                          <td><span className={`${styles.txBadge} ${tx.type === 'inbound' ? styles.txIn : tx.type === 'outbound' ? styles.txOut : styles.txAdj}`}>{t.txType[tx.type]}</span></td>
                          <td>{tx.productName}</td>
                          <td className={styles.num}>{tx.type === 'outbound' ? `-${tx.quantity}` : `+${tx.quantity}`}</td>
                          <td>{tx.operator ?? '—'}</td>
                          <td>{tx.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
