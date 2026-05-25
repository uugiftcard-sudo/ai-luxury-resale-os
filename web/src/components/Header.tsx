/**
 * Header 组件
 * 全局顶部导航栏 — includes market selector dropdown.
 * Mobile: hamburger drawer + mobile search bar.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../hooks/useCart';
import { useMarket } from '../hooks/useMarket';
import type { Market } from '../types/market';
import styles from './Header.module.css';
import { useWishlist } from '../hooks/useWishlist';

// ── Market flag + label config ───────────────────────────────────────────────
const MARKET_OPTIONS: { value: Market; flag: string; label: string; url: string }[] = [
  { value: 'UK', flag: '🇬🇧', label: 'United Kingdom', url: '/' },
  { value: 'HK', flag: '🇭🇰', label: 'Hong Kong', url: '/hk' },
  { value: 'CN', flag: '🇨🇳', label: '中國', url: '/cn' },
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
    { label: '服飾',     param: '服饰' },
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
    orders: '我的訂單',
    admin: '管理',
    search: '搜尋品牌、商品...',
    cart: '購物車',
    support: '客服',
    inventory: '倉庫',
    finance: '財務',
  },
};

export default function Header() {
  const { totalItems } = useCart();
  const { market, setMarket } = useMarket();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileSearchValue, setMobileSearchValue] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);

  // ── Body scroll lock ───────────────────────────────────────────
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Mobile nav: Escape key + backdrop click ───────────────────
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

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

  // Close mobile nav on route click
  function closeMenu() { setMenuOpen(false); }

  const t = NAV_COPY[market] ?? NAV_COPY.CN;
  const currentMarket = MARKET_OPTIONS.find(m => m.value === market)!;

  function marketPath(path: string): string {
    if (path.startsWith('http')) return path;
    const prefix = market === 'UK' ? '' : `/${market.toLowerCase()}`;
    if (path === '/') return prefix || '/';
    return `${prefix}${path}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(marketPath(`/products?search=${encodeURIComponent(searchValue.trim())}`));
      setSearchValue('');
      setMenuOpen(false);
    }
  }

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    if (mobileSearchValue.trim()) {
      navigate(marketPath(`/products?search=${encodeURIComponent(mobileSearchValue.trim())}`));
      setMobileSearchValue('');
      setMenuOpen(false);
    }
  }

  function handleMarketSelect(m: Market) {
    const opt = MARKET_OPTIONS.find(o => o.value === m)!;
    setMarket(m);
    setMarketOpen(false);
    setMenuOpen(false);
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
        {menuOpen && (
          <button
            type="button"
            className={styles.mobileBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-label="關閉選單背景"
          />
        )}
        <nav
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
          id="mobile-nav"
          aria-label="Main navigation"
        >
          {/* Mobile nav header */}
          <div className={styles.navHeader}>
            <span className={styles.navTitle}>功能目錄</span>
            <button
              className={styles.navClose}
              onClick={() => setMenuOpen(false)}
              aria-label="關閉選單"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Core nav */}
          <Link to={currentMarket.url} onClick={closeMenu} className={styles.mobileNavOnly}>
            {market === 'UK' ? 'Home' : '首頁'}
          </Link>
          <Link to={marketPath('/products')} onClick={closeMenu} className={styles.mobileNavOnly}>
            {market === 'UK' ? 'Products' : '全部商品'}
          </Link>
          {CATEGORY_LINKS[market].map(cat => (
            (cat.param || !menuOpen) && (
            <Link key={cat.label} to={cat.param ? marketPath(`/products?category=${encodeURIComponent(cat.param)}`) : marketPath('/products')} onClick={closeMenu}>
              {cat.label}
            </Link>
            )
          ))}
          <Link to={marketPath('/orders')} onClick={closeMenu}>{t.orders}</Link>
          <Link to={marketPath('/cart')} onClick={closeMenu}>
            {t.cart}
            {totalItems > 0 && <span className={styles.navCartBadge}>{totalItems}</span>}
          </Link>
          <Link to={marketPath('/wishlist')} onClick={closeMenu}>
            {market === 'UK' ? 'Wishlist' : '心願清單'}
            {wishlistCount > 0 && <span className={styles.navCartBadge}>{wishlistCount}</span>}
          </Link>
          <Link to={marketPath('/support')} onClick={closeMenu}>{t.support}</Link>

          {/* Admin / ops section */}
          <span className={styles.navSectionLabel}>後台管理</span>
          <Link to={marketPath('/admin')} onClick={closeMenu} className={styles.adminLink}>{t.admin}</Link>
          <Link to={marketPath('/inventory')} onClick={closeMenu}>{t.inventory}</Link>
          <Link to={marketPath('/finance')} onClick={closeMenu}>{t.finance}</Link>
        </nav>

        {/* ── Mobile Search Bar ─────────────────────────────────────── */}
        <div className={styles.mobileSearch}>
          <form onSubmit={handleMobileSearch} className={styles.mobileSearchForm}>
            <input
              type="text"
              placeholder={t.search}
              value={mobileSearchValue}
              onChange={e => setMobileSearchValue(e.target.value)}
              className={styles.mobileSearchInput}
              aria-label={t.search}
            />
            <button type="submit" className={styles.mobileSearchBtn} aria-label="搜索">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>

        {/* ── Cart + Wishlist + Menu ─────────────────────────────────── */}
        <div className={styles.actions}>
          {/* Wishlist */}
          <Link to={marketPath('/wishlist')} className={styles.wishlistBtn} aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {wishlistCount > 0 && (
              <span className={styles.wishlistBadge}>{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to={marketPath('/cart')} className={styles.cartBtn} aria-label={t.cart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </Link>

          {/* Hamburger */}
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
