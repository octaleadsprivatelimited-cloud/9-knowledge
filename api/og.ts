/**
 * Dedicated server-side Open Graph preview endpoint for article pages.
 * FIXED for correct social sharing previews.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

/* ------------------------------------------------------------------ */
/* Config */
/* ------------------------------------------------------------------ */

const SITE_URL =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://9knowledge.com';

const SITE_TITLE = '9knowledge';
const SITE_DESCRIPTION = 'Your Trusted Source for News & Insights';

/**
 * IMPORTANT:
 * Use a self-hosted image (public/og-default.jpg)
 * WhatsApp & FB sometimes block Unsplash hotlinks.
 */
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

/* ------------------------------------------------------------------ */
/* Firebase Admin */
/* ------------------------------------------------------------------ */

function getAdminFirestore(): admin.firestore.Firestore | null {
  if (!admin.apps.length) {
    const cred = getCredentials();
    if (!cred) {
      console.error('[OG] Firebase Admin credentials missing');
      return null;
    }
    admin.initializeApp({ credential: cred });
  }
  return admin.firestore();
}

function getCredentials(): admin.credential.Credential | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json?.trim()) {
    try {
      return admin.credential.cert(JSON.parse(json));
    } catch (e) {
      console.error('[OG] Invalid service account JSON');
      return null;
    }
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID;

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

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function ensureAbsoluteImageUrl(url?: unknown): string {
  const raw = typeof url === 'string' ? url.trim() : '';
  if (!raw) return DEFAULT_OG_IMAGE;

  if (raw.startsWith('https://')) return raw;
  if (raw.startsWith('http://')) return raw.replace('http://', 'https://');
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ */
/* Article Meta */
/* ------------------------------------------------------------------ */

type ArticleMeta = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

function extractArticleMeta(
  data: Record<string, any>,
  docId: string
): ArticleMeta | null {
  const status = String(data.status || 'published').toLowerCase();

  const isPublished =
    status === 'published' ||
    status === 'live' ||
    status === 'public';

  const scheduledAt = data.scheduled_at?.toDate?.() ?? null;
  const isScheduledAndLive =
    status === 'scheduled' &&
    scheduledAt &&
    scheduledAt <= new Date();

  if (!isPublished && !isScheduledAndLive) return null;

  const title =
    String(data.meta_title || data.title || '').trim() || SITE_TITLE;

  let description =
    String(data.meta_description || data.excerpt || '').trim();

  if (!description && data.content) {
    description = stripHtml(String(data.content)).slice(0, 200);
  }

  if (!description) description = SITE_DESCRIPTION;

  const image =
    ensureAbsoluteImageUrl(
      data.og_image ||
        data.featured_image ||
        data.image ||
        data.thumbnail
    );

  const slug = String(data.slug || '').trim();

  return {
    id: docId,
    slug,
    title,
    description,
    image,
    imageAlt: String(data.featured_image_alt || title),
  };
}

/* ------------------------------------------------------------------ */
/* Firestore Fetch */
/* ------------------------------------------------------------------ */

async function fetchArticle(
  id: string | null,
  slug: string | null
) {
  const db = getAdminFirestore();
  if (!db) return null;

  if (id) {
    const doc = await db.collection('articles').doc(id).get();
    if (doc.exists) return { data: doc.data()!, id: doc.id };
  }

  if (slug) {
    const snap = await db
      .collection('articles')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!snap.empty) {
      const d = snap.docs[0];
      return { data: d.data(), id: d.id };
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Handler */
/* ------------------------------------------------------------------ */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const id = typeof req.query.id === 'string' ? req.query.id : null;
  const slug = typeof req.query.slug === 'string' ? req.query.slug : null;

  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;
  let image = DEFAULT_OG_IMAGE;
  let imageAlt = SITE_TITLE;
  let canonicalUrl = SITE_URL;

  try {
    const result = await fetchArticle(id, slug);

    if (result) {
      const meta = extractArticleMeta(result.data, result.id);

      if (meta) {
        title = meta.title;
        description = meta.description;
        image = meta.image;
        imageAlt = meta.imageAlt;

        canonicalUrl = meta.slug
          ? `${SITE_URL}/article/${meta.id}/${meta.slug}`
          : `${SITE_URL}/article/${meta.id}`;
      }
    } else {
      console.warn('[OG] Article not found', { id, slug });
    }
  } catch (e) {
    console.error('[OG] Error:', e);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)} | 9knowledge</title>
<meta name="description" content="${escapeHtml(description)}" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<meta property="og:site_name" content="9knowledge" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
</head>
<body>
<p>Loading…</p>
<a href="${escapeHtml(canonicalUrl)}">View article</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // During debugging keep no-store, enable caching later
  res.setHeader('Cache-Control', 'no-store');

  return res.status(200).send(html);
}
