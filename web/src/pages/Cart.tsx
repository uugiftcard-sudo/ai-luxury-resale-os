/**
 * 购物车页面
 * 多商品结算 — prices and copy adapt to the active market.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useMarket } from '../hooks/useMarket';
import { orderApi, displayPrice } from '../api/client';
import StripeCheckout from '../components/StripeCheckout';
import styles from './Cart.module.css';

const COPY: Record<string, Record<string, string>> = {
  CN: {
    emptyTitle: '購物車是空的',
    emptyDesc: '去挑選心儀的奢品吧',
    emptyCta: '逛逛全部商品',
    title: '購物車',
    items: '件商品',
    checkout: '結算資料',
    name: '收货人姓名 *',
    namePlaceholder: '請輸入收貨人姓名',
    phone: '联系电话 *',
    phonePlaceholder: '請輸入手機號',
    address: '收货地址 *',
    addressPlaceholder: '請輸入詳細收貨地址',
    subtotal: '商品總計',
    shipping: '運費',
    freeShipping: '順豐到付',
    total: '合计',
    checkoutBtn: '結算',
    submitting: '提交中...',
    note: '点击结算即表示同意 CLOTH 交易条款。商品将经过专业鉴定后发货。',
    success: '個訂單建立成功！',
    cartEmpty: '購物車是空的',
    removed: '已從購物車移除',
    fillRequired: '請填寫完整的收貨資料',
    invalidPhone: '請輸入有效的電話號碼',
    checkoutFailed: '下單失敗，請重試',
  },
  HK: {
    emptyTitle: '購物車是空的',
    emptyDesc: '去挑選心儀的奢品吧',
    emptyCta: '逛逛全部商品',
    title: '購物車',
    items: '件商品',
    checkout: '結算信息',
    name: '收貨人姓名 *',
    namePlaceholder: '請輸入收貨人姓名',
    phone: '聯絡電話 *',
    phonePlaceholder: '請輸入手機號',
    address: '收貨地址 *',
    addressPlaceholder: '請輸入詳細收貨地址',
    subtotal: '商品總計',
    shipping: '運費',
    freeShipping: '順豐到付',
    total: '合計',
    checkoutBtn: '結算',
    submitting: '提交中...',
    note: '點擊結算即表示同意 CLOTH 交易條款。商品將經過專業鑑定後發貨。',
    success: '個訂單創建成功！',
    cartEmpty: '購物車是空的',
    removed: '已從購物車移除',
    fillRequired: '請填寫完整的收貨信息',
    invalidPhone: '請輸入有效的電話號碼',
    checkoutFailed: '下單失敗，請重試',
  },
  UK: {
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'Time to find something special.',
    emptyCta: 'Browse All Products',
    title: 'Cart',
    items: 'items',
    checkout: 'Checkout',
    name: 'Full Name *',
    namePlaceholder: 'Your full name',
    phone: 'Phone Number *',
    phonePlaceholder: 'UK mobile number',
    address: 'Delivery Address *',
    addressPlaceholder: 'Full UK address including postcode',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    freeShipping: 'Royal Mail Tracked 24',
    total: 'Total',
    checkoutBtn: 'Checkout',
    submitting: 'Processing...',
    note: 'All items are authenticated before dispatch. You\'ll receive a tracking number by email.',
    success: 'order(s) placed successfully!',
    cartEmpty: 'Your cart is empty',
    removed: 'Removed from cart',
    fillRequired: 'Please fill in all required fields',
    invalidPhone: 'Please enter a valid phone number',
    checkoutFailed: 'Checkout failed, please try again',
  },
};

const PHONE_PATTERN: Record<string, RegExp> = {
  CN: /^1[3-9]\d{9}$/,
  HK: /^[569]\d{7}$/,
  UK: /^\+?[\d\s\-()]{7,15}$/,
};

type CheckoutStep = 'info' | 'payment';

export default function Cart() {
  const { items, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const { market } = useMarket();
  const navigate = useNavigate();

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('info');

  const t = COPY[market] ?? COPY.CN;

  /** Converted total in the active market's currency. */
  const convertedTotal = items.reduce(
    (sum, item) => sum + item.product.price, // keep as CNY — convert at display time
    0,
  );
  const totalLabel = displayPrice(convertedTotal, market);
  const subtotalLabel = displayPrice(convertedTotal, market);

  async function handleCheckout() {
    if (!buyerName || !buyerPhone || !buyerAddress) {
      showToast(t.fillRequired, 'error');
      return;
    }
    if (!PHONE_PATTERN[market].test(buyerPhone.replace(/\s/g, ''))) {
      showToast(t.invalidPhone, 'error');
      return;
    }
    if (items.length === 0) {
      showToast(t.cartEmpty, 'error');
      return;
    }
    // Move to payment step — StripeCheckout will create the PaymentIntent
    setStep('payment');
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
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyDesc}</p>
            <Link to="/products" className="btn btn-primary">{t.emptyCta}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1>{t.title}</h1>
          <span className={styles.itemCount}>{items.length} {t.items}</span>
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
                  {displayPrice(item.product.price, market)}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => {
                    removeItem(item.product.id);
                    showToast(t.removed, 'info');
                  }}
                  aria-label={market === 'UK' ? 'Remove' : '移除'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* 结算侧栏 */}
          <div className={styles.sidebar}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>{t.checkout}</h3>

              <div className={styles.formGroup}>
                <label className="form-label">{t.name}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.namePlaceholder}
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">{t.phone}</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t.phonePlaceholder}
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">{t.address}</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder={t.addressPlaceholder}
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                />
              </div>

              <div className={styles.totalRow}>
                <span>{t.subtotal}</span>
                <span>{subtotalLabel}</span>
              </div>
              <div className={styles.totalRow}>
                <span>{t.shipping}</span>
                <span className={styles.free}>{t.freeShipping}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>{t.total}</span>
                <span>{totalLabel}</span>
              </div>

              {step === 'info' && (
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleCheckout}
                  disabled={submitting}
                >
                  {submitting ? t.submitting : `${t.checkoutBtn} (${items.length})`}
                </button>
              )}

              {step === 'payment' && (
                <div style={{ marginTop: '16px' }}>
        <StripeCheckout
          key={items[0]?.product.id + '-' + convertedTotal}
          productId={items[0]?.product.id}
          amount={convertedTotal}
          currency={market}
                    onSuccess={async () => {
                      setSubmitting(true);
                      try {
                        for (const item of items) {
                          await orderApi.create(
                            {
                              productId: item.product.id,
                              buyerInfo: { name: buyerName, phone: buyerPhone, address: buyerAddress },
                            },
                            market,
                          );
                        }
                        clearCart();
                        showToast(`${items.length} ${t.success}`, 'success');
                        navigate('/orders');
                      } catch {
                        showToast(t.checkoutFailed, 'error');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    onCancel={() => setStep('info')}
                  />
                </div>
              )}

              <p className={styles.note}>{t.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
