# Social media sharing (Open Graph & SEO)

This project is **Vite + React**, not Next.js. Social crawlers (WhatsApp, Facebook, X, LinkedIn) do not run JavaScript, so **meta tags must be in the initial HTML response**. That is done on the server as follows.

## Architecture

- **No client-only meta:** We do not rely on `useEffect`, `react-helmet`, `useSearchParams`, or any client-side hooks for what crawlers see. Crawlers receive a server-generated HTML document with all OG and SEO tags.
- **Article routing:** Article URLs use the **document ID in the path**: `/article/[id]` or `/article/[id]/[slug]`. No query parameters (`?id=`) are used for fetching.
- **Server-side implementation:** A Vercel serverless function (`api/article/[id].ts`) fetches the article by **ID** using the **Firebase Admin SDK** (server-safe; no Firebase client SDK for metadata). It returns a minimal HTML document whose `<head>` contains:
  - **Open Graph:** `og:type`, `og:title`, `og:description`, `og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:url`, `og:site_name`
  - **Twitter:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
  - **SEO:** `<title>`, `<meta name="description">`, `<link rel="canonical">`
- **Crawler routing:** Vercel middleware matches `/article/*`. When the User-Agent is a known crawler, the request is **rewritten** to `/api/article/[id]` (ID = first path segment). Normal users get the SPA.

## Result

When an article URL is shared on WhatsApp, Facebook, X, or LinkedIn:

- The **article title** is the preview title (site-level metadata never overrides article-level).
- The **article description** (excerpt) is the preview text.
- The **article image** is the thumbnail (public HTTPS URL; fallback image only if the article image is missing).

## Firebase Admin (metadata API)

Set one of the following in Vercel environment variables:

- **Option A:** `FIREBASE_SERVICE_ACCOUNT_JSON` = full JSON string of your Firebase service account key.
- **Option B:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (private key with `\n` for newlines).

Without these, the API still returns HTML but with site-level fallback title/description/image.

## Testing

- **Facebook:** [Sharing Debugger](https://developers.facebook.com/tools/debug/) — enter article URL (e.g. `https://9knowledge.com/article/ARTICLE_DOC_ID`) and “Scrape Again”.
- **cURL:**  
  `curl -A "facebookexternalhit/1.1" "https://9knowledge.com/article/ARTICLE_DOC_ID"`  
  You should see HTML with `<meta property="og:title"`, `og:description`, `og:image`, etc., in the response body.
