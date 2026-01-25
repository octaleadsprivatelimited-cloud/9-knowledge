// Mock data for the news portal - will be replaced with database later

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: Category;
  author: Author;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
}

export const categories: Category[] = [
  { id: "1", name: "Health", slug: "health", color: "health" },
  { id: "2", name: "Food", slug: "food", color: "food" },
  { id: "3", name: "Technology", slug: "technology", color: "technology" },
  { id: "4", name: "Facts", slug: "facts", color: "facts" },
  { id: "5", name: "Finance", slug: "finance", color: "finance" },
];

export const authors: Author[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    bio: "Senior Technology Editor with 10+ years of experience covering emerging tech trends.",
  },
  {
    id: "2",
    name: "James Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    bio: "Health & Science writer passionate about making complex topics accessible.",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    bio: "Business analyst and contributor focusing on market trends and entrepreneurship.",
  },
];

export const articles: Article[] = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence: What to Expect in 2025",
    slug: "future-of-artificial-intelligence-2025",
    excerpt: "From advanced language models to autonomous systems, AI is reshaping every industry. Here's what experts predict for the coming year.",
    content: `Artificial intelligence continues to evolve at an unprecedented pace, transforming industries and redefining what's possible in technology...`,
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
    category: categories[1],
    author: authors[0],
    publishedAt: "2025-01-10T09:00:00Z",
    readingTime: 8,
    tags: ["AI", "Technology", "Innovation", "Future"],
    isFeatured: true,
    isTrending: true,
    views: 15420,
  },
  {
    id: "2",
    title: "5 Proven Habits That Can Extend Your Lifespan by a Decade",
    slug: "habits-extend-lifespan-decade",
    excerpt: "New research reveals simple daily practices that can significantly improve longevity and quality of life.",
    content: `Scientists have long studied the habits of centenarians around the world...`,
    featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
    category: categories[0],
    author: authors[1],
    publishedAt: "2025-01-09T14:30:00Z",
    readingTime: 6,
    tags: ["Health", "Wellness", "Longevity", "Lifestyle"],
    isFeatured: true,
    isTrending: false,
    views: 8930,
  },
  {
    id: "3",
    title: "Global Markets Rally as Tech Sector Leads Recovery",
    slug: "global-markets-rally-tech-recovery",
    excerpt: "Major indices surge following positive earnings reports from leading technology companies.",
    content: `Wall Street experienced its strongest week in months as technology stocks led a broad market rally...`,
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop",
    category: categories[2],
    author: authors[2],
    publishedAt: "2025-01-08T11:00:00Z",
    readingTime: 5,
    tags: ["Business", "Markets", "Technology", "Investing"],
    isFeatured: false,
    isTrending: true,
    views: 12340,
  },
  {
    id: "4",
    title: "Revolutionary Solar Technology Could Power Entire Cities",
    slug: "revolutionary-solar-technology-cities",
    excerpt: "Breakthrough in photovoltaic cells promises 40% efficiency, potentially transforming renewable energy.",
    content: `A team of researchers at MIT has developed a new type of solar cell that achieves unprecedented efficiency...`,
    featuredImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop",
    category: categories[6],
    author: authors[1],
    publishedAt: "2025-01-07T16:45:00Z",
    readingTime: 7,
    tags: ["Science", "Energy", "Solar", "Innovation"],
    isFeatured: true,
    isTrending: true,
    views: 9870,
  },
  {
    id: "5",
    title: "The Rise of Remote Learning: How Universities Are Adapting",
    slug: "rise-remote-learning-universities",
    excerpt: "Educational institutions worldwide are embracing hybrid models that combine the best of online and in-person instruction.",
    content: `The pandemic accelerated a digital transformation in higher education that continues to reshape how we learn...`,
    featuredImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=600&fit=crop",
    category: categories[3],
    author: authors[0],
    publishedAt: "2025-01-06T10:20:00Z",
    readingTime: 9,
    tags: ["Education", "Technology", "Universities", "Online Learning"],
    isFeatured: false,
    isTrending: false,
    views: 5620,
  },
  {
    id: "6",
    title: "Hidden Gems: 10 Underrated Travel Destinations for 2025",
    slug: "hidden-gems-travel-destinations-2025",
    excerpt: "Skip the crowded tourist spots and discover these breathtaking locations that offer authentic experiences.",
    content: `As travelers seek more meaningful and less crowded experiences, these destinations are emerging as the must-visit places...`,
    featuredImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    category: categories[7],
    author: authors[2],
    publishedAt: "2025-01-05T08:15:00Z",
    readingTime: 12,
    tags: ["Travel", "Adventure", "Destinations", "2025"],
    isFeatured: false,
    isTrending: false,
    views: 7890,
  },
  {
    id: "7",
    title: "Cryptocurrency Regulation: What New Laws Mean for Investors",
    slug: "cryptocurrency-regulation-new-laws-investors",
    excerpt: "Governments worldwide are implementing new frameworks that could reshape the digital asset landscape.",
    content: `The regulatory environment for cryptocurrencies is undergoing significant changes as governments seek to balance innovation with consumer protection...`,
    featuredImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop",
    category: categories[4],
    author: authors[2],
    publishedAt: "2025-01-04T13:40:00Z",
    readingTime: 8,
    tags: ["Finance", "Cryptocurrency", "Regulation", "Investing"],
    isFeatured: false,
    isTrending: true,
    views: 11200,
  },
  {
    id: "8",
    title: "Mindful Living: Simple Practices for a Stress-Free Life",
    slug: "mindful-living-stress-free-practices",
    excerpt: "Experts share evidence-based techniques to reduce anxiety and improve mental well-being in our fast-paced world.",
    content: `In an age of constant connectivity and information overload, the practice of mindfulness has become more relevant than ever...`,
    featuredImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop",
    category: categories[5],
    author: authors[1],
    publishedAt: "2025-01-03T09:30:00Z",
    readingTime: 6,
    tags: ["Lifestyle", "Wellness", "Mental Health", "Mindfulness"],
    isFeatured: false,
    isTrending: false,
    views: 6540,
  },
];

export const getFeaturedArticles = () => articles.filter((a) => a.isFeatured);
export const getTrendingArticles = () => articles.filter((a) => a.isTrending);
export const getLatestArticles = () => [...articles].sort((a, b) => 
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);
export const getArticlesByCategory = (slug: string) => 
  articles.filter((a) => a.category.slug === slug);
export const getArticleBySlug = (slug: string) => 
  articles.find((a) => a.slug === slug);
export const getRelatedArticles = (article: Article) =>
  articles.filter((a) => a.id !== article.id && a.category.id === article.category.id).slice(0, 3);

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return formatDate(dateString);
};

/**
 * Calculate estimated reading time based on content length
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Estimated reading time in minutes (minimum 1)
 */
export const calculateReadingTime = (content: string, wordsPerMinute = 200): number => {
  if (!content) return 1;
  
  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words by splitting on whitespace
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  
  // Calculate reading time, minimum 1 minute
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime);
};
