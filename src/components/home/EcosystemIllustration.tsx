'use client';

import { useReducedMotionSvg } from '@/components/home/useReducedMotionSvg';
import { useCurrency } from '@/components/home/useCurrency';

const G = 'var(--gold)';
const GR = 'var(--green)';
const FG = 'var(--foreground)';

const CX = 800;
const CY = 450;

const flows = [
  { id: 'f-trader', d: `M ${CX - 150} ${CY - 90} C 600 250, 480 220, 360 230`, dur: 5 },
  { id: 'f-free', d: `M ${CX + 150} ${CY - 90} C 1000 250, 1120 220, 1240 230`, dur: 5.5 },
  { id: 'f-web3', d: `M ${CX - 150} ${CY + 90} C 600 650, 480 680, 360 670`, dur: 6 },
  { id: 'f-biz', d: `M ${CX + 150} ${CY + 90} C 1000 650, 1120 680, 1240 670`, dur: 6.5 },
  { id: 'f-idr', d: `M ${CX} ${CY + 175} C ${CX - 40} 700, ${CX + 40} 740, ${CX} 790`, dur: 3 },
];

const orbitPath = `M ${CX - 300} ${CY} a 300 115 0 1 0 600 0 a 300 115 0 1 0 -600 0`;

function Segment({ x, y, label, cls, children }: { x: number; y: number; label: string; cls: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`ka-float ${cls}`}>
        <circle r="62" fill="var(--ink)" stroke={G} strokeOpacity=".35" />
        <circle r="62" fill="url(#ka-soft)" />
        <g fill="none" stroke={G} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{children}</g>
        <text y="105" textAnchor="middle" className={`ka-label ${cls}`}>{label}</text>
      </g>
    </g>
  );
}

function OrbitIcon({ dur, begin, children }: { dur: number; begin: number; children: React.ReactNode }) {
  return (
    <g>
      <circle r="26" fill="var(--ink)" stroke={G} strokeOpacity=".5" />
      <g fill="none" stroke={FG} strokeOpacity=".85" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</g>
      <animateMotion dur={`${dur}s`} begin={`-${begin}s`} repeatCount="indefinite" path={orbitPath} />
    </g>
  );
}

