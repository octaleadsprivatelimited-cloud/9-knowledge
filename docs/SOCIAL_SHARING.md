# Social media sharing (Open Graph & SEO)

This project is **Vite + React**, not Next.js. Social crawlers (WhatsApp, Facebook, X, LinkedIn) do not run JavaScript, so **meta tags must be in the initial HTML response**. That is done on the server as follows.

## Architecture

- **No client-only meta:** We do not rely on `useEffect`, `react-helmet`, or any client-side updates for what crawlers see. Crawlers receive a server-generated HTML document with all OG and SEO tags.
- **Server-side implementation:** A Vercel serverless function (`api/article/[slug].ts`) fetches the article by **slug** or **id** (from the URL or query) and returns a minimal HTML document whose `<head>` contains:
  - **Open Graph:** `og:type`, `og:title`, `og:description`, `og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:url`, `og:site_name`
  - **Twitter:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
  - **SEO:** `<title>`, `<meta name="description">`, `<link rel="canonical">`
- **Crawler routing:** Vercel middleware (`middleware.ts`) matches `/article/*`. When the request’s User-Agent is a known crawler (Facebook, WhatsApp, Twitter, LinkedIn, etc.), the request is **rewritten** to the serverless function above. Normal users still get the SPA.

## Result

When an article URL is shared on WhatsApp, Facebook, X, or LinkedIn:

- The **article title** is the preview title (no site-level title override).
- The **article description** (excerpt/meta description) is the preview text.
- The **article image** is the thumbnail (HTTPS, with recommended 1200×630 dimensions where possible).

Fallbacks (site title, site description, default image) are used **only** when the article is missing or its fields are empty.

## Compatibility

- **Vercel:** Implemented with Vercel serverless functions and routing middleware; no Next.js `generateMetadata` or `getServerSideProps` (this is a Vite SPA).
- **Article identification:** The server fetches the article by **slug** (path) or **id** (query `?id=...`), so both `/article/my-slug` and `/article/my-slug?id=docId` work.

## Testing

- **Facebook:** [Sharing Debugger](https://developers.facebook.com/tools/debug/) — enter article URL and “Scrape Again”.
- **cURL:**  
  `curl -A "facebookexternalhit/1.1" "https://9knowledge.com/article/YOUR-SLUG"`  
  You should see HTML with `<meta property="og:title"`, `og:description`, `og:image`, etc., in the response body.
