import { useCallback, useEffect, useState } from 'react';
import type { Order, PromoCode, Product, StoreSettings } from '../types';
import { onStoreChange, storage } from '../services/storage';

export function useProducts(): [Product[], () => void] {
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const refresh = useCallback(() => setProducts(storage.getProducts()), []);
  useEffect(() => onStoreChange(refresh), [refresh]);
  return [products, refresh];
}

export function useOrders(): [Order[], () => void] {
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const refresh = useCallback(() => setOrders(storage.getOrders()), []);
  useEffect(() => onStoreChange(refresh), [refresh]);
  return [orders, refresh];
}

export function useSettings(): [StoreSettings, () => void] {
  const [settings, setSettings] = useState<StoreSettings>(() => storage.getSettings());
  const refresh = useCallback(() => setSettings(storage.getSettings()), []);
  useEffect(() => onStoreChange(refresh), [refresh]);
  return [settings, refresh];
}

export function usePromoCodes(): [PromoCode[], () => void] {
  const [codes, setCodes] = useState<PromoCode[]>(() => storage.getPromoCodes());
  const refresh = useCallback(() => setCodes(storage.getPromoCodes()), []);
  useEffect(() => onStoreChange(refresh), [refresh]);
  return [codes, refresh];
}
