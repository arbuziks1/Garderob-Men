import type { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export default function ProductGrid({ products, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-lg text-graphite-700">Товары не найдены</p>
        <p className="mt-1 text-sm text-graphite-500">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    );
  }

  return (
    <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onSelect(product)} />
      ))}
    </div>
  );
}
