/**
 * /terms — Syarat & Ketentuan KORAMP (DRAFT)
 *
 * TODO (WAJIB sebelum produksi):
 * - Ganti semua placeholder [...] dengan informasi nyata
 * - Review oleh konsultan hukum sebelum dipublikasikan
 * - Perbarui termsVersion di admin dashboard setelah perubahan material
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan layanan KORAMP.',
  alternates: { canonical: `${SITE_URL}/terms` },
};

// Versi ini HARUS selaras dengan nilai termsVersion di RewardConfig (admin dashboard).
// Lihat: src/lib/rewards.ts — getRewardConfig().termsVersion
// Format: "YYYY-MM-vN"
const TERMS_VERSION = '2026-09-v1'; // TODO: perbarui setelah perubahan material

const LAST_UPDATED = 'September 2026'; // TODO: perbarui tiap revisi

const SECTIONS = [
  {
    title: '1. Tentang KORAMP',
    body: [
      // TODO: [NAMA_ENTITAS_HUKUM] — isi nama badan hukum yang mengoperasikan KORAMP
      // TODO: [ALAMAT] — isi alamat entitas
      'KORAMP adalah platform beta crypto on/off-ramp yang dioperasikan oleh [NAMA_ENTITAS_HUKUM], beralamat di [ALAMAT].',
      'Layanan ini memungkinkan pengguna menukar Rupiah (IDR) dengan cryptocurrency (SOL, ETH, BNB) dan sebaliknya, menggunakan wallet kripto sebagai identitas tanpa pendaftaran akun.',
      'KORAMP adalah Software MVP dalam tahap pengembangan aktif. Layanan ini bukan merupakan lembaga keuangan berlisensi, penyedia layanan pembayaran berlisensi, atau bursa kripto berlisensi di Indonesia atau yurisdiksi manapun.',
    ],
  },
  {
    title: '2. Penerimaan Ketentuan',
    body: [
      'Dengan menggunakan layanan KORAMP — termasuk menghubungkan wallet, membuat quote, atau melakukan transaksi — Anda menyatakan telah membaca, memahami, dan menyetujui ketentuan ini.',
      'Jika Anda tidak setuju dengan ketentuan ini, jangan gunakan layanan KORAMP.',
    ],
  },
  {
    title: '3. Status Beta dan Keterbatasan',
    body: [
      'Platform saat ini beroperasi dalam mode testnet/beta. Jaringan yang aktif: Solana Devnet, Base Sepolia, dan BSC Testnet. Token di jaringan ini tidak memiliki nilai uang nyata.',
      'Kami tidak memberikan jaminan ketersediaan, keakuratan harga, atau keberhasilan transaksi. Layanan dapat berubah, dihentikan sementara, atau ditutup sewaktu-waktu tanpa pemberitahuan sebelumnya.',
      'Jangan menggunakan platform ini untuk transaksi yang melibatkan aset bernilai nyata selama fase testnet.',
    ],
  },
  {
    title: '4. Payment Gateway Pihak Ketiga',
    body: [
      // TODO: perbarui jika payment gateway berubah
      'Layanan on-ramp dan off-ramp diproses melalui MoonPay sebagai merchant of record. MoonPay bertanggung jawab atas proses KYC/AML, verifikasi pembayaran, dan kepatuhan regulasi transaksi.',
      'Ketersediaan layanan MoonPay bergantung pada wilayah dan aset yang didukung. KORAMP tidak bertanggung jawab atas penolakan transaksi, keterlambatan, atau pembatasan yang diterapkan oleh MoonPay.',
      'Dengan menggunakan layanan ini, Anda juga tunduk pada syarat dan ketentuan MoonPay yang berlaku.',
    ],
  },
  {
    title: '5. Wallet dan Kepemilikan Aset',
    body: [
      'KORAMP bersifat non-kustodial. Kami tidak pernah memegang, menyimpan, atau mengontrol private key, seed phrase, atau recovery phrase Anda.',
      'Anda bertanggung jawab penuh atas keamanan wallet Anda. KORAMP tidak dapat memulihkan aset yang hilang akibat kehilangan akses wallet, kesalahan pengiriman ke alamat yang salah, atau jaringan yang tidak kompatibel.',
      'Pastikan alamat wallet tujuan dan jaringan yang dipilih sudah benar sebelum mengonfirmasi transaksi. Transaksi blockchain bersifat irreversibel.',
    ],
  },
  {
    title: '6. Biaya',
    body: [
      'Biaya layanan ditampilkan secara transparan dalam quote sebelum Anda mengonfirmasi transaksi. Biaya mencakup: spread harga pasar, service fee, network fee (biaya gas blockchain), dan pajak yang berlaku.',
      'Quote berlaku selama batas waktu yang ditampilkan. Setelah kadaluarsa, quote baru diperlukan dan harga dapat berbeda.',
      'Untuk detail lengkap struktur biaya, lihat halaman Biaya & Fee.',
    ],
  },
  {
    title: '7. Larangan Penggunaan',
    body: [
      'Anda dilarang menggunakan layanan KORAMP untuk: pencucian uang, pendanaan terorisme, penipuan, manipulasi pasar, atau aktivitas lain yang melanggar hukum yang berlaku.',
      'KORAMP berhak menolak, membatalkan, atau menangguhkan transaksi yang dicurigai melanggar ketentuan ini atau hukum yang berlaku.',
    ],
  },
  {
    title: '8. Batasan Tanggung Jawab',
    body: [
      // TODO: review klausul ini dengan konsultan hukum
      'Sejauh diizinkan hukum yang berlaku, KORAMP tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan.',
      'Total tanggung jawab KORAMP kepada Anda untuk klaim apapun tidak akan melebihi jumlah yang Anda bayarkan dalam transaksi yang memunculkan klaim tersebut.',
    ],
  },
  {
    title: '9. Perubahan Ketentuan',
    body: [
      'Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan material akan diinformasikan melalui situs atau email jika ada. Penggunaan layanan setelah perubahan dipublikasikan berarti penerimaan terhadap ketentuan yang diperbarui.',
      `Versi ketentuan saat ini: ${TERMS_VERSION} (${LAST_UPDATED}).`,
    ],
  },
  {
    title: '10. Hukum yang Berlaku',
    body: [
      // TODO: [YURISDIKSI] — isi yurisdiksi yang berlaku, misal "Republik Indonesia"
      'Ketentuan ini diatur oleh hukum [YURISDIKSI]. Setiap sengketa akan diselesaikan melalui [MEKANISME_PENYELESAIAN_SENGKETA].',
    ],
  },
  {
    title: '11. Hubungi Kami',
    body: [
      // TODO: [EMAIL_KONTAK] — isi email resmi
      'Untuk pertanyaan mengenai ketentuan ini, hubungi kami di: [EMAIL_KONTAK] atau melalui halaman Kontak.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Legal</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-brand-400" aria-hidden />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white">
            Syarat &amp; Ketentuan
          </h1>
        </div>

        {/* Draft notice */}
        <div className="sm:pl-12 mb-6">
          <p className="text-gray-400 text-sm leading-relaxed mb-1">
            Versi: <span className="font-mono text-gray-300">{TERMS_VERSION}</span> · Terakhir diperbarui: {LAST_UPDATED}
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-medium">
            ⚠️ DRAFT — Belum direviu secara hukum. Placeholder [..] harus diisi sebelum produksi.
          </div>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <section key={s.title} className="bg-surface-1 border border-line-subtle rounded-2xl p-5 sm:p-6">
              <h2 className="text-[#F5F5F5] font-semibold text-[15px] mb-3">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-[#8B8B93] text-sm leading-relaxed mb-2 last:mb-0">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="bg-surface-1 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 mt-4">
          <p className="text-yellow-300 text-xs font-semibold mb-1">Dokumen ini adalah draft.</p>
          <p className="text-[#8B8B93] text-xs leading-relaxed">
            Isi ini belum direviu secara hukum dan tidak merupakan nasihat hukum.
            Semua placeholder [..] harus diisi dan dokumen ini harus divalidasi oleh konsultan hukum
            sebelum layanan beroperasi secara komersial.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/privacy" className="btn-ghost text-sm">Kebijakan Privasi</Link>
          <Link href="/risk" className="btn-ghost text-sm">Risiko</Link>
          <Link href="/" className="btn-ghost text-sm">← Beranda</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
