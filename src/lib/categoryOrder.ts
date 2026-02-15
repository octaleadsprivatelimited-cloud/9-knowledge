/**
 * Default display order by category name (used when no admin order is set).
 * Categories in this list appear in this order; any others follow.
 */
export const CATEGORY_DISPLAY_ORDER = [
  "News",
  "Life Style",
  "Entertainment",
  "Business",
  "National News",
] as const;

/** Normalize for matching: lower case, trim, ignore apostrophes (e.g. "Don't" vs "dont"). */
function norm(s: string): string {
  return (s?.toLowerCase().trim().replace(/'/g, "") ?? "");
}

type HasId = { id: string };
type HasName = { name: string };

/**
 * Sort categories for header and homepage.
 * - If orderIds is provided (from admin settings), sort by that array of category IDs.
 * - Otherwise sort by CATEGORY_DISPLAY_ORDER (by name). Categories not in the list come after.
 */
export function sortCategoriesByDisplayOrder<T extends HasId & HasName>(
  categories: T[],
  orderIds?: string[]
): T[] {
  if (!categories?.length) return categories;

  if (orderIds?.length) {
    const order = orderIds;
    return [...categories].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      const aIndex = ai === -1 ? order.length : ai;
      const bIndex = bi === -1 ? order.length : bi;
      return aIndex - bIndex;
    });
  }

  const order: string[] = [...CATEGORY_DISPLAY_ORDER];
  return [...categories].sort((a, b) => {
    const ai = order.findIndex((o) => norm(o) === norm(a.name));
    const bi = order.findIndex((o) => norm(o) === norm(b.name));
    const aIndex = ai === -1 ? order.length : ai;
    const bIndex = bi === -1 ? order.length : bi;
    return aIndex - bIndex;
  });
}
