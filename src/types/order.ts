export type OrderStatus = 'Новый' | 'Подтвержден' | 'Выдан / Доставлен' | 'Отменен';

export type DeliveryMethod = 'Самовывоз из магазина' | 'Доставка по Усть-Каменогорску';

export type PaymentMethod = 'Kaspi QR' | 'Перевод' | 'Наличными при получении';

export interface OrderItem {
  productId: string;
  title: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
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
}
