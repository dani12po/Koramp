import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSellOrder } from '@/lib/orders';
import { ok, handleError } from '@/lib/response';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { assertWalletForOrder } from '@/lib/validateWallet';

export const dynamic = 'force-dynamic';

// Rate limiting: 10 request per menit per IP untuk mencegah spam
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

const schema = z.object({
  walletAddress: z.string().min(10).max(100),
  walletType: z.enum(['EVM', 'SOLANA']),
  quoteId: z.string().uuid(),
  asset: z.enum(['SOL', 'ETH', 'BNB']),
  network: z.enum(['SOLANA', 'BASE', 'BSC']),
  // Payout method selection
  payoutMethod: z.enum(['BANK', 'EWALLET']).optional().default('BANK'),
  // Bank payout fields — required when payoutMethod === 'BANK'
  bankName: z.string().min(2).max(100).refine(
    (name) => /^[a-zA-Z0-9\s\u002D\u002E]+$/.test(name),
    'Bank name hanya boleh mengandung huruf, angka, spasi, dan tanda baca dasar'
  ).optional(),
  accountNumber: z.string().min(8).max(20).refine(
    (acc) => /^[0-9]+$/.test(acc),
    'Nomor rekening hanya boleh berisi angka'
  ).transform((acc) => acc.replace(/\s+/g, '')).optional(), // Hapus spasi
  accountName: z.string().min(2).max(100).refine(
    (name) => /^[ -~\u00A0-\u00FF\u4e00-\u9fff\uAC00-\uD7AF]+$/.test(name) || /^[ -~]+$/.test(name),
    'Nama pemilik rekening tidak valid'
  ).optional(),
  // E-wallet payout fields — required when payoutMethod === 'EWALLET'
  payoutEwalletBrand: z.enum(['GOPAY', 'OVO', 'SHOPEEPAY', 'DANA']).optional(),
  payoutEwalletPhone: z.string().min(10).max(15).regex(/^[0-9]+$/, 'Nomor telepon hanya boleh berisi angka').optional(),
}).superRefine((data, ctx) => {
  if (data.payoutMethod === 'BANK' || data.payoutMethod === undefined) {
    if (!data.bankName || data.bankName.length < 2 || data.bankName.length > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama bank wajib diisi (2-100 karakter)', path: ['bankName'] });
    }
    if (!data.accountNumber || data.accountNumber.length < 8 || data.accountNumber.length > 20) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nomor rekening wajib diisi (8-20 digit)', path: ['accountNumber'] });
    }
    if (!data.accountName || data.accountName.length < 2 || data.accountName.length > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama pemilik rekening wajib diisi (2-100 karakter)', path: ['accountName'] });
    }
  }
  if (data.payoutMethod === 'EWALLET') {
    if (!data.payoutEwalletBrand) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Brand e-wallet wajib dipilih', path: ['payoutEwalletBrand'] });
    }
    if (!data.payoutEwalletPhone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nomor telepon e-wallet wajib diisi', path: ['payoutEwalletPhone'] });
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    // Ban gate: rejected before any expensive work (blockchain RPC, Xendit, DB writes).
    {
      const { banGate } = await import('@/lib/security');
      const rej = await banGate(ip);
      if (rej) return NextResponse.json(rej.body, { status: rej.status, headers: { 'Retry-After': String(rej.retryAfter) } });
    }
    if (!(await rateLimit('sell-order', ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS))) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Silakan coba lagi nanti.' } },
        { status: 429 }
      );
    }
    
    const { readJsonBounded } = await import('@/lib/apiGuard');
    const body = schema.parse(await readJsonBounded(req));

    assertWalletForOrder({ asset: body.asset, network: body.network, walletType: body.walletType, walletAddress: body.walletAddress });

    const result = await createSellOrder({
      walletAddress: body.walletAddress,
      walletType: body.walletType,
      quoteId: body.quoteId,
      asset: body.asset,
      network: body.network,
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      accountName: body.accountName,
      payoutMethod: body.payoutMethod,
      payoutEwalletBrand: body.payoutEwalletBrand,
      payoutEwalletPhone: body.payoutEwalletPhone,
    });
    return ok({ order: result.order }, 201);
  } catch (err) { return handleError(err); }
}
