/**
 * CLOTH API 客户端
 * 封装所有与后端 API 的交互
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

const BASE_URL = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
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
    throw new Error('网络请求失败，请检查网络连接', { cause: err });
  }
}

// ==================== 商品 API ====================
export const productApi = {
  /** 商品列表（支持筛选分页） */
  list: (filter: ProductFilter = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
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
    return request<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`).then(r => r.data!);
  },

  /** 商品详情 */
  get: (id: string): Promise<Product> =>
    request<Product>(`/products/${id}`).then(r => r.data!),

  /** 上架商品 */
  create: (data: Partial<Product>): Promise<Product> =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.data!),

  /** 更新商品 */
  update: (id: string, data: Partial<Product>): Promise<Product> =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(r => r.data!),

  /** 下架商品 */
  delete: (id: string): Promise<Product> =>
    request<Product>(`/products/${id}`, { method: 'DELETE' }).then(r => r.data!),
};

// ==================== 订单 API ====================
export const orderApi = {
  /** 订单列表 */
  list: (status?: string): Promise<PaginatedResponse<Order>> => {
    const params = status ? `?status=${status}` : '';
    return request<PaginatedResponse<Order>>(`/orders${params}`).then(r => r.data!);
  },

  /** 订单详情 */
  get: (id: string): Promise<Order> =>
    request<Order>(`/orders/${id}`).then(r => r.data!),

  /** 创建订单 */
  create: (data: OrderFormData): Promise<Order> =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.data!),

  /** 更新订单状态 */
  updateStatus: (id: string, status: string): Promise<Order> =>
    request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }).then(r => r.data!),
};

// ==================== 品牌 API ====================
export const brandApi = {
  list: (): Promise<Brand[]> =>
    request<Brand[]>('/brands').then(r => r.data ?? []),
};

// ==================== 分类 API ====================
export const categoryApi = {
  list: (): Promise<Category[]> =>
    request<Category[]>('/categories').then(r => r.data ?? []),
};
