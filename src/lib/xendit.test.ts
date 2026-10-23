/**
 * Xendit client unit tests — deterministic, no network.
 * Mocks global fetch for payout create/get flows.
 */
import {
  normalizeXenditBaseUrl,
  verifyXenditCallbackToken,
  parseXenditPayoutWebhook,
  isXenditPayoutSuccess,
  isXenditPayoutFailed,
  payoutIdempotencyKeyForSellOrder,
  xenditBankRoutingValue,
  xenditCreatePayout,
  XENDIT_QRIS_DOCUMENTED_MAX_IDR,
} from './xendit';

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, XENDIT_API_KEY: 'test-key', XENDIT_MODE: 'sandbox', XENDIT_WEBHOOK_TOKEN: 'tok' };
  (global as { fetch?: unknown }).fetch = undefined;
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('xendit config', () => {
  it('rejects non-xendit hosts (SSRF allowlist)', () => {
    expect(() => normalizeXenditBaseUrl('https://evil.example.com')).toThrow();
    expect(() => normalizeXenditBaseUrl('http://api.xendit.co')).toThrow();
    expect(normalizeXenditBaseUrl('https://api.xendit.co')).toBe('https://api.xendit.co');
  });
  it('documents QRIS max', () => {
    expect(XENDIT_QRIS_DOCUMENTED_MAX_IDR).toBe(10_000_000);
  });
});

describe('status handling', () => {
  it('payout terminal states', () => {
    expect(isXenditPayoutSuccess('SUCCEEDED')).toBe(true);
    expect(isXenditPayoutFailed('FAILED')).toBe(true);
    expect(isXenditPayoutFailed('REJECTED')).toBe(true);
    expect(isXenditPayoutFailed('REVERSED')).toBe(true);
    expect(isXenditPayoutSuccess('ACCEPTED')).toBe(false);
  });
});

describe('webhook security', () => {
  it('accepts valid callback token', () => {
    expect(verifyXenditCallbackToken('tok', 'tok')).toBe(true);
  });
  it('rejects invalid / missing token', () => {
    expect(verifyXenditCallbackToken('bad', 'tok')).toBe(false);
    expect(verifyXenditCallbackToken(null, 'tok')).toBe(false);
    expect(verifyXenditCallbackToken('tok', '')).toBe(false);
  });
  it('parses payout webhook; rejects unknown', () => {
    const good = parseXenditPayoutWebhook({
      event: 'v3_payout.succeeded',
      data: { payout_id: 'po-1', reference_id: 'kms_1', status: 'SUCCEEDED' },
    });
    expect(good.kind).toBe('valid');
    expect(parseXenditPayoutWebhook({ event: 'x' }).kind).toBe('invalid');
  });
});

describe('payout idempotency', () => {
  it('is deterministic, unique per order, stable across retries', () => {
    const a1 = payoutIdempotencyKeyForSellOrder('order-1');
    const a2 = payoutIdempotencyKeyForSellOrder('order-1');
    const b = payoutIdempotencyKeyForSellOrder('order-2');
    expect(a1).toBe(a2);
    expect(a1).not.toBe(b);
    expect(a1.length).toBeLessThanOrEqual(100);
  });
  it('resolves major ID banks; fails closed on unknown', () => {
    expect(xenditBankRoutingValue('BCA')).toBe('014');
    expect(xenditBankRoutingValue('bank mandiri')).toBe('008');
    expect(xenditBankRoutingValue('Bank Jago')).toBe('542');
    expect(xenditBankRoutingValue('Bank Fiktif X')).toBeNull();
  });
});

describe('xendit transport (mocked fetch)', () => {
  function mockFetchOnce(body: unknown, status = 201) {
    (global as { fetch: unknown }).fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    });
  }
  it('sends idempotency-key on create payout', async () => {
    mockFetchOnce({ payout_id: 'po-1', reference_id: 'kms_1', status: 'ACCEPTED' });
    const r = await xenditCreatePayout({
      referenceId: 'kms_1', idempotencyKey: 'xendit-payout-x', bankName: 'BCA',
      accountNumber: '1234567890', accountName: 'Budi Santoso', amountIdr: 500000,
    });
    expect(r.payoutId).toBe('po-1');
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['idempotency-key']).toBe('xendit-payout-x');
    expect(headers['api-version']).toBe('2025-09-01');
  });
});
