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
}

export const ArticleSchema = ({ article, url }: ArticleSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": [article.featuredImage],
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
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Helmet>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(cleanSchema)}
      </script>

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={article.excerpt} />
      <meta property="og:image" content={article.featuredImage} />
      <meta property="og:url" content={url} />
      <meta property="article:published_time" content={article.publishedAt} />
      <meta property="article:modified_time" content={article.updatedAt || article.publishedAt} />
      <meta property="article:author" content={article.author.name} />
      <meta property="article:section" content={article.category.name} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={article.title} />
      <meta name="twitter:description" content={article.excerpt} />
      <meta name="twitter:image" content={article.featuredImage} />

      {/* Standard Meta */}
      <title>{article.title} | 9knowledge</title>
      <meta name="description" content={article.excerpt} />
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
