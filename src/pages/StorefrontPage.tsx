import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Category, Product } from '../types';
import { isInStock, priceRange } from '../types';
import { sortSizeLabels } from '../data/sizeGrids';
import { useProducts, useSettings } from '../hooks/useStore';
import Header from '../components/storefront/Header';
import HeroBanner from '../components/storefront/HeroBanner';
import FiltersBar from '../components/storefront/FiltersBar';
import FilterSheet from '../components/storefront/FilterSheet';
import type { FilterState } from '../components/storefront/FilterControls';
import MobileCategoryBar from '../components/storefront/MobileCategoryBar';
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
  const [activeCategory, setActiveCategory] = useState<Category | 'Все' | null>('Все');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  const [, priceMax] = useMemo(() => priceRange(products), [products]);
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    fits: [],
    seasons: [],
    maxPrice: priceMax || 200000,
    inStockOnly: false,
  });

  const availableSizes = useMemo(() => {
    const labels = new Set<string>();
    for (const p of products) {
      for (const c of p.colors) {
        for (const s of c.sizes) {
          const label = s.sizeRu ?? s.sizeEu ?? s.sizeInt;
          if (label) labels.add(label);
        }
      }
    }
    return sortSizeLabels([...labels]);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && activeCategory !== 'Все' && p.category !== activeCategory) return false;
      if (search.trim() && !p.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (filters.fits.length > 0 && !filters.fits.includes(p.fit)) return false;
      if (filters.seasons.length > 0 && (!p.season || !filters.seasons.includes(p.season))) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !isInStock(p)) return false;
      if (filters.sizes.length > 0) {
        const hasSize = p.colors.some((c) =>
          c.sizes.some(
            (s) =>
              s.stock > 0 &&
              ((s.sizeRu && filters.sizes.includes(s.sizeRu)) ||
                (s.sizeEu && filters.sizes.includes(s.sizeEu)) ||
                (s.sizeInt && filters.sizes.includes(s.sizeInt)))
          )
        );
        if (!hasSize) return false;
      }
      return true;
    });
  }, [products, activeCategory, search, filters]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col bg-paper">
      <div className="sticky top-0 z-40">
        <Header
          settings={settings}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          search={search}
          onSearchChange={setSearch}
        />
        <MobileCategoryBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          filters={filters}
          priceCeiling={priceMax || 200000}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>

      <HeroBanner settings={settings} onShopClick={scrollToCatalog} />

      <main ref={catalogRef} className="mx-auto w-full max-w-7xl flex-1 scroll-mt-20 px-4 py-8 sm:px-6">
        <FiltersBar
          filters={filters}
          priceCeiling={priceMax || 200000}
          resultCount={filteredProducts.length}
          onOpenFilters={() => setFiltersOpen(true)}
        />
        <ProductGrid products={filteredProducts} onSelect={setSelectedProduct} />
      </main>

      <Footer settings={settings} />

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        priceCeiling={priceMax || 200000}
        availableSizes={availableSizes}
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
