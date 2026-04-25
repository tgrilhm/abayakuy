/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Product } from './types';
import { StorefrontHeader, AdminSidebar } from './components/Navigation';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Login } from './pages/Login';
import { AdminProductList } from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './api';

const normalizeProduct = (product: Product): Product => ({
  ...product,
  kode: product.kode ?? 'Untitled',
  brand: product.brand ?? 'Unknown Brand',
  bahan: product.bahan ?? 'Not specified',
  ukuran: Array.isArray(product.ukuran) ? product.ukuran : [],
  warna: product.warna ?? 'Not specified',
  harga: typeof product.harga === 'number' ? product.harga : 0,
  media: Array.isArray(product.media) ? product.media : [],
});

export default function App() {
  const [view, setView] = useState<View>(api.isAuthenticated() ? 'storefront' : 'storefront');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Public storefront can show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'storefront' || view === 'admin') {
      fetchProducts();
    }
  }, [view, fetchProducts]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleLogin = async (username: string, password: string) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    setView('admin');
  };

  const handleLogout = () => {
    api.logout();
    setView('storefront');
  };

  const renderContent = () => {
    switch (view) {
      case 'storefront':
        return (
          <motion.div
            key="catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StorefrontHeader currentView={view} setView={setView} />
            <Catalog products={products} loading={loading} onProductClick={handleProductClick} />
          </motion.div>
        );
      case 'detail':
        return selectedProduct ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StorefrontHeader currentView={view} setView={setView} />
            <ProductDetail
              product={selectedProduct}
              onBack={() => setView('storefront')}
            />
          </motion.div>
        ) : null;
      case 'login':
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Login
              onLogin={handleLogin}
              onBack={() => setView('storefront')}
            />
          </motion.div>
        );
      case 'admin':
        return (
          <motion.div
            key="admin"
            className="flex min-h-screen bg-surface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminSidebar currentView={view} setView={setView} onLogout={handleLogout} />
            <AdminProductList
              products={products}
              loading={loading}
              onRefresh={fetchProducts}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
