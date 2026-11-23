import { motion } from 'framer-motion';
import type { Product } from '../../types';
import { isInStock } from '../../types';
import { sortSizeLabels } from '../../data/sizeGrids';
import { formatPrice } from '../../utils/format';
import { EASE } from '../../utils/motion';
import SafeImage from '../shared/SafeImage';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

/** In-stock size labels for the two rows shown on the card: the primary row (INT letter
 *  grid, falling back to RU/EU when a product has no INT labels at all — jeans/shoes/caps)
 *  and, only when the product actually has a distinct RU grid alongside it (jackets, suits,
 *  shirts), a second row of RU numbers. Sizes with zero stock everywhere are left out
 *  entirely rather than shown struck-through. */
function sizeBadges(product: Product): { primary: string[]; ru: string[] } {
  const primaryLabels = new Set<string>();
  const ruLabels = new Set<string>();
  for (const color of product.colors) {
    for (const s of color.sizes) {
      if (s.stock <= 0) continue;
      const primary = s.sizeInt ?? s.sizeRu ?? s.sizeEu;
      if (primary) primaryLabels.add(primary);
      if (s.sizeRu) ruLabels.add(s.sizeRu);
    }
  }
  return { primary: sortSizeLabels([...primaryLabels]), ru: sortSizeLabels([...ruLabels]) };
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const cover = product.colors[0]?.images[0];
  const secondary = product.colors[0]?.images[1];
  const inStock = isInStock(product);
  const badges = sizeBadges(product);

  return (
    <motion.button
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="group flex flex-col overflow-hidden rounded-sm border border-stone-200 bg-white text-left transition-colors duration-300 hover:border-graphite-400"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="h-full w-full"
        >
          <SafeImage src={cover} alt={product.title} className="h-full w-full object-cover" />
        </motion.div>
        {secondary && (
          <SafeImage
            src={secondary}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {product.oldPrice && (
          <span className="absolute left-3 top-3 text-[11px] font-semibold uppercase tracking-wide text-graphite-950">
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">{product.category}</p>
        <p className="font-display text-sm font-medium leading-tight tracking-tight text-graphite-950 sm:text-base">
          {product.title}
        </p>

        <div className="flex flex-col gap-1 pt-0.5">
          {badges.primary.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-wide">
              {badges.primary.map((label) => (
                <span key={label} className="text-graphite-600">
                  {label}
                </span>
              ))}
            </div>
          )}
          {badges.ru.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-wide">
              <span className="text-stone-400">RU</span>
              {badges.ru.map((label) => (
                <span key={label} className="text-graphite-600">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-1.5 tabular-nums">
          <span className="font-semibold text-graphite-950">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {!inStock && (
          <p className="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-stone-400">Нет в наличии</p>
        )}
      </div>
    </motion.button>
  );
}
