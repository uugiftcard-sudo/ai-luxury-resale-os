/**
 * 财务页面 — 收入支出记录管理
 * 设计：卡片统计 + 列表记录 + 快速记账入口
 */
import { useState, useEffect, useMemo } from 'react';
import { financeApi, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../api/finance';
import { useMarket } from '../hooks/useMarket';
import { useToast } from '../hooks/useToast';
import type { FinanceRecord, FinanceRecordFormData, FinanceType, FinanceCategory } from '../types';
import styles from './Finance.module.css';

// ── 常量 ──────────────────────────────────────────────────────────────────────
const TYPE_OPTIONS: FinanceType[] = ['收入', '支出'];

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
  const { market } = useMarket();
  const { showToast } = useToast();

  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
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
    financeApi.list(market)
      .then(setRecords)
      .catch(err => showToast(err instanceof Error ? err.message : '加载失败', 'error'))
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
      showToast('请填写正确的金额', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('请填写备注说明', 'error');
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
        showToast('记录已添加', 'success');
      }
      setFormOpen(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除该记录？')) return;
    try {
      await financeApi.delete(id, market);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('已删除', 'info');
    } catch {
      showToast('删除失败', 'error');
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
            <h1>收支记录</h1>
            <p>收入支出，轻松管理</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.incomeCard}`}>
            <span className={styles.statLabel}>总收入</span>
            <span className={styles.statValue} style={{ color: '#2e7d32' }}>
              ¥{stats.totalIncome.toLocaleString()}
            </span>
            <span className={styles.statCount}>{stats.incomeCount} 笔收入</span>
          </div>
          <div className={`${styles.statCard} ${styles.expenseCard}`}>
            <span className={styles.statLabel}>总支出</span>
            <span className={styles.statValue} style={{ color: '#c62828' }}>
              ¥{stats.totalExpense.toLocaleString()}
            </span>
            <span className={styles.statCount}>{stats.expenseCount} 笔支出</span>
          </div>
          <div className={`${styles.statCard} ${netProfit >= 0 ? styles.profitCard : styles.lossCard}`}>
            <span className={styles.statLabel}>净利润</span>
            <span className={styles.statValue} style={{ color: netProfit >= 0 ? '#1565c0' : '#c62828' }}>
              {netProfit >= 0 ? '+' : '−'}¥{Math.abs(netProfit).toLocaleString()}
            </span>
            <span className={styles.statCount}>{netProfit >= 0 ? '盈利中' : '亏损中'}</span>
          </div>
        </div>

        {/* 快速记账入口 */}
        <div className={styles.quickAdd}>
          <span className={styles.quickAddLabel}>快速记账</span>
          <button className={`${styles.quickAddBtn} ${styles.income}`} onClick={() => openAdd('收入')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            记收入
          </button>
          <button className={`${styles.quickAddBtn} ${styles.expense}`} onClick={() => openAdd('支出')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            记支出
          </button>
        </div>

        {/* 记录列表 */}
        <div className={styles.recordsWrap}>

          {/* 列表头部 */}
          <div className={styles.recordsHeader}>
            <span className={styles.recordsTitle}>
              {activeTab === 'all' ? '全部记录' : activeTab === 'income' ? '收入记录' : '支出记录'}
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
                aria-label="开始月份"
                style={{ padding: '6px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>至</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                aria-label="结束月份"
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

          {/* 空状态 */}
          {!loading && filteredRecords.length === 0 && (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-md)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <h3>暂无记录</h3>
              <p>点击上方「记收入」或「记支出」开始记账</p>
            </div>
          )}

          {/* 记录行 */}
          {!loading && filteredRecords.map(r => (
            <div key={r.id} className={styles.recordRow}>
              <span className={styles.recordDate}>
                {new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>

              <div className={styles.recordType}>
                <span className={`${styles.typeDot} ${r.type === '收入' ? styles.income : styles.expense}`} />
                <span className={`${styles.typeLabel} ${r.type === '收入' ? styles.income : styles.expense}`}>
                  {r.type}
                </span>
              </div>

              <div className={styles.recordInfo}>
                <span className={styles.recordCategory}>{r.category}</span>
                <span className={styles.recordDesc}>{r.description}</span>
              </div>

              <span className={`${styles.recordAmount} ${r.type === '收入' ? styles.income : styles.expense}`}>
                {r.type === '收入' ? '+' : '−'}¥{r.amount.toLocaleString()}
              </span>

              <div className={styles.recordActions}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)} title="编辑">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className={`btn btn-ghost btn-sm ${styles.deleteBtn}`}
                  onClick={() => handleDelete(r.id)}
                  title="删除"
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

      {/* 新增/编辑模态框 */}
      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? '编辑记录' : '新增记录'}</h2>
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
                  <label className="form-label" htmlFor="finance-category">类别 *</label>
                  <select
                    id="finance-category"
                    className="form-input"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as FinanceCategory }))}
                    required
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="finance-amount">金额 (¥) *</label>
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
                  <label className="form-label" htmlFor="finance-order">关联订单</label>
                  <input
                    id="finance-order"
                    className="form-input"
                    value={form.relatedOrderId || ''}
                    onChange={e => setForm(f => ({ ...f, relatedOrderId: e.target.value }))}
                    placeholder="订单号（可选）"
                  />
                </div>

              </div>

              <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                <label className="form-label" htmlFor="finance-desc">备注说明 *</label>
                <textarea
                  id="finance-desc"
                  className="form-input form-textarea"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="简要说明这笔收入/支出的来源或用途"
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '提交中...' : editingId ? '保存修改' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
