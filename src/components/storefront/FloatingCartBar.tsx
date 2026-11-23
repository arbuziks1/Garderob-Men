import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/format';
import { EASE } from '../../utils/motion';

/** Fixed bottom-right bar that appears as soon as the cart has at least one item — a loud,
 *  unmissable reminder for shoppers who scrolled past the header's small cart icon. Fully
 *  hidden (not just faded) while the cart is empty. */
export default function FloatingCartBar() {
  const { itemCount, subtotal, openDrawer } = useCart();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={openDrawer}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-graphite-950 py-3 pl-4 pr-5 text-paper shadow-xl shadow-black/20 transition-colors hover:bg-graphite-800"
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember">
            <ShoppingBag size={16} />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-xs text-stone-300">Корзина: {itemCount} шт.</span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide">
              {formatPrice(subtotal)} — Оформить заказ
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
