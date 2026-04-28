import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full mt-20">
      <div className="bg-[#f3f1ef] border-t border-stone-200/60 text-black">
        <div className="max-w-[1280px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-lg font-light tracking-[0.3em] mb-5 block font-sans">ABAYAKUY.OFFICIAL</span>
            <p className="text-[13px] text-stone-500 leading-relaxed max-w-xs font-sans mb-8">
              Jastip Abaya Mesir
            </p>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400">
              © 2026 ABAYAKUY.OFFICIAL. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col space-y-4">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-800 mb-2 font-semibold">
              Customer Care
            </span>
            {[
              { label: "Kebijakan Pengiriman", to: "/kebijakan-pengiriman" },
              { label: "Panduan Ukuran", to: "/panduan-ukuran" },
              { label: "Tanya Jawab", to: "/tanya-jawab" },
              { label: "Hubungi Kami", to: "/hubungi-kami" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="font-sans text-[11px] tracking-[0.12em] text-stone-400 hover:text-black transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Social Media */}
          <div className="flex flex-col space-y-4">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-800 mb-2 font-semibold">
              Follow Us
            </span>
            <div className="flex gap-4">
              <a href="https://instagram.com/abayakuy.official" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@abayakuy.official" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
              </a>
              <a href="https://shopee.co.id/abyky.of" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.64 5.92a.66.66 0 0 1 .65.65.65.65 0 0 1-.65.65.66.66 0 0 1-.65-.65.65.65 0 0 1 .65-.65m-2.27.65a.65.65 0 0 1 .65.65.66.66 0 0 1-.65.65.65.65 0 0 1-.65-.65.66.66 0 0 1 .65-.65m12.44 2.87-1.1-1.35c-.47-.44-1.12-.69-1.8-.69h-.8c-.1 0-.17-.06-.21-.15l-.26-.64A3.87 3.87 0 0 0 16 4.31H7.85a3.87 3.87 0 0 0-3.6 2.3l-.26.64c-.04.09-.11.15-.21.15H3c-.68 0-1.33.25-1.8.69l-1.1 1.35C0 9.56 0 9.77 0 10.03v8.59A3.33 3.33 0 0 0 3.33 22h17.34A3.33 3.33 0 0 0 24 18.67V10c0-.26 0-.47-.09-.58zm-1.21 8.75c0 .66-.54 1.21-1.21 1.21H3.33a1.21 1.21 0 0 1-1.21-1.21v-7.38c.42-.38 1.05-.62 1.76-.62h16.24c.71 0 1.34.24 1.76.62z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
