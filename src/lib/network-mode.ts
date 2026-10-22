/**
 * network-mode.ts — satu sumber kebenaran status jaringan (testnet vs mainnet).
 *
 * Dibaca NEXT_PUBLIC_NETWORK_MODE dari environment:
 *   - "mainnet" → semua jaringan production, banner hilang
 *   - "testnet" (default) → Solana Devnet, Base Sepolia, BSC Testnet, banner tampil
 *
 * Digunakan oleh:
 *  - NetBanner (header + form banner)
 *  - /risk page
 *  - metadata
 *
 * CARA SET DI VERCEL:
 *   NEXT_PUBLIC_NETWORK_MODE=mainnet   ← saat mainnet live
 *   NEXT_PUBLIC_NETWORK_MODE=testnet   ← default (development/beta)
 */

export type NetworkMode = 'mainnet' | 'testnet';

export function getNetworkMode(): NetworkMode {
  const raw = (process.env.NEXT_PUBLIC_NETWORK_MODE ?? '').trim().toLowerCase();
  return raw === 'mainnet' ? 'mainnet' : 'testnet';
}

/** true = testnet/beta, banner harus tampil */
export const IS_TESTNET = getNetworkMode() === 'testnet';

export const NETWORK_LABELS: Record<NetworkMode, string> = {
  testnet: 'Testnet / Beta',
  mainnet: 'Mainnet',
};
