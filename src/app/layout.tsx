import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { ClientErrorFilter } from '@/components/ui/ClientErrorFilter';
import { SITE_URL } from '@/lib/site';

// Root layout is intentionally minimal.
// - NO WalletProviders here (only public wallet routes mount it via (public)/layout).
// - NO AuthProvider here (only /admin/* mounts it via (admin)/layout).

const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  // metadataBase: satu sumber kebenaran via SITE_URL — tidak pernah localhost.
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'KORAMP — Crypto On/Off-Ramp Beta',
    template: '%s · KORAMP',
  },

  // Description jujur: produk dalam beta, tidak mengklaim "terpercaya" atau "instan".
  description:
    'KORAMP adalah platform beta crypto on/off-ramp untuk pasar Indonesia. ' +
    'Beli SOL, ETH, atau BNB dengan Rupiah, atau jual crypto dan terima IDR ke rekening bank. ' +
    'Hubungkan wallet — tanpa daftar akun. Produk dalam tahap pengembangan aktif.',

  // keywords dihapus — tidak berguna untuk SEO modern (diabaikan Google sejak 2009).

  alternates: {
    canonical: SITE_URL,
  },

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
    title: 'KORAMP — Crypto On/Off-Ramp Beta',
    description:
      'Platform beta untuk beli SOL, ETH, BNB dengan Rupiah atau jual crypto ke IDR. ' +
      'Wallet-first, tanpa daftar akun. Masih dalam pengembangan aktif.',
    type: 'website',
    url: SITE_URL,
    siteName: 'KORAMP',
    locale: 'id_ID',
    images: [
      {
        // URL absolut — tidak bergantung metadataBase agar tidak ada risiko localhost.
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'KORAMP — Crypto On/Off-Ramp Beta',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'KORAMP — Crypto On/Off-Ramp Beta',
    description:
      'Beli SOL, ETH, BNB dengan Rupiah atau jual crypto ke IDR. Tanpa daftar akun. Beta.',
    images: [OG_IMAGE],
    site: '@korampxyz',
  },

  // Isi setelah mendapat kode dari Google Search Console:
  // verification: { google: 'GOOG_VERIFICATION_CODE' },
};

/** JSON-LD Organization + WebSite — data yang diketahui, tanpa mengarang. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'KORAMP',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'Kipramp@proton.me',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'KORAMP',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <ClientErrorFilter />
        {children}
      </body>
    </html>
  );
}
