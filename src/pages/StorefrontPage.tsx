import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Category, Product } from '../types';
import { isInStock, priceRange } from '../types';
import { sortSizeLabels } from '../data/sizeGrids';
import { useProducts, useSettings } from '../hooks/useStore';
import Header from '../components/storefront/Header';
import HeroBanner from '../components/storefront/HeroBanner';
import CatalogFilters, { type FilterState } from '../components/storefront/CatalogFilters';
import MobileCategoryBar from '../components/storefront/MobileCategoryBar';
import ProductGrid from '../components/storefront/ProductGrid';
import ProductModal from '../components/storefront/ProductModal';
import CartDrawer from '../components/storefront/CartDrawer';
import CartToast from '../components/storefront/CartToast';
import Footer from '../components/storefront/Footer';

export default function StorefrontPage() {
  const [products] = useProducts();
  const [settings] = useSettings();
  const [activeCategory, setActiveCategory] = useState<Category | 'Все' | null>('Все');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const [, priceMax] = useMemo(() => priceRange(products), [products]);
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    fits: [],
    seasons: [],
    sizeFits: [],
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
      if (filters.sizeFits.length > 0 && (!p.sizeFit || !filters.sizeFits.includes(p.sizeFit))) return false;
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
          onFiltersChange={setFilters}
          priceCeiling={priceMax || 200000}
          availableSizes={availableSizes}
        />
      </div>

      <HeroBanner settings={settings} onShopClick={scrollToCatalog} />

      <main
        ref={catalogRef}
        className="mx-auto flex w-full max-w-7xl flex-1 scroll-mt-20 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row"
      >
        <CatalogFilters
          filters={filters}
          onChange={setFilters}
          priceCeiling={priceMax || 200000}
          availableSizes={availableSizes}
        />
        <ProductGrid products={filteredProducts} onSelect={setSelectedProduct} />
      </main>

      <Footer settings={settings} />

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
      <CartDrawer />
      <CartToast />
    </div>
  );
}
