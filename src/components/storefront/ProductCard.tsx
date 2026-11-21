import type { Product } from '../../types';
import { isInStock } from '../../types';
import { formatPrice } from '../../utils/format';
import SafeImage from '../shared/SafeImage';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const cover = product.colors[0]?.images[0];
  const inStock = isInStock(product);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white text-left transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <SafeImage
          src={cover}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.oldPrice && (
          <span className="absolute left-2 top-2 rounded-full bg-ember px-2 py-0.5 text-xs font-bold text-white">
            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
        {!inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-graphite-950/85 py-1.5 text-center text-xs font-medium text-white">
            Нет в наличии
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs uppercase tracking-wide text-graphite-500">{product.category}</p>
        <p className="font-display text-sm font-medium leading-tight text-graphite-950 sm:text-base">
          {product.title}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-semibold text-graphite-950">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </button>
  );
}
