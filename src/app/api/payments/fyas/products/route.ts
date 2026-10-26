import { NextRequest, NextResponse } from 'next/server';
import { fyasGetProducts } from '@/lib/fyas';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const VALID_BRANDS = ['GOPAY', 'OVO', 'SHOPEEPAY', 'DANA'] as const;

/**
 * GET /api/payments/fyas/products?brand=GOPAY
 *
 * Returns available e-wallet top-up products for the given brand.
 * Used by the sell flow UI to show denomination options.
 */
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Ban gate
    {
      const { banGate } = await import('@/lib/security');
      const rej = await banGate(ip);
      if (rej) return NextResponse.json(rej.body, { status: rej.status, headers: { 'Retry-After': String(rej.retryAfter) } });
    }

    // Rate limit: 20 req/min per IP
    if (!rateLimit('fyas-products', ip, 20, RATE_LIMITS.webhook.windowMs)) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Silakan coba lagi.' } },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand')?.toUpperCase();

    if (!brand || !VALID_BRANDS.includes(brand as typeof VALID_BRANDS[number])) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_BRAND',
            message: `Brand tidak valid. Pilih salah satu: ${VALID_BRANDS.join(', ')}`,
          },
        },
        { status: 400 },
      );
    }

    const data = await fyasGetProducts(brand);

    return NextResponse.json({
      products: data.map((p) => ({
        kodeProduk: p.kodeProduk,
        nominal: p.nominal,
        harga: p.harga,
        isActive: p.isActive,
      })),
    });
  } catch (err) {
    console.error('[FYAS Products]', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Gagal mengambil daftar produk.' } },
      { status: 500 },
    );
  }
}
