'use client';

import { useReducedMotionSvg } from '@/components/home/useReducedMotionSvg';
import { useCurrency } from '@/components/home/useCurrency';

const G = 'var(--gold)';
const GR = 'var(--green)';
const FG = 'var(--foreground)';

const ribbon = 'M 360 450 C 480 330, 600 330, 690 450 C 780 570, 900 570, 990 450 C 1060 360, 1100 360, 1150 450';
const payout = 'M 1290 450 C 1340 400, 1380 330, 1440 300';

const tokens = [
  { t: 'SOL', begin: 0 },
  { t: 'ETH', begin: 4.66 },
  { t: 'BNB', begin: 9.33 },
];
const tokenOrbit = 'M 150 450 a 150 70 0 1 0 300 0 a 150 70 0 1 0 -300 0';

export function FlowIllustration() {
  const ref = useReducedMotionSvg();
  const currency = useCurrency();
  return (
    <svg ref={ref} viewBox="0 0 1600 900" className="ka-svg" role="img" aria-label="Alur transaksi KORAMP: wallet, quote terkunci, lalu QRIS ke Rupiah">
      <defs>
        <radialGradient id="kf-glow"><stop offset="0" stopColor={G} stopOpacity=".3" /><stop offset="1" stopColor={G} stopOpacity="0" /></radialGradient>
        <radialGradient id="kf-green"><stop offset="0" stopColor={GR} stopOpacity=".35" /><stop offset="1" stopColor={GR} stopOpacity="0" /></radialGradient>
        <linearGradient id="kf-ribbon" x1="0" x2="1"><stop offset="0" stopColor={G} stopOpacity=".2" /><stop offset=".5" stopColor={G} /><stop offset="1" stopColor={GR} /></linearGradient>
        <linearGradient id="kf-scan" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={GR} stopOpacity="0" /><stop offset="1" stopColor={GR} stopOpacity=".6" /></linearGradient>
        <clipPath id="kf-qr"><rect x="1150" y="355" width="150" height="190" rx="18" /></clipPath>
      </defs>

      <path id="kf-path" d={ribbon} fill="none" stroke="url(#kf-ribbon)" strokeWidth="10" strokeOpacity=".12" strokeLinecap="round" />
      <path d={ribbon} fill="none" stroke="url(#kf-ribbon)" strokeWidth="1.8" />
      <path d={ribbon} fill="none" stroke={G} strokeOpacity=".6" strokeWidth="1.5" className="ka-dash" />
      <path id="kf-pay" d={payout} fill="none" stroke={GR} strokeOpacity=".5" strokeWidth="1.5" className="ka-dash" />

      <circle cx="300" cy="450" r="220" fill="url(#kf-glow)" className="ka-pulse" />
      <path d={tokenOrbit} fill="none" stroke={FG} strokeOpacity=".07" />
      <g className="ka-float">
        <rect x="220" y="390" width="160" height="120" rx="20" fill="var(--ink)" stroke={G} strokeWidth="2" />
        <path d="M220 420h160" stroke={G} strokeOpacity=".35" />
        <rect x="320" y="440" width="60" height="40" rx="10" fill="none" stroke={G} strokeWidth="2" />
        <circle cx="342" cy="460" r="5" fill={G} />
        <text x="300" y="590" textAnchor="middle" className="ka-label-static">Wallet</text>
      </g>
      {tokens.map(({ t, begin }) => (
        <g key={t}>
          <circle r="22" fill="var(--ink)" stroke={G} strokeOpacity=".6" />
          <text y="5" textAnchor="middle" fontFamily="var(--font-display)" fontSize="11" fontWeight="600" fill={G} letterSpacing=".05em">{t}</text>
          <animateMotion dur="14s" begin={`-${begin}s`} repeatCount="indefinite" path={tokenOrbit} />
        </g>
      ))}

      <circle cx="800" cy="450" r="200" fill="url(#kf-glow)" />
      <g className="ka-float d1">
        <rect x="700" y="340" width="200" height="220" rx="28" fill={FG} fillOpacity=".03" stroke={FG} strokeOpacity=".15" />
        <rect x="725" y="365" width="150" height="8" rx="4" fill={FG} fillOpacity=".08" />
        <rect x="725" y="385" width="90" height="8" rx="4" fill={FG} fillOpacity=".06" />
        <circle cx="800" cy="480" r="60" fill={G} opacity="0" className="ka-lockglow" style={{ filter: 'blur(18px)' }} />
        <g className="ka-shackle">
          <path d="M775 470v-22a25 25 0 0 1 50 0v22" fill="none" stroke={G} strokeWidth="5" strokeLinecap="round" />
        </g>
        <rect x="760" y="468" width="80" height="62" rx="12" fill="var(--ink)" stroke={G} strokeWidth="2.5" />
        <circle cx="800" cy="494" r="6" fill={G} />
        <path d="M800 500v12" stroke={G} strokeWidth="3" strokeLinecap="round" />
        <text x="800" y="610" textAnchor="middle" className="ka-label-static">Quote</text>
      </g>

      <circle cx="1225" cy="450" r="190" fill="url(#kf-green)" className="ka-pulse" />
      <g className="ka-float d2">
        <rect x="1150" y="355" width="150" height="190" rx="18" fill="var(--ink)" stroke={GR} strokeWidth="2" />
        <g fill={FG} fillOpacity=".75">
          {([[1172, 380], [1248, 380], [1172, 456]] as [number, number][]).map(([x, y], i) => (
            <g key={i}><rect x={x} y={y} width="30" height="30" rx="4" fill="none" stroke={FG} strokeOpacity=".75" strokeWidth="4" /><rect x={x + 10} y={y + 10} width="10" height="10" /></g>
          ))}
          {[[1215, 382], [1225, 400], [1212, 420], [1235, 430], [1250, 420], [1270, 440], [1215, 456], [1230, 470], [1252, 462], [1265, 478], [1215, 488], [1245, 495], [1272, 500], [1180, 505], [1200, 515]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="8" height="8" rx="1.5" />
          ))}
        </g>
        <g clipPath="url(#kf-qr)">
          <g className="ka-scan">
            <rect x="1150" y="340" width="150" height="40" fill="url(#kf-scan)" />
            <rect x="1150" y="378" width="150" height="2" fill={GR} />
          </g>
        </g>
        <circle cx="1300" cy="355" r="22" fill="none" stroke={GR} strokeWidth="2" className="ka-checkring" />
        <circle cx="1300" cy="355" r="20" fill="var(--ink)" stroke={GR} strokeWidth="2" className="ka-check" style={{ strokeDasharray: 'none' }} />
        <path d="M1290 355l7 7 13-14" fill="none" stroke={GR} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="ka-check" />
        <text x="1225" y="600" textAnchor="middle" className="ka-label-static">QRIS</text>
      </g>

      <g transform="translate(1470 285)">
        <circle r="44" fill="url(#kf-glow)" className="ka-pulse" />
        <circle r="30" fill="var(--ink)" stroke={G} strokeWidth="1.5" />
        <path d="M-14 -4 0 -14 14 -4ZM-10 -2v12M-3 -2v12M4 -2v12M11 -2v12M-15 12h30" fill="none" stroke={G} strokeWidth="1.8" strokeLinejoin="round" />
        <text key={currency} y="62" textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fontWeight="600" fill={GR} className="currency-swap">{currency}</text>
      </g>

      {[0, 1, 2, 3, 4, 5].map((k) => (
        <circle key={k} r={k % 2 ? 2.5 : 4} fill={G}>
          <animateMotion dur="6s" begin={`-${k}s`} repeatCount="indefinite"><mpath href="#kf-path" /></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="6s" begin={`-${k}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {[0, 1].map((k) => (
        <circle key={`p${k}`} r="3" fill={GR}>
          <animateMotion dur="2.5s" begin={`-${k * 1.25}s`} repeatCount="indefinite"><mpath href="#kf-pay" /></animateMotion>
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin={`-${k * 1.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
