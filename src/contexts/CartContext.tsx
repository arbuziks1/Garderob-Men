import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '../types';

const CART_KEY = 'gm_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, colorId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, colorId: string, size: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors (private browsing, quota)
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.colorId === newItem.colorId && i.size === newItem.size
      );
      if (idx === -1) return [...prev, newItem];
      const next = [...prev];
      const combinedQty = Math.min(next[idx].quantity + newItem.quantity, newItem.maxStock);
      next[idx] = { ...next[idx], quantity: combinedQty };
      return next;
    });
    setDrawerOpen(true);
  };

  const updateQuantity = (productId: string, colorId: string, size: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.colorId === colorId && i.size === size
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string, colorId: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.colorId === colorId && i.size === size))
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
