/**
 * Server-side Firebase (Firestore) fetch for article data.
 * Used by getServerSideProps. Supports both Admin SDK and env-based credentials.
 */

import * as admin from "firebase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://9knowledge.com";
const SITE_TITLE = "9knowledge";
const SITE_DESCRIPTION = "Your Trusted Source for News & Insights";
const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop";

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

function ensureAbsoluteImageUrl(imageUrl: string | null | undefined): string {
  const raw = imageUrl != null ? String(imageUrl).trim() : "";
  if (!raw) return DEFAULT_OG_IMAGE;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw}`;
}

function getStringOrUrlFromField(value: unknown): string {
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
  return ensureAbsoluteImageUrl("");
}

export type ArticleSSRData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  slug: string;
  content: string;
  language?: string;
  published_at?: string;
  reading_time?: number;
  view_count?: number;
  category?: { id: string; name: string; slug: string };
};

function extractArticle(
  data: Record<string, unknown>,
  docId: string
): ArticleSSRData | null {
  const status = (data.status || "").toString().toLowerCase();
  const isPublished = status === "published";
  const scheduledAt = data.scheduled_at;
  const scheduledDate =
    scheduledAt &&
    typeof (scheduledAt as { toDate?: () => Date }).toDate === "function"
      ? (scheduledAt as { toDate: () => Date }).toDate()
      : scheduledAt;
  const isScheduledAndDue =
    status === "scheduled" &&
    scheduledAt &&
    new Date(scheduledDate as Date) <= new Date();
  if (!isPublished && !isScheduledAndDue) return null;

  const title =
    (data.meta_title || data.title || "").toString().trim() || SITE_TITLE;
  let description = "";
  const descCandidates = [data.meta_description, data.excerpt, data.description];
  for (const d of descCandidates) {
    const s = (d != null ? String(d).trim() : "").slice(0, 200);
    if (s) {
      description = s;
      break;
    }
  }
  if (!description && data.content) {
    const raw = String(data.content)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    description = raw.slice(0, 200);
  }
  if (!description) description = SITE_DESCRIPTION;
  const imageUrl = getArticleImageUrl(data);
  const imageAlt = (data.featured_image_alt || data.title || title)
    .toString()
    .trim();
  const slug = (data.slug || docId).toString().trim();
  const content = (data.content || "").toString();
  const language =
    typeof data.language === "string"
      ? data.language
      : data.telugu_content ? "te" : "en";

  let category: ArticleSSRData["category"];
  const cat = data.category;
  if (cat && typeof cat === "object" && cat !== null) {
    const c = cat as Record<string, unknown>;
    category = {
      id: (c.id || "").toString(),
      name: (c.name || "").toString(),
      slug: (c.slug || "").toString(),
    };
  }

  return {
    id: docId,
    title,
    description,
    imageUrl,
    imageAlt,
    slug,
    content,
    language,
    published_at: data.published_at
      ? typeof (data.published_at as { toDate?: () => Date }).toDate ===
        "function"
        ? (data.published_at as { toDate: () => Date }).toDate().toISOString()
        : String(data.published_at)
      : undefined,
    reading_time: typeof data.reading_time === "number" ? data.reading_time : undefined,
    view_count: typeof data.view_count === "number" ? data.view_count : undefined,
    category,
  };
}

export async function getArticleByIdOrSlug(
  id: string | null,
  slug: string | null
): Promise<ArticleSSRData | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  if (id) {
    const docSnap = await db.collection("articles").doc(id).get();
    if (docSnap.exists) {
      const data = docSnap.data() as Record<string, unknown>;
      return extractArticle(data, docSnap.id);
    }
  }

  if (slug) {
    const snap = await db
      .collection("articles")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data() as Record<string, unknown>;
      return extractArticle(data, doc.id);
    }
  }

  return null;
}

export function getSiteDefaults() {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    imageUrl: DEFAULT_OG_IMAGE,
    siteUrl: SITE_URL,
  };
}
