/**
 * AI API Client
 * Handles AI-powered description generation.
 */

export interface GeneratedDescription {
  title: string;
  description: string;
  tags: string[];
  highlights: string[];
  language: string;
}

interface GenerateDescriptionParams {
  name: string;
  brand: string;
  category: string;
  condition: string;
  size?: string;
  originalPrice?: number;
  market?: string;
}

async function authRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const aiApi = {
  generateDescription: (params: GenerateDescriptionParams): Promise<GeneratedDescription> => {
    return authRequest<GeneratedDescription>('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify(params),
    }).then(r => r.data!);
  },
};
