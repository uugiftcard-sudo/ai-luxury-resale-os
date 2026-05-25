/**
 * CLOTH 财务 API — 收入支出记录
 */
import type {
  ApiResponse,
  FinanceRecord,
  FinanceRecordFormData,
  FinanceStats,
  FinanceCategory,
} from '../types';
import { Market } from '../types/market';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const url = `/api${path}`;
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
    if (err instanceof Error) throw Object.assign(err, { _original: err });
    throw new Error('网络请求失败，请检查网络连接');
  }
}

export const financeApi = {
  list: (market: Market): Promise<FinanceRecord[]> => {
    return request<FinanceRecord[]>(`/finance?market=${market}`).then(r => r.data ?? []);
  },

  get: (id: string, market: Market): Promise<FinanceRecord> => {
    return request<FinanceRecord>(`/finance/${id}?market=${market}`).then(r => r.data!);
  },

  create: (data: FinanceRecordFormData, market: Market): Promise<FinanceRecord> => {
    return request<FinanceRecord>('/finance', {
      method: 'POST',
      body: JSON.stringify({ ...data, amount: Number(data.amount), market }),
    }).then(r => r.data!);
  },

  update: (id: string, data: Partial<FinanceRecordFormData>, market: Market): Promise<FinanceRecord> => {
    return request<FinanceRecord>(`/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        amount: data.amount ? Number(data.amount) : undefined,
        market,
      }),
    }).then(r => r.data!);
  },

  delete: (id: string, market: Market): Promise<FinanceRecord> => {
    return request<FinanceRecord>(`/finance/${id}?market=${market}`, {
      method: 'DELETE',
    }).then(r => r.data!);
  },

  stats: (market: Market): Promise<FinanceStats> => {
    return request<FinanceStats>(`/finance/stats?market=${market}`).then(r => r.data!);
  },
};

export const INCOME_CATEGORIES: FinanceCategory[] = [
  '商品销售收入',
  '其他收入',
];

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  '商品采购',
  '物流运输',
  '平台费用',
  '仓储费用',
  '营销推广',
  '人力成本',
  '税费',
  '其他支出',
];
