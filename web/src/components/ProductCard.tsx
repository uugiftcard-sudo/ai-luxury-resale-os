/**
 * ProductCard 组件
 * 商品卡片展示 — prices automatically formatted to the active market's currency.
 */
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useMarket } from '../hooks/useMarket';
import { displayPrice } from '../api/client';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
  /** Override the automatic market price (e.g. admin view always shows CNY) */
  forceMarket?: string;
}

const conditionMap: Record<string, string> = {
  '全新': 'badge-new',
  '几乎全新': 'badge-like-new',
  '轻微使用痕迹': 'badge-good',
  '有明显使用痕迹': 'badge-worn',
};

/** English condition labels shown on the UK market. */
const CONDITION_EN: Record<string, string> = {
  '全新': 'New',
  '几乎全新': 'Like New',
  '轻微使用痕迹': 'Good',
  '有明显使用痕迹': 'Well Used',
};

function discountRate(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round((1 - current / original) * 100);
}

export default function ProductCard({ product, forceMarket }: Props) {
  const { market, config } = useMarket();
  const activeMarket = forceMarket as typeof market | undefined ?? market;

  const discount = discountRate(product.originalPrice, product.price);
  const mainImage = product.images[0] ||
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400';

  const priceLabel = displayPrice(product.price, activeMarket);
  const originalPriceLabel = product.originalPrice > product.price
    ? displayPrice(product.originalPrice, activeMarket)
    : null;

  const conditionLabel =
    config.language === 'en' && CONDITION_EN[product.condition]
      ? CONDITION_EN[product.condition]
      : product.condition;

  return (
    <Link
      to={`/products/${product.id}`}
      className={styles.card}
    >
      {/* 图片 */}
      <div className={styles.imageWrap}>
        <img
          src={mainImage}
          alt={product.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <span className={styles.quickView}>
            {config.language === 'en' ? 'View Details' : '查看详情'}
          </span>
        </div>
        {discount > 0 && (
          <span className={styles.discountTag}>{discount}% off</span>
        )}
        {product.status !== '待售' && (
          <span className={`${styles.statusTag} ${styles.statusSold}`}>
            {product.status}
          </span>
        )}
      </div>

      {/* 信息 */}
      <div className={styles.info}>
        <div className={styles.brandRow}>
          <span className={styles.brand}>{product.brand}</span>
          {product.platform && (
            <span className={styles.platform}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
              {product.platform}
            </span>
          )}
        </div>

        <h3 className={styles.title}>{product.title}</h3>

        <div className={styles.meta}>
          <span className={`badge ${conditionMap[product.condition] || 'badge-good'}`}>
            {conditionLabel}
          </span>
          <span className={styles.size}>{product.size}</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>{priceLabel}</span>
          {originalPriceLabel && (
            <span className={styles.original}>{originalPriceLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
