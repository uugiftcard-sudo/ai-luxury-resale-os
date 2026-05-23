/**
 * Inventory API — routes requests through mockStorage.
 * Swap to real Supabase endpoints once configured.
 */
import { inventoryStorage, StoredInventoryItem, StoredInventoryTransaction } from './mockStorage';
import type { InventoryItem, InventoryTransaction, InventoryFormData, InventoryStats } from '../types/warehouse';

function toItem(s: StoredInventoryItem): InventoryItem {
  return {
    id: s.id, sku: s.sku, productId: s.productId, productName: s.productName,
    brand: s.brand, category: s.category, size: s.size, color: s.color,
    condition: s.condition, currentStock: s.currentStock, minStockThreshold: s.minStockThreshold,
    unitCost: s.unitCost, unitPrice: s.unitPrice, location: s.location,
    supplier: s.supplier, notes: s.notes, createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
}

function toTx(s: StoredInventoryTransaction): InventoryTransaction {
  return {
    id: s.id, inventoryId: s.inventoryId, sku: s.sku, productName: s.productName,
    type: s.type, quantity: s.quantity, referenceNo: s.referenceNo,
    notes: s.notes, operator: s.operator, createdAt: s.createdAt,
  };
}

export const inventoryApi = {
  list(): Promise<InventoryItem[]> {
    return Promise.resolve(inventoryStorage.getItems().map(toItem));
  },

  getById(id: string): Promise<InventoryItem | null> {
    const item = inventoryStorage.getItemById(id);
    return Promise.resolve(item ? toItem(item) : null);
  },

  create(form: InventoryFormData): Promise<InventoryItem> {
    const item = inventoryStorage.createItem({ ...form, createdAt: new Date().toISOString() });
    return Promise.resolve(toItem(item));
  },

  update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const item = inventoryStorage.updateItem(id, updates);
    return Promise.resolve(item ? toItem(item) : null);
  },

  getTransactions(): Promise<InventoryTransaction[]> {
    return Promise.resolve(inventoryStorage.getTransactions().map(toTx));
  },

  inbound(data: {
    inventoryId?: string;
    sku?: string;
    productName: string;
    quantity: number;
    referenceNo?: string;
    notes?: string;
    unitCost?: number;
    operator?: string;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    let item: StoredInventoryItem | null = null;

    if (data.inventoryId) {
      item = inventoryStorage.adjustStock(data.inventoryId, data.quantity);
    }

    if (!item) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      item = inventoryStorage.createItem({
        id,
        sku: data.sku ?? `AUTO-${id}`,
        productName: data.productName,
        currentStock: data.quantity,
        minStockThreshold: 3,
        unitCost: data.unitCost,
        createdAt: new Date().toISOString(),
      });
    }

    const tx = inventoryStorage.addTransaction({
      inventoryId: item.id,
      sku: item.sku,
      productName: item.productName,
      type: 'inbound',
      quantity: data.quantity,
      referenceNo: data.referenceNo,
      notes: data.notes,
      operator: data.operator,
    });

    return Promise.resolve({ item: toItem(item), transaction: toTx(tx) });
  },

  outbound(data: {
    inventoryId: string;
    quantity: number;
    referenceNo?: string;
    notes?: string;
    operator?: string;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    const item = inventoryStorage.adjustStock(data.inventoryId, -data.quantity);
    if (!item) return Promise.reject(new Error('Item not found'));

    const tx = inventoryStorage.addTransaction({
      inventoryId: item.id,
      sku: item.sku,
      productName: item.productName,
      type: 'outbound',
      quantity: -data.quantity,
      referenceNo: data.referenceNo,
      notes: data.notes,
      operator: data.operator,
    });

    return Promise.resolve({ item: toItem(item), transaction: toTx(tx) });
  },

  getStats(): Promise<InventoryStats> {
    const items = inventoryStorage.getItems();
    const totalSKUs = items.length;
    const totalStock = items.reduce((sum, i) => sum + i.currentStock, 0);
    const lowStockCount = items.filter(i => i.currentStock > 0 && i.currentStock <= i.minStockThreshold).length;
    const outOfStockCount = items.filter(i => i.currentStock === 0).length;
    const totalValue = items.reduce((sum, i) => sum + (i.currentStock * (i.unitCost ?? 0)), 0);
    return Promise.resolve({ totalSKUs, totalStock, lowStockCount, outOfStockCount, totalValue });
  },

  seedDemo(): void {
    inventoryStorage.seedDemoInventory();
  },
};
