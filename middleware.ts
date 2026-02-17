/**
 * Crawler-only Open Graph middleware for article sharing.
 * - Detects social crawlers by User-Agent
 * - Rewrites /article/:id/:slug → /api/og?id=:id&slug=:slug
 * - Normal users continue to receive the React SPA
 */

import { rewrite, next } from '@vercel/functions';

const CRAWLER_PATTERNS = [
  /facebookexternalhit/i,
  /facebot/i,
  /whatsapp/i,
  /wab/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /telegrambot/i,
  /pinterest/i,
  /discordbot/i,
  /applebot/i,
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_PATTERNS.some((p) => p.test(userAgent));
}

export const config = {
  matcher: '/article/:path*',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Let normal users load the SPA
  if (!isCrawler(userAgent)) {
    return next();
  }

  /**
   * Expected paths:
   * /article/:id
   * /article/:id/:slug
   */
  const path = url.pathname.replace(/^\/article\/?/, '');
  const parts = path.split('/').filter(Boolean);

  const id = parts[0];
  const slug = parts[1] || '';

  if (!id) {
    return next();
  }

  const ogUrl = new URL('/api/og', url.origin);
  ogUrl.searchParams.set('id', id);

  // IMPORTANT: pass slug only if it exists
  if (slug) {
    ogUrl.searchParams.set('slug', slug);
  }

  return rewrite(ogUrl);
}
