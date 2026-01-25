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
import {
  Clock,
  Calendar,
  Eye,
  Share2,
  ChevronRight,
} from "lucide-react";
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
      <article>
        {/* Breadcrumb */}
        <nav className="container py-4 border-b border-border">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            {article.category && (
              <>
                <ChevronRight className="h-3 w-3" />
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
            <ChevronRight className="h-3 w-3" />
            <li className="text-foreground font-medium truncate max-w-[200px]">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="container py-8 max-w-4xl mx-auto">
          {article.category && (
            <CategoryBadge category={article.category} size="md" className="mb-4" />
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.reading_time || 1} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {(article.view_count || 0).toLocaleString()} views
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="container max-w-5xl mx-auto mb-8">
            <figure>
              <img
                src={article.featured_image}
                alt={article.featured_image_alt || article.title}
                className="w-full aspect-[2/1] object-cover rounded-xl"
              />
            </figure>
          </div>
        )}

        {/* Embedded Video */}
        {(article as any).video_url && (
          <div className="container max-w-4xl mx-auto mb-8">
            <div className="aspect-video rounded-xl overflow-hidden border bg-muted">
              <iframe
                src={(article as any).video_url.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                title={`Video: ${article.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container max-w-4xl mx-auto">
          <div className="flex gap-6">
            {/* Share Buttons - Sticky on Desktop */}
            <aside className="hidden lg:block w-12 shrink-0">
              <div className="sticky top-24 flex flex-col items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                </span>
                <SocialShare url={shareUrl} title={shareTitle} vertical />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div 
                className="prose prose-lg max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />
              
              {/* Mobile Share Buttons */}
              <div className="lg:hidden mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">Share this article</p>
                <SocialShare url={shareUrl} title={shareTitle} />
              </div>
              
              {/* In-Article Ad */}
              <AdSlot position="in-article" className="not-prose mt-8" />
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="container py-12 mt-8 border-t border-border">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relArticle) => (
                <ArticleCard key={relArticle.id} article={relArticle} />
              ))}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
};

export default ArticlePage;