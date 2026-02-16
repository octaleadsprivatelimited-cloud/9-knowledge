/**
 * Article page with slug: /article/[id]/[slug].
 * Same as /article/[id]; fetches by id only for SSR meta.
 */

import { GetServerSideProps } from "next";
import { getArticlePageProps } from "@/lib/article-page-props";
import ArticlePageView from "@/components/ArticlePageView";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = typeof context.params?.id === "string" ? context.params.id : null;
  return getArticlePageProps(id);
};

export default ArticlePageView;
