import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import type { Product, SizeStock } from '../../types';
import { SIZE_FIT_LABEL } from '../../types';
import { combinedSizeLabel } from '../../data/sizeGrids';
import { shortMeasurementLabel } from '../../data/measurements';
import { formatPrice } from '../../utils/format';
import { EASE } from '../../utils/motion';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import SafeImage from '../shared/SafeImage';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

type Grid = 'ru' | 'eu' | 'int';

const GRID_LABEL: Record<Grid, string> = { ru: 'RU', eu: 'EU', int: 'INT' };

function gridValue(row: SizeStock, grid: Grid): string | undefined {
  if (grid === 'ru') return row.sizeRu;
  if (grid === 'eu') return row.sizeEu;
  return row.sizeInt;
}

function availableGrids(sizes: SizeStock[]): Grid[] {
  return (['ru', 'eu', 'int'] as Grid[]).filter((g) => sizes.some((s) => gridValue(s, g)?.trim()));
}

function labelFor(row: SizeStock, grid: Grid): string {
  return gridValue(row, grid)?.trim() || row.sizeRu || row.sizeEu || row.sizeInt || '';
}

/** Distinct size-label columns that actually have at least one measurement filled in,
 *  in the order the rows were entered (stable, no re-sort needed — the admin table
 *  already orders them left to right the way it was filled). */
