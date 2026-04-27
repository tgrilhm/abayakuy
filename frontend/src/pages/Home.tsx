import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../api";
import { Product } from "../types";

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="animate-fade-in">
      <div className={`w-full ${tall ? "aspect-[3/4]" : "aspect-[2/3]"} skeleton mb-4`} />
      <div className="h-3 w-3/4 skeleton mb-2" />
      <div className="h-2 w-1/3 skeleton" />
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await api.getProducts();
        setProducts(Array.isArray(result) ? result : result.data ?? []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const newArrivals = products.slice(0, 3);
  const catalog = products;

  return (
    <main className="pt-28">
      {/* ─── Hero Section ─── */}
      <section className="max-w-container-max mx-auto px-gutter pt-6 pb-section-padding animate-reveal">
        <div className="relative w-full h-[80vh] min-h-[520px] max-h-[860px] bg-surface-container overflow-hidden group grain-overlay">
          <img
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[2.5s] ease-out"
            alt="Editorial high-fashion shot of a woman in a flowing minimalist beige abaya"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3pKYuUdiTaPjYba7P1vbmlaBVJdBTtDBB_KtLhGNVIAvi8s5WwEvc0xV0MuLcZtHXiBSbmDjDpR6JCIvsIXtgeeN-5kYehXnAra4WgIU4LwGoT-bxSMDyU7zfVcRwAgwS8AWkaoN4hyTwdBDtN0Yf0PSSwekvo9LoUnXcwILSpjCPkCJ8kSacs9TuVFY0KXrB81Xby-QPjCLHBdk6KpUHc_6mc6xPIqShpBW7wUlSxuWYErYNlgXBSIPfuM6FIy_or7rGLgGj8jI"
          />
          {/* Layered gradient — stronger at bottom-left for editorial text legibility */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/15 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>

          {/* Left-aligned editorial text */}
          <div className="absolute bottom-14 left-10 md:left-16 flex flex-col items-start z-10 max-w-lg">
            <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/60 mb-5 animate-reveal-delay-1">
              New Season — 2024
            </p>
            <h1 className="font-serif text-[clamp(2.2rem,5.5vw,4rem)] text-white mb-3 tracking-tight leading-[1.05] animate-reveal-delay-2">
              The Modern<br />Silhouette
            </h1>
            <p className="font-sans text-[12px] text-white/55 mb-8 leading-relaxed tracking-wide animate-reveal-delay-2 max-w-xs">
              Refined modest wear for the woman who moves with intention.
            </p>
            <button className="btn-primary animate-reveal-delay-3">
              Explore Collection
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-2 animate-reveal-delay-3">
            <div className="w-px h-10 bg-white/30 scroll-line"></div>
            <span className="font-sans text-[8px] tracking-[0.35em] uppercase text-white/40 mt-1">Scroll</span>
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ─── */}
      <section className="max-w-container-max mx-auto px-gutter pb-section-padding animate-reveal-delay-2">
        <div className="flex justify-between items-end mb-12 pb-4 border-b border-stone-200/60">
          <div className="flex items-baseline gap-4">
            <span className="font-sans text-[9px] tracking-[0.3em] text-stone-300 uppercase select-none">01</span>
            <h2 className="font-serif text-[clamp(1.4rem,3vw,2rem)] text-on-background">New Arrivals</h2>
          </div>
          <a
            className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 hover:text-black transition-colors duration-300 flex items-center gap-1.5 group"
            href="/collections"
          >
            Discover
            <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform duration-300">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <>
              <SkeletonCard tall />
              <SkeletonCard tall />
              <SkeletonCard tall />
            </>
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id || "1"}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                imageSrc={product.media && product.media.length > 0 ? product.media[0].url : "https://via.placeholder.com/400x500"}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-20 text-stone-400 font-sans text-sm">
              No products available yet.
            </div>
          )}
        </div>
      </section>

      {/* ─── Editorial Banner ─── */}
      <section className="bg-[#1a1c1c] py-16 px-gutter mb-20 animate-reveal">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/35 mb-3">The Philosophy</p>
            <h3 className="font-serif text-[clamp(1.3rem,3vw,2rem)] text-white leading-snug max-w-md">
              Designed for quiet confidence.<br />Worn with intention.
            </h3>
          </div>
          <a
            href="/collections"
            className="shrink-0 border border-white/30 text-white font-sans text-[11px] tracking-[0.25em] uppercase px-10 py-4 hover:bg-white hover:text-black transition-all duration-500"
          >
            View All Collections
          </a>
        </div>
      </section>

      {/* ─── Full Catalog ─── */}
      <section className="max-w-container-max mx-auto px-gutter pb-section-padding">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-baseline gap-4">
            <span className="font-sans text-[9px] tracking-[0.3em] text-stone-300 uppercase select-none">02</span>
            <h2 className="font-serif text-[clamp(1.2rem,2.5vw,1.6rem)] text-on-background">The Catalog</h2>
          </div>
          <div className="flex space-x-6 items-center">
            <button className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 flex items-center gap-2 hover:text-black transition-colors duration-300">
              Filter <span className="material-symbols-outlined text-[15px]">tune</span>
            </button>
            <div className="h-3 w-px bg-stone-200"></div>
            <button className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 flex items-center gap-2 hover:text-black transition-colors duration-300">
              Sort By <span className="material-symbols-outlined text-[15px]">expand_more</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {loading ? (
            <>
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </>
          ) : catalog.length > 0 ? (
            catalog.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id || "1"}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                aspectRatio="2/3"
                isSmall={true}
                imageSrc={product.media && product.media.length > 0 ? product.media[0].url : "https://via.placeholder.com/300x450"}
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 text-stone-400 font-sans text-sm">
              No products available yet.
            </div>
          )}
        </div>

        {catalog.length > 0 && (
          <div className="mt-20 flex justify-center">
            <button className="bg-transparent border border-black text-black font-sans text-[11px] tracking-[0.25em] uppercase px-14 py-3.5 hover:bg-black hover:text-white transition-all duration-500">
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
