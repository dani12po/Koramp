/**
 * /fees — Struktur Biaya KORAMP
 *
 * Server component: membaca fee defaults dari konstanta yang sama
 * dengan quote engine (src/app/api/admin/fees/route.ts DEFAULTS).
 *
 * Catatan: nilai aktif dapat dikonfigurasi admin dari dashboard.
 * Halaman ini menampilkan struktur dan formula, bukan angka live dari DB
 * (untuk menghindari DB call tanpa auth di halaman publik).
 * Angka default di bawah diambil dari konstanta DEFAULTS yang sama dengan
 * yang dipakai quote engine saat tidak ada konfigurasi admin.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Coins } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Biaya & Fee',
  description: 'Struktur biaya layanan KORAMP: spread, service fee, network fee, dan pajak.',
  alternates: { canonical: `${SITE_URL}/fees` },
};

// ─── Sumber yang sama dengan src/app/api/admin/fees/route.ts DEFAULTS ─────────
// Jika admin mengubah nilai via dashboard, angka di sini adalah default fallback.
// Formula quote: totalIdr = idrAmount × (1 + serviceFeeRate + networkFeeRate + taxRate)
const FEE_DEFAULTS = {
  serviceFeeRate: 0.005,   // 0.5%
  networkFeeRate: 0.001,   // 0.1%
  taxRate: 0.001,          // 0.1%
  minOrderIdr: 50_000,     // Rp 50.000
  maxOrderIdr: 100_000_000, // Rp 100.000.000
} as const;

function fmtPct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}
function fmtIdr(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function FeesPage() {
  const totalFeeRate = FEE_DEFAULTS.serviceFeeRate + FEE_DEFAULTS.networkFeeRate + FEE_DEFAULTS.taxRate;

  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Transparansi</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Coins className="w-5 h-5 text-brand-400" aria-hidden />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white">
            Biaya &amp; Fee
          </h1>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 sm:pl-12">
          Semua biaya ditampilkan di quote sebelum Anda mengonfirmasi transaksi.
          Tidak ada biaya tersembunyi.
        </p>

        {/* Struktur biaya */}
        <section className="bg-surface-1 border border-line-subtle rounded-2xl p-5 sm:p-6 mb-4">
          <h2 className="text-[#F5F5F5] font-semibold text-[15px] mb-4">Komponen Biaya</h2>
          <div className="space-y-3">
            {[
              {
                label: 'Service Fee',
                value: fmtPct(FEE_DEFAULTS.serviceFeeRate),
                desc: 'Biaya layanan KORAMP untuk memproses transaksi.',
              },
              {
                label: 'Network Fee',
                value: fmtPct(FEE_DEFAULTS.networkFeeRate),
                desc: 'Estimasi biaya gas blockchain (Solana, Base, atau BNB Chain).',
              },
              {
                label: 'Pajak',
                value: fmtPct(FEE_DEFAULTS.taxRate),
                desc: 'Pajak transaksi yang berlaku.',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-line-subtle last:border-0">
                <div>
                  <p className="text-[#F5F5F5] text-sm font-medium">{item.label}</p>
                  <p className="text-[#8B8B93] text-xs mt-0.5">{item.desc}</p>
                </div>
                <span className="text-[#D4B78F] font-mono text-sm font-semibold whitespace-nowrap">
                  {item.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[#F5F5F5] text-sm font-semibold">Total Fee</p>
              <span className="text-[#D4B78F] font-mono text-sm font-semibold">
                {fmtPct(totalFeeRate)}
              </span>
            </div>
          </div>
        </section>

        {/* Batas order */}
        <section className="bg-surface-1 border border-line-subtle rounded-2xl p-5 sm:p-6 mb-4">
          <h2 className="text-[#F5F5F5] font-semibold text-[15px] mb-4">Batas Order</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1e] rounded-xl p-4 text-center">
              <p className="text-[#8B8B93] text-xs mb-1">Minimum</p>
              <p className="text-[#F5F5F5] font-semibold text-base">{fmtIdr(FEE_DEFAULTS.minOrderIdr)}</p>
            </div>
            <div className="bg-[#1a1a1e] rounded-xl p-4 text-center">
              <p className="text-[#8B8B93] text-xs mb-1">Maksimum</p>
              <p className="text-[#F5F5F5] font-semibold text-base">{fmtIdr(FEE_DEFAULTS.maxOrderIdr)}</p>
            </div>
          </div>
        </section>

        {/* Formula */}
        <section className="bg-surface-1 border border-line-subtle rounded-2xl p-5 sm:p-6 mb-4">
          <h2 className="text-[#F5F5F5] font-semibold text-[15px] mb-3">Formula Harga</h2>
          <div className="bg-[#1a1a1e] rounded-xl p-4 font-mono text-xs text-[#cfcfd4] leading-relaxed overflow-x-auto">
            <p>{'// Top Up (Beli crypto dengan IDR)'}</p>
            <p className="mt-1">
              totalIdr = idrAmount × (1 + serviceFee + networkFee + pajak)
            </p>
            <p className="mt-2 text-[#8b8b93]">
              {`// Contoh: Rp 1.000.000 × (1 + ${FEE_DEFAULTS.serviceFeeRate} + ${FEE_DEFAULTS.networkFeeRate} + ${FEE_DEFAULTS.taxRate})`}
            </p>
            <p className="text-[#8b8b93]">
              {`//       = Rp ${(1_000_000 * (1 + totalFeeRate)).toLocaleString('id-ID')}`}
            </p>
          </div>
          <p className="text-[#8B8B93] text-xs mt-3 leading-relaxed">
            Quote dikunci saat dibuat. Harga tidak berubah selama masa berlaku quote
            (biasanya 60 detik). Setelah kadaluarsa, quote baru diperlukan dan harga pasar
            bisa berbeda.
          </p>
        </section>

        {/* Biaya tambahan SOL */}
        <section className="bg-surface-1 border border-line-subtle rounded-2xl p-5 sm:p-6 mb-4">
          <h2 className="text-[#F5F5F5] font-semibold text-[15px] mb-3">
            Biaya Khusus SOL — Associated Token Account (ATA)
          </h2>
          <p className="text-[#8B8B93] text-sm leading-relaxed">
            Untuk transaksi SOL, jika wallet tujuan Anda belum memiliki Associated Token Account (ATA),
            biaya pembuatan ATA (~0.002 SOL) akan dikenakan. Biaya ini bersifat one-time dan
            dipotong dari SOL yang Anda terima. Jika muncul, akan ditampilkan secara eksplisit
            dalam quote.
          </p>
        </section>

        {/* Disclaimer */}
        <div className="bg-surface-1 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 mt-4">
          <p className="text-yellow-300 text-xs font-semibold mb-1">Catatan</p>
          <p className="text-[#8B8B93] text-xs leading-relaxed">
            Angka fee di atas adalah nilai default dan dapat dikonfigurasi oleh admin.
            Nilai aktif yang berlaku selalu ditampilkan dalam quote sebelum konfirmasi transaksi.
            Biaya payment gateway MoonPay belum termasuk dan dapat berbeda sesuai metode pembayaran dan wilayah.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/risk" className="btn-ghost text-sm">Pengungkapan Risiko</Link>
          <Link href="/terms" className="btn-ghost text-sm">Syarat &amp; Ketentuan</Link>
          <Link href="/" className="btn-ghost text-sm">← Beranda</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
