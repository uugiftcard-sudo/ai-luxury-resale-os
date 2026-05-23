/**
 * HK Home — Traditional Chinese luxury resale landing page for Hong Kong.
 * Prices shown in HKD, copy in Traditional Chinese.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi, brandApi, categoryApi } from '../api/client';
import type { Product, Brand, Category } from '../types';
import { Market } from '../types/market';
import styles from './Home.module.css';

const HK_MARKET: Market = 'HK';

export default function HKHome() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLElement | null>(null);
  const categoriesRef = useRef<HTMLElement | null>(null);
  const featuredRef = useRef<HTMLElement | null>(null);
  const brandsRef = useRef<HTMLElement | null>(null);
  const trustRef = useRef<HTMLElement | null>(null);

  // Hero entrance animation
  useEffect(() => {
    if (!heroRef.current) return;
    const targets = heroRef.current.querySelectorAll<HTMLElement>('.reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  // Scroll-reveal for other sections
  useEffect(() => {
    const refs = [categoriesRef, featuredRef, brandsRef, trustRef];
    const observers: IntersectionObserver[] = [];
    refs.forEach(ref => {
      if (!ref.current) return;
      const targets = ref.current.querySelectorAll<HTMLElement>('.reveal');
      if (!targets.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      targets.forEach(t => obs.observe(t));
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  useEffect(() => {
    Promise.all([
      productApi.list(HK_MARKET, { status: '待售', limit: 8 }),
      brandApi.list(HK_MARKET),
      categoryApi.list(HK_MARKET),
    ]).then(([productRes, brandList, categoryList]) => {
      setFeatured(productRes.data);
      setBrands(brandList);
      setCategories(categoryList);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <p className={`${styles.heroEyebrow} reveal`}>認證奢品 · 全港送遞</p>
            <h1 className={`${styles.heroTitle} reveal delay-1`}>
              循環奢品<br />
              <em>煥然一新</em>
            </h1>
            <p className={`${styles.heroDesc} reveal delay-2`}>
              嚴格鑑定每一件，Chanel、Gucci、Hermès 等頂級品牌。
              香港本地或跨境直送，讓奢品觸手可及。
            </p>
            <div className={`${styles.heroBadge} reveal delay-3`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <strong>500+</strong> 件認證商品 · <strong>10+</strong> 國際品牌
            </div>
            <div className={`${styles.heroCta} reveal delay-4`}>
              <Link to="/hk/products" className="btn btn-primary btn-lg">
                立即選購
              </Link>
              <Link to="/hk/products?category=包袋" className="btn btn-secondary btn-lg">
                看看袋款
              </Link>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>件認證商品</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>10+</span>
              <span className={styles.statLabel}>國際品牌</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>1,200+</span>
              <span className={styles.statLabel}>滿意買家</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 分類導航 ──────────────────────────────────────────────────── */}
      <section className={styles.categories} ref={categoriesRef}>
        <div className="container">
          <div className={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/hk/products?category=${cat.name}`}
                className={`${styles.categoryCard} reveal`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 精選好物 ────────────────────────────────────────────────── */}
      <section className={styles.featured} ref={featuredRef}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={`${styles.sectionTitle} reveal`}>精選好物</h2>
              <p className={`${styles.sectionSub} reveal delay-1`}>Editor's Picks</p>
            </div>
            <Link to="/hk/products" className="btn btn-secondary">
              查看全部 →
            </Link>
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeleton}>
                  <div className={styles.skeletonImg} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonText} style={{ width: '60%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-products">
              {featured.map((p, i) => (
                <div key={p.id} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 品牌牆 ────────────────────────────────────────────────── */}
      <section className={styles.brands} ref={brandsRef}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={`${styles.sectionTitle} reveal`}>熱門品牌</h2>
              <p className={`${styles.sectionSub} reveal delay-1`}>Top Brands</p>
            </div>
          </div>
          <div className={styles.brandGrid}>
            {brands.map((b, i) => (
              <Link
                key={b.id}
                to={`/hk/products?brand=${b.nameEn}`}
                className={`${styles.brandCard} reveal`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className={styles.brandNameCn}>{b.name}</span>
                <span className={styles.brandNameEn}>{b.nameEn}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 服務保障 ──────────────────────────────────────────────── */}
      <section className={styles.trust} ref={trustRef}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={`${styles.trustItem} reveal`}>
              <div className={styles.trustIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h4>認證鑑定</h4>
              <p>每件商品由專業鑑定師鑑定</p>
            </div>
            <div className={`${styles.trustItem} reveal delay-1`}>
              <div className={styles.trustIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h4>安全送遞</h4>
              <p>順豐/其他快遞，全程追蹤</p>
            </div>
            <div className={`${styles.trustItem} reveal delay-2`}>
              <div className={styles.trustIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h4>專屬客服</h4>
              <p>24小時在線，隨時答疑</p>
            </div>
            <div className={`${styles.trustItem} reveal delay-3`}>
              <div className={styles.trustIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h4>7天退換</h4>
              <p>收貨7天內可申請退換貨</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
