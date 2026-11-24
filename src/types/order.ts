export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED';

export const ORDER_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'CANCELLED', 'SHIPPED', 'DELIVERED'];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен',
  CANCELLED: 'Отменен',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Выдан / Доставлен',
};

export type DeliveryMethod = 'Самовывоз из магазина' | 'Доставка по Усть-Каменогорску';

export type PaymentMethod = 'Kaspi QR' | 'Перевод' | 'Наличными при получении';

export interface OrderItem {
  productId?: string;
  sku: string;
  title: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
}

export interface DeliveryAddress {
  city: string;
  street: string;
  house: string;
  apartment?: string;
  entrance?: string;
  comment?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  status: OrderStatus;
  comment?: string;
  consentGiven: boolean;
  consentGivenAt?: string;
  paymentTransactionId?: string;
  fiscalReceiptNumber?: string;
  fiscalReceiptUrl?: string;
  deliveryAddress?: DeliveryAddress;
}

/** Shape returned by the public /api/orders/:id lookup — deliberately omits PII. */
export interface OrderPublic {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}
