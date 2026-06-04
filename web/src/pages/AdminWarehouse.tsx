/**
 * AdminWarehouse — 倉儲管理員後台
 * Password-protected simple admin panel for inventory management.
 * Routes: /admin/warehouse, /hk/admin/warehouse, /cn/admin/warehouse
 */
import { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import type { InventoryFormData } from '../types/warehouse';
import styles from './AdminWarehouse.module.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_WAREHOUSE_PASSWORD || '';

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

export default function AdminWarehouse() {
  const { items, transactions, stats, createItem, updateItem, inbound, outbound } = useInventory();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'add' | 'inbound' | 'outbound' | 'transactions'>('items');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryFormData>>({});

  useEffect(() => {
    const saved = sessionStorage.getItem('cloth_admin_auth');
    if (saved === 'ok') setAuthenticated(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!ADMIN_PASSWORD) {
      setAuthError('管理員密碼未設定，請先配置 VITE_ADMIN_WAREHOUSE_PASSWORD。');
      return;
    }
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('cloth_admin_auth', 'ok');
      setAuthError('');
    } else {
      setAuthError('密碼錯誤，請重試。');
    }
  }

  if (!authenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>管理員登入</h2>
          <p className={styles.loginSub}>請輸入管理員密碼以訪問倉儲後台。</p>
          <form onSubmit={handleLogin}>
            <input type="password" className={styles.loginInput} placeholder="輸入密碼" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            {authError && <p className={styles.loginError}>{authError}</p>}
            <button type="submit" className={styles.loginBtn}>登入</button>
          </form>
          <p className={styles.loginHint}>請向管理員取得登入密碼。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>倉庫管理後台</h1>
        <p className={styles.heroSub}>管理員視角 — 庫存管理</p>
        <button className={styles.logoutBtn} onClick={() => { setAuthenticated(false); sessionStorage.removeItem('cloth_admin_auth'); }}>登出</button>
      </div>

      <div className={styles.container}>
        <DemoBanner />

        {/* Quick stats */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}><strong>{stats.totalSKUs}</strong><span>總 SKU</span></div>
          <div className={styles.statItem}><strong>{stats.totalStock}</strong><span>總庫存</span></div>
          <div className={`${styles.statItem} ${styles.warn}`}><strong>{stats.lowStockCount}</strong><span>低庫存</span></div>
          <div className={`${styles.statItem} ${styles.danger}`}><strong>{stats.outOfStockCount}</strong><span>缺貨</span></div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['items', 'add', 'inbound', 'outbound', 'transactions'] as const).map(tab => (
            <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab)}>
              {{ items: '商品列表', add: '新增商品', inbound: '入庫', outbound: '出庫', transactions: '操作記錄' }[tab]}
            </button>
          ))}
        </div>

        {/* Items tab */}
        {activeTab === 'items' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th><th>商品名稱</th><th>品牌</th><th>分類</th><th>庫存</th><th>閾值</th><th>存放位置</th><th>成本價</th><th>建議售價</th><th>狀態</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className={styles.mono}>{item.sku}</td>
                    <td>{item.productName}</td>
                    <td>{item.brand ?? '—'}</td>
                    <td>{item.category ?? '—'}</td>
                    <td className={styles.num}>{item.currentStock}</td>
                    <td className={styles.num}>{item.minStockThreshold}</td>
                    <td>{item.location ?? '—'}</td>
                    <td>{item.unitCost ? `¥${item.unitCost.toLocaleString()}` : '—'}</td>
                    <td>{item.unitPrice ? `¥${item.unitPrice.toLocaleString()}` : '—'}</td>
                    <td>
                      {item.currentStock === 0 ? <span className={styles.badgeDanger}>缺貨</span> :
                       item.currentStock <= item.minStockThreshold ? <span className={styles.badgeWarn}>低庫存</span> :
                       <span className={styles.badgeOk}>正常</span>}
                    </td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => { setSelectedItem(item.id); setEditForm(item); setActiveTab('add'); }}>編輯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit tab */}
        {activeTab === 'add' && (
          <AddEditForm
            initial={editForm}
            isEdit={!!selectedItem}
            onSubmit={async (data) => {
              if (selectedItem) {
                await updateItem(selectedItem, data);
              } else {
                await createItem(data as InventoryFormData);
              }
              setSelectedItem(null);
              setEditForm({});
              setActiveTab('items');
            }}
            onCancel={() => { setSelectedItem(null); setEditForm({}); setActiveTab('items'); }}
          />
        )}

        {/* Inbound tab */}
        {activeTab === 'inbound' && (
          <AdminInOutForm
            type="inbound"
            items={items}
            onSubmit={async (data) => {
              await inbound({ productName: data.productName!, quantity: data.quantity, referenceNo: data.referenceNo, notes: data.notes, operator: data.operator });
              setActiveTab('transactions');
            }}
          />
        )}

        {/* Outbound tab */}
        {activeTab === 'outbound' && (
          <AdminInOutForm
            type="outbound"
            items={items}
            onSubmit={async (data) => {
              await outbound({ inventoryId: data.inventoryId!, quantity: data.quantity, referenceNo: data.referenceNo, notes: data.notes, operator: data.operator });
              setActiveTab('transactions');
            }}
          />
        )}

        {/* Transactions tab */}
        {activeTab === 'transactions' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>時間</th><th>類型</th><th>SKU</th><th>商品名稱</th><th>數量</th><th>關聯單號</th><th>操作人</th><th>備註</th></tr></thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className={styles.mono}>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td><span className={`${styles.txBadge} ${tx.type === 'inbound' ? styles.txIn : tx.type === 'outbound' ? styles.txOut : styles.txAdj}`}>{tx.type}</span></td>
                    <td className={styles.mono}>{tx.sku}</td>
                    <td>{tx.productName}</td>
                    <td className={styles.num}>{tx.type === 'outbound' ? `-${tx.quantity}` : `+${Math.abs(tx.quantity)}`}</td>
                    <td>{tx.referenceNo ?? '—'}</td>
                    <td>{tx.operator ?? '—'}</td>
                    <td>{tx.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add/Edit Form ──────────────────────────────────────────────────────────────
function AddEditForm({
  initial, isEdit, onSubmit, onCancel,
}: {
  initial: Partial<InventoryFormData>;
  isEdit: boolean;
  onSubmit: (data: Partial<InventoryFormData>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<InventoryFormData>>(initial);
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof InventoryFormData, val: string | number) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try { await onSubmit(form); } finally { setSubmitting(false); }
  }

  return (
    <form className={styles.adminForm} onSubmit={handle}>
      <h3>{isEdit ? '編輯商品' : '新增商品'}</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}><label>SKU *</label><input className={styles.input} value={form.sku ?? ''} onChange={e => set('sku', e.target.value)} required={!isEdit} disabled={isEdit} /></div>
        <div className={styles.formGroup}><label>商品名稱 *</label><input className={styles.input} value={form.productName ?? ''} onChange={e => set('productName', e.target.value)} required /></div>
        <div className={styles.formGroup}><label>品牌</label><input className={styles.input} value={form.brand ?? ''} onChange={e => set('brand', e.target.value)} /></div>
        <div className={styles.formGroup}><label>分類</label><input className={styles.input} value={form.category ?? ''} onChange={e => set('category', e.target.value)} /></div>
        <div className={styles.formGroup}><label>尺碼</label><input className={styles.input} value={form.size ?? ''} onChange={e => set('size', e.target.value)} /></div>
        <div className={styles.formGroup}><label>顏色</label><input className={styles.input} value={form.color ?? ''} onChange={e => set('color', e.target.value)} /></div>
        <div className={styles.formGroup}><label>成色</label><input className={styles.input} value={form.condition ?? ''} onChange={e => set('condition', e.target.value)} /></div>
        <div className={styles.formGroup}><label>當前庫存</label><input type="number" className={styles.input} value={form.currentStock ?? 0} onChange={e => set('currentStock', parseInt(e.target.value))} /></div>
        <div className={styles.formGroup}><label>預警閾值</label><input type="number" className={styles.input} value={form.minStockThreshold ?? 3} onChange={e => set('minStockThreshold', parseInt(e.target.value))} /></div>
        <div className={styles.formGroup}><label>成本價 (CNY)</label><input type="number" className={styles.input} value={form.unitCost ?? ''} onChange={e => set('unitCost', parseFloat(e.target.value))} /></div>
        <div className={styles.formGroup}><label>建議售價 (CNY)</label><input type="number" className={styles.input} value={form.unitPrice ?? ''} onChange={e => set('unitPrice', parseFloat(e.target.value))} /></div>
        <div className={styles.formGroup}><label>存放位置</label><input className={styles.input} value={form.location ?? ''} onChange={e => set('location', e.target.value)} /></div>
        <div className={styles.formGroup}><label>供應商</label><input className={styles.input} value={form.supplier ?? ''} onChange={e => set('supplier', e.target.value)} /></div>
        <div className={styles.formGroup}><label>備註</label><input className={styles.input} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} /></div>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={submitting}>{submitting ? '處理中...' : isEdit ? '保存更改' : '新增商品'}</button>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}

// ── Admin In/Out Form ──────────────────────────────────────────────────────────
function AdminInOutForm({
  type, items, onSubmit,
}: {
  type: 'inbound' | 'outbound';
  items: import('../types/warehouse').InventoryItem[];
  onSubmit: (data: { inventoryId?: string; productName?: string; quantity: number; referenceNo?: string; notes?: string; operator?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ inventoryId: '', productName: '', quantity: 1, referenceNo: '', notes: '', operator: '' });
  const [submitting, setSubmitting] = useState(false);

  return (
    <form className={styles.adminForm} onSubmit={async e => { e.preventDefault(); setSubmitting(true); try { await onSubmit(form); } finally { setSubmitting(false); } }}>
      <h3>{type === 'inbound' ? '入庫記錄' : '出庫記錄'}</h3>
      <div className={styles.formGrid}>
        {type === 'inbound' ? (
          <div className={styles.formGroup}><label>商品名稱 *</label><input className={styles.input} value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} required /></div>
        ) : (
          <div className={styles.formGroup}><label>選擇商品 *</label>
            <select className={styles.select} value={form.inventoryId} onChange={e => setForm(f => ({ ...f, inventoryId: e.target.value }))} required>
              <option value="">— 選擇商品 —</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.productName} (庫存: {i.currentStock})</option>)}
            </select>
          </div>
        )}
        <div className={styles.formGroup}><label>數量 *</label><input type="number" className={styles.input} min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required /></div>
        <div className={styles.formGroup}><label>關聯單號</label><input className={styles.input} value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))} /></div>
        <div className={styles.formGroup}><label>操作人</label><input className={styles.input} value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} /></div>
        <div className={styles.formGroup}><label>備註</label><input className={styles.input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary} disabled={submitting}>{submitting ? '處理中...' : type === 'inbound' ? '確認入庫' : '確認出庫'}</button>
      </div>
    </form>
  );
}
