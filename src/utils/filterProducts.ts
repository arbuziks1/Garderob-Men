import type { Product } from '../types';
import { isInStock } from '../types';
import { sizeFilterKey, type FilterState } from '../components/storefront/FilterControls';

/** The predicate for every field that lives in FilterState — shared between
 *  StorefrontPage's committed filteredProducts (combined there with activeCategory and
 *  search, which aren't part of FilterState) and FilterSheet's live draft match count. */
export function matchesFilterState(p: Product, filters: FilterState): boolean {
  if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
  if (filters.fits.length > 0 && !filters.fits.includes(p.fit)) return false;
  if (filters.seasons.length > 0 && (!p.season || !filters.seasons.includes(p.season))) return false;
  if (filters.colors.length > 0 && !p.colors.some((c) => filters.colors.includes(c.name))) return false;
  if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
  if (filters.inStockOnly && !isInStock(p)) return false;
  if (filters.onSaleOnly && !(p.oldPrice != null && p.oldPrice > p.price)) return false;
  if (filters.sizes.length > 0) {
    // Shoe/belt sizes are plain digit strings that can coincide with a RU clothing
    // number (e.g. "44" is both a shoe EU size and a plausible RU suit size) — only
    // those two categories get their label qualified before matching, exactly mirroring
    // how the filter UI qualifies them when the shopper picks one off the Обувь/Ремни
    // tab (see sizeFilterKey in FilterControls.tsx). Every other category matches by
    // bare label, unchanged from before — ru/int/jeans labels never collide with each
    // other in practice.
    const grid = p.category === 'Обувь' ? 'shoe' : p.category === 'Ремни' ? 'belt' : null;
    const hasSize = p.colors.some((c) =>
      c.sizes.some((s) => {
        if (s.stock <= 0) return false;
        const labels = [s.sizeRu, s.sizeEu, s.sizeInt].filter((v): v is string => Boolean(v));
        return labels.some((label) => filters.sizes.includes(grid ? sizeFilterKey(label, grid) : label));
      })
    );
    if (!hasSize) return false;
  }
  return true;
}
