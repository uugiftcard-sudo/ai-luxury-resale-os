/**
 * 商品详情页
 * 图片轮播 + 商品信息 + 购买/加入购物车
 * Currency and text adapt to the active market.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, orderApi, displayPrice } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useMarket } from '../hooks/useMarket';
import type { Product } from '../types';
import styles from './ProductDetail.module.css';

// ── Condition labels ─────────────────────────────────────────────────────────

const CONDITION_DETAIL: Record<string, Record<string, string>> = {
  CN: {
    '全新': '全新未使用',
    '几乎全新': '仅试穿/试背，无使用痕迹',
    '轻微使用痕迹': '有轻微使用痕迹，不影响使用',
    '有明显使用痕迹': '有明显使用痕迹，请看图',
  },
  HK: {
    '全新': '全新未使用',
    '几乎全新': '僅試用，無使用痕跡',
    '轻微使用痕迹': '輕微使用痕跡，不影響使用',
    '有明显使用痕迹': '有明顯使用痕跡，請看圖',
  },
  UK: {
    '全新': 'New — never used',
    '几乎全新': 'Like New — tried on only',
    '轻微使用痕迹': 'Good — light signs of wear',
    '有明显使用痕迹': 'Well Used — visible wear, see photos',
  },
};

const PHONE_PLACEHOLDER: Record<string, string> = {
  CN: '请输入手机号 (11位)',
  HK: '請輸入手機號 (8位)',
  UK: 'Phone number',
};

const PHONE_PATTERN: Record<string, RegExp> = {
  CN: /^1[3-9]\d{9}$/,
  HK: /^[569]\d{7}$/,
  UK: /^\+?[\d\s\-()]{7,15}$/,
};

// ── Trust services per market ────────────────────────────────────────────────

const TRUST_ITEMS: Record<string, { icon: string; title: string; desc: string }[]> = {
  CN: [
    { icon: '🛡', title: '正品鉴定', desc: '每件商品经过专业鉴定师鉴定' },
    { icon: '📦', title: '安全配送', desc: '顺丰保价包邮，全程物流追踪' },
    { icon: '💬', title: '专属客服', desc: '7×24小时在线，随时答疑' },
    { icon: '↩', title: '7天退换', desc: '收货7天内可申请退换货' },
  ],
  HK: [
    { icon: '🛡', title: '認證鑑定', desc: '每件商品經專業鑑定師鑑定' },
    { icon: '📦', title: '安全送遞', desc: '順豐/其他快遞，全程追蹤' },
    { icon: '💬', title: '專屬客服', desc: '24小時在線，隨時答疑' },
    { icon: '↩', title: '7天退換', desc: '收貨7天內可申請退換貨' },
  ],
  UK: [
    { icon: '✓', title: 'Authenticated', desc: 'Every item verified by our expert authenticators' },
    { icon: '📦', title: 'Same-Day Delivery', desc: 'Royal Mail Tracked 24 on all UK orders' },
    { icon: '💬', title: 'Dedicated Support', desc: 'Live chat and WhatsApp available' },
    { icon: '↩', title: '14-Day Returns', desc: 'Hassle-free returns, no questions asked' },
  ],
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { showToast } = useToast();
  const { market, config } = useMarket();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // 订单表单状态
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.get(id, market)
      .then(setProduct)
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate, market]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className={styles.loading}>
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h3>商品不存在或已下架</h3>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>返回商品列表</button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'];

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const priceLabel = displayPrice(product.price, market);
  const originalPriceLabel = product.originalPrice > product.price
    ? displayPrice(product.originalPrice, market)
    : null;
  const savedLabel = product.originalPrice > product.price
    ? displayPrice(product.originalPrice - product.price, market)
    : null;

  const conditionMap = CONDITION_DETAIL[market] ?? CONDITION_DETAIL.CN;
  const trustItems = TRUST_ITEMS[market] ?? TRUST_ITEMS.CN;

  async function handleBuy() {
    if (!buyerName || !buyerPhone || !buyerAddress) {
      showToast(
        market === 'UK' ? 'Please fill in all required fields' : '请填写完整的收货信息',
        'error',
      );
      return;
    }
    if (!PHONE_PATTERN[market].test(buyerPhone.replace(/\s/g, ''))) {
      showToast(
        market === 'UK'
          ? 'Please enter a valid phone number'
          : '请输入有效的电话号码',
        'error',
      );
      return;
    }
    setSubmitting(true);
    try {
      await orderApi.create(
        {
          productId: product.id,
          buyerInfo: { name: buyerName, phone: buyerPhone, address: buyerAddress },
        },
        market,
      );
      showToast(
        market === 'UK'
          ? 'Order placed successfully!'
          : '订单创建成功！',
        'success',
      );
      setOrderModalOpen(false);
      navigate('/orders');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '下单失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const isSoldOut = product.status !== '待售';
  const conditionDetail = conditionMap[product.condition] ?? product.condition;

  return (
    <div className="page">
      <div className="container">
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← {market === 'UK' ? 'Back' : '返回'}
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')}>
            {market === 'UK' ? 'All Products' : '全部商品'}
          </button>
          <span>/</span>
          <span>{product.brand}</span>
          <span>/</span>
          <span>{product.title.slice(0, 20)}...</span>
        </div>

        <div className={styles.detail}>
          {/* 左侧：图片 */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={images[activeImg]} alt={product.title} className={styles.mainImg} />
              {discount > 0 && (
                <span className={styles.discountBadge}>
                  {market === 'UK' ? `${discount}% off` : `${discount}折`}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`图片 ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：信息 */}
          <div className={styles.info}>
            <div className={styles.brandTag}>{product.brand}</div>
            <h1 className={styles.title}>{product.title}</h1>

            {/* 价格 */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>{priceLabel}</span>
              {originalPriceLabel && (
                <>
                  <span className={styles.originalPrice}>{originalPriceLabel}</span>
                  {savedLabel && (
                    <span className={styles.saveBadge}>
                      {market === 'UK' ? `Save ${savedLabel}` : `省 ${savedLabel}`}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* 属性 */}
            <div className={styles.attrs}>
              <div className={styles.attr}>
                <span className={styles.attrKey}>
                  {market === 'UK' ? 'Condition' : '成色'}
                </span>
                <div>
                  <span className={`badge badge-${product.condition === '全新' ? 'new' : product.condition === '几乎全新' ? 'like-new' : 'good'}`}>
                    {product.condition}
                  </span>
                  <p className={styles.attrNote}>{conditionDetail}</p>
                </div>
              </div>
              <div className={styles.attr}>
                <span className={styles.attrKey}>
                  {market === 'UK' ? 'Size' : '尺寸'}
                </span>
                <span className={styles.attrVal}>{product.size}</span>
              </div>
              <div className={styles.attr}>
                <span className={styles.attrKey}>
                  {market === 'UK' ? 'Category' : '分类'}
                </span>
                <span className={styles.attrVal}>{product.category}</span>
              </div>
              {product.platform && (
                <div className={styles.attr}>
                  <span className={styles.attrKey}>
                    {market === 'UK' ? 'Source' : '来源'}
                  </span>
                  <span className={styles.attrVal}>{product.platform}</span>
                </div>
              )}
            </div>

            <div className={styles.divider} />

            {/* 操作按钮 */}
            <div className={styles.actions}>
              {isSoldOut ? (
                <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%' }}>
                  {product.status === '已售'
                    ? (market === 'UK' ? 'Sold Out' : '已售出')
                    : (market === 'UK' ? 'Unavailable' : '已下架')}
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setOrderModalOpen(true)}
                    style={{ flex: 1 }}
                  >
                    {market === 'UK' ? 'Buy Now' : '立即购买'}
                  </button>
                  <button
                    className={`btn btn-secondary btn-lg ${isInCart(product.id) ? styles.inCart : ''}`}
                    onClick={() => {
                      if (!isInCart(product.id)) {
                        addItem(product);
                        showToast(
                          market === 'UK' ? 'Added to cart' : '已加入购物车',
                          'success',
                        );
                      }
                    }}
                    disabled={isInCart(product.id)}
                  >
                    {isInCart(product.id)
                      ? (market === 'UK' ? 'In Cart' : '已在购物车')
                      : (market === 'UK' ? 'Add to Cart' : '加入购物车')}
                  </button>
                </>
              )}
            </div>

            {/* 服务 */}
            <div className={styles.services}>
              {trustItems.map(item => (
                <div key={item.title} className={styles.service}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 商品描述 */}
        <div className={styles.descSection}>
          <h2 className={styles.descTitle}>
            {market === 'UK' ? 'Description' : '商品描述'}
          </h2>
          <p className={styles.desc}>{product.description}</p>
          <p className={styles.meta}>
            {market === 'UK'
              ? `Listed: ${new Date(product.createdAt).toLocaleDateString('en-GB')}`
              : `上架时间：${new Date(product.createdAt).toLocaleDateString('zh-CN')}`}
          </p>
        </div>
      </div>

      {/* 购买模态框 */}
      {orderModalOpen && (
        <div className="modal-overlay" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{market === 'UK' ? 'Confirm Order' : '确认购买'}</h2>
              <button className={styles.closeBtn} onClick={() => setOrderModalOpen(false)}>×</button>
            </div>

            <div className={styles.modalProduct}>
              <img src={images[0]} alt={product.title} className={styles.modalImg} />
              <div>
                <p className={styles.modalTitle}>{product.title}</p>
                <p className={styles.modalPrice}>{priceLabel}</p>
              </div>
            </div>

            <div className={styles.form}>
              <div className="form-group">
                <label className="form-label">
                  {market === 'UK' ? 'Full Name *' : '收货人姓名 *'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={market === 'UK' ? 'Your full name' : '请输入收货人姓名'}
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {market === 'UK' ? 'Phone Number *' : '联系电话 *'}
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder={PHONE_PLACEHOLDER[market]}
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {market === 'UK' ? 'Delivery Address *' : '收货地址 *'}
                </label>
                <textarea
                  className="form-input form-textarea"
                  placeholder={
                    market === 'UK'
                      ? 'Full UK delivery address including postcode'
                      : '请输入详细收货地址'
                  }
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalTotal}>
              <span>{market === 'UK' ? 'Total' : '实付金额'}</span>
              <span className={styles.totalPrice}>{priceLabel}</span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={handleBuy}
              disabled={submitting}
            >
              {submitting
                ? (market === 'UK' ? 'Placing order...' : '提交中...')
                : (market === 'UK' ? 'Place Order' : '确认下单')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
