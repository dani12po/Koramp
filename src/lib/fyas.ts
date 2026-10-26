/**
 * FYAS PPOB API — server-side client for e-wallet payout (Sell off-ramp).
 *
 * Docs: https://ppob.fyas.my.id/docs
 *
 * Auth: X-API-Key header (sk_...)
 * Webhook signature: HMAC-SHA256(secret, unixTimestampSeconds + '.' + rawBody)
 *   Header: X-Webhook-Signature = sha256=<hex>
 *   Timestamp header: X-Webhook-Timestamp (unix seconds integer)
 *
 * Security: FYAS_API_KEY is server-side only — never NEXT_PUBLIC_*, never logged.
 */

import { createHmac, timingSafeEqual } from 'crypto';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface FyasTransaction {
  refId: string;
  brand: string;
  nominal: number;
  targetNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  serialNumber?: string;
  sandbox?: boolean;
}

export interface FyasProduct {
  kodeProduk: string;
  nominal: number;
  harga: number;
  isActive: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export function getFyasConfig() {
  const baseUrl = (process.env.FYAS_API_BASE_URL ?? 'https://ppob.fyas.my.id').trim().replace(/\/$/, '');
  const apiKey = (process.env.FYAS_API_KEY ?? '').trim();
  const webhookSecret = (process.env.FYAS_WEBHOOK_SECRET ?? '').trim();

  if (!apiKey) throw new Error('[FYAS] FYAS_API_KEY is not configured');

  return { baseUrl, apiKey, webhookSecret };
}

// ─── Error class ──────────────────────────────────────────────────────────────

export type FyasErrorCategory =
  | 'INVALID_REQUEST'
  | 'CONFIGURATION'
  | 'TRANSIENT'
  | 'UNKNOWN';

export class FyasError extends Error {
  operation: string;
  category: FyasErrorCategory;
  httpStatus: number | null;

