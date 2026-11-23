import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from '../../types';
import { useAdminOrders } from '../../hooks/useStore';
import { api } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-stone-200 text-stone-600',
};

export default function OrdersManager() {
  const [orders, refresh] = useAdminOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Все'>('Все');
  const [error, setError] = useState('');

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered = statusFilter === 'Все' ? sorted : sorted.filter((o) => o.status === statusFilter);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(order.id, status);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось изменить статус заказа.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-950">Заказы</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'Все')}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
        >
          <option value="Все">Все статусы</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-graphite-500">
          Заказов нет
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left sm:px-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-semibold text-graphite-950">№{order.id}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-graphite-600">{order.customerName}</span>
                    <span className="font-semibold text-graphite-950">{formatPrice(order.total)}</span>
                    <span className="text-xs text-graphite-400">{formatDate(order.createdAt)}</span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-stone-100 px-4 py-4 sm:px-5">
                    <div className="mb-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Клиент</p>
                        <p className="text-graphite-800">{order.customerName}</p>
                        <p className="text-graphite-800">{order.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Доставка и оплата</p>
                        <p className="text-graphite-800">{order.delivery}</p>
                        <p className="text-graphite-800">{order.payment}</p>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col divide-y divide-stone-100 rounded-lg border border-stone-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="text-graphite-800">
                            {item.title} · {item.colorName} · {item.size} × {item.quantity}
                          </span>
                          <span className="font-medium text-graphite-950">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {order.comment && (
                      <p className="mb-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-graphite-600">
                        Комментарий: {order.comment}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm">
                        <span className="text-graphite-500">Итого: </span>
                        <span className="font-semibold text-graphite-950">{formatPrice(order.total)}</span>
                        {order.discount > 0 && (
                          <span className="ml-2 text-xs text-green-700">(скидка {formatPrice(order.discount)})</span>
                        )}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                        className="rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:border-graphite-950 focus:outline-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
