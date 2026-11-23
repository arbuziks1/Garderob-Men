import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import StorefrontPage from './pages/StorefrontPage';
import AdminPage from './pages/AdminPage';
import OrderStatusPage from './pages/OrderStatusPage';
import OfferPage from './pages/legal/OfferPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DeliveryPage from './pages/legal/DeliveryPage';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/order/:id" element={<OrderStatusPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
