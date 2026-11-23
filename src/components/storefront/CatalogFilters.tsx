import FilterControls, { type FilterState } from './FilterControls';

export type { FilterState };

interface CatalogFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceCeiling: number;
  availableSizes: string[];
}

export default function CatalogFilters({ filters, onChange, priceCeiling, availableSizes }: CatalogFiltersProps) {
  return (
    <div className="hidden lg:block lg:w-64 lg:shrink-0">
      <div className="sticky top-24 rounded-sm border border-stone-200 bg-white p-5">
        <p className="mb-4 font-display text-sm uppercase tracking-wide text-graphite-950">Фильтры</p>
        <FilterControls filters={filters} onChange={onChange} priceCeiling={priceCeiling} availableSizes={availableSizes} />
      </div>
    </div>
  );
}
