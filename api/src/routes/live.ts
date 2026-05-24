/**
 * CLOTH AI 虛擬主播帶貨 API
 *
 * v1 is deterministic and safe for client demos: it creates a livestream
 * selling plan from product/inventory/finance signals without generating fake
 * viewers, fake comments, or undisclosed human impersonation.
 */
import { Router, Request, Response } from 'express';
import { products } from '../models/store';
import type { LiveAccountStyle, LiveSellingPlan, Product } from '../models/types';
import { ok, serverError } from '../middleware/response';

const router = Router();

const VALID_STYLES: LiveAccountStyle[] = ['educational', 'luxury_editor', 'deal_hunter', 'community_host'];

function chooseProduct(productId?: string): Product {
  const exact = productId ? products.find(p => p.id === productId) : undefined;
  return exact || products.find(p => p.status === '待售') || products[0];
}

function styleLabel(style: LiveAccountStyle): string {
  return {
    educational: '專業講解型',
    luxury_editor: '精品編輯型',
    deal_hunter: '優惠獵人型',
    community_host: '社群主持型',
  }[style];
}

function inventoryStatus(product: Product): LiveSellingPlan['inventoryCheck'] {
  if (!product) {
    return { status: 'unknown', message: '未找到商品，直播前不可開賣。' };
  }
  if (product.status === '已售' || product.status === '已下架') {
    return { status: 'out_of_stock', message: `${product.title} 目前不可售，避免直播推錯貨。` };
  }
  return {
    sku: product.id,
    status: 'ready',
    message: `${product.title} 可作直播主推 SKU；開播前仍需再確認實物與庫存。`,
  };
}

function financeCheck(product: Product): LiveSellingPlan['financeCheck'] {
  const expectedRevenue = Number(product?.price || 0);
  const estimatedPlatformFee = Math.round(expectedRevenue * 0.08);
  const estimatedAdCost = Math.max(80, Math.round(expectedRevenue * 0.03));
  const estimatedInventoryCost = Math.round(expectedRevenue * 0.45);
  const estimatedRefundReserve = Math.round(expectedRevenue * 0.05);
  return {
    expectedRevenue,
    estimatedPlatformFee,
    estimatedAdCost,
    estimatedInventoryCost,
    estimatedRefundReserve,
    estimatedNetProfit: expectedRevenue - estimatedPlatformFee - estimatedAdCost - estimatedInventoryCost - estimatedRefundReserve,
  };
}

function buildPlan(req: Request): LiveSellingPlan {
  const body = req.body || {};
  const style = VALID_STYLES.includes(body.accountStyle) ? body.accountStyle : 'educational';
  const product = chooseProduct(body.productId);
  const cta = body.cta || '留言「想看」領取細節圖與報價';
  const hook = `先停 5 秒，這件 ${product.brand} 不是只看 logo，真正要看成色、價格差和配件。`;
  const script = [
    `大家好，我是 CLOTH 的 AI 虛擬主播。今天用${styleLabel(style)}方式拆這件 ${product.title}。`,
    `第一看成色：${product.condition}；第二看價格：現價 ${product.price}，原價參考 ${product.originalPrice}；第三看適合場景：${product.description.slice(0, 48)}。`,
    '如果你是第一次買二手精品，不要只問平不平，要問配件、瑕疵、保養和退貨條件。',
    cta,
  ].join(' ');

  return {
    planId: `live-${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    accountStyle: style,
    hook,
    script,
    interactionPrompts: [
      '你想看上身效果、細節圖，還是價格拆解？留言 1/2/3。',
      '你會自用、送禮，還是轉售？我下一段按用途講。',
      '想要同品牌三件對比，留言品牌名。',
    ],
    cta,
    inventoryCheck: inventoryStatus(product),
    financeCheck: financeCheck(product),
    supportNotes: [
      '直播中只引導真實留言，不製造假粉絲或假評論。',
      '如被問到真假、退貨、物流，導去客服工單或 FAQ。',
      '缺貨 SKU 不可作主推，只能作款式參考。',
    ],
    safetyNote: '此流程使用 AI 虛擬主播身份；不得冒充真人或購買水軍互動。',
    createdAt: new Date().toISOString(),
  };
}

router.get('/readiness', (_req: Request, res: Response) => {
  try {
    const sellable = products.filter(p => p.status === '待售');
    ok(res, {
      ready: sellable.length > 0,
      sellableCount: sellable.length,
      checks: ['product_data', 'inventory_guardrail', 'finance_estimate', 'support_notes'],
      safetyNote: '只做真實觀眾增長與內部 demo 模擬，不做水軍。',
    });
  } catch (err) {
    serverError(res, err);
  }
});

router.post('/selling-plan', (req: Request, res: Response) => {
  try {
    ok(res, buildPlan(req), 'AI 虛擬主播帶貨任務已生成');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
