/**
 * Server-side Open Graph and SEO metadata for article URLs.
 *
 * Article routing uses the document ID in the path: /article/[id] or /article/[id]/[slug].
 * This API fetches the article by ID using Firebase Admin SDK (server-safe; no client SDK).
 * Metadata is included in the initial HTML response for crawlers (WhatsApp, Facebook, X, LinkedIn).
 *
 * No useEffect, useSearchParams, or client-only hooks for metadata.
 * Site-level metadata never overrides article-level metadata.
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

/** Normalize to public HTTPS URL so social crawlers can fetch the thumbnail. Fallback only when missing. */
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

function getIdFromRequest(req: VercelRequest): string | null {
  const id = req.query?.id;
  if (typeof id === 'string' && id.trim()) return id.trim();
  try {
    const path = (req.url || '').split('?')[0] || '';
    const match = path.match(/\/api\/article\/([^/]+)/);
    if (match?.[1]) return match[1];
  } catch (_) {}
  return null;
}

type ArticleMeta = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  slug: string;
};

function getStringOrUrlFromField(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && value !== null && 'url' in value && typeof (value as { url: unknown }).url === 'string') {
    return String((value as { url: string }).url).trim();
  }
  return String(value).trim();
}

function getArticleImageUrl(data: Record<string, unknown>): string {
  const candidates = [data.og_image, data.featured_image, data.featuredImage, data.image, data.thumbnail];
  for (const v of candidates) {
    const s = getStringOrUrlFromField(v);
    if (s && s.length > 5) return ensureAbsoluteImageUrl(s);
  }
  return ensureAbsoluteImageUrl('');
}

function extractArticleMeta(data: Record<string, unknown>, docId: string): ArticleMeta | null {
  const status = (data.status || '').toString().toLowerCase();
  const isPublished = status === 'published';
  const scheduledAt = data.scheduled_at;
  const scheduledDate = scheduledAt && typeof (scheduledAt as { toDate?: () => Date }).toDate === 'function'
    ? (scheduledAt as { toDate: () => Date }).toDate()
    : scheduledAt;
  const isScheduledAndDue =
    status === 'scheduled' && scheduledAt && new Date(scheduledDate as Date) <= new Date();
  if (!isPublished && !isScheduledAndDue) return null;

  const title = (data.meta_title || data.title || '').toString().trim() || SITE_TITLE;
  let description = '';
  for (const d of [data.meta_description, data.excerpt, data.description]) {
    const s = (d != null ? String(d).trim() : '').slice(0, 200);
    if (s) {
      description = s;
      break;
    }
  }
  if (!description && data.content) {
    const raw = String(data.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    description = raw.slice(0, 200);
  }
  if (!description) description = SITE_DESCRIPTION;
  const imageUrl = getArticleImageUrl(data);
  const imageAlt = (data.featured_image_alt || data.title || title).toString().trim();
  const slug = (data.slug || docId).toString().trim();
  return { title, description, imageUrl, imageAlt, slug };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const id = getIdFromRequest(req);
  if (!id) {
    res.status(400).send('Missing article id');
    return;
  }

  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;
  let imageUrl = DEFAULT_OG_IMAGE;
  let imageAlt = SITE_TITLE;
  let slug = id;

  try {
    let data: Record<string, unknown> | null = null;
    let docId = id;

    const db = getAdminFirestore();
    if (db) {
      const docRef = db.collection('articles').doc(id);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        data = docSnap.data() as Record<string, unknown>;
        docId = docSnap.id;
      }
    }

    if (!data) {
      const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      const appId = process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID;
      if (apiKey && projectId && appId) {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
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
        const clientDb = getFirestore();
        const docSnap = await getDoc(doc(clientDb, 'articles', id));
        if (docSnap.exists()) {
          data = docSnap.data() as Record<string, unknown>;
          docId = docSnap.id;
        }
      }
    }

    if (data) {
      const meta = extractArticleMeta(data, docId);
      if (meta) {
        title = meta.title;
        description = meta.description;
        imageUrl = meta.imageUrl;
        imageAlt = meta.imageAlt;
        slug = meta.slug;
      }
    }
  } catch (e) {
    console.error('Article meta API error:', e);
  }

  const canonicalUrl = `${SITE_URL}/article/${encodeURIComponent(id)}`;
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
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:url" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
  <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
  <meta property="og:image:alt" content="${safeImageAlt}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:site_name" content="9knowledge" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${safeImage}" />
  <meta name="twitter:image:alt" content="${safeImageAlt}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <link rel="canonical" href="${safeUrl}" />
  <link rel="image_src" href="${safeImage}" />
</head>
<body><p>Loading...</p></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
