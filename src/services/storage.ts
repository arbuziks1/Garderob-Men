import type { Order, PromoCode, Product, StoreSettings } from '../types';
import {
  DEFAULT_PROMO_CODES,
  DEFAULT_STORE_SETTINGS,
  SEED_ORDERS,
  SEED_PRODUCTS,
} from '../data/seedData';

const KEYS = {
  products: 'gm_products',
  orders: 'gm_orders',
  settings: 'gm_settings',
  promoCodes: 'gm_promo_codes',
  seeded: 'gm_seeded_v1',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // storage unavailable (private mode) or quota exceeded (e.g. too many/too large uploaded images)
    return false;
  }
}

function ensureSeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return;
  write(KEYS.products, SEED_PRODUCTS);
  write(KEYS.orders, SEED_ORDERS);
  write(KEYS.settings, DEFAULT_STORE_SETTINGS);
  write(KEYS.promoCodes, DEFAULT_PROMO_CODES);
  write(KEYS.seeded, true);
}

ensureSeeded();

function notifyChange(): void {
  window.dispatchEvent(new CustomEvent('gm_store_change'));
}

export const storage = {
  getProducts(): Product[] {
    return read(KEYS.products, SEED_PRODUCTS);
  },
  saveProducts(products: Product[]): boolean {
    const ok = write(KEYS.products, products);
    notifyChange();
    return ok;
  },
  upsertProduct(product: Product): boolean {
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx === -1) products.push(product);
    else products[idx] = product;
    return storage.saveProducts(products);
  },
  deleteProduct(id: string): void {
    storage.saveProducts(storage.getProducts().filter((p) => p.id !== id));
  },

  getOrders(): Order[] {
    return read(KEYS.orders, SEED_ORDERS);
  },
  saveOrders(orders: Order[]): void {
    write(KEYS.orders, orders);
    notifyChange();
  },
  addOrder(order: Order): void {
    const orders = storage.getOrders();
    orders.unshift(order);
    storage.saveOrders(orders);
  },
  updateOrderStatus(id: string, status: Order['status']): void {
    const orders = storage.getOrders().map((o) => (o.id === id ? { ...o, status } : o));
    storage.saveOrders(orders);
  },

  getSettings(): StoreSettings {
    // merge with defaults so settings saved by an older version of the app
    // (missing fields added since) don't crash code that reads those fields
    return { ...DEFAULT_STORE_SETTINGS, ...read(KEYS.settings, DEFAULT_STORE_SETTINGS) };
  },
  saveSettings(settings: StoreSettings): boolean {
    const ok = write(KEYS.settings, settings);
    notifyChange();
    return ok;
  },

  getPromoCodes(): PromoCode[] {
    return read(KEYS.promoCodes, DEFAULT_PROMO_CODES);
  },
  savePromoCodes(codes: PromoCode[]): void {
    write(KEYS.promoCodes, codes);
    notifyChange();
  },

  resetDemoData(): void {
    write(KEYS.products, SEED_PRODUCTS);
    write(KEYS.orders, SEED_ORDERS);
    write(KEYS.settings, DEFAULT_STORE_SETTINGS);
    write(KEYS.promoCodes, DEFAULT_PROMO_CODES);
    notifyChange();
  },
};

export function onStoreChange(callback: () => void): () => void {
  window.addEventListener('gm_store_change', callback);
  return () => window.removeEventListener('gm_store_change', callback);
}
