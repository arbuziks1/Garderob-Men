import { useState } from 'react';
import type { Fit } from '../../types';
import { FITS } from '../../types';
import { SEASON_OPTIONS } from '../../data/categoryCharacteristics';

export interface FilterState {
  sizes: string[];
  fits: Fit[];
  seasons: string[];
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
  return countActiveFilters(filters, priceCeiling) > 0;
}

/** Number of distinct filter "groups" currently narrowing the catalog — shown next to the
 *  Фильтры button as e.g. "Фильтры (2)" rather than a single on/off dot. */
export function countActiveFilters(filters: FilterState, priceCeiling: number): number {
  let count = 0;
  if (filters.sizes.length > 0) count += 1;
  if (filters.fits.length > 0) count += 1;
  if (filters.seasons.length > 0) count += 1;
  if (filters.maxPrice < priceCeiling) count += 1;
  if (filters.inStockOnly) count += 1;
  return count;
}

export function resetFilters(priceCeiling: number): FilterState {
  return { sizes: [], fits: [], seasons: [], maxPrice: priceCeiling, inStockOnly: false };
}

type SizeGrid = 'ru' | 'int' | 'jeans';
const SIZE_GRID_LABEL: Record<SizeGrid, string> = { ru: 'RU', int: 'INT', jeans: 'Джинсы W' };

/** Buckets a flat list of size labels (already deduplicated across the whole catalog) into
 *  the three grids a shopper might think in: plain RU/EU numbers, letter sizes (INT), and
 *  jeans waist sizes ("W30" etc). Keeps the "Размер" filter from turning into one giant
 *  mixed pile of 44-58, S-2XL and W28-W38 all in a row. */
function bucketSizes(sizes: string[]): Record<SizeGrid, string[]> {
  const buckets: Record<SizeGrid, string[]> = { ru: [], int: [], jeans: [] };
  for (const size of sizes) {
    if (/^W\d+$/i.test(size)) buckets.jeans.push(size);
    else if (/^\d+$/.test(size)) buckets.ru.push(size);
    else buckets.int.push(size);
  }
  return buckets;
}

export default function FilterControls({ filters, onChange, priceCeiling, availableSizes }: FilterControlsProps) {
  const sizeBuckets = bucketSizes(availableSizes);
  const availableGrids = (['ru', 'int', 'jeans'] as SizeGrid[]).filter((g) => sizeBuckets[g].length > 0);
  const [sizeGrid, setSizeGrid] = useState<SizeGrid>(availableGrids[0] ?? 'ru');
  const activeGrid = availableGrids.includes(sizeGrid) ? sizeGrid : availableGrids[0];

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

  const active = hasActiveFilters(filters, priceCeiling);

  return (
    <div className="flex flex-col gap-5">
      {availableSizes.length > 0 && activeGrid && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Размер</p>
            {availableGrids.length > 1 && (
              <div className="flex gap-1 rounded-full bg-stone-100 p-0.5">
                {availableGrids.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSizeGrid(g)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                      activeGrid === g ? 'bg-graphite-950 text-white' : 'text-graphite-600 hover:text-graphite-950'
                    }`}
                  >
                    {SIZE_GRID_LABEL[g]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeBuckets[activeGrid].map((size) => (
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
