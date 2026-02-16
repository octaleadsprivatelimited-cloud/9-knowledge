import { getArticleByIdOrSlug, type ArticleSSRData } from "./firebase-server";

export type ArticlePageProps =
  | { article: ArticleSSRData; notFound: false }
  | { article: null; notFound: true };

export async function getArticlePageProps(
  id: string | null
): Promise<{ props: ArticlePageProps }> {
  if (!id || !id.trim()) {
    return { props: { article: null, notFound: true } };
  }
  try {
    const article = await getArticleByIdOrSlug(id.trim(), null);
    if (article) {
      return { props: { article, notFound: false } };
    }
  } catch (e) {
    console.error("Article SSR fetch error:", e);
  }
  return { props: { article: null, notFound: true } };
}
