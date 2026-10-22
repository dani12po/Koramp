import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AlertTriangle } from 'lucide-react';
import { SITE_URL } from '@/lib/site';
import { IS_TESTNET } from '@/lib/network-mode';

export const metadata: Metadata = {
  title: 'Pengungkapan Risiko',
  description: 'Risiko yang perlu dipahami sebelum menggunakan layanan KORAMP.',
  alternates: { canonical: `${SITE_URL}/risk` },
};

const SECTIONS = [
  {
    title: 'Status Platform: Testnet / Beta',
    highlight: true,
    body: [
      'KORAMP saat ini beroperasi dalam mode testnet dan beta tertutup. Jaringan aktif: Solana Devnet, Base Sepolia, dan BSC Testnet. Aset di jaringan ini TIDAK memiliki nilai uang nyata.',
      'Jangan mengirim aset dari jaringan mainnet ke alamat yang diberikan platform ini selama fase testnet. KORAMP tidak dapat memulihkan aset mainnet yang salah dikirim.',
      'Platform dalam pengembangan aktif. Fitur, antarmuka, dan perilaku dapat berubah tanpa pemberitahuan.',
    ],
  },
  {
    title: 'Risiko Cryptocurrency',
    highlight: false,
    body: [
      'Harga cryptocurrency sangat volatil. Nilai aset yang Anda beli dapat turun drastis dalam waktu singkat, termasuk menjadi nol.',
      'Transaksi blockchain bersifat irreversibel. Setelah dikirim ke blockchain, transaksi tidak dapat dibatalkan atau diubah.',
      'Jaringan blockchain dapat mengalami kemacetan, kenaikan biaya gas, atau gangguan yang di luar kendali KORAMP.',
    ],
  },
  {
    title: 'Risiko Alamat dan Jaringan',
    highlight: false,
    body: [
      'Selalu verifikasi alamat wallet tujuan sebelum mengirim. Kesalahan satu karakter pada alamat dapat menyebabkan kehilangan aset permanen.',
      'Pastikan jaringan yang dipilih sesuai dengan jaringan wallet Anda. Mengirim aset ke jaringan yang salah dapat menyebabkan kehilangan aset permanen.',
      'Untuk order Sell: pastikan data rekening bank sudah benar. KORAMP memproses payout ke rekening yang Anda berikan.',
    ],
  },
  {
    title: 'Risiko Ketergantungan Pihak Ketiga',
    highlight: false,
    body: [
      'Layanan Top Up bergantung pada Xendit untuk pemrosesan QRIS dan Xendit Payout v3 untuk disbursement IDR ke rekening bank. Gangguan pada infrastruktur Xendit dapat mempengaruhi ketersediaan layanan.',
      'Layanan juga bergantung pada penyedia RPC blockchain (Alchemy, public endpoints), penyedia harga pasar (Binance, CoinGecko), dan infrastruktur hosting. Kegagalan pada pihak ketiga ini dapat menyebabkan gangguan layanan.',
      'KORAMP memantau status layanan pihak ketiga tetapi tidak dapat menjamin ketersediaan penuh di luar kendalinya.',
    ],
  },
  {
    title: 'Risiko Regulasi',
    highlight: false,
    body: [
      'Regulasi cryptocurrency di Indonesia dan dunia terus berkembang. Perubahan regulasi dapat mempengaruhi ketersediaan atau legalitas layanan ini.',
      'KORAMP adalah Software MVP dan bukan lembaga keuangan berlisensi. Verifikasi kepatuhan regulasi di yurisdiksi Anda sebelum menggunakan layanan ini.',
    ],
  },
  {
    title: 'Tidak Ada Jaminan',
    highlight: false,
    body: [
      'Layanan KORAMP disediakan "sebagaimana adanya" tanpa jaminan apapun.',
      'KORAMP tidak menjamin keakuratan harga, ketersediaan layanan, keberhasilan transaksi, atau kecepatan penyelesaian.',
      'Data volume transaksi dan statistik yang ditampilkan di situs adalah informasi historis dan tidak menjamin kinerja di masa mendatang.',
    ],
  },
];

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Legal</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-400" aria-hidden />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white">
            Pengungkapan Risiko
          </h1>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-2 sm:pl-12">
          Baca dan pahami risiko berikut sebelum menggunakan layanan KORAMP.
        </p>
        {IS_TESTNET && (
          <div className="sm:pl-12 mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-medium">
              Platform sedang berjalan di jaringan Testnet / Beta
            </div>
          </div>
        )}

        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className={`border rounded-2xl p-5 sm:p-6 ${
                s.highlight
                  ? 'bg-yellow-500/5 border-yellow-500/30'
                  : 'bg-surface-1 border-line-subtle'
              }`}
            >
              <h2 className={`font-semibold text-[15px] mb-3 ${s.highlight ? 'text-yellow-200' : 'text-[#F5F5F5]'}`}>
                {s.highlight && <AlertTriangle className="w-4 h-4 inline mr-1.5 mb-0.5" aria-hidden />}
                {s.title}
              </h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-[#8B8B93] text-sm leading-relaxed mb-2 last:mb-0">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="bg-surface-1 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 mt-4">
          <p className="text-yellow-300 text-xs font-semibold mb-1">Dokumen ini adalah draft.</p>
          <p className="text-[#8B8B93] text-xs leading-relaxed">
            Isi ini belum direviu secara hukum dan tidak merupakan nasihat hukum atau keuangan.
            Harap konsultasikan dengan profesional sebelum membuat keputusan investasi.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/terms" className="btn-ghost text-sm">Syarat &amp; Ketentuan</Link>
          <Link href="/fees" className="btn-ghost text-sm">Biaya &amp; Fee</Link>
          <Link href="/" className="btn-ghost text-sm">&#8592; Beranda</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
