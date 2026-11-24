import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import StorefrontPage from './pages/StorefrontPage';
import AdminPage from './pages/AdminPage';
import OrderStatusPage from './pages/OrderStatusPage';
import PaymentPage from './pages/PaymentPage';
import OfferPage from './pages/legal/OfferPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DeliveryPage from './pages/legal/DeliveryPage';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <CustomerAuthProvider>
            <Routes>
              <Route path="/" element={<StorefrontPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/order/:id" element={<OrderStatusPage />} />
              <Route path="/payment/:orderId" element={<PaymentPage />} />
              <Route path="/offer" element={<OfferPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
            </Routes>
          </CustomerAuthProvider>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
