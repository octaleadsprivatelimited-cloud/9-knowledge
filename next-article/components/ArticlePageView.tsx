import Head from "next/head";
import Link from "next/link";
import { getSiteDefaults, type ArticleSSRData } from "@/lib/firebase-server";
import type { ArticlePageProps } from "@/lib/article-page-props";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://9knowledge.com";

function ArticleContent({ article }: { article: ArticleSSRData }) {
  const canonicalUrl = `${SITE_URL}/article/${article.id}`;
  const lang = article.language || "en";

  return (
    <>
      <Head>
        <title>{article.title} | 9knowledge</title>
        <meta name="description" content={article.description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="og:image:secure_url" content={article.imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={article.imageAlt} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="9knowledge" />
        {lang ? (
          <meta property="og:locale" content={lang === "te" ? "te_IN" : "en_US"} />
        ) : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={article.imageUrl} />
        <meta name="twitter:image:alt" content={article.imageAlt} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <nav className="border-b bg-gray-50 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
              </li>
              {article.category && (
                <>
                  <span aria-hidden>›</span>
                  <li>
                    <span className="text-gray-900 font-medium">
                      {article.category.name}
                    </span>
                  </li>
                </>
              )}
              <span aria-hidden>›</span>
              <li className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-none">
                {article.title}
              </li>
            </ol>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-4 py-8">
          {article.category && (
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 mb-3">
              {article.category.name}
            </span>
          )}
          <h1
            className="text-2xl md:text-3xl font-bold leading-tight break-words"
            lang={lang}
          >
            {article.title}
          </h1>
          {article.description && (
            <p className="mt-3 text-base text-gray-600 leading-relaxed">
              {article.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            {article.published_at && (
              <span>
                {new Date(article.published_at).toLocaleDateString()}
              </span>
            )}
            <span>{article.reading_time ?? 1} min read</span>
            {article.view_count != null && (
              <span>{article.view_count.toLocaleString()} views</span>
            )}
          </div>

          {article.imageUrl && (
            <figure className="my-8 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={article.imageUrl}
                alt={article.imageAlt}
                className="w-full aspect-video object-cover"
              />
            </figure>
          )}

          <div
            className="prose prose-gray max-w-none text-[15px] leading-[1.7]"
            lang={lang}
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </article>
      </div>
    </>
  );
}

function NotFoundPage() {
  const defaults = getSiteDefaults();
  return (
    <>
      <Head>
        <title>Article Not Found | 9knowledge</title>
        <meta property="og:title" content={defaults.title} />
        <meta property="og:description" content={defaults.description} />
        <meta property="og:image" content={defaults.imageUrl} />
        <meta property="og:url" content={defaults.siteUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-4">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-6">
          The article you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </>
  );
}

export default function ArticlePageView(props: ArticlePageProps) {
  if (props.notFound || !props.article) {
    return <NotFoundPage />;
  }
  return <ArticleContent article={props.article} />;
}
