/**
 * Server-side sitemap.xml: fetches all site URLs from Firestore and returns
 * a single XML file. Used so /sitemap.xml delivers the full sitemap without client JS.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as admin from "firebase-admin";

const BASE_URL = process.env.VITE_SITE_URL || "https://9knowledge.com";

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
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
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

function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toLastmod(isoDate: string | null | undefined, fallback: string): string {
  if (!isoDate) return fallback;
  try {
    return new Date(isoDate).toISOString().slice(0, 10);
  } catch {
    return fallback;
  }
}

const STATIC_PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "monthly", priority: "0.5" },
  { path: "/disclaimer", changefreq: "monthly", priority: "0.5" },
];

function isArticlePublished(data: Record<string, unknown>): boolean {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Sitemap for search engines: https://www.sitemaps.org/protocol.html -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  // Static pages
  for (const { path, changefreq, priority } of STATIC_PAGES) {
    const loc = path === "/" ? BASE_URL + "/" : BASE_URL + path;
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push("  </url>");
  }

  const db = getAdminFirestore();
  if (db) {
    try {
      // Categories (active only)
      const categoriesSnap = await db.collection("categories").get();
      const categories: { slug: string }[] = [];
      categoriesSnap.docs.forEach((doc) => {
        const d = doc.data() as Record<string, unknown>;
        if (d.is_active === false) return;
        const slug = (d.slug || doc.id).toString().trim();
        if (slug) categories.push({ slug });
      });
      for (const cat of categories) {
        const loc = escapeXml(`${BASE_URL}/category/${cat.slug}`);
        lines.push("  <url>");
        lines.push(`    <loc>${loc}</loc>`);
        lines.push(`    <lastmod>${today}</lastmod>`);
        lines.push("    <changefreq>weekly</changefreq>");
        lines.push("    <priority>0.7</priority>");
        lines.push("  </url>");
      }

      // Tags
      const tagsSnap = await db.collection("tags").get();
      const tags: { slug: string }[] = [];
      tagsSnap.docs.forEach((doc) => {
        const d = doc.data() as Record<string, unknown>;
        const slug = (d.slug || doc.id).toString().trim();
        if (slug) tags.push({ slug });
      });
      for (const tag of tags) {
        const loc = escapeXml(`${BASE_URL}/tag/${tag.slug}`);
        lines.push("  <url>");
        lines.push(`    <loc>${loc}</loc>`);
        lines.push(`    <lastmod>${today}</lastmod>`);
        lines.push("    <changefreq>weekly</changefreq>");
        lines.push("    <priority>0.5</priority>");
        lines.push("  </url>");
      }

      // Published articles
      const articlesSnap = await db.collection("articles").get();
      articlesSnap.docs.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>;
        if (!isArticlePublished(data)) return;
        const id = doc.id;
        const publishedAt = data.published_at;
        let iso: string | null = null;
        if (publishedAt && typeof (publishedAt as { toDate?: () => Date }).toDate === "function") {
          iso = (publishedAt as { toDate: () => Date }).toDate().toISOString();
        } else if (publishedAt) {
          iso = String(publishedAt);
        }
        const lastmod = toLastmod(iso, today);
        const loc = escapeXml(`${BASE_URL}/article/${id}`);
        lines.push("  <url>");
        lines.push(`    <loc>${loc}</loc>`);
        lines.push(`    <lastmod>${lastmod}</lastmod>`);
        lines.push("    <changefreq>weekly</changefreq>");
        lines.push("    <priority>0.6</priority>");
        lines.push("  </url>");
      });
    } catch (e) {
      console.error("Sitemap Firestore error:", e);
    }
  }

  lines.push("</urlset>");
  const xml = lines.join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
