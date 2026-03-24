import type { AuthResponse, ProductsResponse } from '../types';

const BASE_URL = 'https://dummyjson.com';

function getToken(): string | null {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
    throw new Error(error.message || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchProducts(params: {
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: string;
  search?: string;
}): Promise<ProductsResponse> {
  const { limit = 20, skip = 0, sortBy, order, search } = params;

  if (search) {
    const queryParams = new URLSearchParams({
      q: search,
      limit: String(limit),
      skip: String(skip),
    });
    if (sortBy && order) {
      queryParams.set('sortBy', sortBy);
      queryParams.set('order', order);
    }
    return request<ProductsResponse>(`/products/search?${queryParams}`);
  }

  const queryParams = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (sortBy && order) {
    queryParams.set('sortBy', sortBy);
    queryParams.set('order', order);
  }

  return request<ProductsResponse>(`/products?${queryParams}`);
}

export async function addProduct(product: {
  title: string;
  price: number;
  brand: string;
  sku: string;
}): Promise<unknown> {
  return request('/products/add', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}
