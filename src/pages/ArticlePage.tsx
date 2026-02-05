import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SocialShare } from "@/components/articles/SocialShare";
import { ReadingProgress } from "@/components/articles/ReadingProgress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdSlot from "@/components/ads/AdSlot";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { Clock, Calendar, Eye, ChevronRight } from "lucide-react";
import { usePublicArticleBySlug, useLatestArticles } from "@/hooks/usePublicArticles";
import { useReadingAnalytics } from "@/hooks/useReadingAnalytics";

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = usePublicArticleBySlug(slug || '');
  const { data: latestArticles } = useLatestArticles(4);

  // Track reading analytics
  useReadingAnalytics(article?.id);

  // Get related articles (same category, excluding current)
  const relatedArticles = latestArticles?.filter(
    (a) => a.id !== article?.id && a.category?.id === article?.category?.id
  ).slice(0, 3) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://9knowledge.com/article/${slug}`;
  const shareTitle = article.title;
  const siteUrl = "https://9knowledge.com";
  const placeholderImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop";

  // Breadcrumb data for structured data
  const breadcrumbItems = [
    { name: "Home", url: siteUrl },
    ...(article.category ? [{ name: article.category.name, url: `${siteUrl}/category/${article.category.slug}` }] : []),
    { name: article.title, url: shareUrl },
  ];

  return (
    <Layout>
      {/* Structured Data for SEO */}
      <ArticleSchema 
        article={{
          title: article.title,
          excerpt: article.excerpt || '',
          content: article.content || '',
          featuredImage: article.featured_image || placeholderImage,
          publishedAt: article.published_at || new Date().toISOString(),
          author: { name: 'Author' },
          category: article.category || { id: '', name: '', slug: '', color: '' },
          readingTime: article.reading_time || 1,
          slug: article.slug,
        }}
        url={shareUrl}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <ReadingProgress />
      <article className="pb-16">
        {/* Breadcrumb - compact */}
        <nav className="border-b border-border bg-muted/30">
          <div className="container max-w-3xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              {article.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  <li>
                    <Link
                      to={`/category/${article.category.slug}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {article.category.name}
                    </Link>
                  </li>
                </>
              )}
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <li className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                {article.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* Article Header + Image in one flow */}
        <div className="container max-w-3xl mx-auto px-4">
          <header className="pt-8 pb-6">
            {article.category && (
              <CategoryBadge category={article.category} size="md" className="mb-3" />
            )}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground leading-snug break-words">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                {formatDate(article.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {article.reading_time || 1} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 shrink-0" />
                {(article.view_count || 0).toLocaleString()} views
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <figure className="mb-8 -mx-4 sm:mx-0 rounded-xl overflow-hidden bg-muted shadow-sm">
              <img
                src={article.featured_image}
                alt={article.featured_image_alt || article.title}
                className="w-full aspect-video object-cover"
              />
            </figure>
          )}

          {/* Embedded Video */}
          {(article as any).video_url && (
            <div className="mb-8 rounded-xl overflow-hidden border border-border bg-muted">
              <iframe
                src={(article as any).video_url.replace('watch?v=', 'embed/')}
                className="w-full aspect-video"
                allowFullScreen
                title={`Video: ${article.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="flex gap-8">
            <aside className="hidden lg:block w-10 shrink-0 pt-1">
              <div className="sticky top-24 flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Share</span>
                <SocialShare url={shareUrl} title={shareTitle} vertical />
              </div>
            </aside>
            <div className="flex-1 min-w-0">
              <div
                className="article-content prose prose-sm sm:prose max-w-none text-foreground text-[15px] leading-[1.7] prose-p:my-3 prose-headings:font-display prose-headings:font-bold prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-2 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-ul:my-3 prose-ol:my-3 prose-li:my-0.5 prose-img:rounded-lg prose-img:w-full prose-img:my-4 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/40 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />
              <div className="lg:hidden mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Share this article</p>
                <SocialShare url={shareUrl} title={shareTitle} />
              </div>
              <AdSlot position="in-article" className="not-prose mt-10" />
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 border-t border-border bg-muted/20">
            <div className="container max-w-4xl mx-auto px-4 py-10">
              <h2 className="text-lg font-display font-bold text-foreground mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relArticle) => (
                  <ArticleCard key={relArticle.id} article={relArticle} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
};

export default ArticlePage;