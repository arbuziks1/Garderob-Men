import { useCallback, useEffect, useState } from 'react';
import type { Order, PromoCode, Product, StoreSettings } from '../types';
import { api } from '../services/api';

const EMPTY_SETTINGS: StoreSettings = {
  storeName: '',
  address: '',
  workingHours: [],
  whatsappPhone: '',
  phoneDisplay: '',
  kaspiPayLink: '',
  legalName: '',
  businessId: '',
  instagramUrl: '',
  twoGisUrl: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImage: '',
  heroCtaLabel: '',
  mapLat: null,
  mapLng: null,
  bonusEnabled: false,
  bonusPercent: 0,
};

export function useProducts(): [Product[], () => void] {
  const [products, setProducts] = useState<Product[]>([]);
  const refresh = useCallback(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);
  return [products, refresh];
}

export function useSettings(): [StoreSettings, () => void] {
  const [settings, setSettings] = useState<StoreSettings>(EMPTY_SETTINGS);
  const refresh = useCallback(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);
  return [settings, refresh];
}

export function useAdminOrders(): [Order[], () => void] {
  const [orders, setOrders] = useState<Order[]>([]);
  const refresh = useCallback(() => {
    api.getAdminOrders().then(setOrders).catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);
  return [orders, refresh];
}

export function useAdminPromoCodes(): [PromoCode[], () => void] {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const refresh = useCallback(() => {
    api.getAdminPromoCodes().then(setCodes).catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);
  return [codes, refresh];
}
