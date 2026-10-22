'use client';

/**
 * NetBanner — banner status jaringan testnet/beta.
 *
 * Tampil hanya ketika NEXT_PUBLIC_NETWORK_MODE != 'mainnet'.
 * Saat mainnet aktif, komponen ini render null otomatis — tidak perlu
 * mengubah kode, cukup set env var di Vercel.
 *
 * Dipakai di:
 * - Navbar (atas, di bawah nav bar)
 * - Halaman Top Up / Sell (dalam alur, sebelum form)
 */

import { IS_TESTNET } from '@/lib/network-mode';
import { FlaskConical } from 'lucide-react';

interface Props {
  /** 'header' = banner tipis di bawah navbar | 'inline' = dalam alur form */
  variant?: 'header' | 'inline';
}

export function NetBanner({ variant = 'header' }: Props) {
  if (!IS_TESTNET) return null;

  if (variant === 'header') {
    return (
      <div
        role="status"
        aria-label="Status jaringan"
        className="w-full bg-yellow-500/10 border-b border-yellow-500/20 py-1.5 px-4 flex items-center justify-center gap-2"
      >
        <FlaskConical className="w-3 h-3 text-yellow-400 flex-shrink-0" aria-hidden />
        <p className="text-yellow-300 text-xs font-medium text-center">
          <span className="font-semibold">Testnet / Beta</span>
          {' '}— Solana Devnet · Base Sepolia · BSC Testnet.
          Dana testnet tidak bernilai nyata. Jangan gunakan untuk transaksi sungguhan.
        </p>
      </div>
    );
  }

  // inline — dalam form Top Up / Sell
  return (
    <div
      role="status"
      aria-label="Peringatan jaringan testnet"
      className="flex items-start gap-2.5 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
    >
      <FlaskConical className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="text-yellow-300 text-xs font-semibold mb-0.5">Testnet / Beta</p>
        <p className="text-yellow-200/70 text-xs leading-relaxed">
          Platform berjalan di jaringan test. Token tidak bernilai nyata.
          Jangan kirim aset mainnet ke alamat ini.
        </p>
      </div>
    </div>
  );
}
