/**
 * Stripe Payments API Client
 * Handles PaymentIntent creation and config fetching.
 */
import type { ApiResponse } from '../types';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface StripeConfig {
  publishableKey: string;
  enabled: boolean;
}

async function authRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('cloth_jwt');
  const base = '/api';
  const res = await fetch(`${base}${path}`, {
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

export const paymentApi = {
  getConfig: (): Promise<StripeConfig> => {
    return authRequest<StripeConfig>('/payments/config').then(r => r.data!);
  },

  createIntent: (
    productId: string,
    currency: string,
    quantity = 1,
    amount?: number,
  ): Promise<PaymentIntentResponse> => {
    const body: Record<string, unknown> = { productId, currency, quantity };
    if (amount !== undefined) body.amount = amount;
    return authRequest<PaymentIntentResponse>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(r => r.data!);
  },
};
