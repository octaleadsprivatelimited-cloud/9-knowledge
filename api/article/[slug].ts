/**
 * Server-side Open Graph and SEO meta tags for article URLs.
 *
 * This app is Vite + React (not Next.js). Social crawlers (WhatsApp, Facebook, X, LinkedIn)
 * do not execute JavaScript, so meta tags must be in the initial HTML. This serverless
 * function returns that HTML when crawlers request /article/:slug (via middleware).
 *
 * No useEffect, react-helmet, or client-only meta updates are used for crawlers;
 * all OG/SEO tags are generated here on the server.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, getDoc, doc, limit } from 'firebase/firestore';

const SITE_URL = 'https://9knowledge.com';
const SITE_TITLE = '9knowledge';
const SITE_DESCRIPTION = 'Your Trusted Source for News & Insights';
// Social preview minimum recommended size: 1200×630
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop';
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

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
  try {
    const path = (req.url || '').split('?')[0] || '';
    const match = path.match(/\/api\/article\/([^/]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch (_) {}
  return null;
}

function getArticleIdFromRequest(req: VercelRequest): string | null {
  const id = req.query?.id;
  if (typeof id === 'string' && id.trim()) return id.trim();
  return null;
}

type ArticleMeta = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  slug: string;
};

function extractArticleMeta(data: Record<string, unknown>, docId: string): ArticleMeta | null {
  const status = (data.status || '').toString().toLowerCase();
  const isPublished = status === 'published';
  const scheduledAt = data.scheduled_at;
  const isScheduledAndDue =
    status === 'scheduled' &&
    scheduledAt &&
    new Date((scheduledAt as { toDate?: () => Date })?.toDate ? (scheduledAt as { toDate: () => Date }).toDate() : (scheduledAt as Date)) <= new Date();
  if (!isPublished && !isScheduledAndDue) return null;

  const title = (data.meta_title || data.title || '').toString().trim() || SITE_TITLE;
  const description = (data.meta_description || data.excerpt || '').toString().trim().slice(0, 200) || SITE_DESCRIPTION;
  const feat = data.featured_image;
  const imageUrl = ensureAbsoluteImageUrl(feat ? String(feat) : '');
  const imageAlt = (data.featured_image_alt || data.title || title).toString().trim();
  const slug = (data.slug || docId).toString().trim();
  return { title, description, imageUrl, imageAlt, slug };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const slug = getSlugFromRequest(req);
  const articleId = getArticleIdFromRequest(req);
  if (!slug && !articleId) {
    res.status(400).send('Missing slug or id');
    return;
  }

  // Fallbacks: used only when article is missing or fields are empty (no site-level override of article metadata)
  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;
  let imageUrl = DEFAULT_OG_IMAGE;
  let imageAlt = SITE_TITLE;
  let resolvedSlug = slug || '';

  try {
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const appId = process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;

    if (apiKey && projectId && appId) {
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
      let meta: ArticleMeta | null = null;

      if (articleId) {
        try {
          const docRef = doc(db, 'articles', articleId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) meta = extractArticleMeta(docSnap.data(), docSnap.id);
        } catch (_) {}
      }

      if (!meta && slug) {
        const q = query(
          collection(db, 'articles'),
          where('slug', '==', slug),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const d = snapshot.docs[0];
          meta = extractArticleMeta(d.data(), d.id);
        }
      }

      if (meta) {
        title = meta.title;
        description = meta.description;
        imageUrl = meta.imageUrl;
        imageAlt = meta.imageAlt;
        resolvedSlug = meta.slug;
      }
    }
  } catch (e) {
    console.error('Article meta API error:', e);
  }

  const canonicalUrl = `${SITE_URL}/article/${encodeURIComponent(resolvedSlug || 'article')}${articleId ? `?id=${encodeURIComponent(articleId)}` : ''}`;

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(imageUrl);
  const safeImageAlt = escapeHtml(imageAlt);
  const safeUrl = escapeHtml(canonicalUrl);

  // All tags in initial HTML so crawlers never need JavaScript. No site-level metadata overrides article.
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
  <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
  <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
  <meta property="og:image:alt" content="${safeImageAlt}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:site_name" content="9knowledge" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <meta name="twitter:image:alt" content="${safeImageAlt}" />
  <link rel="canonical" href="${safeUrl}" />
</head>
<body><p>Loading...</p></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
