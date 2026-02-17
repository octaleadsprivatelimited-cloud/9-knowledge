/**
 * SEO-only article route. Renders NO UI content.
 * - generateMetadata: server-rendered meta + og + twitter (initial HTML).
 * - Bots: receive metadata only, minimal body.
 * - Humans: redirect to React app so they see existing UI.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchArticle } from "@/lib/fetchArticle";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://9knowledge.com";
const REACT_APP_URL = process.env.NEXT_PUBLIC_REACT_APP_URL || "https://9-knowledge.vercel.app";

const BOT_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /WhatsApp/i,
  /WhatApp/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /TelegramBot/i,
  /Pinterest/i,
  /Googlebot/i,
  /bingbot/i,
  /Discordbot/i,
  /Applebot/i,
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((p) => p.test(userAgent));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const idOrSlug = slug?.trim() || null;
  const article = await fetchArticle(idOrSlug);

  if (!article) {
    return {
      title: "Article | 9knowledge",
      openGraph: {
        title: "9knowledge",
        description: "Your Trusted Source for News & Insights",
        url: SITE_URL,
        type: "website",
        images: [{ url: `${SITE_URL}/og-default.jpg` }],
      },
      twitter: {
        card: "summary_large_image",
      },
    };
  }

  const canonicalUrl = `${SITE_URL}/article/${article.id}`;

  return {
    title: `${article.title} | 9knowledge`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.imageUrl],
    },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function ArticleSEOPage({ params }: Props) {
  const { slug } = await params;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  if (!isBot(userAgent)) {
    const idOrSlug = slug?.trim() || "";
    redirect(
      `${REACT_APP_URL}/article/${idOrSlug}?id=${encodeURIComponent(idOrSlug)}`
    );
  }

  return null;
}
