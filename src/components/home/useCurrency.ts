'use client';

import { useEffect, useState } from 'react';

export const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD'] as const;

/** Cycles the fiat currency code so the illustration isn't IDR-only. */
export function useCurrency(intervalMs = 2200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % CURRENCIES.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return CURRENCIES[index];
}
