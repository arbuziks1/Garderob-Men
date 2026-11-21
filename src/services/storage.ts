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

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota) — fail silently, in-memory state still works for this session
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
  saveProducts(products: Product[]): void {
    write(KEYS.products, products);
    notifyChange();
  },
  upsertProduct(product: Product): void {
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx === -1) products.push(product);
    else products[idx] = product;
    storage.saveProducts(products);
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
    return read(KEYS.settings, DEFAULT_STORE_SETTINGS);
  },
  saveSettings(settings: StoreSettings): void {
    write(KEYS.settings, settings);
    notifyChange();
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
