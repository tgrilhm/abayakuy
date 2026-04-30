import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductList } from "./AdminDashboard";
import { api } from "../api";
import { Product, Media } from "../types";

const normalizeProduct = (product: Product): Product => ({
  ...product,
  kode: product.kode ?? 'Untitled',
  nama: product.nama ?? null,
  brand: product.brand ?? 'Unknown Brand',
  link: product.link ?? null,
  bahan: product.bahan ?? null,
  ukuran: Array.isArray(product.ukuran) ? product.ukuran : [],
  warna: Array.isArray(product.warna) ? product.warna : [],
  harga: typeof product.harga === 'number' ? product.harga : 0,
  kategori: product.kategori ?? null,
  deskripsi: product.deskripsi ?? null,
  isTrending: product.isTrending ?? false,
  isSale: product.isSale ?? false,
  isHeroFeatured: product.isHeroFeatured ?? false,
  isVisible: product.isVisible ?? true,
  media: Array.isArray(product.media) ? product.media : [],
});

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingCount, setProcessingCount] = useState(0);
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getProducts({ limit: 100 });
      const normalizedProducts = (result.data ?? []).map(normalizeProduct);
      setProducts(normalizedProducts);
      setProcessingCount(
        normalizedProducts.reduce(
          (count, product) => count + (product.media?.filter((media) => media.status === 'processing').length ?? 0),
          0
        )
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

  useEffect(() => {
    if (processingCount === 0) return;

    let isActive = true;

    const interval = setInterval(async () => {
      if (!isActive || polling) return;

      const processingProducts = products.filter((product) =>
        (product.media ?? []).some((media) => media.status === 'processing')
      );

      if (processingProducts.length === 0) return;

      setPolling(true);
      try {
        const statusResults = await Promise.all(
          processingProducts.map((product) => api.getMediaStatus(product.id))
        );

        if (!isActive) return;

        const nextStatuses = new Map<string, Media[]>();
        statusResults.forEach((statusList, index) => {
          nextStatuses.set(processingProducts[index].id, statusList);
        });

        let nextProcessingCount = 0;
        let shouldRefreshProducts = false;

        setProducts((prev) =>
          prev.map((product) => {
            const statusList = nextStatuses.get(product.id);
            if (!statusList) {
              nextProcessingCount += (product.media ?? []).filter((media) => media.status === 'processing').length;
              return product;
            }

            const mergedMedia = (product.media ?? []).map((media) => {
              const latest = statusList.find((item) => item.id === media.id);
              return latest ? { ...media, status: latest.status, url: latest.url, type: latest.type } : media;
            });

            const mergedProcessingCount = mergedMedia.filter((media) => media.status === 'processing').length;
            nextProcessingCount += mergedProcessingCount;

            if ((product.media ?? []).some((media) => media.status === 'processing') && mergedProcessingCount === 0) {
              shouldRefreshProducts = true;
            }

            if ((product.media ?? []).some((media) => media.status === 'processing') && mergedMedia.some((media) => media.status === 'failed')) {
              shouldRefreshProducts = true;
            }

            return {
              ...product,
              media: mergedMedia,
            };
          })
        );

        setProcessingCount(nextProcessingCount);

        if (shouldRefreshProducts) {
          await fetchProducts();
        }
      } catch (err) {
        console.error('Failed to poll media status:', err);
      } finally {
        if (isActive) {
          setPolling(false);
        }
      }
    }, 3000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [fetchProducts, polling, processingCount, products]);

  const handleLogout = () => {
    api.logout();
    navigate("/admin");
  };

  return (
    <div className="pt-24 min-h-screen bg-surface flex flex-col">
      <div className="bg-surface-lowest border-b border-surface-high p-4 flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Admin Dashboard</h1>
          {processingCount > 0 && (
            <p className="mt-1 font-sans text-[11px] tracking-[0.08em] uppercase text-amber-700">
              {processingCount} media file{processingCount > 1 ? 's are' : ' is'} still processing
            </p>
          )}
        </div>
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
