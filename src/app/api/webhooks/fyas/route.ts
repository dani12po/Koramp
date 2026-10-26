import { NextRequest } from 'next/server';
import { ok } from '@/lib/response';
import { processFyasPayoutWebhook } from '@/lib/orders';
import { verifyFyasWebhookSignature } from '@/lib/fyas';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/fyas
 *
 * FYAS PPOB webhook handler for e-wallet payout status updates.
 *
 * Signature verification (HMAC-SHA256):
 *   String to sign: <X-Webhook-Timestamp (unix seconds)>.<rawBody>
 *   Header:         X-Webhook-Signature: sha256=<hex>
 *
 * Always returns 200 to prevent FYAS retry storms on signature errors.
 * Fulfillment is always confirmed via server-to-server GET /transactions/:refId.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit('webhook-fyas', ip, RATE_LIMITS.webhook.max, RATE_LIMITS.webhook.windowMs)) {
      // Still return 200 to avoid retry storms — rate limiting is internal protection
      return ok({ received: false, error: 'Rate limited' });
    }

    const { readBoundedBody } = await import('@/lib/security');
    const rawBody = await readBoundedBody(req);

    // ── Signature verification ────────────────────────────────────────────────
    const timestampHeader = req.headers.get('x-webhook-timestamp');
    const sigResult = verifyFyasWebhookSignature(rawBody, {
      timestamp: timestampHeader,
      signature: req.headers.get('x-webhook-signature'),
    });

    if (sigResult === 'invalid') {
      console.warn(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'SIGNATURE_INVALID' }));
      return ok({ received: false, error: 'Invalid signature' });
    }

    if (sigResult === 'no_secret') {
      // In production, missing secret is a security misconfiguration — reject the request.
      if (process.env.NODE_ENV === 'production') {
        console.error(JSON.stringify({
          scope: 'fyas', operation: 'webhook',
          errorCategory: 'SECRET_NOT_CONFIGURED',
          warning: 'FYAS_WEBHOOK_SECRET not set in production — rejecting request',
        }));
        return ok({ received: false, error: 'Webhook secret not configured' });
      }
      console.warn(JSON.stringify({
        scope: 'fyas', operation: 'webhook',
        warning: 'FYAS_WEBHOOK_SECRET not set — signature verification skipped (non-production only)',
      }));
    }

    if (sigResult === 'missing_headers') {
      const webhookSecret = (process.env.FYAS_WEBHOOK_SECRET ?? '').trim();
      if (webhookSecret) {
        console.warn(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'SIGNATURE_HEADERS_MISSING' }));
        return ok({ received: false, error: 'Missing signature headers' });
      }
    }

    // ── Timestamp staleness check (unix seconds) ──────────────────────────────
    if (timestampHeader) {
      // X-Webhook-Timestamp is unix seconds integer
      const tsSeconds = Number(timestampHeader);
      if (!Number.isFinite(tsSeconds) || tsSeconds <= 0) {
        console.warn(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'INVALID_TIMESTAMP' }));
        return ok({ received: false, error: 'Invalid timestamp' });
      }
      const tsMs = tsSeconds * 1000;
      const maxAgeMs = Number(process.env.WEBHOOK_MAX_AGE_SEC ?? 300) * 1000;
      const now = Date.now();
      if (tsMs > now + 5 * 60_000 || now - tsMs > maxAgeMs) {
        console.warn(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'STALE_EVENT' }));
        return ok({ received: false, error: 'Stale event' });
      }
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let raw: unknown;
    try {
      raw = JSON.parse(rawBody);
    } catch {
      console.warn(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'MALFORMED_JSON' }));
      return ok({ received: false, error: 'Invalid payload' });
    }

    const payload = raw as Record<string, unknown>;
    const event = payload.event as string | undefined;

    if (!event || typeof event !== 'string') {
      console.warn(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'MISSING_EVENT' }));
      return ok({ received: false, error: 'Missing event' });
    }

    // ── Test event ────────────────────────────────────────────────────────────
    if (event === 'webhook.test') {
      console.info(JSON.stringify({ scope: 'fyas', operation: 'webhook_test', result: 'acknowledged' }));
      return ok({ received: true, test: true });
    }

    // ── Dispatch to order engine ───────────────────────────────────────────────
    const data = (payload.data ?? {}) as Record<string, unknown>;
    const result = await processFyasPayoutWebhook({
      id: typeof payload.id === 'string' ? payload.id : undefined,
      event,
      data: { refId: data.refId as string, status: data.status as string, ...data },
    });

    return ok({ received: true, ...result });
  } catch {
    console.error(JSON.stringify({ scope: 'fyas', operation: 'webhook', errorCategory: 'PROCESSING_ERROR' }));
    return ok({ received: false, error: 'Internal error' });
  }
}
