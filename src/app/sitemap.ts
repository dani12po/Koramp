import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * app/sitemap.ts — https://www.koramp.xyz/sitemap.xml
 * URL diambil dari SITE_URL (lib/site.ts) — tidak pernah hardcode localhost.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${SITE_URL}/`,             lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/topup-sell`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/transactions`, lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE_URL}/fees`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`,        lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/risk`,         lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`,      lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`,      lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
