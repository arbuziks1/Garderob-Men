import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AtSign, Heart, MapPin, Menu, MessageCircle, Search, ShoppingBag, User, X } from 'lucide-react';
import type { Category } from '../../types';
import { CATEGORIES } from '../../types';
import type { StoreSettings } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { buildWhatsAppLink } from '../../utils/whatsapp';

interface HeaderProps {
  settings: StoreSettings;
  activeCategory: Category | 'Все' | null;
  onCategoryChange: (category: Category | 'Все' | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Header({
  settings,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
}: HeaderProps) {
  const { itemCount, openDrawer } = useCart();
  const { ids: wishlistIds, openDrawer: openWishlistDrawer } = useWishlist();
  const { openDrawer: openAccountDrawer } = useCustomerAuth();
  const { history, push: pushSearchHistory, clear: clearSearchHistory } = useSearchHistory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const categoryNavRef = useHorizontalScroll<HTMLElement>();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Record the query in "Вы недавно искали" once the person pauses typing, rather than on
  // every keystroke (which would fill the recent list with partial strings).
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!search.trim()) return;
    searchDebounceRef.current = setTimeout(() => pushSearchHistory(search), 800);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const supportLink = buildWhatsAppLink(settings.whatsappPhone, 'Здравствуйте! У меня вопрос по...');

  return (
    <header className="bg-graphite-950 text-paper shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          className="mr-1 rounded-md p-2 text-stone-300 hover:bg-graphite-800 lg:hidden"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a href="#top" className="shrink-0 whitespace-nowrap font-display text-xl tracking-[0.08em] sm:text-2xl">
          <span className="font-semibold">GARDEROB</span> <span className="font-normal text-stone-300">MEN</span>
        </a>

        <nav
          ref={categoryNavRef}
          className="no-scrollbar ml-6 hidden min-w-0 flex-1 cursor-grab items-center gap-4 overflow-x-auto xl:gap-6 lg:flex"
        >
          <button
            onClick={() => onCategoryChange('Все')}
            className={`whitespace-nowrap border-b py-1.5 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
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
              className={`whitespace-nowrap border-b py-1.5 text-xs font-medium uppercase tracking-[0.06em] transition-colors ${
                activeCategory === cat
                  ? 'border-paper text-paper'
                  : 'border-transparent text-stone-400 hover:text-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              placeholder="Поиск товаров..."
              className="w-40 rounded-sm border border-graphite-700 bg-graphite-900 py-1.5 pl-9 pr-3 text-sm text-paper placeholder:text-stone-500 focus:w-56 focus:border-stone-400 focus:outline-none transition-all md:w-56"
            />
            {showHistory && search.trim() === '' && history.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-sm border border-graphite-700 bg-graphite-900 py-1.5 text-stone-100 shadow-xl">
                <p className="px-3 pb-1 text-[10px] uppercase tracking-wide text-stone-500">Вы недавно искали</p>
                {history.map((q) => (
                  <button
                    key={q}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSearchChange(q);
                      setShowHistory(false);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-sm hover:bg-graphite-800"
                  >
                    {q}
                  </button>
                ))}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => clearSearchHistory()}
                  className="mt-1 block w-full border-t border-graphite-800 px-3 pt-1.5 text-left text-xs text-stone-400 hover:text-stone-100"
                >
                  Очистить
                </button>
              </div>
            )}
          </div>

          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2 text-stone-300 hover:bg-graphite-800 sm:block"
            aria-label="Instagram"
            title="Instagram"
          >
            <AtSign size={19} />
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
          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md p-2 text-stone-300 hover:bg-graphite-800 sm:block"
            aria-label="Поддержка в WhatsApp"
            title="Поддержка"
          >
            <MessageCircle size={19} />
          </a>

          <button
            onClick={openWishlistDrawer}
            className="relative rounded-md p-2 text-stone-300 hover:bg-graphite-800"
            aria-label="Избранное"
            title="Избранное"
          >
            <Heart size={20} />
            <AnimatePresence>
              {wishlistIds.length > 0 && (
                <motion.span
                  key={wishlistIds.length}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-paper px-1 text-[10px] font-bold text-graphite-950"
                >
                  {wishlistIds.length}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={openAccountDrawer}
            className="rounded-md p-2 text-stone-300 hover:bg-graphite-800"
            aria-label="Мои заказы"
            title="Мои заказы"
          >
            <User size={20} />
          </button>

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
              <AtSign size={16} /> Instagram
            </a>
            <a href={settings.twoGisUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-stone-300">
              <MapPin size={16} /> 2ГИС
            </a>
            <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-stone-300">
              <MessageCircle size={16} /> Поддержка
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
