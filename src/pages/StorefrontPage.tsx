import { useMemo, useRef, useState } from 'react';
import type { Category, Product } from '../types';
import { isInStock, priceRange } from '../types';
import { useProducts, useSettings } from '../hooks/useStore';
import Header from '../components/storefront/Header';
import HeroBanner from '../components/storefront/HeroBanner';
import CatalogFilters, { type FilterState } from '../components/storefront/CatalogFilters';
import ProductGrid from '../components/storefront/ProductGrid';
import ProductModal from '../components/storefront/ProductModal';
import CartDrawer from '../components/storefront/CartDrawer';
import Footer from '../components/storefront/Footer';

interface StorefrontPageProps {
  onOpenAdmin: () => void;
}

export default function StorefrontPage({ onOpenAdmin }: StorefrontPageProps) {
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
    maxPrice: priceMax || 200000,
    inStockOnly: false,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && activeCategory !== 'Все' && p.category !== activeCategory) return false;
      if (search.trim() && !p.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (filters.fits.length > 0 && !filters.fits.includes(p.fit)) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !isInStock(p)) return false;
      if (filters.sizes.length > 0) {
        const hasSize = p.colors.some((c) => filters.sizes.some((s) => c.stock[s] > 0));
        if (!hasSize) return false;
      }
      return true;
    });
  }, [products, activeCategory, search, filters]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header
        settings={settings}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        search={search}
        onSearchChange={setSearch}
        onOpenAdmin={onOpenAdmin}
      />
      <HeroBanner settings={settings} onShopClick={scrollToCatalog} />

      <main ref={catalogRef} className="mx-auto flex w-full max-w-7xl flex-1 scroll-mt-20 gap-6 px-4 py-8 sm:px-6">
        <CatalogFilters filters={filters} onChange={setFilters} priceCeiling={priceMax || 200000} />
        <ProductGrid products={filteredProducts} onSelect={setSelectedProduct} />
      </main>

      <Footer settings={settings} onOpenAdmin={onOpenAdmin} />

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <CartDrawer />
    </div>
  );
}
