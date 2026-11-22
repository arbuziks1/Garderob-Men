import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, MapPin, Menu, Search, ShoppingBag, X } from 'lucide-react';
import type { Category } from '../../types';
import { CATEGORIES } from '../../types';
import type { StoreSettings } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface HeaderProps {
  settings: StoreSettings;
  activeCategory: Category | 'Все' | null;
  onCategoryChange: (category: Category | 'Все' | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onOpenAdmin: () => void;
}

export default function Header({
  settings,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  onOpenAdmin,
}: HeaderProps) {
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-graphite-950 text-paper shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          className="mr-1 rounded-md p-2 text-stone-300 hover:bg-graphite-800 lg:hidden"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a href="#top" className="font-display text-xl tracking-[0.08em] sm:text-2xl">
          <span className="font-semibold">GARDEROB</span> <span className="font-normal text-stone-300">MEN</span>
        </a>

        <nav className="ml-8 hidden flex-1 items-center gap-6 lg:flex">
          <button
            onClick={() => onCategoryChange('Все')}
            className={`whitespace-nowrap border-b py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
              activeCategory === 'Все' || activeCategory === null
                ? 'border-paper text-paper'
                : 'border-transparent text-stone-400 hover:text-stone-100'
            }`}
          >
            Все товары
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap border-b py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                activeCategory === cat
                  ? 'border-paper text-paper'
                  : 'border-transparent text-stone-400 hover:text-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-40 rounded-sm border border-graphite-700 bg-graphite-900 py-1.5 pl-9 pr-3 text-sm text-paper placeholder:text-stone-500 focus:w-56 focus:border-stone-400 focus:outline-none transition-all md:w-56"
            />
          </div>

          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2 text-stone-300 hover:bg-graphite-800 sm:block"
            aria-label="Instagram"
            title="Instagram"
          >
            <Camera size={19} />
          </a>
          <a
            href={settings.twoGisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2 text-stone-300 hover:bg-graphite-800 sm:block"
            aria-label="2ГИС — как нас найти"
            title="Карта 2ГИС"
          >
            <MapPin size={19} />
          </a>

          <button
            onClick={openDrawer}
            className="relative rounded-md p-2 text-stone-300 hover:bg-graphite-800"
            aria-label="Корзина"
          >
            <ShoppingBag size={20} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-paper px-1 text-[10px] font-bold text-graphite-950"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={onOpenAdmin}
            className="hidden shrink-0 whitespace-nowrap rounded-sm border border-graphite-700 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-400 hover:border-stone-300 hover:text-stone-100 md:block"
          >
            Админ-панель
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск товаров..."
          className="w-full shrink-0 rounded-sm border border-graphite-700 bg-graphite-900 py-1.5 px-4 text-sm text-paper placeholder:text-stone-500 focus:border-stone-400 focus:outline-none sm:hidden"
        />
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-1 border-t border-graphite-800 px-4 py-3 lg:hidden">
          <button
            onClick={() => {
              onCategoryChange('Все');
              setMobileMenuOpen(false);
            }}
            className={`border-l-2 px-3 py-2 text-left text-sm font-medium uppercase tracking-wide ${
              activeCategory === 'Все' || activeCategory === null
                ? 'border-paper text-paper'
                : 'border-transparent text-stone-300'
            }`}
          >
            Все товары
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat);
                setMobileMenuOpen(false);
              }}
              className={`border-l-2 px-3 py-2 text-left text-sm font-medium uppercase tracking-wide ${
                activeCategory === cat ? 'border-paper text-paper' : 'border-transparent text-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="mt-2 flex gap-3 border-t border-graphite-800 pt-3">
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-stone-300">
              <Camera size={16} /> Instagram
            </a>
            <a href={settings.twoGisUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-stone-300">
              <MapPin size={16} /> 2ГИС
            </a>
          </div>
          <button
            onClick={onOpenAdmin}
            className="mt-2 rounded-md border border-graphite-700 px-3 py-2 text-left text-xs font-medium text-stone-400"
          >
            Админ-панель
          </button>
        </div>
      )}
    </header>
  );
}
