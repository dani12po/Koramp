'use client';

/**
 * EcosystemMarquee — premium infinite logo strip (KORAMP landing).
 *
 * ALL brand artwork below is the actual official asset, served locally from
 * /public/logos (no hotlinking, no recreation):
 * - Xendit: official logo PNG
 * - Solana: full horizontal lockup SVG from https://solana.com/branding
 * - Base: white lockup SVG from the official Base brand kit (brand.base.org)
 * - BNB Chain: lockup SVG from official BNB Chain docs (docs.bnbchain.org)
 * - Blockchain.com: lockup SVG from Blockchain.com's own GitHub repo
 *
 * Currencies (fiat) use a neutral gold badge with the currency symbol +
 * wordmark (not a company logo). IDR adalah anchor (KORAMP IDR-first),
 * didampingi mata uang lain sebagai sinyal jangkauan global.
 *
 * Artwork is never altered: only display height is normalized (width auto,
 * exact aspect ratios preserved), plus opacity for dark-theme integration.
 * All items share one uniform display height so every logo carries the
 * same visual weight.
 * Track holds the sequence twice and translates exactly -50%: a seamless
 * endless loop. Hover pauses in place; reduced motion shows a stable row.
 */

interface Item {
  id: string;
  label: string;
  href: string | null;
  src?: string;
  width: number;
  height: number;
  /** Display height in px — uniform for all items so logos render sama besar. */
  h: number;
  /** Untuk item mata uang: simbol di badge (mis. "Rp", "$"). */
  symbol?: string;
  /** Untuk item mata uang: kode/nama di wordmark (mis. "USD", "Rupiah"). */
  code?: string;
}

// Wordmark size for the text-only items (currencies), matched to the
// uniform logo height below.
const WORDMARK_SIZE = 30;

const ITEMS: Item[] = [
  // ─── Payment infrastructure ───────────────────────────────────────────
  { id: 'xendit', label: 'Xendit', href: 'https://www.xendit.co/', src: '/logos/xendit.png', width: 432, height: 132, h: 72 },
  // ─── Chains & ecosystem ───────────────────────────────────────────
  { id: 'blockchain', label: 'Blockchain.com', href: 'https://www.blockchain.com/', src: '/logos/blockchaincom.svg', width: 432, height: 48, h: 72 },
  { id: 'solana', label: 'Solana', href: 'https://solana.com/', src: '/logos/solana.svg', width: 646, height: 96, h: 72 },
  { id: 'base', label: 'Base', href: 'https://www.base.org/', src: '/logos/base.svg', width: 1280, height: 324, h: 72 },
  { id: 'bnb', label: 'BNB Chain', href: 'https://www.bnbchain.org/', src: '/logos/bnbchain.svg', width: 137, height: 24, h: 72 },
  // ─── Currencies (jangkauan global) ────────────────────────────────
  { id: 'idr', label: 'Indonesian Rupiah', href: null, symbol: 'Rp', code: 'Rupiah', width: 0, height: 0, h: 72 },
  { id: 'usd', label: 'US Dollar', href: null, symbol: '$', code: 'USD', width: 0, height: 0, h: 72 },
  { id: 'eur', label: 'Euro', href: null, symbol: '€', code: 'EUR', width: 0, height: 0, h: 72 },
  { id: 'sgd', label: 'Singapore Dollar', href: null, symbol: 'S$', code: 'SGD', width: 0, height: 0, h: 72 },
  { id: 'gbp', label: 'British Pound', href: null, symbol: '£', code: 'GBP', width: 0, height: 0, h: 72 },
  { id: 'jpy', label: 'Japanese Yen', href: null, symbol: '¥', code: 'JPY', width: 0, height: 0, h: 72 },
  { id: 'aud', label: 'Australian Dollar', href: null, symbol: 'A$', code: 'AUD', width: 0, height: 0, h: 72 },
];

function LogoItem({ id, label, href, src, width, height, h, symbol, code }: Item) {
  const cls =
    'ecosystem-logo flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-max opacity-75 transition-all duration-200 hover:opacity-100 hover:scale-[1.04] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B78F]/60 rounded-lg px-1';
  const isCurrency = !src && symbol;
  // Per-item optically balanced height; width follows the official aspect ratio.
  const w = src ? Math.round((width / height) * h) : 0;
  const inner = (
    <>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" aria-hidden width={w} height={h} style={{ height: h, width: 'auto', flexShrink: 0 }} draggable={false} />
      ) : (
        <span
          aria-hidden
          className="flex items-center justify-center rounded-full border border-[#D4B78F]/50 bg-[#D4B78F]/10 text-[#D4B78F] font-bold"
          style={{ height: h, width: h, flexShrink: 0, fontSize: 28 }}
        >
          {symbol}
        </span>
      )}
      {isCurrency && (
        <span
          style={{
            color: '#CFCFD4',
            opacity: 1,
            fontSize: WORDMARK_SIZE,
            lineHeight: '40px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            overflow: 'visible',
            maxWidth: 'none',
          }}
        >
          {code}
        </span>
      )}
    </>
  );
  if (!href) {
    return (
      <span className={cls} role="img" aria-label={label}>
        {inner}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${cls} cursor-pointer`}>
      {inner}
    </a>
  );
}

export function EcosystemMarquee() {
  return (
    <div
      className="ecosystem-marquee overflow-hidden"
      role="region"
      aria-label="Ekosistem, partner, dan mata uang KORAMP"
    >
      <div className="ecosystem-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="ecosystem-seq">
            {ITEMS.map((item) => (
              <LogoItem key={`${copy}-${item.id}`} {...item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