function measurementColumns(product: Product): string[] {
  if (!product.measurements?.rows?.length) return [];
  const set = new Set<string>();
  for (const row of product.measurements.rows) {
    for (const label of Object.keys(product.measurements.values[row] ?? {})) set.add(label);
  }
  return [...set];
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const color = product.colors[colorIdx];
  const image = color.images[imgIdx] ?? color.images[0];

  const grids = useMemo(() => availableGrids(color.sizes), [color]);
  const activeGrid: Grid | null = grid && grids.includes(grid) ? grid : (grids[0] ?? null);

  const inStockSizes = color.sizes.filter((s) => s.stock > 0);
  const allOutOfStock = inStockSizes.length === 0;

  // If every in-stock size of this color only has stock at one branch, surface that fact
  // once up front — useful without needing to pick a size first.
  const singleBranchOnlyName = useMemo(() => {
    const stockedBranchIds = new Set<string>();
    const nameById = new Map<string, string>();
    for (const s of color.sizes) {
      for (const bs of s.branchStocks) {
        if (bs.stock > 0) {
          stockedBranchIds.add(bs.branchId);
          nameById.set(bs.branchId, bs.branchName);
        }
      }
    }
    if (stockedBranchIds.size === 1) {
      return nameById.get([...stockedBranchIds][0]) ?? null;
    }
    return null;
  }, [color]);

  const selectedRow = color.sizes.find((s) => s.id === selectedSizeId) ?? null;
  const canAdd = selectedRow !== null && selectedRow.stock > 0;

  const selectedSizeMeasurementLine = useMemo(() => {
    if (!selectedRow || !product.measurements?.rows?.length) return null;
    const sizeLabel = combinedSizeLabel(selectedRow);
    const parts = product.measurements.rows
      .map((rowLabel) => {
        const cm = product.measurements!.values[rowLabel]?.[sizeLabel];
        return cm !== undefined ? `${shortMeasurementLabel(rowLabel)} ${cm} см` : null;
      })
      .filter((p): p is string => p !== null);
    if (parts.length === 0) return null;
    return `${sizeLabel}: ${parts.join(' · ')}`;
  }, [selectedRow, product.measurements]);

  const handleColorChange = (idx: number) => {
    setColorIdx(idx);
    setImgIdx(0);
    setGrid(null);
    setSelectedSizeId(null);
    setAdded(false);
  };

  const handleSelectSize = (row: SizeStock) => {
    setSelectedSizeId(row.id);
    setAdded(false);
  };

  const handleAdd = () => {
    if (!canAdd || !selectedRow || !activeGrid) return;
    addItem({
      productId: product.id,
      title: product.title,
      image,
      colorId: color.id,
      colorName: color.name,
      sizeStockId: selectedRow.id,
      sizeLabel: labelFor(selectedRow, activeGrid),
      price: product.price,
      quantity: 1,
      maxStock: selectedRow.stock,
    });
    setAdded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-t-sm bg-white sm:flex-row sm:rounded-sm"
      >
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-graphite-500">{product.category}</p>
                <h2 className="font-display text-xl font-semibold text-graphite-950">{product.title}</h2>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Убрать из избранного' : 'Добавить в избранное'}
                className="shrink-0 rounded-full p-1.5 text-graphite-700 hover:bg-stone-100"
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} className={wishlisted ? 'text-ember' : ''} />
              </button>
            </div>
            <p className="mt-0.5 text-xs text-graphite-400">Артикул: {product.sku}</p>
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

          {(product.brand || product.countryOfOrigin || product.season || product.material || product.composition ||
            (product.characteristics && Object.keys(product.characteristics).length > 0)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">Характеристики</p>
              <dl className="flex flex-col divide-y divide-stone-100 rounded-lg border border-stone-100 text-sm">
                {product.brand && <CharacteristicRow label="Бренд" value={product.brand} />}
                {product.countryOfOrigin && <CharacteristicRow label="Страна производства" value={product.countryOfOrigin} />}
                {product.season && <CharacteristicRow label="Сезон" value={product.season} />}
                {product.material && <CharacteristicRow label="Материал" value={product.material} />}
                {product.composition && <CharacteristicRow label="Состав" value={product.composition} />}
                {product.characteristics &&
                  Object.entries(product.characteristics).map(([label, value]) => (
                    <CharacteristicRow key={label} label={label} value={value} />
                  ))}
              </dl>
            </div>
          )}

          {measurementColumns(product).length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-600">Замеры, см</p>
              <div className="overflow-x-auto rounded-lg border border-stone-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      <th className="px-2.5 py-1.5 text-left text-xs font-medium text-graphite-500" />
                      {measurementColumns(product).map((label) => (
                        <th key={label} className="px-2 py-1.5 text-center text-xs font-medium text-graphite-500">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.measurements!.rows.map((rowLabel) => (
                      <tr key={rowLabel} className="border-b border-stone-50 last:border-0">
                        <td className="px-2.5 py-1 text-graphite-500">{rowLabel}</td>
                        {measurementColumns(product).map((label) => (
                          <td key={label} className="px-2 py-1 text-center font-medium text-graphite-800">
                            {product.measurements!.values[rowLabel]?.[label] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

          {allOutOfStock ? (
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm font-medium text-graphite-500">
              Нет в наличии
            </div>
          ) : (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-graphite-600">Размер</p>
                  {grids.length > 1 && (
                    <div className="flex gap-1 rounded-full bg-stone-100 p-0.5">
                      {grids.map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setGrid(g);
                            setSelectedSizeId(null);
                            setAdded(false);
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                            activeGrid === g ? 'bg-graphite-950 text-white' : 'text-graphite-600 hover:text-graphite-950'
                          }`}
                        >
                          {GRID_LABEL[g]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {inStockSizes.map((row) => {
                    const isSelected = selectedSizeId === row.id;
                    const label = activeGrid ? labelFor(row, activeGrid) : row.sizeRu ?? row.sizeEu ?? row.sizeInt;
                    return (
                      <button
                        key={row.id}
                        onClick={() => handleSelectSize(row)}
                        className={`relative h-10 min-w-10 rounded-md border px-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-graphite-950 bg-graphite-950 text-white'
                            : 'border-stone-300 text-graphite-800 hover:border-graphite-600'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {selectedRow && selectedSizeMeasurementLine && (
                  <p className="mt-1.5 text-xs text-graphite-500">{selectedSizeMeasurementLine}</p>
                )}
                {selectedRow && (
                  <p className="mt-1 text-xs text-graphite-500">В наличии: {selectedRow.stock} шт.</p>
                )}
                {selectedRow && selectedRow.branchStocks.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-graphite-500">
                      Наличие в магазинах
                    </p>
                    <ul className="flex flex-col gap-0.5 text-xs text-graphite-600">
                      {selectedRow.branchStocks.map((bs) => (
                        <li key={bs.branchId}>
                          {bs.branchName} —{' '}
                          {bs.stock > 0 ? (
                            <span className="text-graphite-800">В наличии ({bs.stock} шт.)</span>
                          ) : (
                            <span className="text-stone-400">Нет в наличии</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {product.sizeFit && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  {SIZE_FIT_LABEL[product.sizeFit]}
                </div>
              )}

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
              {singleBranchOnlyName && (
                <p className="text-center text-xs text-graphite-500">
                  Эта модель есть только в «{singleBranchOnlyName}»
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CharacteristicRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2">
      <dt className="text-graphite-500">{label}</dt>
      <dd className="text-right font-medium text-graphite-800">{value}</dd>
    </div>
  );
}
