import { useState } from 'react';
import type { Category, Fit } from '../../types';
import { CATEGORIES, FITS } from '../../types';
import { SEASON_OPTIONS } from '../../data/categoryCharacteristics';

export interface FilterState {
  sizes: string[];
  fits: Fit[];
  seasons: string[];
  colors: string[];
  categories: Category[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

interface FilterControlsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceFloor: number;
  priceCeiling: number;
  availableSizes: { label: string; category: Category }[];
  availableColors: { name: string; hex: string }[];
  showCategoryFilter: boolean;
}

export function hasActiveFilters(filters: FilterState, priceFloor: number, priceCeiling: number): boolean {
  return countActiveFilters(filters, priceFloor, priceCeiling) > 0;
}

/** Number of distinct filter "groups" currently narrowing the catalog — shown next to the
 *  Фильтры button as e.g. "Фильтры (2)" rather than a single on/off dot. */
export function countActiveFilters(filters: FilterState, priceFloor: number, priceCeiling: number): number {
  let count = 0;
  if (filters.sizes.length > 0) count += 1;
  if (filters.fits.length > 0) count += 1;
  if (filters.seasons.length > 0) count += 1;
  if (filters.colors.length > 0) count += 1;
  if (filters.categories.length > 0) count += 1;
  if (filters.minPrice > priceFloor || filters.maxPrice < priceCeiling) count += 1;
  if (filters.inStockOnly) count += 1;
  if (filters.onSaleOnly) count += 1;
  return count;
}

export function resetFilters(priceFloor: number, priceCeiling: number): FilterState {
  return {
    sizes: [],
    fits: [],
    seasons: [],
    colors: [],
    categories: [],
    minPrice: priceFloor,
    maxPrice: priceCeiling,
    inStockOnly: false,
    onSaleOnly: false,
  };
}

export type SizeGrid = 'ru' | 'int' | 'jeans' | 'shoe' | 'belt';
export const SIZE_GRID_LABEL: Record<SizeGrid, string> = {
  ru: 'RU',
  int: 'INT',
  jeans: 'Джинсы W',
  shoe: 'Обувь',
  belt: 'Ремни, см',
};

/** Shoe and belt sizes are plain digit strings that can coincide with a RU clothing
 *  number (e.g. "44" is both a shoe EU size and a plausible RU suit size) — qualify
 *  only those two with their grid so a filter picked from the "Обувь"/"Ремни" tab can
 *  never match a same-numbered item in a different category. ru/int/jeans labels never
 *  collide with each other in practice, so they stay bare, unchanged from before. */
export function sizeFilterKey(label: string, grid: SizeGrid): string {
  if (grid === 'shoe') return `shoe:${label}`;
  if (grid === 'belt') return `belt:${label}`;
  return label;
}

/** Buckets size labels into the grids a shopper might think in. Category-aware first
 *  (shoe sizes and belt sizes are plain digit strings that would otherwise collide with
 *  RU clothing numbers like 44-58 if bucketed by shape alone), then falls back to the old
 *  regex-based split for every other category. */
export function bucketSizes(sizes: { label: string; category: Category }[]): Record<SizeGrid, string[]> {
  const buckets: Record<SizeGrid, Set<string>> = {
    ru: new Set(),
    int: new Set(),
    jeans: new Set(),
    shoe: new Set(),
    belt: new Set(),
  };
  for (const { label, category } of sizes) {
    if (category === 'Обувь') buckets.shoe.add(label);
    else if (category === 'Ремни') buckets.belt.add(label);
    else if (/^W\d+$/i.test(label)) buckets.jeans.add(label);
    else if (/^\d+$/.test(label)) buckets.ru.add(label);
    else buckets.int.add(label);
  }
  return {
    ru: [...buckets.ru],
    int: [...buckets.int],
    jeans: [...buckets.jeans],
    shoe: [...buckets.shoe],
    belt: [...buckets.belt],
  };
}

export default function FilterControls({
  filters,
  onChange,
  priceFloor,
  priceCeiling,
  availableSizes,
  availableColors,
  showCategoryFilter,
}: FilterControlsProps) {
  const sizeBuckets = bucketSizes(availableSizes);
  const gridOrder: SizeGrid[] = ['ru', 'int', 'jeans', 'shoe', 'belt'];
  const availableGrids = gridOrder.filter((g) => sizeBuckets[g].length > 0);
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

  const toggleColor = (name: string) => {
    const colors = filters.colors.includes(name)
      ? filters.colors.filter((c) => c !== name)
      : [...filters.colors, name];
    onChange({ ...filters, colors });
  };

  const toggleCategory = (cat: Category) => {
    const categories = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories });
  };

  const active = hasActiveFilters(filters, priceFloor, priceCeiling);

  return (
    <div className="flex flex-col gap-5">
      {availableSizes.length > 0 && activeGrid && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Размер</p>
            {availableGrids.length > 1 && (
              <div className="flex flex-wrap justify-end gap-1 rounded-full bg-stone-100 p-0.5">
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
            {sizeBuckets[activeGrid].map((size) => {
              const key = sizeFilterKey(size, activeGrid);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(key)}
                  className={`h-9 min-w-9 rounded-sm border px-2 text-sm font-medium transition-colors ${
                    filters.sizes.includes(key)
                      ? 'border-graphite-950 bg-graphite-950 text-white'
                      : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availableColors.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Цвет</p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  filters.colors.includes(color.name)
                    ? 'border-graphite-950 bg-graphite-950 text-white'
                    : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCategoryFilter && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Категория</p>
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm text-graphite-800">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="h-4 w-4 accent-graphite-950"
                />
                {cat}
              </label>
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

      <PriceRangeField
        filters={filters}
        onChange={onChange}
        priceFloor={priceFloor}
        priceCeiling={priceCeiling}
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-graphite-800">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          className="h-4 w-4 accent-graphite-950"
        />
        Только в наличии
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-graphite-800">
        <input
          type="checkbox"
          checked={filters.onSaleOnly}
          onChange={(e) => onChange({ ...filters, onSaleOnly: e.target.checked })}
          className="h-4 w-4 accent-graphite-950"
        />
        Только со скидкой
      </label>

      {active && (
        <button
          onClick={() => onChange(resetFilters(priceFloor, priceCeiling))}
          className="text-left text-sm font-medium text-ember underline underline-offset-2"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}

interface PriceRangeFieldProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceFloor: number;
  priceCeiling: number;
}

/** From/To number inputs plus a dual-handle range slider underneath, kept in sync both
 *  ways. The slider is two overlapping native <input type="range"> elements sharing a
 *  track — see the .dual-range rules in index.css — rather than a new dependency. */
export function PriceRangeField({ filters, onChange, priceFloor, priceCeiling }: PriceRangeFieldProps) {
  const span = Math.max(1, priceCeiling - priceFloor);
  const step = span > 100000 ? 1000 : 100;

  const setMin = (raw: number) => {
    const next = Math.min(Math.max(priceFloor, raw), filters.maxPrice);
    onChange({ ...filters, minPrice: next });
  };
  const setMax = (raw: number) => {
    const next = Math.max(Math.min(priceCeiling, raw), filters.minPrice);
    onChange({ ...filters, maxPrice: next });
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Цена</p>
      <div className="mb-3 flex items-center gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[11px] text-graphite-500">От ₸</span>
          <input
            type="number"
            min={priceFloor}
            max={filters.maxPrice}
            value={filters.minPrice}
            onChange={(e) => setMin(Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[11px] text-graphite-500">До ₸</span>
          <input
            type="number"
            min={filters.minPrice}
            max={priceCeiling}
            value={filters.maxPrice}
            onChange={(e) => setMax(Number(e.target.value))}
            className="input"
          />
        </label>
      </div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-stone-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-graphite-950"
          style={{
            left: `${((filters.minPrice - priceFloor) / span) * 100}%`,
            right: `${100 - ((filters.maxPrice - priceFloor) / span) * 100}%`,
          }}
        />
        <input
          type="range"
          min={priceFloor}
          max={priceCeiling}
          step={step}
          value={filters.minPrice}
          onChange={(e) => setMin(Number(e.target.value))}
          className="dual-range"
        />
        <input
          type="range"
          min={priceFloor}
          max={priceCeiling}
          step={step}
          value={filters.maxPrice}
          onChange={(e) => setMax(Number(e.target.value))}
          className="dual-range"
        />
      </div>
    </div>
  );
}
