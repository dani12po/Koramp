/**
 * Xendit server-side client — payout-only (Sell off-ramp).
 *
 * Docs (current, docs.xendit.co — Sept 2026):
 * - Host: https://api.xendit.co (single host; test vs live via API key mode)
 * - Auth: HTTP Basic, secret API key as username, empty password. Server-only.
 * - Payout API v3:
 *   POST /v3/payouts  headers `api-version: 2025-09-01` + `idempotency-key`
 *   GET /v3/payouts/{payout_id}
 *   status: ACCEPTED | PENDING_COMPLIANCE_REVIEW | REJECTED | ROUTING |
 *           REQUESTED | READY | LOCKED | EXPIRED | FAILED | SUCCEEDED |
 *           CANCELLED | REVERSED
 *
 * xenPlatform: NOT used. KORAMP is a single merchant; no sub-accounts,
 * no for-user-id, no split rules.
 *
 * SECURITY: secret key + webhook token never leave server. Never logged.
 */

import { timingSafeEqual } from 'crypto';

// ─── Errors ─────────────────────────────────────────────────────────────────

export type XenditErrorCategory =
  | 'INVALID_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'TRANSIENT'
  | 'UNKNOWN'
  | 'CONFIGURATION';

export class XenditError extends Error {
  operation: string;
  category: XenditErrorCategory;
  httpStatus: number | null;
  constructor(operation: string, category: XenditErrorCategory, httpStatus: number | null = null) {
    super(`[Xendit:${operation}] ${category}`);
    this.name = 'XenditError';
    this.operation = operation;
    this.category = category;
    this.httpStatus = httpStatus;
  }
}

export const XENDIT_CUSTOMER_MESSAGE = 'Layanan pembayaran sedang tidak tersedia. Silakan coba lagi.';

// ─── Config ─────────────────────────────────────────────────────────────────

export const XENDIT_API_HOST = 'https://api.xendit.co';
export const XENDIT_PAYOUT_API_VERSION = '2025-09-01';
/** Documented QRIS max (docs/qris): IDR 10,000,000. Kept for reference. */
export const XENDIT_QRIS_DOCUMENTED_MAX_IDR = 10_000_000;

const ALLOWED_HOSTS = new Set(['api.xendit.co']);

export interface XenditConfig {
  apiKey: string;
  baseUrl: string;
  mode: 'sandbox' | 'production';
  webhookToken: string;
}

export function normalizeXenditBaseUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('[Xendit] XENDIT_API_BASE_URL is not a valid URL');
  }
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname) || parsed.port || parsed.search || parsed.hash) {
    throw new Error('[Xendit] XENDIT_API_BASE_URL must be https://api.xendit.co');
  }
  return `${parsed.protocol}//${parsed.hostname}`;
}

export function getXenditConfig(): XenditConfig {
  const baseUrl = (process.env.XENDIT_API_BASE_URL ?? XENDIT_API_HOST).trim() || XENDIT_API_HOST;
  const apiKey = (process.env.XENDIT_API_KEY ?? '').trim();
  const mode = (process.env.XENDIT_MODE ?? 'sandbox').trim();
  const webhookToken = (process.env.XENDIT_WEBHOOK_TOKEN ?? '').trim();
  if (mode !== 'sandbox' && mode !== 'production') {
    throw new Error('[Xendit] XENDIT_MODE must be sandbox or production');
  }
  if (!apiKey) throw new Error('[Xendit] XENDIT_API_KEY is not configured');
  if (mode === 'production' && !webhookToken) {
    throw new Error('[Xendit] XENDIT_WEBHOOK_TOKEN must be configured in production');
  }
  return { apiKey, baseUrl: normalizeXenditBaseUrl(baseUrl), mode, webhookToken };
}

function basicAuthHeader(cfg: XenditConfig): string {
  return `Basic ${Buffer.from(`${cfg.apiKey}:`).toString('base64')}`;
}

// ─── Transport ──────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 15_000;

async function xenditFetch(operation: string, url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch {
    throw new XenditError(operation, 'TRANSIENT');
  }
}

function categoryForStatus(status: number): XenditErrorCategory {
  if (status === 400) return 'INVALID_REQUEST';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'TRANSIENT';
  return 'CONFIGURATION';
}

function readJson(text: string, operation: string, status: number): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new XenditError(operation, 'CONFIGURATION', status);
  }
}

// ─── Webhook security ───────────────────────────────────────────────────────

