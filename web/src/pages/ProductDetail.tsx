/**
 * 商品详情页
 * 图片轮播 + 商品信息 + 购买/加入购物车
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import type { Product } from '../types';
import styles from './ProductDetail.module.css';

const conditionLabel: Record<string, string> = {
  '全新': '全新未使用',
  '几乎全新': '仅试穿/试背，无使用痕迹',
  '轻微使用痕迹': '有轻微使用痕迹，不影响使用',
  '有明显使用痕迹': '有明显使用痕迹，请看图',
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { showToast } = useToast();

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
    productApi.get(id)
      .then(setProduct)
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

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

  async function handleBuy() {
    if (!product) return;
    if (!buyerName || !buyerPhone || !buyerAddress) {
      showToast('请填写完整的收货信息', 'error');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(buyerPhone)) {
      showToast('请输入有效的手机号码', 'error');
      return;
    }
    setSubmitting(true);
    const currentProduct = product!;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          buyerInfo: { name: buyerName, phone: buyerPhone, address: buyerAddress },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('订单创建成功！', 'success');
      setOrderModalOpen(false);
      navigate('/orders');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '下单失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← 返回
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')}>全部商品</button>
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
                <span className={styles.discountBadge}>{discount}折</span>
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
              <span className={styles.price}>¥{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className={styles.originalPrice}>
                    ¥{product.originalPrice.toLocaleString()}
                  </span>
                  <span className={styles.saveBadge}>
                    省 ¥{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* 属性 */}
            <div className={styles.attrs}>
              <div className={styles.attr}>
                <span className={styles.attrKey}>成色</span>
                <div>
                  <span className={`badge badge-${product.condition === '全新' ? 'new' : product.condition === '几乎全新' ? 'like-new' : 'good'}`}>
                    {product.condition}
                  </span>
                  <p className={styles.attrNote}>{conditionLabel[product.condition]}</p>
                </div>
              </div>
              <div className={styles.attr}>
                <span className={styles.attrKey}>尺寸</span>
                <span className={styles.attrVal}>{product.size}</span>
              </div>
              <div className={styles.attr}>
                <span className={styles.attrKey}>分类</span>
                <span className={styles.attrVal}>{product.category}</span>
              </div>
              {product.platform && (
                <div className={styles.attr}>
                  <span className={styles.attrKey}>来源</span>
                  <span className={styles.attrVal}>{product.platform}</span>
                </div>
              )}
            </div>

            <div className={styles.divider} />

            {/* 操作按钮 */}
            <div className={styles.actions}>
              {product.status === '待售' ? (
                <>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setOrderModalOpen(true)}
                    style={{ flex: 1 }}
                  >
                    立即购买
                  </button>
                  <button
                    className={`btn btn-secondary btn-lg ${isInCart(product.id) ? styles.inCart : ''}`}
                    onClick={() => {
                      if (!isInCart(product.id)) {
                        addItem(product);
                        showToast('已加入购物车', 'success');
                      }
                    }}
                    disabled={isInCart(product.id)}
                  >
                    {isInCart(product.id) ? '已在购物车' : '加入购物车'}
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%' }}>
                  {product.status === '已售' ? '已售出' : '已下架'}
                </button>
              )}
            </div>

            {/* 服务 */}
            <div className={styles.services}>
              <div className={styles.service}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                专业鉴定
              </div>
              <div className={styles.service}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                顺丰保价
              </div>
              <div className={styles.service}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                7天退换
              </div>
            </div>
          </div>
        </div>

        {/* 商品描述 */}
        <div className={styles.descSection}>
          <h2 className={styles.descTitle}>商品描述</h2>
          <p className={styles.desc}>{product.description}</p>
          <p className={styles.meta}>
            上架时间：{new Date(product.createdAt).toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>

      {/* 购买模态框 */}
      {orderModalOpen && (
        <div className="modal-overlay" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>确认购买</h2>
              <button className={styles.closeBtn} onClick={() => setOrderModalOpen(false)}>×</button>
            </div>

            <div className={styles.modalProduct}>
              <img src={images[0]} alt={product.title} className={styles.modalImg} />
              <div>
                <p className={styles.modalTitle}>{product.title}</p>
                <p className={styles.modalPrice}>¥{product.price.toLocaleString()}</p>
              </div>
            </div>

            <div className={styles.form}>
              <div className="form-group">
                <label className="form-label">收货人姓名 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入收货人姓名"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">联系电话 *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="请输入手机号"
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">收货地址 *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="请输入详细收货地址"
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalTotal}>
              <span>实付金额</span>
              <span className={styles.totalPrice}>¥{product.price.toLocaleString()}</span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={handleBuy}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认下单'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
