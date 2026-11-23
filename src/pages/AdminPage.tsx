import { useEffect, useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminLayout, { type AdminTab } from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import ProductsManager from '../components/admin/ProductsManager';
import OrdersManager from '../components/admin/OrdersManager';
import StoreSettingsManager from '../components/admin/StoreSettingsManager';
import { getAdminToken, onAdminUnauthorized } from '../services/api';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(getAdminToken()));
  const [tab, setTab] = useState<AdminTab>('dashboard');

  useEffect(() => onAdminUnauthorized(() => setAuthenticated(false)), []);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab}>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'products' && <ProductsManager />}
      {tab === 'orders' && <OrdersManager />}
      {tab === 'settings' && <StoreSettingsManager />}
    </AdminLayout>
  );
}
