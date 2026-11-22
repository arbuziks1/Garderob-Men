export interface WorkingHours {
  days: string;
  hours: string;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  workingHours: WorkingHours[];
  whatsappPhone: string;
  phoneDisplay: string;
  kaspiPayLink: string;
  instagramUrl: string;
  twoGisUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaLabel: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
}
