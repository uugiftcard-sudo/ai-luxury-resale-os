/**
 * Inventory API — backed by the Express `/api/inventory` routes.
 */
import type { InventoryItem, InventoryTransaction, InventoryFormData, InventoryStats } from '../types/warehouse';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type InventoryItemWithStatus = InventoryItem & { status?: 'in_stock' | 'low_stock' | 'out_of_stock' };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || body.success === false) {
    throw new Error(body.error || body.message || `Inventory request failed (${res.status})`);
  }
  return body.data as T;
}

function normalizeItem(item: InventoryItemWithStatus): InventoryItem {
  const { status, ...normalized } = item;
  void status;
  return normalized;
}

export const inventoryApi = {
  async list(): Promise<InventoryItem[]> {
    const items = await request<InventoryItemWithStatus[]>('/inventory');
    return items.map(normalizeItem);
  },

  async getById(id: string): Promise<InventoryItem | null> {
    try {
      const item = await request<InventoryItemWithStatus>(`/inventory/${encodeURIComponent(id)}`);
      return normalizeItem(item);
    } catch {
      return null;
    }
  },

  async create(form: InventoryFormData): Promise<InventoryItem> {
    const item = await request<InventoryItemWithStatus>('/inventory', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return normalizeItem(item);
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const item = await request<InventoryItemWithStatus>(`/inventory/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return normalizeItem(item);
  },

  getTransactions(): Promise<InventoryTransaction[]> {
    return request<InventoryTransaction[]>('/inventory/transactions');
  },

  async inbound(data: {
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
      const result = await request<{ item: InventoryItemWithStatus; transaction: InventoryTransaction }>(
        `/inventory/${encodeURIComponent(data.inventoryId)}/inbound`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      return { item: normalizeItem(result.item), transaction: result.transaction };
    }

    const created = await this.create({
      sku: data.sku ?? `AUTO-${Date.now()}`,
      productName: data.productName,
      currentStock: data.quantity,
      minStockThreshold: 3,
      unitCost: data.unitCost,
    });
    return {
      item: created,
      transaction: {
        id: `pending-${created.id}`,
        inventoryId: created.id,
        sku: created.sku,
        productName: created.productName,
        type: 'inbound',
        quantity: data.quantity,
        referenceNo: data.referenceNo,
        notes: data.notes,
        operator: data.operator,
        createdAt: created.createdAt,
      },
    };
  },

  async outbound(data: {
    inventoryId: string;
    quantity: number;
    referenceNo?: string;
    notes?: string;
    operator?: string;
  }): Promise<{ item: InventoryItem; transaction: InventoryTransaction }> {
    const result = await request<{ item: InventoryItemWithStatus; transaction: InventoryTransaction }>(
      `/inventory/${encodeURIComponent(data.inventoryId)}/outbound`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return { item: normalizeItem(result.item), transaction: result.transaction };
  },

  getStats(): Promise<InventoryStats> {
    return request<InventoryStats>('/inventory/stats');
  },

  seedDemo(): void {
    // Demo seed now lives in the API SQLite collection.
  },
};
