import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function TopNavBar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/trending", label: "TRENDING NOW" },
    { to: "/collections", label: "COLLECTIONS" },
    { to: "/sale", label: "SALE" },
    { to: "/about", label: "ABOUT" },
  ];

  return (
    <header className="fixed top-0 w-full z-50">
      <nav className={`w-full transition-all duration-500 ${
        scrolled
          ? "bg-white/96 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
          : "bg-white border-b border-stone-100"
      }`}>
        <div className="max-w-[1280px] mx-auto px-8 items-center relative">
          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center absolute left-8 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-black cursor-pointer hover:opacity-60 transition-opacity active:scale-95">menu</span>
          </div>

          <div className="flex flex-col items-center w-full py-4">
            {/* Brand Logo */}
            <Link to="/" className="group flex items-center gap-3 mb-4">
              {/* Decorative serif mark */}
              <span className="hidden md:block font-serif text-[11px] text-stone-300 select-none">✦</span>
              <span className="text-[21px] font-light tracking-[0.38em] text-black font-sans group-hover:tracking-[0.42em] transition-all duration-500">
                ABAYAKUY.OFFICIAL
              </span>
              <span className="hidden md:block font-serif text-[11px] text-stone-300 select-none">✦</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-12 items-center">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link font-sans tracking-[0.2em] text-[10px] uppercase transition-colors duration-300 relative pb-0.5 ${
                      isActive ? "text-black nav-link--active" : "text-stone-400 hover:text-black"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Trailing Icons */}
          <div className="flex space-x-5 items-center absolute right-8 top-1/2 -translate-y-1/2">
            <button className="text-black hover:opacity-50 transition-opacity active:scale-95 flex items-center" aria-label="Search">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <Link to="/admin" className="text-black hover:opacity-50 transition-opacity active:scale-95 hidden md:flex items-center" aria-label="Account">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
            <button className="text-black hover:opacity-50 transition-opacity active:scale-95 flex items-center relative" aria-label="Cart">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              {/* Cart badge */}
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-black text-white text-[8px] rounded-full flex items-center justify-center font-sans font-semibold leading-none">0</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
