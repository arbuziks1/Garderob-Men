import { AlertTriangle, Package, ShoppingCart, Wallet } from 'lucide-react';
import { useOrders, useProducts } from '../../hooks/useStore';
import { SIZES } from '../../types';
import { formatDate, formatPrice } from '../../utils/format';

const LOW_STOCK_THRESHOLD = 2;

export default function Dashboard() {
  const [products] = useProducts();
  const [orders] = useOrders();

  const revenue = orders
    .filter((o) => o.status !== 'Отменен')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrders = orders.filter((o) => o.status === 'Новый' || o.status === 'Подтвержден').length;

  const lowStockAlerts = products.flatMap((p) =>
    p.colors.flatMap((c) =>
      SIZES.filter((s) => c.stock[s] > 0 && c.stock[s] <= LOW_STOCK_THRESHOLD).map((s) => ({
        productTitle: p.title,
        colorName: c.name,
        size: s,
        qty: c.stock[s],
      }))
    )
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-graphite-950">Дашборд</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Выручка" value={formatPrice(revenue)} accent="text-ember" />
        <StatCard icon={ShoppingCart} label="Активные заказы" value={String(activeOrders)} accent="text-graphite-950" />
        <StatCard icon={Package} label="Товаров в каталоге" value={String(products.length)} accent="text-graphite-950" />
        <StatCard
          icon={AlertTriangle}
          label="Остатки на исходе"
          value={String(lowStockAlerts.length)}
          accent="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
            Последние заказы
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-graphite-500">Заказов пока нет</p>
          ) : (
            <div className="flex flex-col divide-y divide-stone-100">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-graphite-950">{o.customerName}</p>
                    <p className="text-xs text-graphite-500">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-graphite-950">{formatPrice(o.total)}</p>
                    <p className="text-xs text-graphite-500">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
            Уведомления об остатках
          </h2>
          {lowStockAlerts.length === 0 ? (
            <p className="text-sm text-graphite-500">Критичных остатков нет</p>
          ) : (
            <div className="flex flex-col divide-y divide-stone-100">
              {lowStockAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-graphite-950">{alert.productTitle}</p>
                    <p className="text-xs text-graphite-500">
                      {alert.colorName} · Размер {alert.size}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    Осталось {alert.qty} шт.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-graphite-500">{label}</span>
        <Icon size={16} className={accent} />
      </div>
      <p className="font-display text-2xl font-semibold text-graphite-950">{value}</p>
    </div>
  );
}
