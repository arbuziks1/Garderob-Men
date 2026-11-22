import type { Fit, Size } from '../../types';
import { FITS, SIZES } from '../../types';

export interface FilterState {
  sizes: Size[];
  fits: Fit[];
  maxPrice: number;
  inStockOnly: boolean;
}

interface FilterControlsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceCeiling: number;
}

export function hasActiveFilters(filters: FilterState, priceCeiling: number): boolean {
  return (
    filters.sizes.length > 0 || filters.fits.length > 0 || filters.maxPrice < priceCeiling || filters.inStockOnly
  );
}

export function resetFilters(priceCeiling: number): FilterState {
  return { sizes: [], fits: [], maxPrice: priceCeiling, inStockOnly: false };
}

export default function FilterControls({ filters, onChange, priceCeiling }: FilterControlsProps) {
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

  const active = hasActiveFilters(filters, priceCeiling);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Размер</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`h-9 min-w-9 rounded-sm border px-2 text-sm font-medium transition-colors ${
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
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Посадка</p>
        <div className="flex flex-wrap gap-2">
          {FITS.map((fit) => (
            <button
              key={fit}
              onClick={() => toggleFit(fit)}
              className={`rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors ${
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
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Цена до <span className="tabular-nums">{filters.maxPrice.toLocaleString('ru-RU')}</span> ₸
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

      {active && (
        <button
          onClick={() => onChange(resetFilters(priceCeiling))}
          className="text-left text-sm font-medium text-ember underline underline-offset-2"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
