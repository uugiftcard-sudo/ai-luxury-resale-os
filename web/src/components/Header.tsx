/**
 * Header 组件
 * 全局顶部导航栏
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import styles from './Header.module.css';

export default function Header() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setMenuOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>CLOTH</span>
          <span className={styles.logoSub}>二手奢品</span>
        </Link>

        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="搜索品牌、商品..."
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

        {/* 导航 */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>全部商品</Link>
          <Link to="/products?category=包袋" onClick={() => setMenuOpen(false)}>包袋</Link>
          <Link to="/products?category=服饰" onClick={() => setMenuOpen(false)}>服饰</Link>
          <Link to="/products?category=鞋履" onClick={() => setMenuOpen(false)}>鞋履</Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>我的订单</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className={styles.adminLink}>管理</Link>
        </nav>

        {/* 右侧操作 */}
        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartBtn} aria-label="购物车">
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
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="菜单"
          >
            <span className={`${styles.menuLine} ${menuOpen ? styles.menuOpen : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
