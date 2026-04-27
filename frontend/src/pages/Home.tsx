import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { api } from "../api";
import { Product, Media } from "../types";

// ─── Hero Slider ──────────────────────────────────────────────────────────────
const FALLBACK_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuA3pKYuUdiTaPjYba7P1vbmlaBVJdBTtDBB_KtLhGNVIAvi8s5WwEvc0xV0MuLcZtHXiBSbmDjDpR6JCIvsIXtgeeN-5kYehXnAra4WgIU4LwGoT-bxSMDyU7zfVcRwAgwS8AWkaoN4hyTwdBDtN0Yf0PSSwekvo9LoUnXcwILSpjCPkCJ8kSacs9TuVFY0KXrB81Xby-QPjCLHBdk6KpUHc_6mc6xPIqShpBW7wUlSxuWYErYNlgXBSIPfuM6FIy_or7rGLgGj8jI";

function HeroSlider({ heroProduct }: { heroProduct: Product | null }) {
  const images: Media[] = heroProduct?.media?.filter((m) => m.type === "image") ?? [];
  const slides = images.length > 0 ? images : [{ id: "fallback", url: FALLBACK_IMG, type: "image" as const, order: 0 }];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full h-[80vh] min-h-[520px] max-h-[860px] bg-surface-container overflow-hidden grain-overlay">
      {slides.map((slide, i) => (
        <img key={slide.id} src={slide.url} alt={heroProduct?.nama || "Hero"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      <div className="absolute bottom-14 left-10 md:left-16 flex flex-col items-start z-10 max-w-lg">
        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/60 mb-5 animate-reveal-delay-1">New Season — 2026</p>
        <h1 className="font-serif text-[clamp(2.2rem,5.5vw,4rem)] text-white mb-3 tracking-tight leading-[1.05] animate-reveal-delay-2">
          Elegance You<br />Can Wear
        </h1>
        <p className="font-sans text-[12px] text-white/55 mb-4 leading-relaxed tracking-wide animate-reveal-delay-2 max-w-xs">Jastip Abaya Mesir</p>
        {heroProduct && (
          <div className="mb-6 animate-reveal-delay-2">
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 block mb-1">Featured</span>
            <span className="font-serif text-[1.1rem] text-white/90 italic">{heroProduct.nama || heroProduct.kode}</span>
          </div>
        )}
        <Link to="/collections" className="btn-primary animate-reveal-delay-3">Explore Collection</Link>
      </div>
      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors duration-200">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button onClick={next} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors duration-200">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-4" : "bg-white/40 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-2 animate-reveal-delay-3">
        <div className="w-px h-10 bg-white/30 scroll-line" />
        <span className="font-sans text-[8px] tracking-[0.35em] uppercase text-white/40 mt-1">Scroll</span>
      </div>
    </div>
  );
}

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="animate-fade-in">
      <div className={`w-full ${tall ? "aspect-[3/4]" : "aspect-[2/3]"} skeleton mb-4`} />
      <div className="h-3 w-3/4 skeleton mb-2" />
      <div className="h-2 w-1/3 skeleton" />
    </div>
  );
}

type SortOrder = 'default' | 'asc' | 'desc';

function sortProducts(products: Product[], order: SortOrder): Product[] {
  if (order === 'asc') return [...products].sort((a, b) => (a.harga ?? 0) - (b.harga ?? 0));
  if (order === 'desc') return [...products].sort((a, b) => (b.harga ?? 0) - (a.harga ?? 0));
  return products;
}

function SortDropdown({ sort, setSort }: { sort: SortOrder; setSort: (s: SortOrder) => void }) {
  const [open, setOpen] = useState(false);
  const labels: Record<SortOrder, string> = { default: 'Sort By', asc: 'Harga: Rendah → Tinggi', desc: 'Harga: Tinggi → Rendah' };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`font-sans text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors duration-300 ${sort !== 'default' ? 'text-black' : 'text-stone-400 hover:text-black'}`}
      >
        {labels[sort]}
        <span className={`material-symbols-outlined text-[15px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-stone-200 shadow-lg w-52 py-1">
            {(['default', 'asc', 'desc'] as SortOrder[]).map((opt) => (
              <button key={opt} onClick={() => { setSort(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 font-sans text-[12px] hover:bg-stone-50 transition-colors ${sort === opt ? 'text-stone-900 font-medium' : 'text-stone-600'}`}
              >
                {labels[opt]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<SortOrder>('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [heroResult, catalogResult] = await Promise.all([
          api.getHeroProduct(),
          api.getProducts({ page: 1, limit: 8 }),
        ]);
        setHeroProduct(heroResult);
        const result = Array.isArray(catalogResult) ? { data: catalogResult, pagination: { pages: 1 } } : catalogResult;
        setProducts(result.data ?? []);
        setTotalPages(result.pagination?.pages ?? 1);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await api.getProducts({ page: nextPage, limit: 8 });
      const newProducts = Array.isArray(result) ? result : result.data ?? [];
      setProducts((prev) => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      setTotalPages(Array.isArray(result) ? 1 : result.pagination?.pages ?? 1);
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const newArrivals = products.slice(0, 3);
  const catalog = sortProducts(products, sort);

  return (
    <main className="pt-28">
      {/* ─── Hero ─── */}
      <section className="max-w-container-max mx-auto px-gutter pt-6 pb-section-padding animate-reveal">
        <HeroSlider heroProduct={heroProduct} />
      </section>

      {/* ─── New Arrivals ─── */}
      <section className="max-w-container-max mx-auto px-gutter pb-section-padding animate-reveal-delay-2">
        <div className="flex justify-between items-end mb-12 pb-4 border-b border-stone-200/60">
          <div className="flex items-baseline gap-4">
            <span className="font-sans text-[9px] tracking-[0.3em] text-stone-300 uppercase select-none">01</span>
            <h2 className="font-serif text-[clamp(1.4rem,3vw,2rem)] text-on-background">New Arrivals</h2>
          </div>
          <a className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 hover:text-black transition-colors duration-300 flex items-center gap-1.5 group" href="/collections">
            Discover
            <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform duration-300">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <><SkeletonCard tall /><SkeletonCard tall /><SkeletonCard tall /></>
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard key={product.id} id={product.id || "1"}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                imageSrc={product.media && product.media.length > 0 ? product.media[0].url : "https://via.placeholder.com/400x500"}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-20 text-stone-400 font-sans text-sm">No products available yet.</div>
          )}
        </div>
      </section>

      {/* ─── Editorial Banner ─── */}
      <section className="bg-[#1a1c1c] py-16 px-gutter mb-20 animate-reveal">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/35 mb-3">Filosofi Kami</p>
            <h3 className="font-serif text-[clamp(1.3rem,3vw,2rem)] text-white leading-snug max-w-md">
              Tampil elegan setiap hari,<br />dengan abaya pilihan dari Mesir.
            </h3>
          </div>
          <a href="/collections" className="shrink-0 border border-white/30 text-white font-sans text-[11px] tracking-[0.25em] uppercase px-10 py-4 hover:bg-white hover:text-black transition-all duration-500">
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
          <SortDropdown sort={sort} setSort={setSort} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : catalog.length > 0 ? (
            catalog.map((product) => (
              <ProductCard key={product.id} id={product.id || "1"}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                aspectRatio="2/3" isSmall
                imageSrc={product.media && product.media.length > 0 ? product.media[0].url : "https://via.placeholder.com/300x450"}
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 text-stone-400 font-sans text-sm">No products available yet.</div>
          )}
        </div>

        {catalog.length > 0 && currentPage < totalPages && (
          <div className="mt-20 flex justify-center">
            <button onClick={handleLoadMore} disabled={loadingMore}
              className="bg-transparent border border-black text-black font-sans text-[11px] tracking-[0.25em] uppercase px-14 py-3.5 hover:bg-black hover:text-white transition-all duration-500 disabled:opacity-40 flex items-center gap-3"
            >
              {loadingMore ? (
                <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />Loading...</>
              ) : 'Load More'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
