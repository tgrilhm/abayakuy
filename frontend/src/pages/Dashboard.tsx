import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductList } from "./AdminDashboard";
import { api } from "../api";
import { Product } from "../types";

const normalizeProduct = (product: Product): Product => ({
  ...product,
  kode: product.kode ?? 'Untitled',
  nama: product.nama ?? null,
  brand: product.brand ?? 'Unknown Brand',
  bahan: product.bahan ?? 'Not specified',
  ukuran: Array.isArray(product.ukuran) ? product.ukuran : [],
  warna: product.warna ?? 'Not specified',
  harga: typeof product.harga === 'number' ? product.harga : 0,
  kategori: product.kategori ?? null,
  deskripsi: product.deskripsi ?? null,
  stok: typeof product.stok === 'number' ? product.stok : null,
  media: Array.isArray(product.media) ? product.media : [],
});

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getProducts({ limit: 100 });
      setProducts(
        (result.data ?? []).map(normalizeProduct)
      );
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (err instanceof Error && err.message === 'Unauthorized') {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/admin");
      return;
    }
    fetchProducts();
  }, [fetchProducts, navigate]);

  const handleLogout = () => {
    api.logout();
    navigate("/admin");
  };

  return (
    <div className="pt-24 min-h-screen bg-surface flex flex-col">
      <div className="bg-surface-lowest border-b border-surface-high p-4 flex justify-between items-center">
        <h1 className="font-headline-md text-headline-md text-on-background">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-error text-on-error px-4 py-2 text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          Logout
        </button>
      </div>
      <AdminProductList products={products} loading={loading} onRefresh={fetchProducts} />
    </div>
  );
}
