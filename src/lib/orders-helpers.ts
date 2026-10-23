/**
 * orders-helpers.ts — pure functions dipakai orders.ts (KiPay Top Up state machine).
 * Dipisah ke file sendiri agar bisa di-unit-test dan di-re-export tanpa circular import.
 */

/** Parse "YYYY-MM-DD HH:MM:SS" KiPay sebagai UTC eksplisit (kontrak tanpa offset). */
export function parseKipayTime(v: string | null | undefined): Date | null {
  if (!v || typeof v !== 'string') return null;
  const iso = /[zZ+-]\d{2}:?\d{2}$/.test(v.trim()) ? v.trim() : `${v.trim().replace(' ', 'T')}Z`;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d : null;
}

/**
 * Verifikasi model amount KiPay v1.2.0:
 *   fee_bearer='merchant' (default): amount = requested_amount + unique_code
 *   fee_bearer='user':               amount = requested_amount + unique_code + fee_amount
 *
 * Selalu: upstream.amount === gross lokal.
 */
export function verifyKipayAmounts(
  local: { requested: number; unique: number; gross: number },
  upstream: { amount?: number; fee_bearer?: string; fee_amount?: number },
): { ok: true } | { ok: false; reason: string } {
  const { amount, fee_bearer, fee_amount } = upstream;
  if (!Number.isSafeInteger(local.requested) || !Number.isSafeInteger(local.unique) || !Number.isSafeInteger(local.gross)) {
    return { ok: false, reason: 'local amount fields are invalid' };
  }
  // Verify local gross matches the requested+unique formula
  if (local.requested + local.unique !== local.gross) {
    return { ok: false, reason: 'local requested_amount + unique_code does not equal gross amount' };
  }
  if (typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount <= 0) {
    return { ok: false, reason: 'upstream amount is invalid' };
  }
  // For fee_bearer='user', KiPay adds fee_amount on top — the gross paid by
  // the user is higher than what the merchant requested. Our local gross was
  // computed before knowing fee_bearer, so we accept either formula.
  if (fee_bearer === 'user' && typeof fee_amount === 'number' && Number.isSafeInteger(fee_amount)) {
    // user bears fee: amount = requested + unique + fee
    const expectedUser = local.requested + local.unique + fee_amount;
    if (amount !== expectedUser) {
      return { ok: false, reason: `upstream amount ${amount} does not match requested+unique+fee ${expectedUser}` };
    }
  } else {
    // merchant bears fee (default): amount = requested + unique
    if (amount !== local.gross) {
      return { ok: false, reason: `upstream amount ${amount} does not match local gross ${local.gross}` };
    }
  }
  return { ok: true };
}

/** Keputusan transisi murni — bisa di-unit-test. */
export function decideTopUpTransition(
  orderStatus: string,
  kipayStatus: string,
): 'confirm' | 'expire' | 'keep' | 'ignore' {
  if (kipayStatus === 'paid') {
    return ['CREATED', 'PAYMENT_PENDING'].includes(orderStatus) ? 'confirm' : 'ignore';
  }
  if (kipayStatus === 'expired') {
    return ['CREATED', 'PAYMENT_PENDING'].includes(orderStatus) ? 'expire' : 'ignore';
  }
  return 'keep'; // pending/unknown → jangan tandai gagal
}
