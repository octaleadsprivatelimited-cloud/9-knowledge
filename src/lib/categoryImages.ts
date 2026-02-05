/**
 * Category image resolution:
 * 1. image_url or image from database (admin)
 * 2. Local files in public/categories/ named by slug: {slug}.jpg, .png, .webp
 */

const LOCAL_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/** Base path for category images in the project (public folder, served at /categories/) */
export const CATEGORY_IMAGES_BASE = "/categories";

/**
 * Returns the URL to use for a category image.
 * Prefers DB image_url/image; otherwise returns local path for first extension (caller can try others on error).
 */
export function getCategoryImageUrl(category: {
  image_url?: string | null;
  image?: string | null;
  slug: string;
}): string | null {
  const fromDb = category.image_url || category.image;
  if (fromDb && typeof fromDb === "string" && fromDb.trim()) return fromDb.trim();
  const slug = category.slug?.trim();
  if (!slug) return null;
  return `${CATEGORY_IMAGES_BASE}/${slug}${LOCAL_EXTENSIONS[0]}`;
}

/** Local path for a given slug and extension index (0 = .jpg, 1 = .png, etc.) */
export function getLocalCategoryImagePath(slug: string, extensionIndex: number): string {
  const ext = LOCAL_EXTENSIONS[Math.min(extensionIndex, LOCAL_EXTENSIONS.length - 1)];
  return `${CATEGORY_IMAGES_BASE}/${slug}${ext}`;
}

export { LOCAL_EXTENSIONS };
