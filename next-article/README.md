# Next.js Article SSR – Social Sharing Fix

This folder is a **standalone Next.js app** that renders **only article detail pages** with server-side rendering (SSR). It fixes WhatsApp/Facebook previews by injecting Open Graph and Twitter meta tags **server-side** in the initial HTML. No React Helmet or client-side meta tags.

## What this does

- **Article URL** (e.g. `/article/ARTICLE_ID`) is served by this Next.js app.
- `getServerSideProps` fetches the article from **Firebase Firestore** on the server.
- **Meta tags** are set in Next.js `<Head>` so they appear in the initial HTML response:
  - `og:title`, `og:description`, `og:image` (absolute HTTPS), `og:url`, `og:type`
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Works for **English and Telugu**: language comes from article data (`language` or presence of `telugu_content`), not hardcoded.
- **Layout/CSS**: Same structure as your main app’s article page (title, excerpt, image, content). No changes to your main React SPA’s layout or styles.

## Where to place it

You have two options.

### Option A: Standalone deployment (main site stays Vite/React)

- **Placement**: Keep this folder as-is at `next-article/` in your repo.
- **Deploy**: Deploy this app as a **separate Vercel project** (or a second service).
  - In Vercel: New Project → Import same repo → **Root Directory** = `next-article` → Deploy.
- **Routing**: Point article URLs from your main site to this app:
  - Either use the same domain and a **reverse proxy** so `https://yoursite.com/article/*` is served by this Next.js app, or
  - Use a subdomain (e.g. `articles.yoursite.com`) and link to `https://articles.yoursite.com/article/ID` from the main site.

### Option B: Single codebase (migrate to Next.js)

- **Placement**: Copy the contents of this app into your **main repo root** and turn the whole project into Next.js:
  - Copy `pages/`, `lib/`, `styles/`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json` into the root.
  - Add Next.js and the rest of `next-article` dependencies to the root `package.json`.
  - Move your existing React SPA into Next.js (e.g. other routes as client-only Next.js pages or a catch-all that loads your SPA).
- **Article route**: The article page lives at **`pages/article/[id].tsx`** with `getServerSideProps` and `<Head>` as provided here. All other routes stay as they are in your app (as Next.js pages that render your current UI).

## Files and structure

```
next-article/
├── lib/
│   └── firebase-server.ts   # Firestore fetch (Admin SDK), absolute image URLs
├── pages/
│   ├── _app.tsx            # App shell, imports globals.css
│   └── article/
│       └── [id].tsx         # Article page: getServerSideProps + Head + body
├── styles/
│   └── globals.css          # Tailwind
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

- **`pages/article/[id].tsx`**  
  - `getServerSideProps`: reads `id` from the URL, calls `getArticleByIdOrSlug(id, null)` from `lib/firebase-server.ts`.  
  - Renders Next.js `<Head>` with all og/twitter meta and a canonical URL.  
  - Renders the article body (title, description, image, content) with the same layout idea as your current article page.  
  - If the article is missing, returns fallback site metadata and a “Article Not Found” page.

- **`lib/firebase-server.ts`**  
  - Initializes Firebase Admin using `FIREBASE_SERVICE_ACCOUNT_JSON` or separate env vars.  
  - Fetches article by document ID (or slug).  
  - Normalizes **og:image** to an **absolute HTTPS** URL.  
  - Returns title, description, image, language, etc., for both English and Telugu content.

## Environment variables (Vercel)

Set these in your Vercel project (or in `.env.local` for local dev):

- **`FIREBASE_SERVICE_ACCOUNT_JSON`** (recommended): Full JSON string of your Firebase service account key (from Firebase Console → Project settings → Service accounts → Generate new private key).
- Or separate vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- **`NEXT_PUBLIC_SITE_URL`** (optional): e.g. `https://9knowledge.com`. Used for canonical and og:url. Defaults to `https://9knowledge.com` if unset.

## Build and run

```bash
cd next-article
npm install
npm run build
npm start
```

Dev:

```bash
npm run dev
```

Open `http://localhost:3001/article/YOUR_ARTICLE_ID` and use “View Page Source” to confirm og/twitter meta in the initial HTML.

## Vercel deployment

- **Root Directory**: If this is the only app in the repo, leave root as `.`. If the repo root is the Vite app, set **Root Directory** to `next-article` in the Vercel project settings.
- **Build Command**: `npm run build` (or `next build`).
- **Output**: Next.js default (no custom output dir).
- **Install Command**: `npm install`.

After deploy, sharing an article URL (e.g. `https://your-domain.com/article/xyz`) on WhatsApp or Facebook will show the correct article image and description.

## Summary

- **Problem**: Sharing article URLs showed default image and wrong description because meta was client-only.
- **Solution**: Article pages are rendered by Next.js with **getServerSideProps** and **server-injected** og/twitter meta in `<Head>`.
- **Result**: WhatsApp/Facebook see the correct **og:title**, **og:description**, **og:image** (absolute HTTPS), **og:url**, **og:type**, and **twitter:card** in the first HTML response. No React Helmet or client-side meta. English and Telugu are supported via article data. Layout and styling match your existing article page; the rest of the site can stay as your current React SPA.
