/**
 * Wishlist page — displays saved products
 * Reads product IDs from localStorage via useWishlist.
 * Fetches full product data from the API.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useMarket } from '../hooks/useMarket';
import { productApi } from '../api/client';
import { displayPrice } from '../api/client';
import type { Product } from '../types';
import styles from './Wishlist.module.css';

const CONDITION_LABELS: Record<string, { label: string; cls: string }> = {
  '全新':            { label: '全新', cls: 'badge--success' },
  '几乎全新':        { label: '几乎全新', cls: 'badge--info' },
  '轻微使用痕迹':    { label: '轻微使用痕迹', cls: 'badge--warning' },
  '有明显使用痕迹':  { label: '有明显使用痕迹', cls: 'badge--error' },
};

export default function Wishlist() {
  const { wishlist, toggle } = useWishlist();
  const { market } = useMarket();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    productApi.list(market, { limit: 100 })
      .then(res => {
        // Only keep wishlisted products
        const ids = new Set(wishlist);
        const filtered = (res.data ?? []).filter((p: Product) => ids.has(p.id));
        setProducts(filtered);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlist, market]);

  const title = market === 'UK' ? 'My Wishlist'
    : market === 'HK' ? '我的心願清單'
    : '我的心愿单';

  const emptyTitle = market === 'UK' ? 'Your wishlist is empty'
    : market === 'HK' ? '心願清單是空的'
    : '心愿单是空的';

  const emptyDesc = market === 'UK'
    ? 'Save items you love by tapping the heart icon.'
    : market === 'HK'
    ? '點擊心形圖標收藏心儀商品。'
    : '点击心形图标收藏心仪商品。';

  return (
    <div className="page">
      <div className="container">

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1>{title}</h1>
            <p>
              {wishlist.length === 0
                ? emptyDesc
                : `${wishlist.length} 件心儀商品`
              }
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingWrap}>
            <div className="spinner" />
          </div>
        )}

        {/* Empty state */}
        {!loading && wishlist.length === 0 && (
          <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3>{emptyTitle}</h3>
            <p>{emptyDesc}</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              {market === 'UK' ? 'Browse Products' : market === 'HK' ? '瀏覽商品' : '浏览商品'}
            </Link>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid-products">
            {products.map(product => {
              const cond = CONDITION_LABELS[product.condition];
              const discount = product.originalPrice > 0
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0;
              return (
                <div key={product.id} className={`card ${styles.card}`}>
                  {/* Image */}
                  <Link to={`/products/${product.id}`} className={styles.imageWrap}>
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'}
                      alt={product.title}
                      className={styles.image}
                      loading="lazy"
                    />
                    {discount > 0 && (
                      <span className={`badge badge--accent ${styles.discountTag}`}>
                        −{discount}%
                      </span>
                    )}
                    <button
                      className={`${styles.heartBtn} ${styles.heartActive}`}
                      onClick={e => { e.preventDefault(); toggle(product.id); }}
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </Link>

                  {/* Info */}
                  <div className={styles.info}>
                    <p className={styles.brand}>{product.brand}</p>
                    <Link to={`/products/${product.id}`} className={styles.title}>
                      {product.title}
                    </Link>
                    <div className={styles.footer}>
                      <div className={styles.prices}>
                        <span className={styles.price}>{displayPrice(product.price, market)}</span>
                        {product.originalPrice > 0 && (
                          <span className={styles.originalPrice}>
                            {displayPrice(product.originalPrice, market)}
                          </span>
                        )}
                      </div>
                      {cond && (
                        <span className={`badge ${cond.cls} ${styles.condBadge}`}>
                          {cond.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product not found (was wishlisted but deleted from catalog) */}
        {!loading && wishlist.length > 0 && products.length === 0 && (
          <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>商品已下架</h3>
            <p>部分心愿单商品已下架或不存在，已为您清理。</p>
          </div>
        )}

      </div>
    </div>
  );
}
