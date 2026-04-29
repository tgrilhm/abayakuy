import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { Product, Media, formatUkuranDisplay } from "../types";

function SkeletonDetail() {
  return (
    <div className="pt-32 min-h-screen max-w-[1280px] mx-auto px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="aspect-[3/4] bg-stone-200 w-full" />
        <div className="space-y-4 pt-4">
          <div className="h-4 w-1/3 bg-stone-200" />
          <div className="h-8 w-2/3 bg-stone-200" />
          <div className="h-6 w-1/4 bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgLoaded(false);
    api.getProductById(id)
      .then((data) => {
        setProduct(data);
        const first = data?.media?.[0] ?? null;
        setSelectedMedia(first);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail />;
  if (notFound || !product) {
    return (
      <div className="pt-40 min-h-screen flex flex-col items-center justify-center gap-4 text-stone-400">
        <span className="font-serif text-2xl text-stone-700">Produk tidak ditemukan</span>
        <Link to="/collections" className="font-sans text-[11px] tracking-[0.2em] uppercase hover:text-black transition-colors">
          ← Kembali ke Koleksi
        </Link>
      </div>
    );
  }

  const allMedia = product.media ?? [];
  const images = allMedia.filter((m) => m.type === "image");
  const videos = allMedia.filter((m) => m.type === "video");
  const hasShopeeLink = product.isAvailable && !!product.link;

  const formatPrice = (p: number | null) =>
    p != null ? `Rp ${p.toLocaleString('id-ID')}` : "—";

  return (
    <main className="pt-28 min-h-screen bg-[#faf8f6]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10 font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-black transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-stone-600">{product.nama || product.kode || "Product"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* ─── Gallery ─── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative w-full aspect-[3/4] bg-stone-100 overflow-hidden">
              {!imgLoaded && <div className="absolute inset-0 skeleton" />}
              {selectedMedia ? (
                selectedMedia.type === "video" ? (
                  <video
                    key={selectedMedia.url}
                    controls
                    playsInline
                    muted
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  >
                    <source src={`/api/products/stream/${selectedMedia.url.split('/').pop()}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    key={selectedMedia.url}
                    src={selectedMedia.url}
                    alt={product.nama || product.kode || ""}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"} ${!product.isAvailable ? "grayscale-[0.5] opacity-60" : ""}`}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">📷</div>
              )}
              {!product.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="bg-black/60 backdrop-blur-sm text-white font-sans text-[12px] tracking-[0.4em] uppercase px-6 py-3 border border-white/20">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails — only show when more than 1 */}
            {allMedia.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allMedia.map((media) => (
                  <button
                    key={media.id}
                    onClick={() => { setSelectedMedia(media); setImgLoaded(false); }}
                    className={`relative aspect-square bg-stone-100 overflow-hidden border-2 transition-all duration-200 ${
                      selectedMedia?.id === media.id
                        ? "border-stone-900"
                        : "border-transparent hover:border-stone-400"
                    }`}
                  >
                    {media.type === "video" ? (
                      <>
                        <video src={media.url} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[18px] drop-shadow">play_circle</span>
                        </div>
                      </>
                    ) : (
                      <img src={media.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div className="lg:sticky lg:top-32 flex flex-col gap-6">

            {/* Header */}
            <div>
              {product.brand && (
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-2">
                  {product.brand}
                </p>
              )}
              <h1 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] text-stone-900 leading-tight mb-3">
                {product.nama || product.kode || "Untitled"}
              </h1>
              <p className="font-serif text-[1.5rem] text-stone-800">
                {formatPrice(product.harga)}
              </p>
              <div className="mt-3 space-y-1">
                <p className="font-sans text-[12px] text-stone-500 leading-[1.7]">
                  Harga berlaku untuk order manual (belum termasuk ongkir).
                </p>
                <p className="font-sans text-[12px] text-stone-500 leading-[1.7]">
                  Harga di Shopee dapat berbeda sesuai ketentuan admin yang berlaku di shoope.
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {!product.isAvailable && (
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-red-100 text-red-700 border border-red-200 px-2.5 py-1">
                  Sold Out
                </span>
              )}
              {product.isSale && (
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1">
                  Sale
                </span>
              )}
              {product.isTrending && (
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1">
                  Trending
                </span>
              )}
              {product.kategori && (
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-stone-100 text-stone-600 border border-stone-200 px-2.5 py-1">
                  {product.kategori}
                </span>
              )}
            </div>

            <div className="border-t border-stone-200" />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {product.kode && (
                <div>
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">Kode</p>
                  <p className="font-sans text-[13px] text-stone-700">{product.kode}</p>
                </div>
              )}
              {product.bahan && (
                <div>
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">Bahan</p>
                  <p className="font-sans text-[13px] text-stone-700">{product.bahan}</p>
                </div>
              )}
            </div>

            {/* Warna */}
            {product.warna && product.warna.length > 0 && (
              <div>
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">Warna</p>
                <div className="flex flex-wrap gap-2">
                  {product.warna.map((w) => (
                    <span key={w} className="font-sans text-[11px] bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ukuran */}
            {product.ukuran && product.ukuran.length > 0 && (
              <div>
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">Ukuran</p>
                <div className="flex flex-wrap gap-2">
                  {product.ukuran.map((s) => (
                    <span
                      key={s}
                      className="font-sans text-[11px] tracking-[0.1em] uppercase border border-stone-300 text-stone-700 px-3 py-1.5 min-w-[44px] text-center"
                    >
                      {formatUkuranDisplay(s)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deskripsi */}
            {product.deskripsi && (
              <div>
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">Deskripsi</p>
                <p className="font-sans text-[13px] text-stone-600 leading-[1.8]">{product.deskripsi}</p>
              </div>
            )}

            <div className="border-t border-stone-200" />

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <a
                href={product.isAvailable ? "https://wa.me/201222569881" : undefined}
                target={product.isAvailable ? "_blank" : undefined}
                rel={product.isAvailable ? "noopener noreferrer" : undefined}
                className={`flex items-center justify-center gap-3 font-sans text-[12px] tracking-[0.2em] uppercase py-4 transition-colors duration-300 ${
                  product.isAvailable
                    ? "bg-[#25D366] text-white hover:bg-[#1ebe5d]"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {product.isAvailable && (
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                )}
                {product.isAvailable ? "Pesan via WhatsApp" : "Sold Out"}
              </a>
              <a
                href={hasShopeeLink ? product.link ?? undefined : undefined}
                target={hasShopeeLink ? "_blank" : undefined}
                rel={hasShopeeLink ? "noopener noreferrer" : undefined}
                className={`flex items-center justify-center gap-3 font-sans text-[12px] tracking-[0.2em] uppercase py-4 transition-colors duration-300 ${
                  hasShopeeLink
                    ? "bg-[#EE4D2D] text-white hover:bg-[#d94429]"
                    : "bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200"
                }`}
              >
                {product.isAvailable ? (product.link ? "Beli di Shopee" : "Link Shopee Belum Ada") : "Stok Habis"}
              </a>
            </div>

            {/* Media count */}
            {allMedia.length > 0 && (
              <p className="font-sans text-[10px] text-stone-400">
                {images.length} foto{videos.length > 0 ? ` · ${videos.length} video` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
