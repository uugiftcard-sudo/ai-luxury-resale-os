/**
 * 商品路由
 * 提供商品的增删改查 API
 * Phase 2: 高級過濾 + 分頁
 */
import { Router, Request, Response } from 'express';
import {
  findProductById,
  generateId,
  filterProductsByMarket,
  saveProduct,
  updateProduct,
} from '../models/store';
import { MarketScope, Product, ProductCondition, ProductStatus } from '../models/types';
import { ok, notFound, serverError, validateRequired } from '../middleware/response';

const router = Router();

const VALID_CONDITIONS: ProductCondition[] = ['全新', '几乎全新', '轻微使用痕迹', '有明显使用痕迹'];
const VALID_STATUSES: ProductStatus[] = ['待售', '已售', '已下架'];
const VALID_MARKETS: MarketScope[] = ['UK', 'HK', 'CN', 'ALL'];
const VALID_SORTS = ['createdAt_desc', 'createdAt_asc', 'price_asc', 'price_desc'] as const;

type ProductSort = typeof VALID_SORTS[number];

function normalizeMarket(value: unknown): MarketScope {
  const candidate = value as MarketScope;
  return VALID_MARKETS.includes(candidate) ? candidate : 'ALL';
}

function getQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return getQueryValue(value[0]);
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function parseIntegerParam(value: unknown, fallback: number): number | null {
  const raw = getQueryValue(value);
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseNonNegativeParam(value: unknown): number | null | undefined {
  const raw = getQueryValue(value);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * GET /api/products
 * 高級過濾 + Offset 分頁
 * Query: market, brand, category, condition, status, minPrice, maxPrice,
 *        search, page, limit, sort
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const market = getQueryValue(req.query.market) || 'ALL';
    const status = getQueryValue(req.query.status) || '待售';
    const brand = getQueryValue(req.query.brand);
    const category = getQueryValue(req.query.category);
    const condition = getQueryValue(req.query.condition);
    const search = getQueryValue(req.query.search);
    const sort = getQueryValue(req.query.sort) || 'createdAt_desc';

    // ── Validate numeric params ────────────────────────────────────────────
    const pageNum = parseIntegerParam(req.query.page, 1);
    if (pageNum === null || pageNum < 1) {
      res.status(400).json({ success: false, error: 'page 必须是大于等于 1 的整数' });
      return;
    }

    const limitNum = parseIntegerParam(req.query.limit, 12);
    if (limitNum === null || limitNum < 1 || limitNum > 50) {
      res.status(400).json({ success: false, error: 'limit 必须在 1-50 之间' });
      return;
    }

    const minPrice = parseNonNegativeParam(req.query.minPrice);
    if (minPrice === null) {
      res.status(400).json({ success: false, error: 'minPrice 必须是有效非负数字' });
      return;
    }
    const maxPrice = parseNonNegativeParam(req.query.maxPrice);
    if (maxPrice === null) {
      res.status(400).json({ success: false, error: 'maxPrice 必须是有效非负数字' });
      return;
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      res.status(400).json({ success: false, error: 'minPrice 不能大于 maxPrice' });
      return;
    }

    if (!VALID_MARKETS.includes(market as MarketScope)) {
      res.status(400).json({ success: false, error: 'market 必须是 ALL/UK/HK/CN' });
      return;
    }

    if (!VALID_STATUSES.includes(status as ProductStatus)) {
      res.status(400).json({ success: false, error: 'status 必须是待售/已售/已下架' });
      return;
    }

    if (!VALID_SORTS.includes(sort as ProductSort)) {
      res.status(400).json({ success: false, error: 'sort 必须是 createdAt_desc / createdAt_asc / price_asc / price_desc' });
      return;
    }

    if (condition !== undefined && !VALID_CONDITIONS.includes(condition as ProductCondition)) {
      res.status(400).json({ success: false, error: `无效的 condition: ${condition}` });
      return;
    }

    // ── Base filter: market ──────────────────────────────────────────────
    const visible = filterProductsByMarket(market);

    // ── Apply filters ─────────────────────────────────────────────────────
    const filtered = visible.filter(p => {
      if (p.status !== status) return false;

      if (brand !== undefined && p.brand !== brand) return false;
      if (category !== undefined && p.category !== category) return false;

      if (condition !== undefined && p.condition !== condition) return false;

      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;

      if (search !== undefined) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.brand.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        ) return false;
      }

      return true;
    });

    // ── Sort ──────────────────────────────────────────────────────────────
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'createdAt_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // ── Paginate ──────────────────────────────────────────────────────────
    const total = sorted.length;
    const start = (pageNum - 1) * limitNum;
    const paged = sorted.slice(start, start + limitNum);

    ok(res, {
      data: paged,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * GET /api/products/:id
 * 商品详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const product = findProductById(req.params.id);
    if (!product) {
      notFound(res, '商品');
      return;
    }
    ok(res, product);
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * POST /api/products
 * 上架商品
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const requiredFields = ['title', 'brand', 'category', 'price', 'condition', 'size', 'description'];
    if (!validateRequired(req, res, requiredFields)) return;

    const body = req.body as Partial<Product>;
    const newProduct: Product = {
      id: generateId('p'),
      title: body.title!,
      brand: body.brand!,
      category: body.category!,
      price: Number(body.price) || 0,
      originalPrice: Number(body.originalPrice) || 0,
      condition: body.condition || '轻微使用痕迹',
      size: body.size || '',
      description: body.description || '',
      images: Array.isArray(body.images) ? body.images : [],
      platform: body.platform,
      status: body.status || '待售',
      createdAt: new Date().toISOString(),
      market: normalizeMarket(body.market),
    };

    ok(res, saveProduct(newProduct), '商品上架成功');
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * PUT /api/products/:id
 * 更新商品
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const existing = findProductById(req.params.id);
    if (!existing) {
      notFound(res, '商品');
      return;
    }

    const updated: Product = {
      ...existing,
      ...req.body,
      id: existing.id,
      createdAt: existing.createdAt,
      market: normalizeMarket(req.body.market ?? existing.market),
      updatedAt: new Date().toISOString(),
    };

    ok(res, saveProduct(updated), '商品更新成功');
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * DELETE /api/products/:id
 * 下架商品（软删除，改为已下架状态）
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const updated = updateProduct(req.params.id, {
      status: '已下架',
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      notFound(res, '商品');
      return;
    }
    ok(res, updated, '商品已下架');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
