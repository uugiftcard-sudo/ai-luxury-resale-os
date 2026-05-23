/**
 * 商品路由
 * 提供商品的增删改查 API
 */
import { Router, Request, Response } from 'express';
import {
  products,
  findProductById,
  generateId,
} from '../models/store';
import { Product, ProductFilter, ProductStatus } from '../models/types';
import { ok, notFound, serverError, validateRequired } from '../middleware/response';

const router = Router();

/**
 * GET /api/products
 * 商品列表（支持分页、筛选）
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      brand,
      category,
      condition,
      minPrice,
      maxPrice,
      status = '待售',
      search,
      page = '1',
      limit = '12',
    } = req.query;

    const filter: ProductFilter = {
      brand: brand as string | undefined,
      category: category as string | undefined,
      condition: condition as Product['condition'] | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      status: (status as ProductStatus) || '待售',
      search: search as string | undefined,
      page: Number(page),
      limit: Number(limit),
    };

    const filtered = products.filter(p => {
      if (filter.status && p.status !== filter.status) return false;
      if (filter.brand && p.brand !== filter.brand) return false;
      if (filter.category && p.category !== filter.category) return false;
      if (filter.condition && p.condition !== filter.condition) return false;
      if (filter.minPrice !== undefined && p.price < filter.minPrice) return false;
      if (filter.maxPrice !== undefined && p.price > filter.maxPrice) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.brand.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    const total = filtered.length;
    const pageNum = Math.max(1, filter.page || 1);
    const limitNum = Math.min(50, Math.max(1, filter.limit || 12));
    const start = (pageNum - 1) * limitNum;
    const paged = filtered.slice(start, start + limitNum);

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
    };

    products.unshift(newProduct);
    ok(res, newProduct, '商品上架成功');
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
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      notFound(res, '商品');
      return;
    }

    const updated: Product = {
      ...products[idx],
      ...req.body,
      id: products[idx].id, // 防止ID被修改
      createdAt: products[idx].createdAt, // 防止创建时间被修改
      updatedAt: new Date().toISOString(),
    };

    products[idx] = updated;
    ok(res, updated, '商品更新成功');
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
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      notFound(res, '商品');
      return;
    }

    products[idx] = {
      ...products[idx],
      status: '已下架',
      updatedAt: new Date().toISOString(),
    };

    ok(res, products[idx], '商品已下架');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
