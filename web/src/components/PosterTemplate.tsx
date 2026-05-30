/**
 * PosterTemplate
 * Hidden component that renders a promotional poster for the given product.
 * Designed for Instagram/Xiaohongshu social sharing.
 * Dimensions: 1080x1350px (Instagram portrait 4:5 ratio)
 *
 * This component is never shown — it's rendered off-screen and captured
 * by html2canvas to generate a downloadable PNG image.
 */
import type { Product } from '../types';
import { displayPrice } from '../api/client';
import { Market } from '../types/market';

interface Props {
  product: Product;
  market: Market;
}

/** Deterministic QR-like pattern — seeded from product id to avoid re-render flicker */
function qrcell(productId: string, index: number): string {
  const code = productId + String(index * 7 + 3);
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const ch = code.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return (Math.abs(hash) % 100) > 42 ? '#1a1a2e' : '#ffffff';
}

/** Market-specific shop URL */
const MARKET_URL: Record<string, string> = {
  UK: 'cloth-uk.com',
  HK: 'cloth-hk.com',
  CN: 'cloth.cn',
};

export default function PosterTemplate({ product, market }: Props) {
  const priceLabel = displayPrice(product.price, market);
  const originalPriceLabel =
    product.originalPrice > product.price
      ? displayPrice(product.originalPrice, market)
      : null;
  const discount =
    product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  const mainImage =
    product.images[0] ||
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1080';

  const marketCopy = {
    HK: {
      eyebrow: '認證奢品 · 全港送遞',
      tagline: '循環奢品，煥然一新',
      brand: 'CLOTH',
      brandSub: '認證奢品',
      shopNow: '立即選購',
    },
    UK: {
      eyebrow: 'Authenticated Luxury · Same-Day UK Delivery',
      tagline: 'Pre-Loved Luxury, Perfected.',
      brand: 'CLOTH',
      brandSub: 'Authenticated Luxury',
      shopNow: 'Shop Now',
    },
    CN: {
      eyebrow: '二手奢品 · 正品保障',
      tagline: '让奢品循环新生',
      brand: 'CLOTH',
      brandSub: '二手奢品',
      shopNow: '立即选购',
    },
  };

  const copy = marketCopy[market] ?? marketCopy.CN;

  return (
    <div
      id="cloth-poster-template"
      style={{
        width: '1080px',
        height: '1350px',
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top brand bar ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 40px',
          background: 'rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 900,
              letterSpacing: '6px',
              color: '#ffffff',
            }}
          >
            CLOTH
          </span>
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {copy.brandSub}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#e94560',
              boxShadow: '0 0 12px #e94560',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
            }}
          >
            {copy.eyebrow}
          </span>
        </div>
      </div>

      {/* ── Product Image ───────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <img
          src={mainImage}
          alt={product.title}
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Gradient overlay for readability */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '55%',
            background:
              'linear-gradient(to top, rgba(26,26,46,0.95) 0%, rgba(26,26,46,0.6) 50%, transparent 100%)',
          }}
        />

        {/* Discount badge */}
        {discount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '24px',
              right: '32px',
              background: '#e94560',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 800,
              padding: '8px 18px',
              borderRadius: '40px',
              letterSpacing: '1px',
              boxShadow: '0 4px 20px rgba(233,69,96,0.5)',
            }}
          >
            {discount}% OFF
          </div>
        )}

        {/* Condition badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            left: '40px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            padding: '6px 14px',
            borderRadius: '30px',
            letterSpacing: '1px',
          }}
        >
          {product.condition}
        </div>
      </div>

      {/* ── Bottom info panel ────────────────────────────────────── */}
      <div
        style={{
          padding: '32px 40px 36px',
          background: '#1a1a2e',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Brand + Title */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.45)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {product.brand}
          </div>
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              margin: 0,
              letterSpacing: '0.3px',
            }}
          >
            {product.title.length > 50
              ? product.title.slice(0, 50) + '...'
              : product.title}
          </h2>
        </div>

        {/* Price row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#e94560',
              lineHeight: 1,
            }}
          >
            {priceLabel}
          </span>
          {originalPriceLabel && (
            <span
              style={{
                fontSize: '20px',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'line-through',
              }}
            >
              {originalPriceLabel}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          {[
            product.category,
            product.size,
            market === 'UK' ? 'Size' : '尺寸',
          ].map(
            (item) =>
              item && (
                <div
                  key={item}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {item}
                </div>
              ),
          )}
        </div>

        {/* CTA + QR placeholder */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#e94560',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {market === 'UK' ? 'Visit' : '歡迎蒞臨'}
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                }}
              >
                {MARKET_URL[market] ?? MARKET_URL.CN}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {/* QR code placeholder — decorative box */}
            <div
              style={{
                width: '72px',
                height: '72px',
                background: '#ffffff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '2px',
                padding: '8px',
                boxSizing: 'border-box',
              }}
            >
              {/* Decorative QR-like pattern */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '2px',
                  width: '56px',
                  height: '56px',
                }}
              >
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: qrcell(product.id, i),
                      borderRadius: '1px',
                    }}
                  />
                ))}
              </div>
            </div>
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {market === 'UK' ? 'Scan to shop' : market === 'HK' ? '掃碼選購' : '扫码选购'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
