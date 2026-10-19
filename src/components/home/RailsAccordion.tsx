'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowRightLeft, ChevronDown, CreditCard } from 'lucide-react';

const ITEMS = [
  {
    title: 'Kumpulkan',
    desc: 'Terima pembayaran IDR via MoonPay dan settle ke crypto: SOL, ETH, BNB. Quote dikunci di awal, tidak berubah sepihak.',
    icon: CreditCard,
  },
  {
    title: 'Cairkan',
    desc: 'Kirim crypto ke alamat deposit, terima IDR ke rekening bank lokal: BCA, BRI, BNI, Mandiri, dan lainnya. Cepat dan always-on.',
    icon: ArrowDownLeft,
  },
  {
    title: 'Otomatiskan',
    desc: 'Routing quote, likuiditas, dan verifikasi server-ke-server berjalan otomatis. Kamu cukup hubungkan wallet.',
    icon: ArrowRightLeft,
  },
];

/**
 * RailsAccordion — tiga langkah rails sebagai akordeon.
 * Satu item terbuka dalam satu waktu; klik item terbuka untuk menutupnya.
 */
export function RailsAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title} className="border-t border-[#232326] first:border-t-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`rails-panel-${i}`}
              id={`rails-button-${i}`}
              className="flex w-full items-center gap-4 py-5 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B78F]/60"
            >
              <span className="w-10 h-10 rounded-xl bg-[#D4B78F]/10 border border-[#D4B78F]/25 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#D4B78F]" aria-hidden />
              </span>
              <span className="text-[#F5F5F5] font-semibold text-lg tracking-[-0.02em]">
                {item.title}
              </span>
              <ChevronDown
                aria-hidden
                className={`w-5 h-5 ml-auto flex-shrink-0 text-[#8B8B93] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#D4B78F]' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={`rails-panel-${i}`}
                  role="region"
                  aria-labelledby={`rails-button-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="text-[#8B8B93] text-sm leading-relaxed pb-5 pl-[56px] pr-2">
                    {item.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
