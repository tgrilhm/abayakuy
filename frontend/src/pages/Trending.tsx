import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../api";
import { Product } from "../types";

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[2/3] bg-stone-200 mb-4" />
      <div className="h-3 w-3/4 bg-stone-200 mb-2" />
      <div className="h-2 w-1/3 bg-stone-200" />
    </div>
  );
}

export default function Trending() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await api.getProducts({ pageName: 'trending' });
        setProducts(result.data ?? []);
      } catch (err) {
        console.error("Failed to fetch trending products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <main className="pt-32 min-h-screen bg-[#faf8f6]">
      {/* Header */}
      <section className="max-w-container-max mx-auto px-gutter pt-8 pb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-3">Curated Picks</p>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-on-background mb-4">Trending Now</h1>
          <p className="font-sans text-[13px] text-stone-500 leading-relaxed">
            The pieces everyone is reaching for right now.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-container-max mx-auto px-gutter pb-section-padding">
        <div className="flex justify-between items-center mb-8 border-b border-stone-200/60 pb-4">
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400">
            {products.length} Items
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                aspectRatio="2/3"
                isSmall
                imageSrc={
                  product.media && product.media.length > 0
                    ? product.media[0].url
                    : "https://via.placeholder.com/300x450"
                }
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-24 text-stone-400 font-sans text-sm">
              No trending products yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
