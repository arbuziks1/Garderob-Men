import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { ColorVariant, Fit, Product, ProductMeasurements, SizeFit, SizeStock } from '../../types';
import { CATEGORIES, FITS, SIZE_FIT_LABEL, SIZE_FITS } from '../../types';
import { BRAND_OPTIONS, COUNTRY_OPTIONS, MATERIAL_OPTIONS } from '../../data/productOptions';
import { CATEGORY_CHARACTERISTIC_FIELDS, COMMON_CHARACTERISTIC_FIELDS, SEASON_OPTIONS } from '../../data/categoryCharacteristics';
import { CATEGORY_MEASUREMENT_ROWS } from '../../data/measurements';
import { distinctSizeLabels, INT_TO_RU_EU, RU_EU_TO_INT, SIZE_GRID_PRESETS } from '../../data/sizeGrids';
import { api } from '../../services/api';
import ImageField from './ImageField';
import SearchableSelect from './SearchableSelect';
import TagInput from './TagInput';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

function emptySizeRow(): SizeStock {
  return { id: `temp-${crypto.randomUUID()}`, stock: 0 };
}

function emptyColor(): ColorVariant {
  return {
    id: `c-${crypto.randomUUID()}`,
    name: 'Новый цвет',
    hex: '#27272a',
    images: [''],
    sizes: [emptySizeRow()],
  };
}

function emptyProduct(): Product {
  return {
    id: `p${Date.now()}`,
    sku: '',
    title: '',
    category: CATEGORIES[0],
    fit: 'Regular',
    price: 0,
    description: '',
    colors: [emptyColor()],
    createdAt: new Date().toISOString(),
  };
}

interface ExtraRow {
  id: string;
  key: string;
  value: string;
}

function knownKeysFor(category: Product['category']): Set<string> {
  return new Set([
    ...COMMON_CHARACTERISTIC_FIELDS.map((f) => f.key),
    ...(CATEGORY_CHARACTERISTIC_FIELDS[category] ?? []).map((f) => f.key),
  ]);
}

function extraRowsFromProduct(product: Product | null): ExtraRow[] {
  if (!product) return [];
  const known = knownKeysFor(product.category);
  return Object.entries(product.characteristics ?? {})
    .filter(([key]) => !known.has(key))
    .map(([key, value], idx) => ({ id: `row${idx}`, key, value }));
}

