/**
 * 购物车页面
 * 多商品结算
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, removeItem, clearCart, totalPrice } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCheckout() {
    if (!buyerName || !buyerPhone || !buyerAddress) {
      showToast('请填写完整的收货信息', 'error');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(buyerPhone)) {
      showToast('请输入有效的手机号码', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('购物车是空的', 'error');
      return;
    }

    setSubmitting(true);
    try {
      for (const item of items) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            buyerInfo: { name: buyerName, phone: buyerPhone, address: buyerAddress },
          }),
        });
      }
      clearCart();
      showToast(`${items.length} 个订单创建成功！`, 'success');
      navigate('/orders');
    } catch {
      showToast('下单失败，请重试', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2>购物车是空的</h2>
            <p>去挑选心仪的奢品吧</p>
            <Link to="/products" className="btn btn-primary">逛逛全部商品</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1>购物车</h1>
          <span className={styles.itemCount}>{items.length} 件商品</span>
        </div>

        <div className={styles.layout}>
          {/* 商品列表 */}
          <div className={styles.items}>
            {items.map(item => (
              <div key={item.product.id} className={styles.item}>
                <Link to={`/products/${item.product.id}`} className={styles.itemImg}>
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200'}
                    alt={item.product.title}
                  />
                </Link>
                <div className={styles.itemInfo}>
                  <div className={styles.itemBrand}>{item.product.brand}</div>
                  <Link to={`/products/${item.product.id}`} className={styles.itemTitle}>
                    {item.product.title}
                  </Link>
                  <div className={styles.itemMeta}>
                    <span className={`badge badge-${item.product.condition === '全新' ? 'new' : 'like-new'}`}>
                      {item.product.condition}
                    </span>
                    <span className={styles.itemSize}>{item.product.size}</span>
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  ¥{item.product.price.toLocaleString()}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => {
                    removeItem(item.product.id);
                    showToast('已从购物车移除', 'info');
                  }}
                  aria-label="移除"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* 结算侧栏 */}
          <div className={styles.sidebar}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>结算信息</h3>

              <div className={styles.formGroup}>
                <label className="form-label">收货人姓名 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入收货人姓名"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">联系电话 *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="请输入手机号"
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">收货地址 *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="请输入详细收货地址"
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                />
              </div>

              <div className={styles.totalRow}>
                <span>商品总计</span>
                <span>¥{totalPrice.toLocaleString()}</span>
              </div>
              <div className={styles.totalRow}>
                <span>运费</span>
                <span className={styles.free}>顺丰到付</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>合计</span>
                <span>¥{totalPrice.toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? '提交中...' : `结算 (${items.length}件)`}
              </button>

              <p className={styles.note}>
                点击结算即表示同意 CLOTH 交易条款。商品将经过专业鉴定后发货。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
