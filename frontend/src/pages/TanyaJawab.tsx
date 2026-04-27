import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactCards from '../components/ContactCards';

const FAQS = [
  {
    q: "Apakah produk ready stock?",
    a: "Sebagian besar produk kami tersedia PRE-ORDER, namun beberapa item ready stok. Informasi ketersediaan dapat menghubungi kami.",
  },
  {
    q: "Berapa lama proses pengiriman?",
    a: "Pesanan akan diproses dalam waktu 15–20 hari kerja (pre-order) dan 1–3 hari kerja (ready stok), belum termasuk waktu pengiriman oleh ekspedisi.",
  },
  {
    q: "Apakah bisa kirim ke seluruh Indonesia?",
    a: "Ya, kami melayani pengiriman ke seluruh wilayah Indonesia.",
  },
  {
    q: "Apakah tersedia pengiriman internasional?",
    a: "Untuk saat ini hanya di beberapa negara. Silakan hubungi kami untuk informasi ongkir dan estimasi waktu pengiriman.",
  },
  {
    q: "Bagaimana cara melakukan pemesanan?",
    a: "Anda dapat melakukan pemesanan langsung melalui Shopee atau menghubungi kami melalui WhatsApp/Instagram yang tersedia di halaman kontak.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami hanya menerima pembayaran melalui transfer bank.",
  },
  {
    q: "Apakah warna produk sesuai dengan foto?",
    a: "Kami berusaha menampilkan warna seakurat mungkin. Namun, perbedaan pencahayaan dan layar dapat menyebabkan sedikit perbedaan warna.",
  },
  {
    q: "Apakah tersedia size chart?",
    a: "Ya, detail ukuran tersedia di setiap halaman produk untuk membantu Anda memilih ukuran yang sesuai.",
  },
  {
    q: "Apakah bisa custom size atau model?",
    a: "Untuk saat ini, kami belum menyediakan layanan custom.",
  },
  {
    q: "Bagaimana jika produk yang diterima rusak atau tidak sesuai?",
    a: "Silakan hubungi kami maksimal 24 jam setelah barang diterima dengan menyertakan bukti foto/video untuk proses penanganan lebih lanjut.",
  },
  {
    q: "Apakah bisa retur atau tukar barang?",
    a: (
      <>
        Kami menerima retur atau penukaran untuk kondisi tertentu sesuai dengan kebijakan yang berlaku. Silakan cek halaman{' '}
        <Link to="/kebijakan-pengiriman" className="underline underline-offset-2 hover:text-stone-900 transition-colors">
          Kebijakan Pengiriman
        </Link>{' '}
        kami.
      </>
    ),
  },
  {
    q: "Bagaimana cara menghubungi customer service?",
    a: "Anda dapat menghubungi kami melalui WhatsApp atau Instagram yang tertera di website. Tim kami akan dengan senang hati membantu Anda.",
  },
];

function FAQItem({ index, q, a }: { index: number; q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-5 py-5 text-left group"
      >
        <span className="font-sans text-[10px] tracking-[0.2em] text-stone-300 select-none mt-0.5 shrink-0 w-5">
          {String(index).padStart(2, '0')}
        </span>
        <span className="flex-1 font-sans text-[14px] font-medium text-stone-800 group-hover:text-stone-900 transition-colors leading-snug">
          {q}
        </span>
        <span
          className={`material-symbols-outlined text-[18px] text-stone-400 shrink-0 mt-0.5 transition-transform duration-300 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          style={{ fontVariationSettings: "'wght' 300" }}
        >
          expand_more
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="font-sans text-[14px] text-stone-500 leading-[1.85] pl-10">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function TanyaJawab() {
  return (
    <main className="pt-28 min-h-screen bg-[#faf8f6]">

      {/* ─── Hero ─── */}
      <section className="bg-[#1a1c1c] py-16 px-8">
        <div className="max-w-[760px] mx-auto">
          <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/35 mb-4">
            Bantuan
          </p>
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-white leading-tight">
            Tanya Jawab
          </h1>
        </div>
      </section>

      {/* ─── FAQ List ─── */}
      <section className="max-w-[760px] mx-auto px-8 py-16">
        <p className="font-sans text-[14px] text-stone-500 leading-relaxed mb-10">
          Temukan jawaban atas pertanyaan yang paling sering kami terima. Jika pertanyaan Anda tidak ada di sini,
          jangan ragu untuk menghubungi kami langsung.
        </p>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} index={i + 1} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ─── Still have questions ─── */}
      <section className="max-w-[760px] mx-auto px-8 pb-16">
        <div className="bg-white border border-stone-200 px-8 py-8">
          <div className="mb-6">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-1">Masih ada pertanyaan?</p>
            <p className="font-serif text-[1.1rem] text-stone-800">Kami siap membantu Anda.</p>
          </div>
          <ContactCards />
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
