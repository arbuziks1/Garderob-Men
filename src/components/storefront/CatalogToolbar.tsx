import { useEffect, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { Category } from '../../types';
import { CATEGORIES } from '../../types';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import {
  bucketSizes,
  countActiveFilters,
  PriceRangeField,
  sizeFilterKey,
  SIZE_GRID_LABEL,
  type FilterState,
  type SizeGrid,
} from './FilterControls';

export type SortOption = 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'discount';

export const SORT_LABEL: Record<SortOption, string> = {
  popularity: 'По популярности',
  price_asc: 'Сначала дешевле',
  price_desc: 'Сначала дороже',
  newest: 'Новинки',
  discount: 'Со скидкой',
};
export const SORT_OPTIONS: SortOption[] = ['popularity', 'price_asc', 'price_desc', 'newest', 'discount'];

interface CatalogToolbarProps {
  activeCategory: Category | 'Все' | null;
  onCategoryChange: (category: Category | 'Все' | null) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  priceFloor: number;
  priceCeiling: number;
  availableSizes: { label: string; category: Category }[];
  availableColors: { name: string; hex: string }[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  onOpenFilterDrawer: () => void;
}

type QuickPopover = 'size' | 'color' | 'price' | null;

/** One-click category chips + a "Фильтры (N)" drawer trigger at every breakpoint, plus
 *  (lg and up) instant-apply quick pills for size/color/price and a sort dropdown. Replaces
 *  the old MobileCategoryBar/FiltersBar pair now that the header no longer carries a long
 *  category nav list. */
export default function CatalogToolbar({
  activeCategory,
  onCategoryChange,
  filters,
  onFiltersChange,
  priceFloor,
  priceCeiling,
  availableSizes,
  availableColors,
  sortBy,
  onSortChange,
  resultCount,
  onOpenFilterDrawer,
}: CatalogToolbarProps) {
  const chipScrollRef = useHorizontalScroll<HTMLDivElement>();
  const quickPillsRef = useRef<HTMLDivElement>(null);
  const [openPopover, setOpenPopover] = useState<QuickPopover>(null);

  useEffect(() => {
    if (!openPopover) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (quickPillsRef.current && !quickPillsRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [openPopover]);

  const activeCount = countActiveFilters(filters, priceFloor, priceCeiling);
  const sizeBuckets = bucketSizes(availableSizes);
  const gridOrder: SizeGrid[] = ['ru', 'int', 'jeans', 'shoe', 'belt'];
  const availableGrids = gridOrder.filter((g) => sizeBuckets[g].length > 0);
  const [quickSizeGrid, setQuickSizeGrid] = useState<SizeGrid>(availableGrids[0] ?? 'ru');
  const activeQuickGrid = availableGrids.includes(quickSizeGrid) ? quickSizeGrid : availableGrids[0];

  const togglePopover = (key: QuickPopover) => setOpenPopover((p) => (p === key ? null : key));

  const toggleSize = (size: string) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes });
  };

  const toggleColor = (name: string) => {
    const colors = filters.colors.includes(name)
      ? filters.colors.filter((c) => c !== name)
      : [...filters.colors, name];
    onFiltersChange({ ...filters, colors });
  };

  const pillClass = (isActive: boolean) =>
    `flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
      isActive
        ? 'border-graphite-950 bg-graphite-950 text-white'
        : 'border-stone-300 text-graphite-700 hover:border-graphite-500'
    }`;

  const chipClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-sm border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
      isActive
        ? 'border-graphite-950 bg-graphite-950 text-white'
        : 'border-stone-300 text-graphite-700 hover:border-graphite-500'
    }`;

  return (
    <div className="border-b border-stone-200 bg-paper/95 backdrop-blur-sm">
      <div ref={chipScrollRef} className="no-scrollbar flex cursor-grab items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        <button
          onClick={onOpenFilterDrawer}
          className="flex shrink-0 items-center gap-1.5 rounded-sm border border-graphite-950 bg-graphite-950 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white"
        >
          <SlidersHorizontal size={13} />
          Фильтры{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>

        <span className="h-5 w-px shrink-0 bg-stone-300" />

        <button onClick={() => onCategoryChange('Все')} className={chipClass(activeCategory === 'Все' || activeCategory === null)}>
          Все
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => onCategoryChange(cat)} className={chipClass(activeCategory === cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="hidden items-center justify-between gap-3 px-4 pb-3 sm:px-6 lg:flex">
        <div ref={quickPillsRef} className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => togglePopover('size')} className={pillClass(filters.sizes.length > 0)}>
              Размер <ChevronDown size={12} />
            </button>
            {openPopover === 'size' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-md border border-stone-200 bg-white p-3 shadow-xl">
                {availableSizes.length === 0 ? (
                  <p className="text-sm text-graphite-400">Нет доступных размеров</p>
                ) : (
                  <>
                    {availableGrids.length > 1 && (
                      <div className="mb-2 flex flex-wrap gap-1 rounded-full bg-stone-100 p-0.5">
                        {availableGrids.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setQuickSizeGrid(g)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                              activeQuickGrid === g ? 'bg-graphite-950 text-white' : 'text-graphite-600'
                            }`}
                          >
                            {SIZE_GRID_LABEL[g]}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuickGrid &&
                        sizeBuckets[activeQuickGrid].map((size) => {
                          const key = sizeFilterKey(size, activeQuickGrid);
                          return (
                            <button
                              key={size}
                              onClick={() => toggleSize(key)}
                              className={`h-8 min-w-8 rounded-sm border px-2 text-sm font-medium transition-colors ${
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
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => togglePopover('color')} className={pillClass(filters.colors.length > 0)}>
              Цвет <ChevronDown size={12} />
            </button>
            {openPopover === 'color' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-md border border-stone-200 bg-white p-3 shadow-xl">
                {availableColors.length === 0 ? (
                  <p className="text-sm text-graphite-400">Нет доступных цветов</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
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
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => togglePopover('price')}
              className={pillClass(filters.minPrice > priceFloor || filters.maxPrice < priceCeiling)}
            >
              Цена <ChevronDown size={12} />
            </button>
            {openPopover === 'price' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-md border border-stone-200 bg-white p-4 shadow-xl">
                <PriceRangeField
                  filters={filters}
                  onChange={onFiltersChange}
                  priceFloor={priceFloor}
                  priceCeiling={priceCeiling}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-graphite-500">{resultCount} товаров</p>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-sm border border-stone-300 px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-graphite-800"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {SORT_LABEL[opt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-3 sm:px-6 lg:hidden">
        <p className="text-sm text-graphite-500">{resultCount} товаров</p>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-sm border border-stone-300 px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-graphite-800"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {SORT_LABEL[opt]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
