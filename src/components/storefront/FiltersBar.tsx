import { SlidersHorizontal } from 'lucide-react';
import { countActiveFilters, type FilterState } from './FilterControls';

interface FiltersBarProps {
  filters: FilterState;
  priceCeiling: number;
  resultCount: number;
  onOpenFilters: () => void;
}

/** Slim horizontal bar above the product grid on larger screens — replaces the old
 *  permanent sidebar, which squeezed the grid and dumped every size grid (RU numbers,
 *  INT letters, jeans W-sizes) into one unreadable pile. Filters now live in a panel that
 *  opens on demand (see FilterSheet), so the grid keeps full width by default. */
export default function FiltersBar({ filters, priceCeiling, resultCount, onOpenFilters }: FiltersBarProps) {
  const activeCount = countActiveFilters(filters, priceCeiling);

  return (
    <div className="mb-5 hidden items-center justify-between lg:flex">
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 rounded-sm border border-stone-300 px-4 py-2 text-sm font-medium text-graphite-800 transition-colors hover:border-graphite-600"
      >
        <SlidersHorizontal size={15} />
        Фильтры{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
      <p className="text-sm text-graphite-500">{resultCount} товаров</p>
    </div>
  );
}
