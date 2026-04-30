import { PaginatedProducts, StagedMedia } from './types';

const API_URL = '/api';

const MAX_UPLOAD_MESSAGE =
  'Upload too large for the server. The app allows large files, but your VPS, reverse proxy, or container limits may still reject very large uploads.';

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
      throw new Error(MAX_UPLOAD_MESSAGE);
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
    if (params?.pageName) query.set('pageName', params.pageName);

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

  getHeroProduct: async (): Promise<import('./types').Product | null> => {
    const res = await fetch(`${API_URL}/products/hero`);
    if (!res.ok) return null;
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

  stageUpload: (file: File, options?: { onProgress?: (percent: number) => void; signal?: AbortSignal }) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('media', file);

    const promise = new Promise<StagedMedia>((resolve, reject) => {
      xhr.open('POST', `${API_URL}/uploads/stage`);

      const headers = getAuthHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !options?.onProgress) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.onabort = () => reject(new Error('Upload canceled'));

      xhr.onload = () => {
        const contentType = xhr.getResponseHeader('content-type') || '';
        const text = xhr.responseText || '';

        if (contentType.includes('application/json')) {
          const data = JSON.parse(text || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
            return;
          }
          reject(new Error(data.error || data.message || `Request failed with status ${xhr.status}`));
          return;
        }

        if (xhr.status === 413 || text.includes('Request Entity Too Large')) {
          reject(new Error(MAX_UPLOAD_MESSAGE));
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(text));
          return;
        }

        reject(new Error(text || `Request failed with status ${xhr.status}`));
      };

      if (options?.signal) {
        if (options.signal.aborted) {
          xhr.abort();
          return;
        }
        options.signal.addEventListener('abort', () => xhr.abort(), { once: true });
      }

      xhr.send(formData);
    });

    return { xhr, promise };
  },

  deleteStagedUpload: async (id: string) => {
    const res = await fetch(`${API_URL}/uploads/stage/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

  updateProductPages: async (id: string, flags: { isTrending?: boolean; isSale?: boolean; isHeroFeatured?: boolean; isVisible?: boolean; isAvailable?: boolean }) => {
    const res = await fetch(`${API_URL}/products/${id}/pages`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(flags),
    });
    return parseResponse(res);
  },

  getMediaStatus: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}/media-status`, {
      headers: getAuthHeaders(),
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
