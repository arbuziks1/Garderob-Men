import type {
  BranchStock,
  Order,
  OrderItem,
  PickupBranch,
  Product,
  ProductColor,
  ProductImage,
  ProductSizeStock,
} from '@prisma/client';
import {
  CATEGORY_TO_LABEL,
  DELIVERY_TO_LABEL,
  FIT_TO_LABEL,
  PAYMENT_TO_LABEL,
} from './labels';

type BranchStockWithBranch = BranchStock & { branch: PickupBranch };
type SizeStockWithBranches = ProductSizeStock & { branchStocks: BranchStockWithBranch[] };
type ColorWithSizes = ProductColor & { images: ProductImage[]; sizes: SizeStockWithBranches[] };
type ProductWithColors = Product & { colors: ColorWithSizes[] };

export function serializeProduct(product: ProductWithColors) {
  return {
    id: product.id,
    sku: product.sku,
    title: product.title,
    category: CATEGORY_TO_LABEL[product.category],
    fit: FIT_TO_LABEL[product.fit],
    // Raw enum value (SMALL_FIT/TRUE_TO_SIZE/BIG_FIT) — same pattern as OrderStatus:
    // the frontend maps it to a Russian label itself.
    sizeFit: product.sizeFit ?? undefined,
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    description: product.description,
    modelNote: product.modelNote ?? undefined,
    brand: product.brand ?? undefined,
    countryOfOrigin: product.countryOfOrigin ?? undefined,
    season: product.season ?? undefined,
    material: product.material ?? undefined,
    composition: product.composition ?? undefined,
    characteristics: (product.characteristics as Record<string, string> | null) ?? undefined,
    measurements:
      (product.measurements as { rows: string[]; values: Record<string, Record<string, number>> } | null) ??
      undefined,
    createdAt: product.createdAt.toISOString(),
    colors: [...product.colors]
      .sort((a, b) => a.position - b.position)
      .map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hex,
        images: [...color.images].sort((a, b) => a.position - b.position).map((img) => img.url),
        sizes: [...color.sizes]
          .sort((a, b) => a.position - b.position)
          .map((s) => {
            const branchStocks = [...s.branchStocks].sort((a, b) => a.branch.position - b.branch.position);
            return {
              id: s.id,
              sizeRu: s.sizeRu ?? undefined,
              sizeEu: s.sizeEu ?? undefined,
              sizeInt: s.sizeInt ?? undefined,
              // Summed across branches so everything that already reads a flat `stock`
              // (out-of-stock filters, badges, the floating cart bar, etc.) keeps
              // working unchanged on the frontend.
              stock: branchStocks.reduce((sum, bs) => sum + bs.stock, 0),
              branchStocks: branchStocks.map((bs) => ({
                branchId: bs.branchId,
                branchName: bs.branch.name,
                stock: bs.stock,
              })),
            };
          }),
      })),
  };
}

type OrderWithItems = Order & { items: OrderItem[] };

function serializeItems(items: OrderItem[]) {
  return items.map((item) => ({
    productId: item.productId ?? undefined,
    sku: item.skuSnapshot,
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
    deliveryAddress: (order.deliveryAddress as Record<string, string> | null) ?? undefined,
    // Only set for SELF_PICKUP orders — null for DELIVERY, see createOrder.
    pickupBranchName: order.pickupBranchNameSnapshot ?? undefined,
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
