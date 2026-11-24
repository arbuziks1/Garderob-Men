// VISUAL MOCKUP ONLY — this page never stores card data anywhere (no localStorage, no
// backend call carrying card fields); the only network call it makes is api.mockPay(orderId),
// which takes no card data at all. A real Kaspi/TipTop integration replaces this entire page
// with a redirect to the processor's own hosted checkout once PAYMENT_MODE=live wires a real
// redirect at the point CheckoutForm currently navigates here.
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { OrderPublic } from '../types';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';

function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Reasonably correct common-case BIN check for the two card networks this market uses —
 *  not the full exhaustive Mastercard BIN range table. */
function detectBrand(digits: string): 'Visa' | 'Mastercard' | null {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) return 'Mastercard';
  return null;
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderPublic | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    api
      .getPublicOrder(orderId)
      .then(setOrder)
      .catch(() => setNotFound(true));
  }, [orderId]);

  const digits = cardNumber.replace(/\D/g, '');
  const brand = detectBrand(digits);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (digits.length < 13 || digits.length > 19 || !luhnValid(digits)) {
      setError('Проверьте номер карты');
      return;
    }

    const [mmRaw, yyRaw] = expiry.split('/');
    const month = Number(mmRaw);
    const year = Number(yyRaw);
    if (!mmRaw || !yyRaw || mmRaw.length !== 2 || yyRaw.length !== 2 || Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
      setError('Проверьте срок действия карты (MM/YY)');
      return;
    }
    const now = new Date();
    const currentYear2 = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear2 || (year === currentYear2 && month < currentMonth)) {
      setError('Срок действия карты истёк');
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      setError('Проверьте CVV — 3 цифры');
      return;
    }

    setError('');
    setPaying(true);
    try {
      await api.mockPay(orderId);
      navigate(`/order/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить оплату. Попробуйте ещё раз.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="border-b border-stone-200 bg-graphite-950 px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-lg tracking-[0.08em] text-paper">
          <span className="font-semibold">GARDEROB</span> <span className="font-normal text-stone-300">MEN</span>
        </Link>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-6 font-display text-2xl font-semibold text-graphite-950">Оплата заказа</h1>

        {notFound && <p className="text-sm text-graphite-600">Заказ не найден.</p>}
        {!notFound && !order && <p className="text-sm text-graphite-500">Загрузка…</p>}

        {order && order.status !== 'PENDING_PAYMENT' && (
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-graphite-700">
            <p className="mb-2">Этот заказ уже не ожидает оплаты.</p>
            <Link to={`/order/${order.id}`} className="font-medium text-graphite-950 underline underline-offset-2">
              Перейти к статусу заказа →
            </Link>
          </div>
        )}

        {order && order.status === 'PENDING_PAYMENT' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="rounded-2xl border border-stone-200 bg-graphite-950 p-5 text-paper shadow-sm">
              <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-wide text-stone-400">
                <span>Банковская карта</span>
                {brand && <span className="font-semibold text-paper">{brand}</span>}
              </div>
              <p className="font-display text-lg tracking-[0.1em]">
                {cardNumber || '•••• •••• •••• ••••'}
              </p>
              <div className="mt-6 flex items-center justify-between text-xs text-stone-300">
                <span>{cardholder.trim() || 'ИМЯ ФАМИЛИЯ'}</span>
                <span>{expiry || 'MM/YY'}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-600">Номер карты</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-graphite-600">Срок действия</label>
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-graphite-600">CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="000"
                  maxLength={3}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-600">
                Имя держателя карты (необязательно)
              </label>
              <input
                value={cardholder}
                onChange={(e) => setCardholder(e.target.value)}
                autoComplete="cc-name"
                placeholder="IVAN IVANOV"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-ember">{error}</p>}

            <button
              type="submit"
              disabled={paying}
              className="rounded-sm bg-ember py-3 font-display text-sm uppercase tracking-[0.15em] text-paper transition-colors hover:bg-ember-light disabled:opacity-60"
            >
              {paying ? 'Оплачиваем…' : `Оплатить ${formatPrice(order.total)}`}
            </button>
          </form>
        )}

        <Link to="/" className="mt-10 inline-block text-sm font-medium text-graphite-600 underline underline-offset-2">
          ← Вернуться в магазин
        </Link>
      </main>
    </div>
  );
}
