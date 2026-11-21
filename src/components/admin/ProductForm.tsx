import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { ColorVariant, Fit, Product, Size, StockBySize } from '../../types';
import { CATEGORIES, FITS, SIZES } from '../../types';
import { storage } from '../../services/storage';
import SafeImage from '../shared/SafeImage';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

function emptyStock(): StockBySize {
  return { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
}

function emptyColor(): ColorVariant {
  return {
    id: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name: 'Новый цвет',
    hex: '#27272a',
    images: [''],
    stock: emptyStock(),
  };
}

function emptyProduct(): Product {
  return {
    id: `p${Date.now()}`,
    title: '',
    category: CATEGORIES[0],
    fit: 'Regular',
    price: 0,
    description: '',
    colors: [emptyColor()],
    createdAt: new Date().toISOString(),
  };
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [form, setForm] = useState<Product>(product ? structuredClone(product) : emptyProduct());
  const [error, setError] = useState('');

  const updateColor = (idx: number, patch: Partial<ColorVariant>) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const updateStock = (colorIdx: number, size: Size, qty: number) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) =>
        i === colorIdx ? { ...c, stock: { ...c.stock, [size]: Math.max(0, qty) } } : c
      ),
    }));
  };

  const updateImage = (colorIdx: number, imgIdx: number, url: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) =>
        i === colorIdx ? { ...c, images: c.images.map((img, j) => (j === imgIdx ? url : img)) } : c
      ),
    }));
  };

  const addImage = (colorIdx: number) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) => (i === colorIdx ? { ...c, images: [...c.images, ''] } : c)),
    }));
  };

  const removeImage = (colorIdx: number, imgIdx: number) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) =>
        i === colorIdx ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) } : c
      ),
    }));
  };

  const addColor = () => setForm((f) => ({ ...f, colors: [...f.colors, emptyColor()] }));

  const removeColor = (idx: number) => {
    if (form.colors.length <= 1) return;
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setError('Укажите название товара');
      return;
    }
    if (form.price <= 0) {
      setError('Цена должна быть больше нуля');
      return;
    }
    const cleaned: Product = {
      ...form,
      colors: form.colors.map((c) => ({ ...c, images: c.images.filter((img) => img.trim()) })),
    };
    storage.upsertProduct(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-graphite-950">
            {product ? 'Редактировать товар' : 'Новый товар'}
          </h2>
          <button onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <Field label="Название">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Категория">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Посадка">
                <select
                  value={form.fit}
                  onChange={(e) => setForm({ ...form, fit: e.target.value as Fit })}
                  className="input"
                >
                  {FITS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Цена, ₸">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Старая цена, ₸ (для скидки)">
                <input
                  type="number"
                  value={form.oldPrice ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, oldPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="input"
                />
              </Field>
            </div>

            <Field label="Описание">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="input resize-none"
              />
            </Field>

            <Field label="Примечание о модели (необязательно)">
              <input
                value={form.modelNote ?? ''}
                onChange={(e) => setForm({ ...form, modelNote: e.target.value })}
                placeholder="На модели размер L, рост 182 см"
                className="input"
              />
            </Field>

            <div className="border-t border-stone-200 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
                  Цвета и остатки
                </p>
                <button
                  onClick={addColor}
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-ember"
                >
                  <Plus size={14} /> Добавить цвет
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {form.colors.map((color, colorIdx) => (
                  <div key={color.id} className="rounded-xl border border-stone-200 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(colorIdx, { hex: e.target.value })}
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-stone-300"
                      />
                      <input
                        value={color.name}
                        onChange={(e) => updateColor(colorIdx, { name: e.target.value })}
                        className="input flex-1"
                        placeholder="Название цвета"
                      />
                      {form.colors.length > 1 && (
                        <button
                          onClick={() => removeColor(colorIdx)}
                          type="button"
                          className="shrink-0 rounded-md p-2 text-ember hover:bg-stone-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <p className="mb-1.5 text-xs font-medium text-graphite-500">Ссылки на изображения</p>
                    <div className="mb-3 flex flex-col gap-2">
                      {color.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="flex items-center gap-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
                            <SafeImage src={img} alt="" className="h-full w-full object-cover" />
                          </div>
                          <input
                            value={img}
                            onChange={(e) => updateImage(colorIdx, imgIdx, e.target.value)}
                            placeholder="https://..."
                            className="input flex-1"
                          />
                          <button
                            onClick={() => removeImage(colorIdx, imgIdx)}
                            type="button"
                            className="shrink-0 rounded-md p-2 text-graphite-400 hover:bg-stone-100"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addImage(colorIdx)}
                        type="button"
                        className="flex items-center gap-1 self-start text-xs font-medium text-ember"
                      >
                        <Plus size={12} /> Добавить изображение
                      </button>
                    </div>

                    <p className="mb-1.5 text-xs font-medium text-graphite-500">Остаток по размерам</p>
                    <div className="grid grid-cols-5 gap-2">
                      {SIZES.map((size) => (
                        <div key={size}>
                          <label className="mb-1 block text-center text-xs text-graphite-500">{size}</label>
                          <input
                            type="number"
                            min={0}
                            value={color.stock[size]}
                            onChange={(e) => updateStock(colorIdx, size, Number(e.target.value))}
                            className="input text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-ember">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-graphite-800"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="rounded-full bg-graphite-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-graphite-800"
          >
            Сохранить
          </button>
        </div>
      </div>
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
