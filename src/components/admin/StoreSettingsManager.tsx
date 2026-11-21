import { useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { PromoCode, StoreSettings, WorkingHours } from '../../types';
import { useSettings, usePromoCodes } from '../../hooks/useStore';
import { storage } from '../../services/storage';
import SafeImage from '../shared/SafeImage';

export default function StoreSettingsManager() {
  const [settings] = useSettings();
  const [promoCodes] = usePromoCodes();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [savedTick, setSavedTick] = useState(0);

  const save = (next: StoreSettings) => {
    setForm(next);
    storage.saveSettings(next);
    setSavedTick((t) => t + 1);
  };

  const updateHours = (idx: number, patch: Partial<WorkingHours>) => {
    const workingHours = form.workingHours.map((wh, i) => (i === idx ? { ...wh, ...patch } : wh));
    save({ ...form, workingHours });
  };

  const addPromo = () => {
    const code: PromoCode = {
      id: `promo${Date.now()}`,
      code: 'NEWCODE',
      discountPercent: 10,
      active: true,
    };
    storage.savePromoCodes([...promoCodes, code]);
  };

  const updatePromo = (id: string, patch: Partial<PromoCode>) => {
    storage.savePromoCodes(promoCodes.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deletePromo = (id: string) => {
    storage.savePromoCodes(promoCodes.filter((p) => p.id !== id));
  };

  const handleReset = () => {
    if (confirm('Сбросить все данные к демо-состоянию? Это удалит ваши изменения товаров, заказов и настроек.')) {
      storage.resetDemoData();
      setForm(storage.getSettings());
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-950">Контент и настройки магазина</h1>
        {savedTick > 0 && <span className="text-xs font-medium text-green-700">Сохранено ✓</span>}
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
            <Field label="Ссылка на фоновое изображение">
              <input
                value={form.heroImage}
                onChange={(e) => save({ ...form, heroImage: e.target.value })}
                className="input"
              />
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
                value={promo.code}
                onChange={(e) => updatePromo(promo.id, { code: e.target.value.toUpperCase() })}
                className="input flex-1"
              />
              <input
                type="number"
                value={promo.discountPercent}
                onChange={(e) => updatePromo(promo.id, { discountPercent: Number(e.target.value) })}
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
          Восстановить исходный каталог, заказы и настройки — полезно перед презентацией.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-full border border-ember px-4 py-2 text-sm font-medium text-ember hover:bg-ember hover:text-white"
        >
          <RotateCcw size={15} />
          Сбросить демо-данные
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
