import type { Fit, SizeFit } from '../../types';
import { FITS, SIZE_FIT_LABEL, SIZE_FITS } from '../../types';
import { SEASON_OPTIONS } from '../../data/categoryCharacteristics';

export interface FilterState {
  sizes: string[];
  fits: Fit[];
  seasons: string[];
  sizeFits: SizeFit[];
  maxPrice: number;
  inStockOnly: boolean;
}

interface FilterControlsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceCeiling: number;
  availableSizes: string[];
}

export function hasActiveFilters(filters: FilterState, priceCeiling: number): boolean {
  return (
    filters.sizes.length > 0 ||
    filters.fits.length > 0 ||
    filters.seasons.length > 0 ||
    filters.sizeFits.length > 0 ||
    filters.maxPrice < priceCeiling ||
    filters.inStockOnly
  );
}

export function resetFilters(priceCeiling: number): FilterState {
  return { sizes: [], fits: [], seasons: [], sizeFits: [], maxPrice: priceCeiling, inStockOnly: false };
}

export default function FilterControls({ filters, onChange, priceCeiling, availableSizes }: FilterControlsProps) {
  const toggleSize = (size: string) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes });
  };

  const toggleFit = (fit: Fit) => {
    const fits = filters.fits.includes(fit) ? filters.fits.filter((f) => f !== fit) : [...filters.fits, fit];
    onChange({ ...filters, fits });
  };

  const toggleSeason = (season: string) => {
    const seasons = filters.seasons.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...filters.seasons, season];
    onChange({ ...filters, seasons });
  };

  const toggleSizeFit = (sizeFit: SizeFit) => {
    const sizeFits = filters.sizeFits.includes(sizeFit)
      ? filters.sizeFits.filter((f) => f !== sizeFit)
      : [...filters.sizeFits, sizeFit];
    onChange({ ...filters, sizeFits });
  };

  const active = hasActiveFilters(filters, priceCeiling);

  return (
    <div className="flex flex-col gap-5">
      {availableSizes.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Размер</p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
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
      )}

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
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Сезон</p>
        <div className="flex flex-wrap gap-2">
          {SEASON_OPTIONS.map((season) => (
            <button
              key={season}
              onClick={() => toggleSeason(season)}
              className={`rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.seasons.includes(season)
                  ? 'border-graphite-950 bg-graphite-950 text-white'
                  : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Соответствие размеру
        </p>
        <div className="flex flex-col gap-2">
          {SIZE_FITS.map((sf) => (
            <label key={sf} className="flex cursor-pointer items-center gap-2 text-sm text-graphite-800">
              <input
                type="checkbox"
                checked={filters.sizeFits.includes(sf)}
                onChange={() => toggleSizeFit(sf)}
                className="h-4 w-4 accent-graphite-950"
              />
              {SIZE_FIT_LABEL[sf]}
            </label>
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
