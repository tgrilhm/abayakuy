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
              © 2024 ABAYAKUY.OFFICIAL. ALL RIGHTS RESERVED.
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
        </div>
      </div>
    </footer>
  );
}
