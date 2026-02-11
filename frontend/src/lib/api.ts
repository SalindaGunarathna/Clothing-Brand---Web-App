const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

type ApiErrorPayload = {
  message?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (body as ApiErrorPayload | null)?.message || 'Request failed';
    throw new Error(message);
  }

  return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}