export function EcosystemIllustration() {
  const ref = useReducedMotionSvg();
  const currency = useCurrency();
  const meridians = [0, 1, 2, 3, 4, 5];
  return (
    <svg ref={ref} viewBox="0 0 1600 900" className="ka-svg" role="img" aria-label="Ekosistem pembayaran KORAMP: trader, freelancer, komunitas Web3, dan bisnis terhubung ke Rupiah">
      <defs>
        <radialGradient id="ka-glow"><stop offset="0" stopColor={G} stopOpacity=".28" /><stop offset="1" stopColor={G} stopOpacity="0" /></radialGradient>
        <radialGradient id="ka-soft" cx=".3" cy=".25"><stop offset="0" stopColor={G} stopOpacity=".14" /><stop offset="1" stopColor={G} stopOpacity="0" /></radialGradient>
        <radialGradient id="ka-green"><stop offset="0" stopColor={GR} stopOpacity=".5" /><stop offset="1" stopColor={GR} stopOpacity="0" /></radialGradient>
        <clipPath id="ka-globe-clip"><circle cx={CX} cy={CY} r="170" /></clipPath>
        <filter id="ka-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <circle cx={CX} cy={CY} r="380" fill="url(#ka-glow)" className="ka-pulse" />

      {flows.map((f) => (
        <g key={f.id}>
          <path id={f.id} d={f.d} fill="none" stroke={G} strokeOpacity=".18" strokeWidth="1.5" />
          <path d={f.d} fill="none" stroke={G} strokeOpacity=".55" strokeWidth="1.5" className="ka-dash" />
        </g>
      ))}

      <path d={orbitPath} fill="none" stroke={FG} strokeOpacity=".08" />
      <ellipse cx={CX} cy={CY} rx="230" ry="230" fill="none" stroke={G} strokeOpacity=".1" strokeDasharray="2 8" className="ka-spin-rev" style={{ transformOrigin: `${CX}px ${CY}px` }} />

      <circle cx={CX} cy={CY} r="170" fill="var(--ink)" />
      <g clipPath="url(#ka-globe-clip)" fill="none" stroke={G} strokeWidth="1.2">
        {[-120, -60, 0, 60, 120].map((dy) => (
          <ellipse key={dy} cx={CX} cy={CY + dy} rx={Math.sqrt(170 * 170 - dy * dy)} ry="18" strokeOpacity=".3" />
        ))}
        {meridians.map((i) => (
          <ellipse key={i} cx={CX} cy={CY} rx="170" ry="170" strokeOpacity=".45">
            <animate attributeName="rx" values="170;0;170" keyTimes="0;.5;1" dur="24s" begin={`-${i * 2}s`} repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" />
          </ellipse>
        ))}
        <g className="ka-spin" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          {([[-90, -60], [40, -110], [110, 30], [-30, 80], [60, 120], [-130, 20], [10, -20]] as [number, number][]).map(([x, y], i) => (
            <circle key={i} cx={CX + x} cy={CY + y} r="3.5" fill={G} stroke="none" className="ka-pulse" style={{ animationDelay: `-${i * 0.6}s` }} />
          ))}
        </g>
      </g>
      <circle cx={CX} cy={CY} r="170" fill="none" stroke={G} strokeWidth="2" />
      <circle cx={CX} cy={CY} r="170" fill="url(#ka-soft)" />

      <OrbitIcon dur={16} begin={0}>
        <rect x="-11" y="-11" width="9" height="9" /><rect x="2" y="-11" width="9" height="9" /><rect x="-11" y="2" width="9" height="9" /><path d="M3 3h3v3M10 10h1M3 10h3" />
      </OrbitIcon>
      <OrbitIcon dur={16} begin={4}>
        <rect x="-12" y="-8" width="24" height="17" rx="3" /><path d="M4 0h8v5H4z" />
      </OrbitIcon>
      <OrbitIcon dur={16} begin={8}>
        <rect x="-13" y="-8" width="26" height="17" rx="3" /><path d="M-13 -2h26M-8 4h6" />
      </OrbitIcon>
      <OrbitIcon dur={16} begin={12}>
        <path d="M-12 -3 0 -11 12 -3ZM-9 -1v9M-3 -1v9M3 -1v9M9 -1v9M-13 10h26" />
      </OrbitIcon>

      <Segment x={300} y={230} label="Trader" cls="">
        <path d="M-22 -18v36M-22 -8h0" /><rect x="-28" y="-8" width="12" height="16" rx="2" />
        <path d="M0 -26v40" /><rect x="-6" y="-18" width="12" height="22" rx="2" />
        <path d="M22 -12v36" /><rect x="16" y="-2" width="12" height="16" rx="2" fill={GR} fillOpacity=".25" stroke={GR} />
      </Segment>
      <Segment x={1300} y={230} label="Freelancer" cls="d1">
        <circle r="22" /><ellipse rx="10" ry="22" /><path d="M-22 0h44" />
        <path d="M18 -26 30 -26 30 -14" stroke={GR} /><path d="M14 -10 30 -26" stroke={GR} />
      </Segment>
      <Segment x={300} y={670} label="Web3" cls="d2">
        <rect x="-24" y="-14" width="40" height="30" rx="5" /><path d="M6 -2h10v8H6z" />
        <circle cx="26" cy="-24" r="4" /><circle cx="-26" cy="-26" r="4" /><path d="M23 -21 14 -14M-23 -23 -16 -14" />
      </Segment>
      <Segment x={1300} y={670} label="Business" cls="d3">
        <path d="M-26 -8 -20 -24h40l6 16Z" /><path d="M-22 -8v28h44V-8" /><path d="M-6 20V6h12v14" />
      </Segment>

      <g transform={`translate(${CX} 820)`}>
        <circle r="40" fill="url(#ka-green)" />
        <circle r="26" fill="none" stroke={GR} strokeWidth="1.5" className="ka-ripple" />
        <circle r="26" fill="none" stroke={GR} strokeWidth="1.5" className="ka-ripple d1" />
        <circle r="26" fill="var(--ink)" stroke={GR} strokeWidth="2" />
        <text key={currency} y="7" textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fontWeight="600" fill={GR} className="currency-swap">{currency}</text>
      </g>

      {flows.map((f) =>
        [0, 1, 2].map((k) => (
          <circle key={`${f.id}-${k}`} r={k === 0 ? 4 : 2.5} fill={f.id === 'f-idr' ? GR : G}>
            <animateMotion dur={`${f.dur}s`} begin={`-${(f.dur / 3) * k}s`} repeatCount="indefinite" keyPoints={f.id === 'f-idr' ? '0;1' : '1;0'} keyTimes="0;1" calcMode="linear">
              <mpath href={`#${f.id}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur={`${f.dur}s`} begin={`-${(f.dur / 3) * k}s`} repeatCount="indefinite" />
          </circle>
        )),
      )}
    </svg>
  );
}
