/**
 * Serverless function that returns HTML with article-specific og/twitter meta tags.
 * Used when social crawlers (Facebook, WhatsApp, Twitter, etc.) request /article/:slug.
 * Crawlers don't run JavaScript, so they need meta tags in the initial HTML.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

const SITE_URL = 'https://9knowledge.com';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop';

function ensureAbsoluteImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || !String(imageUrl).trim()) return DEFAULT_OG_IMAGE;
  const trimmed = String(imageUrl).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${SITE_URL}${trimmed}`;
  return `${SITE_URL}/${trimmed}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSlugFromRequest(req: VercelRequest): string | null {
  const slug = req.query?.slug;
  if (typeof slug === 'string' && slug.trim()) return decodeURIComponent(slug.trim());
  // Fallback: parse from URL path (e.g. /api/article/my-slug -> my-slug)
  try {
    const path = (req.url || '').split('?')[0] || '';
    const match = path.match(/\/api\/article\/([^/]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch (_) {}
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const slug = getSlugFromRequest(req);
  if (!slug) {
    res.status(400).send('Missing slug');
    return;
  }

  let title = '9knowledge';
  let description = 'Your Trusted Source for News & Insights';
  let imageUrl = DEFAULT_OG_IMAGE;
  let canonicalUrl = `${SITE_URL}/article/${encodeURIComponent(slug)}`;

  try {
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const appId = process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;

    if (!apiKey || !projectId || !appId) {
      console.warn('Article meta API: Firebase env vars missing, using defaults');
    } else {
      if (!getApps().length) {
        initializeApp({
          apiKey,
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
          projectId,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
          appId,
        });
      }

      const db = getFirestore();
      const q = query(
        collection(db, 'articles'),
        where('slug', '==', slug),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const status = (data.status || '').toString().toLowerCase();
        const isPublished = status === 'published';
        const scheduledAt = data.scheduled_at;
        const isScheduledAndDue =
          status === 'scheduled' &&
          scheduledAt &&
          new Date(scheduledAt?.toDate ? scheduledAt.toDate() : scheduledAt) <= new Date();

        if (isPublished || isScheduledAndDue) {
          title = (data.meta_title || data.title || title).toString().trim();
          description = (data.meta_description || data.excerpt || description || '').toString().trim().slice(0, 200);
          const feat = data.featured_image;
          imageUrl = ensureAbsoluteImageUrl(feat ? String(feat) : '');
        }
      }
    }
  } catch (e) {
    console.error('Article meta API error:', e);
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(canonicalUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} | 9knowledge</title>
  <meta name="description" content="${safeDescription}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:site_name" content="9knowledge" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <link rel="canonical" href="${safeUrl}" />
</head>
<body><p>Loading...</p></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
