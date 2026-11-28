import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Category, Product } from '../types';
import { isInStock, priceRange } from '../types';
import { sortSizeLabels } from '../data/sizeGrids';
import { matchesFilterState } from '../utils/filterProducts';
import { useBranches, useProducts, useSettings } from '../hooks/useStore';
import Header from '../components/storefront/Header';
import HeroBanner from '../components/storefront/HeroBanner';
import CatalogToolbar, { SORT_LABEL, SORT_OPTIONS, type SortOption } from '../components/storefront/CatalogToolbar';
import FilterSheet from '../components/storefront/FilterSheet';
import type { FilterState } from '../components/storefront/FilterControls';
import ProductGrid from '../components/storefront/ProductGrid';
import ProductModal from '../components/storefront/ProductModal';
import CartDrawer from '../components/storefront/CartDrawer';
import CartToast from '../components/storefront/CartToast';
import FloatingCartBar from '../components/storefront/FloatingCartBar';
import Footer from '../components/storefront/Footer';
import WishlistDrawer from '../components/storefront/WishlistDrawer';
import AccountDrawer from '../components/storefront/AccountDrawer';

export default function StorefrontPage() {
  const [products] = useProducts();
  const [settings] = useSettings();
  const [branches] = useBranches();
  const [activeCategory, setActiveCategory] = useState<Category | 'Все' | null>('Все');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // 'popularity' has no real sales/view-count data behind it in this app — it just means
  // "default order, no extra sort applied", kept as the initial/no-op option.
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const catalogRef = useRef<HTMLDivElement>(null);

  const priceFloor = 0;
  const [, priceMax] = useMemo(() => priceRange(products), [products]);
  const priceCeiling = priceMax || 200000;

  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    fits: [],
    seasons: [],
    colors: [],
    categories: [],
    minPrice: priceFloor,
    maxPrice: priceCeiling,
    inStockOnly: false,
    onSaleOnly: false,
  });

  const showCategoryFilter = activeCategory === 'Все';

  // Products narrowed by everything OTHER than FilterState (active category chip, search
  // query) — the base set that the drawer's live match count and the size/color option
  // lists are computed against.
  const categoryAndSearchFiltered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && activeCategory !== 'Все' && p.category !== activeCategory) return false;
      if (search.trim() && !p.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [products, activeCategory, search]);

  // Available sizes/colors computed from the product set filtered by everything EXCEPT
  // the size/color filters themselves, so the lists stay contextually relevant without a
  // fully-faceted per-option-count system. Only sizes with real stock make the list.
  const facetBaseProducts = useMemo(() => {
    return categoryAndSearchFiltered.filter((p) => {
      if (filters.fits.length > 0 && !filters.fits.includes(p.fit)) return false;
      if (filters.seasons.length > 0 && (!p.season || !filters.seasons.includes(p.season))) return false;
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !isInStock(p)) return false;
      if (filters.onSaleOnly && !(p.oldPrice != null && p.oldPrice > p.price)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      return true;
    });
  }, [categoryAndSearchFiltered, filters]);

  const availableSizes = useMemo(() => {
    const seen = new Map<string, { label: string; category: Category }>();
    for (const p of facetBaseProducts) {
      for (const c of p.colors) {
        for (const s of c.sizes) {
          if (s.stock <= 0) continue;
          const label = s.sizeRu ?? s.sizeEu ?? s.sizeInt;
          if (!label) continue;
          seen.set(`${p.category}__${label}`, { label, category: p.category });
        }
      }
    }
    const list = [...seen.values()];
    const order = sortSizeLabels(list.map((s) => s.label));
    return list.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  }, [facetBaseProducts]);

  const availableColors = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    for (const p of facetBaseProducts) {
      for (const c of p.colors) {
        if (!seen.has(c.name)) seen.set(c.name, { name: c.name, hex: c.hex });
      }
    }
    return [...seen.values()];
  }, [facetBaseProducts]);

  const filteredProducts = useMemo(() => {
    const base = categoryAndSearchFiltered.filter((p) => matchesFilterState(p, filters));
    const sorted = [...base];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'discount': {
        const discountPct = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? (p.oldPrice - p.price) / p.oldPrice : -1);
        sorted.sort((a, b) => discountPct(b) - discountPct(a));
        break;
      }
      case 'popularity':
      default:
        // No-op: no real popularity signal in this app, keep the existing order.
        break;
    }
    return sorted;
  }, [categoryAndSearchFiltered, filters, sortBy]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaleClick = () => {
    setActiveCategory('Все');
    setFilters((f) => ({ ...f, onSaleOnly: true }));
    scrollToCatalog();
  };

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col bg-paper">
      <div className="sticky top-0 z-40">
        <Header
          settings={settings}
          products={products}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onSaleClick={handleSaleClick}
          search={search}
          onSearchChange={setSearch}
        />
        <CatalogToolbar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          filters={filters}
          priceFloor={priceFloor}
          priceCeiling={priceCeiling}
          onOpenFilterDrawer={() => setFiltersOpen(true)}
        />
      </div>

      <HeroBanner settings={settings} branches={branches} onShopClick={scrollToCatalog} />

      <main ref={catalogRef} className="mx-auto w-full max-w-7xl flex-1 scroll-mt-20 px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-graphite-500">{filteredProducts.length} товаров</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-sm border border-stone-300 px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-graphite-800"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {SORT_LABEL[opt]}
              </option>
            ))}
          </select>
        </div>
        <ProductGrid products={filteredProducts} onSelect={setSelectedProduct} />
      </main>

      <Footer settings={settings} />

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        priceFloor={priceFloor}
        priceCeiling={priceCeiling}
        availableSizes={availableSizes}
        availableColors={availableColors}
        showCategoryFilter={showCategoryFilter}
        products={categoryAndSearchFiltered}
      />

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
      <CartDrawer />
      <WishlistDrawer />
      <AccountDrawer />
      <CartToast />
      <FloatingCartBar />
    </div>
  );
}
