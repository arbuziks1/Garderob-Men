import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Category, Product } from '../../types';
import FilterControls, { hasActiveFilters, resetFilters, type FilterState } from './FilterControls';
import { matchesFilterState } from '../../utils/filterProducts';
import { pluralizeRu } from '../../utils/format';
import { EASE } from '../../utils/motion';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceFloor: number;
  priceCeiling: number;
  availableSizes: { label: string; category: Category }[];
  availableColors: { name: string; hex: string }[];
  showCategoryFilter: boolean;
  /** Products already narrowed by every constraint OTHER than FilterState (active
   *  category chip, search query) — the live count reflects "if I apply this draft right
   *  now, on top of what's already active, how many would show". */
  products: Product[];
}

/** Right-side drawer (same slide-in pattern as CartDrawer/WishlistDrawer) holding a DRAFT
 *  copy of the filters. Nothing touches the real, committed filters until the shopper
 *  presses the primary button — only then does the product grid behind the drawer change.
 *  Reopening always starts the draft fresh from whatever was last actually committed. */
export default function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
  priceFloor,
  priceCeiling,
  availableSizes,
  availableColors,
  showCategoryFilter,
  products,
}: FilterSheetProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) setDraft(filters);
    // Only resync when the sheet transitions to open — not on every `filters` change,
    // which would overwrite in-progress edits if the committed state happens to change
    // while the sheet is open (it can't today, but keep the intent explicit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const matchCount = products.filter((p) => matchesFilterState(p, draft)).length;
  const label =
    matchCount === 0
      ? 'Товаров не найдено'
      : `Показать ${matchCount} ${pluralizeRu(matchCount, ['товар', 'товара', 'товаров'])}`;

  const draftActive = hasActiveFilters(draft, priceFloor, priceCeiling);

  const handleApply = () => {
    onChange(draft);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute inset-0 bg-graphite-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative flex h-full w-full max-w-md flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <p className="font-display text-sm uppercase tracking-wide text-graphite-950">Фильтры</p>
              <button onClick={onClose} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterControls
                filters={draft}
                onChange={setDraft}
                priceFloor={priceFloor}
                priceCeiling={priceCeiling}
                availableSizes={availableSizes}
                availableColors={availableColors}
                showCategoryFilter={showCategoryFilter}
              />
            </div>

            <div className="flex gap-2 border-t border-stone-200 p-5">
              <button
                onClick={() => setDraft(resetFilters(priceFloor, priceCeiling))}
                disabled={!draftActive}
                className="rounded-sm border border-stone-300 px-5 py-3 text-sm font-medium text-graphite-800 disabled:opacity-40"
              >
                Сбросить
              </button>
              <button
                onClick={handleApply}
                disabled={matchCount === 0}
                className="flex-1 rounded-sm bg-graphite-950 py-3 text-sm font-medium uppercase tracking-wider text-white disabled:opacity-40"
              >
                {label}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
