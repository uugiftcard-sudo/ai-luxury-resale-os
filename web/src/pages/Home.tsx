/**
 * 首页
 * 精选商品展示 + 分类导航 + 品牌墙
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi, brandApi, categoryApi } from '../api/client';
import type { Product, Brand, Category } from '../types';
import styles from './Home.module.css';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.list({ status: '待售', limit: 8 }),
      brandApi.list(),
      categoryApi.list(),
    ]).then(([productRes, brandList, categoryList]) => {
      setFeatured(productRes.data);
      setBrands(brandList);
      setCategories(categoryList);
    }).catch(() => setLoading(false)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {/* Hero 区域 */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>二手奢品 · 正品保障</p>
            <h1 className={styles.heroTitle}>
              让奢品<br />
              <em>循环新生</em>
            </h1>
            <p className={styles.heroDesc}>
              汇聚全球顶级品牌的二手好物，Gucci、Chanel、Prada、Louis Vuitton...
              每件商品经过严格鉴定，让奢华触手可及。
            </p>
            <div className={styles.heroCta}>
              <Link to="/products" className="btn btn-primary btn-lg">
                探索全部商品
              </Link>
              <Link to="/products?category=包袋" className="btn btn-secondary btn-lg">
                看看包袋
              </Link>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>200+</span>
              <span className={styles.statLabel}>精选商品</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>10+</span>
              <span className={styles.statLabel}>顶级品牌</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>满意买家</span>
            </div>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.categoryGrid}>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.name}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 精选商品 */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>精选好物</h2>
              <p className={styles.sectionSub}>Editor's Picks</p>
            </div>
            <Link to="/products" className="btn btn-secondary">
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
              {featured.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 品牌墙 */}
      <section className={styles.brands}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>热门品牌</h2>
              <p className={styles.sectionSub}>Top Brands</p>
            </div>
          </div>
          <div className={styles.brandGrid}>
            {brands.map(b => (
              <Link
                key={b.id}
                to={`/products?brand=${b.nameEn}`}
                className={styles.brandCard}
              >
                <span className={styles.brandNameCn}>{b.name}</span>
                <span className={styles.brandNameEn}>{b.nameEn}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 服务保障 */}
      <section className={styles.trust}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h4>正品鉴定</h4>
              <p>每件商品经过专业鉴定师鉴定</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h4>安全配送</h4>
              <p>顺丰保价包邮，全程物流追踪</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h4>专属客服</h4>
              <p>7×24小时在线，随时答疑</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h4>7天退换</h4>
              <p>收货7天内可申请退换货</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
