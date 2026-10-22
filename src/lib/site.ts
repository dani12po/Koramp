/**
 * site.ts — satu sumber kebenaran untuk base URL KORAMP.
 *
 * Aturan resolusi (urutan prioritas):
 * 1. NEXT_PUBLIC_APP_URL dari environment (wajib diset di Vercel Production)
 * 2. Fallback statis: https://www.koramp.xyz
 *
 * PERINGATAN BUILD: jika NEXT_PUBLIC_APP_URL diisi tapi masih mengandung
 * "localhost" dan NODE_ENV=production, emitkan warning keras ke stderr
 * agar tidak lolos ke deployment tanpa disadari.
 */

const raw = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim();

// Fallback aman: selalu production URL, tidak pernah localhost.
export const SITE_URL = raw && !raw.includes('localhost')
  ? raw.replace(/\/$/, '') // strip trailing slash
  : 'https://www.koramp.xyz';

// Warn jika env var ada tapi berisi localhost di production build.
if (
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  raw.includes('localhost')
) {
  console.error(
    '[KORAMP] WARNING: NEXT_PUBLIC_APP_URL contains "localhost" in production build. ' +
    `Value: "${raw}". Falling back to https://www.koramp.xyz. ` +
    'Fix this in Vercel → Project Settings → Environment Variables.',
  );
}

/** URL absolut untuk path tertentu. Contoh: absoluteUrl('/topup-sell') */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
