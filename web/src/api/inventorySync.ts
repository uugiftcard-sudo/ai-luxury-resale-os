/**
 * Inventory Sync API Client
 * Multi-market inventory synchronization.
 */
import type { ApiResponse } from '../types';

interface MarketSyncState {
  market: string;
  isListed: boolean;
  stock: number;
  syncedPrice: number;
  syncStatus: string;
  lastSynced: string | null;
}

export interface ProductSyncStatus {
  id: string;
  title: string;
  brand: string;
  status: string;
  basePrice: number;
  markets: MarketSyncState[];
}

export interface SyncStatusResponse {
  products: ProductSyncStatus[];
  summary: {
    total: number;
    byMarket: { UK: number; HK: number; CN: number };
    synced: number;
    pending: number;
    errors: number;
  };
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('cloth_jwt');
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
  return data as ApiResponse<T>;
}

export const inventorySyncApi = {
  getSyncStatus: (market?: string): Promise<SyncStatusResponse> => {
    const params = market ? `?market=${market}` : '';
    return authRequest<SyncStatusResponse>(`/inventory/sync-status${params}`).then(r => r.data!);
  },

  updateMarketSync: (productId: string, markets: string[]): Promise<unknown> => {
    return authRequest<unknown>(`/products/${productId}/market-sync`, {
      method: 'PATCH',
      body: JSON.stringify({ markets }),
    }).then(r => r.data!);
  },

  updateStock: (
    productId: string,
    market: string,
    stock: number,
    syncedPrice?: number,
  ): Promise<unknown> => {
    return authRequest<unknown>(`/products/${productId}/market-sync`, {
      method: 'PATCH',
      body: JSON.stringify({ market, stock, syncedPrice }),
    }).then(r => r.data!);
  },

  bulkSync: (productIds: string[], markets: string[]): Promise<{ results: Array<{ id: string; success: boolean }>; successCount: number; total: number }> => {
    type BulkResult = { results: Array<{ id: string; success: boolean }>; successCount: number; total: number };
    return authRequest<BulkResult>('/inventory/bulk-sync', {
      method: 'POST',
      body: JSON.stringify({ productIds, markets }),
    }).then(r => r.data!);
  },
};
