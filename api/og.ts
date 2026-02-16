/**
 * Dedicated server-side Open Graph preview endpoint for article pages.
 *
 * GET /api/og?id=<articleId> or /api/og?slug=<articleSlug>
 * - Fetches article from Firestore on the server (Admin SDK or client SDK fallback).
 * - Returns minimal HTML with og:title, og:description, og:image, og:url, og:type=article.
 * - No client-side JavaScript; fallback values only when article data is missing.
 * - Default site metadata never overrides article metadata.
 *
 * Used by middleware: crawler requests to /article/:id are rewritten to /api/og?id=:id.
 * Also works when opened directly in a browser (e.g. /api/og?id=xxx).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

const SITE_URL = 'https://9knowledge.com';
const SITE_TITLE = '9knowledge';
const SITE_DESCRIPTION = 'Your Trusted Source for News & Insights';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop';
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

function getAdminFirestore(): admin.firestore.Firestore | null {
  if (!admin.apps.length) {
    const cred = getCredentials();
    if (cred) {
      admin.initializeApp({ credential: cred });
    } else {
      return null;
    }
  }
  return admin.firestore();
}

function getCredentials(): admin.credential.Credential | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json && json.trim()) {
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;
      return admin.credential.cert(parsed as admin.ServiceAccount);
    } catch (_) {
      return null;
    }
  }
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    } as admin.ServiceAccount);
  }
  return null;
}

function ensureAbsoluteImageUrl(imageUrl: string | null | undefined): string {
  const raw = imageUrl != null ? String(imageUrl).trim() : '';
  if (!raw) return DEFAULT_OG_IMAGE;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type ArticleMeta = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  slug: string;
  id: string;
};

function getArticleImageUrl(data: Record<string, unknown>): string {
  const og = data.og_image != null ? String(data.og_image).trim() : '';
  if (og) return ensureAbsoluteImageUrl(og);
  const feat =
    (data.featured_image != null ? String(data.featured_image).trim() : '') ||
    (data.featuredImage != null ? String(data.featuredImage).trim() : '');
  return ensureAbsoluteImageUrl(feat || '');
}

function extractArticleMeta(data: Record<string, unknown>, docId: string): ArticleMeta | null {
  const status = (data.status || '').toString().toLowerCase();
  const isPublished = status === 'published';
  const scheduledAt = data.scheduled_at;
  const scheduledDate =
    scheduledAt && typeof (scheduledAt as { toDate?: () => Date }).toDate === 'function'
      ? (scheduledAt as { toDate: () => Date }).toDate()
      : scheduledAt;
  const isScheduledAndDue =
    status === 'scheduled' && scheduledAt && new Date(scheduledDate as Date) <= new Date();
  if (!isPublished && !isScheduledAndDue) return null;

  const title = (data.meta_title || data.title || '').toString().trim() || SITE_TITLE;
  const description =
    (data.meta_description || data.excerpt || '').toString().trim().slice(0, 200) || SITE_DESCRIPTION;
  const imageUrl = getArticleImageUrl(data);
  const imageAlt = (data.featured_image_alt || data.title || title).toString().trim();
  const slug = (data.slug || docId).toString().trim();
  return { title, description, imageUrl, imageAlt, slug, id: docId };
}

async function fetchArticleByAdmin(
  id: string | null,
  slug: string | null
): Promise<{ data: Record<string, unknown>; docId: string } | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  if (id) {
    const docSnap = await db.collection('articles').doc(id).get();
    if (docSnap.exists) {
      return { data: docSnap.data() as Record<string, unknown>, docId: docSnap.id };
    }
  }

  if (slug) {
    const snap = await db.collection('articles').where('slug', '==', slug).limit(1).get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { data: doc.data() as Record<string, unknown>, docId: doc.id };
    }
  }

  return null;
}

async function fetchArticleByClient(
  id: string | null,
  slug: string | null
): Promise<{ data: Record<string, unknown>; docId: string } | null> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const appId = process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;
  if (!apiKey || !projectId || !appId) return null;

  const { initializeApp, getApps } = await import('firebase/app');
  const { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } = await import(
    'firebase/firestore'
  );

  if (!getApps().length) {
    initializeApp({
      apiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId,
      storageBucket:
        process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId:
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        '',
      appId,
    });
  }

  const clientDb = getFirestore();

  if (id) {
    const docSnap = await getDoc(doc(clientDb, 'articles', id));
    if (docSnap.exists()) {
      return { data: docSnap.data() as Record<string, unknown>, docId: docSnap.id };
    }
  }

  if (slug) {
    const q = query(
      collection(clientDb, 'articles'),
      where('slug', '==', slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { data: d.data() as Record<string, unknown>, docId: d.id };
    }
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const id = typeof req.query?.id === 'string' ? req.query.id.trim() : null;
  const slug = typeof req.query?.slug === 'string' ? req.query.slug.trim() : null;

  if (!id && !slug) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send('<p>Missing <code>id</code> or <code>slug</code> query parameter.</p>');
  }

  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;
  let imageUrl = DEFAULT_OG_IMAGE;
  let imageAlt = SITE_TITLE;
  let articleId = id || slug || '';

  try {
    let result = await fetchArticleByAdmin(id, slug);
    if (!result) {
      result = await fetchArticleByClient(id, slug);
    }

    if (result) {
      const meta = extractArticleMeta(result.data, result.docId);
      if (meta) {
        title = meta.title;
        description = meta.description;
        imageUrl = meta.imageUrl;
        imageAlt = meta.imageAlt;
        articleId = meta.id;
      }
    }
  } catch (e) {
    console.error('OG endpoint error:', e);
  }

  const canonicalUrl = `${SITE_URL}/article/${encodeURIComponent(articleId)}`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(imageUrl);
  const safeImageAlt = escapeHtml(imageAlt);
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
  <link rel="image_src" href="${safeImage}" />
</head>
<body>
  <p>Loading…</p>
  <p><a href="${safeUrl}">View article</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
