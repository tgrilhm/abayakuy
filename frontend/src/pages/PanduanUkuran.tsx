import React from 'react';
import ContactCards from '../components/ContactCards';

const SIZES = [
  { size: 'L',         ld: '110',      pb: '140–145' },
  { size: 'XL',        ld: '120',      pb: '140–145' },
  { size: '2XL',       ld: '125',      pb: '140–145' },
  { size: '3XL',       ld: '130',      pb: '145–150' },
  { size: '4XL',       ld: '140',      pb: '145–150' },
  { size: 'Free Size', ld: '110–140',  pb: '140–150' },
];

export default function PanduanUkuran() {
  return (
    <main className="pt-28 min-h-screen bg-[#faf8f6]">

      {/* ─── Hero ─── */}
      <section className="bg-[#1a1c1c] py-16 px-8">
        <div className="max-w-[760px] mx-auto">
          <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/35 mb-4">Panduan</p>
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-white leading-tight">
            Panduan Ukuran
          </h1>
          <p className="font-sans text-[13px] text-white/45 mt-3 max-w-md leading-relaxed">
            Ukuran Abaya Mesir — pastikan Anda memilih ukuran yang tepat untuk kenyamanan maksimal.
          </p>
        </div>
      </section>

      {/* ─── Size Table ─── */}
      <section className="max-w-[760px] mx-auto px-8 py-16">

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mb-10">
          {[
            { abbr: 'LD', full: 'Lingkar Dada (cm)' },
            { abbr: 'PB', full: 'Panjang Baju (cm)' },
          ].map(({ abbr, full }) => (
            <div key={abbr} className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-bold tracking-[0.1em] bg-stone-900 text-white px-2 py-0.5">
                {abbr}
              </span>
              <span className="font-sans text-[12px] text-stone-500">{full}</span>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-900 text-white">
                <th className="px-6 py-4 text-left font-sans text-[10px] tracking-[0.25em] uppercase font-semibold w-1/3">
                  Ukuran
                </th>
                <th className="px-6 py-4 text-center font-sans text-[10px] tracking-[0.25em] uppercase font-semibold w-1/3">
                  LD (cm)
                </th>
                <th className="px-6 py-4 text-center font-sans text-[10px] tracking-[0.25em] uppercase font-semibold w-1/3">
                  PB (cm)
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((row, i) => (
                <tr
                  key={row.size}
                  className={`border-b border-stone-100 ${
                    row.size === 'Free Size'
                      ? 'bg-stone-50'
                      : i % 2 === 0
                      ? 'bg-white'
                      : 'bg-[#faf9f7]'
                  }`}
                >
                  {/* Size badge */}
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center justify-center font-sans text-[12px] font-bold tracking-[0.1em] uppercase px-3 py-1 ${
                      row.size === 'Free Size'
                        ? 'bg-stone-200 text-stone-700'
                        : 'bg-stone-900 text-white'
                    }`}>
                      {row.size}
                    </span>
                  </td>

                  {/* LD */}
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-serif text-[1.4rem] text-stone-800 leading-none">{row.ld}</span>
                      <span className="font-sans text-[9px] text-stone-400 tracking-widest uppercase mt-0.5">cm</span>
                    </div>
                  </td>

                  {/* PB */}
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-serif text-[1.4rem] text-stone-800 leading-none">{row.pb}</span>
                      <span className="font-sans text-[9px] text-stone-400 tracking-widest uppercase mt-0.5">cm</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {SIZES.map((row) => (
            <div
              key={row.size}
              className={`border p-4 flex flex-col gap-3 ${
                row.size === 'Free Size'
                  ? 'border-stone-300 bg-stone-50 col-span-2'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <span className={`self-start font-sans text-[11px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 ${
                row.size === 'Free Size' ? 'bg-stone-200 text-stone-700' : 'bg-stone-900 text-white'
              }`}>
                {row.size}
              </span>
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">LD</span>
                  <span className="font-serif text-[1.2rem] text-stone-800 leading-none">{row.ld}</span>
                  <span className="font-sans text-[9px] text-stone-400">cm</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">PB</span>
                  <span className="font-serif text-[1.2rem] text-stone-800 leading-none">{row.pb}</span>
                  <span className="font-sans text-[9px] text-stone-400">cm</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-12 bg-white border border-stone-200 px-6 py-6">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-4">Tips Memilih Ukuran</p>
          <ul className="space-y-3">
            {[
              'Ukur lingkar dada Anda pada bagian terlebar menggunakan pita ukur.',
              'Tambahkan 5–10 cm dari ukuran LD Anda untuk kenyamanan bergerak.',
              'Jika ukuran Anda berada di antara dua size, pilih ukuran yang lebih besar.',
              'Untuk bahan yang lebih tebal seperti velvet, pertimbangkan naik satu ukuran.',
              'Masih ragu? Hubungi kami via WhatsApp — kami siap membantu.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-sans text-[10px] font-bold text-stone-300 mt-0.5 shrink-0 w-4">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-sans text-[13px] text-stone-600 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="mt-10">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-4">Hubungi Kami</p>
          <ContactCards />
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-stone-200 pt-8">
          <p className="font-sans text-[13px] text-stone-500">Butuh bantuan memilih ukuran?</p>
          <a
            href="https://wa.me/201222569881"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-stone-900 text-white font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-stone-700 transition-colors duration-300"
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
            Tanya via WhatsApp
          </a>
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
