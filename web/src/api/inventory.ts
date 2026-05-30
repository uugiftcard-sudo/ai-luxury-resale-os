/**
 * Inventory API — real backend via /api/inventory
 */
import type { InventoryItem, InventoryTransaction, InventoryFormData, InventoryStats } from '../types/warehouse';

const BASE = '/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `请求失败 (${res.status})`);
  return json.data as T;
}

export const inventoryApi = {
  list(): Promise<InventoryItem[]> {
    return req<InventoryItem[]>('/inventory');
  },

  getById(id: string): Promise<InventoryItem | null> {
    return req<InventoryItem | null>(`/inventory/${id}`).catch(() => null);
  },

  create(form: InventoryFormData): Promise<InventoryItem> {
    return req<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  },

  update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    return req<InventoryItem | null>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete(id: string): Promise<void> {
    return req<void>(`/inventory/${id}`, { method: 'DELETE' }) as Promise<void>;
  },

  getTransactions(): Promise<InventoryTransaction[]> {
    return req<InventoryTransaction[]>('/inventory/transactions');
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
    if (data.inventoryId) {
      return req<{ item: InventoryItem; transaction: InventoryTransaction }>(
        `/inventory/${data.inventoryId}/inbound`,
        { method: 'POST', body: JSON.stringify({ quantity: data.quantity, referenceNo: data.referenceNo, notes: data.notes, operator: data.operator }) }
      );
    }
    // No existing inventoryId — create the item first, then inbound
    return req<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify({
        sku: data.sku ?? `AUTO-${Date.now()}`,
        productName: data.productName,
        currentStock: data.quantity,
        minStockThreshold: 3,
        unitCost: data.unitCost,
        notes: data.notes,
      }),
    }).then(item =>
      req<{ item: InventoryItem; transaction: InventoryTransaction }>(
        `/inventory/${item.id}/inbound`,
        { method: 'POST', body: JSON.stringify({ quantity: data.quantity, referenceNo: data.referenceNo, notes: data.notes, operator: data.operator }) }
      )
    );
  },

  outbound(data: {
    inventoryId: string;
    quantity: number;
    referenceNo?: string;
    notes?: string;
    operator?: string;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    return req<{ item: InventoryItem; transaction: InventoryTransaction }>(
      `/inventory/${data.inventoryId}/outbound`,
      { method: 'POST', body: JSON.stringify({ quantity: data.quantity, referenceNo: data.referenceNo, notes: data.notes, operator: data.operator }) }
    );
  },

  getStats(): Promise<InventoryStats> {
    return req<InventoryStats>('/inventory/stats');
  },

  getAlerts(): Promise<InventoryItem[]> {
    return req<InventoryItem[]>('/inventory/alerts');
  },
};
