/**
 * FYAS client unit tests — deterministic, no network, no DB, no prisma.
 * Covers: getFyasConfig, findBestProduct, verifyFyasWebhookSignature, FyasError.
 */
import { createHmac } from 'node:crypto';
import {
  getFyasConfig,
  findBestProduct,
  verifyFyasWebhookSignature,
  FyasError,
} from './fyas';

import type { FyasProduct } from './fyas';

// ─── Env helpers ──────────────────────────────────────────────────────────────

const OLD_ENV = process.env;

beforeEach(() => {
  // Start each test with a clean env that has a valid API key.
  process.env = {
    ...OLD_ENV,
    FYAS_API_KEY: 'sk_test_key',
    FYAS_API_BASE_URL: 'https://ppob.fyas.my.id',
    FYAS_WEBHOOK_SECRET: 'webhook_secret_test',
  };
});

afterAll(() => {
  process.env = OLD_ENV;
});

// ─── getFyasConfig ────────────────────────────────────────────────────────────

describe('getFyasConfig()', () => {
  it('throws when FYAS_API_KEY is empty string', () => {
    process.env.FYAS_API_KEY = '';
    expect(() => getFyasConfig()).toThrow('[FYAS] FYAS_API_KEY is not configured');
  });

  it('throws when FYAS_API_KEY is unset', () => {
    delete process.env.FYAS_API_KEY;
    expect(() => getFyasConfig()).toThrow('[FYAS] FYAS_API_KEY is not configured');
  });

  it('returns the configured base URL when FYAS_API_BASE_URL is set', () => {
    process.env.FYAS_API_BASE_URL = 'https://custom.fyas.example.com';
    const { baseUrl } = getFyasConfig();
    expect(baseUrl).toBe('https://custom.fyas.example.com');
  });

  it('falls back to default base URL when FYAS_API_BASE_URL is unset', () => {
    delete process.env.FYAS_API_BASE_URL;
    const { baseUrl } = getFyasConfig();
    expect(baseUrl).toBe('https://ppob.fyas.my.id');
  });

  it('strips trailing slash from base URL', () => {
    process.env.FYAS_API_BASE_URL = 'https://ppob.fyas.my.id/';
    const { baseUrl } = getFyasConfig();
    expect(baseUrl).toBe('https://ppob.fyas.my.id');
  });

  it('returns the correct apiKey', () => {
    const { apiKey } = getFyasConfig();
    expect(apiKey).toBe('sk_test_key');
  });
});

// ─── findBestProduct ──────────────────────────────────────────────────────────

describe('findBestProduct()', () => {
  const products: FyasProduct[] = [
    { kodeProduk: 'GOPAY_10K',  nominal: 10_000,  harga: 10_500,  isActive: true  },
    { kodeProduk: 'GOPAY_20K',  nominal: 20_000,  harga: 21_000,  isActive: true  },
    { kodeProduk: 'GOPAY_50K',  nominal: 50_000,  harga: 52_000,  isActive: true  },
    { kodeProduk: 'GOPAY_100K', nominal: 100_000, harga: 103_000, isActive: true  },
    { kodeProduk: 'GOPAY_200K', nominal: 200_000, harga: 206_000, isActive: false }, // inactive
  ];

  it('returns the largest nominal <= targetIdr when multiple qualify', () => {
    const result = findBestProduct(products, 75_000);
    expect(result).not.toBeNull();
    expect(result!.nominal).toBe(50_000);
    expect(result!.kodeProduk).toBe('GOPAY_50K');
  });

  it('returns null when targetIdr is less than all available nominals', () => {
    const result = findBestProduct(products, 5_000);
    expect(result).toBeNull();
  });

  it('skips inactive products (isActive: false)', () => {
    // With targetIdr = 200_000, the 200K product is inactive — should fall back to 100K
    const result = findBestProduct(products, 200_000);
    expect(result).not.toBeNull();
    expect(result!.nominal).toBe(100_000);
    expect(result!.kodeProduk).toBe('GOPAY_100K');
  });

  it('returns the exact-match product when targetIdr equals a nominal exactly', () => {
    const result = findBestProduct(products, 50_000);
    expect(result).not.toBeNull();
    expect(result!.nominal).toBe(50_000);
  });

  it('returns null for an empty product list', () => {
    expect(findBestProduct([], 100_000)).toBeNull();
  });

  it('returns null when all products are inactive', () => {
    const allInactive = products.map((p) => ({ ...p, isActive: false }));
    expect(findBestProduct(allInactive, 100_000)).toBeNull();
  });

  it('handles a single qualifying product', () => {
    const single: FyasProduct[] = [
      { kodeProduk: 'GOPAY_10K', nominal: 10_000, harga: 10_500, isActive: true },
    ];
    expect(findBestProduct(single, 10_000)!.nominal).toBe(10_000);
    expect(findBestProduct(single, 9_999)).toBeNull();
  });
});

