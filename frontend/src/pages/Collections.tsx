import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { api } from "../api";
import { Product } from "../types";

type SortOrder = 'default' | 'asc' | 'desc';
function sortProducts(products: Product[], order: SortOrder) {
  if (order === 'asc') return [...products].sort((a, b) => (a.harga ?? 0) - (b.harga ?? 0));
  if (order === 'desc') return [...products].sort((a, b) => (b.harga ?? 0) - (a.harga ?? 0));
  return products;
}
function SortDropdown({ sort, setSort }: { sort: SortOrder; setSort: (s: SortOrder) => void }) {
  const [open, setOpen] = useState(false);
  const labels: Record<SortOrder, string> = { default: 'Sort By', asc: 'Harga: Rendah → Tinggi', desc: 'Harga: Tinggi → Rendah' };
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className={`font-sans text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors ${sort !== 'default' ? 'text-black' : 'text-stone-400 hover:text-black'}`}
      >
        {labels[sort]}<span className={`material-symbols-outlined text-[15px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-stone-200 shadow-lg w-52 py-1">
            {(['default', 'asc', 'desc'] as SortOrder[]).map((opt) => (
              <button key={opt} onClick={() => { setSort(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 font-sans text-[12px] hover:bg-stone-50 ${sort === opt ? 'text-stone-900 font-medium' : 'text-stone-600'}`}
              >{labels[opt]}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortOrder>('default');

  // Read kategori and search from URL query params
  const activeKategori = searchParams.get("kategori");
  const searchTerm = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await api.getProducts(
          activeKategori ? { kategori: activeKategori } : undefined
        );
        setProducts(result.data ?? []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeKategori]);

  // Client-side search filter on top of category filter
  const searchFiltered = searchTerm
    ? products.filter((p) => {
        const q = searchTerm.toLowerCase();
        return (
          (p.nama || '').toLowerCase().includes(q) ||
          (p.kode || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.bahan || '').toLowerCase().includes(q) ||
          (p.kategori || '').toLowerCase().includes(q) ||
          (Array.isArray(p.warna) ? p.warna.join(' ') : '').toLowerCase().includes(q)
        );
      })
    : products;

  const CATEGORIES = ["Outer Abaya", "Instant Abaya", "Luxe Kaftan", "Luxe Chiffon", "Velvet Abaya"];

  const handleKategori = (cat: string | null) => {
    if (cat) setSearchParams({ kategori: cat });
    else setSearchParams({});
  };

  return (
    <main className="pt-32 min-h-screen">
      {/* Header */}
      <section className="max-w-container-max mx-auto px-gutter pt-8 pb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-3">
            Curated Selection
          </p>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-on-background mb-4">
            All Collections
          </h1>
          <p className="font-sans text-[13px] text-stone-500 leading-relaxed">
            Explore our meticulously curated selection of abayas, designed for the modern modest woman.
          </p>
        </div>
      </section>

      {/* Category Filter Chips */}
      <section className="max-w-container-max mx-auto px-gutter pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleKategori(null)}
            className={`font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2 border transition-all duration-300 ${
              activeKategori === null
                ? "bg-black text-white border-black"
                : "bg-transparent text-stone-500 border-stone-300 hover:border-black hover:text-black"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleKategori(cat)}
              className={`font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2 border transition-all duration-300 ${
                activeKategori === cat
                  ? "bg-black text-white border-black"
                  : "bg-transparent text-stone-500 border-stone-300 hover:border-black hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-container-max mx-auto px-gutter pb-section-padding">
        <div className="flex justify-between items-center mb-8 border-b border-stone-200/60 pb-4">
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400">
            {searchTerm ? (
              <span>Hasil pencarian "<strong className="text-stone-700">{searchTerm}</strong>" — {searchFiltered.length} item</span>
            ) : (
              `${searchFiltered.length} Items`
            )}
          </p>
          <SortDropdown sort={sort} setSort={setSort} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {loading ? (
            <>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-[2/3] bg-stone-200 mb-4" />
                  <div className="h-3 w-3/4 bg-stone-200 mb-2" />
                  <div className="h-2 w-1/3 bg-stone-200" />
                </div>
              ))}
            </>
          ) : searchFiltered.length > 0 ? (
            sortProducts(searchFiltered, sort).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                aspectRatio="2/3"
                isSmall={true}
                imageSrc={
                  product.media && product.media.length > 0
                    ? product.media[0].url
                    : "https://via.placeholder.com/300x450"
                }
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 text-stone-400 font-sans text-sm">
              {searchTerm ? `Tidak ada produk untuk "${searchTerm}".` : 'No collections available yet.'}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