/** x-callback-token equality check (timing-safe). */
export function verifyXenditCallbackToken(provided: string | null, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided.trim(), 'utf8');
  const b = Buffer.from(expected.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ─── Payouts API v3 ─────────────────────────────────────────────────────────

export type XenditPayoutStatus =
  | 'ACCEPTED' | 'PENDING_COMPLIANCE_REVIEW' | 'REJECTED' | 'ROUTING'
  | 'REQUESTED' | 'READY' | 'LOCKED' | 'EXPIRED' | 'FAILED'
  | 'SUCCEEDED' | 'CANCELLED' | 'REVERSED';

export interface XenditPayout {
  payoutId: string;
  referenceId: string;
  status: XenditPayoutStatus;
  raw?: unknown;
}

function isXenditPayoutStatus(v: unknown): v is XenditPayoutStatus {
  return (
    v === 'ACCEPTED' || v === 'PENDING_COMPLIANCE_REVIEW' || v === 'REJECTED' ||
    v === 'ROUTING' || v === 'REQUESTED' || v === 'READY' || v === 'LOCKED' ||
    v === 'EXPIRED' || v === 'FAILED' || v === 'SUCCEEDED' ||
    v === 'CANCELLED' || v === 'REVERSED'
  );
}

export function isXenditPayoutSuccess(s: string): boolean {
  return s === 'SUCCEEDED';
}

export function isXenditPayoutFailed(s: string): boolean {
  return s === 'FAILED' || s === 'REJECTED' || s === 'REVERSED' || s === 'CANCELLED' || s === 'EXPIRED';
}

// Indonesian bank code → Xendit routing value. BI bank codes. Override via
// XENDIT_ID_BANK_CODES JSON env if Xendit coverage sheet specifies otherwise.
const ID_BANK_ROUTING: Record<string, string> = {
  bca: '014', bri: '002', bni: '009', mandiri: '008',
  bsi: '451', seabank: '535', jago: '542', cimb: '022', danamon: '011',
  permata: '013', ocbc: '028', panin: '019',BTN: '200', btn: '200',
};

function loadBankRoutingOverride(): Record<string, string> {
  try {
    const raw = (process.env.XENDIT_ID_BANK_CODES ?? '').trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(parsed)) {
      if (typeof val === 'string' && val) out[k.trim().toLowerCase()] = val.trim();
    }
    return out;
  } catch {
    return {};
  }
}

/** Resolve user-supplied bank name to routing value. Null = unsupported → fail closed. */
export function xenditBankRoutingValue(bankName: string): string | null {
  const key = bankName.trim().toLowerCase().replace(/^bank\s+/, '');
  const override = loadBankRoutingOverride();
  if (override[key]) return override[key];
  const alias: Record<string, string> = {
    'central asia': '014', 'rakyat indonesia': '002', 'negara indonesia': '009',
    'syariah indonesia': '451', 'kesejahteraan ekonomi': '535', 'sea bank': '535',
    'sea-bank': '535', 'bank jago': '542', 'artos': '542',
  };
  if (ID_BANK_ROUTING[key]) return ID_BANK_ROUTING[key];
  if (alias[key]) return alias[alias[key]] ?? alias[key];
  return null;
}

export const XENDIT_SUPPORTED_BANKS = ['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI', 'SeaBank', 'Bank Jago', 'CIMB', 'Danamon', 'Permata', 'OCBC', 'Panin', 'BTN'];

function splitName(full: string): { given: string; surname: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { given: 'Customer', surname: 'KORAMP' };
  if (parts.length === 1) return { given: parts[0].slice(0, 100), surname: parts[0].slice(0, 100) };
  return { given: parts.slice(0, -1).join(' ').slice(0, 100), surname: parts[parts.length - 1].slice(0, 100) };
}

function validatePayoutResponse(value: unknown, operation: string): XenditPayout {
  const d = value as Record<string, unknown>;
  const payoutId = (d.payout_id ?? d.id) as unknown;
  if (typeof payoutId !== 'string' || !payoutId) throw new XenditError(operation, 'CONFIGURATION');
  const status = d.status as unknown;
  if (!isXenditPayoutStatus(status)) throw new XenditError(operation, 'CONFIGURATION');
  return {
    payoutId,
    referenceId: typeof d.reference_id === 'string' ? (d.reference_id as string) : '',
    status,
    raw: undefined,
  };
}

export interface XenditCreatePayoutInput {
  referenceId: string;
  idempotencyKey: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amountIdr: number;
}

export function payoutIdempotencyKeyForSellOrder(sellOrderId: string): string {
  return `xendit-payout-${sellOrderId}`;
}

