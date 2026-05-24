/**
 * CLOTH 倉儲管理系統類型定義
 *
 * Supabase schema reference (future migration):
 *
 * CREATE TABLE inventory (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   sku TEXT UNIQUE NOT NULL,                  -- e.g. "GC-BAG-001"
 *   product_id TEXT REFERENCES products(id),    -- optional link to product catalog
 *   product_name TEXT NOT NULL,
 *   brand TEXT,
 *   category TEXT,
 *   size TEXT,
 *   color TEXT,
 *   condition TEXT,                              -- 全新/几乎全新/轻微使用痕迹/有明显使用痕迹
 *   current_stock INTEGER NOT NULL DEFAULT 0,
 *   min_stock_threshold INTEGER DEFAULT 3,      -- 低库存预警阈值
 *   unit_cost NUMERIC(10,2),                    -- 成本价
 *   unit_price NUMERIC(10,2),                  -- 建议零售价
 *   location TEXT,                              -- 仓库位置 e.g. "A-12-3"
 *   supplier TEXT,
 *   notes TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE inventory_transactions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
 *   type TEXT NOT NULL CHECK (type IN ('inbound','outbound','adjustment','return')),
 *   quantity INTEGER NOT NULL,                 -- 入库为正，出库为负
 *   reference_no TEXT,                         -- 关联订单号/入库单号
 *   notes TEXT,
 *   operator TEXT,                              -- 操作人
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow all" ON inventory FOR ALL USING (true);
 * CREATE POLICY "Allow all" ON inventory_transactions FOR ALL USING (true);
 */

export type InventoryTransactionType = 'inbound' | 'outbound' | 'adjustment' | 'return';

export interface InventoryItem {
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

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceNo?: string;
  notes?: string;
  operator?: string;
  createdAt: string;
}

export interface InventoryFormData {
  sku: string;
  productId?: string;
  productName: string;
  brand?: string;
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  currentStock: number;
  minStockThreshold?: number;
  unitCost?: number;
  unitPrice?: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

export interface InboundFormData {
  inventoryId?: string;
  sku?: string;
  productName: string;
  quantity: number;
  referenceNo?: string;
  notes?: string;
  unitCost?: number;
  operator?: string;
}

export interface OutboundFormData {
  inventoryId?: string;
  sku?: string;
  productName: string;
  quantity: number;
  referenceNo?: string;
  notes?: string;
  operator?: string;
}

export interface InventoryStats {
  totalSKUs: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export interface InventoryApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
