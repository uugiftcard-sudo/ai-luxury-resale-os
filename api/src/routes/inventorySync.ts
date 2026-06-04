/**
 * Inventory Sync Routes
 * Multi-market inventory synchronization.
 * Allows products to be listed across multiple markets (UK/HK/CN)
 * with shared or separate inventory management.
 */
import { Router, Request, Response } from 'express';
import { ok, fail, serverError } from '../middleware/response';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';
import { findProductById, saveProduct, listProducts } from '../models/store';
import { MarketScope, MarketSyncEntry, MarketSyncStatus } from '../models/types';

const router = Router();

const VALID_MARKETS: MarketScope[] = ['UK', 'HK', 'CN', 'ALL'];
const MARKET_SCOPES = ['UK', 'HK', 'CN'] as const;

/**
 * PATCH /api/products/:id/market-sync
 * Update which markets a product appears in and sync status.
 * Requires authentication.
 */
router.patch('/products/:id/market-sync', requireAuth, (req: Request, res: Response) => {
  try {
    const product = findProductById(req.params.id);
    if (!product) {
      fail(res, 404, '商品不存在');
      return;
    }

    const { markets, inventoryMode } = req.body as {
      markets?: MarketScope[];
      inventoryMode?: 'shared' | 'separate';
    };

    if (markets !== undefined) {
      if (!Array.isArray(markets)) {
        fail(res, 400, 'markets 必须是数组');
        return;
      }
      for (const m of markets) {
        if (!VALID_MARKETS.includes(m as MarketScope)) {
          fail(res, 400, `无效的市场: ${m}，必须是 UK/HK/CN/ALL`);
          return;
        }
      }

      // Update marketSync entries for each requested market
      const currentSync: MarketSyncEntry[] = product.marketSync || [];
      const updatedSync: MarketSyncEntry[] = [];

      for (const market of markets as MarketScope[]) {
        if (market === 'ALL') {
          // ALL means it appears in all markets — set entries for each
          for (const m of MARKET_SCOPES) {
            const existing = currentSync.find(s => s.market === m);
          updatedSync.push({
            market: m,
            status: (existing?.status || 'synced') as MarketSyncStatus,
            lastSynced: existing?.lastSynced || new Date().toISOString(),
            stock: existing?.stock ?? 1,
            syncedPrice: existing?.syncedPrice ?? product.price,
          });
          }
        } else {
          const existing = currentSync.find(s => s.market === market);
          updatedSync.push({
            market,
            status: (existing?.status || 'synced') as MarketSyncStatus,
            lastSynced: existing?.lastSynced || new Date().toISOString(),
            stock: existing?.stock ?? 1,
            syncedPrice: existing?.syncedPrice ?? product.price,
          });
        }
      }

      const updated = saveProduct({
        ...product,
        marketSync: updatedSync,
        updatedAt: new Date().toISOString(),
      });

      ok(res, updated, '市场同步已更新');
    } else if (inventoryMode !== undefined) {
      // Update stock per market
      const { market, stock, syncedPrice } = req.body as {
        market: string;
        stock?: number;
        syncedPrice?: number;
      };

      if (!market || !MARKET_SCOPES.includes(market as typeof MARKET_SCOPES[number])) {
        fail(res, 400, '无效的 market');
        return;
      }

      const currentSync: MarketSyncEntry[] = product.marketSync || [];
      const existingEntry = currentSync.find(s => s.market === market);
      const newSync = existingEntry
        ? currentSync.map(s => s.market === market
            ? { ...s, stock, syncedPrice, lastSynced: new Date().toISOString() }
            : s)
        : [...currentSync, {
            market: market as MarketScope,
            status: 'synced' as MarketSyncStatus,
            stock: stock ?? 1,
            syncedPrice: syncedPrice ?? product.price,
            lastSynced: new Date().toISOString(),
          }];

      const updated = saveProduct({
        ...product,
        marketSync: newSync,
        updatedAt: new Date().toISOString(),
      });

      ok(res, updated, '库存同步已更新');
    } else {
      fail(res, 400, '请提供 markets 或 inventoryMode 更新');
    }
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * GET /api/inventory/sync-status
 * Get stock and sync status across all markets for all or filtered products.
 * Requires authentication.
 */
router.get('/sync-status', requireAuth, (req: Request, res: Response) => {
  try {
    const market = req.query.market as string | undefined;
    const status = req.query.status as string | undefined;

    let products = listProducts();

    // Filter by market if specified
    if (market) {
      products = products.filter(p => {
        if (p.market === market || p.market === 'ALL') return true;
        if (p.marketSync?.some(s => s.market === market)) return true;
        return false;
      });
    }

    // Filter by sync status if specified
    if (status) {
      products = products.filter(p =>
        p.marketSync?.some(s => s.status === status)
      );
    }

    const syncStatus = products.map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      status: p.status,
      basePrice: p.price,
      markets: MARKET_SCOPES.map(m => {
        const entry = p.marketSync?.find(s => s.market === m);
        const isListed = p.market === m || p.market === 'ALL' || !!entry;
        return {
          market: m,
          isListed,
          stock: entry?.stock ?? (isListed ? 1 : 0),
          syncedPrice: entry?.syncedPrice ?? p.price,
          syncStatus: entry?.status ?? (isListed ? 'synced' : 'pending'),
          lastSynced: entry?.lastSynced ?? null,
        };
      }),
    }));

    const summary = {
      total: products.length,
      byMarket: {
        UK: syncStatus.filter(p => p.markets.find(m => m.market === 'UK' && m.isListed)).length,
        HK: syncStatus.filter(p => p.markets.find(m => m.market === 'HK' && m.isListed)).length,
        CN: syncStatus.filter(p => p.markets.find(m => m.market === 'CN' && m.isListed)).length,
      },
      synced: syncStatus.filter(p => p.markets.every(m => m.syncStatus === 'synced')).length,
      pending: syncStatus.filter(p => p.markets.some(m => m.syncStatus === 'pending')).length,
      errors: syncStatus.filter(p => p.markets.some(m => m.syncStatus === 'error')).length,
    };

    ok(res, { products: syncStatus, summary });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * POST /api/inventory/bulk-sync
 * Bulk sync products to multiple markets.
 * Requires admin role.
 */
router.post('/bulk-sync', requireAdmin, (req: Request, res: Response) => {
  try {
    const { productIds, markets } = req.body as {
      productIds: string[];
      markets: MarketScope[];
    };

    if (!Array.isArray(productIds) || productIds.length === 0) {
      fail(res, 400, '请提供 productIds 数组');
      return;
    }
    if (!Array.isArray(markets) || markets.length === 0) {
      fail(res, 400, '请提供 markets 数组');
      return;
    }
    for (const m of markets) {
      if (!VALID_MARKETS.includes(m as MarketScope)) {
        fail(res, 400, `无效的市场: ${m}`);
        return;
      }
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const id of productIds) {
      try {
        const product = findProductById(id);
        if (!product) {
          results.push({ id, success: false, error: '商品不存在' });
          continue;
        }

        const newSync: MarketSyncEntry[] = [];
        for (const market of markets) {
          if (market === 'ALL') {
            for (const m of MARKET_SCOPES) {
              newSync.push({ market: m, status: 'synced', stock: 1, syncedPrice: product.price, lastSynced: new Date().toISOString() });
            }
          } else {
            newSync.push({ market: market as MarketScope, status: 'synced', stock: 1, syncedPrice: product.price, lastSynced: new Date().toISOString() });
          }
        }

        saveProduct({
          ...product,
          marketSync: newSync,
          updatedAt: new Date().toISOString(),
        });
        results.push({ id, success: true });
      } catch {
        results.push({ id, success: false, error: '更新失败' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    ok(res, { results, successCount, total: productIds.length }, `${successCount}/${productIds.length} 商品同步成功`);
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
