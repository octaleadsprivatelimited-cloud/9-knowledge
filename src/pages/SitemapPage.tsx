import { useEffect, useRef } from "react";
import { useCategories } from "@/hooks/useCategories";
import { usePublishedArticles, type PublicArticle } from "@/hooks/usePublicArticles";

const BASE_URL = "https://9knowledge.com";

// Escape for XML text content (loc, etc.)
function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Format date as YYYY-MM-DD for sitemap lastmod
function toLastmod(isoDate: string | null): string {
  if (!isoDate) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(isoDate).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
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

function buildSitemapXml(
  categories: { slug: string }[],
  articles: PublicArticle[]
): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
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

  // Category pages
  for (const cat of categories) {
    const loc = escapeXml(`${BASE_URL}/category/${cat.slug}`);
    lines.push("  <url>");
    lines.push(`    <loc>${loc}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push("    <changefreq>weekly</changefreq>");
    lines.push("    <priority>0.7</priority>");
    lines.push("  </url>");
  }

  // Article pages (updates automatically when new articles are added by admin)
  for (const article of articles) {
    const slugOrId = article.slug || article.id;
    if (!slugOrId) continue;
    const loc = escapeXml(`${BASE_URL}/article/${slugOrId}`);
    const lastmod = toLastmod(article.published_at);
    lines.push("  <url>");
    lines.push(`    <loc>${loc}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push("    <changefreq>weekly</changefreq>");
    lines.push("    <priority>0.6</priority>");
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return lines.join("\n");
}

/**
 * Dynamic sitemap: fetches published articles and categories from Firestore
 * and builds sitemap XML. Updates automatically when admin adds/removes articles.
 */
export default function SitemapPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: articles = [], isLoading: articlesLoading } = usePublishedArticles();
  const written = useRef(false);

  const isLoading = categoriesLoading || articlesLoading;

  useEffect(() => {
    if (written.current) return;
    if (isLoading) return;

    const xml = buildSitemapXml(categories, articles);
    written.current = true;
    document.open("text/xml", "replace");
    document.write(xml);
    document.close();
  }, [isLoading, categories, articles]);

  return null;
}
