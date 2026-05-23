/**
 * Header 组件
 * 全局顶部导航栏 — includes market selector dropdown.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../hooks/useCart';
import { useMarket } from '../hooks/useMarket';
import type { Market } from '../types/market';
import styles from './Header.module.css';

// ── Market flag + label config ───────────────────────────────────────────────
const MARKET_OPTIONS: { value: Market; flag: string; label: string; url: string }[] = [
  { value: 'UK', flag: '🇬🇧', label: 'United Kingdom', url: '/' },
  { value: 'HK', flag: '🇭🇰', label: 'Hong Kong', url: '/hk' },
  { value: 'CN', flag: '🇨🇳', label: '中国', url: '/cn' },
];

// ── Category config per market ───────────────────────────────────────────────
const CATEGORY_LINKS: Record<Market, { label: string; param: string }[]> = {
  UK: [
    { label: 'All Products', param: '' },
    { label: 'Bags',         param: 'Bags' },
    { label: 'Clothing',     param: 'Clothing' },
    { label: 'Shoes',        param: 'Shoes' },
  ],
  HK: [
    { label: '全部商品', param: '' },
    { label: '袋款',     param: '包袋' },
    { label: '服飾',     param: '服饰' },
    { label: '鞋履',     param: '鞋履' },
  ],
  CN: [
    { label: '全部商品', param: '' },
    { label: '包袋',     param: '包袋' },
    { label: '服饰',     param: '服饰' },
    { label: '鞋履',     param: '鞋履' },
  ],
};
const NAV_COPY: Record<Market, { orders: string; admin: string; search: string; cart: string; support: string; inventory: string; finance: string }> = {
  UK: {
    orders: 'My Orders',
    admin: 'Admin',
    search: 'Search brands, products...',
    cart: 'Cart',
    support: 'Support',
    inventory: 'Warehouse',
    finance: 'Finance',
  },
  HK: {
    orders: '我的訂單',
    admin: '管理',
    search: '搜尋品牌、商品...',
    cart: '購物車',
    support: '客服',
    inventory: '倉庫',
    finance: '財務',
  },
  CN: {
    orders: '我的订单',
    admin: '管理',
    search: '搜索品牌、商品...',
    cart: '购物车',
    support: '客服',
    inventory: '仓库',
    finance: '财务',
  },
};

export default function Header() {
  const { totalItems } = useCart();
  const { market, setMarket } = useMarket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);

  // Close market dropdown on outside click or Escape
  useEffect(() => {
    if (!marketOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMarketOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (marketRef.current && !marketRef.current.contains(e.target as Node)) {
        setMarketOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [marketOpen]);

  const t = NAV_COPY[market] ?? NAV_COPY.CN;
  const currentMarket = MARKET_OPTIONS.find(m => m.value === market)!;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setMenuOpen(false);
    }
  }

  function handleMarketSelect(m: Market) {
    const opt = MARKET_OPTIONS.find(o => o.value === m)!;
    setMarket(m);
    setMarketOpen(false);
    navigate(opt.url);
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ── Market Selector ─────────────────────────────────────────── */}
        <div className={styles.marketSelector} ref={marketRef}>
          <button
            className={styles.marketBtn}
            onClick={() => setMarketOpen(o => !o)}
            aria-label="Select market"
            aria-expanded={marketOpen ? 'true' : 'false'}
            aria-haspopup="listbox"
            aria-controls="market-dropdown"
          >
            <span className={styles.marketFlag}>{currentMarket.flag}</span>
            <span className={styles.marketLabel}>
              {market === 'UK' ? 'UK' : market === 'HK' ? 'HK' : 'CN'}
            </span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={marketOpen ? styles.chevronUp : ''}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {marketOpen && (
            <div
              className={styles.marketDropdown}
              id="market-dropdown"
              role="listbox"
              tabIndex={-1}
              aria-label="Select market"
            >
              {MARKET_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === market ? 'true' : 'false'}
                  className={`${styles.marketOption} ${opt.value === market ? styles.marketOptionActive : ''}`}
                  onClick={() => handleMarketSelect(opt.value)}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleMarketSelect(opt.value)}
                >
                  <span className={styles.marketFlag}>{opt.flag}</span>
                  <span>{opt.label}</span>
                  {opt.value === market && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <Link
          to={currentMarket.url}
          className={styles.logo}
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.logoMark}>CLOTH</span>
          <span className={styles.logoSub}>
            {market === 'UK' ? '' : market === 'HK' ? '認證奢品' : '二手奢品'}
          </span>
        </Link>

        {/* ── Search ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder={t.search}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className={styles.searchInput}
            aria-label={t.search}
          />
          <button type="submit" className={styles.searchBtn} aria-label="搜索">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        {/* ── Nav ────────────────────────────────────────────────────── */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} id="mobile-nav" aria-label="Main navigation">
          {CATEGORY_LINKS[market].map(cat => (
            <Link
              key={cat.label}
              to={cat.param ? `/products?category=${encodeURIComponent(cat.param)}` : '/products'}
              onClick={() => setMenuOpen(false)}
            >
              {cat.label}
            </Link>
          ))}
          <Link to="/orders" onClick={() => setMenuOpen(false)}>{t.orders}</Link>
          <Link to="/support" onClick={() => setMenuOpen(false)}>{t.support}</Link>
          <Link to="/inventory" onClick={() => setMenuOpen(false)}>{t.inventory}</Link>
          <Link to="/finance" onClick={() => setMenuOpen(false)}>{t.finance}</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className={styles.adminLink}>{t.admin}</Link>
        </nav>

        {/* ── Cart + Menu ───────────────────────────────────────────── */}
        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartBtn} aria-label={t.cart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </Link>

          <button
            className={`${styles.menuBtn} ${menuOpen ? styles.menuOpen : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="菜单"
            aria-expanded={menuOpen ? 'true' : 'false'}
            aria-controls="mobile-nav"
          >
            <span className={styles.menuLine} />
          </button>
        </div>
      </div>
    </header>
  );
}
