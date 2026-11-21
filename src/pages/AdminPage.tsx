import { useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminLayout, { type AdminTab } from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import ProductsManager from '../components/admin/ProductsManager';
import OrdersManager from '../components/admin/OrdersManager';
import StoreSettingsManager from '../components/admin/StoreSettingsManager';

interface AdminPageProps {
  onExit: () => void;
}

export default function AdminPage({ onExit }: AdminPageProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<AdminTab>('dashboard');

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} onBack={onExit} />;
  }

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab} onExit={onExit}>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'products' && <ProductsManager />}
      {tab === 'orders' && <OrdersManager />}
      {tab === 'settings' && <StoreSettingsManager />}
    </AdminLayout>
  );
}
