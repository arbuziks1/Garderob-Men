import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem, DeliveryMethod } from '../../types';
import { formatPrice } from '../../utils/format';
import { api, ApiError } from '../../services/api';
import { useBranches, useProducts } from '../../hooks/useStore';
import { useCart } from '../../contexts/CartContext';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import PublicOfferModal from './PublicOfferModal';

interface CheckoutFormProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  onBack: () => void;
}

const DELIVERY_OPTIONS: DeliveryMethod[] = ['Самовывоз из магазина', 'Доставка по Усть-Каменогорску'];

export default function CheckoutForm({
  items,
  subtotal,
  discount,
  total,
  promoCode,
  onBack,
}: CheckoutFormProps) {
  const navigate = useNavigate();
  const { clearCart, closeDrawer } = useCart();
  const [branches] = useBranches();
  const [products] = useProducts();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [delivery, setDelivery] = useState<DeliveryMethod>(DELIVERY_OPTIONS[0]);
  const [pickupBranchId, setPickupBranchId] = useState<string | null>(null);
  const [pickupBranchTouched, setPickupBranchTouched] = useState(false);
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [deliveryComment, setDeliveryComment] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Resolve each cart item's live branchStocks from the current catalog, so the branch
  // picker reflects up-to-date per-branch availability rather than a stale cart snapshot.
  const itemBranchStocks = useMemo(() => {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const color = product?.colors.find((c) => c.id === item.colorId);
      const row = color?.sizes.find((s) => s.id === item.sizeStockId);
      return { item, branchStocks: row?.branchStocks ?? null };
    });
  }, [items, products]);

  const branchHasAllItems = (branchId: string): boolean =>
    itemBranchStocks.every(({ item, branchStocks }) => {
      if (!branchStocks) return false;
      const stock = branchStocks.find((b) => b.branchId === branchId)?.stock ?? 0;
      return stock >= item.quantity;
    });

  const fullyAvailableBranchIds = useMemo(
    () => branches.filter((b) => branchHasAllItems(b.id)).map((b) => b.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branches, itemBranchStocks]
  );

  // Smart pre-selection: when exactly one branch can fulfil the whole cart, pick it for the
  // person automatically — but never fight a selection they already made by hand.
  useEffect(() => {
    if (pickupBranchTouched) return;
    if (branches.length <= 1) return;
    if (fullyAvailableBranchIds.length === 1) {
      setPickupBranchId(fullyAvailableBranchIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullyAvailableBranchIds, branches.length, pickupBranchTouched]);

  // Only disable the losing branch(es) when there's a single clear winner — if every branch
  // (or none) can fulfil the cart, leave all of them selectable.
  const singleWinnerId = fullyAvailableBranchIds.length === 1 ? fullyAvailableBranchIds[0] : null;

  const handleSelectBranch = (branchId: string) => {
    setPickupBranchId(branchId);
    setPickupBranchTouched(true);
  };

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
    if (delivery === 'Доставка по Усть-Каменогорску' && (!city.trim() || !street.trim() || !house.trim())) {
      setError('Укажите город, улицу и дом для доставки');
      return;
    }
    if (delivery === 'Самовывоз из магазина' && !pickupBranchId) {
      setError('Выберите магазин для самовывоза');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const order = await api.createOrder({
        customerName: customerName.trim(),
        phone: phone.replace(/[\s()-]/g, ''),
        delivery,
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
        ...(delivery === 'Самовывоз из магазина' ? { pickupBranchId: pickupBranchId! } : {}),
        ...(delivery === 'Доставка по Усть-Каменогорску'
          ? {
              deliveryAddress: {
                city: city.trim(),
                street: street.trim(),
                house: house.trim(),
                apartment: apartment.trim() || undefined,
                entrance: entrance.trim() || undefined,
                comment: deliveryComment.trim() || undefined,
              },
            }
          : {}),
      });
      clearCart();
      closeDrawer();
      navigate(delivery === 'Самовывоз из магазина' ? `/order/${order.id}` : `/payment/${order.id}`);
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

  const submitLabel = submitting
    ? 'Оформляем…'
    : delivery === 'Самовывоз из магазина'
      ? 'Оформить самовывоз'
      : 'Перейти к оплате';

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

        {delivery === 'Самовывоз из магазина' && (
          <div className="flex flex-col gap-2">
            <label className="mb-1 block text-xs font-medium text-graphite-600">Магазин для самовывоза</label>
            {branches.length === 0 && (
              <p className="text-xs text-graphite-500">Загружаем список магазинов…</p>
            )}
            {branches.map((branch) => {
              const fullyAvailable = fullyAvailableBranchIds.includes(branch.id);
              const disabled = singleWinnerId !== null && singleWinnerId !== branch.id;
              const selected = pickupBranchId === branch.id;
              return (
                <label
                  key={branch.id}
                  className={`flex flex-col gap-1 rounded-lg border px-3 py-3 text-sm transition-opacity ${
                    selected ? 'border-graphite-950 bg-stone-50' : 'border-stone-200'
                  } ${disabled ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
                >
                  <span className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="pickupBranch"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => handleSelectBranch(branch.id)}
                      className="mt-0.5 accent-graphite-950"
                    />
                    <span className="flex-1">
                      <span className="block font-medium text-graphite-950">{branch.name}</span>
                      <span className="block text-xs text-graphite-600">{branch.address}</span>
                      {branch.workingHours.map((wh, i) => (
                        <span key={i} className="block text-xs text-graphite-500">
                          {wh.days}: {wh.hours}
                        </span>
                      ))}
                      {branch.phone && (
                        <span className="block text-xs text-graphite-500">{branch.phone}</span>
                      )}
                      {branch.twoGisUrl && (
                        <a
                          href={branch.twoGisUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1.5 inline-block rounded-sm border border-graphite-950 px-3 py-1.5 text-xs font-medium text-graphite-950 hover:bg-white"
                        >
                          Открыть в 2ГИС
                        </a>
                      )}
                      {branch.mapLat !== null && branch.mapLng !== null && (
                        <iframe
                          src={`https://yandex.ru/map-widget/v1/?ll=${branch.mapLng},${branch.mapLat}&z=16&pt=${branch.mapLng},${branch.mapLat}`}
                          className="mt-2 h-[180px] w-full rounded-md border-0"
                          loading="lazy"
                          title={`Карта — ${branch.name}`}
                        />
                      )}
                      {!fullyAvailable && disabled && (
                        <span className="mt-1 block text-xs font-medium text-ember">
                          Этого размера нет в этом филиале
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {delivery === 'Доставка по Усть-Каменогорску' && (
          <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-600">Город</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-600">Улица</label>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-600">Дом</label>
              <input
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-graphite-600">Квартира/Офис</label>
                <input
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-graphite-600">Подъезд/Этаж</label>
                <input
                  value={entrance}
                  onChange={(e) => setEntrance(e.target.value)}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-600">Комментарий курьеру</label>
              <textarea
                value={deliveryComment}
                onChange={(e) => setDeliveryComment(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-graphite-950 focus:outline-none"
              />
            </div>
          </div>
        )}

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
            {submitLabel}
          </button>
        </div>

        <p className="text-center text-xs text-graphite-400">
          Нажимая «{submitLabel}», вы принимаете условия{' '}
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
