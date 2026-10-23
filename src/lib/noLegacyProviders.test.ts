/**
 * Provider regression tests — KiPay handles Top Up QRIS payments;
 * Xendit Payout handles Sell IDR disbursements. TransFi and FYAS are retired.
 *
 * Hermetic: filesystem assertions only, no network, no DB, no secrets.
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..', '..');
const p = (...segs: string[]) => path.join(ROOT, ...segs);
const read = (file: string) => fs.readFileSync(p(file), 'utf8');

describe('retired provider modules are gone', () => {
  it.each(['./transfi', './fyas'])('src/lib/%s is not resolvable', (mod) => {
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
  // Xendit: Sell IDR payout only
  it.each([
    'src/app/api/webhooks/xendit/payout/route.ts',
  ])('xendit payout: %s exists', (file) => {
    expect(fs.existsSync(p(file))).toBe(true);
  });
});

describe('order engine cannot select a retired provider', () => {
  const ordersSrc = read('src/lib/orders.ts');
  it.each([`'transfi'`, `'fyas'`, `"transfi"`, `"fyas"`])(
    'contains no %s provider literal',
    (lit) => {
      expect(ordersSrc.includes(lit)).toBe(false);
    },
  );
  it("writes provider 'xendit' for new payouts (sell)", () => {
    // Xendit payout code references 'xendit' in processSellPayout
    expect(ordersSrc.includes(`provider: 'xendit'`)).toBe(true);
  });
  it('imports the kipay client for Top Up payment collection', () => {
    expect(ordersSrc.includes(`from './kipay'`)).toBe(true);
  });
  it('imports the xendit client for Sell payout', () => {
    expect(ordersSrc.includes(`from './xendit'`)).toBe(true);
  });
  it('has no transfi or fyas imports', () => {
    expect(ordersSrc.includes(`from './transfi'`)).toBe(false);
    expect(ordersSrc.includes(`from './fyas'`)).toBe(false);
  });
});

describe('no retired gateway env vars in config', () => {
  it.each(['.env.example', 'vercel.json'])('%s has no TRANSFI_/FYAS_/MOCK_ vars', (file) => {
    const content = read(file);
    for (const token of ['TRANSFI_', 'FYAS_', 'MOCK_WEBHOOK_SECRET', 'transfi', 'fyas']) {
      // .env.example keeps one intentional doc line naming the removed prefixes.
      if (file === '.env.example' && content.split('\n').filter((l) => l.includes(token)).every((l) => l.trim().startsWith('#'))) {
        const nonComment = content.split('\n').filter((l) => !l.trim().startsWith('#') && l.includes(token));
        expect(nonComment).toEqual([]);
        continue;
      }
      expect(content.includes(token)).toBe(false);
    }
  });
  it('vercel.json defines no crons and no secret refs (external cron + dashboard env)', () => {
    const v = JSON.parse(read('vercel.json'));
    expect(v.crons).toBeUndefined();
    expect(JSON.stringify(v)).not.toMatch(/TRANSFI_|FYAS_|@kipramp_/);
  });
});

describe('no retired provider logo assets', () => {
  it('public/logos contains no transfi/fyas asset', () => {
    const files = fs.readdirSync(p('public', 'logos'));
    for (const f of files) {
      expect(f.toLowerCase()).not.toMatch(/transfi|fyas/);
    }
  });
});
