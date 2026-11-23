import type { Order, OrderItem, Product, ProductColor, ProductImage } from '@prisma/client';
import {
  CATEGORY_TO_LABEL,
  DELIVERY_TO_LABEL,
  FIT_TO_LABEL,
  PAYMENT_TO_LABEL,
} from './labels';

type ColorWithImages = ProductColor & { images: ProductImage[] };
type ProductWithColors = Product & { colors: ColorWithImages[] };

export function serializeProduct(product: ProductWithColors) {
  return {
    id: product.id,
    title: product.title,
    category: CATEGORY_TO_LABEL[product.category],
    fit: FIT_TO_LABEL[product.fit],
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    description: product.description,
    modelNote: product.modelNote ?? undefined,
    createdAt: product.createdAt.toISOString(),
    colors: [...product.colors]
      .sort((a, b) => a.position - b.position)
      .map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hex,
        images: [...color.images].sort((a, b) => a.position - b.position).map((img) => img.url),
        stock: {
          S: color.stockS,
          M: color.stockM,
          L: color.stockL,
          XL: color.stockXl,
          XXL: color.stockXxl,
        },
      })),
  };
}

type OrderWithItems = Order & { items: OrderItem[] };

function serializeItems(items: OrderItem[]) {
  return items.map((item) => ({
    productId: item.productId ?? undefined,
    title: item.titleSnapshot,
    colorName: item.colorNameSnapshot,
    size: item.size,
    price: item.priceSnapshot,
    quantity: item.quantity,
  }));
}

/** Full shape — used right after order creation (frontend needs it to build the WhatsApp
 *  message) and in the admin panel. Never exposed via the public /api/orders/:id lookup. */
export function serializeOrderFull(order: OrderWithItems) {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    phone: order.phone,
    delivery: DELIVERY_TO_LABEL[order.deliveryMethod],
    payment: PAYMENT_TO_LABEL[order.paymentMethod],
    items: serializeItems(order.items),
    subtotal: order.subtotal,
    discount: order.discount,
    promoCode: order.promoCode ?? undefined,
    total: order.total,
    // Status is intentionally left as the raw English enum value — the frontend maps
    // it to a Russian label itself, per the plan agreed with the user.
    status: order.status,
    comment: order.comment ?? undefined,
    consentGiven: order.consentGiven,
    consentGivenAt: order.consentGivenAt?.toISOString(),
    paymentTransactionId: order.paymentTransactionId ?? undefined,
    fiscalReceiptNumber: order.fiscalReceiptNumber ?? undefined,
    fiscalReceiptUrl: order.fiscalReceiptUrl ?? undefined,
  };
}

/** Minimal shape for the public order-status page (/order/:id) — deliberately omits
 *  customerName/phone/comment so a guessed or shared order id can't leak another
 *  customer's personal data. */
export function serializeOrderPublic(order: OrderWithItems) {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    total: order.total,
    items: serializeItems(order.items),
  };
}
