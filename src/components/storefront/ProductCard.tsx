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
      className="group flex flex-col overflow-hidden rounded-sm border border-stone-200 bg-white text-left transition-all duration-300 hover:border-graphite-300 hover:shadow-xl hover:shadow-graphite-950/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <SafeImage
          src={cover}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.oldPrice && (
          <span className="absolute left-0 top-3 bg-graphite-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ember-light">
            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
        {!inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-graphite-950/90 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-stone-200">
            Нет в наличии
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="text-[11px] uppercase tracking-wider text-graphite-500">{product.category}</p>
        <p className="font-display text-sm font-medium leading-tight text-graphite-950 sm:text-base">
          {product.title}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <span className="font-semibold text-graphite-950">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </button>
  );
}
