import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="w-full mt-20">
      {/* ─── Newsletter Strip ─── */}
      <div className="bg-[#1a1c1c] py-14 px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/35 mb-2">Stay in the loop</p>
            <h4 className="font-serif text-[1.4rem] text-white leading-snug">
              New arrivals, first.
            </h4>
          </div>
          {subscribed ? (
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/50">
              ✦ Thank you for subscribing
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-white/8 border border-white/15 text-white placeholder-white/30 font-sans text-[12px] px-5 py-3.5 outline-none focus:border-white/40 transition-colors duration-300 min-w-0"
              />
              <button
                type="submit"
                className="bg-white text-black font-sans text-[10px] tracking-[0.2em] uppercase px-6 py-3.5 hover:bg-stone-100 transition-colors duration-300 shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ─── Main Footer ─── */}
      <div className="bg-[#f3f1ef] border-t border-stone-200/60 text-black">
        <div className="max-w-[1280px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-lg font-light tracking-[0.3em] mb-5 block font-sans">ABAYAKUY.OFFICIAL</span>
            <p className="text-[13px] text-stone-500 leading-relaxed max-w-xs font-sans mb-8">
              Curated modest wear for the modern woman. Crafted with intention, designed for quiet confidence.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mb-10">
              {[
                { label: "Instagram", icon: "photo_camera" },
                { label: "TikTok", icon: "play_circle" },
                { label: "WhatsApp", icon: "chat" },
              ].map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 border border-stone-300 flex items-center justify-center text-stone-400 hover:text-black hover:border-black transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-[15px]">{icon}</span>
                </a>
              ))}
            </div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400">
              © 2024 ABAYAKUY.OFFICIAL. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col space-y-4">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-800 mb-2 font-semibold">Customer Care</span>
            {["SHIPPING & RETURNS", "PRIVACY POLICY", "TERMS OF SERVICE"].map((label) => (
              <Link
                key={label}
                to="#"
                className="font-sans text-[11px] tracking-[0.12em] uppercase text-stone-400 hover:text-black transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col space-y-4">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-800 mb-2 font-semibold">Help</span>
            {["SIZE GUIDE", "FAQ", "CONTACT US"].map((label) => (
              <Link
                key={label}
                to="#"
                className="font-sans text-[11px] tracking-[0.12em] uppercase text-stone-400 hover:text-black transition-colors duration-300"
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
