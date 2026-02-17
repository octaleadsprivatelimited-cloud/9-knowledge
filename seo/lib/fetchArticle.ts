/**
 * Server-only Firebase fetch for article SEO metadata.
 * Fetches by document id OR slug. No client Firebase SDK.
 */

import * as admin from "firebase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://9knowledge.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export type ArticleSEO = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
};

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
    } catch {
      return null;
    }
  }
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    } as admin.ServiceAccount);
  }
  return null;
}

function getStringOrUrl(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof (value as { url: unknown }).url === "string"
  ) {
    return String((value as { url: string }).url).trim();
  }
  return String(value).trim();
}

/**
 * Normalize image to HTTPS absolute URL. Minimum 1200x630 safe for OG.
 * Fallback to /og-default.jpg if missing or invalid.
 * Appends ?v=articleId for cache-busting.
 */
function normalizeOgImage(
  imageUrl: string | null | undefined,
  articleId: string
): string {
  const raw = imageUrl != null ? getStringOrUrl(imageUrl) : "";
  let url: string;
  if (!raw || raw.length < 5) {
    url = DEFAULT_OG_IMAGE;
  } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
    url = raw.startsWith("http://") ? raw.replace("http://", "https://") : raw;
  } else if (raw.startsWith("//")) {
    url = `https:${raw}`;
  } else if (raw.startsWith("/")) {
    url = `${SITE_URL}${raw}`;
  } else {
    url = `${SITE_URL}/${raw}`;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(articleId)}`;
}

function getImageFromDoc(data: Record<string, unknown>): string | null {
  const candidates = [
    data.imageUrl,
    data.og_image,
    data.featured_image,
    data.featuredImage,
    data.image,
    data.thumbnail,
  ];
  for (const v of candidates) {
    const s = getStringOrUrl(v);
    if (s && s.length > 5) return s;
  }
  return null;
}

/**
 * Build description from meta_description, excerpt, description, or first 160 chars of content.
 */
function getDescription(data: Record<string, unknown>): string {
  const candidates = [data.meta_description, data.excerpt, data.description];
  for (const d of candidates) {
    const s = (d != null ? String(d).trim() : "").slice(0, 160);
    if (s) return s;
  }
  if (data.content) {
    const raw = String(data.content)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return raw.slice(0, 160);
  }
  return "9knowledge – Your Trusted Source for News & Insights";
}

function getTitle(data: Record<string, unknown>): string {
  const t = (data.meta_title || data.title || "").toString().trim();
  return t || "9knowledge";
}

function isPublished(data: Record<string, unknown>): boolean {
  const status = (data.status || "").toString().toLowerCase();
  if (status === "published") return true;
  if (status !== "scheduled") return false;
  const at = data.scheduled_at;
  const date =
    at && typeof (at as { toDate?: () => Date }).toDate === "function"
      ? (at as { toDate: () => Date }).toDate()
      : at;
  return date != null && new Date(date as Date) <= new Date();
}

/**
 * Fetch article by id OR slug from Firestore (server only).
 * Returns normalized SEO object or null if not found / not published.
 */
export async function fetchArticle(
  idOrSlug: string | null
): Promise<ArticleSEO | null> {
  if (!idOrSlug || !idOrSlug.trim()) return null;

  const db = getAdminFirestore();
  if (!db) return null;

  const key = idOrSlug.trim();

  // Try by document id first
  const byId = await db.collection("articles").doc(key).get();
  if (byId.exists) {
    const data = byId.data() as Record<string, unknown>;
    if (!isPublished(data)) return null;
    const docId = byId.id;
    const title = getTitle(data);
    const description = getDescription(data);
    const imageUrl = normalizeOgImage(getImageFromDoc(data), docId);
    const slug = (data.slug || docId).toString().trim();
    return { id: docId, title, description, imageUrl, slug };
  }

  // Try by slug
  const bySlug = await db
    .collection("articles")
    .where("slug", "==", key)
    .limit(1)
    .get();
  if (!bySlug.empty) {
    const doc = bySlug.docs[0];
    const data = doc.data() as Record<string, unknown>;
    if (!isPublished(data)) return null;
    const docId = doc.id;
    const title = getTitle(data);
    const description = getDescription(data);
    const imageUrl = normalizeOgImage(getImageFromDoc(data), docId);
    const slug = (data.slug || docId).toString().trim();
    return { id: docId, title, description, imageUrl, slug };
  }

  return null;
}
