import { SlidersHorizontal } from 'lucide-react';
import type { Category } from '../../types';
import { CATEGORIES } from '../../types';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import type { FilterState } from './FilterControls';
import { countActiveFilters } from './FilterControls';

interface MobileCategoryBarProps {
  activeCategory: Category | 'Все' | null;
  onCategoryChange: (category: Category | 'Все' | null) => void;
  filters: FilterState;
  priceCeiling: number;
  onOpenFilters: () => void;
}

export default function MobileCategoryBar({
  activeCategory,
  onCategoryChange,
  filters,
  priceCeiling,
  onOpenFilters,
}: MobileCategoryBarProps) {
  const activeCount = countActiveFilters(filters, priceCeiling);
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  const pillClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-sm border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
      isActive
        ? 'border-graphite-950 bg-graphite-950 text-white'
        : 'border-stone-300 text-graphite-700 hover:border-graphite-500'
    }`;

  return (
    <div className="max-w-full border-b border-stone-200 bg-paper/95 backdrop-blur-sm lg:hidden">
      <div ref={scrollRef} className="no-scrollbar flex cursor-grab items-center gap-2 overflow-x-auto px-4 py-3">
        <button
          onClick={onOpenFilters}
          className="flex shrink-0 items-center gap-1.5 rounded-sm border border-graphite-950 bg-graphite-950 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white"
        >
          <SlidersHorizontal size={13} />
          Фильтры{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>

        <span className="h-5 w-px shrink-0 bg-stone-300" />

        <button onClick={() => onCategoryChange('Все')} className={pillClass(activeCategory === 'Все' || activeCategory === null)}>
          Все
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => onCategoryChange(cat)} className={pillClass(activeCategory === cat)}>
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
