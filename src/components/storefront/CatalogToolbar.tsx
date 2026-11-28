import { SlidersHorizontal } from 'lucide-react';
import type { Category } from '../../types';
import { CATEGORIES } from '../../types';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { countActiveFilters, type FilterState } from './FilterControls';

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
  priceFloor: number;
  priceCeiling: number;
  onOpenFilterDrawer: () => void;
}

/** One-click category chips + a single "Фильтры (N)" button that opens the full filter
 *  drawer — deliberately no separate quick-access pills here any more. Lives inside
 *  <main>, directly above the product grid (not in the sticky header above the hero),
 *  so it reads as part of the catalog section rather than site-wide navigation. Everything
 *  filter-related lives in one place: the drawer. Result count and sort sit right below
 *  this, still above the grid — see StorefrontPage. */
export default function CatalogToolbar({
  activeCategory,
  onCategoryChange,
  filters,
  priceFloor,
  priceCeiling,
  onOpenFilterDrawer,
}: CatalogToolbarProps) {
  const chipScrollRef = useHorizontalScroll<HTMLDivElement>();
  const activeCount = countActiveFilters(filters, priceFloor, priceCeiling);

  const chipClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-sm border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
      isActive
        ? 'border-graphite-950 bg-graphite-950 text-white'
        : 'border-stone-300 text-graphite-700 hover:border-graphite-500'
    }`;

  return (
    <div ref={chipScrollRef} className="no-scrollbar flex cursor-grab items-center gap-2 overflow-x-auto border-b border-stone-200 pb-4">
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
  );
}
