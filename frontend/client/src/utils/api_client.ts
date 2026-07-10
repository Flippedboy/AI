/** 自定义 HTTP 客户端，替换 @lark-apaas/client-toolkit 的 axiosForBackend */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type RequestOptions = {
  method?: string;
  url?: string;
  data?: unknown;
  params?: Record<string, string | number | undefined>;
};

export async function apiClient<T>(options: RequestOptions): Promise<{ data: T }> {
  const { method = 'GET', url = '', data, params } = options;

  let fullUrl = `${API_BASE_URL}${url}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '' && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(fullUrl, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return { data: result as T };
}

export const axiosForBackend = apiClient;

export const logger = {
  info: (...args: unknown[]) => console.log('[API]', ...args),
  warn: (...args: unknown[]) => console.warn('[API]', ...args),
  error: (msg: string, ...args: unknown[]) => console.error('[API]', msg, ...args),
};

export default apiClient;
