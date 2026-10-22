# KORAMP — Crypto On/Off-Ramp (Beta)

Platform beta crypto on/off-ramp untuk pasar Indonesia.
Beli SOL, ETH, atau BNB dengan Rupiah, atau jual crypto ke IDR.
Wallet-first — tanpa daftar akun.

> **Status**: Beta / pengembangan aktif. Bukan layanan keuangan berlisensi.

## Stack

- Next.js 14 · TypeScript · Prisma · PostgreSQL (Neon)
- Wagmi + RainbowKit (EVM) · Solana Wallet Adapter
- MoonPay (payment gateway — on-ramp/off-ramp, dalam integrasi)
- Xendit (QRIS payment collection + IDR bank payouts — Payments API v3 + Payout API v3)

## Setup Lokal

```bash
cp .env.example .env
# Isi semua nilai di .env

npm install
npx prisma db push
npm run admin:setup   # generate admin key (jalankan lokal, jangan commit output)
npm run dev
```

## Environment Variables — Vercel Production

Wajib diset di **Vercel → Project Settings → Environment Variables**
untuk environment **Production** (dan Preview jika perlu):

### Wajib

| Variable | Contoh nilai | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Neon PostgreSQL production URL |
| `NEXT_PUBLIC_APP_URL` | `https://www.koramp.xyz` | **Wajib diset ke domain production.** Jangan isi `localhost`. Dipakai untuk canonical, OG image, sitemap, robots. |
| `XENDIT_API_KEY` | `xnd_production_...` | Secret key Xendit (live mode) |
| `XENDIT_MODE` | `production` | `sandbox` atau `production` |
| `XENDIT_WEBHOOK_TOKEN` | `...` | x-callback-token dari Xendit Dashboard |
| `JWT_SECRET` | 64-char base64 random | Secret untuk JWT session admin |
| `ADMIN_ACCESS_KEY` | 64-char hex | Generate via `npm run admin:setup` |
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | RPC server-side Solana |
| `BASE_RPC_URL` | `https://mainnet.base.org` | RPC server-side Base |
| `BSC_RPC_URL` | `https://bsc-dataseed.binance.org` | RPC server-side BSC |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | RPC client-side Solana |
| `NEXT_PUBLIC_BASE_RPC_URL` | `https://mainnet.base.org` | RPC client-side Base |
| `NEXT_PUBLIC_BSC_RPC_URL` | `https://bsc-dataseed.binance.org` | RPC client-side BSC |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | `8453` | Chain ID Base mainnet |
| `NEXT_PUBLIC_BSC_CHAIN_ID` | `56` | Chain ID BSC mainnet |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `abc123...` | Dari cloud.walletconnect.com |
| `SOLANA_PLATFORM_PRIVATE_KEY` | base58 | Private key hot wallet Solana platform |
| `BASE_PLATFORM_PRIVATE_KEY` | 0x-hex | Private key hot wallet Base platform |
| `BSC_PLATFORM_PRIVATE_KEY` | 0x-hex | Private key hot wallet BSC platform |
| `CRON_SECRET` | random string | Bearer token untuk /api/cron/* |

### Opsional (Production)

| Variable | Default | Keterangan |
|---|---|---|
| `SOLANA_NETWORK` | `mainnet` | `mainnet` atau `devnet` |
| `RATE_LIMIT_STORE` | `memory` | `memory` (single instance) atau `distributed` (butuh Redis) |
| `RATE_LIMIT_REDIS_URL` | — | Wajib jika `RATE_LIMIT_STORE=distributed` |
| `ALCHEMY_API_KEY` | — | Untuk indexer EVM deposit (alchemy_getAssetTransfers) |
| `BLOCKSCOUT_BASE_URL` | — | Custom Blockscout URL untuk Base |
| `ADMIN_TOTP_SECRET` | — | Secret TOTP 2FA admin (generate via `npm run admin:totp-setup`) |
| `ADMIN_DASHBOARD_VISIBLE` | `true` | `false` untuk sembunyikan link admin di UI production |

### Catatan Keamanan

- **Jangan pernah** mengisi `NEXT_PUBLIC_APP_URL=http://localhost:3000` di environment Production Vercel.
  Ini akan menyebabkan `og:image`, `canonical`, dan `twitter:image` mengarah ke localhost.
- Semua key yang diawali `NEXT_PUBLIC_` akan terekspos ke browser — jangan isi dengan secret.
- Private key platform wallet hanya boleh ada di environment Production Vercel, tidak di repo.

## SEO & Crawlability

- `NEXT_PUBLIC_APP_URL` harus diset di Vercel Production agar `og:image`, `canonical`, dan sitemap berisi URL production.
- `/sitemap.xml` dan `/robots.txt` di-generate dinamis via App Router (`app/sitemap.ts`, `app/robots.ts`).
- `/public/og-image.png` perlu dibuat manual (1200×630px) — belum tersedia, OG image fallback ke file yang tidak ada.

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run admin:setup  # generate admin access key
npm run admin:totp-setup  # generate TOTP secret untuk 2FA
```
