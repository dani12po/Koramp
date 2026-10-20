import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, BookOpen, ExternalLink } from 'lucide-react';
import { TokenIcon } from '@/components/ui/TokenIcon';

const DOCS = 'https://docs.koramp.xyz';

// Link ke dokumentasi (subdomain terpisah, buka tab baru).
const DOCS_LINKS = [
  { label: 'Cara Top Up', href: `${DOCS}/docs/id/panduan-pengguna/cara-top-up` },
  { label: 'Cara Sell', href: `${DOCS}/docs/id/panduan-pengguna/cara-sell` },
  { label: 'Wallet yang Didukung', href: `${DOCS}/docs/id/panduan-pengguna/wallet-yang-didukung` },
  { label: 'Konsep Inti', href: `${DOCS}/docs/id/memulai/konsep-inti` },
  { label: 'API Reference', href: `${DOCS}/docs/id/api-reference` },
  { label: 'Roadmap', href: `${DOCS}/docs/id/roadmap` },
];

export function Footer() {
  return (
    <footer className="border-t border-[#1A1A1A] mt-16 py-12 bg-[#08080A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand — spans 2 cols on mobile for balance */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="Logo KORAMP" width={26} height={26} />
              <span className="text-white font-semibold text-base">KORAMP</span>
            </div>
            <p className="text-[#8B8B93] text-sm leading-relaxed">
              Crypto On/Off-Ramp Marketplace.<br />
              Hubungkan wallet, tanpa daftar akun.
            </p>
            <p className="text-[#5A5A60] text-xs mt-3">SOL · ETH (Base) · BNB</p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 text-[#8B8B93] text-xs">
                <CreditCard className="w-3 h-3 text-[#D4B78F]" aria-hidden />
                QRIS payment
              </span>
              <a
                href={DOCS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#D4B78F] border border-[#D4B78F]/40 bg-transparent hover:bg-[#D4B78F]/10 transition-colors"
              >
                <BookOpen className="w-3 h-3" aria-hidden />
                Docs
              </a>
            </div>
          </div>

          {/* Produk */}
          <div>
            <p className="text-[#F5F5F5] font-semibold text-sm mb-3">Produk</p>
            <div className="space-y-2">
              <Link href="/topup-sell" className="block text-[#8B8B93] hover:text-[#F5F5F5] text-sm transition-colors">Top Up/Sell Crypto</Link>
              <Link href="/transactions" className="block text-[#8B8B93] hover:text-[#F5F5F5] text-sm transition-colors">Transactions</Link>
              <Link href="/#how-it-works" className="block text-[#8B8B93] hover:text-[#F5F5F5] text-sm transition-colors">Cara Kerja</Link>
            </div>
          </div>

          {/* Dokumentasi — link ke docs.koramp.xyz */}
          <div>
            <p className="text-[#F5F5F5] font-semibold text-sm mb-3">Dokumentasi</p>
            <div className="space-y-2">
              {DOCS_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#8B8B93] hover:text-[#F5F5F5] text-sm transition-colors group"
                >
                  {l.label}
                  <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Perusahaan + Aset */}
          <div>
            <p className="text-[#F5F5F5] font-semibold text-sm mb-3">Perusahaan</p>
            <div className="space-y-2 mb-6">
              <Link href="/contact" className="block text-[#8B8B93] hover:text-[#F5F5F5] text-sm transition-colors">Hubungi Kami</Link>
              <Link href="/privacy" className="block text-[#8B8B93] hover:text-[#F5F5F5] text-sm transition-colors">Kebijakan Privasi</Link>
            </div>
            <p className="text-[#F5F5F5] font-semibold text-sm mb-3">Aset yang Didukung</p>
            <div className="space-y-2 text-sm text-[#8B8B93]">
              <p className="flex items-center gap-1.5"><TokenIcon symbol="SOL" size={14} /> SOL - Solana</p>
              <p className="flex items-center gap-1.5"><TokenIcon symbol="ETH" size={14} /> ETH - Base</p>
              <p className="flex items-center gap-1.5"><TokenIcon symbol="BNB" size={14} /> BNB - BSC</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1A1A1A] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[#5A5A60] text-xs">© 2024 KORAMP. All rights reserved.</p>
          <p className="text-[#5A5A60] text-xs text-center sm:text-right">
            Software MVP · Bukan layanan keuangan berlisensi · Verifikasi regulasi sebelum produksi
          </p>
        </div>
      </div>
    </footer>
  );
}
