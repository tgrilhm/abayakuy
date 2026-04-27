import { PaginatedProducts } from './types';

const API_URL = '/api';

const MAX_VERCEL_UPLOAD_MESSAGE =
  'Upload too large for Vercel. Please keep the total upload under about 4 MB, or upload fewer/smaller files.';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  const text = await res.text();

  if (!res.ok) {
    if (
      res.status === 413 ||
      text.includes('Request Entity Too Large') ||
      text.includes('FUNCTION_PAYLOAD_TOO_LARGE')
    ) {
      throw new Error(MAX_VERCEL_UPLOAD_MESSAGE);
    }
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return text;
};

export const api = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return parseResponse(res);
  },

  /**
   * Fetch paginated products. Returns { data: Product[], pagination: {...} }
   */
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    kategori?: string;
    pageName?: 'trending' | 'sale';
  }): Promise<PaginatedProducts> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.kategori) query.set('kategori', params.kategori);
    if (params?.pageName) query.set('page', params.pageName);

    const qs = query.toString();
    const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(),
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Unauthorized');
    }

    return parseResponse(res);
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(res);
  },

  createProduct: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return parseResponse(res);
  },

  updateProduct: async (id: string, formData: FormData) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });
    return parseResponse(res);
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return parseResponse(res);
  },

  updateProductPages: async (id: string, flags: { isTrending?: boolean; isSale?: boolean; isHeroFeatured?: boolean; isVisible?: boolean }) => {
    const res = await fetch(`${API_URL}/products/${id}/pages`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(flags),
    });
    return parseResponse(res);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};
