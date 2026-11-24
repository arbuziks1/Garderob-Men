import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import type { OrderPublic } from '../types';
import { ORDER_STATUS_LABEL } from '../types';
import { api } from '../services/api';
import { useSettings } from '../hooks/useStore';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { formatDate, formatPrice } from '../utils/format';

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [settings] = useSettings();
  const [order, setOrder] = useState<OrderPublic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);

  const refetch = () => {
    if (!id) return;
    api
      .getPublicOrder(id)
      .then(setOrder)
      .catch(() => setNotFound(true));
  };

  useEffect(refetch, [id]);

  const handleMockPay = async () => {
    if (!id) return;
    setPaying(true);
    setPayError('');
    try {
      await api.mockPay(id);
      refetch();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Не удалось выполнить тестовую оплату.');
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

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-6 font-display text-2xl font-semibold text-graphite-950">Статус заказа</h1>

        {notFound && <p className="text-sm text-graphite-600">Заказ №{id} не найден.</p>}

        {!notFound && !order && <p className="text-sm text-graphite-500">Загрузка…</p>}

        {order && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-graphite-500">Заказ №{order.id}</p>
                <p className="text-sm text-graphite-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-graphite-950">
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-graphite-800">
                    {item.sku} · {item.title} · {item.colorName} · {item.size} × {item.quantity}
                  </span>
                  <span className="font-medium text-graphite-950">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-graphite-950">
                <span>Итого</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.status === 'PENDING_PAYMENT' && (
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
                <p className="mb-2 text-xs text-amber-700">
                  Тестовый режим оплаты (до подключения реального Kaspi Pay).
                </p>
                <button
                  onClick={handleMockPay}
                  disabled={paying}
                  className="rounded-sm bg-graphite-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {paying ? 'Оплачиваем…' : 'Оплатить (тест)'}
                </button>
                {payError && <p className="mt-2 text-xs text-ember">{payError}</p>}
              </div>
            )}

            <a
              href={buildWhatsAppLink(settings.whatsappPhone, `Здравствуйте! Вопрос по заказу №${order.id}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-graphite-950 px-4 py-3 text-sm font-medium text-graphite-950 hover:bg-stone-50"
            >
              <MessageCircle size={16} />
              Написать менеджеру в WhatsApp по этому заказу
            </a>
          </div>
        )}

        <Link to="/" className="mt-10 inline-block text-sm font-medium text-graphite-600 underline underline-offset-2">
          ← Вернуться в магазин
        </Link>
      </main>
    </div>
  );
}
