import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Product } from '../../types';
import { isInStock, totalStock } from '../../types';
import { useProducts } from '../../hooks/useStore';
import { api } from '../../services/api';
import SafeImage from '../shared/SafeImage';
import ProductForm from './ProductForm';

export default function ProductsManager() {
  const [products, refresh] = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (product: Product) => {
    if (!confirm(`Удалить товар «${product.title}»?`)) return;
    try {
      await api.deleteProduct(product.id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить товар.');
    }
  };

  const handlePriceChange = async (product: Product, price: number) => {
    try {
      await api.updateProduct(product.id, { ...product, price });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить цену.');
    }
  };

  const toggleStock = async (product: Product) => {
    const inStock = isInStock(product);
    const updated: Product = {
      ...product,
      colors: product.colors.map((c) => ({
        ...c,
        stock: inStock
          ? { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
          : { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
      })),
    };
    try {
      await api.updateProduct(product.id, updated);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить наличие.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-950">Управление товарами</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-full bg-graphite-950 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800"
        >
          <Plus size={16} />
          Добавить товар
        </button>
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Остаток</th>
                <th className="px-4 py-3 font-medium">Наличие</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
                      <SafeImage
                        src={product.colors[0]?.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-graphite-950">{product.title}</span>
                  </td>
                  <td className="px-4 py-3 text-graphite-600">{product.category}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handlePriceChange(product, Number(e.target.value))}
                      className="w-24 rounded-md border border-stone-300 px-2 py-1 text-sm focus:border-graphite-950 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-graphite-600">{totalStock(product)} шт.</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStock(product)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isInStock(product) ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isInStock(product) ? 'В наличии' : 'Нет в наличии'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(product)}
                        className="rounded-md p-1.5 text-graphite-500 hover:bg-stone-100"
                        aria-label="Редактировать"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="rounded-md p-1.5 text-ember hover:bg-stone-100"
                        aria-label="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || isCreating) && (
        <ProductForm
          product={editing}
          onSaved={refresh}
          onClose={() => {
            setEditing(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}
