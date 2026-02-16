# Social media sharing (Open Graph & SEO)

This project is **Vite + React**, not Next.js. Social crawlers (WhatsApp, Facebook, X, LinkedIn) do not run JavaScript, so **meta tags must be in the initial HTML response**. That is done on the server as follows.

## Architecture

- **No client-only meta:** We do not rely on `useEffect`, `react-helmet`, `useSearchParams`, or any client-side hooks for what crawlers see. Crawlers receive a server-generated HTML document with all OG and SEO tags.
- **Article routing:** Article URLs use the **document ID in the path**: `/article/[id]` or `/article/[id]/[slug]`. No query parameters (`?id=`) are used for fetching.
- **Server-side implementation:** A dedicated Open Graph endpoint **`GET /api/og`** (`api/og.ts`) accepts `id` or `slug` as query parameters, fetches the article from Firestore on the server (Admin SDK or client SDK fallback), and returns a minimal HTML document whose `<head>` contains:
  - **Open Graph:** `og:type`, `og:title`, `og:description`, `og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:url`, `og:site_name`
  - **Twitter:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
  - **SEO:** `<title>`, `<meta name="description">`, `<link rel="canonical">`
- **Crawler routing:** Vercel middleware matches `/article/*`. When the User-Agent is a known crawler, the request is **rewritten** to `/api/og?id=<articleId>` (ID = first path segment). Normal users get the SPA. The OG endpoint also works when opened directly in a browser (e.g. `/api/og?id=xxx` or `/api/og?slug=my-article`).

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
- **WhatsApp:** Share the article URL in a chat; the preview (title, description, image) is generated using the same OG tags. Middleware sends WhatsApp’s crawler (User-Agent containing “WhatsApp”) to the API. **If the preview doesn’t update:** WhatsApp caches link previews; try sharing in a new chat or after 24–48 hours, or use the Facebook Sharing Debugger and “Scrape Again” (same crawler family) to refresh.
- **Direct OG endpoint:** Open `https://9knowledge.com/api/og?id=ARTICLE_DOC_ID` or `https://9knowledge.com/api/og?slug=article-slug` in a browser to see the preview HTML.
- **cURL (simulate WhatsApp):**  
  `curl -A "WhatsApp/2.23.20.0" "https://9knowledge.com/article/ARTICLE_DOC_ID"`  
  You should see HTML with `<meta property="og:image"`, `og:title`, `og:description`, etc., in the response body.
