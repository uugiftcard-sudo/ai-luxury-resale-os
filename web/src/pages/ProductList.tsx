/**
 * 商品列表页
 * 支持筛选（品牌/分类/价格/成色）和分页
 * All API calls include the active market so prices are currency-correct.
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi, brandApi, categoryApi } from '../api/client';
import { useMarket } from '../hooks/useMarket';
import type { Product, Brand, Category, ProductCondition } from '../types';
import styles from './ProductList.module.css';

const CONDITIONS: ProductCondition[] = ['全新', '几乎全新', '轻微使用痕迹', '有明显使用痕迹'];

// ── UI copy per market ───────────────────────────────────────────────────────
const COPY: Record<string, Record<string, string>> = {
  CN: {
    title: '全部商品',
    filter: '筛选',
    closeFilter: '收起筛选',
    clearFilter: '清除全部筛选',
    brand: '品牌',
    category: '分类',
    condition: '成色',
    noResults: '暂无符合条件的商品',
    tryAdjust: '试试调整筛选条件',
    page: '第 {page} / {total} 页，共 {total} 件',
    prev: '上一页',
    next: '下一页',
    items: '件商品',
  },
  HK: {
    title: '全部商品',
    filter: '篩選',
    closeFilter: '收起篩選',
    clearFilter: '清除全部篩選',
    brand: '品牌',
    category: '分類',
    condition: '成色',
    noResults: '暫無符合條件的商品',
    tryAdjust: '試試調整篩選條件',
    page: '第 {page} / {total} 頁，共 {total} 件',
    prev: '上一頁',
    next: '下一頁',
    items: '件商品',
  },
  UK: {
    title: 'All Products',
    filter: 'Filter',
    closeFilter: 'Close Filters',
    clearFilter: 'Clear All',
    brand: 'Brand',
    category: 'Category',
    condition: 'Condition',
    noResults: 'No items match your filters',
    tryAdjust: 'Try adjusting your filters',
    page: 'Page {page} of {total} — {total} items',
    prev: '← Prev',
    next: 'Next →',
    items: 'items',
  },
};

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { market } = useMarket();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentBrand = searchParams.get('brand') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentCondition = searchParams.get('condition') as ProductCondition || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page') || '1');

  const t = COPY[market] ?? COPY.CN;

  // 加载品牌和分类
  useEffect(() => {
    Promise.all([brandApi.list(market), categoryApi.list(market)])
      .then(([b, c]) => {
        setBrands(b);
        setCategories(c);
      })
      .catch(() => {}); // brands/categories errors handled silently
  }, [market]);

  // 加载商品
  useEffect(() => {
    setLoading(true);
    productApi.list(market, {
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
    }).catch(() => setLoading(false)).finally(() => setLoading(false));
  }, [searchParams, market]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters = !!(currentBrand || currentCategory || currentCondition || currentSearch);

  const pageLabel = t.page
    .replace('{page}', String(currentPage))
    .replace('{total}', String(totalPages))
    .replace(/{total}/g, String(total));

  return (
    <div className="page">
      <div className="container">
        {/* 页面标题 */}
        <div className={styles.pageHeader}>
          <div>
            <h1>
              {currentSearch
                ? (market === 'UK' ? `Search: ${currentSearch}` : `搜索: ${currentSearch}`)
                : currentCategory
                  ? currentCategory
                  : currentBrand
                    ? currentBrand
                    : t.title}
            </h1>
            <p>{total} {t.items}</p>
          </div>
          <button
            className={`btn btn-secondary ${styles.filterToggle}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {filtersOpen ? t.closeFilter : t.filter}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 筛选栏 */}
        <div className={`${styles.filterBar} ${filtersOpen ? styles.filterBarOpen : ''}`}>
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>{t.brand}</label>
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
            <label className={styles.filterLabel}>{t.category}</label>
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
            <label className={styles.filterLabel}>{t.condition}</label>
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
              {t.clearFilter}
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
            <h3>{t.noResults}</h3>
            <p>{t.tryAdjust}</p>
            <button className="btn btn-primary" onClick={clearFilters}>{t.clearFilter}</button>
          </div>
        ) : (
          <>
            <div className="grid-products">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={`btn btn-secondary btn-sm ${currentPage <= 1 ? styles.disabled : ''}`}
                  onClick={() => updateFilter('page', String(currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  {t.prev}
                </button>
                <span className={styles.pageInfo}>{pageLabel}</span>
                <button
                  className={`btn btn-secondary btn-sm ${currentPage >= totalPages ? styles.disabled : ''}`}
                  onClick={() => updateFilter('page', String(currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  {t.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
