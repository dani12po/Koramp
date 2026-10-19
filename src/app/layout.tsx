import type { Metadata } from 'next';
import './globals.css';
// Official Solana wallet-adapter modal styles (static CSS only — no wallet
// JS enters the server graph; providers stay mounted on public routes only).
import '@solana/wallet-adapter-react-ui/styles.css';
import { ClientErrorFilter } from '@/components/ui/ClientErrorFilter';

// Root layout is intentionally minimal (P2).
// - NO WalletProviders here (only public wallet routes mount it via (public)/layout).
// - NO AuthProvider here (only /admin/* mounts it via (admin)/layout).
// Route groups (public)/(admin) preserve public URLs while splitting bundles.

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_APP_URL ?? '').trim() || 'https://www.koramp.xyz'),
  title: {
    default: 'KORAMP: Top Up & Sell Crypto with IDR',
    template: '%s · KORAMP',
  },
  description:
    'Beli SOL, ETH, BNB dengan Rupiah atau jual crypto dan terima IDR langsung ke rekening bank. Cukup hubungkan wallet, tanpa daftar akun.',
  keywords: [
    'beli crypto IDR',
    'jual crypto rupiah',
    'top up SOL ETH BNB',
    'koramp',
    'kripto Indonesia',
    'on-ramp crypto Indonesia',
    'off-ramp crypto Indonesia',
    'beli solana IDR',
    'jual solana rupiah',
    'crypto QRIS',
    'tukar rupiah crypto',
    'crypto ke rekening bank Indonesia',
    'MoonPay Indonesia',
    'crypto on ramp off ramp',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'KORAMP: Crypto On/Off-Ramp Marketplace',
    description:
      'Beli SOL, ETH, BNB dengan Rupiah atau jual crypto dan terima IDR ke rekening bank. Wallet-first, tanpa daftar akun.',
    type: 'website',
    url: 'https://www.koramp.xyz',
    siteName: 'KORAMP',
    locale: 'id_ID',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KORAMP — Crypto On/Off-Ramp IDR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KORAMP: Top Up & Sell Crypto with IDR',
    description:
      'Beli SOL, ETH, BNB dengan Rupiah atau jual crypto dan terima IDR ke rekening bank. Tanpa daftar akun.',
    images: ['/og-image.png'],
    site: '@korampxyz',
  },
  verification: {
    // Isi dengan kode verifikasi dari Google Search Console setelah submit
    // google: 'GOOG_VERIFICATION_CODE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body>
        <ClientErrorFilter />
        {children}
      </body>
    </html>
  );
}
