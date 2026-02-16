/**
 * Sends social crawlers (Facebook, WhatsApp, Twitter, etc.) to the article-meta API
 * so they receive HTML with og/twitter meta tags. Normal users get the SPA as usual.
 */
import { rewrite, next } from '@vercel/functions';

const CRAWLER_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /WhatsApp/i,      // WhatsApp link preview (e.g. WhatsApp/2.x)
  /WhatApp/i,       // occasional typo in UA
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /TelegramBot/i,
  /Pinterest/i,
  /Googlebot/i,
  /bingbot/i,
  /Discordbot/i,
  /Applebot/i,
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

  if (!isCrawler(userAgent)) {
    return next();
  }

  // pathname: /article/[id] or /article/[id]/[slug] — first segment is article ID
  const pathname = url.pathname.replace(/^\/article\/?/, '').trim();
  const id = pathname.split('/')[0].split('?')[0];
  if (!id) {
    return next();
  }

  const apiUrl = new URL(`/api/article/${encodeURIComponent(id)}`, url.origin);
  return rewrite(apiUrl);
}
