/**
 * Header 组件
 * 全局顶部导航栏 — includes market selector dropdown.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

// ── Nav copy per market ──────────────────────────────────────────────────────
const NAV_COPY: Record<string, Record<string, string>> = {
  UK: {
    allProducts: 'All Products',
    bags: 'Bags',
    clothing: 'Clothing',
    shoes: 'Shoes',
    orders: 'My Orders',
    admin: 'Admin',
    search: 'Search brands, products...',
    cart: 'Cart',
  },
  HK: {
    allProducts: '全部商品',
    bags: '袋款',
    clothing: '服飾',
    shoes: '鞋履',
    orders: '我的訂單',
    admin: '管理',
    search: '搜尋品牌、商品...',
    cart: '購物車',
  },
  CN: {
    allProducts: '全部商品',
    bags: '包袋',
    clothing: '服饰',
    shoes: '鞋履',
    orders: '我的订单',
    admin: '管理',
    search: '搜索品牌、商品...',
    cart: '购物车',
  },
};

export default function Header() {
  const { totalItems } = useCart();
  const { market, setMarket } = useMarket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);

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
        <div className={styles.marketSelector}>
          <button
            className={styles.marketBtn}
            onClick={() => setMarketOpen(o => !o)}
            aria-label="Select market"
            aria-expanded={marketOpen}
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
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {marketOpen && (
            <div className={styles.marketDropdown}>
              {MARKET_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.marketOption} ${opt.value === market ? styles.marketOptionActive : ''}`}
                  onClick={() => handleMarketSelect(opt.value)}
                >
                  <span className={styles.marketFlag}>{opt.flag}</span>
                  <span>{opt.label}</span>
                  {opt.value === market && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
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
          />
          <button type="submit" className={styles.searchBtn} aria-label="搜索">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        {/* ── Nav ────────────────────────────────────────────────────── */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>{t.allProducts}</Link>
          <Link to="/products?category=包袋" onClick={() => setMenuOpen(false)}>{t.bags}</Link>
          <Link to="/products?category=服饰" onClick={() => setMenuOpen(false)}>{t.clothing}</Link>
          <Link to="/products?category=鞋履" onClick={() => setMenuOpen(false)}>{t.shoes}</Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>{t.orders}</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className={styles.adminLink}>{t.admin}</Link>
        </nav>

        {/* ── Cart + Menu ───────────────────────────────────────────── */}
        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartBtn} aria-label={t.cart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </Link>

          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="菜单"
          >
            <span className={`${styles.menuLine} ${menuOpen ? styles.menuOpen : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
