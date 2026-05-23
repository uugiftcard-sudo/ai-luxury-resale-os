/**
 * 分类路由
 * 提供商品分类列表 API
 */
import { Router, Request, Response } from 'express';
import { categories } from '../models/store';
import { ok, serverError } from '../middleware/response';

const router = Router();

/**
 * GET /api/categories
 * 获取所有商品分类
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    ok(res, categories);
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
