import type { Order } from '../types';
import { formatPrice } from './format';

export function buildWhatsAppOrderMessage(order: Order): string {
  const lines = [
    `Новый заказ №${order.id} — GARDEROB MEN`,
    '',
    `Клиент: ${order.customerName}`,
    `Телефон: ${order.phone}`,
    `Доставка: ${order.delivery}`,
    `Оплата: ${order.payment}`,
    '',
    'Состав заказа:',
    ...order.items.map(
      (item) =>
        `• ${item.sku} ${item.title} (${item.colorName}, размер ${item.size}) × ${item.quantity} — ${formatPrice(
          item.price * item.quantity
        )}`
    ),
    '',
    `Сумма: ${formatPrice(order.subtotal)}`,
  ];

  if (order.discount > 0) {
    lines.push(`Скидка${order.promoCode ? ` (${order.promoCode})` : ''}: -${formatPrice(order.discount)}`);
  }
  lines.push(`Итого к оплате: ${formatPrice(order.total)}`);

  return lines.join('\n');
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
