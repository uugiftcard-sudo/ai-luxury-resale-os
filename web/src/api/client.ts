/**
 * CLOTH API 客户端
 * Multi-market: each region has its own API base URL and currency display.
 */
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Order,
  Brand,
  Category,
  ProductFilter,
  OrderFormData,
} from '../types';
import { Market, MARKET_CONFIGS, convertPrice } from '../types/market';

/** Per-market API base URL — all markets share the same Express server,
 *  differentiated by the `market` query param. */
function apiBase(_market: Market): string {
  return `/api`;
}

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `请求失败 (${res.status})`);
    }

    return data as ApiResponse<T>;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
}

/** Currency-aware price display helper used throughout the app. */
export function displayPrice(cnyPrice: number, market: Market): string {
  const config = MARKET_CONFIGS[market];
  const amount = convertPrice(cnyPrice, market);
  return `${config.currencySymbol}${amount.toLocaleString(config.locale)}`;
}

// ── Product API ────────────────────────────────────────────────────────────────

export const productApi = {
  list: (
    market: Market,
    filter: ProductFilter = {},
  ): Promise<PaginatedResponse<Product>> => {
    const base = apiBase(market);
    const params = new URLSearchParams({ market });
    if (filter.brand) params.set('brand', filter.brand);
    if (filter.category) params.set('category', filter.category);
    if (filter.condition) params.set('condition', filter.condition);
    if (filter.minPrice !== undefined) params.set('minPrice', String(filter.minPrice));
    if (filter.maxPrice !== undefined) params.set('maxPrice', String(filter.maxPrice));
    if (filter.status) params.set('status', filter.status);
    if (filter.search) params.set('search', filter.search);
    if (filter.page) params.set('page', String(filter.page));
    if (filter.limit) params.set('limit', String(filter.limit));

    const query = params.toString();
    return request<PaginatedResponse<Product>>(
      base,
      `/products${query ? `?${query}` : ''}`,
    ).then(r => r.data!);
  },

  get: (id: string, market: Market): Promise<Product> => {
    const base = apiBase(market);
    return request<Product>(base, `/products/${id}?market=${market}`).then(r => r.data!);
  },

  create: (data: Partial<Product>, market: Market): Promise<Product> => {
    const base = apiBase(market);
    return request<Product>(base, '/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.data!);
  },

  update: (id: string, data: Partial<Product>, market: Market): Promise<Product> => {
    const base = apiBase(market);
    return request<Product>(base, `/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(r => r.data!);
  },

  delete: (id: string, market: Market): Promise<Product> => {
    const base = apiBase(market);
    return request<Product>(base, `/products/${id}`, {
      method: 'DELETE',
    }).then(r => r.data!);
  },
};

// ── Order API ─────────────────────────────────────────────────────────────────

export const orderApi = {
  list: (market: Market, status?: string): Promise<PaginatedResponse<Order>> => {
    const base = apiBase(market);
    const params = status ? `?status=${status}&market=${market}` : `?market=${market}`;
    return request<PaginatedResponse<Order>>(base, `/orders${params}`).then(r => r.data!);
  },

  get: (id: string, market: Market): Promise<Order> => {
    const base = apiBase(market);
    return request<Order>(base, `/orders/${id}?market=${market}`).then(r => r.data!);
  },

  create: (data: OrderFormData, market: Market): Promise<Order> => {
    const base = apiBase(market);
    return request<Order>(base, '/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.data!);
  },

  updateStatus: (id: string, status: string, market: Market): Promise<Order> => {
    const base = apiBase(market);
    return request<Order>(base, `/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }).then(r => r.data!);
  },
};

// ── Brand & Category APIs ─────────────────────────────────────────────────────

export const brandApi = {
  list: (market: Market): Promise<Brand[]> => {
    const base = apiBase(market);
    return request<Brand[]>(base, `/brands?market=${market}`).then(r => r.data ?? []);
  },
};

export const categoryApi = {
  list: (market: Market): Promise<Category[]> => {
    const base = apiBase(market);
    return request<Category[]>(base, `/categories?market=${market}`).then(r => r.data ?? []);
  },
};
