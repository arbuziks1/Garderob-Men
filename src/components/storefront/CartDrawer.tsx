import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { usePromoCodes } from '../../hooks/useStore';
import { formatPrice } from '../../utils/format';
import { EASE } from '../../utils/motion';
import SafeImage from '../shared/SafeImage';
import CheckoutForm from './CheckoutForm';
import OrderSuccess from './OrderSuccess';
import type { Order } from '../../types';

type Step = 'cart' | 'checkout' | 'success';

export default function CartDrawer() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, isDrawerOpen, closeDrawer, clearCart } = useCart();
  const [promoCodes] = usePromoCodes();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [step, setStep] = useState<Step>('cart');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const discount = appliedPromo ? Math.round((subtotal * appliedPromo.percent) / 100) : 0;
  const total = subtotal - discount;

  const applyPromo = () => {
    const match = promoCodes.find(
      (p) => p.active && p.code.toLowerCase() === promoInput.trim().toLowerCase()
    );
    if (match) {
      setAppliedPromo({ code: match.code, percent: match.discountPercent });
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Промокод не найден или неактивен');
    }
  };

  const handleClose = () => {
    closeDrawer();
    setStep('cart');
  };

  const handleOrderComplete = (order: Order) => {
    setCompletedOrder(order);
    setStep('success');
    clearCart();
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative flex h-full w-full max-w-md flex-col bg-white"
          >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-graphite-950">
            {step === 'cart' && `Корзина (${itemCount})`}
            {step === 'checkout' && 'Оформление заказа'}
            {step === 'success' && 'Заказ оформлен'}
          </h2>
          <button onClick={handleClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        {step === 'success' && completedOrder && (
          <OrderSuccess order={completedOrder} onClose={handleClose} />
        )}

        {step === 'checkout' && (
          <CheckoutForm
            items={items}
            subtotal={subtotal}
            discount={discount}
            total={total}
            promoCode={appliedPromo?.code}
            onBack={() => setStep('cart')}
            onComplete={handleOrderComplete}
          />
        )}

        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-graphite-500">
                  <ShoppingBag size={36} className="mb-3 text-stone-300" />
                  <p>Корзина пуста</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.colorId}-${item.size}`} className="flex gap-3">
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        <SafeImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-graphite-950">{item.title}</p>
                        <p className="text-xs text-graphite-500">
                          {item.colorName} · Размер {item.size}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.colorId, item.size, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.colorId, item.size, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 disabled:opacity-30"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-graphite-950">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.colorId, item.size)}
                        className="self-start text-stone-400 hover:text-ember"
                        aria-label="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-stone-200 p-5">
                <div className="mb-3 flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Промокод"
                    className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                  />
                  <button
                    onClick={applyPromo}
                    className="rounded-md border border-graphite-950 px-3 py-2 text-sm font-medium text-graphite-950"
                  >
                    Применить
                  </button>
                </div>
                {promoError && <p className="mb-2 text-xs text-ember">{promoError}</p>}
                {appliedPromo && (
                  <p className="mb-2 text-xs text-green-700">
                    Промокод {appliedPromo.code} применён: -{appliedPromo.percent}%
                  </p>
                )}

                <div className="mb-4 flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-graphite-600">
                    <span>Сумма</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Скидка</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold text-graphite-950">
                    <span>Итого</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full rounded-sm bg-graphite-950 py-3 font-display text-sm uppercase tracking-[0.15em] text-white transition-colors hover:bg-graphite-800"
                >
                  Оформить заказ
                </button>
              </div>
            )}
          </>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
