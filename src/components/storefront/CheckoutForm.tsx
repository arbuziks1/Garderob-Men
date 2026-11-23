import { useState, type FormEvent } from 'react';
import type { CartItem, DeliveryMethod, Order, PaymentMethod } from '../../types';
import { formatPrice } from '../../utils/format';
import { api, ApiError } from '../../services/api';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import PublicOfferModal from './PublicOfferModal';

interface CheckoutFormProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  onBack: () => void;
  onComplete: (order: Order) => void;
}

const DELIVERY_OPTIONS: DeliveryMethod[] = ['Самовывоз из магазина', 'Доставка по Усть-Каменогорску'];
const PAYMENT_OPTIONS: PaymentMethod[] = ['Kaspi QR', 'Перевод', 'Наличными при получении'];

export default function CheckoutForm({
  items,
  subtotal,
  discount,
  total,
  promoCode,
  onBack,
  onComplete,
}: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [delivery, setDelivery] = useState<DeliveryMethod>(DELIVERY_OPTIONS[0]);
  const [payment, setPayment] = useState<PaymentMethod>(PAYMENT_OPTIONS[0]);
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (customerName.trim().length < 2) {
      setError('Укажите имя');
      return;
    }
    if (!/^\+7\d{10}$/.test(phone.replace(/[\s()-]/g, ''))) {
      setError('Укажите телефон в формате +7XXXXXXXXXX');
      return;
    }
    if (!consent) {
      setError('Подтвердите согласие на обработку персональных данных');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const order = await api.createOrder({
        customerName: customerName.trim(),
        phone: phone.replace(/[\s()-]/g, ''),
        delivery,
        payment,
        items: items.map((i) => ({
          productId: i.productId,
          colorId: i.colorId,
          sizeStockId: i.sizeStockId,
          sizeLabel: i.sizeLabel,
          quantity: i.quantity,
        })),
        subtotal,
        discount,
        promoCode,
        total,
        comment: comment.trim() || undefined,
        consentGiven: consent,
      });
      onComplete(order);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Один из товаров уже разобрали — обновите корзину и попробуйте снова.');
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось оформить заказ. Попробуйте ещё раз.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-600">Имя</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Как к вам обращаться"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-600">Телефон</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+77011234567"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-600">Способ получения</label>
          <div className="flex flex-col gap-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  delivery === opt ? 'border-graphite-950 bg-stone-50' : 'border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === opt}
                  onChange={() => setDelivery(opt)}
                  className="accent-graphite-950"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-600">Оплата</label>
          <div className="flex flex-col gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  payment === opt ? 'border-graphite-950 bg-stone-50' : 'border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment === opt}
                  onChange={() => setPayment(opt)}
                  className="accent-graphite-950"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-600">Комментарий (необязательно)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-graphite-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setError('');
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-graphite-950"
          />
          <span>
            Согласен(на) на обработку персональных данных согласно{' '}
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              className="underline underline-offset-2 hover:text-graphite-950"
            >
              Политике конфиденциальности
            </button>
          </span>
        </label>

        {error && <p className="text-sm text-ember">{error}</p>}

        <div className="flex justify-between text-base font-semibold text-graphite-950">
          <span>Итого к оплате</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="rounded-sm border border-stone-300 px-5 py-3 text-sm font-medium text-graphite-800 disabled:opacity-50"
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-sm bg-ember py-3 font-display text-sm uppercase tracking-[0.15em] text-paper transition-colors hover:bg-ember-light disabled:opacity-60"
          >
            {submitting ? 'Оформляем…' : 'Подтвердить заказ'}
          </button>
        </div>

        <p className="text-center text-xs text-graphite-400">
          Нажимая «Подтвердить заказ», вы принимаете условия{' '}
          <button
            type="button"
            onClick={() => setOfferOpen(true)}
            className="underline underline-offset-2 hover:text-graphite-700"
          >
            Публичной оферты
          </button>
        </p>
      </div>

      <PrivacyPolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
      <PublicOfferModal open={offerOpen} onClose={() => setOfferOpen(false)} />
    </form>
  );
}
