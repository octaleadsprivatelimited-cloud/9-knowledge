/**
 * Article detail page with SSR for correct Open Graph / Twitter previews.
 * getServerSideProps fetches article from Firestore; meta tags are injected server-side.
 * Works for English and Telugu (language from article data, not hardcoded).
 */

import { GetServerSideProps } from "next";
import { getArticlePageProps } from "@/lib/article-page-props";
import ArticlePageView from "@/components/ArticlePageView";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = typeof context.params?.id === "string" ? context.params.id : null;
  return getArticlePageProps(id);
};

export default ArticlePageView;
