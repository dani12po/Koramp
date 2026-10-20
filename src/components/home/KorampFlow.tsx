'use client';

import { useCurrency } from '@/components/home/useCurrency';

const FLOW = "M 300 560 C 520 380, 700 700, 960 540 C 1180 400, 1300 640, 1440 560 C 1560 500, 1640 560, 1720 540";
const QR = Array.from({ length: 121 }, (_, i) => {
  const x = i % 11, y = Math.floor(i / 11);
  const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
  return !finder && ((x * 7 + y * 13 + x * y) % 5) < 2 ? [x, y] : null;
}).filter(Boolean) as [number, number][];
const tokens = [
  { l: "SOL", d: "0s", c: "var(--kr-sol)" },
  { l: "ETH", d: "-4s", c: "var(--kr-eth)" },
  { l: "BNB", d: "-8s", c: "var(--kr-gold)" },
];

export function KorampFlow() {
  const currency = useCurrency();
  return (
    <svg viewBox="0 0 1920 1080" className="mx-auto block h-auto w-full max-w-[860px] opacity-90" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }} role="img" aria-label="Alur transaksi KORAMP: Wallet, crypto, QRIS, Bank, multi-mata uang">
      <defs>
        <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="var(--kr-grid)" strokeWidth=".6" /></pattern>
        <radialGradient id="gHalo"><stop offset="0" stopColor="var(--kr-gold)" stopOpacity=".22" /><stop offset="1" stopColor="var(--kr-gold)" stopOpacity="0" /></radialGradient>
        <radialGradient id="eHalo"><stop offset="0" stopColor="var(--kr-green)" stopOpacity=".25" /><stop offset="1" stopColor="var(--kr-green)" stopOpacity="0" /></radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--kr-text)" stopOpacity=".1" /><stop offset=".5" stopColor="var(--kr-text)" stopOpacity=".02" /><stop offset="1" stopColor="var(--kr-text)" stopOpacity=".05" /></linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--kr-gold-hi)" /><stop offset=".5" stopColor="var(--kr-gold)" /><stop offset="1" stopColor="var(--kr-gold-lo)" /></linearGradient>
        <linearGradient id="ribbon" x1="0" x2="1"><stop offset="0" stopColor="var(--kr-gold)" stopOpacity="0" /><stop offset=".3" stopColor="var(--kr-gold)" /><stop offset=".5" stopColor="var(--kr-green)" /><stop offset=".75" stopColor="var(--kr-gold)" /><stop offset="1" stopColor="var(--kr-green)" stopOpacity=".2" /></linearGradient>
        <linearGradient id="sheen" x1="0" x2="1"><stop offset="0" stopColor="var(--kr-text)" stopOpacity="0" /><stop offset=".5" stopColor="var(--kr-text)" stopOpacity=".9" /><stop offset="1" stopColor="var(--kr-text)" stopOpacity="0" /></linearGradient>
        <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="soft"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id="dof"><feGaussianBlur stdDeviation="2.5" /></filter>
        <clipPath id="qc"><rect x="830" y="390" width="260" height="300" rx="26" /></clipPath>
        <clipPath id="idrc"><text x="1720" y="570" textAnchor="middle" fontSize="120" fontWeight="800" letterSpacing="6">{currency}</text></clipPath>
      </defs>

      <g className="kr-par-far"><rect x="-100" y="-100" width="2120" height="1280" fill="url(#g)" opacity=".5" /></g>

      <g className="kr-cam">
        <path d={FLOW} fill="none" stroke="url(#ribbon)" strokeWidth="22" opacity=".1" filter="url(#soft)" />
        <path d={FLOW} fill="none" stroke="url(#ribbon)" strokeWidth="1.5" opacity=".45" className="kr-ribbon" />
        <path d={FLOW} fill="none" stroke="url(#ribbon)" strokeWidth="3" strokeDasharray="120 900" className="kr-dash" filter="url(#bloom)" />
        {Array.from({ length: 36 }, (_, i) => (
          <circle key={i} r={[1.6, 2.6, 4][i % 3]} fill={i % 4 === 0 ? "var(--kr-green)" : "var(--kr-gold-hi)"} className="kr-particle"
            filter={i % 5 === 0 ? "url(#dof)" : "url(#bloom)"}
            style={{ animationDelay: `${-i * 0.33}s`, animationDuration: `${10 + (i % 4)}s`, offsetRotate: "0deg", translate: `0 ${((i * 17) % 30) - 15}px` }} />
        ))}

        <g>
          <ellipse cx="300" cy="560" rx="260" ry="200" fill="url(#gHalo)" className="kr-breathe" />
          <ellipse cx="300" cy="560" rx="200" ry="70" fill="none" stroke="var(--kr-gold)" strokeOpacity=".15" />
          <g className="kr-emerge">
            <rect x="190" y="488" width="220" height="144" rx="22" fill="var(--kr-panel)" opacity=".65" />
            <rect x="190" y="488" width="220" height="144" rx="22" fill="url(#glass)" />
            <rect x="350" y="540" width="60" height="40" rx="10" fill="var(--kr-panel)" opacity=".6" />
            <circle cx="372" cy="560" r="6" fill="url(#metal)" />
            <text x="214" y="612" fill="var(--kr-text)" fontSize="22" fontWeight="600" letterSpacing="3">WALLET</text>
            <rect x="214" y="512" width="70" height="3" rx="1.5" fill="var(--kr-gold)" opacity=".7" />
          </g>
          {tokens.map((t) => (
            <g key={t.l} className="kr-orbit" style={{ animationDelay: t.d }}>
              <circle r="34" fill="var(--kr-panel)" opacity=".7" stroke={t.c} strokeWidth="1.5" />
              <circle r="34" fill="url(#glass)" />
              <circle r="26" fill="none" stroke={t.c} strokeOpacity=".35" />
              <text y="7" textAnchor="middle" fill={t.c} fontSize="18" fontWeight="800" letterSpacing="1">{t.l}</text>
            </g>
          ))}
        </g>

        <g>
          <ellipse cx="960" cy="540" rx="320" ry="300" fill="url(#eHalo)" className="kr-breathe" />
          <rect x="830" y="390" width="260" height="300" rx="26" fill="var(--kr-panel)" opacity=".7" />
          <rect x="830" y="390" width="260" height="300" rx="26" fill="url(#glass)" />
          <text x="856" y="428" fill="var(--kr-text)" fontSize="18" fontWeight="800" letterSpacing="4">QRIS</text>
          <circle cx="1062" cy="422" r="5" fill="var(--kr-green)" className="kr-blink" />
          <g transform="translate(860 448)">
            {([[0, 0], [8, 0], [0, 8]] as const).map(([x, y]) => (
              <g key={`${x}${y}`} transform={`translate(${x * 18} ${y * 18})`}>
                <rect width="54" height="54" rx="9" fill="none" stroke="var(--kr-green)" strokeWidth="6" />
                <rect x="16" y="16" width="22" height="22" rx="4" fill="var(--kr-gold)" />
              </g>
            ))}
            {QR.map(([x, y], i) => (
              <rect key={i} x={x * 18} y={y * 18} width="14" height="14" rx="2.5" fill="var(--kr-green)" className="kr-qr" style={{ animationDelay: `${(x + y) * 0.06 - 12}s` }} />
            ))}
          </g>
          <g clipPath="url(#qc)">
            <rect x="830" y="440" width="260" height="70" fill="url(#eHalo)" className="kr-scan" />
            <rect x="830" y="440" width="260" height="2" fill="var(--kr-green)" filter="url(#bloom)" className="kr-scan" />
            <rect x="830" y="390" width="80" height="300" fill="url(#sheen)" opacity=".08" className="kr-glare" />
          </g>
          <rect x="830" y="390" width="260" height="300" rx="26" fill="var(--kr-green)" opacity=".06" className="kr-confirm" />
          <text x="960" y="740" textAnchor="middle" fill="var(--kr-muted)" fontSize="16" letterSpacing="5">VERIFIED SETTLEMENT</text>
        </g>

        <g className="kr-par-near">
          <ellipse cx="1440" cy="560" rx="200" ry="170" fill="url(#gHalo)" opacity=".6" />
          <path d="M1350 500 L1440 450 L1530 500 Z" fill="var(--kr-panel)" opacity=".7" />
          {[1366, 1406, 1446, 1486].map((x) => <rect key={x} x={x} y="512" width="28" height="80" rx="3" fill="var(--kr-panel)" opacity=".6" />)}
          <rect x="1345" y="600" width="190" height="8" rx="3" fill="url(#metal)" opacity=".8" />
          <path d="M1350 500 L1440 450 L1530 500 M1380 512 V592 M1420 512 V592 M1460 512 V592 M1500 512 V592 M1345 604 H1535" fill="none" stroke="var(--kr-gold-hi)" strokeOpacity=".5" strokeWidth="2" strokeDasharray="40 400" className="kr-trace" filter="url(#bloom)" />
          <text x="1440" y="650" textAnchor="middle" fill="var(--kr-muted)" fontSize="16" letterSpacing="5">BANK</text>
        </g>

        <g>
          {[0, 1, 2].map((i) => <circle key={i} cx="1720" cy="530" r="60" fill="none" stroke="var(--kr-green)" className="kr-ripple" style={{ animationDelay: `${i * 1.3}s` }} />)}
          <text key={currency} x="1720" y="570" textAnchor="middle" fill="url(#metal)" fontSize="120" fontWeight="800" letterSpacing="6" className="currency-swap">{currency}</text>
          <g clipPath="url(#idrc)"><rect x="1560" y="440" width="70" height="160" fill="url(#sheen)" opacity=".6" className="kr-idr-sheen" /></g>
          <text x="1720" y="612" textAnchor="middle" fill="var(--kr-muted)" fontSize="22" letterSpacing="10">FIAT</text>
        </g>
      </g>
    </svg>
  );
}
