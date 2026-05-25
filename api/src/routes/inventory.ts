/**
 * CLOTH 库存 API 路由
 * 提供库存的增删改查、出入库操作、统计接口
 */
import { Router, Request, Response } from 'express';
import { ok, notFound, serverError } from '../middleware/response';
import { createSqliteCollection } from '../db';
import { generateId } from '../models/store';

const router = Router();

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
type TransactionType = 'inbound' | 'outbound' | 'adjustment' | 'return';

interface InventoryItem {
  id: string;
  sku: string;
  productId?: string;
  productName: string;
  brand?: string;
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  currentStock: number;
  minStockThreshold: number;
  unitCost?: number;
  unitPrice?: number;
  location?: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface InventoryTransaction {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  referenceNo?: string;
  notes?: string;
  operator?: string;
  createdAt: string;
}

const seedInventoryItems: InventoryItem[] = [
  {
    id: 'inv001',
    sku: 'GUCCI-MARMONT-001',
    productId: 'p001',
    productName: 'Gucci GG Marmont 链条斜挎包 黑色',
    brand: 'Gucci',
    category: '包袋',
    size: 'Mini',
    color: '黑色',
    condition: '几乎全新',
    currentStock: 1,
    minStockThreshold: 2,
    unitCost: 3200,
    unitPrice: 6800,
    location: 'CN-WH-A-01',
    supplier: 'Vestiaire Collective',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'inv002',
    sku: 'PRADA-REEDITION-001',
    productId: 'p003',
    productName: 'Prada Re-Edition 2005 三角包 红色',
    brand: 'Prada',
    category: '包袋',
    size: 'One Size',
    color: '红色',
    condition: '全新',
    currentStock: 1,
    minStockThreshold: 1,
    unitCost: 1800,
    unitPrice: 4200,
    location: 'CN-WH-A-02',
    supplier: 'Self-purchase',
    createdAt: '2024-01-17T09:15:00Z',
  },
  {
    id: 'inv003',
    sku: 'HERMES-BIRKIN-001',
    productId: 'p006',
    productName: 'Hermès Birkin 25 黑色Togo皮',
    brand: 'Hermès',
    category: '包袋',
    size: '25cm',
    color: '黑色',
    condition: '全新',
    currentStock: 1,
    minStockThreshold: 1,
    unitCost: 55000,
    unitPrice: 120000,
    location: 'CN-WH-VAULT-01',
    supplier: '专柜配货',
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'inv004',
    sku: 'BURBERRY-TRENCH-001',
    productId: 'p009',
    productName: 'Burberry 格纹羊毛大衣 驼色',
    brand: 'Burberry',
    category: '服饰',
    size: 'M',
    color: '驼色',
    condition: '轻微使用痕迹',
    currentStock: 2,
    minStockThreshold: 3,
    unitCost: 2800,
    unitPrice: 5200,
    location: 'UK-WH-B-12',
    supplier: 'Depop',
    createdAt: '2024-01-23T15:30:00Z',
  },
  {
    id: 'inv005',
    sku: 'CELINE-TRIOMPHE-001',
    productId: 'p008',
    productName: 'Celine Triomphe 豆腐包 焦糖色',
    brand: 'Celine',
    category: '包袋',
    size: 'Small',
    color: '焦糖色',
    condition: '全新',
    currentStock: 0,
    minStockThreshold: 1,
    unitCost: 4200,
    unitPrice: 8900,
    location: 'CN-WH-A-03',
    supplier: '欧洲旅游采购',
    createdAt: '2024-01-22T10:40:00Z',
  },
];

const items = createSqliteCollection<InventoryItem>(
  'inventory_items',
  'id',
  (item) => item.id,
  seedInventoryItems
);

const transactions = createSqliteCollection<InventoryTransaction>(
  'inventory_transactions',
  'id',
  (transaction) => transaction.id
);

function getStatus(item: InventoryItem): StockStatus {
  if (item.currentStock === 0) return 'out_of_stock';
  if (item.currentStock <= item.minStockThreshold) return 'low_stock';
  return 'in_stock';
}

function parseNonNegativeNumber(value: unknown): number | null {
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

// ── GET /api/inventory ────────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  try {
    const withStatus = items.findAll().map(item => ({ ...item, status: getStatus(item) }));
    ok(res, withStatus);
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/inventory/stats ─────────────────────────────────────────────────
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const allItems = items.findAll();
    const totalSKUs = allItems.length;
    const totalStock = allItems.reduce((sum, i) => sum + i.currentStock, 0);
    const lowStockCount = allItems.filter(i => i.currentStock > 0 && i.currentStock <= i.minStockThreshold).length;
    const outOfStockCount = allItems.filter(i => i.currentStock === 0).length;
    const totalValue = allItems.reduce((sum, i) => sum + i.currentStock * (i.unitCost || 0), 0);
    ok(res, { totalSKUs, totalStock, lowStockCount, outOfStockCount, totalValue });
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/inventory/alerts ────────────────────────────────────────────────
router.get('/alerts', (_req: Request, res: Response) => {
  try {
    const alerts = items.findAll()
      .filter(i => i.currentStock <= i.minStockThreshold)
      .map(i => ({ ...i, status: getStatus(i) }));
    ok(res, alerts);
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/inventory/transactions ─────────────────────────────────────────
router.get('/transactions', (req: Request, res: Response) => {
  try {
    const { inventoryId, from, to, type } = req.query;
    let filtered = transactions.findAll();
    if (inventoryId) filtered = filtered.filter(t => t.inventoryId === inventoryId);
    if (type && (type === 'inbound' || type === 'outbound')) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (from) filtered = filtered.filter(t => t.createdAt >= (from as string));
    if (to) filtered = filtered.filter(t => t.createdAt <= (to as string));
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    ok(res, filtered);
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/inventory/:id ───────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = items.find(i => i.id === req.params.id);
    if (!item) { notFound(res, '库存商品'); return; }
    ok(res, { ...item, status: getStatus(item) });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/inventory ──────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<InventoryItem>;
    if (!body.sku || !body.productName) {
      res.status(400).json({ success: false, error: 'sku 和 productName 为必填项' });
      return;
    }
    const currentStock = body.currentStock === undefined ? 0 : parseNonNegativeNumber(body.currentStock);
    if (currentStock === null) {
      res.status(400).json({ success: false, error: 'currentStock 必须是有效非负数字' });
      return;
    }
    const minStockThreshold = body.minStockThreshold === undefined ? 3 : parseNonNegativeNumber(body.minStockThreshold);
    if (minStockThreshold === null) {
      res.status(400).json({ success: false, error: 'minStockThreshold 必须是有效非负数字' });
      return;
    }
    const newItem: InventoryItem = {
      id: generateId('inv'),
      sku: body.sku,
      productId: body.productId,
      productName: body.productName,
      brand: body.brand,
      category: body.category,
      size: body.size,
      color: body.color,
      condition: body.condition,
      currentStock,
      minStockThreshold,
      unitCost: body.unitCost,
      unitPrice: body.unitPrice,
      location: body.location,
      supplier: body.supplier,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };
    const saved = items.upsert(newItem);
    ok(res, { ...saved, status: getStatus(saved) }, '库存商品已添加');
  } catch (err) {
    serverError(res, err);
  }
});

// ── PUT /api/inventory/:id ──────────────────────────────────────────────────
router.put('/:id', (req: Request, res: Response) => {
  try {
    const existing = items.find(i => i.id === req.params.id);
    if (!existing) { notFound(res, '库存商品'); return; }
    const updated: InventoryItem = {
      ...existing,
      ...req.body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const saved = items.upsert(updated);
    ok(res, { ...saved, status: getStatus(saved) }, '库存商品已更新');
  } catch (err) {
    serverError(res, err);
  }
});

// ── DELETE /api/inventory/:id ───────────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing = items.find(i => i.id === req.params.id);
    if (!existing) { notFound(res, '库存商品'); return; }
    items.remove(i => i.id === req.params.id);
    ok(res, existing, '库存商品已删除');
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/inventory/:id/inbound ─────────────────────────────────────────
router.post('/:id/inbound', (req: Request, res: Response) => {
  try {
    const body = req.body as { quantity?: unknown; referenceNo?: string; notes?: string; operator?: string };
    const item = items.find(i => i.id === req.params.id);
    if (!item) { notFound(res, '库存商品'); return; }
    const quantity = parsePositiveNumber(body.quantity);
    if (quantity === null) {
      res.status(400).json({ success: false, error: 'quantity 必须为正数' });
      return;
    }

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: item.currentStock + quantity,
      updatedAt: new Date().toISOString(),
    };

    const tx: InventoryTransaction = {
      id: generateId('tx'),
      inventoryId: updatedItem.id,
      sku: updatedItem.sku,
      productName: updatedItem.productName,
      type: 'inbound',
      quantity,
      referenceNo: body.referenceNo,
      notes: body.notes,
      operator: body.operator,
      createdAt: new Date().toISOString(),
    };
    items.upsert(updatedItem);
    transactions.upsert(tx);

    ok(res, {
      item: { ...updatedItem, status: getStatus(updatedItem) },
      transaction: tx,
    }, '入库成功');
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/inventory/:id/outbound ───────────────────────────────────────
router.post('/:id/outbound', (req: Request, res: Response) => {
  try {
    const body = req.body as { quantity?: unknown; referenceNo?: string; notes?: string; operator?: string };
    const item = items.find(i => i.id === req.params.id);
    if (!item) { notFound(res, '库存商品'); return; }
    const quantity = parsePositiveNumber(body.quantity);
    if (quantity === null) {
      res.status(400).json({ success: false, error: 'quantity 必须为正数' });
      return;
    }
    if (item.currentStock < quantity) {
      res.status(400).json({ success: false, error: `库存不足，当前库存 ${item.currentStock}` });
      return;
    }

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: item.currentStock - quantity,
      updatedAt: new Date().toISOString(),
    };

    const tx: InventoryTransaction = {
      id: generateId('tx'),
      inventoryId: updatedItem.id,
      sku: updatedItem.sku,
      productName: updatedItem.productName,
      type: 'outbound',
      quantity: -quantity,
      referenceNo: body.referenceNo,
      notes: body.notes,
      operator: body.operator,
      createdAt: new Date().toISOString(),
    };
    items.upsert(updatedItem);
    transactions.upsert(tx);

    ok(res, {
      item: { ...updatedItem, status: getStatus(updatedItem) },
      transaction: tx,
    }, '出库成功');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
