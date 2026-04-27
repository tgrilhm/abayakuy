import ContactCards from '../components/ContactCards';

export default function About() {
  const features = [
    "Dipilih langsung dari store terpercaya di Mesir",
    "Model up-to-date & best seller",
    "Kualitas bahan premium & nyaman dipakai",
    "Bisa request model (jastip by order)",
    "Personal shopper assistance sesuai request & preferensi kamu",
  ];

  return (
    <main className="pt-28 min-h-screen bg-[#faf8f6]">

      {/* ─── Hero Banner ─── */}
      <section className="bg-[#1a1c1c] py-20 px-8">
        <div className="max-w-[860px] mx-auto text-center">
          <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/35 mb-5">
            Tentang Kami
          </p>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.2rem)] text-white leading-[1.1] tracking-tight mb-6">
            Abaya Original Mesir,<br />Langsung ke Tangan Kamu
          </h1>
          <div className="w-10 h-px bg-white/20 mx-auto" />
        </div>
      </section>

      {/* ─── Main Story ─── */}
      <section className="max-w-[760px] mx-auto px-8 py-20">

        {/* Opening */}
        <div className="mb-14">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-4">01 — Cerita Kami</p>
          <p className="font-sans text-[15px] text-stone-700 leading-[1.85]">
            <span className="font-semibold text-stone-900">Abayakuy.Official</span> hadir sebagai solusi untuk kamu yang ingin tampil elegan dengan abaya original Mesir — tanpa ribet. ✨
          </p>
          <p className="font-sans text-[15px] text-stone-600 leading-[1.85] mt-5">
            Berawal dari pengalaman langsung memilih dan melihat kualitas abaya di Mesir, kami memahami betapa pentingnya bahan yang nyaman, <em>cutting</em> yang jatuh dengan indah, dan model yang tetap classy tanpa berlebihan.
          </p>
          <p className="font-sans text-[15px] text-stone-600 leading-[1.85] mt-5">
            Karena itu, kami tidak hanya sekadar menjual, tapi juga berperan sebagai <span className="font-medium text-stone-800">personal shopper</span> yang membantu kamu menemukan abaya yang paling sesuai dengan kebutuhan dan style kamu. Mulai dari pemilihan model, bahan, hingga detail — semua kami bantu dengan lebih personal.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200 mb-14" />

        {/* Features */}
        <div className="mb-14">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-8">02 — Kenapa Kami</p>
          <ul className="space-y-4">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-0.5 w-5 h-5 bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-sans font-bold">
                  ✓
                </span>
                <span className="font-sans text-[14px] text-stone-700 leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200 mb-14" />

        {/* Closing statement */}
        <div className="mb-14">
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-4">03 — Keyakinan Kami</p>
          <blockquote className="border-l-2 border-stone-900 pl-6">
            <p className="font-serif text-[1.25rem] text-stone-800 leading-relaxed italic">
              "Abaya yang tepat bukan hanya membuat kamu terlihat rapi, tapi juga lebih percaya diri dan berkelas dalam setiap langkah."
            </p>
          </blockquote>
          <p className="font-sans text-[15px] text-stone-600 leading-[1.85] mt-6">
            Abayakuy.Official hadir untuk memudahkan kamu mendapatkan abaya impian — dengan pengalaman belanja yang lebih personal, praktis, aman, dan terpercaya.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200 mb-14" />

        {/* Order channels */}
        <div>
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-stone-400 mb-6">04 — Cara Pemesanan</p>
          <p className="font-sans text-[14px] text-stone-600 leading-relaxed mb-8">
            Untuk kenyamanan dan keamanan transaksi, pemesanan hanya tersedia melalui Shopee dan WhatsApp resmi kami.
          </p>
          <ContactCards />
        </div>
      </section>

      {/* ─── Bottom brand stamp ─── */}
      <section className="border-t border-stone-200 py-12 text-center">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-stone-300">
          Abayakuy.Official — Jastip Abaya Mesir
        </p>
      </section>

    </main>
  );
}
