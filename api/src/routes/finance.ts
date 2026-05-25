/**
 * CLOTH 财务 API 路由
 * 提供收入的增删改查，以及统计接口
 */
import { Router, Request, Response } from 'express';
import { ok, notFound, serverError, validateRequired } from '../middleware/response';
import { generateId } from '../models/store';
import { createSqliteCollection } from '../db';
import type { FinanceRecord, FinanceType, FinanceCategory } from '../models/types';

const router = Router();

const seedFinanceRecords: FinanceRecord[] = [
  // Seed data
  {
    id: 'f001',
    type: '收入',
    category: '商品销售收入',
    amount: 6800,
    description: 'Gucci GG Marmont 链条斜挎包 — 订单 o001',
    date: '2024-01-25',
    market: 'CN',
    relatedOrderId: 'o001',
    createdAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 'f002',
    type: '支出',
    category: '物流运输',
    amount: 35,
    description: '顺丰快递 — 订单 o001 上海静安区',
    date: '2024-01-25',
    market: 'CN',
    relatedOrderId: 'o001',
    createdAt: '2024-01-25T11:00:00Z',
  },
  {
    id: 'f003',
    type: '支出',
    category: '平台费用',
    amount: 680,
    description: 'Vestiaire Collective 平台服务费 — 订单 o002',
    date: '2024-01-26',
    market: 'CN',
    relatedOrderId: 'o002',
    createdAt: '2024-01-26T12:00:00Z',
  },
  {
    id: 'f004',
    type: '支出',
    category: '商品采购',
    amount: 3200,
    description: 'Vinted UK — Vintage designer shoulder bag lead-uk-001 采购款',
    date: '2024-01-28',
    market: 'UK',
    createdAt: '2024-01-28T09:00:00Z',
  },
  {
    id: 'f005',
    type: '收入',
    category: '商品销售收入',
    amount: 4200,
    description: 'Prada Re-Edition 三角包 — 订单 o002',
    date: '2024-01-26',
    market: 'CN',
    relatedOrderId: 'o002',
    createdAt: '2024-01-26T16:30:00Z',
  },
];

const financeRecords = createSqliteCollection<FinanceRecord>(
  'finance_records',
  'id',
  (record) => record.id,
  seedFinanceRecords
);

function isValidType(v: unknown): v is FinanceType {
  return v === '收入' || v === '支出';
}

function isValidCategory(v: unknown): v is FinanceCategory {
  const valid: FinanceCategory[] = [
    '商品销售收入', '其他收入',
    '商品采购', '物流运输', '平台费用',
    '仓储费用', '营销推广', '人力成本', '税费', '其他支出',
  ];
  return valid.includes(v as FinanceCategory);
}

// ── GET /api/finance ──────────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  try {
    const { type, category, from, to, market } = req.query;

    let filtered = financeRecords.findAll();

    if (type && isValidType(type)) {
      filtered = filtered.filter(r => r.type === type);
    }
    if (category && isValidCategory(category)) {
      filtered = filtered.filter(r => r.category === category);
    }
    if (from) {
      filtered = filtered.filter(r => r.date >= (from as string));
    }
    if (to) {
      filtered = filtered.filter(r => r.date <= (to as string));
    }
    if (market && market !== 'ALL') {
      filtered = filtered.filter(r => !r.market || r.market === 'ALL' || r.market === market);
    }

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    ok(res, filtered);
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/finance/stats ────────────────────────────────────────────────────
router.get('/stats', (req: Request, res: Response) => {
  try {
    const { market } = req.query;
    let records = financeRecords.findAll();

    if (market && market !== 'ALL') {
      records = records.filter(r => !r.market || r.market === 'ALL' || r.market === market);
    }

    const totalIncome = records
      .filter(r => r.type === '收入')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records
      .filter(r => r.type === '支出')
      .reduce((sum, r) => sum + r.amount, 0);

    const byMarket: Record<string, { income: number; expense: number; net: number }> = {};
    const byCategory: Record<string, number> = {};

    for (const r of records) {
      const m = r.market || 'ALL';
      if (!byMarket[m]) byMarket[m] = { income: 0, expense: 0, net: 0 };
      if (r.type === '收入') byMarket[m].income += r.amount;
      else byMarket[m].expense += r.amount;

      const catKey = r.category;
      byCategory[catKey] = (byCategory[catKey] || 0) + r.amount;
    }
    for (const m of Object.keys(byMarket)) {
      byMarket[m].net = byMarket[m].income - byMarket[m].expense;
    }

    ok(res, {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeCount: records.filter(r => r.type === '收入').length,
      expenseCount: records.filter(r => r.type === '支出').length,
      byMarket,
      byCategory,
    });
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/finance/:id ──────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  try {
    const record = financeRecords.find(r => r.id === req.params.id);
    if (!record) {
      notFound(res, '财务记录');
      return;
    }
    ok(res, record);
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/finance ─────────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const requiredFields = ['type', 'category', 'amount', 'description', 'date'];
    if (!validateRequired(req, res, requiredFields)) return;

    const body = req.body as Partial<FinanceRecord>;
    if (!isValidType(body.type)) {
      res.status(400).json({ success: false, error: 'type 必须是"收入"或"支出"' });
      return;
    }
    if (!isValidCategory(body.category)) {
      res.status(400).json({ success: false, error: '无效的类别' });
      return;
    }
    if (body.amount === undefined || !Number.isFinite(Number(body.amount)) || Number(body.amount) < 0) {
      res.status(400).json({ success: false, error: 'amount 必须是有效非负数字' });
      return;
    }

    const newRecord: FinanceRecord = {
      id: generateId('f'),
      type: body.type,
      category: body.category,
      amount: Number(body.amount) || 0,
      description: body.description!,
      date: body.date || new Date().toISOString().split('T')[0],
      market: body.market,
      relatedOrderId: body.relatedOrderId,
      createdAt: new Date().toISOString(),
    };

    ok(res, financeRecords.upsert(newRecord), '财务记录已添加');
  } catch (err) {
    serverError(res, err);
  }
});

// ── PUT /api/finance/:id ─────────────────────────────────────────────────────
router.put('/:id', (req: Request, res: Response) => {
  try {
    const existing = financeRecords.find(r => r.id === req.params.id);
    if (!existing) {
      notFound(res, '财务记录');
      return;
    }

    const body = req.body as Partial<FinanceRecord>;
    const updated: FinanceRecord = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    if (body.type !== undefined && !isValidType(body.type)) {
      res.status(400).json({ success: false, error: 'type 必须是"收入"或"支出"' });
      return;
    }
    if (body.category !== undefined && !isValidCategory(body.category)) {
      res.status(400).json({ success: false, error: '无效的类别' });
      return;
    }

    ok(res, financeRecords.upsert(updated), '财务记录已更新');
  } catch (err) {
    serverError(res, err);
  }
});

// ── DELETE /api/finance/:id ─────────────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing = financeRecords.find(r => r.id === req.params.id);
    if (!existing) {
      notFound(res, '财务记录');
      return;
    }
    financeRecords.remove(r => r.id === req.params.id);
    ok(res, existing, '财务记录已删除');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
