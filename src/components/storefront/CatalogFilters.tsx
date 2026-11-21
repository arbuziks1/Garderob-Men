import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { Fit, Size } from '../../types';
import { FITS, SIZES } from '../../types';

export interface FilterState {
  sizes: Size[];
  fits: Fit[];
  maxPrice: number;
  inStockOnly: boolean;
}

interface CatalogFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceCeiling: number;
}

export default function CatalogFilters({ filters, onChange, priceCeiling }: CatalogFiltersProps) {
  const [open, setOpen] = useState(false);

  const toggleSize = (size: Size) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes });
  };

  const toggleFit = (fit: Fit) => {
    const fits = filters.fits.includes(fit) ? filters.fits.filter((f) => f !== fit) : [...filters.fits, fit];
    onChange({ ...filters, fits });
  };

  const reset = () =>
    onChange({ sizes: [], fits: [], maxPrice: priceCeiling, inStockOnly: false });

  const hasActiveFilters =
    filters.sizes.length > 0 || filters.fits.length > 0 || filters.maxPrice < priceCeiling || filters.inStockOnly;

  const body = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">Размер</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`h-9 min-w-9 rounded-md border px-2 text-sm font-medium transition-colors ${
                filters.sizes.includes(size)
                  ? 'border-graphite-950 bg-graphite-950 text-white'
                  : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">Посадка</p>
        <div className="flex flex-wrap gap-2">
          {FITS.map((fit) => (
            <button
              key={fit}
              onClick={() => toggleFit(fit)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.fits.includes(fit)
                  ? 'border-graphite-950 bg-graphite-950 text-white'
                  : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">
          Цена до {filters.maxPrice.toLocaleString('ru-RU')} ₸
        </p>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={1000}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-graphite-950"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-graphite-800">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          className="h-4 w-4 accent-graphite-950"
        />
        Только в наличии
      </label>

      {hasActiveFilters && (
        <button onClick={reset} className="text-left text-sm font-medium text-ember underline underline-offset-2">
          Сбросить фильтры
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-5">
          <p className="mb-4 font-display text-sm uppercase tracking-wide text-graphite-950">Фильтры</p>
          {body}
        </div>
      </div>

      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-graphite-800"
        >
          <SlidersHorizontal size={15} />
          Фильтры
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-ember" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-sm uppercase tracking-wide text-graphite-950">Фильтры</p>
              <button onClick={() => setOpen(false)} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>
            {body}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-graphite-950 py-3 text-sm font-medium text-white"
            >
              Показать товары
            </button>
          </div>
        </div>
      )}
    </>
  );
}
