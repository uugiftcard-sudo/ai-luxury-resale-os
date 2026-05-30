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
  brand: string;
  categories: { label: string; href: string }[];
  brands: { label: string; href: string }[];
  about: { label: string; href: string; comingSoon?: boolean }[];
  socialTitle: string;
  socials: { label: string; href: string; comingSoon?: boolean; icon: 'xiaohongshu' | 'wechat' }[];
  copyright: string;
  legal: string;
}> = {
  UK: {
    tagline: 'Authenticated Pre-Loved Luxury',
    description: 'Hand-picked, authenticated luxury fashion. Sustainable style that looks incredible — and costs far less.',
    categoryTitle: 'Shop',
    brandTitle: 'Brands',
    aboutTitle: 'Company',
    brand: 'CLOTH',
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
      { label: 'About Us', href: '/about', comingSoon: false },
      { label: 'Authentication Process', href: '/authentication', comingSoon: false },
      { label: 'Delivery & Returns', href: '/delivery', comingSoon: false },
      { label: 'Privacy Policy', href: '/privacy', comingSoon: false },
      { label: 'Contact Us', href: '/contact', comingSoon: false },
      { label: 'Support Centre', href: '/support', comingSoon: false },
    ],
    socialTitle: 'Follow Us',
    socials: [
      { label: '小红书', href: '#', comingSoon: true, icon: 'xiaohongshu' },
      { label: 'WeChat', href: '#', comingSoon: true, icon: 'wechat' },
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
    brand: 'CLOTH',
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
      { label: '關於我們', href: '/hk/about', comingSoon: false },
      { label: '正品保障', href: '/hk/authentication', comingSoon: false },
      { label: '送貨與退換', href: '/hk/delivery', comingSoon: false },
      { label: '隱私政策', href: '/hk/privacy', comingSoon: false },
      { label: '聯絡我們', href: '/hk/contact', comingSoon: false },
      { label: '客戶服務', href: '/hk/support', comingSoon: false },
    ],
    socialTitle: '關注我們',
    socials: [
      { label: '小紅書', href: '#', comingSoon: true, icon: 'xiaohongshu' },
      { label: '微信', href: '#', comingSoon: true, icon: 'wechat' },
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
    brand: 'CLOTH',
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
      { label: '关于我们', href: '/cn/about', comingSoon: false },
      { label: '正品保障', href: '/cn/authentication', comingSoon: false },
      { label: '配送与退换', href: '/cn/delivery', comingSoon: false },
      { label: '隐私条款', href: '/cn/privacy', comingSoon: false },
      { label: '联系我们', href: '/cn/contact', comingSoon: false },
      { label: '帮助中心', href: '/cn/support', comingSoon: false },
    ],
    socialTitle: '关注我们',
    socials: [
      { label: '小红书', href: '#', comingSoon: true, icon: 'xiaohongshu' },
      { label: '微信', href: '#', comingSoon: true, icon: 'wechat' },
    ],
    copyright: `© ${new Date().getFullYear()} CLOTH. 让奢品循环新生`,
    legal: '本平台商品图片仅供展示，请以实物为准',
  },
};

function XiaohongshuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.15" />
      <path d="M7 8h10M7 12h6M7 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WechatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10.5C8 9.12 9.34 8 10.5 8C11.66 8 13 9.12 13 10.5C13 11.88 11.66 13 10.5 13C9.34 13 8 11.88 8 10.5Z" fill="currentColor" />
      <path d="M12 10.5C12 9.12 13.34 8 14.5 8C15.66 8 17 9.12 17 10.5C17 11.88 15.66 13 14.5 13C13.34 13 12 11.88 12 10.5Z" fill="currentColor" />
      <path d="M12 15C9.5 15 4 16.5 4 19V21H20V19C20 16.5 14.5 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8C17 8 18.5 9 19 10C19.5 11 19 12 19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, () => JSX.Element> = {
  xiaohongshu: XiaohongshuIcon,
  wechat: WechatIcon,
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
            <div className={styles.logoMark}>{t.brand}</div>
            <p className={styles.tagline}>{t.tagline}</p>
            <p className={styles.description}>{t.description}</p>
            <div className={styles.socials}>
              <span className={styles.socialsLabel}>{t.socialTitle}</span>
              {t.socials.map((social) => {
                const SocialIcon = SOCIAL_ICONS[social.icon];
                if (social.comingSoon) {
                  return (
                    <span
                      key={social.icon}
                      className={styles.socialIconDisabled}
                      title="即將推出"
                      data-testid={`footer-social-${social.icon}-disabled`}
                    >
                      <SocialIcon />
                    </span>
                  );
                }
                return (
                  <a
                    key={social.icon}
                    href={social.href}
                    className={styles.socialIcon}
                    title={social.label}
                    aria-label={social.label}
                    data-testid={`footer-social-${social.icon}`}
                  >
                    <SocialIcon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 链接 */}
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>{t.categoryTitle}</h4>
              {t.categories.map((item) => (
                <Link key={item.href} to={item.href}>{item.label}</Link>
              ))}
            </div>
            <div className={styles.linkGroup}>
              <h4>{t.brandTitle}</h4>
              {t.brands.map((item) => (
                <Link key={item.href} to={item.href}>{item.label}</Link>
              ))}
            </div>
            <div className={styles.linkGroup}>
              <h4>{t.aboutTitle}</h4>
              {t.about.map((item) => {
                if (item.comingSoon) {
                  return (
                    <span key={`${item.label}-${item.href}`} className={styles.comingSoon} title="即將推出">
                      {item.label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    to={item.href}
                    data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p data-testid="footer-copyright">{t.copyright}</p>
          <p className={styles.legal} data-testid="footer-legal">{t.legal}</p>
        </div>
      </div>
    </footer>
  );
}
