import { Link } from "react-router-dom";
import { useState } from "react";

export interface ProductCardProps {
  key?: string | number;
  id: string;
  title: string;
  price: string;
  imageSrc: string;
  imageAlt?: string;
  aspectRatio?: "3/4" | "2/3";
  isSmall?: boolean;
}

export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  imageAlt,
  aspectRatio = "3/4",
  isSmall = false,
}: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <Link to={`/product/${id}`} className="group block">
      <div
        className={`w-full ${
          aspectRatio === "3/4" ? "aspect-[3/4]" : "aspect-[2/3]"
        } bg-surface-container ${isSmall ? "mb-4" : "mb-6"} overflow-hidden relative`}
      >
        {/* Skeleton placeholder while loading */}
        {!loaded && <div className="absolute inset-0 skeleton" />}

        <img
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          alt={imageAlt || title}
          src={imageSrc}
          onLoad={() => setLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

        {/* Quick View label */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out z-10">
          <span className="bg-white text-black font-sans text-[9px] tracking-[0.25em] uppercase px-5 py-2.5 shadow-sm">
            Quick View
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((w) => !w);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 ${
            wishlisted ? "opacity-100" : ""
          }`}
        >
          <span
            className={`material-symbols-outlined text-[16px] transition-colors duration-200 ${
              wishlisted ? "text-black" : "text-stone-400"
            }`}
            style={{ fontVariationSettings: wishlisted ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
          >
            favorite
          </span>
        </button>
      </div>

      <div className="flex flex-col items-start">
        <h3
          className={`${
            isSmall ? "text-[13px]" : "text-[15px]"
          } font-sans font-medium text-on-surface mb-1 tracking-tight`}
        >
          {title}
        </h3>
        <p
          className={`${
            isSmall ? "text-[12px]" : "text-[13px]"
          } font-sans text-stone-400 tracking-wide`}
        >
          {isNaN(Number(price)) ? price : `Rp ${Number(price).toLocaleString('id-ID')}`}
        </p>
      </div>
    </Link>
  );
}
