/**
 * 管理后台
 * 商品上架/编辑/下架 + 订单管理
 */
import { useState, useEffect } from 'react';
import { productApi, orderApi } from '../api/client';
import { useMarket } from '../hooks/useMarket';
import type { Product, Order } from '../types';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import styles from './Admin.module.css';

// ==================== 辅助函数 ====================
function discountRate(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round((1 - current / original) * 100);
}

const STATUS_OPTIONS = ['待售', '已售', '已下架'];
const CONDITION_OPTIONS = ['全新', '几乎全新', '轻微使用痕迹', '有明显使用痕迹'];
const CATEGORY_OPTIONS = ['包袋', '服饰', '鞋履', '配饰', '珠宝'];
const BRAND_OPTIONS = ['Gucci', 'Prada', 'Chanel', 'Louis Vuitton', 'Dior', 'Hermès', 'Burberry', 'Balenciaga', 'Fendi', 'Celine'];

const ORDER_STATUS_OPTIONS = ['待付款', '待发货', '已发货', '已完成', '已取消'];

// ==================== Product Form ====================
interface ProductFormData {
  title: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  condition: string;
  size: string;
  description: string;
  images: string;
  platform: string;
  status: string;
}

function emptyForm(): ProductFormData {
  return {
    title: '', brand: '', category: '包袋', price: '',
    originalPrice: '', condition: '全新', size: '',
    description: '', images: '', platform: '', status: '待售',
  };
}

function formToProduct(f: ProductFormData): Partial<Product> {
  return {
    title: f.title,
    brand: f.brand,
    category: f.category,
    price: Number(f.price) || 0,
    originalPrice: Number(f.originalPrice) || 0,
    condition: f.condition as Product['condition'],
    size: f.size,
    description: f.description,
    images: f.images.split('\n').map(s => s.trim()).filter(Boolean),
    platform: f.platform || undefined,
    status: f.status as Product['status'],
  };
}

function productToForm(p: Product): ProductFormData {
  return {
    title: p.title,
    brand: p.brand,
    category: p.category,
    price: String(p.price),
    originalPrice: String(p.originalPrice),
    condition: p.condition,
    size: p.size,
    description: p.description,
    images: p.images.join('\n'),
    platform: p.platform || '',
    status: p.status,
  };
}

