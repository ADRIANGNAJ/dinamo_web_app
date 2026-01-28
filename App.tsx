import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { CartProvider } from './store/CartContext';
import { AdminAuthProvider } from './store/AdminAuth';
import { initStorage } from './services/storage';

// Pages
import MenuPage from './pages/customer/MenuPage';
import ProductPage from './pages/customer/ProductPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import TrackingPage from './pages/customer/TrackingPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminExtrasPage from './pages/admin/AdminExtrasPage';
import AdminHistoryPage from './pages/admin/AdminHistoryPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const App: React.FC = () => {
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <HashRouter>
      <AdminAuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/menu" replace />} />

              {/* Customer Routes */}
              <Route path="menu" element={<MenuPage />} />
              <Route path="product/:id" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="tracking" element={<TrackingPage />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
              <Route path="order/:orderCode" element={<OrderDetailPage />} />
              <Route path="order-success/:orderCode" element={<OrderSuccessPage />} />

              {/* Admin Routes */}
              <Route path="admin/login" element={<AdminLoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="admin/products" element={<AdminProductsPage />} />
                <Route path="admin/extras" element={<AdminExtrasPage />} />
                <Route path="admin/history" element={<AdminHistoryPage />} />
                <Route path="admin/settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/menu" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AdminAuthProvider>
    </HashRouter>
  );
};

export default App;