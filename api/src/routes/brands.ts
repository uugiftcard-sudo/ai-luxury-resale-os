/**
 * 品牌路由
 * 提供品牌列表 API
 */
import { Router, Request, Response } from 'express';
import { brands } from '../models/store';
import { ok, serverError } from '../middleware/response';

const router = Router();

/**
 * GET /api/brands
 * 获取所有品牌列表
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    ok(res, brands);
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
