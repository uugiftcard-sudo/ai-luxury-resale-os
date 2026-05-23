/**
 * 商品列表页
 * 支持筛选（品牌/分类/价格/成色）和分页
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi, brandApi, categoryApi } from '../api/client';
import type { Product, Brand, Category, ProductCondition } from '../types';
import styles from './ProductList.module.css';

const CONDITIONS: ProductCondition[] = ['全新', '几乎全新', '轻微使用痕迹', '有明显使用痕迹'];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // 从 URL 提取筛选参数
  const currentBrand = searchParams.get('brand') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentCondition = searchParams.get('condition') as ProductCondition || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page') || '1');

  // 加载品牌和分类
  useEffect(() => {
    Promise.all([brandApi.list(), categoryApi.list()])
      .then(([b, c]) => {
        setBrands(b);
        setCategories(c);
      })
      .catch(console.error);
  }, []);

  // 加载商品
  useEffect(() => {
    setLoading(true);
    productApi.list({
      brand: currentBrand,
      category: currentCategory,
      condition: currentCondition || undefined,
      search: currentSearch,
      page: currentPage,
      limit: 12,
    }).then(res => {
      setProducts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    }).catch(console.error).finally(() => setLoading(false));
  }, [searchParams]);

  // 更新 URL 筛选参数
  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page'); // 重置到第一页
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters = currentBrand || currentCategory || currentCondition || currentSearch;

  return (
    <div className="page">
      <div className="container">
        {/* 页面标题 */}
        <div className={styles.pageHeader}>
          <div>
            <h1>
              {currentSearch
                ? `搜索: ${currentSearch}`
                : currentCategory
                  ? currentCategory
                  : currentBrand
                    ? currentBrand
                    : '全部商品'}
            </h1>
            <p>{total} 件商品</p>
          </div>
          <button
            className={`btn btn-secondary ${styles.filterToggle}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {filtersOpen ? '收起筛选' : '筛选'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 筛选栏 */}
        <div className={`${styles.filterBar} ${filtersOpen ? styles.filterBarOpen : ''}`}>
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>品牌</label>
            <div className={styles.filterChips}>
              {brands.map(b => (
                <button
                  key={b.id}
                  className={`${styles.chip} ${currentBrand === b.nameEn ? styles.chipActive : ''}`}
                  onClick={() => updateFilter('brand', currentBrand === b.nameEn ? '' : b.nameEn)}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>分类</label>
            <div className={styles.filterChips}>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`${styles.chip} ${currentCategory === c.name ? styles.chipActive : ''}`}
                  onClick={() => updateFilter('category', currentCategory === c.name ? '' : c.name)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>成色</label>
            <div className={styles.filterChips}>
              {CONDITIONS.map(c => (
                <button
                  key={c}
                  className={`${styles.chip} ${currentCondition === c ? styles.chipActive : ''}`}
                  onClick={() => updateFilter('condition', currentCondition === c ? '' : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              清除全部筛选
            </button>
          )}
        </div>

        {/* 商品列表 */}
        {loading ? (
          <div className="grid-products">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonText} style={{ width: '70%' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>暂无符合条件的商品</h3>
            <p>试试调整筛选条件</p>
            <button className="btn btn-primary" onClick={clearFilters}>清除筛选</button>
          </div>
        ) : (
          <>
            <div className="grid-products">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={`btn btn-secondary btn-sm ${currentPage <= 1 ? styles.disabled : ''}`}
                  onClick={() => updateFilter('page', String(currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  ← 上一页
                </button>
                <span className={styles.pageInfo}>
                  第 {currentPage} / {totalPages} 页，共 {total} 件
                </span>
                <button
                  className={`btn btn-secondary btn-sm ${currentPage >= totalPages ? styles.disabled : ''}`}
                  onClick={() => updateFilter('page', String(currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  下一页 →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
