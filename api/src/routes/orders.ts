/**
 * 订单路由
 * 提供订单的增删改查 API
 */
import { Router, Request, Response } from 'express';
import {
  orders,
  findOrderById,
  findProductById,
  generateId,
} from '../models/store';
import { Order } from '../models/types';
import { ok, notFound, serverError } from '../middleware/response';

const router = Router();

/**
 * GET /api/orders
 * 订单列表（支持筛选）
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    let filtered = [...orders];

    if (status) {
      filtered = filtered.filter(o => o.status === status);
    }

    // 排序：最新优先
    filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const start = (pageNum - 1) * limitNum;
    const paged = filtered.slice(start, start + limitNum);

    ok(res, {
      data: paged,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
    });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * GET /api/orders/:id
 * 订单详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const order = findOrderById(req.params.id);
    if (!order) {
      notFound(res, '订单');
      return;
    }

    // 附带商品信息
    const product = findProductById(order.productId);
    ok(res, { ...order, product });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * POST /api/orders
 * 创建订单
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { productId, buyerInfo } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, error: '缺少商品ID' });
      return;
    }

    if (!buyerInfo || !buyerInfo.name || !buyerInfo.phone || !buyerInfo.address) {
      res.status(400).json({
        success: false,
        error: '买家信息不完整，请填写姓名、电话和地址',
      });
      return;
    }

    const product = findProductById(productId);
    if (!product) {
      notFound(res, '商品');
      return;
    }

    if (product.status !== '待售') {
      res.status(400).json({
        success: false,
        error: '该商品已售出或已下架',
      });
      return;
    }

    // 创建订单
    const newOrder: Order = {
      id: generateId('o'),
      productId,
      buyerInfo,
      status: '待付款',
      totalPrice: product.price,
      createdAt: new Date().toISOString(),
    };

    // 同步修改商品状态为已售
    product.status = '已售';

    orders.unshift(newOrder);
    ok(res, { ...newOrder, product }, '订单创建成功，请完成付款');
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * PUT /api/orders/:id
 * 更新订单状态
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const idx = orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) {
      notFound(res, '订单');
      return;
    }

    const { status } = req.body;
    const validStatuses = ['待付款', '待发货', '已发货', '已完成', '已取消'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `无效的订单状态，可选值: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const updated: Order = {
      ...orders[idx],
      status,
      updatedAt: new Date().toISOString(),
    };

    orders[idx] = updated;

    // 如果取消订单，恢复商品状态为待售
    if (status === '已取消') {
      const product = findProductById(updated.productId);
      if (product) {
        product.status = '待售';
      }
    }

    ok(res, updated, `订单状态已更新为: ${status}`);
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