function normalizeMeasurements(
  measurements: ProductMeasurements | undefined,
  category: Product['category']
): ProductMeasurements {
  if (measurements && Array.isArray(measurements.rows) && measurements.values && typeof measurements.values === 'object') {
    return measurements;
  }
  return { rows: [...(CATEGORY_MEASUREMENT_ROWS[category] ?? [])], values: {} };
}

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [form, setForm] = useState<Product>(product ? structuredClone(product) : emptyProduct());
  const [extraRows, setExtraRows] = useState<ExtraRow[]>(extraRowsFromProduct(product));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [justAddedColorId, setJustAddedColorId] = useState<string | null>(null);
  const colorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!justAddedColorId) return;
    colorRefs.current[justAddedColorId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setJustAddedColorId(null), 1200);
    return () => clearTimeout(timer);
  }, [justAddedColorId]);

  const updateExtraRow = (id: string, patch: Partial<Pick<ExtraRow, 'key' | 'value'>>) => {
    setExtraRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const addExtraRow = () => {
    setExtraRows((rows) => [...rows, { id: `row${Date.now()}${Math.random()}`, key: '', value: '' }]);
  };
  const removeExtraRow = (id: string) => {
    setExtraRows((rows) => rows.filter((r) => r.id !== id));
  };

  const setCharacteristic = (key: string, value: string) => {
    setForm((f) => ({ ...f, characteristics: { ...(f.characteristics ?? {}), [key]: value } }));
  };

  const updateColor = (idx: number, patch: Partial<ColorVariant>) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const updateSizeRow = (colorIdx: number, sizeIdx: number, patch: Partial<SizeStock>) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, ci) => {
        if (ci !== colorIdx) return c;
        return {
          ...c,
          sizes: c.sizes.map((s, si) => {
            if (si !== sizeIdx) return s;
            const next: SizeStock = { ...s, ...patch };
            // Auto-fill the other grid(s) only if they're still empty — never overwrite
            // a value the admin already set/edited manually.
            if (patch.sizeRu !== undefined || patch.sizeEu !== undefined) {
              const ruEuValue = (patch.sizeRu ?? patch.sizeEu ?? '').trim();
              if (!next.sizeInt?.trim() && RU_EU_TO_INT[ruEuValue]) {
                next.sizeInt = RU_EU_TO_INT[ruEuValue];
              }
            }
            if (patch.sizeInt !== undefined) {
              const intValue = patch.sizeInt.trim();
              if (!next.sizeRu?.trim() && !next.sizeEu?.trim() && INT_TO_RU_EU[intValue]) {
                next.sizeRu = INT_TO_RU_EU[intValue];
                next.sizeEu = INT_TO_RU_EU[intValue];
              }
            }
            return next;
          }),
        };
      }),
    }));
  };

  const addSizeRow = (colorIdx: number) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, ci) => (ci === colorIdx ? { ...c, sizes: [...c.sizes, emptySizeRow()] } : c)),
    }));
  };

  const removeSizeRow = (colorIdx: number, sizeIdx: number) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, ci) =>
        ci === colorIdx ? { ...c, sizes: c.sizes.filter((_, si) => si !== sizeIdx) } : c
      ),
    }));
  };

  const applyPreset = (colorIdx: number, presetLabel: string) => {
    if (!presetLabel) return;
    const preset = SIZE_GRID_PRESETS.find((p) => p.label === presetLabel);
    if (!preset) return;
    const color = form.colors[colorIdx];
    const hasStock = color.sizes.some((s) => s.stock > 0);
    if (
      hasStock &&
      !window.confirm('У этого цвета уже заполнены остатки. Заменить размеры пресетом (остатки обнулятся)?')
    ) {
      return;
    }
    const newSizes: SizeStock[] = preset.rows.map((row, i) => ({
      id: `temp${Date.now()}${i}${Math.random()}`,
      sizeRu: row.sizeRu,
      sizeEu: row.sizeEu,
      sizeInt: row.sizeInt,
      stock: 0,
    }));
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, ci) => (ci === colorIdx ? { ...c, sizes: newSizes } : c)),
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

  const addColor = () => {
    const color = emptyColor();
    setForm((f) => ({ ...f, colors: [...f.colors, color] }));
    setJustAddedColorId(color.id);
  };

  const removeColor = (idx: number) => {
    if (form.colors.length <= 1) return;
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));
  };

  const sizeLabels = distinctSizeLabels(form.colors);
  const measurements: ProductMeasurements = normalizeMeasurements(form.measurements, form.category);

  const setMeasurementCell = (rowLabel: string, sizeLabel: string, raw: string) => {
    setForm((f) => {
      const base = normalizeMeasurements(f.measurements, f.category);
      const rowValues = { ...(base.values[rowLabel] ?? {}) };
      const num = Number(raw);
      if (raw.trim() === '' || Number.isNaN(num)) {
        delete rowValues[sizeLabel];
      } else {
        rowValues[sizeLabel] = num;
      }
      return { ...f, measurements: { ...base, values: { ...base.values, [rowLabel]: rowValues } } };
    });
  };

  const addMeasurementRow = () => {
    setForm((f) => {
      const base = normalizeMeasurements(f.measurements, f.category);
      return { ...f, measurements: { ...base, rows: [...base.rows, ''] } };
    });
  };

  const renameMeasurementRow = (idx: number, newLabel: string) => {
    setForm((f) => {
      const base = normalizeMeasurements(f.measurements, f.category);
      const oldLabel = base.rows[idx];
      const rows = base.rows.map((r, i) => (i === idx ? newLabel : r));
      const values = { ...base.values };
      if (oldLabel !== newLabel && oldLabel in values) {
        values[newLabel] = values[oldLabel];
        delete values[oldLabel];
      }
      return { ...f, measurements: { ...base, rows, values } };
    });
  };

  const removeMeasurementRow = (idx: number) => {
    setForm((f) => {
      const base = normalizeMeasurements(f.measurements, f.category);
      const label = base.rows[idx];
      const rows = base.rows.filter((_, i) => i !== idx);
      const values = { ...base.values };
      delete values[label];
      return { ...f, measurements: { ...base, rows, values } };
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Укажите название товара');
      return;
    }
    if (form.price <= 0) {
      setError('Цена должна быть больше нуля');
      return;
    }
    for (const color of form.colors) {
      const validSizes = color.sizes.filter((s) => s.sizeRu?.trim() || s.sizeEu?.trim() || s.sizeInt?.trim());
      if (validSizes.length === 0) {
        setError(`У цвета «${color.name}» нет ни одного заполненного размера`);
        return;
      }
    }

    const known = knownKeysFor(form.category);
    const extraCharacteristics = Object.fromEntries(
      extraRows.filter((r) => r.key.trim() && !known.has(r.key.trim())).map((r) => [r.key.trim(), r.value.trim()])
    );
    const characteristics = { ...(form.characteristics ?? {}), ...extraCharacteristics };

    const cleanedMeasurements = (() => {
      if (!form.measurements || !Array.isArray(form.measurements.rows)) return undefined;
      const rows = form.measurements.rows.map((r) => r.trim()).filter(Boolean);
      if (rows.length === 0) return undefined;
      const currentLabels = new Set(distinctSizeLabels(form.colors));
      const values: Record<string, Record<string, number>> = {};
      for (const row of rows) {
        const rowValues = form.measurements.values?.[row];
        if (!rowValues) continue;
        const filtered = Object.fromEntries(
          Object.entries(rowValues).filter(([label, cm]) => currentLabels.has(label) && !Number.isNaN(cm))
        );
        if (Object.keys(filtered).length > 0) values[row] = filtered;
      }
      return { rows, values };
    })();

    const cleaned = {
      title: form.title,
      category: form.category,
      fit: form.fit,
      sizeFit: form.sizeFit || undefined,
      price: form.price,
      oldPrice: form.oldPrice,
      description: form.description,
      modelNote: form.modelNote,
      brand: form.brand,
      countryOfOrigin: form.countryOfOrigin,
      season: form.season,
      material: form.material,
      composition: form.composition,
      characteristics,
      measurements: cleanedMeasurements,
      colors: form.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        images: c.images.filter((img) => img.trim()),
        sizes: c.sizes
          .filter((s) => s.sizeRu?.trim() || s.sizeEu?.trim() || s.sizeInt?.trim())
          .map((s) => ({
            sizeRu: s.sizeRu?.trim() || undefined,
            sizeEu: s.sizeEu?.trim() || undefined,
            sizeInt: s.sizeInt?.trim() || undefined,
            stock: s.stock,
          })),
      })),
    };

    setSaving(true);
    setError('');
    try {
      if (product) {
        await api.updateProduct(product.id, cleaned);
      } else {
        await api.createProduct(cleaned);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар.');
    } finally {
      setSaving(false);
    }
  };

  const categoryFields = CATEGORY_CHARACTERISTIC_FIELDS[form.category] ?? [];

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
            <Field label="Артикул (SKU)">
              {product ? (
                <div className="flex items-center gap-2">
                  <input value={form.sku} disabled className="input bg-stone-100 text-graphite-500" />
                  <span className="shrink-0 text-xs text-graphite-400">генерируется автоматически</span>
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-sm text-graphite-500">
                  Будет присвоен автоматически после сохранения
                </p>
              )}
            </Field>

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

            <Field label="Соответствие размеру">
              <select
                value={form.sizeFit ?? ''}
                onChange={(e) => setForm({ ...form, sizeFit: (e.target.value || undefined) as SizeFit | undefined })}
                className="input"
              >
                <option value="">Не указано</option>
                {SIZE_FITS.map((sf) => (
                  <option key={sf} value={sf}>
                    {SIZE_FIT_LABEL[sf]}
                  </option>
                ))}
              </select>
            </Field>

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
              <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
                Характеристики
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Бренд">
                  <SearchableSelect
                    value={form.brand ?? ''}
                    onChange={(value) => setForm({ ...form, brand: value })}
                    options={BRAND_OPTIONS}
                    placeholder="Без бренда"
                  />
                </Field>
                <Field label="Страна производства">
                  <SearchableSelect
                    value={form.countryOfOrigin ?? ''}
                    onChange={(value) => setForm({ ...form, countryOfOrigin: value })}
                    options={COUNTRY_OPTIONS}
                    placeholder="Турция"
                  />
                </Field>
                <Field label="Материал">
                  <SearchableSelect
                    value={form.material ?? ''}
                    onChange={(value) => setForm({ ...form, material: value })}
                    options={MATERIAL_OPTIONS}
                    placeholder="Хлопок"
                  />
                </Field>
                <Field label="Сезон">
                  <SearchableSelect
                    value={form.season ?? ''}
                    onChange={(value) => setForm({ ...form, season: value })}
                    options={SEASON_OPTIONS}
                    placeholder="Демисезон"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Состав (подробно, в процентах)">
                  <input
                    value={form.composition ?? ''}
                    onChange={(e) => setForm({ ...form, composition: e.target.value })}
                    placeholder="80% хлопок, 20% полиэстер"
                    className="input"
                  />
                </Field>
              </div>

              {categoryFields.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-graphite-500">Характеристики категории «{form.category}»</p>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryFields.map((fieldDef) => (
                      <Field key={fieldDef.key} label={fieldDef.key}>
                        {fieldDef.multiple ? (
                          <TagInput
                            value={form.characteristics?.[fieldDef.key] ?? ''}
                            onChange={(value) => setCharacteristic(fieldDef.key, value)}
                            options={fieldDef.options}
                          />
                        ) : (
                          <SearchableSelect
                            value={form.characteristics?.[fieldDef.key] ?? ''}
                            onChange={(value) => setCharacteristic(fieldDef.key, value)}
                            options={fieldDef.options}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-graphite-500">Общие характеристики</p>
                <div className="grid grid-cols-2 gap-4">
                  {COMMON_CHARACTERISTIC_FIELDS.map((fieldDef) => (
                    <Field key={fieldDef.key} label={fieldDef.key}>
                      {fieldDef.multiple ? (
                        <TagInput
                          value={form.characteristics?.[fieldDef.key] ?? ''}
                          onChange={(value) => setCharacteristic(fieldDef.key, value)}
                          options={fieldDef.options}
                        />
                      ) : (
                        <SearchableSelect
                          value={form.characteristics?.[fieldDef.key] ?? ''}
                          onChange={(value) => setCharacteristic(fieldDef.key, value)}
                          options={fieldDef.options}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-graphite-500">
                    Доп. характеристики (свои поля, не из списка выше)
                  </p>
                  <button
                    onClick={addExtraRow}
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-ember"
                  >
                    <Plus size={14} /> Добавить
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {extraRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <input
                        value={row.key}
                        onChange={(e) => updateExtraRow(row.id, { key: e.target.value })}
                        placeholder="Название, напр. Страна бренда"
                        className="input flex-1"
                      />
                      <input
                        value={row.value}
                        onChange={(e) => updateExtraRow(row.id, { value: e.target.value })}
                        placeholder="Значение"
                        className="input flex-1"
                      />
                      <button
                        onClick={() => removeExtraRow(row.id)}
                        type="button"
                        className="shrink-0 rounded-md p-2 text-ember hover:bg-stone-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {extraRows.length === 0 && (
                    <p className="text-sm text-graphite-400">Доп. характеристик пока нет</p>
                  )}
                </div>
              </div>
            </div>

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
                  <div
                    key={color.id}
                    ref={(el) => {
                      colorRefs.current[color.id] = el;
                    }}
                    className={`rounded-xl border p-4 transition-shadow duration-700 ${
                      justAddedColorId === color.id
                        ? 'border-ember shadow-[0_0_0_3px_rgba(193,86,48,0.15)]'
                        : 'border-stone-200'
                    }`}
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-graphite-400">
                      Цвет {colorIdx + 1}
                    </p>
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

                    <p className="mb-1.5 text-xs font-medium text-graphite-500">Изображения</p>
                    <div className="mb-3 flex flex-col gap-2">
                      {color.images.map((img, imgIdx) => (
                        <ImageField
                          key={imgIdx}
                          value={img}
                          onChange={(value) => updateImage(colorIdx, imgIdx, value)}
                          onRemove={() => removeImage(colorIdx, imgIdx)}
                        />
                      ))}
                      <button
                        onClick={() => addImage(colorIdx)}
                        type="button"
                        className="flex items-center gap-1 self-start text-xs font-medium text-ember"
                      >
                        <Plus size={12} /> Добавить изображение
                      </button>
                    </div>

                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-graphite-500">Размеры и остатки</p>
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            applyPreset(colorIdx, e.target.value);
                            e.target.value = '';
                          }}
                          className="rounded-md border border-stone-300 px-2 py-1 text-xs"
                        >
                          <option value="" disabled>
                            Пресет размерной сетки…
                          </option>
                          {SIZE_GRID_PRESETS.map((p) => (
                            <option key={p.label} value={p.label}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-graphite-400">
                        <span>RU</span>
                        <span>EU</span>
                        <span>INT</span>
                        <span>Остаток</span>
                        <span />
                      </div>
                      {color.sizes.map((sizeRow, sizeIdx) => (
                        <div key={sizeRow.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-1.5">
                          <input
                            value={sizeRow.sizeRu ?? ''}
                            onChange={(e) => updateSizeRow(colorIdx, sizeIdx, { sizeRu: e.target.value })}
                            placeholder="48"
                            className="input text-center"
                          />
                          <input
                            value={sizeRow.sizeEu ?? ''}
                            onChange={(e) => updateSizeRow(colorIdx, sizeIdx, { sizeEu: e.target.value })}
                            placeholder="48"
                            className="input text-center"
                          />
                          <input
                            value={sizeRow.sizeInt ?? ''}
                            onChange={(e) => updateSizeRow(colorIdx, sizeIdx, { sizeInt: e.target.value })}
                            placeholder="M"
                            className="input text-center"
                          />
                          <input
                            type="number"
                            min={0}
                            value={sizeRow.stock}
                            onChange={(e) =>
                              updateSizeRow(colorIdx, sizeIdx, { stock: Math.max(0, Number(e.target.value)) })
                            }
                            className="input text-center"
                          />
                          <button
                            onClick={() => removeSizeRow(colorIdx, sizeIdx)}
                            type="button"
                            className="shrink-0 rounded-md p-1.5 text-ember hover:bg-stone-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addSizeRow(colorIdx)}
                        type="button"
                        className="mt-1 flex items-center gap-1 self-start text-xs font-medium text-ember"
                      >
                        <Plus size={12} /> Добавить размер
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-graphite-800">
                  Замеры (в см)
                </p>
                <button
                  onClick={addMeasurementRow}
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-ember"
                >
                  <Plus size={14} /> Добавить строку
                </button>
              </div>

              {sizeLabels.length === 0 ? (
                <p className="text-sm text-graphite-400">
                  Сначала добавьте размеры у цветов выше — тогда здесь появятся колонки для замеров.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-stone-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-graphite-500">Параметр</th>
                        {sizeLabels.map((label) => (
                          <th key={label} className="px-2 py-2 text-center text-xs font-medium text-graphite-500">
                            {label}
                          </th>
                        ))}
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.rows.map((rowLabel, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-stone-100 last:border-0">
                          <td className="px-2 py-1.5">
                            <input
                              value={rowLabel}
                              onChange={(e) => renameMeasurementRow(rowIdx, e.target.value)}
                              placeholder="Название параметра"
                              className="input"
                            />
                          </td>
                          {sizeLabels.map((sizeLabel) => (
                            <td key={sizeLabel} className="px-1.5 py-1.5">
                              <input
                                type="number"
                                min={0}
                                value={measurements.values[rowLabel]?.[sizeLabel] ?? ''}
                                onChange={(e) => setMeasurementCell(rowLabel, sizeLabel, e.target.value)}
                                className="input w-16 text-center"
                              />
                            </td>
                          ))}
                          <td className="px-1.5 py-1.5 text-center">
                            <button
                              onClick={() => removeMeasurementRow(rowIdx)}
                              type="button"
                              className="rounded-md p-1.5 text-ember hover:bg-stone-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
            disabled={saving}
            className="rounded-full bg-graphite-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
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
