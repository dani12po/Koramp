'use client';

/**
 * RotatingCurrency — kata fiat di headline hero yang berputar.
 * "Terima crypto global, settle [Rupiah/USD/EUR/...] instan"
 *
 * Animasi fade + slide pendek, menghormati prefers-reduced-motion
 * (langsung tampilkan statik tanpa animasi).
 * Rupiah selalu jadi kata pertama (anchor — KORAMP IDR-first).
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const CURRENCIES = [
  'Rupiah',
  'USD',
  'EUR',
  'SGD',
  'GBP',
  'JPY',
  'AUD',
];

interface Props {
  /** Interval per kata, ms. Default 2200ms. */
  intervalMs?: number;
  className?: string;
}

export function RotatingCurrency({ intervalMs = 2200, className = '' }: Props) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return; // statik di reduced motion
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % CURRENCIES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, reduceMotion]);

  const current = CURRENCIES[index];

  // Reduced motion: render statik (Rupiah, anchor) tanpa animasi.
  if (reduceMotion) {
    return (
      <span className={className} aria-label="Rupiah">
        Rupiah
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block align-baseline ${className}`}
      // Lebar minimal agar teks di sebelahnya tidak goyah saat kata berganti.
      style={{ minWidth: '1.2em' }}
      aria-live="polite"
      aria-label={current}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="inline-block whitespace-nowrap"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
