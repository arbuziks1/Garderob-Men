import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import type { Product } from '../../types';
import { useWishlist } from '../../contexts/WishlistContext';
import { useProducts } from '../../hooks/useStore';
import { formatPrice } from '../../utils/format';
import { EASE } from '../../utils/motion';
import SafeImage from '../shared/SafeImage';
import ProductModal from './ProductModal';

export default function WishlistDrawer() {
  const { ids, isDrawerOpen, closeDrawer, toggle } = useWishlist();
  const [products] = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  const handleClose = () => {
    closeDrawer();
  };

  return (
    <>
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute inset-0 bg-black/50"
              onClick={handleClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative flex h-full w-full max-w-md flex-col bg-white"
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-graphite-950">
                  Избранное ({wishlistProducts.length})
                </h2>
                <button onClick={handleClose} aria-label="Закрыть">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {wishlistProducts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-graphite-500">
                    <Heart size={36} className="mb-3 text-stone-300" />
                    <p>В избранном пока нет товаров</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {wishlistProducts.map((product) => {
                      const cover = product.colors[0]?.images[0];
                      return (
                        <div key={product.id} className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                              <SafeImage src={cover} alt={product.title} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <p className="text-sm font-medium text-graphite-950">{product.title}</p>
                              <p className="text-sm font-semibold text-graphite-950">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => toggle(product.id)}
                            className="shrink-0 text-stone-400 hover:text-ember"
                            aria-label="Убрать из избранного"
                          >
                            <Heart size={18} fill="currentColor" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </>
  );
}
