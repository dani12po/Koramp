# KORAMP — Crypto On/Off-Ramp (Beta)

Platform beta crypto on/off-ramp untuk pasar Indonesia.
Beli SOL, ETH, atau BNB dengan Rupiah, atau jual crypto ke IDR / e-wallet.
Wallet-first — tanpa daftar akun.

> **Status**: Beta / pengembangan aktif. Bukan layanan keuangan berlisensi.

---

## Stack

- **Framework**: Next.js 14 · TypeScript · Prisma · PostgreSQL (Neon)
- **Wallet**: Wagmi + RainbowKit (EVM) · Solana Wallet Adapter
- **Payment Top Up**: KiPay QRIS (on-ramp, tanpa KYC) — https://kipay.id
- **Payout Bank (Sell)**: Xendit Payout v3 (off-ramp, transfer ke rekening bank)
- **Payout E-Wallet (Sell)**: FYAS PPOB (off-ramp, top-up GoPay/OVO/ShopeePay/DANA) — https://ppob.fyas.my.id

---

## Alur Transaksi

### Top Up (Beli Crypto)
```
User bayar QRIS → KiPay konfirmasi → KORAMP kirim crypto dari hot wallet → selesai
```

### Sell (Jual Crypto) — Rekening Bank
```
User kirim crypto ke deposit address → KORAMP konfirmasi → Xendit Payout kirim IDR ke rekening bank
```

### Sell (Jual Crypto) — E-Wallet
```
User kirim crypto ke deposit address → KORAMP konfirmasi →
FYAS top-up nominal terdekat ke GoPay/OVO/ShopeePay/DANA (via nomor HP)
```
> Catatan: E-wallet menggunakan denominasi tetap. Nominal yang dikirim adalah denominasi terdekat
> di bawah total payout. Selisih diserap sebagai biaya FYAS.

---

## Setup Lokal

```bash
cp .env.example .env
# Isi semua nilai di .env

npm install
npx prisma db push
npm run admin:setup   # generate admin access key (jalankan lokal, jangan commit output)
npm run dev
```

---

## Environment Variables — Vercel Production

Wajib diset di **Vercel → Project Settings → Environment Variables → Production**:

### Database
| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooler URL |

### KiPay (Top Up — QRIS payment collection)
| Variable | Contoh | Keterangan |
|---|---|---|
| `KIPAY_API_BASE_URL` | `https://api.kipay.id/api/pay` | Jangan diubah |
| `KIPAY_API_KEY` | `apg_xxxxx` | Dari kipay.id → Settings → API Keys |
| `KIPAY_MODE` | `sandbox` / `production` | |
| `KIPAY_WEBHOOK_SECRET` | `...` | Dari kipay.id → Dashboard → Webhooks |

Set webhook URL di KiPay: `https://koramp.xyz/api/webhooks/kipay`

### Xendit (Sell — bank payout)
| Variable | Keterangan |
|---|---|
| `XENDIT_API_BASE_URL` | `https://api.xendit.co` |
| `XENDIT_API_KEY` | Secret key Xendit (live mode) |
| `XENDIT_WEBHOOK_TOKEN` | x-callback-token dari Xendit Dashboard |

Set webhook URL di Xendit: `https://koramp.xyz/api/webhooks/xendit/payout`

### FYAS (Sell — e-wallet payout: GoPay/OVO/ShopeePay/DANA)
| Variable | Keterangan |
|---|---|
| `FYAS_API_BASE_URL` | `https://ppob.fyas.my.id` |
| `FYAS_API_KEY` | API key dari ppob.fyas.my.id (daftar → langsung dapat) |
| `FYAS_WEBHOOK_SECRET` | Dari FYAS dashboard → Project → Webhook secret |

Set webhook URL di FYAS: `https://koramp.xyz/api/webhooks/fyas`

### Blockchain RPC
| Variable | Mainnet | Keterangan |
|---|---|---|
| `SOLANA_NETWORK` | `mainnet` | `devnet` untuk testnet |
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Server-side |
| `BASE_RPC_URL` | `https://mainnet.base.org` | Server-side |
| `BSC_RPC_URL` | `https://bsc-dataseed.binance.org` | Server-side |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | sama dengan atas | Client-side |
| `NEXT_PUBLIC_BASE_RPC_URL` | sama dengan atas | Client-side |
| `NEXT_PUBLIC_BSC_RPC_URL` | sama dengan atas | Client-side |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | `8453` | Mainnet |
| `NEXT_PUBLIC_BSC_CHAIN_ID` | `56` | Mainnet |

### Hot Wallet Platform (kirim crypto ke user)
| Variable | Keterangan |
|---|---|
| `SOLANA_PLATFORM_PRIVATE_KEY` | Base58 — hot wallet Solana |
| `BASE_PLATFORM_PRIVATE_KEY` | 0x-hex — hot wallet Base |
| `BSC_PLATFORM_PRIVATE_KEY` | 0x-hex — hot wallet BSC |

> ⚠️ Jangan pernah commit private key. Simpan di Vercel Environment Variables.

### App & Admin
| Variable | Nilai | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://www.koramp.xyz` | **Wajib** — jangan localhost |
| `NEXT_PUBLIC_NETWORK_MODE` | `testnet` / `mainnet` | Kontrol banner testnet |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `...` | Dari cloud.walletconnect.com |
| `NEXT_PUBLIC_ALLOW_TESTNET_IN_PROD` | `false` | `true` hanya untuk sandbox testing |
| `JWT_SECRET` | 64-char base64 random | Session admin |
| `ADMIN_ACCESS_KEY` | Generate via `npm run admin:setup` | Login admin |
| `ADMIN_TOTP_SECRET` | Generate via `npm run admin:totp-setup` | 2FA admin (opsional) |
| `CRON_SECRET` | Random hex 32 bytes | Bearer token untuk /api/cron/* |
| `QUOTE_TTL_SECONDS` | `300` | 5 menit — cukup untuk isi form bank/ewallet |

### Catatan Keamanan
- Semua key yang diawali `NEXT_PUBLIC_` terekspos ke browser — jangan isi dengan secret
- `KIPAY_API_KEY`, `FYAS_API_KEY`, `XENDIT_API_KEY` hanya boleh ada di server-side vars
- `NEXT_PUBLIC_APP_URL` **wajib** diisi `https://www.koramp.xyz` di Vercel Production — jika localhost, `og:image` dan `canonical` akan bocor ke localhost

---

## Scripts

```bash
npm run dev              # development server
npm run build            # production build
npm run admin:setup      # generate admin access key
npm run admin:totp-setup # generate TOTP secret untuk 2FA
```

---

## Docs

Dokumentasi teknis: **https://docs.koramp.xyz**

---

## Disclaimer

Software MVP · Bukan layanan keuangan berlisensi · Verifikasi regulasi sebelum produksi
