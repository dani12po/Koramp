import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * app/robots.ts — menggantikan public/robots.txt statis.
 * Next.js App Router akan serve ini di /robots.txt secara dinamis,
 * sehingga SITE_URL selalu akurat dari satu sumber kebenaran.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/', '/order/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
