import React from 'react';
import ContactCards from '../components/ContactCards';

export default function KebijakanPengiriman() {
  return (
    <main className="pt-28 min-h-screen bg-[#faf8f6]">

      {/* ─── Hero ─── */}
      <section className="bg-[#1a1c1c] py-16 px-8">
        <div className="max-w-[760px] mx-auto">
          <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-white/35 mb-4">
            Informasi
          </p>
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-white leading-tight">
            Kebijakan Pengiriman
          </h1>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="max-w-[760px] mx-auto px-8 py-16 space-y-12">

        {/* Intro */}
        <p className="font-sans text-[15px] text-stone-600 leading-[1.85]">
          Kami berkomitmen untuk mengirimkan setiap produk dengan aman dan tepat waktu.
        </p>

        <div className="border-t border-stone-200" />

        {/* Estimasi Pengiriman */}
        <div>
          <SectionLabel index="01" title="Estimasi Pengiriman" />
          <p className="font-sans text-[14px] text-stone-600 leading-[1.85]">
            Pesanan akan diproses dalam waktu <strong className="text-stone-800">15–20 hari kerja</strong> setelah
            pembayaran dikonfirmasi. Pada periode tertentu seperti promo atau launching, waktu pemrosesan dapat
            sedikit lebih lama.
          </p>
        </div>

        <div className="border-t border-stone-200" />

        {/* Biaya Pengiriman */}
        <div>
          <SectionLabel index="02" title="Biaya Pengiriman" />
          <ul className="space-y-3">
            <Item>
              Biaya pengiriman akan dihitung otomatis saat checkout sesuai lokasi dan layanan kurir yang dipilih.
            </Item>
            <Item>
              Untuk pengiriman internasional, biaya pajak atau bea masuk (jika ada) menjadi tanggung jawab pembeli.
            </Item>
          </ul>
        </div>

        <div className="border-t border-stone-200" />

        {/* Resi & Pelacakan */}
        <div>
          <SectionLabel index="03" title="Resi & Pelacakan" />
          <p className="font-sans text-[14px] text-stone-600 leading-[1.85]">
            Nomor resi akan dikirimkan melalui <strong className="text-stone-800">WhatsApp atau email</strong> setelah
            pesanan dikirim.
          </p>
        </div>

        <div className="border-t border-stone-200" />

        {/* Kebijakan Pengembalian */}
        <div>
          <SectionLabel index="04" title="Kebijakan Pengembalian & Penukaran" />
          <p className="font-sans text-[14px] text-stone-600 leading-[1.85] mb-6">
            Kami ingin memastikan setiap produk yang Anda terima sesuai harapan.
          </p>

          <SubSection title="Syarat Pengembalian / Penukaran">
            <p className="font-sans text-[14px] text-stone-600 leading-[1.85] mb-3">
              Kami menerima pengajuan dalam waktu maksimal <strong className="text-stone-800">3 hari</strong> setelah
              barang diterima, dengan ketentuan:
            </p>
            <ul className="space-y-2">
              <Item>Produk cacat atau rusak</Item>
              <Item>Produk yang diterima tidak sesuai pesanan</Item>
            </ul>
          </SubSection>

          <SubSection title="Kondisi Barang">
            <ul className="space-y-2">
              <Item>Belum pernah dipakai atau dicuci</Item>
              <Item>Masih dalam kondisi asli lengkap dengan tag &amp; packaging</Item>
              <Item>Wajib menyertakan video unboxing sebagai bukti</Item>
            </ul>
          </SubSection>

          <SubSection title="Produk yang Tidak Dapat Dikembalikan">
            <ul className="space-y-2">
              <Item>Produk sale</Item>
              <Item>Kerusakan akibat kesalahan penggunaan</Item>
            </ul>
          </SubSection>

          <SubSection title="Proses Pengajuan">
            <ol className="space-y-2 list-none">
              {[
                "Hubungi kami via WhatsApp atau Instagram maksimal 3 hari setelah barang diterima",
                "Sertakan bukti pesanan & video unboxing",
                "Tim kami akan membantu proses selanjutnya",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-sans text-[10px] font-bold text-stone-400 mt-0.5 w-4 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-[14px] text-stone-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </SubSection>

          <SubSection title="Refund">
            <p className="font-sans text-[14px] text-stone-600 leading-[1.85]">
              Proses refund memakan waktu <strong className="text-stone-800">3–7 hari kerja</strong> setelah barang
              kami terima dan periksa.
            </p>
          </SubSection>

          <SubSection title="Biaya Pengiriman Retur">
            <p className="font-sans text-[14px] text-stone-600 leading-[1.85]">
              Ditanggung oleh <strong className="text-stone-800">Pembeli</strong>.
            </p>
          </SubSection>
        </div>

        <div className="border-t border-stone-200" />

        {/* Kontak */}
        <div>
          <SectionLabel index="05" title="Kontak" />
          <p className="font-sans text-[14px] text-stone-600 leading-[1.85] mb-6">
            Untuk pertanyaan lebih lanjut, silakan hubungi:
          </p>
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span className="font-sans text-[9px] tracking-[0.3em] text-stone-300 uppercase select-none">{index}</span>
      <h2 className="font-serif text-[1.2rem] text-stone-900">{title}</h2>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase font-semibold text-stone-500 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 w-1 h-1 bg-stone-400 rounded-full shrink-0" />
      <span className="font-sans text-[14px] text-stone-600 leading-relaxed">{children}</span>
    </li>
  );
}