  constructor(
    operation: string,
    category: FyasErrorCategory,
    message = 'Layanan e-wallet payout sedang tidak tersedia. Silakan coba lagi.',
    httpStatus: number | null = null,
  ) {
    super(message);
    this.name = 'FyasError';
    this.operation = operation;
    this.category = category;
    this.httpStatus = httpStatus;
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 15_000;

function logFyas(operation: string, fields: Record<string, unknown>): void {
  try {
    console.info(JSON.stringify({ scope: 'fyas', operation, ...fields }));
  } catch {
    // Logging must never change a payment decision.
  }
}

async function fyasFetch(
  operation: string,
  url: string,
  init: RequestInit,
): Promise<Response> {
  const { apiKey } = getFyasConfig();
  const startedAt = Date.now();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    ...(init.headers as Record<string, string> ?? {}),
  };

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    logFyas(operation, { httpStatus: res.status, durationMs: Date.now() - startedAt });
    return res;
  } catch {
    logFyas(operation, {
      errorCategory: 'TRANSIENT',
      durationMs: Date.now() - startedAt,
      safeResponseSummary: 'network_or_timeout',
    });
    throw new FyasError(operation, 'TRANSIENT');
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/products?brand=BRAND
 * Returns available e-wallet top-up products for the given brand.
 */
export async function fyasGetProducts(brand: string): Promise<FyasProduct[]> {
  const { baseUrl } = getFyasConfig();
  const url = `${baseUrl}/api/v1/products?brand=${encodeURIComponent(brand)}`;
  const res = await fyasFetch('get_products', url, { method: 'GET' });

  if (!res.ok) {
    throw new FyasError('get_products', res.status >= 500 ? 'TRANSIENT' : 'INVALID_REQUEST', undefined, res.status);
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new FyasError('get_products', 'CONFIGURATION', undefined, res.status);
  }

  if (!Array.isArray(data)) {
    // Some APIs wrap in { data: [...] }
    const wrapped = (data as Record<string, unknown>)?.data;
    if (Array.isArray(wrapped)) return wrapped as FyasProduct[];
    throw new FyasError('get_products', 'CONFIGURATION', undefined, res.status);
  }

  return data as FyasProduct[];
}

/**
 * Find the best product for a given IDR target amount.
 * Sorts products by nominal DESC, returns first where nominal <= targetIdr and isActive === true.
 * Returns null if no product qualifies (targetIdr < minimum nominal available).
 *
 * Note: FYAS harga > nominal (harga is the cost to KORAMP; nominal is face value user receives).
 * KORAMP absorbs the difference. User always receives exactly the nominal face value.
 */
export function findBestProduct(products: FyasProduct[], targetIdr: number): FyasProduct | null {
  const sorted = [...products]
    .filter((p) => p.isActive === true)
    .sort((a, b) => b.nominal - a.nominal);

  for (const product of sorted) {
    if (product.nominal <= targetIdr) {
      return product;
    }
  }
  return null;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/transactions
 * Create a new e-wallet disbursement transaction.
 * idempotencyKey maps to the Idempotency-Key header.
 */
export async function fyasCreateTransaction(opts: {
  brand: string;
  nominal: number;
  targetNumber: string;
  idempotencyKey: string;
}): Promise<FyasTransaction> {
  const { baseUrl } = getFyasConfig();
  const url = `${baseUrl}/api/v1/transactions`;

  const res = await fyasFetch('create_transaction', url, {
    method: 'POST',
    headers: { 'Idempotency-Key': opts.idempotencyKey },
    body: JSON.stringify({
      brand: opts.brand,
      nominal: opts.nominal,
      targetNumber: opts.targetNumber,
    }),
  });

  if (res.status === 409) {
    // Idempotent — already created; fetch and return existing
    const existing = await fyasGetTransaction(opts.idempotencyKey).catch(() => null);
    if (existing) return existing;
  }

  if (!res.ok) {
    throw new FyasError(
      'create_transaction',
      res.status >= 500 ? 'TRANSIENT' : 'INVALID_REQUEST',
      undefined,
      res.status,
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new FyasError('create_transaction', 'CONFIGURATION', undefined, res.status);
  }

  return validateFyasTransaction(data, 'create_transaction', res.status);
}

/**
 * GET /api/v1/transactions/:refId
 * Fetch a transaction by its refId.
 */
export async function fyasGetTransaction(refId: string): Promise<FyasTransaction> {
  const { baseUrl } = getFyasConfig();
  const url = `${baseUrl}/api/v1/transactions/${encodeURIComponent(refId)}`;
  const res = await fyasFetch('get_transaction', url, { method: 'GET' });

  if (!res.ok) {
    throw new FyasError(
      'get_transaction',
      res.status === 404 ? 'INVALID_REQUEST' : res.status >= 500 ? 'TRANSIENT' : 'CONFIGURATION',
      undefined,
      res.status,
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new FyasError('get_transaction', 'CONFIGURATION', undefined, res.status);
  }

  return validateFyasTransaction(data, 'get_transaction', res.status);
}

function validateFyasTransaction(raw: unknown, operation: string, httpStatus: number): FyasTransaction {
  // Handle possible { data: {...} } wrapper
  let data = raw as Record<string, unknown>;
  if (data?.data && typeof data.data === 'object') {
    data = data.data as Record<string, unknown>;
  }

  const validStatuses = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'];
  if (
    !data
    || typeof data !== 'object'
    || typeof data.refId !== 'string'
    || !data.refId
    || typeof data.status !== 'string'
    || !validStatuses.includes(data.status)
  ) {
    throw new FyasError(operation, 'CONFIGURATION', undefined, httpStatus);
  }

  return {
    refId: data.refId as string,
    brand: (data.brand as string) ?? '',
    nominal: typeof data.nominal === 'number' ? data.nominal : Number(data.nominal ?? 0),
    targetNumber: (data.targetNumber as string) ?? '',
    status: data.status as FyasTransaction['status'],
    serialNumber: typeof data.serialNumber === 'string' ? data.serialNumber : undefined,
    sandbox: typeof data.sandbox === 'boolean' ? data.sandbox : undefined,
  };
}

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verify FYAS webhook HMAC-SHA256 signature.
 *
 * String to sign: <unix_timestamp_seconds>.<rawBody>
 * Header value:   sha256=<hex>  (X-Webhook-Signature)
 * Timestamp:      X-Webhook-Timestamp (unix seconds integer, NOT ISO string)
 *
 * Returns 'ok' | 'no_secret' | 'invalid' | 'missing_headers'
 */
export function verifyFyasWebhookSignature(
  rawBody: string,
  headers: { timestamp?: string | null; signature?: string | null },
): 'ok' | 'no_secret' | 'invalid' | 'missing_headers' {
  const { webhookSecret } = getFyasConfig();

  if (!webhookSecret) {
    return 'no_secret';
  }

  const { timestamp, signature } = headers;
  if (!timestamp || !signature) return 'missing_headers';

  const expected = `sha256=${createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')}`;

  // Constant-time comparison to prevent timing attacks.
  try {
    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== actualBuf.length) return 'invalid';
    return timingSafeEqual(expectedBuf, actualBuf) ? 'ok' : 'invalid';
  } catch {
    return 'invalid';
  }
}
