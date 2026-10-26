/**
 * Provider regression tests — KiPay handles Top Up QRIS payments;
 * Xendit Payout handles Sell IDR bank disbursements; FYAS handles Sell IDR
 * e-wallet disbursements. TransFi is retired.
 *
 * Hermetic: filesystem assertions only, no network, no DB, no secrets.
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..', '..');
const p = (...segs: string[]) => path.join(ROOT, ...segs);
const read = (file: string) => fs.readFileSync(p(file), 'utf8');

describe('retired provider modules are gone', () => {
  it.each(['./transfi'])('src/lib/%s is not resolvable', (mod) => {
    expect(() => require.resolve(mod, { paths: [path.join(ROOT, 'src', 'lib')] })).toThrow();
  });
  it('no retired provider test files remain', () => {
    for (const f of ['src/lib/transfi.test.ts']) {
      expect(fs.existsSync(p(f))).toBe(false);
    }
  });
});

describe('active provider routes exist', () => {
  // KiPay: Top Up QRIS payment collection
  it.each([
    'src/lib/kipay.ts',
    'src/app/api/webhooks/kipay/route.ts',
    'src/app/api/payments/qr/[trxId]/route.ts',
    'src/app/api/admin/health/kipay/route.ts',
  ])('kipay: %s exists', (file) => {
    expect(fs.existsSync(p(file))).toBe(true);
  });
  // Xendit: Sell IDR bank payout only
  it.each([
    'src/app/api/webhooks/xendit/payout/route.ts',
  ])('xendit payout: %s exists', (file) => {
    expect(fs.existsSync(p(file))).toBe(true);
  });
  // FYAS: Sell IDR e-wallet payout only
  it.each([
    'src/lib/fyas.ts',
    'src/app/api/webhooks/fyas/route.ts',
    'src/app/api/payments/fyas/products/route.ts',
  ])('fyas: %s exists', (file) => {
    expect(fs.existsSync(p(file))).toBe(true);
  });
});

describe('order engine cannot select a retired provider', () => {
  const ordersSrc = read('src/lib/orders.ts');
  it.each([`'transfi'`, `"transfi"`])(
    'contains no %s provider literal',
    (lit) => {
      expect(ordersSrc.includes(lit)).toBe(false);
    },
  );
  it("writes provider 'xendit' for new bank payouts (sell)", () => {
    // Xendit payout code references 'xendit' in processSellPayout
    expect(ordersSrc.includes(`provider: 'xendit'`)).toBe(true);
  });
  it('imports the kipay client for Top Up payment collection', () => {
    expect(ordersSrc.includes(`from './kipay'`)).toBe(true);
  });
  it('imports the xendit client for Sell bank payout', () => {
    expect(ordersSrc.includes(`from './xendit'`)).toBe(true);
  });
  it('imports the fyas client for Sell e-wallet payout', () => {
    expect(ordersSrc.includes(`from './fyas'`)).toBe(true);
  });
  it('has no transfi imports', () => {
    expect(ordersSrc.includes(`from './transfi'`)).toBe(false);
  });
});

describe('no retired gateway env vars in config', () => {
  it.each(['.env.example', 'vercel.json'])('%s has no TRANSFI_/MOCK_ vars', (file) => {
    const content = read(file);
    for (const token of ['TRANSFI_', 'MOCK_WEBHOOK_SECRET', 'transfi']) {
      // .env.example keeps one intentional doc line naming the removed prefixes.
      if (file === '.env.example' && content.split('\n').filter((l) => l.includes(token)).every((l) => l.trim().startsWith('#'))) {
        const nonComment = content.split('\n').filter((l) => !l.trim().startsWith('#') && l.includes(token));
        expect(nonComment).toEqual([]);
        continue;
      }
      expect(content.includes(token)).toBe(false);
    }
  });
  it('.env.example FYAS_ vars are server-side only (active provider)', () => {
    const content = read('.env.example');
    // FYAS_ vars ARE allowed in .env.example (active e-wallet payout provider)
    // but must never appear as NEXT_PUBLIC_FYAS_*
    const nextPublicFyas = content.split('\n').filter((l) => !l.trim().startsWith('#') && l.includes('NEXT_PUBLIC_FYAS_'));
    expect(nextPublicFyas).toEqual([]);
  });
  it('vercel.json defines no crons and no secret refs (external cron + dashboard env)', () => {
    const v = JSON.parse(read('vercel.json'));
    expect(v.crons).toBeUndefined();
    expect(JSON.stringify(v)).not.toMatch(/TRANSFI_|@kipramp_/);
  });
});

describe('no retired provider logo assets', () => {
  it('public/logos contains no transfi/fyas asset', () => {
    const files = fs.readdirSync(p('public', 'logos'));
    for (const f of files) {
      expect(f.toLowerCase()).not.toMatch(/transfi/);
    }
  });
});
