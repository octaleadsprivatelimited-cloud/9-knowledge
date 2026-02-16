/**
 * Serves the full SPA HTML for article URLs with article-specific (or site-default)
 * meta tags in the initial response so "View Page Source" and crawlers see correct
 * og:title, og:description, og:image. No routing or client-side changes.
 *
 * GET /api/article-page?path=<id> or path=<id>/<slug>
 * - Fetches article by id (first path segment) on the server.
 * - Injects og/twitter/canonical meta into the built index.html template.
 * - Returns the same document as the SPA so the app loads normally.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

const SITE_URL = 'https://9knowledge.com';
const SITE_TITLE = '9knowledge';
const SITE_DESCRIPTION =
  'Your Trusted Source for News & Insights';
const SITE_DESCRIPTION_SHORT =
  '9knowledge delivers insightful articles on technology, health, business, science, and more.';
const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop';
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

function getStringOrUrlFromField(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    typeof (value as { url: unknown }).url === 'string'
  ) {
    return String((value as { url: string }).url).trim();
  }
  return String(value).trim();
}

function getArticleImageUrl(data: Record<string, unknown>): string {
  const candidates = [
    data.og_image,
    data.featured_image,
    data.featuredImage,
    data.image,
    data.thumbnail,
  ];
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
  const scheduledDate =
    scheduledAt && typeof (scheduledAt as { toDate?: () => Date }).toDate === 'function'
      ? (scheduledAt as { toDate: () => Date }).toDate()
      : scheduledAt;
  const isScheduledAndDue =
    status === 'scheduled' && scheduledAt && new Date(scheduledDate as Date) <= new Date();
  if (!isPublished && !isScheduledAndDue) return null;

  const title = (data.meta_title || data.title || '').toString().trim() || SITE_TITLE;
  let description = '';
  const descCandidates = [data.meta_description, data.excerpt, data.description];
  for (const d of descCandidates) {
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

/** Site-level meta block (matches index.html) when article is not found. */
function getSiteDefaultMetaBlock(): string {
  const url = escapeHtml(SITE_URL);
  const title = escapeHtml(SITE_TITLE + ' - Your Trusted Source for News & Insights');
  const desc = escapeHtml(SITE_DESCRIPTION);
  const shortDesc = escapeHtml(SITE_DESCRIPTION_SHORT);
  return `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="news, technology, health, business, science, education, finance, lifestyle, travel" />
    <meta name="author" content="9knowledge" />
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${shortDesc}" />
    <meta property="og:url" content="${url}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${shortDesc}" />
    
    <!-- Canonical -->
    <link rel="canonical" href="${url}" />`;
}

/** Article-specific meta block for the initial HTML. */
function getArticleMetaBlock(meta: ArticleMeta): string {
  const canonicalUrl = `${SITE_URL}/article/${encodeURIComponent(meta.id)}`;
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const image = escapeHtml(meta.imageUrl);
  const imageAlt = escapeHtml(meta.imageAlt);
  const url = escapeHtml(canonicalUrl);
  return `
    <title>${title} | 9knowledge</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="news, technology, health, business, science, education, finance, lifestyle, travel" />
    <meta name="author" content="9knowledge" />
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="9knowledge" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    
    <!-- Canonical -->
    <link rel="canonical" href="${url}" />`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const pathParam = typeof req.query?.path === 'string' ? req.query.path.trim() : null;
  const id = pathParam ? pathParam.split('/')[0].split('?')[0] : null;
  const slug = pathParam && pathParam.includes('/') ? pathParam.split('/')[1]?.split('?')[0] : null;

  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send('<p>Missing <code>path</code> (e.g. article id or id/slug).</p>');
  }

  let metaBlock = getSiteDefaultMetaBlock();

  try {
    let result = await fetchArticleByAdmin(id, slug || null);
    if (!result) {
      result = await fetchArticleByClient(id, slug || null);
    }
    if (result) {
      const meta = extractArticleMeta(result.data, result.docId);
      if (meta) {
        metaBlock = getArticleMetaBlock(meta);
      }
    }
  } catch (e) {
    console.error('article-page API error:', e);
  }

  let html: string;
  try {
    const { HTML_TEMPLATE } = await import('./article-page-template.js');
    html = HTML_TEMPLATE.replace('{{ARTICLE_META_BLOCK}}', metaBlock);
  } catch (e) {
    console.error('article-page template load error:', e);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<p>Template not available. Run build (vite build && node scripts/generate-article-template.js).</p>');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
