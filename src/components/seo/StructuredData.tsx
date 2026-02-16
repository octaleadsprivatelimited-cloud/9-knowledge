import { Helmet } from 'react-helmet-async';

interface Article {
  title: string;
  excerpt: string;
  content?: string;
  featuredImage: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: {
    name: string;
  };
  readingTime?: number;
  slug: string;
}

interface ArticleSchemaProps {
  article: Article;
  url: string;
  /** Comma-separated or array of keywords for meta keywords tag */
  keywords?: string | string[] | null;
  /** Override meta title (e.g. from article.meta_title) */
  metaTitle?: string | null;
  /** Override meta description (e.g. from article.meta_description) */
  metaDescription?: string | null;
}

const SITE_URL = 'https://9knowledge.com';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop';

/** Ensure image URL is absolute for social crawlers (Facebook, Twitter, WhatsApp require full URLs) */
function ensureAbsoluteImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || !imageUrl.trim()) return '';
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    return `${SITE_URL}${trimmed}`;
  }
  return `${SITE_URL}/${trimmed}`;
}

export const ArticleSchema = ({ article, url, keywords: keywordsProp, metaTitle, metaDescription }: ArticleSchemaProps) => {
  // Use ONLY article content for social share - no site name in title/description
  const title = (metaTitle?.trim() || article.title).replace(/\s*\|\s*9knowledge\s*$/i, '').trim() || article.title;
  const description = (metaDescription?.trim() || article.excerpt || '').slice(0, 200); // Clean description, max 200 chars for share
  const imageUrl = ensureAbsoluteImageUrl(article.featuredImage) || (article.featuredImage && article.featuredImage.startsWith('http') ? article.featuredImage : '') || DEFAULT_OG_IMAGE;
  
  // Process keywords - ensure we always have some keywords
  let keywordsStr = '';
  if (Array.isArray(keywordsProp)) {
    keywordsStr = keywordsProp.filter(Boolean).join(', ');
  } else if (typeof keywordsProp === 'string') {
    keywordsStr = keywordsProp.trim();
  }
  
  // If no keywords provided, generate from article data
  if (!keywordsStr) {
    const autoKeywords = [article.category?.name, '9knowledge', 'news'].filter(Boolean);
    keywordsStr = autoKeywords.join(', ');
  }
  
  // Debug in development
  if (import.meta.env.DEV) {
    console.log('Article Keywords:', keywordsStr);
    console.log('Social share image URL:', imageUrl);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": [imageUrl],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "image": article.author.avatar,
    },
    "publisher": {
      "@type": "Organization",
      "name": "9knowledge",
      "logo": {
        "@type": "ImageObject",
        "url": "https://9knowledge.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": article.category.name,
    "wordCount": article.content ? article.content.split(/\s+/).length : undefined,
    "timeRequired": article.readingTime ? `PT${article.readingTime}M` : undefined,
    ...(keywordsStr ? { keywords: keywordsStr } : {}),
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Helmet>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(cleanSchema)}
      </script>

      {/* Open Graph - Facebook, LinkedIn, WhatsApp - Article image as thumbnail, article-only content */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:url" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={article.title} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="9knowledge" />
      <meta property="og:locale" content="en_IN" />
      <meta property="article:published_time" content={article.publishedAt} />
      <meta property="article:modified_time" content={article.updatedAt || article.publishedAt} />
      <meta property="article:author" content={article.author.name} />
      <meta property="article:section" content={article.category.name} />

      {/* Twitter Card - Article image as thumbnail */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@9knowledge" />
      <meta name="twitter:creator" content="@9knowledge" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={article.title} />

      {/* Standard Meta - Tab title can include site; og/twitter use article-only for share preview */}
      <title>{title} | 9knowledge</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsStr} />
      <meta name="author" content={article.author.name} />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export const WebsiteSchema = ({ 
  name = "9knowledge",
  url = "https://9knowledge.com",
  description = "Your trusted source for insightful articles on technology, health, business, and more."
}: WebsiteSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
}

export const OrganizationSchema = ({
  name = "9knowledge",
  url = "https://9knowledge.com",
  logo = "https://9knowledge.com/logo.png"
}: OrganizationSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "sameAs": [
      // Add social media URLs here
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ArticleSchema;