export async function xenditCreatePayout(
  input: XenditCreatePayoutInput,
  cfg: XenditConfig = getXenditConfig(),
): Promise<XenditPayout> {
  if (!input.referenceId || input.referenceId.length > 255) throw new XenditError('create_payout', 'INVALID_REQUEST');
  if (!input.idempotencyKey || input.idempotencyKey.length > 100) throw new XenditError('create_payout', 'INVALID_REQUEST');
  if (!Number.isSafeInteger(input.amountIdr) || input.amountIdr <= 0) throw new XenditError('create_payout', 'INVALID_REQUEST');
  if (!/^\d{8,20}$/.test(input.accountNumber)) throw new XenditError('create_payout', 'INVALID_REQUEST');
  if (!input.accountName.trim()) throw new XenditError('create_payout', 'INVALID_REQUEST');
  const routingValue = xenditBankRoutingValue(input.bankName);
  if (!routingValue) throw new XenditError('create_payout', 'INVALID_REQUEST');
  const { given, surname } = splitName(input.accountName);
  const body = {
    reference_id: input.referenceId,
    recipient: {
      type: 'INDIVIDUAL',
      relationship: 'CUSTOMER',
      given_name: given,
      surname,
      account_details: {
        currency: 'IDR',
        account_country: 'ID',
        account_holder_name: input.accountName.trim().slice(0, 255),
        account_number: input.accountNumber,
        routing_type_1: 'BANK_CODE',
        routing_value_1: routingValue,
      },
      address: { country: 'ID', province_state: 'Jakarta', city: 'Jakarta', street_line_1: 'KORAMP payout', postal_code: '10110' },
    },
    payout_details: {
      source_amount: input.amountIdr,
      source_currency: 'IDR',
      destination_currency: 'IDR',
    },
    source_of_fund: 'OTHER',
    purpose_code: 'OTHER',
    description: `KORAMP ${input.referenceId}`.slice(0, 100),
  };
  let res: Response;
  try {
    res = await xenditFetch('create_payout', `${cfg.baseUrl}/v3/payouts`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: basicAuthHeader(cfg),
        'api-version': XENDIT_PAYOUT_API_VERSION,
        'idempotency-key': input.idempotencyKey,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (e instanceof XenditError) throw new XenditError('create_payout', 'UNKNOWN');
    throw e;
  }
  if (res.status !== 200 && res.status !== 201) {
    throw new XenditError('create_payout', categoryForStatus(res.status), res.status);
  }
  return validatePayoutResponse(readJson(await res.text(), 'create_payout', res.status), 'create_payout');
}

export async function xenditGetPayout(
  payoutId: string,
  cfg: XenditConfig = getXenditConfig(),
): Promise<XenditPayout> {
  if (!payoutId || payoutId.length > 100) throw new XenditError('get_payout', 'INVALID_REQUEST');
  let lastError: XenditError | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await xenditFetch('get_payout', `${cfg.baseUrl}/v3/payouts/${encodeURIComponent(payoutId)}`, {
        headers: { Accept: 'application/json', Authorization: basicAuthHeader(cfg), 'api-version': XENDIT_PAYOUT_API_VERSION },
      });
      if (res.ok) return validatePayoutResponse(readJson(await res.text(), 'get_payout', res.status), 'get_payout');
      throw new XenditError('get_payout', categoryForStatus(res.status), res.status);
    } catch (error) {
      const typed = error instanceof XenditError ? error : new XenditError('get_payout', 'TRANSIENT');
      lastError = typed;
      if (typed.category !== 'TRANSIENT' || attempt === 3) throw typed;
      await new Promise((r) => setTimeout(r, 250 * 2 ** (attempt - 1)));
    }
  }
  throw lastError ?? new XenditError('get_payout', 'TRANSIENT');
}

export interface XenditPayoutWebhookPayload {
  event: string;
  payoutId: string;
  referenceId: string;
  status: string;
  raw: unknown;
}

export function parseXenditPayoutWebhook(value: unknown):
  | { kind: 'valid'; payload: XenditPayoutWebhookPayload }
  | { kind: 'invalid'; reason: string } {
  const v = value as Record<string, unknown>;
  if (!v || typeof v !== 'object') return { kind: 'invalid', reason: 'not-an-object' };
  const event = v.event;
  const data = v.data as Record<string, unknown> | undefined;
  if (typeof event !== 'string' || !event) return { kind: 'invalid', reason: 'missing-event' };
  if (!data || typeof data !== 'object') return { kind: 'invalid', reason: 'missing-data' };
  const payoutId = (data.payout_id ?? data.id) as unknown;
  if (typeof payoutId !== 'string' || !payoutId) return { kind: 'invalid', reason: 'missing-payout_id' };
  const referenceId = data.reference_id;
  const status = data.status;
  if (typeof referenceId !== 'string' || !referenceId) return { kind: 'invalid', reason: 'missing-reference_id' };
  if (typeof status !== 'string' || !status) return { kind: 'invalid', reason: 'missing-status' };
  return { kind: 'valid', payload: { event, payoutId, referenceId, status, raw: value } };
}