// ─── verifyFyasWebhookSignature ───────────────────────────────────────────────

describe('verifyFyasWebhookSignature()', () => {
  const secret = 'webhook_secret_test';
  const rawBody = '{"event":"transaction.success","refId":"REF-001"}';
  const timestamp = '1700000000';

  function computeSignature(sec: string, ts: string, body: string): string {
    return `sha256=${createHmac('sha256', sec).update(`${ts}.${body}`).digest('hex')}`;
  }

  it('returns "no_secret" when FYAS_WEBHOOK_SECRET is unset', () => {
    delete process.env.FYAS_WEBHOOK_SECRET;
    // getFyasConfig() won't throw because FYAS_API_KEY is still set.
    // But verifyFyasWebhookSignature calls getFyasConfig() — it reads webhookSecret.
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp,
      signature: computeSignature(secret, timestamp, rawBody),
    });
    expect(result).toBe('no_secret');
  });

  it('returns "no_secret" when FYAS_WEBHOOK_SECRET is empty string', () => {
    process.env.FYAS_WEBHOOK_SECRET = '';
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp,
      signature: computeSignature(secret, timestamp, rawBody),
    });
    expect(result).toBe('no_secret');
  });

  it('returns "missing_headers" when timestamp is absent', () => {
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp: null,
      signature: computeSignature(secret, timestamp, rawBody),
    });
    expect(result).toBe('missing_headers');
  });

  it('returns "missing_headers" when signature is absent', () => {
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp,
      signature: null,
    });
    expect(result).toBe('missing_headers');
  });

  it('returns "ok" for a correctly computed HMAC signature', () => {
    const sig = computeSignature(secret, timestamp, rawBody);
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp,
      signature: sig,
    });
    expect(result).toBe('ok');
  });

  it('returns "invalid" for a wrong signature', () => {
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp,
      signature: 'sha256=deadbeefdeadbeefdeadbeefdeadbeef',
    });
    expect(result).toBe('invalid');
  });

  it('returns "invalid" when raw body is tampered', () => {
    const sig = computeSignature(secret, timestamp, rawBody);
    const tampered = rawBody + 'TAMPERED';
    const result = verifyFyasWebhookSignature(tampered, {
      timestamp,
      signature: sig,
    });
    expect(result).toBe('invalid');
  });

  it('returns "invalid" when timestamp is tampered', () => {
    const sig = computeSignature(secret, timestamp, rawBody);
    const result = verifyFyasWebhookSignature(rawBody, {
      timestamp: '9999999999',
      signature: sig,
    });
    expect(result).toBe('invalid');
  });
});

// ─── FyasError ────────────────────────────────────────────────────────────────

describe('FyasError', () => {
  it('is instanceof Error', () => {
    const err = new FyasError('create_transaction', 'TRANSIENT');
    expect(err).toBeInstanceOf(Error);
  });

  it('name === "FyasError"', () => {
    const err = new FyasError('create_transaction', 'TRANSIENT');
    expect(err.name).toBe('FyasError');
  });

  it('sets operation field correctly', () => {
    const err = new FyasError('get_transaction', 'INVALID_REQUEST', 'not found', 404);
    expect(err.operation).toBe('get_transaction');
  });

  it('sets httpStatus field correctly', () => {
    const err = new FyasError('get_transaction', 'INVALID_REQUEST', 'not found', 404);
    expect(err.httpStatus).toBe(404);
  });

  it('defaults httpStatus to null when omitted', () => {
    const err = new FyasError('create_transaction', 'TRANSIENT');
    expect(err.httpStatus).toBeNull();
  });

  it('uses default message when none provided', () => {
    const err = new FyasError('create_transaction', 'TRANSIENT');
    expect(err.message).toBe('Layanan e-wallet payout sedang tidak tersedia. Silakan coba lagi.');
  });

  it('uses custom message when provided', () => {
    const err = new FyasError('create_transaction', 'INVALID_REQUEST', 'Custom error message');
    expect(err.message).toBe('Custom error message');
  });

  it('sets category field correctly', () => {
    const err = new FyasError('create_transaction', 'CONFIGURATION', 'bad config', 500);
    expect(err.category).toBe('CONFIGURATION');
  });
});
