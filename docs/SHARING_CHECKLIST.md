# Article sharing: WhatsApp & Facebook previews

When someone shares an article link (WhatsApp, Facebook, X, LinkedIn), the preview must show the **article’s image** and **article’s description**, not the site default.

## How it works

1. **Crawlers** (WhatsApp, Facebook, etc.) that request `/article/ARTICLE_ID` are detected by User-Agent and **rewritten to `/api/og`**. They receive minimal HTML with article-specific Open Graph and Twitter meta in the **initial response** (no client-side JS).
2. **Users** opening the same URL get the full React app, which is also served with article meta in the initial HTML via `/api/article-page`.
3. **Meta rules**: **og:image** and **twitter:image** are always **absolute HTTPS** URLs (required by WhatsApp/Facebook). **og:title**, **og:description**, **og:url**, **og:type=article** and **twitter:card=summary_large_image** are set from the article’s title, excerpt/meta_description, and featured/og image. Fallback to site defaults only when the article is missing or has no image/description.

## Checklist (do these)

### 1. Set Firebase on Vercel

- Vercel → Project → **Settings** → **Environment Variables**
- Add **`FIREBASE_SERVICE_ACCOUNT_JSON`** = full contents of your Firebase service account JSON (Project settings → Service accounts → Generate new private key)
- **Redeploy** after saving

Without this, the server cannot load articles and will always return the default image and description.

### 2. Set site URL (optional but recommended)

- Add **`VITE_SITE_URL`** or **`SITE_URL`** = your production URL (e.g. `https://9knowledge.com` or `https://9-knowledge.vercel.app`)
- Ensures **og:url** and canonical links are correct when shared

### 3. Article content

For each article in admin:

- **Featured image** (or **og_image**): use a **public HTTPS** URL (e.g. Firebase Storage or your CDN). Minimum ~1200×630 recommended for best previews.
- **Excerpt** or **Meta description**: set at least one so the share preview has a short description.

### 4. Verify the OG response

1. Open: `https://YOUR-DOMAIN.com/api/og?id=REAL_ARTICLE_ID` (use a real article ID from `/article/xyz` → id is `xyz`).
2. You should see the article title and description on the page.
3. **View Page Source**: confirm `<meta property="og:image" content="https://...">` is the article’s image (absolute HTTPS), and **og:title** / **og:description** match the article.
4. If this page is correct, sharing the **article URL** (`/article/xyz`) on WhatsApp/Facebook will show the same (after cache refresh).

### 5. Fix cached wrong previews (WhatsApp / Facebook)

- **Facebook**: Use [Sharing Debugger](https://developers.facebook.com/tools/debug/) → enter article URL → **Scrape Again**. Repeat if needed.
- **WhatsApp**: Previews are cached; sharing the same link in a **new chat** or after some time often fetches updated meta. Ensure the article URL is exactly the same as in your app (e.g. `https://yoursite.com/article/ARTICLE_ID`).

## If it still shows default

- **FIREBASE_SERVICE_ACCOUNT_JSON** is set on Vercel and you **redeployed** after adding it.
- **Article ID** in the shared URL matches the app (e.g. `/article/abc123` → id `abc123`).
- Article in Firestore is **status: published** and has **featured_image** or **og_image** (HTTPS) and **excerpt** or **meta_description** or **content**.
- Image URL is **publicly accessible** (no auth) and **HTTPS**.
