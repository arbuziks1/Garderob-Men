import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import type { CartItem, Order, OrderItem, OrderStatus } from '../../types';
import { ORDER_STATUS_LABEL } from '../../types';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../hooks/useStore';
import { combinedSizeLabel } from '../../data/sizeGrids';
import { api, ApiError } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';
import { EASE } from '../../utils/motion';

type AuthTab = 'login' | 'register';
type OrdersTab = 'active' | 'history';

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'SHIPPED'];
const STEP_ORDER: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function AccountDrawer() {
  const { isLoggedIn, error, login, register, logout, isDrawerOpen, closeDrawer } = useCustomerAuth();
  const { addItem, openDrawer: openCartDrawer } = useCart();
  const [products] = useProducts();

  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [phone, setPhone] = useState('+7');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [ordersTab, setOrdersTab] = useState<OrdersTab>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bonusBalance, setBonusBalance] = useState<number | undefined>(undefined);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const fetchOrders = () => {
    setLoadingOrders(true);
    setOrdersError('');
    api
      .getMyOrders()
      .then(({ orders: o, bonusBalance: b }) => {
        setOrders(o);
        setBonusBalance(b);
      })
      .catch((err) => {
        // A 401 here means the stored token is gone/expired (api.ts already cleared it) —
        // bounce back to the login form instead of leaving a permanent error on a view that
        // still claims to be logged in.
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setOrdersError(err instanceof Error ? err.message : 'Не удалось загрузить заказы.');
      })
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (isDrawerOpen && isLoggedIn) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, isLoggedIn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (authTab === 'register' && password !== confirmPassword) return;
    setSubmitting(true);
    const ok = authTab === 'login' ? await login(phone, password) : await register(phone, password);
    setSubmitting(false);
    if (ok) {
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleClose = () => {
    closeDrawer();
  };

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => o.status === 'DELIVERED');

  /** Resolves a historical OrderItem snapshot to a live, addable cart line — or null when
   *  the product was deleted, or no color/size on the live product matches any more. */
  const resolveLiveItem = (item: OrderItem): CartItem | null => {
    if (!item.productId) return null;
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    const color = product.colors.find((c) => c.name === item.colorName);
    if (!color) return null;
    const sizeRow = color.sizes.find(
      (s) =>
        s.stock > 0 &&
        (s.sizeRu === item.size || s.sizeEu === item.size || s.sizeInt === item.size || combinedSizeLabel(s) === item.size)
    );
    if (!sizeRow) return null;
    return {
      productId: product.id,
      title: product.title,
      image: color.images[0] ?? '',
      colorId: color.id,
      colorName: color.name,
      sizeStockId: sizeRow.id,
      sizeLabel: item.size,
      price: product.price, // live price, not the historical snapshot price
      quantity: Math.min(item.quantity, sizeRow.stock),
      maxStock: sizeRow.stock,
    };
  };

  const reorder = (order: Order) => {
    let addedAny = false;
    for (const item of order.items) {
      const live = resolveLiveItem(item);
      if (!live) continue;
      addItem(live);
      addedAny = true;
    }
    if (addedAny) {
      closeDrawer();
      openCartDrawer();
    }
  };

  const mismatch = authTab === 'register' && confirmPassword.length > 0 && password !== confirmPassword;

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
              <h2 className="font-display text-lg font-semibold text-graphite-950">Мои заказы</h2>
              <button onClick={handleClose} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 rounded-full bg-stone-100 p-1">
                    <button
                      onClick={() => setAuthTab('login')}
                      className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                        authTab === 'login' ? 'bg-graphite-950 text-white' : 'text-graphite-600'
                      }`}
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => setAuthTab('register')}
                      className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                        authTab === 'register' ? 'bg-graphite-950 text-white' : 'text-graphite-600'
                      }`}
                    >
                      Зарегистрироваться
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                      <label className="mb-1 block text-xs font-medium text-graphite-600">Пароль</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                      />
                    </div>
                    {authTab === 'register' && (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-graphite-600">Повторите пароль</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                        />
                      </div>
                    )}
                    {mismatch && <p className="text-sm text-ember">Пароли не совпадают</p>}
                    {error && <p className="text-sm text-ember">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting || mismatch}
                      className="rounded-sm bg-graphite-950 py-3 font-display text-sm uppercase tracking-[0.15em] text-white disabled:opacity-60"
                    >
                      {submitting ? 'Подождите…' : authTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-graphite-500">Вы вошли</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchOrders}
                        className="rounded-md p-1.5 text-graphite-600 hover:bg-stone-100"
                        aria-label="Обновить"
                        title="Обновить"
                      >
                        <RefreshCw size={15} />
                      </button>
                      <button onClick={logout} className="text-sm font-medium text-ember">
                        Выйти
                      </button>
                    </div>
                  </div>

                  {bonusBalance !== undefined && (
                    <div className="rounded-lg bg-stone-100 px-4 py-3 text-sm font-semibold text-graphite-950">
                      Бонусный баланс: {formatPrice(bonusBalance)}
                    </div>
                  )}

                  <div className="flex gap-2 rounded-full bg-stone-100 p-1">
                    <button
                      onClick={() => setOrdersTab('active')}
                      className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                        ordersTab === 'active' ? 'bg-graphite-950 text-white' : 'text-graphite-600'
                      }`}
                    >
                      Активные
                    </button>
                    <button
                      onClick={() => setOrdersTab('history')}
                      className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                        ordersTab === 'history' ? 'bg-graphite-950 text-white' : 'text-graphite-600'
                      }`}
                    >
                      История
                    </button>
                  </div>

                  {loadingOrders && <p className="text-sm text-graphite-500">Загрузка…</p>}
                  {ordersError && <p className="text-sm text-ember">{ordersError}</p>}

                  {!loadingOrders &&
                    ordersTab === 'active' &&
                    (activeOrders.length === 0 ? (
                      <p className="text-sm text-graphite-500">Активных заказов нет</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {activeOrders.map((order) => (
                          <div key={order.id} className="rounded-xl border border-stone-200 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs uppercase tracking-wide text-graphite-500">Заказ №{order.id}</p>
                              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-graphite-950">
                                {ORDER_STATUS_LABEL[order.status]}
                              </span>
                            </div>
                            <OrderStepper status={order.status} />
                            <p className="mt-2 text-sm text-graphite-500">{formatDate(order.createdAt)}</p>
                            <p className="mt-1 text-sm font-semibold text-graphite-950">{formatPrice(order.total)}</p>
                          </div>
                        ))}
                      </div>
                    ))}

                  {!loadingOrders &&
                    ordersTab === 'history' &&
                    (historyOrders.length === 0 ? (
                      <p className="text-sm text-graphite-500">Выполненных заказов пока нет</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {historyOrders.map((order) => {
                          const canReorder = order.items.some((item) => resolveLiveItem(item) !== null);
                          return (
                            <div key={order.id} className="rounded-xl border border-stone-200 p-4">
                              <p className="mb-2 text-xs uppercase tracking-wide text-graphite-500">
                                Заказ №{order.id} · {formatDate(order.createdAt)}
                              </p>
                              <div className="flex flex-col divide-y divide-stone-100">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-1.5 text-sm">
                                    <span className="text-graphite-700">
                                      {item.sku} · {item.title} · {item.colorName} · {item.size}
                                    </span>
                                    <span className="font-medium text-graphite-950">{formatPrice(item.price)}</span>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => reorder(order)}
                                disabled={!canReorder}
                                title={!canReorder ? 'Товары из этого заказа больше недоступны' : undefined}
                                className="mt-3 w-full rounded-sm border border-graphite-950 py-2 text-sm font-medium text-graphite-950 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
                              >
                                Заказать снова
                              </button>
                              {!canReorder && (
                                <p className="mt-1.5 text-xs text-stone-400">
                                  Товары из этого заказа больше недоступны (товар удалён или размер закончился навсегда)
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function OrderStepper({ status }: { status: OrderStatus }) {
  const idx = STEP_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {STEP_ORDER.map((step, i) => (
        <div key={step} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-graphite-950' : 'bg-stone-200'}`} />
      ))}
    </div>
  );
}
