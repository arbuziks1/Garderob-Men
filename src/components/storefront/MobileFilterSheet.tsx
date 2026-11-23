import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FilterControls, { hasActiveFilters, resetFilters, type FilterState } from './FilterControls';
import { EASE } from '../../utils/motion';

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  priceCeiling: number;
  availableSizes: string[];
}

export default function MobileFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  priceCeiling,
  availableSizes,
}: MobileFilterSheetProps) {
  const active = hasActiveFilters(filters, priceCeiling);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute inset-0 bg-graphite-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative flex max-h-[85vh] w-full flex-col rounded-t-md bg-white"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <p className="font-display text-sm uppercase tracking-wide text-graphite-950">Фильтры</p>
              <button onClick={onClose} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterControls filters={filters} onChange={onChange} priceCeiling={priceCeiling} availableSizes={availableSizes} />
            </div>

            <div className="flex gap-2 border-t border-stone-200 p-5">
              <button
                onClick={() => onChange(resetFilters(priceCeiling))}
                disabled={!active}
                className="rounded-sm border border-stone-300 px-5 py-3 text-sm font-medium text-graphite-800 disabled:opacity-40"
              >
                Сбросить
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-sm bg-graphite-950 py-3 text-sm font-medium uppercase tracking-wider text-white"
              >
                Показать товары
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
