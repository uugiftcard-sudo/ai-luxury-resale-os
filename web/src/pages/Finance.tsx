/**
 * 财务页面 — 收入支出记录管理
 * 设计：卡片统计 + 列表记录 + 快速记账入口
 */
import { useState, useEffect, useMemo } from 'react';
import { financeApi, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../api/finance';
import { displayPrice } from '../api/client';
import { useMarket } from '../hooks/useMarket';
import { useToast } from '../hooks/useToast';
import type { FinanceRecord, FinanceRecordFormData, FinanceType, FinanceCategory } from '../types';
import styles from './Finance.module.css';

// ── 常量 ──────────────────────────────────────────────────────────────────────
const TYPE_OPTIONS: FinanceType[] = ['收入', '支出'];

const CATEGORY_LABELS: Record<string, string> = {
  商品销售收入: '商品銷售收入',
  其他收入: '其他收入',
  商品采购: '商品採購',
  物流运输: '物流運輸',
  平台费用: '平台費用',
  仓储费用: '倉儲費用',
  营销推广: '營銷推廣',
  人力成本: '人力成本',
  税费: '稅費',
  其他支出: '其他支出',
};

function emptyForm(): FinanceRecordFormData {
  return {
    type: '支出',
    category: '其他支出',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    relatedOrderId: '',
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Finance() {
  const { market, config } = useMarket();
  const { showToast } = useToast();

  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

  const [form, setForm] = useState<FinanceRecordFormData>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // ── Load ────────────────────────────────────────────────────────────────────
  function load() {
    setLoading(true);
    setLoadError('');
    financeApi.list(market)
      .then(setRecords)
      .catch(err => setLoadError(err instanceof Error ? err.message : '載入失敗'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [market]);

  // ── Filtered records ────────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (activeTab === 'income' && r.type !== '收入') return false;
      if (activeTab === 'expense' && r.type !== '支出') return false;
      if (filterDateFrom && r.date < filterDateFrom) return false;
      if (filterDateTo && r.date > filterDateTo) return false;
      return true;
    });
  }, [records, activeTab, filterDateFrom, filterDateTo]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => ({
        totalIncome: acc.totalIncome + (r.type === '收入' ? r.amount : 0),
        totalExpense: acc.totalExpense + (r.type === '支出' ? r.amount : 0),
        incomeCount: acc.incomeCount + (r.type === '收入' ? 1 : 0),
        expenseCount: acc.expenseCount + (r.type === '支出' ? 1 : 0),
      }),
      { totalIncome: 0, totalExpense: 0, incomeCount: 0, expenseCount: 0 },
    );
  }, [filteredRecords]);

  const netProfit = stats.totalIncome - stats.totalExpense;
  const amountLabel = (amount: number) => displayPrice(amount, market);

  // ── Form handlers ───────────────────────────────────────────────────────────
  function openAdd(type: FinanceType) {
    setForm({ ...emptyForm(), type });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(r: FinanceRecord) {
    setForm({
      type: r.type,
      category: r.category,
      amount: String(r.amount),
      description: r.description,
      date: r.date,
      relatedOrderId: r.relatedOrderId || '',
    });
    setEditingId(r.id);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      showToast('請填寫正確的金額', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('請填寫備註說明', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await financeApi.update(editingId, form, market);
        setRecords(prev => prev.map(r => r.id === editingId ? updated : r));
        showToast('更新成功', 'success');
      } else {
        const created = await financeApi.create(form, market);
        setRecords(prev => [created, ...prev]);
        showToast('記錄已新增', 'success');
      }
      setFormOpen(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '操作失敗', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確認刪除此記錄？')) return;
    try {
      await financeApi.delete(id, market);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('已删除', 'info');
    } catch {
      showToast('刪除失敗', 'error');
    }
  }

  const categories = form.type === '收入' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container">

        {/* 页面标题 */}
        <div className={styles.pageHeader}>
          <div>
            <h1>收支記錄</h1>
            <p>收入支出，一頁管理</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.incomeCard}`}>
            <span className={styles.statLabel}>總收入</span>
            <span className={styles.statValue} style={{ color: '#2e7d32' }}>
              {amountLabel(stats.totalIncome)}
            </span>
            <span className={styles.statCount}>{stats.incomeCount} 筆收入</span>
          </div>
          <div className={`${styles.statCard} ${styles.expenseCard}`}>
            <span className={styles.statLabel}>總支出</span>
            <span className={styles.statValue} style={{ color: '#c62828' }}>
              {amountLabel(stats.totalExpense)}
            </span>
            <span className={styles.statCount}>{stats.expenseCount} 筆支出</span>
          </div>
          <div className={`${styles.statCard} ${netProfit >= 0 ? styles.profitCard : styles.lossCard}`}>
            <span className={styles.statLabel}>淨利潤</span>
            <span className={styles.statValue} style={{ color: netProfit >= 0 ? '#1565c0' : '#c62828' }}>
              {netProfit >= 0 ? '+' : '−'}{amountLabel(Math.abs(netProfit))}
            </span>
            <span className={styles.statCount}>{netProfit >= 0 ? '盈利中' : '虧損中'}</span>
          </div>
        </div>

        {/* 快速记账入口 */}
        <div className={styles.quickAdd}>
          <span className={styles.quickAddLabel}>快速記帳</span>
          <button className={`${styles.quickAddBtn} ${styles.income}`} onClick={() => openAdd('收入')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            記收入
          </button>
          <button className={`${styles.quickAddBtn} ${styles.expense}`} onClick={() => openAdd('支出')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            記支出
          </button>
        </div>

        {/* 记录列表 */}
        <div className={styles.recordsWrap}>

          {/* 列表头部 */}
          <div className={styles.recordsHeader}>
            <span className={styles.recordsTitle}>
              {activeTab === 'all' ? '全部記錄' : activeTab === 'income' ? '收入記錄' : '支出記錄'}
              &nbsp;({filteredRecords.length})
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Tab */}
              <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 3 }}>
                {(['all', 'income', 'expense'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      background: activeTab === tab ? 'var(--color-surface)' : 'transparent',
                      color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {tab === 'all' ? '全部' : tab === 'income' ? '收入' : '支出'}
                  </button>
                ))}
              </div>
              {/* Date filter */}
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                aria-label="開始日期"
                style={{ padding: '6px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>至</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                aria-label="結束日期"
                style={{ padding: '6px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              />
              {(filterDateFrom || filterDateTo) && (
                <button
                  onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); }}
                  style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* 加载中 */}
          {loading && (
            <div className="loading-spinner"><div className="spinner" /></div>
          )}

          {/* 加载错误 */}
          {!loading && loadError && (
            <div style={{ padding: '16px', background: 'rgba(198,40,40,0.08)', border: '1.5px solid #c62828', borderRadius: 'var(--radius-md)', color: '#c62828', display: 'flex', alignItems: 'center', gap: 8, marginTop: 'var(--space-md)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {loadError}
            </div>
          )}

          {/* 空状态 */}
          {!loading && !loadError && filteredRecords.length === 0 && (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-md)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <h3>暫無記錄</h3>
              <p>點擊上方「記收入」或「記支出」開始記帳</p>
            </div>
          )}

          {/* 记录行 */}
          {!loading && filteredRecords.map(r => (
            <div key={r.id} className={styles.recordRow}>
              <span className={styles.recordDate}>
                {new Date(r.date).toLocaleDateString(market === 'UK' ? 'en-GB' : 'zh-HK', { month: 'short', day: 'numeric' })}
              </span>

              <div className={styles.recordType}>
                <span className={`${styles.typeDot} ${r.type === '收入' ? styles.income : styles.expense}`} />
                <span className={`${styles.typeLabel} ${r.type === '收入' ? styles.income : styles.expense}`}>
                  {r.type}
                </span>
              </div>

              <div className={styles.recordInfo}>
                <span className={styles.recordCategory}>{CATEGORY_LABELS[r.category] || r.category}</span>
                <span className={styles.recordDesc}>{r.description}</span>
              </div>

              <span className={`${styles.recordAmount} ${r.type === '收入' ? styles.income : styles.expense}`}>
                {r.type === '收入' ? '+' : '−'}{amountLabel(r.amount)}
              </span>

              <div className={styles.recordActions}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)} title="編輯">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className={`btn btn-ghost btn-sm ${styles.deleteBtn}`}
                  onClick={() => handleDelete(r.id)}
                  title="刪除"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 新增/編輯模態框 */}
      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? '編輯記錄' : '新增記錄'}</h2>
              <button className={styles.closeBtn} onClick={() => setFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 类型切换 */}
              <div className={styles.typeToggle}>
                {TYPE_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.typeToggleBtn} ${form.type === t ? (t === '收入' ? styles.incomeActive : styles.expenseActive) : ''}`}
                    onClick={() => setForm(f => ({
                      ...f,
                      type: t,
                      category: t === '收入' ? '商品销售收入' : '商品采购',
                    }))}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className={styles.formGrid}>

                <div className="form-group">
                  <label className="form-label" htmlFor="finance-date">日期 *</label>
                  <input
                    id="finance-date"
                    className="form-input"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="finance-category">類別 *</label>
                  <select
                    id="finance-category"
                    className="form-input"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as FinanceCategory }))}
                    required
                  >
                    {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="finance-amount">金額 ({config.currencySymbol}) *</label>
                  <input
                    id="finance-amount"
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="finance-order">關聯訂單</label>
                  <input
                    id="finance-order"
                    className="form-input"
                    value={form.relatedOrderId || ''}
                    onChange={e => setForm(f => ({ ...f, relatedOrderId: e.target.value }))}
                    placeholder="訂單號（可選）"
                  />
                </div>

              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="finance-desc">備註說明 *</label>
                <textarea
                  id="finance-desc"
                  className="form-input form-textarea"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="簡要說明這筆收入/支出的來源或用途"
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '提交中...' : editingId ? '保存修改' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
