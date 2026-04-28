import { useState, useEffect } from "react";
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

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[2/3] bg-stone-200 mb-4" />
      <div className="h-3 w-3/4 bg-stone-200 mb-2" />
      <div className="h-2 w-1/3 bg-stone-200" />
    </div>
  );
}

export default function Sale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOrder>('default');

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await api.getProducts({ pageName: 'sale' });
        setProducts(result.data ?? []);
      } catch (err) {
        console.error("Failed to fetch sale products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const sorted = sortProducts(products, sort);

  return (
    <main className="pt-32 min-h-screen bg-[#faf8f6]">
      <section className="max-w-container-max mx-auto px-gutter pt-8 pb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-3">Special Offers</p>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-on-background mb-4">Sale</h1>
          <p className="font-sans text-[13px] text-stone-500 leading-relaxed">Selected pieces at special prices — while stocks last.</p>
        </div>
      </section>
      <section className="max-w-container-max mx-auto px-gutter pb-section-padding">
        <div className="flex justify-between items-center mb-8 border-b border-stone-200/60 pb-4">
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400">{sorted.length} Items</p>
          <SortDropdown sort={sort} setSort={setSort} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {loading ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />) :
            sorted.length > 0 ? sorted.map((product) => (
              <ProductCard key={product.id} id={product.id}
                title={product.nama || product.kode || "Untitled"}
                price={`${product.harga ?? 0}`}
                isAvailable={product.isAvailable}
                imageSrc={product.media && product.media.length > 0 ? product.media[0].url : "https://via.placeholder.com/400x500"}
              />
            )) : (
              <div className="col-span-4 text-center py-24 text-stone-400 font-sans text-sm">No sale products yet.</div>
            )}
        </div>
      </section>
    </main>
  );
}
