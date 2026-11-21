import { useState, type ReactNode } from 'react';
import { LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Store, X } from 'lucide-react';

export type AdminTab = 'dashboard' | 'products' | 'orders' | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExit: () => void;
  children: ReactNode;
}

const TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'products', label: 'Товары', icon: Package },
  { id: 'orders', label: 'Заказы', icon: ShoppingCart },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function AdminLayout({ activeTab, onTabChange, onExit, children }: AdminLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => {
            onTabChange(id);
            setMobileNavOpen(false);
          }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === id ? 'bg-graphite-950 text-white' : 'text-graphite-700 hover:bg-stone-100'
          }`}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-5">
          <Store size={20} className="text-ember" />
          <span className="font-display text-sm font-bold tracking-wide text-graphite-950">GARDEROB ADMIN</span>
        </div>
        {nav}
        <button
          onClick={onExit}
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-graphite-500 hover:bg-stone-100"
        >
          <LogOut size={17} />
          Выйти в магазин
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileNavOpen(true)} aria-label="Меню">
            <Menu size={22} />
          </button>
          <span className="font-display text-sm font-bold tracking-wide text-graphite-950">GARDEROB ADMIN</span>
          <button onClick={onExit} aria-label="Выйти">
            <LogOut size={20} />
          </button>
        </header>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
            <div className="relative flex h-full w-64 flex-col bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
                <span className="font-display text-sm font-bold text-graphite-950">GARDEROB ADMIN</span>
                <button onClick={() => setMobileNavOpen(false)} aria-label="Закрыть">
                  <X size={20} />
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
