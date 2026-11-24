export interface WorkingHours {
  days: string;
  hours: string;
}

export interface StoreSettings {
  storeName: string;
  whatsappPhone: string;
  phoneDisplay: string;
  kaspiPayLink: string;
  legalName: string;
  businessId: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaLabel: string;
  bonusEnabled: boolean;
  bonusPercent: number;
}

export interface PickupBranch {
  id: string;
  name: string;
  address: string;
  workingHours: WorkingHours[];
  phone: string;
  twoGisUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  position: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
}
