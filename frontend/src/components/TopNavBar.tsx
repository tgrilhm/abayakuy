import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const COLLECTION_CATEGORIES = [
  { label: "Outer Abaya",   slug: "Outer Abaya" },
  { label: "Instant Abaya", slug: "Instant Abaya" },
  { label: "Luxe Kaftan",   slug: "Luxe Kaftan" },
  { label: "Luxe Chiffon",  slug: "Luxe Chiffon" },
  { label: "Velvet Abaya",  slug: "Velvet Abaya" },
];

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCollectionsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setCollectionsOpen(false), 120);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/collections?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const navLinks = [
    { to: "/", label: "HOME", dropdown: false },
    { to: "/trending", label: "TRENDING NOW", dropdown: false },
    { to: "/collections", label: "COLLECTIONS", dropdown: true },
    { to: "/sale", label: "SALE", dropdown: false },
    { to: "/about", label: "ABOUT", dropdown: false },
  ];

  return (
    <header className="fixed top-0 w-full z-50">
      <nav className={`w-full transition-all duration-500 ${
        scrolled ? "bg-white/96 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]" : "bg-white border-b border-stone-100"
      }`}>
        <div className="max-w-[1280px] mx-auto px-8 items-center relative">
          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center absolute left-8 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-black cursor-pointer hover:opacity-60 transition-opacity active:scale-95">menu</span>
          </div>

          <div className="flex flex-col items-center w-full py-4">
            {/* Brand Logo */}
            <Link to="/" className="group flex items-center gap-3 mb-4">
              <span className="hidden md:block font-serif text-[11px] text-stone-300 select-none">✦</span>
              <span className="text-[21px] font-light tracking-[0.38em] text-black font-sans group-hover:tracking-[0.42em] transition-all duration-500">
                ABAYAKUY.OFFICIAL
              </span>
              <span className="hidden md:block font-serif text-[11px] text-stone-300 select-none">✦</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-12 items-center">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.to ||
                  (link.dropdown && location.pathname.startsWith("/collections"));

                if (!link.dropdown) {
                  return (
                    <Link key={link.to} to={link.to}
                      className={`nav-link font-sans tracking-[0.2em] text-[10px] uppercase transition-colors duration-300 relative pb-0.5 ${
                        isActive ? "text-black nav-link--active" : "text-stone-400 hover:text-black"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <div key={link.to} ref={collectionsRef} className="relative"
                    onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                  >
                    <Link to={link.to}
                      className={`nav-link font-sans tracking-[0.2em] text-[10px] uppercase transition-colors duration-300 relative pb-0.5 flex items-center gap-1 ${
                        isActive ? "text-black nav-link--active" : "text-stone-400 hover:text-black"
                      }`}
                    >
                      {link.label}
                      <span className={`material-symbols-outlined text-[12px] transition-transform duration-300 ${collectionsOpen ? "rotate-180" : "rotate-0"}`}
                        style={{ fontVariationSettings: "'wght' 300" }}>expand_more</span>
                    </Link>

                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-stone-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-200 origin-top ${
                      collectionsOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                    }`} style={{ minWidth: "180px" }}
                      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                    >
                      <div className="h-px bg-stone-900 w-full" />
                      <div className="py-2">
                        {COLLECTION_CATEGORIES.map((cat, i) => (
                          <Link key={cat.slug} to={`/collections?kategori=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 group/item hover:bg-stone-50 transition-colors duration-150"
                          >
                            <span className="font-sans text-[9px] tracking-[0.15em] text-stone-300 select-none w-4 text-right">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-stone-500 group-hover/item:text-stone-900 transition-colors duration-150">
                              {cat.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-stone-100 px-5 py-2.5">
                        <Link to="/collections" onClick={() => setCollectionsOpen(false)}
                          className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors duration-150 flex items-center gap-1.5"
                        >
                          View All
                          <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trailing Icons */}
          <div className="flex space-x-5 items-center absolute right-8 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className={`transition-opacity active:scale-95 flex items-center ${searchOpen ? 'text-black' : 'text-black hover:opacity-50'}`}
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[20px]">{searchOpen ? 'close' : 'search'}</span>
            </button>
            <Link to="/admin" className="text-black hover:opacity-50 transition-opacity active:scale-95 hidden md:flex items-center" aria-label="Account">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          </div>
        </div>

        {/* ─── Search bar — slides down ─── */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${searchOpen ? 'max-h-20 border-t border-stone-100' : 'max-h-0'}`}>
          <form onSubmit={handleSearch} className="max-w-[1280px] mx-auto px-8 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-stone-400 text-[18px] flex-shrink-0">search</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari abaya, bahan, warna, kategori..."
              className="flex-1 bg-transparent font-sans text-[14px] text-stone-800 placeholder-stone-300 focus:outline-none"
            />
            {searchQuery && (
              <button type="submit"
                className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-black transition-colors px-3 py-1.5 border border-stone-200 hover:border-stone-800"
              >
                Cari
              </button>
            )}
            <button type="button" onClick={() => setSearchOpen(false)}
              className="text-stone-300 hover:text-stone-600 transition-colors"
              aria-label="Close search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
