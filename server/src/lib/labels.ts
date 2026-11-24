import type { Category, DeliveryMethod, Fit, PaymentMethod } from '@prisma/client';

// The frontend's Category/Fit/DeliveryMethod/PaymentMethod types are Russian-label
// unions (unlike OrderStatus, which the frontend explicitly maps itself — see the
// agreed plan). To keep the frontend migration a near drop-in change, the API speaks
// these same Russian strings in both requests and responses; only inside this service
// do they become Postgres enums.

export const CATEGORY_TO_LABEL: Record<Category, string> = {
  VERKHNYAYA_ODEZHDA: 'Верхняя одежда',
  HUDI_I_SVITSHOTY: 'Худи и свитшоты',
  BRYUKI_I_DZHINSY: 'Брюки и джинсы',
  KOSTYUMY_I_RUBASHKI: 'Костюмы и рубашки',
  OBUV_I_AKSESSUARY: 'Обувь и аксессуары',
};

export const LABEL_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
  Object.entries(CATEGORY_TO_LABEL).map(([enumVal, label]) => [label, enumVal as Category])
);

export const FIT_TO_LABEL: Record<Fit, string> = {
  OVERSIZE: 'Oversize',
  REGULAR: 'Regular',
  SLIM: 'Slim',
};

export const LABEL_TO_FIT: Record<string, Fit> = Object.fromEntries(
  Object.entries(FIT_TO_LABEL).map(([enumVal, label]) => [label, enumVal as Fit])
);

export const DELIVERY_TO_LABEL: Record<DeliveryMethod, string> = {
  SELF_PICKUP: 'Самовывоз из магазина',
  DELIVERY: 'Доставка по Усть-Каменогорску',
};

export const LABEL_TO_DELIVERY: Record<string, DeliveryMethod> = Object.fromEntries(
  Object.entries(DELIVERY_TO_LABEL).map(([enumVal, label]) => [label, enumVal as DeliveryMethod])
);

// Payment method is no longer a customer choice (see orderLifecycle.createOrder) —
// only the enum -> label direction is needed, for display in the admin panel / order
// confirmation. There's no LABEL_TO_PAYMENT reverse map because nothing parses a
// payment label from client input anymore.
export const PAYMENT_TO_LABEL: Record<PaymentMethod, string> = {
  CASH_ON_PICKUP: 'Оплата при получении',
  CARD_ONLINE: 'Банковская карта (онлайн)',
};
