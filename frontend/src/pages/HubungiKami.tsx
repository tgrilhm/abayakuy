import React from 'react';
import ContactCards from '../components/ContactCards';

export default function HubungiKami() {
  return (
    <main className="pt-28 min-h-screen bg-[#faf8f6]">

      {/* ─── Hero ─── */}
      <section className="bg-[#1a1c1c] py-16 px-8">
        <div className="max-w-[760px] mx-auto">
          <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/35 mb-4">Kontak</p>
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-white leading-tight">
            Hubungi Kami
          </h1>
          <p className="font-sans text-[13px] text-white/45 mt-3 max-w-md leading-relaxed">
            Kami siap membantu Anda. Pilih platform yang paling nyaman untuk Anda.
          </p>
        </div>
      </section>

      {/* ─── Contact Cards ─── */}
      <section className="max-w-[760px] mx-auto px-8 py-16">
        <ContactCards />

        <div className="mt-10 border-t border-stone-200 pt-8">
          <p className="font-sans text-[13px] text-stone-500 leading-[1.85]">
            Tim kami aktif setiap hari dan akan merespons pesan Anda secepatnya.
            Untuk pemesanan dan pertanyaan produk, WhatsApp adalah cara tercepat untuk menghubungi kami.
          </p>
        </div>
      </section>

      {/* Bottom stamp */}
      <section className="border-t border-stone-200 py-10 text-center">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-stone-300">
          Abayakuy.Official — Jastip Abaya Mesir
        </p>
      </section>

    </main>
  );
}
