/**
 * Footer 组件
 * 全局底部栏 — adapts copy and links to the active market.
 */
import { Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket';
import styles from './Footer.module.css';

const FOOTER_COPY: Record<string, {
  tagline: string;
  description: string;
  categoryTitle: string;
  brandTitle: string;
  aboutTitle: string;
  categories: { label: string; href: string }[];
  brands: { label: string; href: string }[];
  about: { label: string; href: string }[];
  copyright: string;
  legal: string;
}> = {
  UK: {
    tagline: 'Authenticated Pre-Loved Luxury',
    description: 'Hand-picked, authenticated luxury fashion. Sustainable style that looks incredible — and costs far less.',
    categoryTitle: 'Shop',
    brandTitle: 'Brands',
    aboutTitle: 'Company',
    categories: [
      { label: 'All Products', href: '/products' },
      { label: 'Bags', href: '/products?category=包袋' },
      { label: 'Clothing', href: '/products?category=服饰' },
      { label: 'Shoes', href: '/products?category=鞋履' },
      { label: 'Accessories', href: '/products?category=配饰' },
    ],
    brands: [
      { label: 'Gucci', href: '/products?brand=Gucci' },
      { label: 'Chanel', href: '/products?brand=Chanel' },
      { label: 'Prada', href: '/products?brand=Prada' },
      { label: 'Louis Vuitton', href: '/products?brand=Louis+Vuitton' },
      { label: 'Hermès', href: '/products?brand=Herm%C3%A8s' },
    ],
    about: [
      { label: 'About Us', href: '#' },
      { label: 'Support', href: '/support' },
      { label: 'Authentication Process', href: '#' },
      { label: 'Delivery & Returns', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Admin', href: '/admin' },
      { label: 'Warehouse', href: '/admin/warehouse' },
    ],
    copyright: `© ${new Date().getFullYear()} CLOTH UK. All rights reserved.`,
    legal: 'All items are pre-owned. Please refer to individual product listings for condition details.',
  },
  HK: {
    tagline: '認證奢品平台',
    description: '匯聚全球頂級品牌的認證二手好物，讓奢品觸手可及。',
    categoryTitle: '商品分類',
    brandTitle: '熱門品牌',
    aboutTitle: '關於我們',
    categories: [
      { label: '全部商品', href: '/hk/products' },
      { label: '袋款', href: '/hk/products?category=包袋' },
      { label: '服飾', href: '/hk/products?category=服饰' },
      { label: '鞋履', href: '/hk/products?category=鞋履' },
      { label: '配飾', href: '/hk/products?category=配飾' },
    ],
    brands: [
      { label: 'Gucci', href: '/hk/products?brand=Gucci' },
      { label: 'Chanel', href: '/hk/products?brand=Chanel' },
      { label: 'Prada', href: '/hk/products?brand=Prada' },
      { label: 'Louis Vuitton', href: '/hk/products?brand=Louis+Vuitton' },
      { label: 'Hermès', href: '/hk/products?brand=Herm%C3%A8s' },
    ],
    about: [
      { label: '關於我們', href: '#' },
      { label: '客戶服務', href: '/hk/support' },
      { label: '正品保障', href: '#' },
      { label: '送貨與退換', href: '#' },
      { label: '隱私政策', href: '#' },
      { label: '聯絡我們', href: '#' },
      { label: '管理後台', href: '/hk/admin' },
      { label: '倉庫後台', href: '/hk/admin/warehouse' },
    ],
    copyright: `© ${new Date().getFullYear()} CLOTH HK. 保留所有權利。`,
    legal: '本平台商品圖片僅供展示，請以實物為準。',
  },
  CN: {
    tagline: '二手奢品 · 正品保障',
    description: '中国领先的二手奢侈品时尚交易平台，精选正品保障，让奢品循环新生。',
    categoryTitle: '商品分类',
    brandTitle: '热门品牌',
    aboutTitle: '关于 CLOTH',
    categories: [
      { label: '全部商品', href: '/cn/products' },
      { label: '包袋', href: '/cn/products?category=包袋' },
      { label: '服饰', href: '/cn/products?category=服饰' },
      { label: '鞋履', href: '/cn/products?category=鞋履' },
      { label: '配饰', href: '/cn/products?category=配饰' },
    ],
    brands: [
      { label: 'Gucci', href: '/cn/products?brand=Gucci' },
      { label: 'Chanel', href: '/cn/products?brand=Chanel' },
      { label: 'Prada', href: '/cn/products?brand=Prada' },
      { label: 'Louis Vuitton', href: '/cn/products?brand=Louis+Vuitton' },
      { label: 'Hermès', href: '/cn/products?brand=Herm%C3%A8s' },
    ],
    about: [
      { label: '关于我们', href: '#' },
      { label: '客户服务', href: '/cn/support' },
      { label: '正品保障', href: '#' },
      { label: '交易流程', href: '#' },
      { label: '隐私条款', href: '#' },
      { label: '帮助中心', href: '#' },
      { label: '管理后台', href: '/cn/admin' },
      { label: '仓库后台', href: '/cn/admin/warehouse' },
    ],
    copyright: `© ${new Date().getFullYear()} CLOTH. 让奢品循环新生`,
    legal: '本平台商品图片仅供展示，请以实物为准',
  },
};

export default function Footer() {
  const { market } = useMarket();
  const t = FOOTER_COPY[market] ?? FOOTER_COPY.CN;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          {/* 品牌区 */}
          <div className={styles.brand}>
            <div className={styles.logoMark}>CLOTH</div>
            <p className={styles.tagline}>{t.tagline}</p>
            <p className={styles.description}>{t.description}</p>
            <div className={styles.socials}>
              <a href="#" aria-label="小红书" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </a>
              <a href="#" aria-label="微信" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 11c-.83 0-1.5.67-1.5 1.5S7.67 14 8.5 14s1.5-.67 1.5-1.5S9.33 11 8.5 11zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 链接 */}
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>{t.categoryTitle}</h4>
              {t.categories.map(item => (
                <Link key={item.href} to={item.href}>{item.label}</Link>
              ))}
            </div>
            <div className={styles.linkGroup}>
              <h4>{t.brandTitle}</h4>
              {t.brands.map(item => (
                <Link key={item.href} to={item.href}>{item.label}</Link>
              ))}
            </div>
            <div className={styles.linkGroup}>
              <h4>{t.aboutTitle}</h4>
              {t.about.map(item => (
                item.href.startsWith('/') ? (
                  <Link key={item.href} to={item.href}>{item.label}</Link>
                ) : (
                  <a key={item.href} href={item.href}>{item.label}</a>
                )
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>{t.copyright}</p>
          <p className={styles.legal}>{t.legal}</p>
        </div>
      </div>
    </footer>
  );
}
