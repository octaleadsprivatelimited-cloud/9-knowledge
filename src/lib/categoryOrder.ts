/**
 * Preferred display order for categories in header and homepage.
 * Categories in this list appear first in this order; any others follow.
 */
export const CATEGORY_DISPLAY_ORDER = [
  "News",
  "Life Style",
  "Entertainment",
  "Business",
  "National News",
] as const;

/** Sort categories so they appear in CATEGORY_DISPLAY_ORDER; others after. */
export function sortCategoriesByDisplayOrder<T extends { name: string }>(
  categories: T[]
): T[] {
  if (!categories?.length) return categories;
  const order: string[] = [...CATEGORY_DISPLAY_ORDER];
  return [...categories].sort((a, b) => {
    const ai = order.indexOf(a.name);
    const bi = order.indexOf(b.name);
    const aIndex = ai === -1 ? order.length : ai;
    const bIndex = bi === -1 ? order.length : bi;
    return aIndex - bIndex;
  });
}
