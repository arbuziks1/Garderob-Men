import type { DeliveryAddress, Order, OrderPublic, OrderStatus, Product, PromoCode, StoreSettings } from '../types';

const ADMIN_TOKEN_KEY = 'gm_admin_token';
const CUSTOMER_TOKEN_KEY = 'gm_customer_token';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // ignore storage errors (private browsing)
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('gm_admin_unauthorized'));
}

export function onAdminUnauthorized(callback: () => void): () => void {
  window.addEventListener('gm_admin_unauthorized', callback);
  return () => window.removeEventListener('gm_admin_unauthorized', callback);
}

export function getCustomerToken(): string | null {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setCustomerToken(token: string): void {
  try {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  } catch {
    // ignore storage errors (private browsing)
  }
}

export function clearCustomerToken(): void {
  try {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  } catch {
    // ignore
  }
}

class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Auth = 'admin' | 'customer' | false;

async function request<T>(path: string, options: RequestInit = {}, auth: Auth = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth === 'admin') {
    const token = getAdminToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  } else if (auth === 'customer') {
    const token = getCustomerToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });

  if (auth === 'admin' && res.status === 401) {
    clearAdminToken();
  }
  if (auth === 'customer' && res.status === 401) {
    clearCustomerToken();
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const message =
      (body as { error?: string } | undefined)?.error ?? `Запрос завершился с ошибкой (${res.status})`;
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function json(body: unknown): string {
  return JSON.stringify(body);
}

// ---- Public endpoints ----

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  delivery: string;
  payment: string;
  items: { productId: string; colorId: string; sizeStockId: string; sizeLabel: string; quantity: number }[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  comment?: string;
  consentGiven: boolean;
  deliveryAddress?: DeliveryAddress;
}

export const api = {
  getProducts(): Promise<Product[]> {
    return request('/api/products');
  },
  getSettings(): Promise<StoreSettings> {
    return request('/api/settings');
  },
  checkPromoCode(code: string): Promise<{ valid: boolean; discountPercent?: number }> {
    return request(`/api/promo-codes/${encodeURIComponent(code)}`);
  },
  createOrder(input: CreateOrderInput): Promise<Order> {
    return request('/api/orders', { method: 'POST', body: json(input) });
  },
  getPublicOrder(id: string): Promise<OrderPublic> {
    return request(`/api/orders/${encodeURIComponent(id)}`);
  },
  mockPay(id: string): Promise<void> {
    return request(`/api/dev/mock-pay/${encodeURIComponent(id)}`, { method: 'POST' });
  },

  // ---- Admin auth ----
  async adminLogin(email: string, password: string): Promise<void> {
    const { token } = await request<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: json({ email, password }),
    });
    setAdminToken(token);
  },
  logoutAdmin(): void {
    clearAdminToken();
  },

  // ---- Customer auth ----
  async customerRegister(phone: string, password: string): Promise<{ phone: string }> {
    const { token, phone: confirmedPhone } = await request<{ token: string; phone: string }>(
      '/api/customer/register',
      { method: 'POST', body: json({ phone, password }) }
    );
    setCustomerToken(token);
    return { phone: confirmedPhone };
  },
  async customerLogin(phone: string, password: string): Promise<{ phone: string }> {
    const { token, phone: confirmedPhone } = await request<{ token: string; phone: string }>(
      '/api/customer/login',
      { method: 'POST', body: json({ phone, password }) }
    );
    setCustomerToken(token);
    return { phone: confirmedPhone };
  },
  customerLogout(): void {
    clearCustomerToken();
  },
  getMyOrders(): Promise<{ orders: Order[]; bonusBalance?: number }> {
    return request('/api/customer/orders', {}, 'customer');
  },

  // ---- Admin: products ----
  getAdminProducts(): Promise<Product[]> {
    return request('/api/admin/products', {}, 'admin');
  },
  createProduct(data: unknown): Promise<Product> {
    return request('/api/admin/products', { method: 'POST', body: json(data) }, 'admin');
  },
  updateProduct(id: string, data: unknown): Promise<Product> {
    return request(`/api/admin/products/${id}`, { method: 'PUT', body: json(data) }, 'admin');
  },
  deleteProduct(id: string): Promise<void> {
    return request(`/api/admin/products/${id}`, { method: 'DELETE' }, 'admin');
  },
  async uploadProductImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('image', file);
    const { url } = await request<{ url: string }>(
      '/api/admin/products/upload',
      { method: 'POST', body: form },
      'admin'
    );
    return url;
  },

  // ---- Admin: orders ----
  getAdminOrders(): Promise<Order[]> {
    return request('/api/admin/orders', {}, 'admin');
  },
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return request(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: json({ status }) }, 'admin');
  },

  // ---- Admin: settings ----
  updateSettings(data: StoreSettings): Promise<StoreSettings> {
    return request('/api/admin/settings', { method: 'PUT', body: json(data) }, 'admin');
  },

  // ---- Admin: promo codes ----
  getAdminPromoCodes(): Promise<PromoCode[]> {
    return request('/api/admin/promo-codes', {}, 'admin');
  },
  createPromoCode(data: { code: string; discountPercent: number; active: boolean }): Promise<PromoCode> {
    return request('/api/admin/promo-codes', { method: 'POST', body: json(data) }, 'admin');
  },
  updatePromoCode(id: string, data: Partial<Pick<PromoCode, 'code' | 'discountPercent' | 'active'>>): Promise<PromoCode> {
    return request(`/api/admin/promo-codes/${id}`, { method: 'PUT', body: json(data) }, 'admin');
  },
  deletePromoCode(id: string): Promise<void> {
    return request(`/api/admin/promo-codes/${id}`, { method: 'DELETE' }, 'admin');
  },

  // ---- Admin: misc ----
  resetDemoData(): Promise<void> {
    return request('/api/admin/reset-demo-data', { method: 'POST' }, 'admin');
  },
};

export { ApiError };
