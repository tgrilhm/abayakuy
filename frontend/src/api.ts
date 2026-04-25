/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

  getProducts: async () => {
    const res = await fetch(`${API_URL}/products`, {
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

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};
