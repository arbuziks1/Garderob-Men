import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { StoreSettings, WorkingHours } from '../../types';
import { useSettings, useAdminPromoCodes } from '../../hooks/useStore';
import { api } from '../../services/api';
import SafeImage from '../shared/SafeImage';
import ImageField from './ImageField';

export default function StoreSettingsManager() {
  const [settings, refreshSettings] = useSettings();
  const [promoCodes, refreshPromoCodes] = useAdminPromoCodes();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [savedTick, setSavedTick] = useState(0);
  const [saveError, setSaveError] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const save = async (next: StoreSettings) => {
    setForm(next);
    try {
      await api.updateSettings(next);
      setSaveError('');
      setSavedTick((t) => t + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить настройки.');
    }
  };

  const updateHours = (idx: number, patch: Partial<WorkingHours>) => {
    const workingHours = form.workingHours.map((wh, i) => (i === idx ? { ...wh, ...patch } : wh));
    save({ ...form, workingHours });
  };

  const addPromo = async () => {
    try {
      await api.createPromoCode({ code: 'NEWCODE', discountPercent: 10, active: true });
      refreshPromoCodes();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось создать промокод.');
    }
  };

  const updatePromo = async (id: string, patch: Partial<{ code: string; discountPercent: number; active: boolean }>) => {
    try {
      await api.updatePromoCode(id, patch);
      refreshPromoCodes();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось обновить промокод.');
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await api.deletePromoCode(id);
      refreshPromoCodes();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось удалить промокод.');
    }
  };

  const handleReset = async () => {
    if (!confirm('Сбросить все данные к демо-состоянию? Это удалит ваши изменения товаров и настроек.')) return;
    setResetting(true);
    try {
      await api.resetDemoData();
      refreshSettings();
      refreshPromoCodes();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сбросить демо-данные.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-950">Контент и настройки магазина</h1>
        {saveError ? (
          <span className="text-xs font-medium text-ember">{saveError}</span>
        ) : (
          savedTick > 0 && <span className="text-xs font-medium text-green-700">Сохранено ✓</span>
        )}
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
          Главный баннер
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px]">
          <div className="flex flex-col gap-3">
            <Field label="Заголовок">
              <input
                value={form.heroTitle}
                onChange={(e) => save({ ...form, heroTitle: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Подзаголовок">
              <textarea
                value={form.heroSubtitle}
                onChange={(e) => save({ ...form, heroSubtitle: e.target.value })}
                rows={2}
                className="input resize-none"
              />
            </Field>
            <Field label="Текст кнопки">
              <input
                value={form.heroCtaLabel}
                onChange={(e) => save({ ...form, heroCtaLabel: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Фоновое изображение">
              <ImageField value={form.heroImage} onChange={(value) => save({ ...form, heroImage: value })} />
            </Field>
          </div>
          <div className="h-full min-h-[140px] overflow-hidden rounded-lg bg-stone-100">
            <SafeImage src={form.heroImage} alt="Превью баннера" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
          Контакты и адрес
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Адрес">
            <input value={form.address} onChange={(e) => save({ ...form, address: e.target.value })} className="input" />
          </Field>
          <Field label="Телефон (отображается на сайте)">
            <input
              value={form.phoneDisplay}
              onChange={(e) => save({ ...form, phoneDisplay: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="WhatsApp номер (для заказов, формат +7XXXXXXXXXX)">
            <input
              value={form.whatsappPhone}
              onChange={(e) => save({ ...form, whatsappPhone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Ссылка Kaspi Pay (из приложения Kaspi.kz → Kaspi Pay → Поделиться ссылкой)">
            <input
              value={form.kaspiPayLink}
              onChange={(e) => save({ ...form, kaspiPayLink: e.target.value })}
              placeholder="https://pay.kaspi.kz/pay/..."
              className="input"
            />
          </Field>
          <Field label="Ссылка на Instagram">
            <input
              value={form.instagramUrl}
              onChange={(e) => save({ ...form, instagramUrl: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Ссылка на 2ГИС">
            <input value={form.twoGisUrl} onChange={(e) => save({ ...form, twoGisUrl: e.target.value })} className="input" />
          </Field>
        </div>

        {form.kaspiPayLink && (
          <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-graphite-500">
            Ссылка одна и та же для всех заказов — сумму клиент вводит сам при оплате. Сверяйте поступление
            оплаты вручную перед тем как подтвердить заказ.
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-stone-200 pt-5 sm:grid-cols-2">
          <Field label="Юридическое название (ИП/ТОО) — для оферты и модерации Kaspi Pay">
            <input
              value={form.legalName}
              onChange={(e) => save({ ...form, legalName: e.target.value })}
              placeholder="ИП Иванова Т.А."
              className="input"
            />
          </Field>
          <Field label="БИН / ИИН">
            <input
              value={form.businessId}
              onChange={(e) => save({ ...form, businessId: e.target.value })}
              placeholder="123456789012"
              className="input"
            />
          </Field>
        </div>
        {(!form.legalName || !form.businessId) && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Пока не заполнено — в публичной оферте вместо этих данных будет placeholder. Банк и закон требуют
            указывать реальное юридическое название и БИН/ИИН до подачи заявки на приём платежей.
          </p>
        )}

        <p className="mb-2 mt-4 text-xs font-medium text-graphite-500">Часы работы</p>
        <div className="flex flex-col gap-2">
          {form.workingHours.map((wh, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={wh.days}
                onChange={(e) => updateHours(idx, { days: e.target.value })}
                placeholder="Дни"
                className="input"
              />
              <input
                value={wh.hours}
                onChange={(e) => updateHours(idx, { hours: e.target.value })}
                placeholder="Часы"
                className="input"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
          Карта и бонусная программа
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Широта">
            <input
              type="number"
              value={form.mapLat ?? ''}
              onChange={(e) => save({ ...form, mapLat: e.target.value === '' ? null : Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Долгота">
            <input
              type="number"
              value={form.mapLng ?? ''}
              onChange={(e) => save({ ...form, mapLng: e.target.value === '' ? null : Number(e.target.value) })}
              className="input"
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-graphite-500">
          Найдите магазин на Яндекс.Картах или 2ГИС, кликните правой кнопкой по точке — координаты скопируются.
        </p>

        <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-5">
          <label className="flex items-center gap-2 text-sm text-graphite-700">
            <input
              type="checkbox"
              checked={form.bonusEnabled}
              onChange={(e) => save({ ...form, bonusEnabled: e.target.checked })}
              className="h-4 w-4 accent-graphite-950"
            />
            Бонусная программа включена
          </label>
          {form.bonusEnabled && (
            <Field label="Процент кэшбэка">
              <input
                type="number"
                value={form.bonusPercent}
                onChange={(e) => save({ ...form, bonusPercent: Number(e.target.value) })}
                className="input w-32"
              />
            </Field>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
            Промокоды
          </h2>
          <button onClick={addPromo} className="flex items-center gap-1 text-sm font-medium text-ember">
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="flex items-center gap-2">
              <input
                defaultValue={promo.code}
                onBlur={(e) => updatePromo(promo.id, { code: e.target.value.toUpperCase() })}
                className="input flex-1"
              />
              <input
                type="number"
                defaultValue={promo.discountPercent}
                onBlur={(e) => updatePromo(promo.id, { discountPercent: Number(e.target.value) })}
                className="input w-20 text-center"
              />
              <span className="text-sm text-graphite-500">%</span>
              <label className="flex items-center gap-1.5 text-xs text-graphite-600">
                <input
                  type="checkbox"
                  checked={promo.active}
                  onChange={(e) => updatePromo(promo.id, { active: e.target.checked })}
                  className="accent-graphite-950"
                />
                активен
              </label>
              <button
                onClick={() => deletePromo(promo.id)}
                className="rounded-md p-1.5 text-ember hover:bg-stone-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {promoCodes.length === 0 && <p className="text-sm text-graphite-500">Промокодов пока нет</p>}
        </div>
      </section>

      <section className="rounded-xl border border-ember/30 bg-white p-5">
        <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
          Демо-данные
        </h2>
        <p className="mb-3 text-sm text-graphite-500">
          Восстановить исходный каталог и настройки — полезно перед презентацией.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 rounded-full border border-ember px-4 py-2 text-sm font-medium text-ember hover:bg-ember hover:text-white disabled:opacity-50"
        >
          <RotateCcw size={15} />
          {resetting ? 'Сбрасываем…' : 'Сбросить демо-данные'}
        </button>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-graphite-600">{label}</span>
      {children}
    </label>
  );
}
