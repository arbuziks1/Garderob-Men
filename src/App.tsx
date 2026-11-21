import { useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import StorefrontPage from './pages/StorefrontPage';
import AdminPage from './pages/AdminPage';

type Mode = 'storefront' | 'admin';

export default function App() {
  const [mode, setMode] = useState<Mode>('storefront');

  if (mode === 'admin') {
    return <AdminPage onExit={() => setMode('storefront')} />;
  }

  return (
    <CartProvider>
      <StorefrontPage onOpenAdmin={() => setMode('admin')} />
    </CartProvider>
  );
}
