import { useState } from 'react';
import { X } from 'lucide-react';
import type { Product, Size } from '../../types';
import { SIZES } from '../../types';
import { formatPrice } from '../../utils/format';
import { useCart } from '../../contexts/CartContext';
import SafeImage from '../shared/SafeImage';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<Size | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem, openDrawer } = useCart();

  const color = product.colors[colorIdx];
  const image = color.images[imgIdx] ?? color.images[0];

  const handleColorChange = (idx: number) => {
    setColorIdx(idx);
    setImgIdx(0);
    setSize(null);
    setAdded(false);
  };

  const stockForSize = size ? color.stock[size] : 0;
  const canAdd = size !== null && stockForSize > 0;

  const handleAdd = () => {
    if (!canAdd || !size) return;
    addItem({
      productId: product.id,
      title: product.title,
      image,
      colorId: color.id,
      colorName: color.name,
      size,
      price: product.price,
      quantity: 1,
      maxStock: stockForSize,
    });
    setAdded(true);
    setTimeout(() => openDrawer(), 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-t-2xl bg-white sm:flex-row sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-graphite-950 shadow sm:right-4 sm:top-4"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>

        <div className="sm:w-1/2">
          <div className="aspect-[4/5] w-full overflow-hidden bg-stone-100">
            <SafeImage src={image} alt={product.title} className="h-full w-full object-cover" />
          </div>
          {color.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {color.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIdx(idx)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 ${
                    idx === imgIdx ? 'border-graphite-950' : 'border-transparent'
                  }`}
                >
                  <SafeImage src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5 sm:w-1/2 sm:overflow-y-auto sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-graphite-500">{product.category}</p>
            <h2 className="font-display text-xl font-semibold text-graphite-950">{product.title}</h2>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-graphite-950">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-graphite-700">{product.description}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-sm bg-stone-100 px-2.5 py-1 font-medium uppercase tracking-wide text-graphite-700">
              Посадка: {product.fit}
            </span>
          </div>

          {product.modelNote && (
            <p className="rounded-lg bg-stone-100 px-3 py-2 text-xs text-graphite-600">{product.modelNote}</p>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">Цвет: {color.name}</p>
            <div className="flex gap-2">
              {product.colors.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => handleColorChange(idx)}
                  title={c.name}
                  className={`h-8 w-8 rounded-full border-2 ${
                    idx === colorIdx ? 'border-graphite-950' : 'border-stone-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">Размер</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const stockQty = color.stock[s];
                const outOfStock = stockQty === 0;
                return (
                  <button
                    key={s}
                    disabled={outOfStock}
                    onClick={() => {
                      setSize(s);
                      setAdded(false);
                    }}
                    className={`relative h-10 min-w-10 rounded-md border px-2 text-sm font-medium transition-colors ${
                      outOfStock
                        ? 'cursor-not-allowed border-stone-200 text-stone-300 line-through'
                        : size === s
                          ? 'border-graphite-950 bg-graphite-950 text-white'
                          : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {size && (
              <p className="mt-1.5 text-xs text-graphite-500">
                {stockForSize > 0 ? `В наличии: ${stockForSize} шт.` : 'Нет в наличии в этом размере'}
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`mt-2 rounded-sm py-3 text-center font-display text-sm uppercase tracking-[0.15em] transition-colors ${
              canAdd
                ? 'bg-ember text-paper hover:bg-ember-light'
                : 'cursor-not-allowed bg-stone-200 text-stone-400'
            }`}
          >
            {added ? 'Добавлено в корзину ✓' : 'Добавить в корзину'}
          </button>
        </div>
      </div>
    </div>
  );
}