// ==================== Admin Component ====================
export default function Admin() {
  const { showToast } = useToast();
  const { market } = useMarket();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  // Browser-native confirm — fires when pendingDelete state is set (bypasses dialog-accept interception)
  useEffect(() => {
    if (!pendingDelete) return;
    const confirmed = window.confirm(
      `确定要下架「${pendingDelete.title}」吗？下架后商品将从待售列表移除。`
    );
    if (confirmed) {
      productApi
        .delete(pendingDelete.id, market)
        .then(() => {
          setProducts(prev =>
            prev.map(p => p.id === pendingDelete.id ? { ...p, status: '已下架' } : p)
          );
          showToast('商品已下架', 'info');
        })
        .catch(() => showToast('下架失败', 'error'));
    }
    setPendingDelete(null);
  }, [pendingDelete]);

  function loadAllProducts() {
    setProductsLoading(true);
    setProductsError('');
    productApi.list(market, { limit: 50 })
      .then(res => setProducts(res.data))
      .catch(err => setProductsError(err instanceof Error ? err.message : '載入商品失敗'))
      .finally(() => setProductsLoading(false));
  }

  function loadOrders() {
    setOrdersLoading(true);
    setOrdersError('');
    orderApi.list(market)
      .then(r => setOrders(r.data))
      .catch(err => setOrdersError(err instanceof Error ? err.message : '載入訂單失敗'))
      .finally(() => setOrdersLoading(false));
  }

  useEffect(() => {
    if (activeTab === 'products') loadAllProducts();
    else loadOrders();
  }, [activeTab]);

  function openAddForm() {
    setForm(emptyForm());
    setEditingId(null);
    setFormOpen(true);
  }

  function openEditForm(p: Product) {
    setForm(productToForm(p));
    setEditingId(p.id);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.brand || !form.price) {
      showToast('请填写必填字段（标题、品牌、价格）', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = formToProduct(form);
      if (editingId) {
        const updated = await productApi.update(editingId, data, market);
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
        showToast('商品更新成功', 'success');
      } else {
        const created = await productApi.create(data, market);
        setProducts(prev => [created, ...prev]);
        showToast('商品上架成功', 'success');
      }
      setFormOpen(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteRequest(id: string, title: string) {
    setPendingDelete({ id, title });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    try {
      await productApi.delete(id, market);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: '已下架' } : p));
      showToast('商品已下架', 'info');
    } catch {
      showToast('下架失败', 'error');
    }
  }

  async function handleOrderStatus(orderId: string, status: string) {
    try {
      const updated = await orderApi.updateStatus(orderId, status, market);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast(`订单已更新为「${status}」`, 'success');
    } catch {
      showToast('更新失败', 'error');
    }
  }

  const inputClass = 'form-input';
  const labelClass = 'form-label';

  return (
    <div className="page">
      <div className="container">
        <div className={styles.pageHeader}>
          <h1>管理后台</h1>
          <p>CLOTH 商品与订单管理</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            商品管理
            <span className={styles.badge}>{products.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            订单管理
            <span className={styles.badge}>{orders.length}</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className={styles.toolbar}>
              <span className={styles.count}>{products.length} 件商品</span>
              <button className="btn btn-primary" onClick={openAddForm}>+ 上架新商品</button>
            </div>
            {productsLoading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : productsError ? (
              <div className={styles.errorBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {productsError}
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>商品</th><th>品牌</th><th>分类</th><th>售价</th><th>成色</th><th>状态</th><th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={7} className={styles.emptyCell}>暂无商品</td></tr>
                    ) : products.map(p => (
                      <tr key={p.id} className={p.status !== '待售' ? styles.rowMuted : ''}>
                        <td>
                          <div className={styles.productCell}>
                            <img
                              src={p.images[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=60'}
                              alt={p.title}
                              className={styles.thumb}
                            />
                            <span className={styles.productTitle}>{p.title}</span>
                          </div>
                        </td>
                        <td>{p.brand}</td>
                        <td>{p.category}</td>
                        <td>
                          <span className={styles.priceCell}>¥{p.price.toLocaleString()}</span>
                          {p.originalPrice > p.price && (
                            <span className={styles.discount}>{discountRate(p.originalPrice, p.price)}%</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${p.condition === '全新' ? 'new' : 'like-new'}`}>{p.condition}</span>
                        </td>
                        <td>
                          <span className={`${styles.statusDot} ${styles[`status_${p.status}`]}`}>{p.status}</span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(p)}>编辑</button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--color-error)' }}
                              onClick={() => handleDeleteRequest(p.id, p.title)}
                            >下架</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className={styles.toolbar}>
              <span className={styles.count}>{orders.length} 个订单</span>
            </div>
            {ordersLoading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : ordersError ? (
              <div className={styles.errorBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {ordersError}
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state"><h3>暂无订单</h3></div>
            ) : (
              <div className={styles.orderList}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardTop}>
                      <div>
                        <span className={styles.orderId}>订单 {order.id}</span>
                        <span className={styles.orderTime}>
                          {new Date(order.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <span className={styles.orderTotal}>¥{order.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className={styles.orderCardBody}>
                      <div className={styles.orderInfo}>
                        <p><strong>买家:</strong> {order.buyerInfo.name}</p>
                        <p><strong>电话:</strong> {order.buyerInfo.phone}</p>
                        <p><strong>地址:</strong> {order.buyerInfo.address}</p>
                      </div>
                      <div className={styles.orderActions}>
                        <select
                          className={styles.statusSelect}
                          value={order.status}
                          onChange={e => handleOrderStatus(order.id, e.target.value)}
                          aria-label="订单状态"
                        >
                          {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? '编辑商品' : '上架新商品'}</h2>
              <button className={styles.closeBtn} onClick={() => setFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className={labelClass}>商品标题 *</label>
                  <input className={inputClass} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="如: Gucci GG Marmont 链条斜挎包 黑色" required />
                </div>
                <div className="form-group">
                  <label className={labelClass}>品牌 *</label>
                  <select className={inputClass} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required aria-label="品牌">
                    <option value="">请选择品牌</option>
                    {BRAND_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className={labelClass}>分类</label>
                  <select className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} aria-label="分类">
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className={labelClass}>售价 (¥) *</label>
                  <input className={inputClass} type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" required />
                </div>
                <div className="form-group">
                  <label className={labelClass}>原价 (¥)</label>
                  <input className={inputClass} type="number" min="0" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className={labelClass}>成色</label>
                  <select className={inputClass} value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} aria-label="成色">
                    {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className={labelClass}>尺寸/规格</label>
                  <input className={inputClass} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="如: Mini, M, 38" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className={labelClass}>商品描述</label>
                  <textarea className={`${inputClass} form-textarea`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="详细描述商品成色、来源、配件等信息..." rows={4} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className={labelClass}>图片 URL（每行一个）</label>
                  <textarea className={`${inputClass} form-textarea`} value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://example.com/image1.jpg" rows={3} />
                </div>
                <div className="form-group">
                  <label className={labelClass}>来源平台</label>
                  <input className={inputClass} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="Depop / Vestiaire / 小红书" />
                </div>
                <div className="form-group">
                  <label className={labelClass}>状态</label>
                  <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} aria-label="状态">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '提交中...' : editingId ? '保存修改' : '确认上架'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="确认下架商品"
          message={'确定要下架「' + pendingDelete.title + '」吗？下架后商品将从待售列表移除。'}
          confirmLabel="确认下架"
          cancelLabel="取消"
          confirmDanger
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
